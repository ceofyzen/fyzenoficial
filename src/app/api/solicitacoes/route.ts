// src/app/api/solicitacoes/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { Prisma, SolicitacaoStatus, SolicitacaoTipo } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  // TODO: Adicionar verificação de permissão (ex: só RH ou Diretor podem ver todas?)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as SolicitacaoStatus | null;
  const tipo = searchParams.get('tipo') as SolicitacaoTipo | null;
  const search = searchParams.get('search');

  const whereClause: Prisma.SolicitacaoWhereInput = {};

  if (status && Object.values(SolicitacaoStatus).includes(status)) {
    whereClause.status = status;
  }
  if (tipo && Object.values(SolicitacaoTipo).includes(tipo)) {
    whereClause.tipo = tipo;
  }
  if (search) {
    whereClause.user = {
      name: {
        contains: search,
        mode: 'insensitive', // Busca case-insensitive
      },
    };
  }

  // --- Lógica de Permissão (Exemplo) ---
  // Se o usuário não for Diretor ou do RH (você precisa adaptar essa lógica baseada nos seus cargos/módulos)
  // if (session.user.roleName !== 'Chief Executive Officer' && session.user.accessModule !== 'RH') {
  //   // Filtra para mostrar apenas as solicitações do próprio usuário (se aplicável)
  //   whereClause.userId = session.user.id;
  //   // Ou nega o acesso completamente se esta rota for só para admin/RH
  //   // return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  // }
  // --- Fim Lógica de Permissão ---


  try {
    const solicitacoes = await prisma.solicitacao.findMany({
      where: whereClause,
      include: {
        user: { // Inclui dados do usuário que solicitou
          select: {
            id: true,
            name: true,
            role: { select: { name: true } } // Pega o nome do cargo
          }
        }
        // Incluir processedBy se você adicionou o relacionamento
        // processedBy: { select: { id: true, name: true } }
      },
      orderBy: [
        { status: 'asc' }, // Pendentes primeiro
        { createdAt: 'desc' } // Mais recentes primeiro dentro do status
      ]
    });

    // Formata os dados para incluir userName e userRole no nível raiz
    const resultadoFormatado = solicitacoes.map(sol => ({
      ...sol,
      userName: sol.user?.name || null,
      userRole: sol.user?.role?.name || null,
      // user: undefined, // Remove o objeto user aninhado se não precisar mais dele no frontend
    }));


    return NextResponse.json(resultadoFormatado);

  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Erro interno ao buscar solicitações', details: errorMessage }, { status: 500 });
  }
}

// --- POST: Criar Nova Solicitação (será usado pela página do funcionário) ---
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const currentUserId = session.user.id;

  try {
    const body = await request.json();
    const { tipo, dataInicio, dataFim, justificativa } = body;

    // Validações básicas
    if (!tipo || !dataInicio || !dataFim) {
      return NextResponse.json({ error: 'Tipo, Data de Início e Data de Fim são obrigatórios.' }, { status: 400 });
    }
    if (!Object.values(SolicitacaoTipo).includes(tipo as SolicitacaoTipo)) {
      return NextResponse.json({ error: 'Tipo de solicitação inválido.' }, { status: 400 });
    }
    const dtInicio = new Date(dataInicio);
    const dtFim = new Date(dataFim);
    if (isNaN(dtInicio.getTime()) || isNaN(dtFim.getTime())) {
      return NextResponse.json({ error: 'Datas inválidas.' }, { status: 400 });
    }
    if (dtFim < dtInicio) {
      return NextResponse.json({ error: 'A Data de Fim não pode ser anterior à Data de Início.' }, { status: 400 });
    }

    const novaSolicitacao = await prisma.solicitacao.create({
      data: {
        userId: currentUserId,
        tipo: tipo as SolicitacaoTipo,
        dataInicio: dtInicio,
        dataFim: dtFim,
        justificativa: justificativa || null,
        status: SolicitacaoStatus.PENDENTE, // Sempre começa como pendente
      },
       include: { user: { select: { name: true, role: {select: {name: true}} } } } // Retorna dados formatados
    });

     const resultadoFormatado = {
        ...novaSolicitacao,
        userName: novaSolicitacao.user?.name || null,
        userRole: novaSolicitacao.user?.role?.name || null,
     };

    return NextResponse.json(resultadoFormatado, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Erro interno ao criar solicitação', details: errorMessage }, { status: 500 });
  }
}