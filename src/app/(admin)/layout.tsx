// src/app/(admin)/layout.tsx
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; 
import { redirect } from 'next/navigation';
import Sidebar from './Sidebar'; 
import HeaderAdmin from './HeaderAdmin'; // 1. IMPORTAR O NOVO HEADER

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  const session = await getServerSession(authOptions);

  if (!session || !session.user) { 
    redirect('/login?callbackUrl=/admin'); 
  }

  // Extrair dados do usuário da sessão
  const userName = session.user.name ?? 'Usuário';
  // @ts-ignore
  const userRole = session.user.roleName ?? 'Cargo não definido';
  const userImage = session.user.image ?? null; 

  return (
    // Estrutura principal com sidebar fixa e conteúdo à direita
    <div className="flex min-h-screen bg-gray-100"> 
      
      {/* Sidebar (não recebe mais props de usuário) */}
      <Sidebar /> 

      {/* Wrapper para Header e Conteúdo Principal */}
      <div className="flex flex-col flex-1 ml-64"> {/* ml-64 para dar espaço à sidebar */}
        
        {/* 2. RENDERIZAR O HEADER ADMIN, PASSANDO PROPS */}
        <HeaderAdmin 
          userName={userName} 
          userRole={userRole} 
          userImage={userImage} 
        />

        {/* Conteúdo Principal com padding-top para não ficar sob o header fixo */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto pt-20"> {/* Aumentado pt para pt-20 (h-16 do header + padding) */}
          {children}
        </main>
      </div>
    </div>
  );
}