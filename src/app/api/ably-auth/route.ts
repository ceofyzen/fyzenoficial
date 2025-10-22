// src/app/api/ably-auth/route.ts
import { NextResponse, NextRequest } from 'next/server';
import Ably from 'ably';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Ajuste o caminho se necessário
import { getServerSession } from 'next-auth/next';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Garante que o usuário está logado
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Verifica se a API Key está configurada no backend
  if (!process.env.ABLY_API_KEY) {
       console.error("ABLY_API_KEY não está definida no backend para autenticação.");
       return NextResponse.json({ error: 'Erro de configuração do servidor' }, { status: 500 });
  }

  try {
    // Usa a API Key principal *apenas* no backend para criar uma solicitação de token
    const ablyClient = new Ably.Rest({ key: process.env.ABLY_API_KEY });
    const tokenRequest = await ablyClient.auth.createTokenRequest({
        clientId: session.user.id, // Associa o token ao ID do usuário logado
        // capabilities: { /* Defina permissões específicas se necessário */ }
    });

    console.log(`GET /api/ably-auth - Token Request gerado para clientId: ${session.user.id}`);
    // Retorna o Token Request para o cliente
    return NextResponse.json(tokenRequest);

  } catch (error) {
    console.error("Erro ao criar Ably Token Request:", error);
    return NextResponse.json({ error: 'Erro interno ao autenticar com o serviço de chat' }, { status: 500 });
  }
}