// src/app/api/perfil/alterar-senha/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcrypt';

const saltRounds = 10;

// --- POST: Alterar a senha do usuário logado ---
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Verifica se há sessão e ID do usuário
  if (!session?.user?.id) {
    console.log("POST /api/perfil/alterar-senha - Não autorizado (sem sessão)");
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const userId = session.user.id;
  console.log(`POST /api/perfil/alterar-senha - Iniciando para User ID: ${userId}`);

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validações básicas de entrada
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Senha atual e nova senha são obrigatórias' }, { status: 400 });
    }
    if (newPassword.length < 6) {
         return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    // Busca o usuário atual no banco para pegar o hash da senha
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true } // Seleciona apenas o hash da senha
    });

    // Verifica se o usuário existe e tem uma senha cadastrada
    if (!user || !user.passwordHash) {
      console.error(`POST /api/perfil/alterar-senha - Usuário ${userId} não encontrado ou sem hash.`);
      // Retorna 401 para não vazar informação se o usuário existe mas não tem senha (ex: login social)
      return NextResponse.json({ error: 'Senha atual incorreta ou usuário inválido' }, { status: 401 });
    }

    // Compara a senha atual fornecida com o hash armazenado
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      console.log(`POST /api/perfil/alterar-senha - Senha atual inválida para User ID: ${userId}`);
      return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 401 }); // Status 401 (Unauthorized) é apropriado aqui
    }

    // Gera o hash da nova senha
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Atualiza a senha no banco de dados
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    console.log(`POST /api/perfil/alterar-senha - Senha alterada com sucesso para User ID: ${userId}`);
    // Retorna uma resposta de sucesso sem conteúdo (204) ou com uma mensagem simples (200)
    // return new NextResponse(null, { status: 204 });
    return NextResponse.json({ message: 'Senha alterada com sucesso!' }, { status: 200 });


  } catch (error) {
    console.error(`Erro ao alterar senha para User ID ${userId}:`, error);
    return NextResponse.json({ error: 'Erro interno ao alterar senha' }, { status: 500 });
  }
}