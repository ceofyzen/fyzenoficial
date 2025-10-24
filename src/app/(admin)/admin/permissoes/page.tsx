// src/app/(admin)/admin/permissoes/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Loader2, AlertTriangle, ShieldCheck, Save, CheckCircle,
    User as UserIcon, Search, Info, CheckSquare, Square, UserCircle as UserCircleIcon
} from 'lucide-react';
import { ModuloEnum, PermissionTargetType } from '@prisma/client';

// --- Tipos Locais ---
type UserListItem = {
    id: string;
    name: string | null;
    image: string | null;
    roleName?: string | null;
};
type PermissionData = { [moduleId in ModuloEnum]?: boolean };

// --- Constantes ---
const allModules = Object.values(ModuloEnum);
const moduleLabels: { [key in ModuloEnum]: string } = {
  DIRETORIA: "Diretoria", MARKETING: "Marketing", OPERACIONAL: "Operacional",
  FINANCEIRO: "Financeiro", ADMINISTRATIVO: "Administrativo", JURIDICO: "Jurídico",
  RH: "Recursos Humanos", SISTEMA: "Sistema", PERMISSOES: "Permissões",
};

// --- Componente Principal ---
export default function PermissoesPage() {
  const [usersList, setUsersList] = useState<UserListItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [userPermissions, setUserPermissions] = useState<PermissionData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // --- Funções de Fetch ---
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setError(null); // Limpa erro geral ao (re)buscar utilizadores
    try {
      const response = await fetch('/api/users'); // Busca todos os utilizadores (exceto o logado)
      if (!response.ok) {
        throw new Error(`Erro ${response.status} ao buscar utilizadores`);
      }
      let data: UserListItem[] = await response.json();

      // Aplicar filtro de busca no cliente
      if (searchTerm) {
          data = data.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()));
      }

      setUsersList(data);

      // Lógica para manter a seleção se possível, ou limpar
      if (selectedUser && !data.some(u => u.id === selectedUser.id)) {
        setSelectedUser(null);
        setUserPermissions(null);
      } else if (!selectedUser && data.length > 0) {
        // Opcional: selecionar o primeiro automaticamente
        // setSelectedUser(data[0]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar utilizadores.');
      setUsersList([]);
      setSelectedUser(null); // Limpa seleção em caso de erro
      setUserPermissions(null);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [searchTerm, selectedUser]); // Depende de searchTerm e selectedUser

  const fetchPermissionsForUser = useCallback(async (userId: string | null) => {
    if (!userId) {
      setUserPermissions(null);
      setIsLoadingPermissions(false);
      return;
    }
    setIsLoadingPermissions(true);
    // Não limpa o erro geral aqui, para não esconder erros de fetchUsers
    setSaveSuccess(false); // Limpa feedback de salvar anterior
    setSaveError(null);
    try {
      const response = await fetch(`/api/permissions/user/${userId}`); // Chama a API GET específica
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Tenta pegar erro JSON
        throw new Error(errorData.error || `Erro ${response.status} buscando permissões`);
      }
      const allowedModules: ModuloEnum[] = await response.json();
      const newPermissions: PermissionData = {};
      allModules.forEach(m => newPermissions[m] = allowedModules.includes(m));
      setUserPermissions(newPermissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar permissões do utilizador.');
      setUserPermissions(null);
    } finally {
      setIsLoadingPermissions(false);
    }
  }, []); // Não depende mais de selectedUser.name

  // --- Efeitos ---
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Busca inicial e ao mudar searchTerm

  useEffect(() => {
    fetchPermissionsForUser(selectedUser?.id ?? null);
  }, [selectedUser, fetchPermissionsForUser]); // Busca permissões ao selecionar utilizador

  // --- Funções de Manipulação ---
  const handleUserSelect = (user: UserListItem) => {
    if (selectedUser?.id !== user.id) {
        setSelectedUser(user);
        // fetchPermissionsForUser será chamado pelo useEffect
    }
  };

  const handlePermissionChange = (module: ModuloEnum, isChecked: boolean) => {
    if (!userPermissions) return;
    setUserPermissions(prev => ({ ...prev, [module]: isChecked }));
    setSaveSuccess(false); // Limpa feedback ao modificar
    setSaveError(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedUser || !userPermissions) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    setError(null); // Limpa erro geral antes de salvar

    const allowedModules = allModules.filter(m => userPermissions[m] === true);

    try {
      const response = await fetch(`/api/permissions/user/${selectedUser.id}`, { // Chama a API PUT
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules: allowedModules }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status} ao salvar`);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Esconde sucesso após 3s

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido ao salvar';
      console.error(`Erro ao salvar permissões para ${selectedUser.id}:`, err);
      setSaveError(errorMsg); // Mostra erro específico do salvamento
    } finally {
      setIsSaving(false);
    }
  };

  // --- Renderização ---
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 p-3 rounded-xl shadow-lg">
            <ShieldCheck size={32} className="text-white" />
          </div>
          Gerenciar Permissões por Utilizador
        </h1>
      </div>

      {/* Exibição de Erro Global (prioriza erro de salvamento se houver) */}
      {(error || saveError) && (
        <div className="text-center py-4 text-red-700 bg-red-100 p-3 rounded-lg border border-red-200 text-sm">
          <AlertTriangle size={18} className="inline-block mr-2 -mt-1" />
          {saveError ? `Erro ao salvar: ${saveError}` : error}
          {!saveError && ( // Botão Tentar Novamente apenas para erros de carregamento
            <button
              onClick={() => { setError(null); fetchUsers(); }}
              className="ml-4 px-2 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-medium"
            >
              Tentar Novamente
            </button>
          )}
        </div>
      )}

      {/* Layout Principal (2 colunas) */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Coluna Esquerda: Lista de Utilizadores */}
        <div className="lg:w-1/3 xl:w-1/4 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200/80 shadow-sm flex flex-col h-[calc(100vh-15rem)]"> {/* Altura ajustável */}
            {/* Barra de Busca */}
            <div className="p-4 border-b border-gray-200/80">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={16} /></span>
                <input
                  type="search"
                  placeholder="Buscar utilizador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoadingUsers}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 shadow-sm"
                />
              </div>
            </div>

            {/* Lista de Utilizadores */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingUsers && (
                <div className="p-6 text-center text-gray-500 flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" size={18} /> Carregando...
                </div>
              )}
              {!isLoadingUsers && usersList.length === 0 && (
                <p className="p-6 text-center text-gray-500 text-sm">
                  {searchTerm ? `Nenhum utilizador encontrado para "${searchTerm}".` : 'Nenhum utilizador encontrado.'}
                </p>
              )}
              {!isLoadingUsers && usersList.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {usersList.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      disabled={isLoadingPermissions || isSaving}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                        selectedUser?.id === user.id
                          ? 'bg-neutral-100 border-l-4 border-neutral-700' // Estilo selecionado
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                        {user.image ? (
                          <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircleIcon size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${selectedUser?.id === user.id ? 'text-neutral-900' : 'text-gray-800'}`}>
                          {user.name || 'Utilizador sem nome'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.roleName || 'Sem cargo'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Permissões */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-gray-200/80 shadow-sm min-h-[calc(100vh-15rem)] flex flex-col">
            {/* Cabeçalho */}
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-200/80 flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-800">
                {selectedUser ? `Permissões de ${selectedUser.name}` : 'Selecione um Utilizador'}
              </h2>
              <button
                onClick={handleSaveChanges}
                disabled={!selectedUser || isLoadingPermissions || isSaving}
                className={`bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold py-2 px-4 rounded-md inline-flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-neutral-500`}
              >
                {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                {isSaving ? 'Salvando...' : 'Salvar Permissões'}
              </button>
            </div>

            {/* Grid de Checkboxes */}
            <div className="flex-1 p-6 overflow-y-auto">
              {isLoadingPermissions && (
                <div className="text-center text-gray-500 pt-10">
                  <Loader2 className="animate-spin mx-auto mb-2" size={24} /> Carregando permissões...
                </div>
              )}
              {!selectedUser && !isLoadingPermissions && (
                 <div className="text-center text-gray-400 pt-10 px-4">
                     <UserIcon size={40} className="mx-auto mb-3"/>
                     <p>Selecione um utilizador na lista à esquerda para ver ou editar as suas permissões.</p>
                 </div>
              )}
              {selectedUser && !isLoadingPermissions && !userPermissions && error && (
                 <div className="text-center text-red-600 pt-10 px-4">
                     <AlertTriangle size={32} className="mx-auto mb-3"/>
                     <p className="font-semibold">Erro ao carregar permissões</p>
                     <p className="text-sm">{error}</p>
                 </div>
              )}
              {selectedUser && !isLoadingPermissions && userPermissions && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                   {allModules.map((module) => (
                      <label
                        key={module}
                        className={`flex items-center gap-2.5 cursor-pointer p-2 -m-2 rounded group transition-colors
                                   ${isSaving ? 'opacity-60 cursor-not-allowed' : 'hover:bg-neutral-50'}`}
                      >
                         {/* Checkbox estilizado */}
                        <div className={`relative flex items-center justify-center h-5 w-5 border-2 rounded transition-all duration-150 flex-shrink-0 ${
                            userPermissions[module] ? 'bg-neutral-800 border-neutral-800' : 'bg-white border-gray-300 group-hover:border-neutral-400'
                        }`}>
                            {userPermissions[module] && <CheckCircle size={14} className="absolute text-white" strokeWidth={3} />}
                            <input
                              type="checkbox"
                              className="opacity-0 absolute h-full w-full cursor-pointer disabled:cursor-not-allowed"
                              checked={userPermissions[module] || false}
                              onChange={(e) => handlePermissionChange(module, e.target.checked)}
                              disabled={isSaving}
                            />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-neutral-800 select-none">
                          {moduleLabels[module] || module}
                        </span>
                      </label>
                    ))}
                 </div>
              )}
            </div>

            {/* Feedback de salvamento no rodapé (opcional) */}
            {(saveSuccess || saveError) && (
                 <div className={`px-5 py-2 border-t border-gray-200/80 text-xs font-medium text-center ${saveSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {saveSuccess ? 'Permissões salvas com sucesso!' : `Erro ao salvar: ${saveError}`}
                 </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}