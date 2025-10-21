// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from 'bcrypt';
import { ModuloEnum, UserStatus } from '@prisma/client'; // Importar UserStatus também

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.error("[Authorize] Falhou: Email ou senha não fornecidos.");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: { include: { department: true } } }
        });

        if (!user || !user.passwordHash) {
          console.error(`[Authorize] Falhou: Usuário não encontrado ou sem hash de senha para ${credentials.email}`);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (isPasswordValid) {
          console.log(`[Authorize] OK para: ${user.email}`);
          // Retorna o objeto do usuário incluindo 'role', 'image' e 'status'
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            // @ts-ignore - Passando status e role (com department)
            status: user.status,
            role: user.role,
          };
        } else {
          console.error(`[Authorize] Senha inválida para ${credentials.email}`);
          return null;
        }
      },
    }),
    // Outros provedores...
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Adiciona dados ao token JWT
    async jwt({ token, user, trigger, session }) {
        console.log(`[JWT Callback] Trigger: ${trigger}, User: ${user?.email}, Token Sub: ${token.sub}`);
        // Se for um trigger de update
        if (trigger === "update") {
            console.log("[JWT Callback] Update Trigger - Tentando atualizar token para:", token.id);
            if (session?.user) {
                 console.log("[JWT Callback] Update Trigger - Usando dados passados via session:", session.user);
                 token.name = session.user.name ?? token.name;
                 token.picture = session.user.image ?? token.picture;
                 // Adicione outros campos se você os passar via update({ user: {...} })
                 // Ex: Se passar status: token.status = session.user.status ?? token.status;
            } else {
                console.log("[JWT Callback] Update Trigger - Buscando dados atualizados do DB para:", token.id);
                const refreshedUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { name: true, image: true, status: true, role: { include: { department: true } } }
                });
                if (refreshedUser) {
                    console.log("[JWT Callback] Update Trigger - Dados do DB:", refreshedUser.name, refreshedUser.image);
                    token.name = refreshedUser.name;
                    token.picture = refreshedUser.image;
                    token.status = refreshedUser.status;
                    if (refreshedUser.role && refreshedUser.role.department) {
                       token.roleName = refreshedUser.role.name;
                       token.isDirector = refreshedUser.role.isDirector;
                       token.departmentId = refreshedUser.role.departmentId;
                       token.departmentName = refreshedUser.role.department.name;
                       token.accessModule = refreshedUser.role.department.accessModule;
                    } else {
                        token.roleName = null; token.isDirector = false; token.departmentId = null;
                        token.departmentName = null; token.accessModule = null;
                    }
                } else {
                    console.warn("[JWT Callback] Update Trigger - Usuário não encontrado no DB:", token.id);
                }
            }
        }

        // Na primeira vez (login)
        if (user && trigger === "signIn") {
            console.log("[JWT Callback] SignIn - Adicionando dados do usuário ao token:", user.email);
            token.id = user.id;
            // @ts-ignore
            token.status = user.status;
            token.picture = user.image;
            // @ts-ignore - CORREÇÃO AQUI: Restaurando a condição completa
            if (user.role && typeof user.role === 'object' && 'name' in user.role && 'department' in user.role && user.role.department && 'accessModule' in user.role.department) {
                // @ts-ignore
                token.roleName = user.role.name;
                // @ts-ignore
                token.isDirector = user.role.isDirector;
                // @ts-ignore
                token.departmentId = user.role.departmentId;
                // @ts-ignore
                token.departmentName = user.role.department.name;
                // @ts-ignore
                token.accessModule = user.role.department.accessModule;
            } else {
                token.roleName = null; token.isDirector = false; token.departmentId = null;
                token.departmentName = null; token.accessModule = null;
            }
        }
        console.log("[JWT Callback] Token final:", { sub: token.sub, name: token.name, picture: token.picture, status: token.status, role: token.roleName });
        return token;
    },
    // Adiciona dados do token à sessão do CLIENTE
    async session({ session, token }) {
        console.log("[Session Callback] Token recebido:", { sub: token.sub, name: token.name, picture: token.picture, status: token.status, role: token.roleName });
        if (session.user && token.id) {
            session.user.id = token.id as string;
            // @ts-ignore
            session.user.status = token.status as UserStatus;
            // @ts-ignore
            session.user.roleName = token.roleName as string | null;
            // @ts-ignore
            session.user.isDirector = token.isDirector as boolean;
            // @ts-ignore
            session.user.departmentId = token.departmentId as string | null;
            // @ts-ignore
            session.user.departmentName = token.departmentName as string | null;
            // @ts-ignore
            session.user.accessModule = token.accessModule as ModuloEnum | null;
            // Adiciona imagem
            session.user.image = token.picture as string | null;
        } else {
            console.warn("[Session Callback] Token sem ID ou session.user não definido.");
        }
        console.log("[Session Callback] Sessão final:", session);
        return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };