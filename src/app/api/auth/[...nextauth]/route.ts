// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from 'bcrypt';
import { ModuloEnum, UserStatus } from '@prisma/client';

// **** Importar explicitamente o tipo User da nossa definição ****
import type { User as CustomUser } from "next-auth"; // Renomear para evitar conflito

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      // **** Usar nosso tipo CustomUser no retorno ****
      async authorize(credentials, req): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          console.error("[Authorize] Falhou: Email ou senha não fornecidos.");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: { include: { department: true } } }
        });

        if (!user || !user.passwordHash) {
          console.error(`[Authorize] Usuário não encontrado ou sem hash: ${credentials.email}`);
          return null;
        }

        // Verifica Status ANTES de checar a senha
        if (user.status !== UserStatus.Ativo) {
            console.warn(`[Authorize] Login bloqueado para usuário ${user.status}: ${credentials.email}`);
            // Retorna null (ou lança erro) para indicar falha na autorização
            return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (isPasswordValid) {
          console.log(`[Authorize] OK para: ${user.email}`);
          // **** Construir o objeto de retorno COMPATÍVEL com CustomUser ****
          const authorizedUser: CustomUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            // **** Adicionar isActive derivado do status ****
            isActive: user.status === UserStatus.Ativo, // <-- CORREÇÃO AQUI
            // @ts-ignore // Role pode precisar de @ts-ignore se a estrutura interna diferir levemente
            role: user.role, // Passa o objeto role completo
          };
          return authorizedUser;
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
    async jwt({ token, user, trigger, session }) {
        // O objeto 'user' aqui é o que foi retornado por 'authorize' (agora com isActive)

        // --- Lógica de UPDATE ---
        if (trigger === "update" && session?.user) {
            console.log("[JWT Callback] Update Trigger - Atualizando token:", session.user);
            token.name = session.user.name ?? token.name;
            token.picture = session.user.image ?? token.picture;
            token.email = session.user.email ?? token.email;

            const updatedUserData = session.user as any; // Usar 'any' simplifica

            if ('roleName' in updatedUserData) token.roleName = updatedUserData.roleName;
            if ('isDirector' in updatedUserData) token.isDirector = updatedUserData.isDirector;
            if ('departmentId' in updatedUserData) token.departmentId = updatedUserData.departmentId;
            if ('departmentName' in updatedUserData) token.departmentName = updatedUserData.departmentName;
            if ('accessModule' in updatedUserData) token.accessModule = updatedUserData.accessModule;
            // A propriedade 'isActive' no token será derivada do 'status' se necessário,
            // ou pode ser adicionada aqui se você passar 'isActive' no update()
            // if ('isActive' in updatedUserData) token.isActive = updatedUserData.isActive;

            console.log("[JWT Callback] Update Trigger - Token atualizado.");
            return token;
        }
        // --- FIM LÓGICA DE UPDATE ---

        // No login inicial (trigger === "signIn" E user existe)
        if (user) {
            console.log("[JWT Callback] SignIn - Populando token inicial:", user.email);
            token.id = user.id;

            // Acessar os campos do objeto 'user' retornado por authorize
            const authorizedUser = user as CustomUser; // Usa nosso tipo importado

            token.isActive = authorizedUser.isActive; // <-- Adiciona isActive ao token
            token.picture = authorizedUser.image;
            token.email = authorizedUser.email; // Garante que email está no token
            token.name = authorizedUser.name; // Garante que name está no token

            // Extrai dados do role/department
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
                 // @ts-ignore
                token.accessModule = authorizedUser.role.department.accessModule;
            } else {
                token.roleName = null;
                token.isDirector = false;
                token.departmentId = null;
                token.departmentName = null;
                token.accessModule = null;
            }
        }
        return token;
    },
    // Callback Session
    async session({ session, token }) {
        if (session.user && token.id) {
            session.user.id = token.id as string;
            // @ts-ignore - Adiciona campos customizados à sessão do cliente
            session.user.isActive = token.isActive as boolean; // <-- Adiciona isActive à sessão
            session.user.roleName = token.roleName as string | null;
            session.user.isDirector = token.isDirector as boolean;
            session.user.departmentId = token.departmentId as string | null;
            session.user.departmentName = token.departmentName as string | null;
            session.user.accessModule = token.accessModule as ModuloEnum | null;
            session.user.image = token.picture as string | null;
        } else {
            console.warn("[Session Callback] Token sem ID ou session.user não definido.");
        }
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