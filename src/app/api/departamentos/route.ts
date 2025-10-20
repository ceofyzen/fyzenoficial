// src/app/api/departamentos/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
// Importamos o TIPO ModuloEnum. O objeto com os valores também vem junto.
import { ModuloEnum } from '@prisma/client'; 

// --- GET: Listar todos os Departamentos ---
export async function GET(request: Request) {
  // ... (código GET sem alteração) ...
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const departamentos = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(departamentos);
  } catch (error) {
    console.error("Erro ao buscar departamentos:", error);
    return NextResponse.json({ error: 'Erro interno ao buscar departamentos' }, { status: 500 });
  }
}

// --- POST: Criar um Novo Departamento ---
export async function POST(request: Request) {
  // ... (código de verificação de sessão) ...
  const session = await getServerSession(authOptions);
   if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, accessModule, description } = body;

    if (!name || !accessModule) {
      return NextResponse.json({ error: 'Nome e Módulo de Acesso são obrigatórios' }, { status: 400 });
    }

    // ***** CORREÇÃO AQUI: Remover Prisma. *****
    // Acessamos o enum diretamente pelo nome importado
    if (!Object.keys(ModuloEnum).includes(accessModule)) {
       return NextResponse.json({ error: 'Módulo de Acesso inválido' }, { status: 400 });
    }

    const novoDepartamento = await prisma.department.create({
      data: {
        name: name,
        accessModule: accessModule as ModuloEnum, // O tipo ainda é usado no cast
        description: description || null, 
      },
    });

    console.log("Novo departamento criado no DB:", novoDepartamento);
    return NextResponse.json(novoDepartamento, { status: 201 });

  } catch (error: any) {
    // ... (tratamento de erro sem alteração) ...
    console.error("Erro ao criar departamento:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        return NextResponse.json({ error: 'Já existe um departamento com este nome' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro interno ao criar departamento' }, { status: 500 });
  }
}