// src/app/api/cargos/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Cliente Prisma
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Opções de autenticação
import { getServerSession } from 'next-auth/next';

// --- GET: Listar todos os Cargos ---
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  // TODO: Adicionar verificação de permissão

  try {
    const cargos = await prisma.role.findMany({
      orderBy: [
        { department: { name: 'asc' } }, // Ordena primeiro pelo nome do departamento
        { name: 'asc' },                 // Depois pelo nome do cargo
      ],
      include: {
        department: { // Inclui o nome do departamento na resposta
          select: { name: true }
        }
      }
    });
    return NextResponse.json(cargos);
  } catch (error) {
    console.error("Erro ao buscar cargos:", error);
    return NextResponse.json({ error: 'Erro interno ao buscar cargos' }, { status: 500 });
  }
}

// --- POST: Criar um Novo Cargo ---
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  // TODO: Adicionar verificação de permissão (ex: só admin/RH pode criar?)

  try {
    const body = await request.json();
    const { name, departmentId, description, isDirector } = body;

    // Validação
    if (!name || !departmentId) {
      return NextResponse.json({ error: 'Nome e Departamento são obrigatórios' }, { status: 400 });
    }

    // Verifica se o departamento existe
    const departmentExists = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!departmentExists) {
        return NextResponse.json({ error: 'Departamento inválido ou não encontrado' }, { status: 400 });
    }

    // Criação no banco
    const novoCargo = await prisma.role.create({
      data: {
        name: name,
        departmentId: departmentId,
        description: description,
        isDirector: isDirector || false, // Garante que seja boolean
      },
      include: { // Retorna o departamento junto para confirmação
        department: { select: { name: true } }
      }
    });

    console.log("Novo cargo criado no DB:", novoCargo);
    return NextResponse.json(novoCargo, { status: 201 });

  } catch (error: any) {
    console.error("Erro ao criar cargo:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        return NextResponse.json({ error: 'Já existe um cargo com este nome' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro interno ao criar cargo' }, { status: 500 });
  }
}