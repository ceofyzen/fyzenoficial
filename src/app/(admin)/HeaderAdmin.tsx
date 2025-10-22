// src/app/(admin)/HeaderAdmin.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react'; // useEffect já deve estar importado
import { signOut, useSession } from 'next-auth/react';
import { Bell, MessageSquare, UserCircle, ChevronDown, Edit, LogOut, KeyRound, SlidersHorizontal, HelpCircle, Search, Loader2 } from 'lucide-react'; // Import Loader2
import ChatPanel from './ChatPanel';

interface HeaderAdminProps {
    userName: string;
    userRole: string;
    userImage: string | null;
}

export default function HeaderAdmin({ userName: initialUserName, userRole: initialUserRole, userImage: initialUserImage }: HeaderAdminProps) {
    const { data: session, status } = useSession();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0); // <-- 1. Estado para contagem
    const [isLoadingCount, setIsLoadingCount] = useState(true); // <-- Estado de loading para contagem inicial

    // Função para buscar a contagem de não lidas
    const fetchUnreadCount = async () => {
        // Não busca se não estiver autenticado
        if (status !== 'authenticated') {
            setIsLoadingCount(false); // Para o loading inicial se não estiver logado
            return;
        }
        // console.log("HeaderAdmin: Buscando contagem não lidas..."); // Log opcional
        try {
            const response = await fetch('/api/chat/unread-count');
            if (response.ok) {
                const data = await response.json();
                // console.log("HeaderAdmin: Contagem recebida:", data.count); // Log opcional
                setUnreadCount(data.count);
            } else {
                console.error("HeaderAdmin: Falha ao buscar contagem:", response.status);
                // Opcional: Tratar erro, talvez zerar contagem ou mostrar um erro
                // setUnreadCount(0);
            }
        } catch (error) {
            console.error("HeaderAdmin: Erro na requisição de contagem:", error);
            // setUnreadCount(0);
        } finally {
            // Só para o loading na primeira busca
            if (isLoadingCount) {
                setIsLoadingCount(false);
            }
        }
    };

    // --- 2. useEffect para buscar contagem inicial e configurar polling ---
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        if (status === 'authenticated') {
            // Busca a contagem inicial imediatamente
            fetchUnreadCount();

            // Configura o polling (verificação periódica) apenas se o chat NÃO estiver aberto
            if (!isChatOpen) {
                intervalId = setInterval(fetchUnreadCount, 30000); // Verifica a cada 30 segundos
                console.log("HeaderAdmin: Polling de contagem iniciado.");
            }
        } else {
            // Se deslogar, zera a contagem e para o loading
            setUnreadCount(0);
            setIsLoadingCount(false);
        }

        // Função de limpeza
        return () => {
            if (intervalId) {
                clearInterval(intervalId); // Limpa o intervalo quando o componente desmonta ou o chat abre/fecha
                console.log("HeaderAdmin: Polling de contagem parado.");
            }
        };
    // Dependências: status (para iniciar quando logar) e isChatOpen (para parar/reiniciar polling)
    }, [status, isChatOpen]);
    // --- Fim useEffect polling ---


    // Função para fechar ambos os menus/paineis abertos
    const closePopups = () => {
        setIsProfileMenuOpen(false);
        setIsChatOpen(false);
    };

    // Efeito para fechar popups se clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (
                !target.closest('#profile-menu-button') &&
                !target.closest('#profile-menu-header') &&
                !target.closest('#chat-button') &&
                !target.closest('#chat-panel')
            ) {
                 closePopups();
            }
        };
        if (isProfileMenuOpen || isChatOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, [isProfileMenuOpen, isChatOpen]);


    const handleLogout = async () => {
        closePopups();
        await signOut({ callbackUrl: '/login' });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) { alert(`Buscando por: "${searchTerm}" (Implementar)`); }
    };

    // Função para alternar o chat
    const toggleChat = () => {
        const nextChatState = !isChatOpen;
        if (isProfileMenuOpen) setIsProfileMenuOpen(false);
        setIsChatOpen(nextChatState);
        // Se estiver ABRINDO o chat, busca a contagem imediatamente (marcará como lido na API GET messages)
        // e logo depois zera a contagem localmente para o badge sumir na hora.
        if (nextChatState) {
            // A busca das mensagens no ChatPanel (acionada pelo isOpen=true)
            // irá marcar as mensagens como lidas no backend.
            // Podemos zerar a contagem aqui otimisticamente.
             console.log("HeaderAdmin: Chat aberto, zerando contagem local.");
             setUnreadCount(0);
        }
        // Se estiver fechando, o useEffect cuidará de reiniciar o polling
    };

     // Função para alternar o menu de perfil
    const toggleProfileMenu = () => {
         if (isChatOpen) setIsChatOpen(false);
         setIsProfileMenuOpen(!isProfileMenuOpen);
    };

    // --- Lógica de exibição (sem alterações) ---
    const isLoadingSession = status === 'loading';
    const isAuthenticated = status === 'authenticated';
    const userName = isAuthenticated && session?.user?.name ? session.user.name : initialUserName;
    // @ts-ignore
    const userRole = isAuthenticated && session?.user?.roleName ? session.user.roleName : initialUserRole;
    const userImage = isAuthenticated && session?.user?.image ? session.user.image : initialUserImage;

    return (
        <>
            <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-6 gap-6">
                {/* Lado Esquerdo: Mensagem */}
                <div className="flex-shrink-0">
                    <span className="text-sm text-gray-600 hidden lg:inline">
                       Seja Bem vindo, <span className="font-medium text-gray-800">{userRole}</span> <span className="font-semibold text-neutral-900">{userName}</span>!
                    </span>
                </div>

                {/* Barra de Pesquisa */}
                <div className="flex-grow max-w-xl mx-4">
                   <form onSubmit={handleSearchSubmit} className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={18} /></span>
                       <input type="search" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500"/>
                       <button type="submit" className="hidden">Buscar</button>
                   </form>
                </div>

                {/* Lado Direito: Ícones + Perfil */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    {/* Ícones */}
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100" aria-label="Notificações" onClick={() => alert('Notificações (placeholder)')}>
                            <Bell size={20} />
                            {/* Pode adicionar badge aqui também */}
                        </button>

                        {/* --- 3. BOTÃO DO CHAT COM BADGE --- */}
                        <button
                            id="chat-button"
                            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 relative"
                            aria-label="Abrir chat"
                            onClick={toggleChat}
                        >
                            <MessageSquare size={20} />
                            {/* Badge de contagem não lida */}
                            {!isLoadingCount && unreadCount > 0 && (
                                <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                             {/* Indicador de Loading inicial (opcional) */}
                             {isLoadingCount && (
                                <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2">
                                     <Loader2 className="animate-spin text-gray-400" size={10}/>
                                </span>
                             )}
                        </button>
                        {/* --- FIM BOTÃO CHAT --- */}
                    </div>

                    {/* Separador Vertical */}
                    <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

                    {/* Perfil do Usuário */}
                    <div className="relative">
                        <button id="profile-menu-button" onClick={toggleProfileMenu} className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900" aria-expanded={isProfileMenuOpen} aria-controls="profile-menu-header" disabled={isLoadingSession}>
                            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0">{userImage ? ( <img src={userImage} alt="Foto de Perfil" className="w-full h-full object-cover" /> ) : ( <UserCircle size={20} className="text-neutral-400" /> )}</div>
                            <div className="text-left hidden md:block mr-1"><p className="text-sm font-medium text-gray-700 truncate leading-tight">{userName}</p><p className="text-xs text-gray-500 truncate leading-tight">{userRole}</p></div>
                            <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : 'rotate-0'} flex-shrink-0`} />
                        </button>

                        {/* Menu Dropdown do Perfil */}
                        {isProfileMenuOpen && (
                            <div id="profile-menu-header" className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-1 origin-top-right animate-scale-in-ver-top z-50" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex={-1}>
                                <div className="px-4 py-2 border-b border-gray-100 sm:hidden"><p className="text-sm font-medium text-gray-900 truncate">{userName}</p><p className="text-xs text-gray-500 truncate">{userRole}</p></div>
                                <Link href="/admin/perfil/editar" className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" tabIndex={-1} onClick={closePopups}><Edit size={16} /> Editar Perfil</Link>
                                <Link href="/admin/perfil/alterar-senha" className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" tabIndex={-1} onClick={closePopups}><KeyRound size={16} /> Alterar Senha</Link>
                                <Link href="/admin/preferencias" className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" tabIndex={-1} onClick={closePopups}><SlidersHorizontal size={16} /> Preferências</Link>
                                <Link href="/ajuda" className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-t border-gray-100 mt-1 pt-2" role="menuitem" tabIndex={-1} onClick={closePopups}><HelpCircle size={16} /> Ajuda / Suporte</Link>
                                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 mt-1" role="menuitem" tabIndex={-1}><LogOut size={16} /> Sair</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Renderizar ChatPanel */}
            <div id="chat-panel">
                 <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            </div>
        </>
    );
}