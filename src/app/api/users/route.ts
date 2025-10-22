// src/app/api/users/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Ajuste o caminho se necessário
import { getServerSession } from 'next-auth/next';

// --- GET: Listar todos os usuários (exceto o logado) ---
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Verifica se há sessão e ID do usuário
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const currentUserId = session.user.id;
  console.log(`GET /api/users - Buscando lista de usuários (excluindo ${currentUserId})`);

  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId, // Exclui o próprio usuário da lista
        },
        // Opcional: Filtrar apenas usuários ativos?
        // status: 'Ativo',
      },
      orderBy: {
        name: 'asc', // Ordena por nome
      },
      select: { // Seleciona apenas os campos necessários para a lista
        id: true,
        name: true,
        image: true,
        // email: true, // Descomente se precisar mostrar o email na lista
        // role: { select: { name: true } } // Descomente se precisar mostrar o cargo
      },
    });

    console.log(`GET /api/users - Encontrados ${users.length} outros usuários.`);
    return NextResponse.json(users);

  } catch (error) {
    console.error(`Erro ao buscar lista de usuários:`, error);
    return NextResponse.json({ error: 'Erro interno ao buscar usuários' }, { status: 500 });
  }
}