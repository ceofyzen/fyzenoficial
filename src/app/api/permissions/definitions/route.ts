// src/app/api/permissions/definitions/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  // Apenas utilizadores autenticados podem ver as definições
  // (Poderia restringir a Diretores, mas o painel em si já é protegido)
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
        action: true,
        category: true,
        description: true,
      },
    });

    // Agrupar por categoria para facilitar o frontend (como no GIF)
    const groupedDefinitions: { [category: string]: { action: string; description: string }[] } = {};
    definitions.forEach(def => {
      if (!groupedDefinitions[def.category]) {
        groupedDefinitions[def.category] = [];
      }
      groupedDefinitions[def.category].push({ action: def.action, description: def.description });
    });

    return NextResponse.json(groupedDefinitions);

  } catch (error) {
    console.error("Erro ao buscar definições de permissão:", error);
    return NextResponse.json({ error: 'Erro interno ao buscar definições' }, { status: 500 });
  }
}