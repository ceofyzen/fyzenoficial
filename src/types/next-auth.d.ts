// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';
// Removido ModuloEnum se não for mais usado diretamente na sessão
// import { ModuloEnum } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user?: {
      id: string;
      // isActive: boolean; // Remover se não estiver usando
      roleName: string | null;
      isDirector: boolean;
      departmentId: string | null;
      departmentName: string | null;
      // accessModule: ModuloEnum | null; // Remover se não for mais usado diretamente
      permissions: Set<string>; // <-- Adicionado: Conjunto de actions permitidas
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
     // isActive: boolean; // Remover se não estiver usando
     role?: {
        id: string;
        name: string;
        isDirector: boolean;
        departmentId: string;
        department?: {
            id: string;
            name: string;
            // accessModule: ModuloEnum; // Remover se não for mais usado diretamente
        } | null;
     } | null;
     // Adicionar permissions aqui se precisar no objeto User inicial do authorize
     // permissions?: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    // isActive: boolean; // Remover se não estiver usando
    roleName: string | null;
    isDirector: boolean;
    departmentId: string | null;
    departmentName: string | null;
    // accessModule: ModuloEnum | null; // Remover se não for mais usado diretamente
    permissions: Set<string>; // <-- Adicionado: Conjunto de actions permitidas
  }
}