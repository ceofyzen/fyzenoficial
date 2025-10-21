// src/app/api/funcionarios/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { UserStatus } from '@prisma/client';

// Helper getIdFromUrl (sem alteração)
function getIdFromUrl(url: string): string | null {
    try {
        const pathSegments = new URL(url).pathname.split('/');
        const id = pathSegments[pathSegments.length - 1];
        return id || null;
    } catch (e) {
        console.error("Erro ao extrair ID da URL:", e);
        return null;
    }
}


// --- GET: Obter um Funcionário por ID ---
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) { // Verifica user
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const id = getIdFromUrl(request.url);
  if (!id) {
      console.error("GET /api/funcionarios/[id] - Não foi possível extrair o ID da URL:", request.url);
      return NextResponse.json({ error: 'ID inválido na requisição' }, { status: 400 });
  }

  console.log(`GET /api/funcionarios/${id} - Iniciando busca`);

  try {
    const funcionario = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true, name: true, email: true,
        status: true,
        admissionDate: true,
        phone: true, cpf: true, rg: true, birthDate: true,
        cep: true, logradouro: true, numero: true, complemento: true, bairro: true, cidade: true, estado: true, pais: true,
        salary: true,
        image: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            departmentId: true,
            department: { select: { name: true } }
          }
        },
        managerId: true,
        manager: { select: { id: true, name: true } }
      }
    });

    if (!funcionario) {
      console.log(`GET /api/funcionarios/${id} - Funcionário não encontrado`);
      return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 });
    }
    console.log(`GET /api/funcionarios/${id} - Funcionário encontrado:`, funcionario.name);
    return NextResponse.json(funcionario);

  } catch (error) {
    console.error(`Erro ao buscar funcionário ${id}:`, error);
    console.error("Detalhes do Erro (GET /api/funcionarios/[id]):", JSON.stringify(error));
    return NextResponse.json({ error: 'Erro interno ao buscar funcionário' }, { status: 500 });
  }
}

// --- PUT: Atualizar um Funcionário por ID ---
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
   if (!session?.user) { // Verifica user
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const id = getIdFromUrl(request.url);
  if (!id) {
      console.error("PUT /api/funcionarios/[id] - Não foi possível extrair o ID da URL:", request.url);
      return NextResponse.json({ error: 'ID inválido na requisição' }, { status: 400 });
  }

  console.log(`PUT /api/funcionarios/${id} - Iniciando atualização`);

  const body = await request.json();

  // Usa Type Assertion aqui também para consistência
  if ((session.user as { id?: string })?.id === id && body.status === UserStatus.Inativo) {
     console.warn(`PUT /api/funcionarios/${id} - Tentativa de auto-inativação bloqueada`);
     return NextResponse.json({ error: 'Você não pode inativar sua própria conta.' }, { status: 403 });
  }

  try {
    const {
        name, email, roleId, admissionDate, phone, cpf, rg,
        birthDate,
        cep, logradouro, numero, complemento, bairro, cidade, estado, pais,
        status,
        managerId,
        salary,
        image
    } = body;

    // ... (validações) ...
     if (!name || !email || !roleId || !admissionDate || !status) { return NextResponse.json({ error: 'Nome, Email, Cargo, Data de Admissão e Status são obrigatórios' }, { status: 400 }); }
     const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
     if (!roleExists) { return NextResponse.json({ error: 'Cargo inválido ou não encontrado' }, { status: 400 }); }
     if (!Object.values(UserStatus).includes(status as UserStatus)) { return NextResponse.json({ error: 'Status inválido' }, { status: 400 }); }
     let finalManagerId: string | null = null;
     if (managerId && typeof managerId === 'string' && managerId.trim() !== '') {
         if (managerId === id) { return NextResponse.json({ error: 'Um funcionário não pode ser seu próprio gestor.' }, { status: 400 }); }
         const managerExists = await prisma.user.findUnique({ where: { id: managerId }});
         if (!managerExists) { return NextResponse.json({ error: 'Gestor selecionado inválido ou não encontrado' }, { status: 400 }); }
         finalManagerId = managerId;
     }
     const salaryValue = salary ? parseFloat(salary) : null;
      if (salary && isNaN(salaryValue as any)) { return NextResponse.json({ error: 'Valor do salário inválido.' }, { status: 400 }); }


    const funcionarioAtualizado = await prisma.user.update({
      where: { id: id },
      data: {
        name, email, roleId,
        admissionDate: new Date(admissionDate),
        phone: phone || null, cpf: cpf || null, rg: rg || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        cep: cep || null, logradouro: logradouro || null, numero: numero || null, complemento: complemento || null, bairro: bairro || null, cidade: cidade || null, estado: estado || null, pais: pais || 'Brasil',
        status: status as UserStatus,
        managerId: finalManagerId,
        salary: salaryValue,
        image: image || null,
      },
       select: {
        id: true, name: true, email: true, status: true, admissionDate: true, roleId: true, salary: true, managerId: true, image: true,
        cep: true, logradouro: true, numero: true, complemento: true, bairro: true, cidade: true, estado: true, pais: true,
      }
    });

    console.log(`PUT /api/funcionarios/${id} - Funcionário atualizado:`, funcionarioAtualizado.name);
    return NextResponse.json(funcionarioAtualizado);

  } catch (error: any) {
    console.error(`Erro ao atualizar funcionário ${id}:`, error);
     if (error.code === 'P2002') { const target = error.meta?.target as string[]; if (target?.includes('email')) { return NextResponse.json({ error: 'Já existe outro funcionário com este email' }, { status: 409 }); } if (target?.includes('cpf')) { return NextResponse.json({ error: 'Já existe outro funcionário com este CPF' }, { status: 409 }); } }
     if (error.code === 'P2025') { return NextResponse.json({ error: 'Funcionário não encontrado para atualização' }, { status: 404 }); }
     console.error("Detalhes do Erro (PUT /api/funcionarios/[id]):", JSON.stringify(error));
    return NextResponse.json({ error: 'Erro interno ao atualizar funcionário' }, { status: 500 });
  }
}

// --- DELETE: MUDOU PARA DESATIVAR (SETAR STATUS INATIVO) ---
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
   if (!session?.user) { // Verifica também se user existe
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const id = getIdFromUrl(request.url);
  if (!id) {
      console.error("DELETE /api/funcionarios/[id] - Não foi possível extrair o ID da URL:", request.url);
      return NextResponse.json({ error: 'ID inválido na requisição' }, { status: 400 });
  }

  console.log(`DELETE /api/funcionarios/${id} - Iniciando inativação`);

  // Impedir auto-desativação (CORREÇÃO COM TYPE ASSERTION)
  // Explicitamente dizemos ao TS que esperamos um objeto com 'id' (opcional)
  if ((session.user as { id?: string })?.id === id) {
       console.warn(`DELETE /api/funcionarios/${id} - Tentativa de auto-inativação bloqueada`);
       return NextResponse.json({ error: 'Você não pode desativar sua própria conta.' }, { status: 403 });
   }

  try {
     const usuarioInativado = await prisma.user.update({
         where: { id: id },
         data: { status: UserStatus.Inativo },
         select: { id: true, status: true }
     });

    console.log(`DELETE /api/funcionarios/${id} - Status alterado para Inativo.`);
    return NextResponse.json({ message: 'Funcionário desativado com sucesso' }, { status: 200 });

  } catch (error: any) {
     console.error(`Erro ao desativar funcionário ${id}:`, error);
     if (error.code === 'P2025') {
        console.log(`DELETE /api/funcionarios/${id} - Funcionário não encontrado`);
        return NextResponse.json({ error: 'Funcionário não encontrado para desativação' }, { status: 404 });
    }
     console.error("Detalhes do Erro (DELETE /api/funcionarios/[id]):", JSON.stringify(error));
    return NextResponse.json({ error: 'Erro interno ao desativar funcionário' }, { status: 500 });
  }
}