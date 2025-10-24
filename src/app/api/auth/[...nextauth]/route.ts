// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from 'bcrypt';
import { UserStatus, PermissionTargetType } from '@prisma/client'; // Importar PermissionTargetType
import type { User as CustomUser } from "next-auth";

// --- Função auxiliar para buscar permissões ---
async function getUserPermissions(userId: string): Promise<Set<string>> {
    try {
        // Busca permissões DIRETAMENTE atribuídas ao usuário
        const userPermissions = await prisma.permission.findMany({
            where: {
                userId: userId,
                targetType: PermissionTargetType.USER // Garante que é permissão de usuário
            },
            select: { action: true },
        });

        const permissionsSet = new Set(userPermissions.map(p => p.action));

        // LÓGICA FUTURA: Buscar permissões do Cargo (Role) e Departamento
        // const userWithRole = await prisma.user.findUnique({
        //     where: { id: userId },
        //     select: { role: { select: { id: true, departmentId: true } } }
        // });
        // if (userWithRole?.role) {
        //     const rolePermissions = await prisma.permission.findMany({
        //         where: { roleId: userWithRole.role.id, targetType: PermissionTargetType.ROLE },
        //         select: { action: true }
        //     });
        //     rolePermissions.forEach(p => permissionsSet.add(p.action));
        //
        //     if (userWithRole.role.departmentId) {
        //         const deptPermissions = await prisma.permission.findMany({
        //             where: { departmentId: userWithRole.role.departmentId, targetType: PermissionTargetType.DEPARTMENT },
        //             select: { action: true }
        //         });
        //        deptPermissions.forEach(p => permissionsSet.add(p.action));
        //     }
        // }
        // FIM LÓGICA FUTURA

        // Adiciona a permissão de admin irrestrito se encontrada
        if (permissionsSet.has('system:admin')) {
            const allDefinitions = await prisma.permissionDefinition.findMany({ select: { action: true } });
            allDefinitions.forEach(def => permissionsSet.add(def.action));
        }


        console.log(`[getUserPermissions] User ${userId} has ${permissionsSet.size} permissions.`);
        return permissionsSet;

    } catch (error) {
        console.error(`Erro ao buscar permissões para User ID ${userId}:`, error);
        return new Set<string>(); // Retorna set vazio em caso de erro
    }
}


export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { /* ... */ },
      async authorize(credentials, req): Promise<CustomUser | null> {
        // ... (código authorize existente, SEM buscar permissões aqui) ...
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ /* ... */ });
        if (!user || !user.passwordHash || user.status !== UserStatus.Ativo) return null;
        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (isPasswordValid) {
            const authorizedUser: CustomUser = {
                id: user.id, name: user.name, email: user.email, image: user.image,
                // @ts-ignore
                role: user.role,
            };
            return authorizedUser;
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
        // --- Lógica de UPDATE (Manter como está) ---
        if (trigger === "update" && session?.user) {
            // ... (código de update existente) ...
            // **IMPORTANTE:** O update() vindo do frontend NÃO deve poder setar 'permissions' diretamente.
            // As permissões são gerenciadas pelo sistema.
            // Se precisar RECALCULAR permissões após mudar Role/Dept no perfil, faça a busca aqui.
             if ('roleId' in (session.user as any) || 'departmentId' in (session.user as any)) {
                 console.log("[JWT Callback] Update Trigger - Recalculando permissões após mudança de role/dept...");
                 token.permissions = await getUserPermissions(token.id as string);
             }

            return token;
        }

        // No login inicial (trigger === "signIn" E user existe)
        if (user) {
            console.log("[JWT Callback] SignIn - Populando token inicial:", user.email);
            token.id = user.id;
            const authorizedUser = user as CustomUser;
            token.picture = authorizedUser.image;
            token.email = authorizedUser.email;
            token.name = authorizedUser.name;

            // @ts-ignore
            if (authorizedUser.role && authorizedUser.role.department) {
                // @ts-ignore
                token.roleName = authorizedUser.role.name;
                // @ts-ignore
                token.isDirector = authorizedUser.role.isDirector;
                // @ts-ignore
                token.departmentId = authorizedUser.role.departmentId;
                // @ts-ignore
                token.departmentName = authorizedUser.role.department.name;
                // @ts-ignore // Remover accessModule se não usar mais
                // token.accessModule = authorizedUser.role.department.accessModule;
            } else { /* ... valores nulos ... */ }

            // <-- BUSCAR E ADICIONAR PERMISSÕES AO TOKEN -->
            token.permissions = await getUserPermissions(user.id);

        }
        // Em requisições subsequentes, as permissões já devem estar no token
        return token;
    },

    async session({ session, token }) {
        if (session.user && token.id) {
            session.user.id = token.id as string;
            // @ts-ignore
            session.user.roleName = token.roleName as string | null;
            // @ts-ignore
            session.user.isDirector = token.isDirector as boolean;
            // @ts-ignore
            session.user.departmentId = token.departmentId as string | null;
            // @ts-ignore
            session.user.departmentName = token.departmentName as string | null;
            // @ts-ignore // Remover accessModule se não usar mais
            // session.user.accessModule = token.accessModule as ModuloEnum | null;
            session.user.image = token.picture as string | null;

            // <-- ADICIONAR PERMISSÕES À SESSÃO DO CLIENTE -->
            // @ts-ignore
            session.user.permissions = token.permissions as Set<string>;

        } else {
            console.warn("[Session Callback] Token sem ID ou session.user não definido.");
        }
        return session;
    },
  },
  pages: { /* ... */ },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };