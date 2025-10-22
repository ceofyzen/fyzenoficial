// src/app/(admin)/ChatPanel.tsx
'use client';

import { X, Send, UserCircle, Loader2, AlertTriangle, Search, UserPlus } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
// Importar Ably e os TIPOS que realmente precisamos
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
  // ** Usar Refs para instâncias Ably **
  const ablyClientRef = useRef<Ably.Realtime | null>(null);
  const messageChannelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  // Refs para guardar as subscrições (sem tipo explícito problemático)
  const messageSubscriptionRef = useRef<any>(null); // Deixar inferir ou usar any
  const presenceSubscriptionRef = useRef<any>(null); // Deixar inferir ou usar any

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
    if (showLoading && !isLoadingConversations) setIsLoadingConversations(true);
    try {
      const response = await fetch('/api/chat/conversations');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: ConversationListItem[] = await response.json();
      setConversations(data);
      if (errorConversations) setErrorConversations(null);
    } catch (err: any) {
      console.error("Erro fetchConversations:", err);
      setErrorConversations(err.message || 'Erro ao carregar conversas.');
    } finally {
      if (showLoading) setIsLoadingConversations(false);
    }
  }, [isOpen, currentUserId, status, errorConversations, isLoadingConversations]);

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

  // --- Efeito ÚNICO para Gerenciar Conexão, Presença e Mensagens ---
  useEffect(() => {
    if (!isOpen || !currentUserId || status !== 'authenticated') {
        // Limpeza se fechar/deslogar
        ablyClientRef.current?.close(); ablyClientRef.current = null; messageChannelRef.current = null; presenceChannelRef.current = null; messageSubscriptionRef.current = null; presenceSubscriptionRef.current = null; setPresenceMap(new Map()); console.log("Cleanup: Painel fechado/deslogado.");
        return;
    }
    if (ablyClientRef.current) { console.log("Ably já existe."); return; } // Evita reconectar

    console.log("Iniciando conexão Ably...");
    cleanupStartedRef.current = false;
    let localClient: Ably.Realtime | null = null;
    try {
        localClient = new Ably.Realtime({ authUrl: '/api/ably-auth', authMethod: 'GET', clientId: currentUserId });
        ablyClientRef.current = localClient;

        localClient.connection.on('connected', async () => {
            console.log('Ably: Conectado!');
            if (!ablyClientRef.current) return;

            // --- Presença ---
            try {
                const presenceChName = 'presence-status';
                presenceChannelRef.current = ablyClientRef.current.channels.get(presenceChName);
                presenceChannelRef.current.presence.unsubscribe(); // Limpa listeners
                presenceSubscriptionRef.current = await presenceChannelRef.current.presence.subscribe(['enter', 'leave', 'update'], (msg: PresenceMessage) => {
                    setPresenceMap(prev => new Map(prev).set(msg.clientId, msg.action === 'leave' ? 'offline' : (msg.data?.status as PresenceStatus || 'online')));
                });
                const initialPresence = await presenceChannelRef.current.presence.get();
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

            // --- Mensagens ---
            try {
                const messageChName = `private-chat-${currentUserId}`;
                messageChannelRef.current = ablyClientRef.current.channels.get(messageChName);
                messageChannelRef.current.unsubscribe(); // Limpa listeners
                messageSubscriptionRef.current = await messageChannelRef.current.subscribe('new-message', (message: AblyMessage) => {
                    const newMessageData = message.data as Message;
                    setMessages(prev => (newMessageData.senderId === selectedUserId || newMessageData.receiverId === selectedUserId) && !prev.some(m => m.id === newMessageData.id) ? [...prev, newMessageData] : prev);
                    fetchConversations();
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

    // --- Função de Limpeza REFINADA ---
    return () => {
      if (!cleanupStartedRef.current && ablyClientRef.current) {
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
              if (presenceSub && typeof presenceSub.unsubscribe === 'function') { // Verifica se tem unsubscribe
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
               if (messageSub && typeof messageSub.unsubscribe === 'function') { // Verifica se tem unsubscribe
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
  }, [isOpen, currentUserId, status]);
  // --- Fim Efeito Ably ---


  // Efeito para buscar conversas inicialmente
  useEffect(() => { fetchConversations(true); }, [fetchConversations]);

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
               const otherUser = allUsers.find(u => u.id === selectedUserId) || { id: selectedUserId, name: 'Novo Chat', image: null };
               const newConvo: ConversationListItem = { otherUser, lastMessage: { ...sentMessage, createdAt: sentMessage.createdAt } };
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
    if (!userSearchTerm) return allUsers;
    return allUsers.filter(user => user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()));
  }, [allUsers, userSearchTerm]);


  // --- Componentes Internos com Indicador de Status ---
  const ConversationItem = ({ convo }: { convo: ConversationListItem }) => {
      const userStatus = presenceMap.get(convo.otherUser.id) || 'offline';
      return (
        <button
          key={convo.otherUser.id}
          onClick={() => { setSelectedUserId(convo.otherUser.id); setIsSearchingUsers(false); }}
          className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-150 group ${
            selectedUserId === convo.otherUser.id && !isSearchingUsers ? 'bg-neutral-100' : 'hover:bg-gray-100'
          }`}
        >
           {selectedUserId === convo.otherUser.id && !isSearchingUsers && <span className="absolute left-0 top-2 bottom-2 w-1 bg-neutral-600 rounded-r-full"></span>}
          <div className="relative flex-shrink-0">
             <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-gray-200">
                {convo.otherUser.image ? <img src={convo.otherUser.image} alt={convo.otherUser.name || ''} className="w-full h-full object-cover" /> : <UserCircle size={20} className="text-gray-400" />}
             </div>
             <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                userStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
             }`} title={userStatus === 'online' ? 'Online' : 'Offline'}></span>
          </div>
          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-baseline">
                 <p className={`text-sm font-semibold truncate ${selectedUserId === convo.otherUser.id && !isSearchingUsers ? 'text-neutral-800' : 'text-gray-800'}`}>{convo.otherUser.name || 'Usuário'}</p>
                 <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">{formatDateTime(convo.lastMessage.createdAt, 'short')}</span>
             </div>
             <p className="text-xs text-gray-500 truncate mt-0.5 group-hover:text-gray-600">{convo.lastMessage.content}</p>
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 transition-colors duration-150"
        >
            <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                    {user.image ? <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" /> : <UserCircle size={20} className="text-gray-400" />}
                </div>
                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                    userStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
                 }`} title={userStatus === 'online' ? 'Online' : 'Offline'}></span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user.name || 'Usuário'}</p>
            </div>
        </button>
      );
  };

  const MessageItem = ({ msg, showAvatar }: { msg: Message, showAvatar: boolean }) => {
    const isCurrentUser = msg.senderId === currentUserId;
    return (
      <div className={`flex items-end gap-2 mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
         <div className="w-6 flex-shrink-0 mb-1">
             {!isCurrentUser && showAvatar && (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                     {msg.sender.image ? <img src={msg.sender.image} alt={msg.sender.name || ''} className="w-full h-full object-cover" /> : <UserCircle size={14} className="text-gray-400" />}
                </div>
             )}
         </div>
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[75%] px-3.5 py-2 rounded-xl shadow-sm ${
                isCurrentUser
                ? 'bg-neutral-800 text-white rounded-br-none'
                : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
            }`}>
              <p className="text-sm break-words">{msg.content}</p>
            </div>
             <span className={`text-[10px] text-gray-400 mt-0.5 px-1`}>
                 {formatDateTime(msg.createdAt, 'full')}
             </span>
        </div>
      </div>
    );
  };

// --- Renderização Principal ---
  if (!isOpen) { return null; }

  return (
    <div className="fixed top-16 right-0 bottom-0 w-full md:w-[600px] lg:w-[700px] bg-white border-l border-gray-200 shadow-xl z-[45] flex flex-col animate-fade-in">
      {/* Cabeçalho Principal */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100 flex-shrink-0 bg-white">
        <h2 className="text-lg font-semibold text-gray-800">Chat Interno</h2>
        <button onClick={onClose} className="p-1 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100" aria-label="Fechar chat"><X size={20} /></button>
      </div>

      {/* Corpo */}
      <div className="flex flex-1 overflow-hidden">

        {/* Coluna Esquerda */}
        <div className="w-1/3 border-r border-gray-100 flex flex-col bg-white">
            {/* Busca / Nova Conversa */}
            <div className='p-3 border-b border-gray-100 flex-shrink-0'>
                {isSearchingUsers ? (
                     <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"><Search size={16} /></span>
                        <input type="search" placeholder="Buscar usuário..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 bg-gray-50" autoFocus />
                         <button onClick={() => setIsSearchingUsers(false)} className='absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600' title="Cancelar busca"><X size={18}/></button>
                    </div>
                ) : (
                    <button onClick={() => setIsSearchingUsers(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150">
                        <UserPlus size={16}/> Nova Conversa
                    </button>
                )}
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {isSearchingUsers ? (
                    <>
                        {isLoadingAllUsers && <div className="p-4 text-center text-gray-400 text-sm"><Loader2 className="animate-spin inline mr-2" size={14}/> Carregando...</div>}
                        {errorAllUsers && <div className="p-4 text-center text-red-500 text-xs">{errorAllUsers}</div>}
                        {!isLoadingAllUsers && !errorAllUsers && filteredAllUsers.length === 0 && <p className="p-4 text-center text-gray-400 text-sm">Nenhum usuário.</p>}
                        {!isLoadingAllUsers && !errorAllUsers && filteredAllUsers.map(user => <UserSearchItem key={user.id} user={user} />)}
                    </>
                ) : (
                    <>
                        {isLoadingConversations && <div className="p-4 text-center text-gray-400 text-sm"><Loader2 className="animate-spin inline mr-2" size={14}/> Carregando...</div>}
                        {errorConversations && <div className="p-4 text-center text-red-500 text-xs">{errorConversations}</div>}
                        {!isLoadingConversations && !errorConversations && conversations.length === 0 && <p className="p-4 text-center text-gray-400 text-sm">Nenhuma conversa.</p>}
                        {!isLoadingConversations && !errorConversations && conversations.map(convo => <ConversationItem key={convo.otherUser.id} convo={convo} />)}
                    </>
                )}
            </div>
        </div>

        {/* Coluna Direita */}
        <div className="w-2/3 flex flex-col bg-gray-50">
          {selectedUserId ? (
            <>
              {/* Cabeçalho Conversa */}
               <div className="p-3 border-b border-gray-100 flex-shrink-0 bg-white flex items-center gap-2 shadow-sm">
                     <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                         {(conversations.find(c=>c.otherUser.id === selectedUserId)?.otherUser.image || allUsers.find(u=>u.id === selectedUserId)?.image)
                            ? <img src={(conversations.find(c=>c.otherUser.id === selectedUserId)?.otherUser.image || allUsers.find(u=>u.id === selectedUserId)?.image)!} alt="" className="w-full h-full object-cover"/>
                            : <UserCircle size={18} className="text-gray-400"/>
                         }
                     </div>
                    <h3 className="font-semibold text-gray-800 text-base">{selectedUserName}</h3>
                    {/* Indicador de Status no Header da Conversa */}
                     <span className={`block h-2 w-2 rounded-full ml-1 ${ (presenceMap.get(selectedUserId) === 'online') ? 'bg-green-500' : 'bg-gray-400' }`} title={(presenceMap.get(selectedUserId) === 'online') ? 'Online' : 'Offline'}></span>
               </div>

              {/* Área Mensagens */}
              <div className="flex-1 p-4 overflow-y-auto space-y-1">
                {isLoadingMessages && <div className="text-center text-gray-400 text-sm py-10"><Loader2 className="animate-spin inline mr-2" size={16}/> Carregando...</div>}
                {errorMessages && !isSending && <div className="text-center text-red-500 text-xs mb-2 py-10">{errorMessages}</div>}
                {!isLoadingMessages && messages.length === 0 && !errorMessages && <p className="text-center text-gray-400 text-sm py-10">Inicie a conversa!</p>}
                {/* Lógica para mostrar avatar apenas na primeira msg consecutiva */}
                {!isLoadingMessages && messages.map((msg, index) => {
                     const prevMsg = messages[index - 1];
                     // Mostrar avatar se for a primeira mensagem ou se o remetente for diferente do anterior
                     const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
                     return <MessageItem key={msg.id} msg={msg} showAvatar={showAvatar} />;
                 })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Envio */}
              <div className="p-3 border-t border-gray-100 flex-shrink-0 bg-white shadow-inner">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                  <input
                    type="text" placeholder="Digite sua mensagem..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 bg-gray-100 disabled:bg-gray-200"
                    disabled={isLoadingMessages || isSending}
                  />
                  <button type="submit" className="bg-neutral-800 text-white p-2.5 rounded-full hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex-shrink-0" disabled={!newMessage.trim() || isLoadingMessages || isSending} aria-label="Enviar mensagem">
                    {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  </button>
                </form>
                 {errorMessages && isSending && <p className="text-xs text-red-500 mt-1 pl-2">{errorMessages}</p>}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm p-4">Selecione uma conversa ou inicie uma nova.</div>
          )}
        </div>
      </div>
    </div>
  );
}