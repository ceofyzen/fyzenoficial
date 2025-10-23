// src/app/api/ponto/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { Prisma, PontoTipo } from '@prisma/client';

// --- GET: Listar Registros de Ponto com Filtros ---
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const inicio = searchParams.get('inicio');
  const fim = searchParams.get('fim');
  const userId = searchParams.get('userId');

  console.log(`GET /api/ponto - Filtros recebidos: inicio=${inicio}, fim=${fim}, userId=${userId}`);

  const whereClause: Prisma.PontoRegistroWhereInput = {};

  if (userId && userId !== 'all') {
    whereClause.userId = userId;
  }

  const dateFilters: Prisma.DateTimeFilter = {};
  if (inicio) {
    try {
      dateFilters.gte = new Date(`${inicio}T00:00:00.000Z`);
    } catch (e) {
      console.warn("Data de início inválida:", inicio);
      return NextResponse.json({ error: 'Formato da data de início inválido. Use YYYY-MM-DD.' }, { status: 400 });
    }
  }
  if (fim) {
    try {
      dateFilters.lte = new Date(`${fim}T23:59:59.999Z`);
    } catch (e) {
      console.warn("Data de fim inválida:", fim);
      return NextResponse.json({ error: 'Formato da data de fim inválido. Use YYYY-MM-DD.' }, { status: 400 });
    }
  }

  if (Object.keys(dateFilters).length > 0) {
    whereClause.timestamp = dateFilters;
  }

  try {
    // ✅ CORRIGIDO: pontoRegistro com 'p' minúsculo
    const registros = await prisma.pontoRegistro.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    const resultadoFormatado = registros.map(reg => ({
      ...reg,
      userName: reg.user?.name || null
    }));

    console.log(`GET /api/ponto - Encontrados ${resultadoFormatado.length} registros.`);
    return NextResponse.json(resultadoFormatado);

  } catch (error) {
    console.error("Erro ao buscar registros de ponto:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json({ error: `Erro no banco de dados: ${error.code}`, details: error.message }, { status: 500 });
    }
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Erro interno ao buscar registros de ponto', details: errorMessage }, { status: 500 });
  }
}

// --- POST: Adicionar Registro Manual ---
export async function POST(request: NextRequest) {
   const session = await getServerSession(authOptions);
   if (!session?.user?.id) {
     return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
   }

   try {
     const body = await request.json();
     const { userId, timestamp, type: pontoType, justificativa } = body;

     if (!userId || !timestamp || !pontoType) {
         return NextResponse.json({ error: 'Campos userId, timestamp e type são obrigatórios.' }, { status: 400 });
     }
     if (pontoType !== PontoTipo.ENTRADA && pontoType !== PontoTipo.SAIDA) {
         return NextResponse.json({ error: 'O tipo deve ser "ENTRADA" ou "SAIDA".' }, { status: 400 });
     }

     // ✅ CORRIGIDO: pontoRegistro com 'p' minúsculo
     const registroManual = await prisma.pontoRegistro.create({
         data: {
             userId: userId,
             timestamp: new Date(timestamp),
             type: pontoType,
             source: 'MANUAL',
             justificativa: justificativa || null,
         },
         include: { user: { select: { name: true } } }
     });

      const resultadoFormatado = {
        ...registroManual,
        userName: registroManual.user?.name || null
     };

     console.log("POST /api/ponto - Registro manual criado:", resultadoFormatado.id);
     return NextResponse.json(resultadoFormatado, { status: 201 });

   } catch (error) {
     console.error("Erro ao criar registro de ponto manual:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
           if (error.meta?.field_name?.toString().includes('userId')) {
              return NextResponse.json({ error: 'Funcionário não encontrado.' }, { status: 400 });
           }
      }
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return NextResponse.json({ error: 'Erro interno ao criar registro manual', details: errorMessage }, { status: 500 });
   }
}