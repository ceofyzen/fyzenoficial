// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions, User as NextAuthUser } from "next-auth"; 
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter"; 
import prisma from "@/lib/prisma";                       
import bcrypt from 'bcrypt';                           
import { ModuloEnum } from '@prisma/client'; // Importar o Enum

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma), // Adaptador configurado
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Autorização falhou: Email ou senha não fornecidos.");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          // Inclui o Cargo e Departamento associado
          include: { role: { include: { department: true } } } 
        });

        if (!user || !user.passwordHash) {
          console.error(`Autorização falhou: Usuário não encontrado ou sem hash de senha para ${credentials.email}`);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (isPasswordValid) {
          console.log(`Autorização OK para: ${user.email}`);
          // Retorna o objeto do usuário incluindo 'role' para os callbacks
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            // @ts-ignore 
            isActive: user.isActive,
             // @ts-ignore 
            role: user.role, // Envia o objeto role completo
          };
        } else {
          console.error(`Autorização falhou: Senha inválida para ${credentials.email}`);
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
    async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
            // @ts-ignore 
            token.isActive = user.isActive;
            // @ts-ignore 
            if (user.role && typeof user.role === 'object' && 'name' in user.role && 'department' in user.role && user.role.department && 'accessModule' in user.role.department) {
                // @ts-ignore
                token.roleName = user.role.name; // Nome do cargo
                // @ts-ignore
                token.isDirector = user.role.isDirector; // Se é diretor
                // @ts-ignore
                token.departmentId = user.role.departmentId; // ID do depto
                // @ts-ignore
                token.departmentName = user.role.department.name; // Nome do depto
                // @ts-ignore
                token.accessModule = user.role.department.accessModule; // Módulo de Acesso
            } else {
                token.roleName = null; token.isDirector = false; token.departmentId = null;
                token.departmentName = null; token.accessModule = null;
            }
        }
        return token;
    },
    // Adiciona dados do token à sessão
    async session({ session, token }) {
        if (session.user) {
            session.user.id = token.id as string;
            // @ts-ignore
            session.user.isActive = token.isActive as boolean;
            // @ts-ignore
            session.user.roleName = token.roleName as string | null;
            // @ts-ignore
            session.user.isDirector = token.isDirector as boolean;
            // @ts-ignore
            session.user.departmentId = token.departmentId as string | null;
            // @ts-ignore
            session.user.departmentName = token.departmentName as string | null;
            // @ts-ignore
            session.user.accessModule = token.accessModule as ModuloEnum | null; // Adiciona módulo
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