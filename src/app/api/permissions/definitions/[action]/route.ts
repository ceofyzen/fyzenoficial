// src/app/api/permissions/definitions/[action]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { Prisma } from '@prisma/client';

// Interface para tipar os parâmetros da rota
interface RouteParams {
  action: string;
}

// Interface para tipar o contexto completo (incluindo params)
// interface RouteContext {
//   params: RouteParams;
// }
// OBS: Não vamos mais usar RouteContext diretamente para params

const allowedRoles = ['Diretor Executivo (CEO)', 'Diretor Operacional (COO)']; // Ajuste conforme necessário

// --- PUT: Atualizar Descrição ou Categoria de uma Definição ---
// CORREÇÃO: Receber { params } diretamente no segundo argumento
export async function PUT(request: NextRequest, { params }: { params: RouteParams }) {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.roleName || '';
    if (!session?.user?.id || !allowedRoles.includes(userRole)) {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    // CORREÇÃO: Acessar params.action diretamente
    const actionName = params.action;
    if (!actionName) {
         // Esta verificação pode não ser estritamente necessária se a rota sempre tiver [action]
         return NextResponse.json({ error: 'Nome da ação não fornecido na URL.' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { category, description } = body;

        // Validar se pelo menos um campo foi enviado para atualização
        if (category === undefined && description === undefined) {
             return NextResponse.json({ error: 'Pelo menos Categoria ou Descrição deve ser fornecida para atualização.' }, { status: 400 });
        }
        if ((category && typeof category !== 'string') || (description && typeof description !== 'string')) {
             return NextResponse.json({ error: 'Tipos de dados inválidos.' }, { status: 400 });
        }


        const updatedDefinition = await prisma.permissionDefinition.update({
            where: { action: actionName },
            data: {
                // Atualiza apenas os campos que foram fornecidos
                ...(category !== undefined && { category: category.trim() }),
                ...(description !== undefined && { description: description.trim() }),
            },
        });

        console.log(`Definição de permissão atualizada: ${updatedDefinition.action}`);
        return NextResponse.json(updatedDefinition);

    } catch (error) {
        console.error(`Erro ao atualizar definição ${actionName}:`, error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            // P2025: Registro não encontrado para update
            return NextResponse.json({ error: `Definição com ação "${actionName}" não encontrada.` }, { status: 404 });
        }
        return NextResponse.json({ error: 'Erro interno ao atualizar definição' }, { status: 500 });
    }
}


// --- DELETE: Excluir uma Definição de Permissão ---
// CORREÇÃO: Receber { params } diretamente no segundo argumento
export async function DELETE(request: NextRequest, { params }: { params: RouteParams }) {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.roleName || '';
    if (!session?.user?.id || !allowedRoles.includes(userRole)) {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    // CORREÇÃO: Acessar params.action diretamente
    const actionName = params.action;
     if (!actionName) {
         // Esta verificação pode não ser estritamente necessária
         return NextResponse.json({ error: 'Nome da ação não fornecido na URL.' }, { status: 400 });
    }

    try {
        // Opcional: Adicionar lógica para verificar se a permissão está em uso antes de excluir
        // const permissionsInUse = await prisma.permission.count({ where: { action: actionName } });
        // if (permissionsInUse > 0) {
        //     return NextResponse.json({ error: `Não é possível excluir: a permissão "${actionName}" está atribuída a ${permissionsInUse} alvos.` }, { status: 409 });
        // }

        // IMPORTANTE: Excluir PRIMEIRO as atribuições existentes desta permissão
        const { count } = await prisma.permission.deleteMany({
            where: { action: actionName },
        });

        // DEPOIS excluir a definição
        await prisma.permissionDefinition.delete({
            where: { action: actionName },
        });


        console.log(`Definição de permissão "${actionName}" excluída e ${count} atribuições removidas.`);
        return NextResponse.json({ message: `Definição "${actionName}" excluída com sucesso.` }, { status: 200 }); // Ou 204 se preferir sem corpo

    } catch (error) {
        console.error(`Erro ao excluir definição ${actionName}:`, error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            // P2025: Registro não encontrado para delete
            return NextResponse.json({ error: `Definição com ação "${actionName}" não encontrada.` }, { status: 404 });
        }
        return NextResponse.json({ error: 'Erro interno ao excluir definição' }, { status: 500 });
    }
}