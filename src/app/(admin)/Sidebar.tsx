// src/app/(admin)/Sidebar.tsx
'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { 
    LayoutDashboard, Users, Newspaper, Briefcase, Settings, 
    // LogOut REMOVIDO daqui
    Building, DollarSign, BookUser, FileText, 
    UsersRound, Scale, SlidersHorizontal 
    // UserCircle, Edit REMOVIDOS daqui
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

// --- Componente Sidebar (NÃO recebe mais props) ---
export default function Sidebar() {
    // handleLogout REMOVIDO daqui

    return (
      <aside className="w-64 bg-gradient-to-b from-neutral-900 to-black text-white p-6 flex flex-col justify-between h-screen fixed top-0 left-0 border-r border-neutral-700 z-50"> {/* Aumentado z-index */} 
        {/* Parte Superior (Logo e Navegação) */}
        <div>
          <div className="mb-10 pl-1"> 
            <Link href="/admin" className="text-2xl font-bold text-white hover:text-gray-200 transition-colors">
              Fyzen Admin
            </Link>
          </div>
          {/* Navegação por Categorias (sem alteração) */}
          <div className='mb-6'><nav className="space-y-1"><NavItem href="/admin" icon={LayoutDashboard}>Dashboard</NavItem></nav></div>
          <div className='mb-6'><h3 className="px-4 mb-3 text-xs uppercase text-neutral-400 tracking-wider font-semibold">CRM & Projetos</h3><nav className="space-y-1"><NavItem href="/admin/clientes" icon={BookUser}>Clientes</NavItem><NavItem href="/admin/projetos" icon={Briefcase}>Projetos</NavItem></nav></div>
          <div className='mb-6'><h3 className="px-4 mb-3 text-xs uppercase text-neutral-400 tracking-wider font-semibold">Marketing & Conteúdo</h3><nav className="space-y-1"><NavItem href="/admin/blog" icon={Newspaper}>Blog</NavItem></nav></div>
          <div className='mb-6'><h3 className="px-4 mb-3 text-xs uppercase text-neutral-400 tracking-wider font-semibold">Recursos Humanos</h3><nav className="space-y-1"><NavItem href="/admin/funcionarios" icon={UsersRound}>Funcionários</NavItem><NavItem href="/admin/departamentos" icon={Building}>Departamentos</NavItem><NavItem href="/admin/cargos" icon={Briefcase}>Cargos</NavItem></nav></div>
          <div className='mb-6'><h3 className="px-4 mb-3 text-xs uppercase text-neutral-400 tracking-wider font-semibold">Financeiro</h3><nav className="space-y-1"><NavItem href="/admin/financeiro" icon={DollarSign}>Financeiro (Visão Geral)</NavItem></nav></div>
        </div>

        {/* --- RODAPÉ DA SIDEBAR (SIMPLIFICADO) --- */}
        <div className="mt-auto pt-6 border-t border-neutral-700"> 
             {/* Sistema */}
             <h3 className="px-4 mb-3 text-xs uppercase text-neutral-400 tracking-wider font-semibold">Sistema</h3>
             <nav className='space-y-1 mb-3'>
                <NavItem href="/admin/configuracoes" icon={SlidersHorizontal}>Configurações</NavItem> 
             </nav>
            
            {/* Seção de Perfil e Botão Sair REMOVIDOS daqui */}
        </div>
      </aside>
    );
}