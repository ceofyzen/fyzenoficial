// src/app/api/departamentos/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
// Importamos o TIPO ModuloEnum. O objeto com os valores também vem junto.
import { ModuloEnum } from '@prisma/client'; 

// --- GET: Listar todos os Departamentos (COM CONTAGEM DE FUNCIONÁRIOS) ---
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    // 1. Busca os departamentos
    const departamentos = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        // 2. Inclui os cargos (roles) de cada departamento
        roles: {
          select: {
            // 3. Para cada cargo, conta quantos usuários (users) estão ligados a ele
            _count: {
              select: { users: true }
            }
          }
        }
      }
    });

    // 4. Mapeia os resultados para calcular o total de usuários por departamento
    const departamentosComContagem = departamentos.map(depto => {
      // 5. Soma a contagem de usuários de todos os cargos dentro deste departamento
      const totalUsers = depto.roles.reduce((acc, role) => acc + role._count.users, 0);
      
      const { roles, ...rest } = depto; // Remove o array 'roles' desnecessário
      
      return {
        ...rest, // Retorna os dados normais (id, name, description, accessModule)
        userCount: totalUsers // Adiciona o novo campo com a contagem total
      };
    });

    return NextResponse.json(departamentosComContagem); // Retorna os dados processados

  } catch (error) {
    console.error("Erro ao buscar departamentos:", error);
    return NextResponse.json({ error: 'Erro interno ao buscar departamentos' }, { status: 500 });
  }
}

// --- POST: Criar um Novo Departamento ---
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
   if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, accessModule, description } = body;

    if (!name || !accessModule) {
      return NextResponse.json({ error: 'Nome e Módulo de Acesso são obrigatórios' }, { status: 400 });
    }

    if (!Object.keys(ModuloEnum).includes(accessModule)) {
       return NextResponse.json({ error: 'Módulo de Acesso inválido' }, { status: 400 });
    }

    const novoDepartamento = await prisma.department.create({
      data: {
        name: name,
        accessModule: accessModule as ModuloEnum,
        description: description || null, 
      },
    });

    console.log("Novo departamento criado no DB:", novoDepartamento);
    return NextResponse.json(novoDepartamento, { status: 201 });

  } catch (error: any) {
    console.error("Erro ao criar departamento:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        return NextResponse.json({ error: 'Já existe um departamento com este nome' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro interno ao criar departamento' }, { status: 500 });
  }
}