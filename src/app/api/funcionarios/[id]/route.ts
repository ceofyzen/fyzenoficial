// src/app/api/funcionarios/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

interface Params {
  params: { id: string };
}

// --- GET: Obter um Funcionário por ID ---
export async function GET(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = params;

  try {
    const funcionario = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true, name: true, email: true, isActive: true, admissionDate: true,
        phone: true, cpf: true, rg: true, birthDate: true, address: true,
        salary: true, // Incluir salário
        roleId: true,
        role: { select: { name: true, department: { select: { name: true } } } }
      }
    });

    if (!funcionario) {
      return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 });
    }
    return NextResponse.json(funcionario);

  } catch (error) {
    console.error(`Erro ao buscar funcionário ${id}:`, error);
    return NextResponse.json({ error: 'Erro interno ao buscar funcionário' }, { status: 500 });
  }
}

// --- PUT: Atualizar um Funcionário por ID ---
export async function PUT(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await request.json();
    const {
        name, email, roleId, admissionDate, phone, cpf, rg,
        birthDate, address, isActive,
        salary // Receber salário na atualização
    } = body;

    if (!name || !email || !roleId || !admissionDate) {
      return NextResponse.json({ error: 'Nome, Email, Cargo e Data de Admissão são obrigatórios' }, { status: 400 });
    }
    const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
    if (!roleExists) {
        return NextResponse.json({ error: 'Cargo inválido ou não encontrado' }, { status: 400 });
    }

    // Tenta converter salary para Float, define null se inválido ou ausente
    const salaryValue = salary ? parseFloat(salary) : null;
     if (salary && isNaN(salaryValue as any)) {
      return NextResponse.json({ error: 'Valor do salário inválido.' }, { status: 400 });
    }

    const funcionarioAtualizado = await prisma.user.update({
      where: { id: id },
      data: {
        name: name,
        email: email,
        roleId: roleId,
        admissionDate: new Date(admissionDate),
        phone: phone || null,
        cpf: cpf || null,
        rg: rg || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        address: address || null,
        isActive: isActive,
        salary: salaryValue, // Atualizar salário
      },
       select: {
        id: true, name: true, email: true, isActive: true, admissionDate: true, roleId: true, salary: true // Retornar salário atualizado
      }
    });

    console.log("Funcionário atualizado no DB:", funcionarioAtualizado);
    return NextResponse.json(funcionarioAtualizado);

  } catch (error: any) {
    console.error(`Erro ao atualizar funcionário ${id}:`, error);
    if (error.code === 'P2002') {
        const target = error.meta?.target as string[];
         if (target?.includes('email')) { return NextResponse.json({ error: 'Já existe outro funcionário com este email' }, { status: 409 }); }
         if (target?.includes('cpf')) { return NextResponse.json({ error: 'Já existe outro funcionário com este CPF' }, { status: 409 }); }
    }
    if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Funcionário não encontrado para atualização' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro interno ao atualizar funcionário' }, { status: 500 });
  }
}

// --- DELETE: Desativar um Funcionário por ID --- (sem alterações)
export async function DELETE(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  if (session.user?.id === params.id) {
       return NextResponse.json({ error: 'Você não pode desativar sua própria conta.' }, { status: 403 });
   }

  const { id } = params;

  try {
     const usuarioDesativado = await prisma.user.update({
         where: { id: id },
         data: { isActive: false },
         select: { id: true, isActive: true }
     });

    console.log(`Funcionário desativado no DB: ${id}`);
    return NextResponse.json({ message: 'Funcionário desativado com sucesso' }, { status: 200 });

  } catch (error: any) {
    console.error(`Erro ao desativar funcionário ${id}:`, error);
     if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Funcionário não encontrado para desativação' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro interno ao desativar funcionário' }, { status: 500 });
  }
}