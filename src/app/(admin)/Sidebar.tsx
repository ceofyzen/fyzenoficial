// src/app/(admin)/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ModuloEnum } from '@prisma/client';
// --- CORREÇÃO AQUI ---
import { useMemo } from 'react'; // Importar useMemo
// --- FIM DA CORREÇÃO ---
import {
    LayoutDashboard, Users, Newspaper, Briefcase, Settings,
    Building, DollarSign, BookUser, FileText,
    UsersRound, Scale, SlidersHorizontal,
    Clock,
    CalendarDays,
    Loader2, // Para indicar carregamento (opcional)
    Lock // Ícone para Permissões
} from 'lucide-react';

// --- Componente NavItem (sem alterações) ---
function NavItem({ href, icon: Icon, children }: { href: string, icon: React.ElementType, children: React.ReactNode }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));

    return (
        <Link
          href={href}
          className={`
            relative flex items-center gap-3 py-2 px-4 rounded-md transition-colors duration-150 text-sm group
            ${isActive
              ? 'bg-neutral-800 text-white font-medium'
              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'
            }
          `}
        >
          {isActive && (
            <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-neutral-500 rounded-r-full"></span>
          )}
          <Icon
            size={18}
            className={`
              transition-colors duration-150
              ${isActive
                ? 'text-white'
                : 'text-neutral-500 group-hover:text-neutral-300'
              }
            `}
          />
          <span>{children}</span>
        </Link>
    );
}

// --- Componente Sidebar (com lógica de acesso) ---
export default function Sidebar() {
    // Obter dados da sessão
    const { data: session, status } = useSession();

    // Determinar se o usuário tem acesso à seção RH
    const isLoadingSession = status === 'loading';
    const canViewRH = useMemo(() => {
        if (status !== 'authenticated' || !session?.user) {
            return false;
        }
        // Verificar se é CEO, Diretor Operacional ou pertence ao módulo RH
        return (
            session.user.roleName === 'Chief Executive Officer' ||
            session.user.roleName === 'Diretor Operacional' || // <-- Verifique se este nome está correto
            session.user.accessModule === ModuloEnum.RH
        );
    }, [session, status]);

    // *** NOVA LÓGICA PARA VERIFICAR SE PODE VER O LINK DE PERMISSÕES ***
    const canViewPermissions = useMemo(() => {
        if (status !== 'authenticated' || !session?.user) {
            return false;
        }
        const allowedRoles = ['Chief Executive Officer', 'Diretor Operacional']; // Ajuste se necessário
        return allowedRoles.includes(session.user.roleName || '');
    }, [session, status]);


    // Opcional: Mostrar um loader enquanto a sessão carrega
    // if (isLoadingSession) {
    //     return (
    //         <aside className="w-64 bg-gradient-to-b from-neutral-900 to-black text-white p-6 flex flex-col justify-center items-center h-screen fixed top-0 left-0 border-r border-neutral-700 z-50">
    //             <Loader2 className="animate-spin text-neutral-400" size={32} />
    //         </aside>
    //     );
    // }

    return (
      <aside className="w-64 bg-gradient-to-b from-neutral-900 to-black text-white p-6 flex flex-col justify-between h-screen fixed top-0 left-0 border-r border-neutral-700 z-50">
        {/* Parte Superior (Logo e Navegação) */}
        <div>
          <div className="mb-10 pl-1">
            <Link href="/admin" className="text-2xl font-bold text-white hover:text-gray-200 transition-colors">
              Fyzen Admin
            </Link>
          </div>
          {/* Navegação por Categorias */}
          <div className='mb-6'><nav className="space-y-1"><NavItem href="/admin" icon={LayoutDashboard}>Dashboard</NavItem></nav></div>
          <div className='mb-6'><h3 className="px-4 mb-3 text-xs uppercase text-neutral-400 tracking-wider font-semibold">CRM & Projetos</h3><nav className="space-y-1"><NavItem href="/admin/clientes" icon={BookUser}>Clientes</NavItem><NavItem href="/admin/projetos" icon={Briefcase}>Projetos</NavItem></nav></div>
          <div className='mb-6'><h3 className="px-4 mb-3 text-xs uppercase text-neutral-400 tracking-wider font-semibold">Marketing & Conteúdo</h3><nav className="space-y-1"><NavItem href="/admin/blog" icon={Newspaper}>Blog</NavItem></nav></div>

          {/* === SEÇÃO RECURSOS HUMANOS COM RENDERIZAÇÃO CONDICIONAL === */}
          {/* Renderizar a seção apenas se canViewRH for true */}
          {canViewRH && (
              <div className='mb-6'>
                <h3 className="px-4 mb-3 text-xs uppercase text-neutral-400 tracking-wider font-semibold">Recursos Humanos</h3>
                <nav className="space-y-1">
                  <NavItem href="/admin/funcionarios" icon={UsersRound}>Funcionários</NavItem>
                  <NavItem href="/admin/departamentos" icon={Building}>Departamentos</NavItem>
                  <NavItem href="/admin/cargos" icon={Briefcase}>Cargos</NavItem>
                  <NavItem href="/admin/ponto" icon={Clock}>Controle de Ponto</NavItem>
                  <NavItem href="/admin/solicitacoes" icon={CalendarDays}>Solicitações</NavItem>
                </nav>
              </div>
          )}
          {/* ========================================================= */}

          {/* Apenas usuários com permissão FINANCEIRO ou CEO verão este */}
           { (session?.user?.roleName === 'Chief Executive Officer' || session?.user?.accessModule === ModuloEnum.FINANCEIRO) && ( // Corrigido para Chief Executive Officer
               <div className='mb-6'>
                   <h3 className="px-4 mb-3 text-xs uppercase text-neutral-400 tracking-wider font-semibold">Financeiro</h3>
                   <nav className="space-y-1">
                       <NavItem href="/admin/financeiro" icon={DollarSign}>Financeiro (Visão Geral)</NavItem>
                   </nav>
               </div>
           )}
        </div>

        {/* --- RODAPÉ DA SIDEBAR (ATUALIZADO) --- */}
        <div className="mt-auto pt-6 border-t border-neutral-700">
             {/* Sistema */}
             <h3 className="px-4 mb-3 text-xs uppercase text-neutral-400 tracking-wider font-semibold">Sistema</h3>
             <nav className='space-y-1 mb-3'>
                <NavItem href="/admin/configuracoes" icon={SlidersHorizontal}>Configurações</NavItem>
                {/* *** ADICIONAR LINK CONDICIONAL PARA PERMISSÕES *** */}
                {canViewPermissions && (
                    <NavItem href="/admin/permissoes" icon={Lock}>Permissões</NavItem>
                )}
             </nav>
        </div>
      </aside>
    );
}