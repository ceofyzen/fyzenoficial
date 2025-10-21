// src/app/api/funcionarios/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcrypt';

const saltRounds = 10;

// --- GET: Listar todos os Funcionários ---
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const funcionarios = await prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true, // Incluir imagem
        isActive: true,
        admissionDate: true,
        phone: true,
        salary: true, // Incluir salário
        cpf: true,    // Incluir CPF
        rg: true,     // Incluir RG
        birthDate: true, // Incluir Data Nasc
        address: true, // Incluir Endereço
        role: {
          select: {
            id: true,
            name: true,
            department: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });
    return NextResponse.json(funcionarios);
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
    // Este é o erro que o seu frontend está a receber
    return NextResponse.json({ error: 'Erro interno ao buscar funcionários' }, { status: 500 });
  }
}

// --- POST: Criar um Novo Funcionário ---
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
        name, email, password, roleId, admissionDate, phone, cpf, rg,
        birthDate, address, isActive,
        salary // Receber o salário
    } = body;

    if (!name || !email || !roleId || !admissionDate) {
      return NextResponse.json({ error: 'Nome, Email, Cargo e Data de Admissão são obrigatórios' }, { status: 400 });
    }

    const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
    if (!roleExists) {
        return NextResponse.json({ error: 'Cargo inválido ou não encontrado' }, { status: 400 });
    }

    let passwordHash = null;
    if (password) {
        passwordHash = await bcrypt.hash(password, saltRounds);
    } else {
        console.warn(`Criando usuário ${email} sem senha inicial.`);
    }

    const salaryValue = salary ? parseFloat(salary) : null;
    if (salary && isNaN(salaryValue as any)) {
      return NextResponse.json({ error: 'Valor do salário inválido.' }, { status: 400 });
    }

    const novoFuncionario = await prisma.user.create({
      data: {
        name: name,
        email: email,
        passwordHash: passwordHash,
        roleId: roleId,
        admissionDate: new Date(admissionDate),
        phone: phone || null,
        cpf: cpf || null,
        rg: rg || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        address: address || null,
        isActive: isActive !== undefined ? isActive : true,
        salary: salaryValue, // Salvar o salário
      },
      select: {
        id: true, name: true, email: true, isActive: true, admissionDate: true, roleId: true, salary: true
      }
    });

    console.log("Novo funcionário criado no DB:", novoFuncionario);
    return NextResponse.json(novoFuncionario, { status: 201 });

  } catch (error: any) {
    console.error("Erro ao criar funcionário:", error);
    if (error.code === 'P2002') {
        const target = error.meta?.target as string[];
        if (target?.includes('email')) { return NextResponse.json({ error: 'Já existe um funcionário com este email' }, { status: 409 }); }
        if (target?.includes('cpf')) { return NextResponse.json({ error: 'Já existe um funcionário com este CPF' }, { status: 409 }); }
    }
    return NextResponse.json({ error: 'Erro interno ao criar funcionário' }, { status: 500 });
  }
}