// src/app/api/chat/conversations/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { Prisma } from '@prisma/client';

// **** REFORÇO: Certifique-se de que os índices abaixo foram criados no schema.prisma e migrados: ****
// @@index([senderId, createdAt(sort: Desc)])
// @@index([receiverId, createdAt(sort: Desc)])
// @@index([senderId, receiverId, createdAt(sort: Desc)])
// @@index([receiverId, senderId, createdAt(sort: Desc)])

type ConversationListItem = {
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
    };
};

type RawConversationResult = {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    receiverId: string;
    otherUserId: string;
    otherUserName: string | null;
    otherUserImage: string | null;
};

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        console.log("GET /api/chat/conversations - Não autorizado (sem sessão)");
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const currentUserId = session.user.id;
    console.log(`GET /api/chat/conversations - Buscando conversas OTIMIZADO para User ID: ${currentUserId}`);
    console.time(`Conversations API - User ${currentUserId}`); // Medir tempo total

    try {
        console.time(`Conversations Query - User ${currentUserId}`); // Medir tempo da query
        const query = Prisma.sql`
            WITH RankedMessages AS (
              SELECT
                m.id,
                m.content,
                m."createdAt",
                m."senderId",
                m."receiverId",
                u_sender.name AS "senderName",
                u_sender.image AS "senderImage",
                u_receiver.name AS "receiverName",
                u_receiver.image AS "receiverImage",
                ROW_NUMBER() OVER (
                  PARTITION BY
                    CASE
                      WHEN m."senderId" = ${currentUserId} THEN m."receiverId"
                      ELSE m."senderId"
                    END
                  ORDER BY m."createdAt" DESC
                ) as rn
              FROM "ChatMessage" m
              LEFT JOIN "User" u_sender ON m."senderId" = u_sender.id
              LEFT JOIN "User" u_receiver ON m."receiverId" = u_receiver.id
              WHERE m."senderId" = ${currentUserId} OR m."receiverId" = ${currentUserId}
            )
            SELECT
              id,
              content,
              "createdAt",
              "senderId",
              "receiverId",
              CASE
                WHEN "senderId" = ${currentUserId} THEN "receiverId"
                ELSE "senderId"
              END AS "otherUserId",
              CASE
                WHEN "senderId" = ${currentUserId} THEN "receiverName"
                ELSE "senderName"
              END AS "otherUserName",
              CASE
                WHEN "senderId" = ${currentUserId} THEN "receiverImage"
                ELSE "senderImage"
              END AS "otherUserImage"
            FROM RankedMessages
            WHERE rn = 1
            ORDER BY "createdAt" DESC;
        `;

        const rawResults: RawConversationResult[] = await prisma.$queryRaw<RawConversationResult[]>(query);
        console.timeEnd(`Conversations Query - User ${currentUserId}`); // Fim da medição da query

        console.time(`Conversations Mapping - User ${currentUserId}`); // Medir tempo do map
        const conversations: ConversationListItem[] = rawResults.map(row => ({
            otherUser: {
                id: row.otherUserId,
                name: row.otherUserName,
                image: row.otherUserImage,
            },
            lastMessage: {
                id: row.id,
                content: row.content,
                createdAt: row.createdAt,
                senderId: row.senderId,
            }
        }));
        console.timeEnd(`Conversations Mapping - User ${currentUserId}`); // Fim da medição do map


        console.log(`GET /api/chat/conversations - Encontradas ${conversations.length} conversas (OTIMIZADO) para User ID: ${currentUserId}`);
        console.timeEnd(`Conversations API - User ${currentUserId}`); // Fim da medição total
        return NextResponse.json(conversations);

    } catch (error) {
        console.error(`Erro OTIMIZADO ao buscar conversas para User ID ${currentUserId}:`, error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
             console.error("Prisma Error Code:", error.code);
             console.error("Prisma Error Meta:", error.meta);
        } else if (error instanceof Error) {
            console.error("Generic Error Message:", error.message);
        } else {
            console.error("Unknown Error Structure:", error);
        }
        console.timeEnd(`Conversations API - User ${currentUserId}`); // Fim da medição total (em caso de erro)
        return NextResponse.json({ error: 'Erro interno ao buscar conversas' }, { status: 500 });
    }
}