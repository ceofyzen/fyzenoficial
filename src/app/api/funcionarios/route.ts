// src/app/api/funcionarios/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcrypt';
import { UserStatus } from '@prisma/client'; // Importar o Enum UserStatus

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
        image: true,
        status: true,
        admissionDate: true,
        phone: true,
        salary: true,
        cpf: true,
        rg: true,
        birthDate: true,
        // --- SELECIONAR NOVOS CAMPOS DE ENDEREÇO ---
        cep: true,
        logradouro: true,
        numero: true,
        complemento: true,
        bairro: true,
        cidade: true,
        estado: true,
        pais: true,
        // --- FIM NOVOS CAMPOS ---
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
        // Remover address antigo, receber novos campos
        // address, << REMOVIDO
        cep, logradouro, numero, complemento, bairro, cidade, estado, pais, // << NOVOS CAMPOS RECEBIDOS
        status,
        managerId,
        salary,
        image // Receber imagem (URL já processada pelo frontend/API de upload)
    } = body;

    // Validação de campos obrigatórios
    if (!name || !email || !roleId || !admissionDate) {
      return NextResponse.json({ error: 'Nome, Email, Cargo e Data de Admissão são obrigatórios' }, { status: 400 });
    }

    const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
    if (!roleExists) {
        return NextResponse.json({ error: 'Cargo inválido ou não encontrado' }, { status: 400 });
    }

    // Validar Status (se fornecido)
    if (status && !Object.values(UserStatus).includes(status as UserStatus)) {
        return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    // Validar Gestor (se fornecido)
    if (managerId && typeof managerId === 'string' && managerId.trim() !== '') {
        const managerExists = await prisma.user.findUnique({ where: { id: managerId }});
        if (!managerExists) {
            return NextResponse.json({ error: 'Gestor selecionado inválido ou não encontrado' }, { status: 400 });
        }
    } else {
        // Garante que managerId seja null se for string vazia ou não fornecido
        // managerId = null; // Removido, pois o || null abaixo faz isso.
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
        // --- SALVAR NOVOS CAMPOS DE ENDEREÇO ---
        cep: cep || null,
        logradouro: logradouro || null,
        numero: numero || null,
        complemento: complemento || null,
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
        pais: pais || 'Brasil', // Usar default se não vier
        // --- FIM NOVOS CAMPOS ---
        status: status ? status as UserStatus : UserStatus.Ativo,
        managerId: managerId || null, // Garante null se for string vazia
        salary: salaryValue,
        image: image || null // Salva a URL da imagem
      },
      select: { // Retornar os novos campos também
        id: true, name: true, email: true, status: true, admissionDate: true, roleId: true, salary: true, managerId: true, image: true,
        cep: true, logradouro: true, numero: true, complemento: true, bairro: true, cidade: true, estado: true, pais: true // Retornar endereço
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
    // Adicionar log mais detalhado para outros erros
    console.error("Detalhes do Erro (POST /api/funcionarios):", JSON.stringify(error));
    return NextResponse.json({ error: 'Erro interno ao criar funcionário' }, { status: 500 });
  }
}