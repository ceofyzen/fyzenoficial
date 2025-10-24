// src/app/(admin)/admin/permissoes/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Loader2, AlertTriangle, ShieldCheck, Save, CheckCircle, Search, Info,
    User as UserIcon, UserCircle as UserCircleIcon
    // CheckSquare, Square removidos pois não são mais usados diretamente
} from 'lucide-react';
import { PermissionTargetType } from '@prisma/client'; // Assuming types are generated

// --- Tipos Locais ---
type UserListItem = {
    id: string;
    name: string | null;
    image: string | null;
    roleName?: string | null;
};

type PermissionDefinitionItem = {
    id: string; // Adicionado ID
    action: string;
    description: string;
};
type GroupedPermissionDefinitions = {
    [category: string]: PermissionDefinitionItem[];
};

// --- Componente Principal ---
export default function PermissoesPage() {
    // Estados da UI e Dados
    const [usersList, setUsersList] = useState<UserListItem[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
    const [permissionDefinitions, setPermissionDefinitions] = useState<GroupedPermissionDefinitions>({});
    const [allowedActions, setAllowedActions] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    // Estados de Loading e Feedback
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isLoadingDefinitions, setIsLoadingDefinitions] = useState(true);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // --- Funções de Fetch ---
    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true); setError(null);
        try {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error(`Erro ${response.status} ao buscar usuários`);
            const data: UserListItem[] = await response.json();
            setUsersList(data);
            if (selectedUser && !data.some(u => u.id === selectedUser.id)) {
                setSelectedUser(null); setAllowedActions(new Set());
            }
        } catch (err) { /* ... (tratamento de erro existente) ... */ setError(err instanceof Error ? err.message : 'Erro ao carregar usuários.'); setUsersList([]); setSelectedUser(null); setAllowedActions(new Set()); }
        finally { setIsLoadingUsers(false); }
    }, [selectedUser]); // Adicionado selectedUser como dependência para a lógica de limpar seleção

    const fetchDefinitions = useCallback(async () => {
        setIsLoadingDefinitions(true); setError(null);
        try {
            const response = await fetch('/api/permissions/definitions');
            if (!response.ok) throw new Error(`Erro ${response.status} ao buscar definições`);
            const data: GroupedPermissionDefinitions = await response.json();
            setPermissionDefinitions(data);
        } catch (err) { /* ... (tratamento de erro existente) ... */ setError(err instanceof Error ? err.message : 'Erro ao carregar definições de permissão.'); setPermissionDefinitions({}); }
        finally { setIsLoadingDefinitions(false); }
    }, []);

    const fetchPermissionsForUser = useCallback(async (userId: string | null) => {
        if (!userId) { setAllowedActions(new Set()); setIsLoadingPermissions(false); return; }
        setIsLoadingPermissions(true); setSaveSuccess(false); setSaveError(null);
        try {
            const response = await fetch(`/api/permissions/user/${userId}`);
            if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.error || `Erro ${response.status} buscando permissões`); }
            const actionsArray: string[] = await response.json();
            setAllowedActions(new Set(actionsArray));
        } catch (err) { /* ... (tratamento de erro existente) ... */ setError(err instanceof Error ? err.message : 'Erro ao carregar permissões do usuário.'); setAllowedActions(new Set()); }
        finally { setIsLoadingPermissions(false); }
    }, []);

    // --- Efeitos ---
    useEffect(() => { fetchUsers(); fetchDefinitions(); }, [fetchUsers, fetchDefinitions]);
    useEffect(() => { fetchPermissionsForUser(selectedUser?.id ?? null); }, [selectedUser, fetchPermissionsForUser]);

    // --- Filtragem da Lista de Usuários ---
    const filteredUsers = useMemo(() => {
        if (!searchTerm) return usersList;
        const lowerSearchTerm = searchTerm.toLowerCase();
        return usersList.filter(user => user.name?.toLowerCase().includes(lowerSearchTerm) || user.roleName?.toLowerCase().includes(lowerSearchTerm));
    }, [usersList, searchTerm]);

    // --- Funções de Manipulação ---
    const handleUserSelect = (user: UserListItem) => { if (selectedUser?.id !== user.id) { setSelectedUser(user); } };

    const handlePermissionChange = (action: string, isChecked: boolean) => {
        setAllowedActions(prev => { const newSet = new Set(prev); if (isChecked) { newSet.add(action); } else { newSet.delete(action); } return newSet; });
        setSaveSuccess(false); setSaveError(null);
    };

    const handleSaveChanges = async () => { /* ... (função save existente, sem alterações) ... */
        if (!selectedUser || isLoadingPermissions) return;
        setIsSaving(true); setSaveSuccess(false); setSaveError(null); setError(null);
        const actionsToSave = Array.from(allowedActions);
        try {
            const response = await fetch(`/api/permissions/user/${selectedUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actions: actionsToSave }), });
            if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.error || `Erro ${response.status} ao salvar`); }
            setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3500);
        } catch (err) { const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido ao salvar'; console.error(`Erro ao salvar permissões para ${selectedUser.id}:`, err); setSaveError(errorMsg); }
        finally { setIsSaving(false); }
    };

    // --- Renderização ---
    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 p-3 rounded-xl shadow-lg"><ShieldCheck size={32} className="text-white" /></div>
                    Gerenciar Permissões por Usuário
                </h1>
            </div>

            {/* Exibição de Erro Geral ou de Salvamento */}
            {(error || saveError) && ( /* ... (bloco de erro existente) ... */
                <div className={`text-center py-3 px-4 text-sm rounded-md border ${saveError ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    <AlertTriangle size={16} className="inline-block mr-2 -mt-0.5" /> {saveError ? `Erro ao salvar: ${saveError}` : error}
                    {!saveError && ( <button onClick={() => { setError(null); fetchUsers(); fetchDefinitions(); }} className="ml-3 px-2 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-medium"> Tentar Novamente </button> )}
                </div>
            )}

            {/* Layout Principal (2 colunas) */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Coluna Esquerda: Lista de Usuários */}
                <div className="lg:w-[350px] xl:w-[400px] flex-shrink-0">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[calc(100vh-14rem)]">
                        {/* Barra de Busca */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={16} /></span>
                                <input type="search" placeholder="Buscar usuário ou cargo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={isLoadingUsers || isLoadingDefinitions} className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 shadow-sm disabled:bg-gray-100" />
                            </div>
                        </div>

                        {/* Lista de Usuários */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoadingUsers || isLoadingDefinitions ? ( /* ... (loading state) ... */
                                <div className="p-6 text-center text-gray-500 flex items-center justify-center"><Loader2 className="animate-spin mr-2" size={18} /> Carregando...</div>
                            ) : error && !saveError ? ( /* Mostrar erro de fetch aqui se não for erro de save */
                                <div className="p-6 text-center text-red-600 text-sm">{error}</div>
                            ) : filteredUsers.length === 0 ? ( /* ... (estado vazio) ... */
                                <p className="p-6 text-center text-gray-500 text-sm">{searchTerm ? `Nenhum usuário encontrado para "${searchTerm}".` : 'Nenhum usuário encontrado.'}</p>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredUsers.map((user) => ( /* ... (renderização do botão do usuário) ... */
                                        <button key={user.id} onClick={() => handleUserSelect(user)} disabled={isLoadingPermissions || isSaving} className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${selectedUser?.id === user.id ? 'bg-neutral-100 border-l-4 border-neutral-700' : 'hover:bg-gray-50'}`}>
                                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                                                {user.image ? (<img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />) : (<UserCircleIcon size={20} className="text-gray-400" />)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold truncate ${selectedUser?.id === user.id ? 'text-neutral-900' : 'text-gray-800'}`}>{user.name || 'Usuário sem nome'}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.roleName || 'Sem cargo'}</p>
                                            </div>
                                            {selectedUser?.id === user.id && <CheckCircle size={16} className="text-neutral-600 flex-shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Coluna Direita: Permissões */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm min-h-[calc(100vh-14rem)] flex flex-col">
                        {/* Cabeçalho com Botão Salvar */}
                        <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-3">
                             <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2"><ShieldCheck size={18} className="text-neutral-700" />{selectedUser ? `Permissões de ${selectedUser.name}` : 'Selecione um Usuário'}</h2>
                            <div className="flex items-center gap-3">
                                {saveSuccess && ( <span className="text-xs font-medium text-green-600 flex items-center gap-1 animate-fade-in"><CheckCircle size={14}/> Salvo!</span> )}
                                <button onClick={handleSaveChanges} disabled={!selectedUser || isLoadingPermissions || isSaving} className={`bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold py-2 px-4 rounded-md inline-flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-neutral-500`}>
                                    {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} {isSaving ? 'Salvando...' : 'Salvar Permissões'}
                                </button>
                             </div>
                        </div>

                        {/* Grid de Toggles */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            {isLoadingPermissions ? ( /* ... (loading state) ... */
                                <div className="text-center text-gray-500 pt-10"><Loader2 className="animate-spin mx-auto mb-2" size={24} /> Carregando permissões...</div>
                            ) : !selectedUser ? ( /* ... (estado sem usuário selecionado) ... */
                                <div className="text-center text-gray-400 pt-10 px-4"><UserIcon size={40} className="mx-auto mb-3"/><p>Selecione um usuário na lista à esquerda.</p></div>
                            ) : error && !saveError ? ( /* ... (erro de carregamento) ... */
                                <div className="text-center text-red-600 pt-10 px-4"><AlertTriangle size={32} className="mx-auto mb-3"/><p className="font-semibold">Erro ao carregar permissões</p><p className="text-sm">{error}</p></div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(permissionDefinitions).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, definitions]) => (
                                        <div key={category}>
                                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-1 border-b border-gray-200">{category}</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-4"> {/* Ajuste no grid para mais espaço */}
                                                {definitions.sort((a,b) => a.action.localeCompare(b.action)).map((def) => {
                                                    const isChecked = allowedActions.has(def.action);
                                                    return (
                                                        // *** ALTERAÇÃO PRINCIPAL AQUI: LABEL + TOGGLE SWITCH ***
                                                        <label
                                                            key={def.action}
                                                            htmlFor={`perm-${def.action}`} // Associar label ao input
                                                            // Tooltip agora mostra a ACTION
                                                            title={def.action}
                                                            className={`flex items-center justify-between gap-3 cursor-pointer p-2 -m-2 rounded group transition-colors relative ${
                                                                isSaving ? 'opacity-60 cursor-not-allowed' : 'hover:bg-neutral-50'
                                                            }`}
                                                        >
                                                            {/* Descrição da Permissão (Texto Principal) */}
                                                            <span className="text-sm text-gray-700 group-hover:text-neutral-800 select-none leading-snug flex-1 mr-2">
                                                                {def.description || def.action} {/* Exibe descrição */}
                                                            </span>

                                                            {/* Toggle Switch */}
                                                            <div className="relative inline-flex items-center flex-shrink-0">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`perm-${def.action}`} // ID único para o input
                                                                    className="sr-only peer" // Esconde o checkbox original, marca como 'peer'
                                                                    checked={isChecked}
                                                                    onChange={(e) => handlePermissionChange(def.action, e.target.checked)}
                                                                    disabled={isSaving || isLoadingPermissions}
                                                                />
                                                                {/* Track (fundo) */}
                                                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-300 dark:bg-gray-700 peer-checked:bg-neutral-800 transition-colors duration-200 ease-in-out"></div>
                                                                {/* Knob (bolinha) */}
                                                                <div className="absolute top-0.5 left-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-transform duration-200 ease-in-out peer-checked:translate-x-full peer-checked:border-white"></div>
                                                            </div>
                                                        </label>
                                                        // *** FIM DA ALTERAÇÃO ***
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Animação fade-in */}
            <style jsx global>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
}