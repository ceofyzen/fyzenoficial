// next-auth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';
import { ModuloEnum } from '@prisma/client'; // Importe seu enum do Prisma

declare module 'next-auth' {
  // Estende a interface Session para incluir nossos campos customizados
  interface Session {
    user?: {
      id: string;
      isActive: boolean;
      roleName: string | null;
      isDirector: boolean;
      departmentId: string | null;
      departmentName: string | null;
      accessModule: ModuloEnum | null; // Campo crucial para RBAC
    } & DefaultSession['user']; // Mantém os campos padrão (name, email, image)
  }

  // Estende a interface User (opcional, útil no callback 'authorize')
  interface User extends DefaultUser {
     isActive: boolean;
     // Define a estrutura esperada para 'role' vindo do authorize
     role?: {
        id: string;
        name: string;
        isDirector: boolean;
        departmentId: string;
        department?: { 
            id: string;
            name: string;
            accessModule: ModuloEnum;
        } | null; // Department pode ser null se não incluído
     } | null; // Role pode ser null
  }
}

declare module 'next-auth/jwt' {
  // Estende a interface JWT (token)
  interface JWT extends DefaultJWT {
    id: string;
    isActive: boolean;
    roleName: string | null;
    isDirector: boolean;
    departmentId: string | null;
    departmentName: string | null;
    accessModule: ModuloEnum | null; // Campo crucial para RBAC
  }
}