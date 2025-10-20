// src/app/api/funcionarios/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
// Não precisamos mais de bcrypt aqui, pois não alteramos senha via PUT padrão

interface Params {
  params: { id: string };
}

// --- GET: Obter um Funcionário por ID ---
export async function GET(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  // TODO: Verificação de permissão (ex: pode ver dados de outros?)

  const { id } = params;

  try {
    const funcionario = await prisma.user.findUnique({
      where: { id: id },
      // Seleciona os campos para retornar (NÃO incluir passwordHash)
      select: {
        id: true, name: true, email: true, isActive: true, admissionDate: true,
        phone: true, cpf: true, rg: true, birthDate: true, address: true,
        roleId: true, // Retorna o ID do cargo para preencher o form
        // Opcional: incluir nome do cargo/depto se precisar exibir na edição
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
  // TODO: Verificação de permissão (ex: pode editar a si mesmo? pode editar outros?)

  const { id } = params;

  try {
    const body = await request.json();
    // NÃO recebemos 'password' aqui. A alteração de senha deve ser um endpoint/processo separado.
    const { 
        name, 
        email, 
        roleId, 
        admissionDate, 
        phone, 
        cpf, 
        rg, 
        birthDate, 
        address, 
        isActive 
    } = body;

    // Validação
    if (!name || !email || !roleId || !admissionDate) {
      return NextResponse.json({ error: 'Nome, Email, Cargo e Data de Admissão são obrigatórios' }, { status: 400 });
    }
     // Verifica se o cargo existe
    const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
    if (!roleExists) {
        return NextResponse.json({ error: 'Cargo inválido ou não encontrado' }, { status: 400 });
    }

    // Atualização no banco (SEM passwordHash)
    const funcionarioAtualizado = await prisma.user.update({
      where: { id: id },
      data: {
        name: name,
        email: email,
        roleId: roleId,
        admissionDate: new Date(admissionDate),
        phone: phone,
        cpf: cpf,
        rg: rg,
        birthDate: birthDate ? new Date(birthDate) : null,
        address: address,
        isActive: isActive,
      },
       select: { // Retorna dados atualizados (sem hash)
        id: true, name: true, email: true, isActive: true, admissionDate: true, roleId: true
      }
    });

    console.log("Funcionário atualizado no DB:", funcionarioAtualizado);
    return NextResponse.json(funcionarioAtualizado);

  } catch (error: any) {
    console.error(`Erro ao atualizar funcionário ${id}:`, error);
    if (error.code === 'P2002') { // Erro de constraint única (email ou cpf)
        const target = error.meta?.target as string[];
         if (target?.includes('email')) {
             return NextResponse.json({ error: 'Já existe outro funcionário com este email' }, { status: 409 });
        }
         if (target?.includes('cpf')) {
             return NextResponse.json({ error: 'Já existe outro funcionário com este CPF' }, { status: 409 });
        }
    }
    if (error.code === 'P2025') { 
        return NextResponse.json({ error: 'Funcionário não encontrado para atualização' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro interno ao atualizar funcionário' }, { status: 500 });
  }
}

// --- DELETE: Excluir um Funcionário por ID ---
export async function DELETE(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  // TODO: Verificação de permissão (ex: não pode excluir a si mesmo? só admin?)

  const { id } = params;

   // Impedir auto-exclusão (exemplo)
   if (session.user?.id === id) {
       return NextResponse.json({ error: 'Você não pode excluir sua própria conta.' }, { status: 403 });
   }

  try {
    // Exclusão no banco
    // A exclusão de User pode ter implicações se ele for chave estrangeira em outras tabelas (Logs, Projetos etc.)
    // Pode ser melhor apenas desativar (isActive = false)
    /*
    await prisma.user.delete({
      where: { id: id },
    });
    */
    // Alternativa: Desativar em vez de excluir
     const usuarioDesativado = await prisma.user.update({
         where: { id: id },
         data: { isActive: false },
         select: { id: true, isActive: true } // Retorna apenas o necessário
     });

    console.log(`Funcionário desativado no DB: ${id}`);
    // return NextResponse.json({ message: 'Funcionário excluído com sucesso' }, { status: 200 }); 
    return NextResponse.json({ message: 'Funcionário desativado com sucesso' }, { status: 200 }); 


  } catch (error: any) {
    console.error(`Erro ao excluir/desativar funcionário ${id}:`, error);
     if (error.code === 'P2025') { 
        return NextResponse.json({ error: 'Funcionário não encontrado para exclusão/desativação' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro interno ao excluir/desativar funcionário' }, { status: 500 });
  }
}