// src/app/api/departamentos/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
// Importamos o TIPO ModuloEnum. O objeto com os valores também vem junto.
import { ModuloEnum } from '@prisma/client'; 

interface Params {
  params: { id: string };
}

// --- GET: Obter um Departamento por ID ---
export async function GET(request: Request, { params }: Params) {
 // ... (código GET sem alteração) ...
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

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
export async function PUT(request: Request, { params }: Params) {
  // ... (código de verificação de sessão) ...
   const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await request.json();
    const { name, accessModule, description } = body;

    if (!name || !accessModule) {
      return NextResponse.json({ error: 'Nome e Módulo de Acesso são obrigatórios' }, { status: 400 });
    }

    // ***** CORREÇÃO AQUI: Remover Prisma. *****
    if (!Object.keys(ModuloEnum).includes(accessModule)) {
      return NextResponse.json({ error: 'Módulo de Acesso inválido' }, { status: 400 });
    }

    const departamentoAtualizado = await prisma.department.update({
      where: { id: id },
      data: {
        name: name,
        accessModule: accessModule as ModuloEnum, // O tipo ainda é usado no cast
        description: description,
      },
    });

    console.log("Departamento atualizado no DB:", departamentoAtualizado);
    return NextResponse.json(departamentoAtualizado);

  } catch (error: any) {
    // ... (tratamento de erro sem alteração) ...
    console.error(`Erro ao atualizar departamento ${id}:`, error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return NextResponse.json({ error: 'Já existe um departamento com este nome' }, { status: 409 });
    }
    if (error.code === 'P2025') { 
        return NextResponse.json({ error: 'Departamento não encontrado para atualização' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro interno ao atualizar departamento' }, { status: 500 });
  }
}

// --- DELETE: Excluir um Departamento por ID ---
export async function DELETE(request: Request, { params }: Params) {
  // ... (código DELETE sem alteração) ...
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

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
        return NextResponse.json({ error: 'Não é possível excluir este departamento pois existem cargos vinculados a ele.' }, { status: 409 });
    }
     if (error.code === 'P2025') { 
        return NextResponse.json({ error: 'Departamento não encontrado para exclusão' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro interno ao excluir departamento' }, { status: 500 });
  }
}