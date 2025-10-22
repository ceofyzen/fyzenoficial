// src/app/(admin)/HeaderAdmin.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react'; // Import useSession
import { Bell, MessageSquare, UserCircle, ChevronDown, Edit, LogOut, KeyRound, SlidersHorizontal, HelpCircle, Search } from 'lucide-react';

// Interface para os props que vêm do Layout (Server Component)
interface HeaderAdminProps {
    userName: string;
    userRole: string;
    userImage: string | null;
}

// Componente agora usa props E o hook useSession
export default function HeaderAdmin({ userName: initialUserName, userRole: initialUserRole, userImage: initialUserImage }: HeaderAdminProps) {
    // Obter o status da sessão
    const { data: session, status } = useSession(); // Adicionado 'status'
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // Estado para a busca

    const handleLogout = async () => {
        setIsProfileMenuOpen(false);
        await signOut({ callbackUrl: '/login' });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica de busca (placeholder)
        if (searchTerm.trim()) {
            alert(`Buscando por: "${searchTerm}" (Funcionalidade a implementar)`);
            // No futuro: router.push(`/admin/busca?q=${searchTerm}`);
        }
    };

    // Lógica refinada para exibir dados
    // Prioriza dados da sessão do hook SE autenticado, senão usa os props iniciais
    const isLoadingSession = status === 'loading';
    const isAuthenticated = status === 'authenticated';

    const userName = isAuthenticated && session?.user?.name ? session.user.name : initialUserName;
    // @ts-ignore - Acessando propriedade customizada roleName
    const userRole = isAuthenticated && session?.user?.roleName ? session.user.roleName : initialUserRole;
    const userImage = isAuthenticated && session?.user?.image ? session.user.image : initialUserImage;


    return (
        // Header fixo
        <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-6 gap-6"> {/* Adicionado gap-6 */}

            {/* Lado Esquerdo: Mensagem usa dados atualizados */}
            {/* Adicionado flex-shrink-0 para não encolher */}
            <div className="flex-shrink-0">
                <span className="text-sm text-gray-600 hidden lg:inline"> {/* Esconde em telas menores que lg */}
                   {/* Usa as variáveis refinadas */}
                   Seja Bem vindo, <span className="font-medium text-gray-800">{userRole}</span> <span className="font-semibold text-neutral-900">{userName}</span>!
                </span>
            </div>

            {/* ***** Barra de Pesquisa (Centro) ***** */}
            {/* flex-grow permite que a barra ocupe o espaço disponível */}
            <div className="flex-grow max-w-xl mx-4"> {/* Limitando largura máxima */}
                <form onSubmit={handleSearchSubmit} className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search size={18} />
                    </span>
                    <input
                        type="search"
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500"
                    />
                    {/* Botão submit oculto ou estilizado */}
                    <button type="submit" className="hidden">Buscar</button>
                </form>
            </div>


            {/* Lado Direito: Ícones + Perfil */}
             {/* Adicionado flex-shrink-0 para não encolher */}
            <div className="flex items-center gap-4 flex-shrink-0">
                {/* Ícones */}
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100" aria-label="Notificações" onClick={() => alert('Notificações (placeholder)')}>
                        <Bell size={20} />
                    </button>
                    <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100" aria-label="Chat" onClick={() => alert('Chat (placeholder)')}>
                        <MessageSquare size={20} />
                    </button>
                </div>

                {/* Separador Vertical (Opcional) */}
                <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div> {/* Esconde em telas pequenas */}

                {/* Perfil do Usuário */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900"
                        aria-expanded={isProfileMenuOpen} aria-controls="profile-menu-header"
                        disabled={isLoadingSession} // Desabilita o botão enquanto a sessão carrega
                    >
                        {/* Avatar usa userImage refinado */}
                        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {userImage ? ( <img src={userImage} alt="Foto de Perfil" className="w-full h-full object-cover" /> ) : ( <UserCircle size={20} className="text-neutral-400" /> )}
                        </div>
                        {/* Nome e Cargo usam userName e userRole refinados */}
                        <div className="text-left hidden md:block mr-1"> {/* hidden md:block */}
                             <p className="text-sm font-medium text-gray-700 truncate leading-tight">{userName}</p>
                             <p className="text-xs text-gray-500 truncate leading-tight">{userRole}</p>
                        </div>
                        {/* Seta */}
                        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : 'rotate-0'} flex-shrink-0`} />
                    </button>

                    {/* Menu Dropdown do Perfil */}
                    {isProfileMenuOpen && (
                        <div
                            id="profile-menu-header"
                            className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-1 origin-top-right animate-scale-in-ver-top z-50" // Adicionado z-50
                            role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex={-1}
                        >
                            <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                                <p className="text-xs text-gray-500 truncate">{userRole}</p>
                            </div>
                            <Link href="/admin/perfil/editar" className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" tabIndex={-1} onClick={() => setIsProfileMenuOpen(false)}>
                                <Edit size={16} /> Editar Perfil
                            </Link>
                            <Link href="/admin/perfil/alterar-senha" className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" tabIndex={-1} onClick={() => setIsProfileMenuOpen(false)}>
                                <KeyRound size={16} /> Alterar Senha
                            </Link>
                             <Link href="/admin/preferencias" className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" tabIndex={-1} onClick={() => setIsProfileMenuOpen(false)}>
                                <SlidersHorizontal size={16} /> Preferências
                            </Link>
                             <Link href="/ajuda" className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-t border-gray-100 mt-1 pt-2" role="menuitem" tabIndex={-1} onClick={() => setIsProfileMenuOpen(false)}>
                                <HelpCircle size={16} /> Ajuda / Suporte
                            </Link>
                            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 mt-1" role="menuitem" tabIndex={-1}>
                                <LogOut size={16} /> Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}