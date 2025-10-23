// src/app/api/ponto/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { Prisma, PontoTipo } from '@prisma/client';

// --- PUT: Editar Registro Manual ---
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await request.json();
    const { userId, timestamp, type: pontoType, justificativa } = body;

    if (!userId || !timestamp || !pontoType) {
      return NextResponse.json(
        { error: 'Campos userId, timestamp e type são obrigatórios.' },
        { status: 400 }
      );
    }

    if (pontoType !== PontoTipo.ENTRADA && pontoType !== PontoTipo.SAIDA) {
      return NextResponse.json(
        { error: 'O tipo deve ser "ENTRADA" ou "SAIDA".' },
        { status: 400 }
      );
    }

    // Verificar se o registro existe e é manual
    const registroExistente = await prisma.pontoRegistro.findUnique({
      where: { id },
    });

    if (!registroExistente) {
      return NextResponse.json(
        { error: 'Registro não encontrado.' },
        { status: 404 }
      );
    }

    if (registroExistente.source !== 'MANUAL') {
      return NextResponse.json(
        { error: 'Apenas registros manuais podem ser editados.' },
        { status: 403 }
      );
    }

    // Atualizar registro
    const registroAtualizado = await prisma.pontoRegistro.update({
      where: { id },
      data: {
        userId: userId,
        timestamp: new Date(timestamp),
        type: pontoType,
        justificativa: justificativa || null,
      },
      include: { user: { select: { name: true } } },
    });

    const resultadoFormatado = {
      ...registroAtualizado,
      userName: registroAtualizado.user?.name || null,
    };

    console.log('PUT /api/ponto/[id] - Registro atualizado:', id);
    return NextResponse.json(resultadoFormatado);
  } catch (error) {
    console.error('Erro ao atualizar registro de ponto:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        if (error.meta?.field_name?.toString().includes('userId')) {
          return NextResponse.json(
            { error: 'Funcionário não encontrado.' },
            { status: 400 }
          );
        }
      }
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Registro não encontrado.' },
          { status: 404 }
        );
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: 'Erro interno ao atualizar registro', details: errorMessage },
      { status: 500 }
    );
  }
}

// --- DELETE: Excluir Registro Manual ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = params;

  try {
    // Verificar se o registro existe e é manual
    const registroExistente = await prisma.pontoRegistro.findUnique({
      where: { id },
    });

    if (!registroExistente) {
      return NextResponse.json(
        { error: 'Registro não encontrado.' },
        { status: 404 }
      );
    }

    if (registroExistente.source !== 'MANUAL') {
      return NextResponse.json(
        { error: 'Apenas registros manuais podem ser excluídos.' },
        { status: 403 }
      );
    }

    // Excluir registro
    await prisma.pontoRegistro.delete({
      where: { id },
    });

    console.log('DELETE /api/ponto/[id] - Registro excluído:', id);
    return NextResponse.json(
      { message: 'Registro excluído com sucesso.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir registro de ponto:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Registro não encontrado.' },
          { status: 404 }
        );
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: 'Erro interno ao excluir registro', details: errorMessage },
      { status: 500 }
    );
  }
}