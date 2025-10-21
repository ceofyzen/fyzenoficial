// src/app/api/cargos/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// --- GET ---
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) { return NextResponse.json({ error: 'Não autorizado' }, { status: 401 }); }

  try {
    const cargos = await prisma.role.findMany({
      orderBy: [
        { department: { name: 'asc' } },
        { hierarchyLevel: 'asc' },
        { name: 'asc' },
      ],
      include: {
        department: { select: { name: true } },
        _count: { select: { users: true } } // Inclui contagem
      }
      // Implicitamente seleciona iconName
    });
    console.log("API GET /api/cargos - Retornando cargos:", cargos.map(c => ({ id: c.id, name: c.name, iconName: c.iconName }))); // Log para verificar iconName
    return NextResponse.json(cargos);
  } catch (error) {
    console.error("Erro ao buscar cargos:", error);
    return NextResponse.json({ error: 'Erro interno ao buscar cargos' }, { status: 500 });
  }
}

// --- POST ---
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) { return NextResponse.json({ error: 'Não autorizado' }, { status: 401 }); }

  try {
    const body = await request.json();
    // Log do body recebido
    console.log("API POST /api/cargos - Body Recebido:", body);
    const { name, departmentId, description, isDirector, hierarchyLevel, iconName } = body;

    if (!name || !departmentId) { return NextResponse.json({ error: 'Nome e Departamento são obrigatórios' }, { status: 400 }); }

    const level = hierarchyLevel !== undefined && hierarchyLevel !== null ? parseInt(hierarchyLevel, 10) : 99;
    if (isNaN(level)) { return NextResponse.json({ error: 'Nível Hierárquico inválido.' }, { status: 400 }); }

    const departmentExists = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!departmentExists) { return NextResponse.json({ error: 'Departamento inválido' }, { status: 400 }); }

    const novoCargo = await prisma.role.create({
      data: {
        name: name,
        departmentId: departmentId,
        description: description,
        isDirector: isDirector || false,
        hierarchyLevel: level,
        iconName: iconName || null, // Salvar nome do ícone (ou null)
      },
      include: { department: { select: { name: true } } }
    });

    // Log do cargo criado
    console.log("Novo cargo criado (verificar iconName):", novoCargo);
    return NextResponse.json(novoCargo, { status: 201 });

  } catch (error: any) {
    console.error("Erro ao criar cargo:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) { return NextResponse.json({ error: 'Já existe um cargo com este nome' }, { status: 409 }); }
    return NextResponse.json({ error: 'Erro interno ao criar cargo' }, { status: 500 });
  }
}