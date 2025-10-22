// src/app/api/chat/conversations/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { Prisma } from '@prisma/client'; // Importar tipos do Prisma

// Tipo para a resposta da API
type Conversation = {
    otherUser: {
        id: string;
        name: string | null;
        image: string | null;
    };
    lastMessage: {
        id: string;
        content: string;
        createdAt: Date;
        senderId: string;
        // readAt: Date | null; // Adicionar se implementar leitura
    };
    // unreadCount: number; // Adicionar se implementar contagem de não lidas
}

// --- GET: Buscar lista de conversas recentes ---
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        console.log("GET /api/chat/conversations - Não autorizado (sem sessão)");
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const currentUserId = session.user.id;
    console.log(`GET /api/chat/conversations - Buscando conversas para User ID: ${currentUserId}`);

    try {
        // 1. Buscar todas as mensagens onde o usuário atual é remetente OU destinatário
        const allMessages = await prisma.chatMessage.findMany({
            where: {
                OR: [
                    { senderId: currentUserId },
                    { receiverId: currentUserId },
                ],
            },
            orderBy: {
                createdAt: 'desc', // Buscar as mais recentes primeiro facilita encontrar a última
            },
            include: { // Incluir dados dos dois usuários envolvidos
                sender: { select: { id: true, name: true, image: true } },
                receiver: { select: { id: true, name: true, image: true } },
            },
        });

        // 2. Agrupar mensagens por conversa (identificada pelo ID do *outro* usuário)
        const conversationsMap = new Map<string, Conversation>();

        for (const message of allMessages) {
            // Identifica o ID do outro usuário na conversa
            const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;

            // Se esta é a primeira mensagem que vemos dessa conversa, adiciona ao mapa
            if (!conversationsMap.has(otherUserId)) {
                // Determina qual objeto 'user' é o 'otherUser'
                const otherUser = message.senderId === otherUserId ? message.sender : message.receiver;

                // Ignora caso não consiga encontrar os dados do outro usuário (raro)
                if (!otherUser) continue;

                conversationsMap.set(otherUserId, {
                    otherUser: {
                        id: otherUser.id,
                        name: otherUser.name,
                        image: otherUser.image,
                    },
                    lastMessage: { // Como ordenamos por desc, a primeira encontrada é a última
                        id: message.id,
                        content: message.content,
                        createdAt: message.createdAt,
                        senderId: message.senderId,
                        // readAt: message.readAt,
                    },
                    // unreadCount: 0, // Inicializa contagem de não lidas (a ser implementada)
                });
            }
            // (Opcional) Aqui poderia incrementar unreadCount se a mensagem não foi lida e o sender é o otherUser
        }

        // 3. Converter o mapa em um array e ordenar pela data da última mensagem
        const conversations = Array.from(conversationsMap.values())
            .sort((a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime());

        console.log(`GET /api/chat/conversations - Encontradas ${conversations.length} conversas para User ID: ${currentUserId}`);
        return NextResponse.json(conversations);

    } catch (error) {
        console.error(`Erro ao buscar conversas para User ID ${currentUserId}:`, error);
        return NextResponse.json({ error: 'Erro interno ao buscar conversas' }, { status: 500 });
    }
}