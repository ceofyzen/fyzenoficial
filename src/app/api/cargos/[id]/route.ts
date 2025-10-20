// src/app/api/cargos/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

interface Params {
  params: { id: string };
}

// --- GET: Obter um Cargo por ID ---
export async function GET(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  // TODO: Verificação de permissão

  const { id } = params;

  try {
    const cargo = await prisma.role.findUnique({
      where: { id: id },
      include: { // Inclui o departamento para contexto
         department: { select: { id: true, name: true }}
      }
    });

    if (!cargo) {
      return NextResponse.json({ error: 'Cargo não encontrado' }, { status: 404 });
    }
    return NextResponse.json(cargo);

  } catch (error) {
    console.error(`Erro ao buscar cargo ${id}:`, error);
    return NextResponse.json({ error: 'Erro interno ao buscar cargo' }, { status: 500 });
  }
}

// --- PUT: Atualizar um Cargo por ID ---
export async function PUT(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  // TODO: Verificação de permissão

  const { id } = params;

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

    // Atualização no banco
    const cargoAtualizado = await prisma.role.update({
      where: { id: id },
      data: {
        name: name,
        departmentId: departmentId,
        description: description,
        isDirector: isDirector || false,
      },
       include: { // Retorna o departamento junto para confirmação
        department: { select: { name: true } }
      }
    });

    console.log("Cargo atualizado no DB:", cargoAtualizado);
    return NextResponse.json(cargoAtualizado);

  } catch (error: any) {
    console.error(`Erro ao atualizar cargo ${id}:`, error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return NextResponse.json({ error: 'Já existe um cargo com este nome' }, { status: 409 });
    }
    if (error.code === 'P2025') { 
        return NextResponse.json({ error: 'Cargo não encontrado para atualização' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro interno ao atualizar cargo' }, { status: 500 });
  }
}

// --- DELETE: Excluir um Cargo por ID ---
export async function DELETE(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  // TODO: Verificação de permissão

  const { id } = params;

  try {
    // Exclusão no banco
    // ATENÇÃO: Se houver funcionários vinculados, isso falhará devido ao onDelete: SetNull no schema do User.
    // A exclusão ocorrerá, mas os funcionários ficarão com roleId = null.
    // Se a regra de negócio exigir impedir a exclusão, adicione uma verificação aqui.
    // Ex: const usersWithRole = await prisma.user.count({ where: { roleId: id }});
    //     if (usersWithRole > 0) throw new Error('Existem funcionários vinculados');

    await prisma.role.delete({
      where: { id: id },
    });

    console.log(`Cargo excluído do DB: ${id}`);
    return NextResponse.json({ message: 'Cargo excluído com sucesso' }, { status: 200 }); 

  } catch (error: any) {
    console.error(`Erro ao excluir cargo ${id}:`, error);
     if (error.code === 'P2025') { 
        return NextResponse.json({ error: 'Cargo não encontrado para exclusão' }, { status: 404 });
    }
    // Adicionar tratamento para erro P2003 (Foreign Key) se necessário, dependendo da sua regra de negócio
    // if (error.code === 'P2003' && error.message.includes('User')) { ... }
    return NextResponse.json({ error: 'Erro interno ao excluir cargo' }, { status: 500 });
  }
}