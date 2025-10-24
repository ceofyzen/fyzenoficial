// src/app/api/permissions/definitions/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { Prisma } from '@prisma/client'; // Importar Prisma

// --- GET (Existente - sem alterações) ---
export async function GET(request: NextRequest) {
  // ... (código GET existente) ...
  const session = await getServerSession(authOptions);
  // Apenas utilizadores autenticados podem ver as definições
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const definitions = await prisma.permissionDefinition.findMany({
      orderBy: [
        { category: 'asc' }, // Agrupa por categoria
        { action: 'asc' },   // Ordena alfabeticamente dentro da categoria
      ],
      select: {
        id: true, // Adicionar ID para edição/exclusão futura no frontend
        action: true,
        category: true,
        description: true,
      },
    });

    // Agrupar por categoria para facilitar o frontend
    const groupedDefinitions: { [category: string]: { id: string; action: string; description: string }[] } = {};
    definitions.forEach(def => {
      if (!groupedDefinitions[def.category]) {
        groupedDefinitions[def.category] = [];
      }
      groupedDefinitions[def.category].push({ id: def.id, action: def.action, description: def.description });
    });

    return NextResponse.json(groupedDefinitions);

  } catch (error) {
    console.error("Erro ao buscar definições de permissão:", error);
    return NextResponse.json({ error: 'Erro interno ao buscar definições' }, { status: 500 });
  }
}


// --- POST: Criar Nova Definição de Permissão ---
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    // APENAS ROLES ESPECÍFICAS PODEM CRIAR DEFINIÇÕES
    const allowedRoles = ['Diretor Executivo (CEO)', 'Diretor Operacional (COO)']; // Ajuste conforme necessário
    const userRole = session?.user?.roleName || '';
    if (!session?.user?.id || !allowedRoles.includes(userRole)) {
        return NextResponse.json({ error: 'Acesso negado. Permissão insuficiente.' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { action, category, description } = body;

        // Validações
        if (!action || !category || !description) {
            return NextResponse.json({ error: 'Ação, Categoria e Descrição são obrigatórios.' }, { status: 400 });
        }
        if (typeof action !== 'string' || typeof category !== 'string' || typeof description !== 'string') {
             return NextResponse.json({ error: 'Tipos de dados inválidos.' }, { status: 400 });
        }
        if (!/^[a-z0-9_:]+$/.test(action)) {
             return NextResponse.json({ error: 'Ação deve conter apenas letras minúsculas, números, underscores (_) e dois pontos (:).' }, { status: 400 });
        }


        const newDefinition = await prisma.permissionDefinition.create({
            data: {
                action: action.trim(),
                category: category.trim(),
                description: description.trim(),
            },
        });

        console.log(`Nova definição de permissão criada: ${newDefinition.action}`);
        return NextResponse.json(newDefinition, { status: 201 });

    } catch (error) {
        console.error("Erro ao criar definição de permissão:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            // P2002 é erro de constraint única (neste caso, 'action')
            return NextResponse.json({ error: `A ação "${error.meta?.target}" já existe.` }, { status: 409 }); // Conflict
        }
        return NextResponse.json({ error: 'Erro interno ao criar definição' }, { status: 500 });
    }
}