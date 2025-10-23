// src/app/api/permissions/[type]/[id]/route.ts
// ... (importações, interface RouteContext, getValidTargetType) ...

// --- GET: Buscar permissões para um alvo específico ---
export async function GET(request: NextRequest, context: RouteContext) {
  // Log 1: Rota atingida e parâmetros recebidos
  const targetTypeParam = context.params.type;
  const targetId = context.params.id;
  console.log(`API GET /permissions/${targetTypeParam}/${targetId} - ROTA ATINGIDA`);

  // Log 2: Validar tipo
  const targetType = getValidTargetType(targetTypeParam);
  console.log(`API GET /permissions/${targetTypeParam}/${targetId} - Tipo Validado: ${targetType}`);
  if (!targetType) {
    console.error(`API GET /permissions - Tipo inválido: ${targetTypeParam}`);
    return NextResponse.json({ error: 'Tipo de alvo inválido na URL' }, { status: 400 });
  }
  if (!targetId) {
    console.error(`API GET /permissions - ID alvo em falta`);
    return NextResponse.json({ error: 'ID do alvo não fornecido na URL.' }, { status: 400 });
  }

  // Log 3: Verificar Sessão e Permissão
  const session = await getServerSession(authOptions);
  const allowedRoles = ['Diretor Executivo (CEO)', 'Diretor Operacional (COO)'];
  const userRole = session?.user?.roleName || 'N/A';
  const canAccess = session?.user && allowedRoles.includes(userRole);
  console.log(`API GET /permissions/${targetTypeParam}/${targetId} - User Role: "${userRole}", Can Access: ${canAccess}`);

  if (!canAccess) {
    console.warn(`API GET /permissions - Acesso negado para role: "${userRole}"`);
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 }); // Retorna 403 explicitamente
  }

  // Log 4: Preparar query Prisma
  const whereClause: Prisma.PermissionWhereInput = {
      targetType: targetType,
      ...(targetType === PermissionTargetType.DEPARTMENT && { departmentId: targetId }),
      ...(targetType === PermissionTargetType.ROLE && { roleId: targetId }),
      ...(targetType === PermissionTargetType.USER && { userId: targetId }),
  };
  console.log(`API GET /permissions/${targetTypeParam}/${targetId} - Where Clause:`, whereClause);


  try {
    // Log 5: Executar Query
    console.log(`API GET /permissions/${targetTypeParam}/${targetId} - Executando findMany...`);
    const permissions = await prisma.permission.findMany({
      where: whereClause,
      select: { module: true },
    });
    console.log(`API GET /permissions/${targetTypeParam}/${targetId} - Query concluída. Encontradas ${permissions.length} permissões.`); // Log 6

    const allowedModules = permissions.map(p => p.module);
    return NextResponse.json(allowedModules); // Resposta JSON normal

  } catch (error) {
    // Log 7: Erro na Query
    console.error(`API GET /permissions/${targetTypeParam}/${targetId} - ERRO Prisma:`, error);
    return NextResponse.json({ error: 'Erro interno ao buscar permissões' }, { status: 500 });
  }
}

// --- PUT: Atualizar permissões (manter logs anteriores) ---
export async function PUT(request: NextRequest, context: RouteContext) {
    // ... (código PUT com os logs de verificação de acesso já existentes) ...
    // É importante manter os logs na função PUT também
    const session = await getServerSession(authOptions);
    const allowedRoles = ['Diretor Executivo (CEO)', 'Diretor Operacional (COO)'];
    const userRole = session?.user?.roleName || '';
    const canAccess = session?.user && allowedRoles.includes(userRole);
    console.log(`API PUT /permissions - Session User Role: "${userRole}", Can Access: ${canAccess}`); // Manter log para debug PUT
    if (!canAccess) { /* ... */ }
    // ... (restante do código PUT) ...
}