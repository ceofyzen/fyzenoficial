// src/app/(admin)/layout.tsx
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; 
import { redirect } from 'next/navigation';
import Sidebar from './Sidebar'; 
import HeaderAdmin from './HeaderAdmin';

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
      
      {/* Sidebar */}
      <Sidebar /> 

      {/* Wrapper para Header e Conteúdo Principal */}
      <div className="flex flex-col flex-1 ml-64">
        
        {/* Header Admin */}
        <HeaderAdmin 
          userName={userName} 
          userRole={userRole} 
          userImage={userImage} 
        />

        {/* Conteúdo Principal - PADDING AJUSTADO para não ficar sob o header */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}