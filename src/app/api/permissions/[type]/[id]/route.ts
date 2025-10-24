// src/app/api/permissions/[type]/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { PermissionTargetType, Prisma } from '@prisma/client';

interface RouteContext {
  params: {
    type: string; // 'department', 'role', 'user'
    id: string;   // ID do alvo
  };
}

// Helper para validar o tipo
function getValidTargetType(type: string): PermissionTargetType | null {
  const upperType = type.toUpperCase();
  if (Object.values(PermissionTargetType).includes(upperType as PermissionTargetType)) {
    return upperType as PermissionTargetType;
  }
  return null;
}

// --- GET: Buscar permissões (ACTIONS) para um alvo específico ---
export async function GET(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  const allowedRoles = ['Diretor Executivo (CEO)', 'Diretor Operacional (COO)'];
  const userRole = session?.user?.roleName || 'N/A';
  const canAccess = session?.user && allowedRoles.includes(userRole);

  if (!canAccess) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const targetTypeParam = context.params.type;
  const targetId = context.params.id;
  const targetType = getValidTargetType(targetTypeParam);

  if (!targetType || !targetId) {
    return NextResponse.json({ error: 'Tipo ou ID inválido.' }, { status: 400 });
  }

  try {
    const permissions = await prisma.permission.findMany({
      where: {
        targetType: targetType,
        // Usar o campo FK correto baseado no targetType
        ...(targetType === PermissionTargetType.DEPARTMENT && { departmentId: targetId }),
        ...(targetType === PermissionTargetType.ROLE && { roleId: targetId }),
        ...(targetType === PermissionTargetType.USER && { userId: targetId }),
      },
      select: { action: true }, // Seleciona a 'action' (string)
    });

    const allowedActions = permissions.map(p => p.action); // Retorna um array de strings
    console.log(`GET /api/permissions/${targetTypeParam}/${targetId} - Found ${allowedActions.length} actions.`);
    return NextResponse.json(allowedActions);

  } catch (error) {
    console.error(`Erro ao buscar actions para ${targetType} ${targetId}:`, error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// --- PUT: Atualizar permissões (ACTIONS) para um alvo específico ---
export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  const allowedRoles = ['Diretor Executivo (CEO)', 'Diretor Operacional (COO)'];
  const userRole = session?.user?.roleName || '';
  const canAccess = session?.user && allowedRoles.includes(userRole);

  if (!canAccess) {
    console.error(`API PUT /permissions - Acesso negado para role: "${userRole}"`);
    return NextResponse.json({ error: 'Acesso negado. Permissão insuficiente.' }, { status: 403 });
  }

  const targetTypeParam = context.params.type;
  const targetId = context.params.id;
  const targetType = getValidTargetType(targetTypeParam);

  if (!targetType || !targetId) {
    return NextResponse.json({ error: 'Tipo ou ID inválido.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const allowedActions: string[] = body.actions || []; // Espera um array de ACTIONS (strings)

    // Opcional: Validar se as actions existem em PermissionDefinition
    if (allowedActions.length > 0) {
        const definitions = await prisma.permissionDefinition.findMany({
            where: { action: { in: allowedActions } },
            select: { action: true }
        });
        const validActionsSet = new Set(definitions.map(d => d.action));
        const invalidActions = allowedActions.filter(a => !validActionsSet.has(a));
        if (invalidActions.length > 0) {
            return NextResponse.json({ error: `Ações inválidas ou não definidas: ${invalidActions.join(', ')}` }, { status: 400 });
        }
    }

    // Validação da existência do alvo
    let targetExists = false;
    if (targetType === PermissionTargetType.DEPARTMENT) targetExists = !!(await prisma.department.count({ where: { id: targetId } }));
    else if (targetType === PermissionTargetType.ROLE) targetExists = !!(await prisma.role.count({ where: { id: targetId } }));
    else if (targetType === PermissionTargetType.USER) targetExists = !!(await prisma.user.count({ where: { id: targetId } }));
    if (!targetExists) return NextResponse.json({ error: `${targetType} ${targetId} não encontrado.` }, { status: 404 });

    // Transação: Deleta antigas, cria novas
    await prisma.$transaction(async (tx) => {
      // 1. Deletar permissões antigas para este alvo
      await tx.permission.deleteMany({
        where: {
          targetType: targetType,
          // Usar o campo FK correto
          ...(targetType === PermissionTargetType.DEPARTMENT && { departmentId: targetId }),
          ...(targetType === PermissionTargetType.ROLE && { roleId: targetId }),
          ...(targetType === PermissionTargetType.USER && { userId: targetId }),
        },
      });

      // 2. Criar novas permissões (se houver alguma)
      if (allowedActions.length > 0) {
        await tx.permission.createMany({
          data: allowedActions.map(actionName => ({
            targetType: targetType,
            // Preencher a FK correta
            departmentId: targetType === PermissionTargetType.DEPARTMENT ? targetId : null,
            roleId: targetType === PermissionTargetType.ROLE ? targetId : null,
            userId: targetType === PermissionTargetType.USER ? targetId : null,
            action: actionName, // Salva a action (string)
          })),
        });
      }
    });

    console.log(`Permissões (actions) atualizadas para ${targetType} ID: ${targetId}`);
    return NextResponse.json({ success: true, allowedActions });

  } catch (error) {
    console.error(`Erro ao atualizar actions para ${targetType} ${targetId}:`, error);
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
       return NextResponse.json({ error: `${targetType} não encontrado.` }, { status: 404 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
         return NextResponse.json({ error: 'Erro de consistência ao salvar. Tente novamente.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}