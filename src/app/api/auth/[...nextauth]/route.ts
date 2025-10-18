// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth"; // Importar AuthOptions
import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import prisma from "@/lib/prisma";

// ***** MUDANÇA 1: Exportar as opções *****
export const authOptions: AuthOptions = {
  // adapter: PrismaAdapter(prisma), // Descomente quando pronto
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        // --- LÓGICA DE AUTENTICAÇÃO (Placeholder) ---
        // SUBSTITUA PELA LÓGICA DO BANCO DE DADOS + BCRYPT
        if (credentials?.email === "admin@fyzen.com" && credentials?.password === "senha123") {
            const user = { 
                id: "1", 
                name: "Admin Fyzen", 
                email: "admin@fyzen.com",
                role: "admin", // Exemplo
                departmentId: "TI" // Exemplo
            };
            return user; 
        } else {
          return null;
        }
        // --- Fim da Lógica Placeholder ---
      },
    }),
    // Outros provedores...
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; 
        token.departmentId = user.departmentId; 
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.departmentId = token.departmentId as string;
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

// ***** MUDANÇA 2: Usar as opções exportadas *****
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };