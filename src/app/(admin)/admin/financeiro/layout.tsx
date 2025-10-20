// src/app/(admin)/admin/financeiro/layout.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; 
import { redirect } from 'next/navigation';
import { ModuloEnum } from '@prisma/client'; // Importar o Enum do Prisma
import React from 'react'; // Importar React

export default async function LayoutModuloFinanceiro({ 
    children 
}: { 
    children: React.ReactNode 
}) {
  const session = await getServerSession(authOptions);

  // Busca o módulo de acesso e o nome do cargo da sessão
  const moduloAcessoUsuario = session?.user?.accessModule; 
  const cargoNome = session?.user?.roleName;

  console.log(`Verificando acesso ao Financeiro: User ${session?.user?.email}, Modulo ${moduloAcessoUsuario}, Cargo ${cargoNome}`);

  // Lógica de Acesso: Permite CEO ou quem tem acesso ao módulo FINANCEIRO
  const temAcesso = 
    cargoNome === 'Chief Executive Officer' || // Acesso total para CEO
    moduloAcessoUsuario === ModuloEnum.FINANCEIRO; // Acesso para quem é do módulo

  if (!temAcesso) {
    console.log(`ACESSO NEGADO ao Financeiro para ${session?.user?.email}`);
    redirect('/admin/acesso-negado'); // Redireciona se não tiver permissão
  }

  // Se chegou aqui, tem acesso, renderiza o conteúdo do módulo
  console.log(`Acesso PERMITIDO ao Financeiro para ${session?.user?.email}`);
  return <>{children}</>; // Renderiza a página filha (page.tsx)
}