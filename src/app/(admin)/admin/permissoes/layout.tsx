// src/app/(admin)/admin/permissoes/layout.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function LayoutPermissoes({
    children
}: {
    children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

  // Define os cargos que podem aceder a esta página
  const allowedRoles = ['Diretor Executivo (CEO)', 'Diretor Operacional (COO)']; // Ajuste os nomes se necessário

  console.log(`Verificando acesso a /admin/permissoes: User ${session?.user?.email}, Cargo ${session?.user?.roleName}`);

  const temAcesso = session?.user && allowedRoles.includes(session.user.roleName || '');

  if (!temAcesso) {
    console.log(`ACESSO NEGADO a /admin/permissoes para ${session?.user?.email}`);
    redirect('/admin/acesso-negado'); // Redireciona se não tiver permissão
  }

  // Se chegou aqui, tem acesso, renderiza o conteúdo da página
  console.log(`Acesso PERMITIDO a /admin/permissoes para ${session?.user?.email}`);
  return <>{children}</>;
}