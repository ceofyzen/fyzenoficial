// src/app/api/chat/unread-count/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Ajuste o caminho se necessário
import { getServerSession } from 'next-auth/next';

// --- GET: Contar mensagens não lidas para o usuário logado ---
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Verifica se há sessão e ID do usuário
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const currentUserId = session.user.id;
  // console.log(`GET /api/chat/unread-count - Buscando contagem para User ID: ${currentUserId}`); // Log opcional

  try {
    const unreadCount = await prisma.chatMessage.count({
      where: {
        receiverId: currentUserId, // Mensagens recebidas pelo usuário logado
        readAt: null,             // Que ainda não foram lidas (readAt é null)
      },
    });

    // console.log(`GET /api/chat/unread-count - Contagem: ${unreadCount}`); // Log opcional
    return NextResponse.json({ count: unreadCount });

  } catch (error) {
    console.error(`Erro ao contar mensagens não lidas para User ID ${currentUserId}:`, error);
    return NextResponse.json({ error: 'Erro interno ao buscar contagem' }, { status: 500 });
  }
}