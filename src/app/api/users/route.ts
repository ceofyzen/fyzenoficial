// src/app/api/users/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// --- GET: Listar todos os usuários (exceto o logado) ---
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
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
        // status: 'Ativo', // Opcional: Filtrar apenas usuários ativos?
      },
      orderBy: {
        name: 'asc', // Ordena por nome
      },
      select: {
        id: true,
        name: true,
        image: true,
        // Incluir roleId e o nome do cargo
        roleId: true,
        role: {
          select: { name: true }
        }
      },
    });

    // Formatar a resposta para incluir 'roleName' no nível superior
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      image: user.image,
      roleId: user.roleId,
      roleName: user.role?.name || 'Sem Cargo', // Adiciona o nome do cargo
    }));

    console.log(`GET /api/users - Encontrados ${formattedUsers.length} outros usuários.`);
    return NextResponse.json(formattedUsers);

  } catch (error) {
    console.error(`Erro ao buscar lista de usuários:`, error);
    return NextResponse.json({ error: 'Erro interno ao buscar usuários' }, { status: 500 });
  }
}