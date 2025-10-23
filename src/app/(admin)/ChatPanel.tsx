// src/app/(admin)/ChatPanel.tsx
'use client';

// ADICIONE MessageSquare AQUI
import { X, Send, UserCircle, Loader2, AlertTriangle, Search, UserPlus, Paperclip, MessageSquare } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Ably from 'ably';
import type { RealtimeChannel, Message as AblyMessage, PresenceMessage } from 'ably';

// --- Tipos ---
type UserInfo = {
    id: string;
    name: string | null;
    image: string | null;
};

type Message = {
    id: string;
    content: string;
    createdAt: string | Date;
    senderId: string;
    sender: UserInfo;
    receiverId: string;
    // readAt?: string | Date | null;
};

type ConversationListItem = {
    otherUser: UserInfo;
    lastMessage: {
        id: string;
        content: string;
        createdAt: string | Date;
        senderId: string;
    };
    // unreadCount?: number;
};

// Tipo para Status de Presença
type PresenceStatus = 'online' | 'offline';
// --- Fim Tipos ---

// --- Helper para Formatar Data/Hora ---
const formatDateTime = (date: string | Date | undefined, style: 'short' | 'full' = 'short'): string => {
    if (!date) return '-';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        if (style === 'short') { // Para a lista de conversas
            const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const today = new Date();
            // Mostra só a hora se for hoje, senão DD/MM
            if (d.toDateString() === today.toDateString()) {
                 return time;
            }
            return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        } else { // 'full' (para timestamps abaixo das mensagens)
             return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); // Ex: 14:30, 22/out
        }
    } catch (e) {
        console.error("Erro formatar data/hora:", date, e);
        return '-';
    }
};
// --- Fim Helper ---

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const { data: session, status } = useSession();
  const currentUserId = session?.user?.id;

  // Estados
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorConversations, setErrorConversations] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<string | null>(null);
  // Refs para instâncias Ably
  const ablyClientRef = useRef<Ably.Realtime | null>(null);
  const messageChannelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  const messageSubscriptionRef = useRef<any>(null);
  const presenceSubscriptionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<UserInfo[]>([]);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(false);
  const [errorAllUsers, setErrorAllUsers] = useState<string | null>(null);
  const [presenceMap, setPresenceMap] = useState<Map<string, PresenceStatus>>(new Map());
  const cleanupStartedRef = useRef(false);

  // Função para buscar conversas
  const fetchConversations = useCallback(async (showLoading = false) => {
    if (!isOpen || !currentUserId || status !== 'authenticated') return;
    if (showLoading) setIsLoadingConversations(true);
    setErrorConversations(null);
    try {
      const response = await fetch('/api/chat/conversations');
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try { const errData = await response.json(); errorMsg = errData.error || errorMsg; } catch (e) {}
        throw new Error(errorMsg);
      }
      const data: ConversationListItem[] = await response.json();
      setConversations(data);
    } catch (err: any) {
      console.error("Erro fetchConversations:", err);
      setErrorConversations(err.message || 'Erro ao carregar conversas.');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [isOpen, currentUserId, status]);

  // Função para buscar TODOS os usuários
  const fetchAllUsers = useCallback(async () => {
    if (!isSearchingUsers || !currentUserId) return;
    setIsLoadingAllUsers(true);
    setErrorAllUsers(null);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Falha ao buscar usuários.');
      const data: UserInfo[] = await response.json();
      setAllUsers(data);
    } catch (err: any) {
      setErrorAllUsers(err.message || 'Erro ao carregar usuários.');
      console.error("Erro fetchAllUsers:", err);
    } finally {
      setIsLoadingAllUsers(false);
    }
  }, [isSearchingUsers, currentUserId]);

  // Efeito para buscar todos usuários
  useEffect(() => {
    if (isSearchingUsers) { fetchAllUsers(); }
    else { setUserSearchTerm(''); setAllUsers([]); setErrorAllUsers(null); }
  }, [isSearchingUsers, fetchAllUsers]);

  // Efeito ÚNICO para Gerenciar Conexão, Presença e Mensagens
  useEffect(() => {
    // Condições para conectar
    if (isOpen && currentUserId && status === 'authenticated' && !ablyClientRef.current) {
        console.log("ChatPanel Effect [Connect]: Iniciando conexão Ably...");
        cleanupStartedRef.current = false;
        let localClient: Ably.Realtime | null = null;
        try {
            localClient = new Ably.Realtime({ authUrl: '/api/ably-auth', authMethod: 'GET', clientId: currentUserId });
            ablyClientRef.current = localClient;

            localClient.connection.on('connected', async () => {
                console.log('Ably: Conectado!');
                if (!ablyClientRef.current) return;

                // --- Configurar Presença ---
                try {
                    const presenceChName = 'presence-status';
                    presenceChannelRef.current = ablyClientRef.current.channels.get(presenceChName);
                    presenceChannelRef.current.presence.unsubscribe(); // Limpa listeners
                    presenceSubscriptionRef.current = await presenceChannelRef.current.presence.subscribe(['enter', 'leave', 'update'], (msg: PresenceMessage) => {
                        console.log("Presence Event:", msg.action, msg.clientId);
                        setPresenceMap(prev => new Map(prev).set(msg.clientId, msg.action === 'leave' ? 'offline' : (msg.data?.status as PresenceStatus || 'online')));
                    });
                    const initialPresence = await presenceChannelRef.current.presence.get();
                    console.log("Presença inicial:", initialPresence.length);
                    setPresenceMap(() => {
                        const newMap = new Map<string, PresenceStatus>();
                        initialPresence.forEach(m => newMap.set(m.clientId, (m.data?.status as PresenceStatus || 'online')));
                        if (currentUserId) newMap.set(currentUserId, 'online');
                        return newMap;
                    });
                    await presenceChannelRef.current.presence.enter({ status: 'online' });
                    setPresenceMap(prev => new Map(prev).set(currentUserId, 'online'));
                    console.log(`Presence: Inscrito e entrou em ${presenceChName}`);
                } catch (e) { console.error("Erro setup presença:", e); }

                // --- Configurar Mensagens ---
                try {
                    const messageChName = `private-chat-${currentUserId}`;
                    messageChannelRef.current = ablyClientRef.current.channels.get(messageChName);
                    messageChannelRef.current.unsubscribe(); // Limpa listeners
                    messageSubscriptionRef.current = await messageChannelRef.current.subscribe('new-message', (message: AblyMessage) => {
                         const newMessageData = message.data as Message;
                         console.log('Ably Message:', newMessageData);
                         // Atualiza mensagens localmente E busca lista de conversas
                         setSelectedUserId(currentSelectedId => {
                            if ((newMessageData.senderId === currentSelectedId || newMessageData.receiverId === currentSelectedId)) {
                                 setMessages(prevMessages => {
                                    if (!prevMessages.some(m => m.id === newMessageData.id)) {
                                        return [...prevMessages, newMessageData];
                                    }
                                    return prevMessages;
                                 });
                             }
                             return currentSelectedId; // Não muda o ID selecionado
                         });
                         fetchConversations(); // Atualiza lista
                    });
                    console.log(`Messages: Inscrito em ${messageChName}`);
                } catch (e) { console.error("Erro setup mensagens:", e); }
            });

            // Listeners
            localClient.connection.on('failed', (e) => { console.error('Ably falhou:', e); ablyClientRef.current = null; setPresenceMap(new Map()); });
            localClient.connection.on('closed', () => { console.log('Ably fechada.'); ablyClientRef.current = null; setPresenceMap(new Map()); });
            localClient.connection.on('disconnected', () => { console.warn('Ably desconectado.'); setPresenceMap(new Map()); });
            localClient.connection.on('suspended', () => { console.warn('Ably suspenso.'); setPresenceMap(new Map()); });

        } catch (error) { console.error("Erro inicializar Ably:", error); setErrorConversations('Erro ao iniciar chat.'); }
    }

    // --- Função de Limpeza REFINADA ---
    return () => {
      if (!cleanupStartedRef.current && (!isOpen || status !== 'authenticated') && ablyClientRef.current) {
        cleanupStartedRef.current = true;
        console.log("Cleanup: Iniciando limpeza Ably...");
        const clientToClose = ablyClientRef.current;
        const presenceCh = presenceChannelRef.current;
        const messageCh = messageChannelRef.current;
        const presenceSub = presenceSubscriptionRef.current;
        const messageSub = messageSubscriptionRef.current;

        ablyClientRef.current = null; presenceChannelRef.current = null; messageChannelRef.current = null; presenceSubscriptionRef.current = null; messageSubscriptionRef.current = null;

        (async () => {
          try {
            // Limpeza Presença
            if (presenceCh) {
              console.log(`Limpando presença (estado: ${presenceCh.state})...`);
              if (presenceSub && typeof presenceSub.unsubscribe === 'function') {
                 try { await presenceSub.unsubscribe(); console.log("Unsub presença OK."); } catch (e) { console.warn("Warn unsub presença:", e);}
              }
              if (['attached', 'attaching'].includes(presenceCh.state) && clientToClose?.connection.state === 'connected') {
                try { await presenceCh.presence.leave(); console.log("Leave presença OK."); }
                catch (err) { console.warn("Warn leave presença:", err); }
              }
              if (['initialized', 'attaching', 'attached'].includes(presenceCh.state)) {
                 try { await presenceCh.detach(); console.log("Detach presença OK."); } catch(e) { console.warn("Warn detach presença:", e); }
              }
            }
            // Limpeza Mensagens
            if (messageCh) {
              console.log(`Limpando mensagens (estado: ${messageCh.state})...`);
               if (messageSub && typeof messageSub.unsubscribe === 'function') {
                 try { await messageSub.unsubscribe(); console.log("Unsub mensagens OK."); } catch(e) { console.warn("Warn unsub msgs:", e)}
               }
               if (['initialized', 'attaching', 'attached'].includes(messageCh.state)) {
                  try { await messageCh.detach(); console.log("Detach mensagens OK."); } catch (e) { console.warn("Warn detach mensagens:", e); }
               }
            }
          } catch (e) { console.warn("Warn limpeza canais:", e);
          } finally {
            // Fechar Cliente
            if (clientToClose) {
              console.log(`Fechando conexão Ably (estado: ${clientToClose.connection.state})...`);
              clientToClose.connection.off();
              if (['initialized', 'connecting', 'connected', 'disconnected', 'suspended', 'closing'].includes(clientToClose.connection.state)) {
                  clientToClose.close(); console.log("Conexão Ably fechada/fechando.");
              } else { console.log(`Conexão Ably já ${clientToClose.connection.state}, não fechando.`); }
            }
            setPresenceMap(new Map());
            console.log("Cleanup: Limpeza Ably concluída.");
          }
        })();
      } else if (ablyClientRef.current) {
          console.log(`Cleanup: Skipped (isOpen: ${isOpen}, status: ${status}, cleanupStarted: ${cleanupStartedRef.current})`);
      }
    };
  // Dependências Corretas
  }, [isOpen, currentUserId, status, fetchConversations]); // Adicionado fetchConversations
  // --- Fim Efeito Ably ---


  // Efeito para buscar conversas inicialmente
  useEffect(() => { fetchConversations(true); }, [fetchConversations]); // true para loading inicial

  // Função para buscar mensagens
  const fetchMessages = useCallback(async (userId: string | null) => {
    if (!userId) { setMessages([]); return; }
    setIsLoadingMessages(true); setErrorMessages(null);
    try {
      const response = await fetch(`/api/chat/messages/${userId}`);
      if (!response.ok) throw new Error('Falha ao buscar mensagens.');
      const data: Message[] = await response.json();
      setMessages(data);
    } catch (err: any) { setErrorMessages(err.message || 'Erro mensagens.');
    } finally { setIsLoadingMessages(false); }
  }, []);

  // Efeito para buscar mensagens quando selectedUserId muda
  useEffect(() => { fetchMessages(selectedUserId); }, [selectedUserId, fetchMessages]);

  // Efeito para rolar para a última mensagem
  useEffect(() => {
    const timer = setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 150);
    return () => clearTimeout(timer);
  }, [messages]);

  // Função para enviar mensagem
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedUserId || isSending || !currentUserId) return;
    setIsSending(true); setErrorMessages(null);
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = { id: tempId, content: newMessage.trim(), createdAt: new Date(), senderId: currentUserId!, receiverId: selectedUserId, sender: { id: currentUserId!, name: session?.user?.name || 'Eu', image: session?.user?.image || null }};
    setMessages(prev => [...prev, optimisticMessage]);
    const messageToSend = newMessage.trim();
    setNewMessage('');
    try {
      const response = await fetch(`/api/chat/messages/${selectedUserId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: messageToSend }), });
      const responseBody = await response.json();
      if (!response.ok) { throw new Error(responseBody.error || 'Falha ao enviar.'); }
      const sentMessage: Message = responseBody;
      setMessages(prev => prev.map(msg => msg.id === tempId ? sentMessage : msg));
      // Otimização: Atualiza lista localmente e reordena
      setConversations(prev => {
          const updatedConvoIndex = prev.findIndex(c => c.otherUser.id === selectedUserId);
          let updatedList = [...prev];
          if (updatedConvoIndex > -1) {
              const updatedConvo = { ...updatedList[updatedConvoIndex], lastMessage: { ...sentMessage, createdAt: sentMessage.createdAt }};
              updatedList.splice(updatedConvoIndex, 1); updatedList.unshift(updatedConvo);
          } else {
               // Encontra ou cria um objeto otherUser para a nova conversa
               const otherUserInfo = allUsers.find(u => u.id === selectedUserId) || { id: selectedUserId, name: 'Novo Chat', image: null }; // Fallback para novo chat
               const newConvo: ConversationListItem = { otherUser: otherUserInfo, lastMessage: { ...sentMessage, createdAt: sentMessage.createdAt } };
               updatedList.unshift(newConvo);
          }
          return updatedList;
        });

    } catch (err: any) { console.error("Erro enviar:", err); setErrorMessages(err.message || 'Erro.'); setMessages(prev => prev.filter(msg => msg.id !== tempId)); setNewMessage(messageToSend);
    } finally { setIsSending(false); }
  };

  // Encontra o nome do usuário selecionado
  const selectedUserName = useMemo(() => {
    if (!selectedUserId) return 'Chat';
    const convoUser = conversations.find(c => c.otherUser.id === selectedUserId)?.otherUser;
    if (convoUser) return convoUser.name || 'Usuário';
    const newUser = allUsers.find(u => u.id === selectedUserId);
    return newUser?.name || 'Novo Chat';
  }, [selectedUserId, conversations, allUsers]);

  // Filtra a lista de TODOS os usuários
  const filteredAllUsers = useMemo(() => {
    if (!userSearchTerm) return allUsers.filter(user => user.id !== currentUserId); // Exclui o usuário atual da busca
    return allUsers.filter(user => user.id !== currentUserId && user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()));
  }, [allUsers, userSearchTerm, currentUserId]);


  // ================================================================
  // --- Componentes Internos com Design Melhorado ---
  // ================================================================

  const ConversationItem = ({ convo }: { convo: ConversationListItem }) => {
      const userStatus = presenceMap.get(convo.otherUser.id) || 'offline';
      const isSelected = selectedUserId === convo.otherUser.id && !isSearchingUsers; // Simplifica verificação

      return (
        <button
          key={convo.otherUser.id}
          onClick={() => { setSelectedUserId(convo.otherUser.id); setIsSearchingUsers(false); }}
          // ** DESIGN MELHORADO **
          className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-150 group ${
            isSelected
              ? 'bg-neutral-100' // Fundo mais claro para selecionado
              : 'hover:bg-gray-50' // Hover sutil
          }`}
        >
           {/* Indicador de Seleção (mais sutil ou diferente) */}
           {isSelected && <span className="absolute left-0 top-2 bottom-2 w-1 bg-neutral-600 rounded-r-full"></span>}

          {/* Avatar com Status Dot */}
          <div className="relative flex-shrink-0">
             <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-gray-200"> {/* Avatar ligeiramente maior */}
                {convo.otherUser.image ? <img src={convo.otherUser.image} alt={convo.otherUser.name || ''} className="w-full h-full object-cover" /> : <UserCircle size={24} className="text-gray-400" />} {/* Ícone maior */}
             </div>
             <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${ // Status dot ligeiramente maior
                userStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
             }`} title={userStatus === 'online' ? 'Online' : 'Offline'}></span>
          </div>

          {/* Texto (Nome, Preview, Timestamp) */}
          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-baseline mb-0.5"> {/* Menos margem abaixo */}
                 <p className={`text-sm font-semibold truncate ${isSelected ? 'text-neutral-800' : 'text-gray-800'}`}>{convo.otherUser.name || 'Usuário'}</p>
                 <span className="text-[11px] text-gray-500 flex-shrink-0 ml-2">{formatDateTime(convo.lastMessage.createdAt, 'short')}</span> {/* Cor timestamp mais escura */}
             </div>
             <p className="text-xs text-gray-500 truncate group-hover:text-gray-600">{convo.lastMessage.content}</p> {/* Preview mais claro */}
          </div>
        </button>
      );
  };

  const UserSearchItem = ({ user }: { user: UserInfo }) => {
      const userStatus = presenceMap.get(user.id) || 'offline';
      return (
        <button
            key={user.id}
            onClick={() => { setSelectedUserId(user.id); setIsSearchingUsers(false); }}
             // ** DESIGN MELHORADO (similar ao ConversationItem) **
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-50 transition-colors duration-150"
        >
            <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                    {user.image ? <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" /> : <UserCircle size={24} className="text-gray-400" />}
                </div>
                <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                    userStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
                 }`} title={userStatus === 'online' ? 'Online' : 'Offline'}></span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user.name || 'Usuário'}</p>
                {/* Pode adicionar email ou cargo aqui se desejar */}
                 {/* <p className="text-xs text-gray-500 truncate">{user.email || ''}</p> */}
            </div>
        </button>
      );
  };

  const MessageItem = ({ msg, showAvatar }: { msg: Message, showAvatar: boolean }) => {
    const isCurrentUser = msg.senderId === currentUserId;
    return (
        // ** DESIGN MELHORADO **
        <div className={`flex items-end gap-2.5 mb-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}> {/* Mais gap e margin-bottom */}
         {/* Avatar (ligeiramente maior) */}
         <div className="w-8 flex-shrink-0 mb-1 self-end"> {/* Avatar alinhado em baixo */}
             {!isCurrentUser && showAvatar && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-100">
                     {msg.sender.image ? <img src={msg.sender.image} alt={msg.sender.name || ''} className="w-full h-full object-cover" /> : <UserCircle size={16} className="text-gray-400" />}
                </div>
             )}
             {/* Espaço vazio para alinhar mensagens do usuário */}
             {!isCurrentUser && !showAvatar && (
                 <div className="w-8 h-8"></div>
             )}
         </div>

        {/* Balão e Timestamp */}
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-lg shadow-sm ${ // Mais padding, cantos mais suaves
                isCurrentUser
                ? 'bg-neutral-800 text-white rounded-br-none' // Mantém o estilo "tail"
                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none' // Fundo branco com borda sutil
            }`}>
              <p className="text-sm break-words">{msg.content}</p>
            </div>
            {/* Timestamp (mais sutil) */}
             <span className={`text-[11px] text-gray-500 mt-1 px-1`}>
                 {formatDateTime(msg.createdAt, 'full')}
             </span>
        </div>
      </div>
    );
  };

// ================================================================
// --- Renderização Principal com Design Melhorado ---
// ================================================================

  if (!isOpen) { return null; }

  return (
    // ** DESIGN MELHORADO **
    <div className="fixed top-0 right-0 bottom-0 w-full md:w-[700px] lg:w-[800px] bg-white border-l border-gray-200 shadow-xl z-[45] flex flex-col animate-fade-in"> {/* Mais largo */}

      {/* Cabeçalho Principal (mais padding) */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0 bg-white">
        <h2 className="text-lg font-semibold text-gray-800">Chat Interno</h2>
        <button onClick={onClose} className="p-1.5 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100" aria-label="Fechar chat"><X size={22} /></button>
      </div>

      {/* Corpo */}
      <div className="flex flex-1 overflow-hidden">

        {/* Coluna Esquerda (Conversas) */}
        <div className="w-[35%] xl:w-[30%] border-r border-gray-100 flex flex-col bg-white"> {/* Ajuste de largura */}
            {/* Busca / Nova Conversa */}
            <div className='p-4 border-b border-gray-100 flex-shrink-0'>
                {isSearchingUsers ? (
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={18} /></span>
                        {/* Input com mais padding */}
                        <input type="search" placeholder="Buscar usuário..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} className="w-full pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 bg-gray-50 shadow-sm" autoFocus />
                         <button onClick={() => setIsSearchingUsers(false)} className='absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600' title="Cancelar busca"><X size={20}/></button>
                    </div>
                ) : (
                    // Botão "Nova Conversa" com mais destaque
                    <button onClick={() => setIsSearchingUsers(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors duration-150 shadow-sm">
                        <UserPlus size={16}/> Nova Conversa
                    </button>
                )}
            </div>

            {/* Lista (mais padding) */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1"> {/* Aumentado space-y */}
                {isSearchingUsers ? (
                    <>
                        {isLoadingAllUsers && <div className="p-4 text-center text-gray-500 text-sm flex items-center justify-center"><Loader2 className="animate-spin mr-2" size={16}/> Carregando...</div>}
                        {errorAllUsers && <div className="p-4 text-center text-red-600 text-xs">{errorAllUsers}</div>}
                        {!isLoadingAllUsers && !errorAllUsers && filteredAllUsers.length === 0 && <p className="p-4 text-center text-gray-500 text-sm">Nenhum usuário encontrado.</p>}
                        {!isLoadingAllUsers && !errorAllUsers && filteredAllUsers.map(user => <UserSearchItem key={user.id} user={user} />)}
                    </>
                ) : (
                    <>
                        {isLoadingConversations && <div className="p-4 text-center text-gray-500 text-sm flex items-center justify-center"><Loader2 className="animate-spin mr-2" size={16}/> Carregando...</div>}
                        {errorConversations && !isLoadingConversations && <div className="p-4 text-center text-red-600 text-xs">{errorConversations}</div>}
                        {!isLoadingConversations && !errorConversations && conversations.length === 0 && <p className="p-4 text-center text-gray-500 text-sm">Nenhuma conversa ativa.</p>}
                        {!isLoadingConversations && !errorConversations && conversations.map(convo => <ConversationItem key={convo.otherUser.id} convo={convo} />)}
                    </>
                )}
            </div>
        </div>

        {/* Coluna Direita (Chat Ativo) */}
        <div className="flex-1 flex flex-col bg-gray-50"> {/* w-2/3 removido, flex-1 preenche */}
          {selectedUserId ? (
            <>
              {/* Cabeçalho Conversa (mais padding, avatar maior) */}
               <div className="p-4 border-b border-gray-100 flex-shrink-0 bg-white flex items-center gap-3 shadow-sm">
                     <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100"> {/* Avatar maior */}
                         {(conversations.find(c=>c.otherUser.id === selectedUserId)?.otherUser.image || allUsers.find(u=>u.id === selectedUserId)?.image)
                            ? <img src={(conversations.find(c=>c.otherUser.id === selectedUserId)?.otherUser.image || allUsers.find(u=>u.id === selectedUserId)?.image)!} alt="" className="w-full h-full object-cover"/>
                            : <UserCircle size={22} className="text-gray-400"/>
                         }
                     </div>
                    {/* Nome e Status */}
                    <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800 text-base leading-tight">{selectedUserName}</h3>
                        {/* Status (texto em vez de só ponto, ou ponto + texto) */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                             <span className={`block h-2 w-2 rounded-full ${(presenceMap.get(selectedUserId) === 'online') ? 'bg-green-500' : 'bg-gray-400' }`}></span>
                             <span className="text-xs text-gray-500">{(presenceMap.get(selectedUserId) === 'online') ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>
                     {/* Adicionar botões de ação aqui se necessário (ex: Ligar, Ver Perfil) */}
               </div>

              {/* Área Mensagens (mais padding, mais espaço entre msgs) */}
              <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-gray-100"> {/* Fundo ligeiramente diferente */}
                {isLoadingMessages && <div className="text-center text-gray-500 text-sm py-10 flex items-center justify-center"><Loader2 className="animate-spin mr-2" size={18}/> Carregando mensagens...</div>}
                {errorMessages && !isSending && <div className="text-center text-red-600 text-sm mb-2 py-10">{errorMessages}</div>}
                {!isLoadingMessages && messages.length === 0 && !errorMessages && <p className="text-center text-gray-500 text-sm py-10">Inicie a conversa!</p>}
                {!isLoadingMessages && messages.map((msg, index) => {
                     const prevMsg = messages[index - 1];
                     const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
                     // Adicionar espaçamento extra se o remetente mudar
                     const marginTopClass = index > 0 && prevMsg && prevMsg.senderId !== msg.senderId ? 'mt-4' : '';
                     return <div key={msg.id} className={marginTopClass}><MessageItem msg={msg} showAvatar={showAvatar} /></div>; // Adicionado key aqui
                 })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Envio (mais padding, input e botão melhorados) */}
              <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white shadow-inner">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                   {/* Botão de Anexo (Exemplo) */}
                  <button type="button" className="p-2.5 text-gray-500 hover:text-neutral-700 hover:bg-gray-100 rounded-full transition-colors duration-150" aria-label="Anexar arquivo" disabled={isLoadingMessages || isSending} onClick={() => alert('Anexar (Implementar)')}>
                     <Paperclip size={20} />
                  </button>

                  {/* Input de Texto */}
                  <input
                    type="text" placeholder="Digite sua mensagem..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    // ** DESIGN MELHORADO **
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={isLoadingMessages || isSending}
                  />

                  {/* Botão Enviar */}
                  <button type="submit"
                   // ** DESIGN MELHORADO **
                    className="bg-neutral-800 text-white p-3 rounded-full hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex-shrink-0 transform active:scale-95 shadow-sm"
                    disabled={!newMessage.trim() || isLoadingMessages || isSending}
                    aria-label="Enviar mensagem">
                    {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  </button>
                </form>
                 {errorMessages && isSending && <p className="text-xs text-red-600 mt-1.5 pl-2">{errorMessages}</p>}
              </div>
            </>
          ) : (
             // Mensagem quando nenhuma conversa está selecionada
             <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center text-sm p-10 bg-gray-100">
                <MessageSquare size={48} className="text-gray-300 mb-4"/> {/* Agora o componente está definido */}
                <p className="font-medium text-base text-gray-600">Selecione uma conversa</p>
                <p>Ou inicie uma nova clicando em &quot;Nova Conversa&quot;.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}