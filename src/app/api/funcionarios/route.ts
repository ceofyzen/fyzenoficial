// src/app/api/funcionarios/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Cliente Prisma
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Opções de autenticação
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcrypt'; // Para hash de senha

const saltRounds = 10; // Fator de custo para o hash bcrypt

// --- GET: Listar todos os Funcionários ---
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  // TODO: Adicionar verificação de permissão (ex: só RH/Diretoria pode listar todos?)

  try {
    const funcionarios = await prisma.user.findMany({
      orderBy: {
        name: 'asc', // Ordena por nome
      },
      // Seleciona os campos que queremos retornar (NÃO incluir passwordHash)
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        admissionDate: true,
        phone: true, // Incluindo telefone na listagem
        role: { // Inclui dados do cargo
          select: {
            id: true,
            name: true,
            department: { // Inclui dados do departamento via cargo
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    return NextResponse.json(funcionarios);
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
    return NextResponse.json({ error: 'Erro interno ao buscar funcionários' }, { status: 500 });
  }
}

// --- POST: Criar um Novo Funcionário ---
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  // TODO: Adicionar verificação de permissão (ex: só RH/Diretoria pode criar?)

  try {
    const body = await request.json();
    const { 
        name, // Mudado de nomeCompleto para name (padrão NextAuth)
        email, 
        password, // Senha PLANA vinda do formulário
        roleId, 
        admissionDate, 
        phone, 
        cpf, 
        rg, 
        birthDate, 
        address, 
        isActive 
    } = body;

    // Validação básica
    if (!name || !email || !roleId || !admissionDate) {
      return NextResponse.json({ error: 'Nome, Email, Cargo e Data de Admissão são obrigatórios' }, { status: 400 });
    }
    // Validar formato de email, data, etc. (Opcional, mas recomendado)

    // Verifica se o cargo existe
    const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
    if (!roleExists) {
        return NextResponse.json({ error: 'Cargo inválido ou não encontrado' }, { status: 400 });
    }

    // Gera o Hash da senha (SE ela foi fornecida)
    let passwordHash = null;
    if (password) {
        passwordHash = await bcrypt.hash(password, saltRounds);
    } else {
        // Define uma senha padrão ou gera uma aleatória se for obrigatória?
        // Ou retorna erro se senha não for fornecida? Depende da regra.
        // Por ora, vamos permitir criar sem senha, mas isso pode ser inseguro.
        console.warn(`Criando usuário ${email} sem senha inicial.`);
    }

    // Criação no banco
    const novoFuncionario = await prisma.user.create({
      data: {
        name: name,
        email: email,
        passwordHash: passwordHash, // Salva o HASH
        roleId: roleId,
        admissionDate: new Date(admissionDate), // Converte string de data para Date
        phone: phone,
        cpf: cpf,
        rg: rg,
        birthDate: birthDate ? new Date(birthDate) : null,
        address: address,
        isActive: isActive !== undefined ? isActive : true, // Default true se não especificado
      },
       // Seleciona os campos para retornar (SEM o hash da senha)
      select: { 
        id: true, name: true, email: true, isActive: true, admissionDate: true, roleId: true
        // Não retornar passwordHash
      } 
    });

    console.log("Novo funcionário criado no DB:", novoFuncionario);
    return NextResponse.json(novoFuncionario, { status: 201 });

  } catch (error: any) {
    console.error("Erro ao criar funcionário:", error);
    if (error.code === 'P2002') { // Erro de constraint única (email ou cpf)
        const target = error.meta?.target as string[];
        if (target?.includes('email')) {
             return NextResponse.json({ error: 'Já existe um funcionário com este email' }, { status: 409 });
        }
         if (target?.includes('cpf')) {
             return NextResponse.json({ error: 'Já existe um funcionário com este CPF' }, { status: 409 });
        }
    }
    return NextResponse.json({ error: 'Erro interno ao criar funcionário' }, { status: 500 });
  }
}