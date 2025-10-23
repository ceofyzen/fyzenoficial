// src/app/api/solicitacoes/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { Prisma, SolicitacaoStatus } from '@prisma/client';

interface RouteContext {
  params: { id: string };
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  // TODO: Adicionar verificação de permissão (só RH/Diretor podem aprovar/rejeitar?)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const id = context.params.id;
  if (!id) {
    return NextResponse.json({ error: 'ID da solicitação não fornecido na URL.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, observacaoRh } = body;

    // Validação do Status
    if (!status || !Object.values(SolicitacaoStatus).includes(status as SolicitacaoStatus)) {
      return NextResponse.json({ error: 'Status inválido fornecido.' }, { status: 400 });
    }
    // Não permitir definir como PENDENTE via PUT (apenas APROVADO ou REJEITADO)
    if (status === SolicitacaoStatus.PENDENTE) {
       return NextResponse.json({ error: 'Não é possível definir o status como Pendente.' }, { status: 400 });
    }

    // --- Lógica de Permissão (Exemplo) ---
    // if (session.user.roleName !== 'Chief Executive Officer' && session.user.accessModule !== 'RH') {
    //   return NextResponse.json({ error: 'Você não tem permissão para aprovar/rejeitar solicitações.' }, { status: 403 });
    // }
    // --- Fim Lógica de Permissão ---

    const solicitacaoAtualizada = await prisma.solicitacao.update({
      where: { id: id },
      data: {
        status: status as SolicitacaoStatus,
        observacaoRh: observacaoRh || null,
        // Se adicionou processedBy no schema:
        // processedById: session.user.id,
      },
      include: { // Retorna dados formatados após atualizar
          user: { select: { name: true, role: {select: {name: true}} } }
          // processedBy: { select: { id: true, name: true } }
      }
    });

     const resultadoFormatado = {
        ...solicitacaoAtualizada,
        userName: solicitacaoAtualizada.user?.name || null,
        userRole: solicitacaoAtualizada.user?.role?.name || null,
        // processedByName: solicitacaoAtualizada.processedBy?.name || null, // Se usar processedBy
     };

    return NextResponse.json(resultadoFormatado);

  } catch (error) {
    console.error(`Erro ao atualizar solicitação ${id}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
       return NextResponse.json({ error: 'Solicitação não encontrada.' }, { status: 404 });
    }
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Erro interno ao atualizar solicitação', details: errorMessage }, { status: 500 });
  }
}