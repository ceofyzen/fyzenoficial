// src/app/api/cargos/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// --- GET ---
// **** CORREÇÃO DA ASSINATURA ****
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) { return NextResponse.json({ error: 'Não autorizado' }, { status: 401 }); }
    
    // **** CORREÇÃO DO ACESSO ****
    const { id } = params;

    try {
        const cargo = await prisma.role.findUnique({
            where: { id: id },
            include: { department: { select: { id: true, name: true }} }
        });
        if (!cargo) { return NextResponse.json({ error: 'Cargo não encontrado' }, { status: 404 }); }
        console.log(`API GET /api/cargos/${id} - Retornando cargo:`, cargo);
        return NextResponse.json(cargo);
    } catch (error) {
        console.error(`Erro ao buscar cargo ${id}:`, error);
        return NextResponse.json({ error: 'Erro interno ao buscar cargo' }, { status: 500 });
    }
}

// --- PUT ---
// **** CORREÇÃO DA ASSINATURA ****
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) { return NextResponse.json({ error: 'Não autorizado' }, { status: 401 }); }
  
  // **** CORREÇÃO DO ACESSO ****
  const { id } = params;

  try {
    const body = await request.json();
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
        iconName: iconName || null,
      },
       include: { department: { select: { name: true } } }
    });

    console.log("Cargo atualizado:", cargoAtualizado);
    return NextResponse.json(cargoAtualizado);

  } catch (error: any) {
     console.error(`Erro ao atualizar cargo ${id}:`, error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) { return NextResponse.json({ error: 'Já existe um cargo com este nome' }, { status: 409 }); }
    if (error.code === 'P2025') { return NextResponse.json({ error: 'Cargo não encontrado' }, { status: 404 }); }
    return NextResponse.json({ error: 'Erro interno ao atualizar cargo' }, { status: 500 });
  }
}

// --- DELETE ---
// **** CORREÇÃO DA ASSINATURA ****
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) { return NextResponse.json({ error: 'Não autorizado' }, { status: 401 }); }
    
    // **** CORREÇÃO DO ACESSO ****
    const { id } = params;

    try {
        await prisma.role.delete({ where: { id: id } });
        console.log(`Cargo excluído: ${id}`);
        return NextResponse.json({ message: 'Cargo excluído com sucesso' }, { status: 200 });
    } catch (error: any) {
        console.error(`Erro ao excluir cargo ${id}:`, error);
        if (error.code === 'P2025') { return NextResponse.json({ error: 'Cargo não encontrado' }, { status: 404 }); }
        if (error.code === 'P2003') { 
            return NextResponse.json({ error: 'Não é possível excluir: existem funcionários vinculados.' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Erro interno ao excluir cargo' }, { status: 500 });
    }
}