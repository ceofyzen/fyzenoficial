// src/app/api/chat/messages/[userId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import Ably from 'ably'; // Import Ably (usado no POST)

interface Params {
  params: { userId: string }; // userId aqui é o ID do *outro* usuário na conversa
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
export async function GET(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.log("GET /api/chat/messages - Não autorizado (sem sessão)");
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const currentUserId = session.user.id;
  const otherUserId = params.userId; // ID do usuário com quem se está conversando

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

    // **** 2. Marcar mensagens recebidas como lidas (NOVO) ****
    // Atualiza apenas as mensagens enviadas PELO OUTRO usuário para o usuário ATUAL
    // que ainda não foram lidas (readAt is null).
    // Fazemos isso *depois* de buscar, para que o frontend receba as mensagens
    // e *então* elas sejam marcadas como lidas no banco.
    if (messages.length > 0) {
        const now = new Date();
        try {
            const updateResult = await prisma.chatMessage.updateMany({
                where: {
                    senderId: otherUserId,       // Enviada pelo outro usuário
                    receiverId: currentUserId,   // Recebida pelo usuário logado
                    readAt: null                 // Que ainda não foi lida
                },
                data: {
                    readAt: now                 // Define a data/hora de leitura
                }
            });
            if (updateResult.count > 0) {
                console.log(`GET /api/chat/messages/${otherUserId} - Marcadas ${updateResult.count} mensagens como lidas.`);
                 // TODO (Avançado): Poderia emitir um evento Ably para o *remetente*
                 // saber que as mensagens foram lidas (ex: duplo check azul).
            }
        } catch (updateError) {
             console.error(`Erro ao marcar mensagens como lidas entre ${currentUserId} e ${otherUserId}:`, updateError);
             // Continuar mesmo se a atualização falhar, para não impedir o carregamento das mensagens
        }
    }
    // **** Fim Marcar como Lidas ****

    return NextResponse.json(messages); // Retorna as mensagens que foram buscadas

  } catch (error) {
    console.error(`Erro ao buscar mensagens entre ${currentUserId} e ${otherUserId}:`, error);
    return NextResponse.json({ error: 'Erro interno ao buscar mensagens' }, { status: 500 });
  }
}

// --- POST: Enviar uma nova mensagem --- (sem alterações)
export async function POST(request: NextRequest, { params }: Params) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !ably) {
        console.error("POST /api/chat/messages - Não autorizado ou Ably não configurado.");
        return NextResponse.json({ error: !ably ? 'Config. chat indisponível' : 'Não autorizado' }, { status: !ably ? 503 : 401 });
    }
    const senderId = session.user.id;
    const receiverId = params.userId;
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
            const channelName = `private-chat-${receiverId}`;
            const channel = ably.channels.get(channelName);
            await channel.publish('new-message', newMessage);
            console.log(`POST /api/chat/messages - Publicada no Ably: ${channelName}`);
        } catch (ablyError) {
            console.error(`ERRO Ably publish msg ${newMessage.id}:`, ablyError);
        }
        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.error(`Erro POST /api/chat/messages/${receiverId}:`, error);
        return NextResponse.json({ error: 'Erro interno ao enviar' }, { status: 500 });
    }
}