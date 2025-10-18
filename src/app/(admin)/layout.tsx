// app/(admin)/layout.tsx
import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Newspaper, Briefcase, Settings, LogOut } from 'lucide-react'; 

// ***** MUDANÇA 1: Importações necessárias *****
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Ajuste o caminho se necessário
import { redirect } from 'next/navigation';

// ***** MUDANÇA 2: Transformar em async function *****
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  // ***** MUDANÇA 3: Lógica de proteção ATIVA *****
  const session = await getServerSession(authOptions);

  // Se NÃO houver sessão (usuário não logado), redireciona para o login
  if (!session) {
    console.log("AdminLayout: Sem sessão, redirecionando para /login");
    redirect('/login?callbackUrl=/admin'); // callbackUrl é opcional, mas útil
  }

  // Opcional: Verificar cargo/departamento aqui
  // if (session.user?.role !== 'admin') {
  //    redirect('/acesso-negado'); // Ou outra página
  // }
  // ***** Fim da Lógica de proteção *****


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (sem mudanças visuais) */}
      <aside className="w-64 bg-neutral-900 text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-8">Fyzen Admin</h2>
          <nav className="space-y-4">
            <Link href="/admin" className="flex items-center gap-3 p-2 rounded hover:bg-neutral-700 transition-colors">
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link href="/admin/clientes" className="flex items-center gap-3 p-2 rounded hover:bg-neutral-700 transition-colors">
              <Users size={18} /> Clientes
            </Link>
            <Link href="/admin/projetos" className="flex items-center gap-3 p-2 rounded hover:bg-neutral-700 transition-colors">
              <Briefcase size={18} /> Projetos
            </Link>
            <Link href="/admin/blog" className="flex items-center gap-3 p-2 rounded hover:bg-neutral-700 transition-colors">
              <Newspaper size={18} /> Blog
            </Link>
            <Link href="/admin/funcionarios" className="flex items-center gap-3 p-2 rounded hover:bg-neutral-700 transition-colors">
              <Users size={18} /> Funcionários
            </Link>
            <Link href="/admin/configuracoes" className="flex items-center gap-3 p-2 rounded hover:bg-neutral-700 transition-colors">
              <Settings size={18} /> Configurações
            </Link>
          </nav>
        </div>
        {/* Link de Logout (Precisará de funcionalidade depois) */}
        <button className="flex items-center gap-3 p-2 rounded text-red-400 hover:bg-red-900/50 transition-colors w-full">
           <LogOut size={18} /> Sair
        </button>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}