// src/app/api/cargos/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

interface Params { params: { id: string }; }

// --- GET (sem alterações funcionais) ---
export async function GET(request: Request, { params }: Params) {
    const session = await getServerSession(authOptions);
    if (!session) { return NextResponse.json({ error: 'Não autorizado' }, { status: 401 }); }
    const { id } = params;
    try {
        const cargo = await prisma.role.findUnique({
            where: { id: id },
            include: { department: { select: { id: true, name: true }} }
        });
        if (!cargo) { return NextResponse.json({ error: 'Cargo não encontrado' }, { status: 404 }); }
        console.log(`API GET /api/cargos/${id} - Retornando cargo:`, cargo); // Log para verificar iconName
        return NextResponse.json(cargo);
    } catch (error) {
        console.error(`Erro ao buscar cargo ${id}:`, error);
        return NextResponse.json({ error: 'Erro interno ao buscar cargo' }, { status: 500 });
    }
}

// --- PUT ---
export async function PUT(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) { return NextResponse.json({ error: 'Não autorizado' }, { status: 401 }); }
  const { id } = params;

  try {
    const body = await request.json();
    // Log do body recebido
    console.log(`API PUT /api/cargos/${id} - Body Recebido:`, body);
    const { name, departmentId, description, isDirector, hierarchyLevel, iconName } = body;

    if (!name || !departmentId) { return NextResponse.json({ error: 'Nome e Departamento obrigatórios' }, { status: 400 }); }

    const level = hierarchyLevel !== undefined && hierarchyLevel !== null ? parseInt(hierarchyLevel, 10) : 99;
    if (isNaN(level)) { return NextResponse.json({ error: 'Nível Hierárquico inválido.' }, { status: 400 }); }

    const departmentExists = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!departmentExists) { return NextResponse.json({ error: 'Departamento inválido' }, { status: 400 }); }

    const cargoAtualizado = await prisma.role.update({
      where: { id: id },
      data: {
        name: name,
        departmentId: departmentId,
        description: description,
        isDirector: isDirector || false,
        hierarchyLevel: level,
        iconName: iconName || null, // Atualizar nome do ícone
      },
       include: { department: { select: { name: true } } }
    });

    // Log do cargo atualizado
    console.log("Cargo atualizado (verificar iconName):", cargoAtualizado);
    return NextResponse.json(cargoAtualizado);

  } catch (error: any) {
     console.error(`Erro ao atualizar cargo ${id}:`, error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) { return NextResponse.json({ error: 'Já existe um cargo com este nome' }, { status: 409 }); }
    if (error.code === 'P2025') { return NextResponse.json({ error: 'Cargo não encontrado para atualização' }, { status: 404 }); }
    return NextResponse.json({ error: 'Erro interno ao atualizar cargo' }, { status: 500 });
  }
}

// --- DELETE (sem alterações) ---
export async function DELETE(request: Request, { params }: Params) {
    const session = await getServerSession(authOptions);
    if (!session) { return NextResponse.json({ error: 'Não autorizado' }, { status: 401 }); }
    const { id } = params;
    try {
        await prisma.role.delete({ where: { id: id } });
        console.log(`Cargo excluído: ${id}`);
        return NextResponse.json({ message: 'Cargo excluído com sucesso' }, { status: 200 });
    } catch (error: any) {
        console.error(`Erro ao excluir cargo ${id}:`, error);
        if (error.code === 'P2025') { return NextResponse.json({ error: 'Cargo não encontrado para exclusão' }, { status: 404 }); }
        return NextResponse.json({ error: 'Erro interno ao excluir cargo' }, { status: 500 });
    }
}