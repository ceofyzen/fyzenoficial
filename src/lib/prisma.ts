// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Declara uma variável global para armazenar o PrismaClient
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Cria a instância do PrismaClient, reutilizando a global em desenvolvimento
// para evitar múltiplas instâncias devido ao Hot Module Replacement (HMR)
const prisma = global.prisma || new PrismaClient({
  // Opcional: Adicionar log em desenvolvimento para ver as queries
  // log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : [],
});

// Em desenvolvimento, armazena a instância na variável global
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;