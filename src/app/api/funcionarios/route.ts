// src/app/api/funcionarios/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcrypt';
import { UserStatus } from '@prisma/client'; // Importar o Enum UserStatus

const saltRounds = 10;

// --- GET: Listar todos os Funcionários ---
// (Não recebe 'params' aqui)
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
        image: true,
        status: true,
        admissionDate: true,
        phone: true,
        salary: true,
        cpf: true,
        rg: true,
        birthDate: true,
        cep: true,
        logradouro: true,
        numero: true,
        complemento: true,
        bairro: true,
        cidade: true,
        estado: true,
        pais: true,
        role: {
          select: {
            id: true,
            name: true,
            department: {
              select: { id: true, name: true }
            }
          }
        },
        manager: {
          select: {
            id: true,
            name: true
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
// (Não recebe 'params' aqui)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
        name, email, password, roleId, admissionDate, phone, cpf, rg,
        birthDate,
        cep, logradouro, numero, complemento, bairro, cidade, estado, pais,
        status,
        managerId,
        salary,
        image
    } = body;

    // Validação de campos obrigatórios
    if (!name || !email || !roleId || !admissionDate) {
      return NextResponse.json({ error: 'Nome, Email, Cargo e Data de Admissão são obrigatórios' }, { status: 400 });
    }

    const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
    if (!roleExists) {
        return NextResponse.json({ error: 'Cargo inválido ou não encontrado' }, { status: 400 });
    }

    if (status && !Object.values(UserStatus).includes(status as UserStatus)) {
        return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    if (managerId && typeof managerId === 'string' && managerId.trim() !== '') {
        const managerExists = await prisma.user.findUnique({ where: { id: managerId }});
        if (!managerExists) {
            return NextResponse.json({ error: 'Gestor selecionado inválido ou não encontrado' }, { status: 400 });
        }
    }

    let passwordHash = null;
    if (password && typeof password === 'string' && password.length > 0) {
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
        cep: cep || null,
        logradouro: logradouro || null,
        numero: numero || null,
        complemento: complemento || null,
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
        pais: pais || 'Brasil',
        status: status ? status as UserStatus : UserStatus.Ativo,
        managerId: managerId || null,
        salary: salaryValue,
        image: image || null
      },
      select: { 
        id: true, name: true, email: true, status: true, admissionDate: true, roleId: true, salary: true, managerId: true, image: true,
        cep: true, logradouro: true, numero: true, complemento: true, bairro: true, cidade: true, estado: true, pais: true
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
    console.error("Detalhes do Erro (POST /api/funcionarios):", JSON.stringify(error));
    return NextResponse.json({ error: 'Erro interno ao criar funcionário' }, { status: 500 });
  }
}