// src/app/api/departamentos/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ModuloEnum } from '@prisma/client';

// --- GET: Obter um Departamento por ID ---
// **** CORREÇÃO DA ASSINATURA ****
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // **** CORREÇÃO DO ACESSO ****
  const { id } = params;

  try {
    const departamento = await prisma.department.findUnique({
      where: { id: id },
    });

    if (!departamento) {
      return NextResponse.json({ error: 'Departamento não encontrado' }, { status: 404 });
    }
    return NextResponse.json(departamento);

  } catch (error) {
    console.error(`Erro ao buscar departamento ${id}:`, error);
    return NextResponse.json({ error: 'Erro interno ao buscar departamento' }, { status: 500 });
  }
}

// --- PUT: Atualizar um Departamento por ID ---
// **** CORREÇÃO DA ASSINATURA ****
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
   const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // **** CORREÇÃO DO ACESSO ****
  const { id } = params;

  try {
    const body = await request.json();
    const { name, accessModule, description } = body;

    if (!name || !accessModule) {
      return NextResponse.json({ error: 'Nome e Módulo de Acesso são obrigatórios' }, { status: 400 });
    }

    if (!Object.keys(ModuloEnum).includes(accessModule)) {
      return NextResponse.json({ error: 'Módulo de Acesso inválido' }, { status: 400 });
    }

    const departamentoAtualizado = await prisma.department.update({
      where: { id: id },
      data: {
        name: name,
        accessModule: accessModule as ModuloEnum,
        description: description,
      },
    });

    console.log("Departamento atualizado no DB:", departamentoAtualizado);
    return NextResponse.json(departamentoAtualizado);

  } catch (error: any) {
    console.error(`Erro ao atualizar departamento ${id}:`, error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return NextResponse.json({ error: 'Já existe um departamento com este nome' }, { status: 409 });
    }
    if (error.code === 'P2025') { 
        return NextResponse.json({ error: 'Departamento não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro interno ao atualizar departamento' }, { status: 500 });
  }
}

// --- DELETE: Excluir um Departamento por ID ---
// **** CORREÇÃO DA ASSINATURA ****
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // **** CORREÇÃO DO ACESSO ****
  const { id } = params;

  try {
    await prisma.department.delete({
      where: { id: id },
    });

    console.log(`Departamento excluído do DB: ${id}`);
    return NextResponse.json({ message: 'Departamento excluído com sucesso' }, { status: 200 }); 

  } catch (error: any) {
    console.error(`Erro ao excluir departamento ${id}:`, error);
     if (error.code === 'P2003') { 
        return NextResponse.json({ error: 'Não é possível excluir: existem cargos vinculados.' }, { status: 409 });
    }
     if (error.code === 'P2025') { 
        return NextResponse.json({ error: 'Departamento não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro interno ao excluir departamento' }, { status: 500 });
  }
}