// src/app/api/chat/messages/[userId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import Ably from 'ably';
import type { RealtimeChannel, Message as AblyMessage, PresenceMessage } from 'ably';

// Interface Opcional para clareza (não usada para extrair params diretamente)
interface RouteContext {
  params: {
    userId: string;
  };
}

// --- Instanciar Ably (usado no POST) ---
let ably: Ably.Realtime | null = null;
if (process.env.ABLY_API_KEY) {
    ably = new Ably.Realtime({ key: process.env.ABLY_API_KEY });
    console.log("Cliente Ably inicializado no backend (messages route).");
} else {
    console.error("ERRO: ABLY_API_KEY não definida (messages route)!");
}


// --- GET: Buscar histórico e MARCAR COMO LIDAS ---
// **** Usando URL para extrair o ID ****
export async function GET(request: NextRequest, context: RouteContext) { // Mantemos context para compatibilidade, mas extrairemos da URL
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.log("GET /api/chat/messages - Não autorizado (sem sessão)");
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const currentUserId = session.user.id;

  // **** Extraindo o ID diretamente da URL ****
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const otherUserId = pathSegments[pathSegments.length - 1]; // O último segmento deve ser o [userId]

  // Verifica se otherUserId foi extraído corretamente
  if (!otherUserId || otherUserId === '[userId]') { // Checa se a extração falhou
    console.error("GET /api/chat/messages - Erro: Não foi possível extrair otherUserId da URL:", url.pathname);
    return NextResponse.json({ error: 'ID do usuário ausente ou inválido na URL' }, { status: 400 });
  }

  console.log(`GET /api/chat/messages/${otherUserId} - Buscando mensagens entre ${currentUserId} e ${otherUserId}`);

  try {
    // 1. Buscar as mensagens da conversa
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
            select: { id: true, name: true, image: true }
        }
      }
    });

    console.log(`GET /api/chat/messages/${otherUserId} - Encontradas ${messages.length} mensagens.`);

    // 2. Marcar mensagens recebidas como lidas
    if (messages.length > 0) {
        const now = new Date();
        try {
            const updateResult = await prisma.chatMessage.updateMany({
                where: {
                    senderId: otherUserId,
                    receiverId: currentUserId,
                    readAt: null
                },
                data: {
                    readAt: now
                }
            });
            if (updateResult.count > 0) {
                console.log(`GET /api/chat/messages/${otherUserId} - Marcadas ${updateResult.count} mensagens como lidas.`);
            }
        } catch (updateError) {
             console.error(`Erro ao marcar mensagens como lidas entre ${currentUserId} e ${otherUserId}:`, updateError);
             // Não retorna erro aqui, apenas loga
        }
    }

    return NextResponse.json(messages);

  } catch (error) {
    console.error(`Erro ao buscar mensagens entre ${currentUserId} e ${otherUserId}:`, error);
    return NextResponse.json({ error: 'Erro interno ao buscar mensagens' }, { status: 500 });
  }
}

// --- POST: Enviar uma nova mensagem ---
// **** Usando URL para extrair o ID ****
export async function POST(request: NextRequest, context: RouteContext) { // Mantemos context para compatibilidade
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ably) {
      console.error("POST /api/chat/messages - Não autorizado ou Ably não configurado.");
      return NextResponse.json({ error: !ably ? 'Config. chat indisponível' : 'Não autorizado' }, { status: !ably ? 503 : 401 });
  }

  const senderId = session.user.id;

  // **** Extraindo o ID diretamente da URL ****
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const receiverId = pathSegments[pathSegments.length - 1]; // O último segmento deve ser o [userId]


  // Verifica se receiverId foi extraído corretamente
  if (!receiverId || receiverId === '[userId]') { // Checa se a extração falhou
    console.error("POST /api/chat/messages - Erro: Não foi possível extrair receiverId da URL:", url.pathname);
    return NextResponse.json({ error: 'ID do destinatário ausente ou inválido na URL' }, { status: 400 });
  }

  console.log(`POST /api/chat/messages/${receiverId} - Enviando de ${senderId}`);
  try {
      const body = await request.json();
      const { content } = body;
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
          return NextResponse.json({ error: 'Conteúdo obrigatório' }, { status: 400 });
      }
      if (senderId === receiverId) {
          return NextResponse.json({ error: 'Não pode enviar para si mesmo' }, { status: 400 });
      }
      const receiverExists = await prisma.user.findUnique({ where: { id: receiverId } });
      if (!receiverExists) {
          return NextResponse.json({ error: 'Destinatário não encontrado' }, { status: 404 });
      }
      const newMessage = await prisma.chatMessage.create({
          data: { content: content.trim(), senderId: senderId, receiverId: receiverId },
          include: { sender: { select: { id: true, name: true, image: true } } }
      });
      console.log(`POST /api/chat/messages - Mensagem ${newMessage.id} salva.`);
      try {
          // Publica a mensagem no canal Ably do destinatário
          const channelName = `private-chat-${receiverId}`;
          if (ably) { // Verifica se ably está inicializado
            const channel = ably.channels.get(channelName);
            await channel.publish('new-message', newMessage);
            console.log(`POST /api/chat/messages - Publicada no Ably: ${channelName}`);
          } else {
            console.warn("Ably não inicializado, não foi possível publicar a mensagem em tempo real.");
          }
      } catch (ablyError) {
          console.error(`ERRO Ably publish msg ${newMessage.id}:`, ablyError);
          // Considerar se deve retornar erro aqui ou apenas logar
      }
      return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
      console.error(`Erro POST /api/chat/messages/${receiverId}:`, error);
      return NextResponse.json({ error: 'Erro interno ao enviar' }, { status: 500 });
  }
}