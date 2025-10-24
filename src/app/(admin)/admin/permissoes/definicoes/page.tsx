// src/app/(admin)/admin/permissoes/definicoes/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Importado useMemo aqui
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Loader2, AlertTriangle, ListChecks, PlusCircle, Edit, Trash2, Save, X, Info, Filter, ArrowLeft
} from 'lucide-react';
import { Prisma } from '@prisma/client'; // Importar Prisma para usar tipos se necessário

// --- Tipos Locais ---
type PermissionDefinitionItem = {
    id: string; // Incluído na API GET agora
    action: string;
    category: string;
    description: string;
};
type GroupedPermissionDefinitions = {
    [category: string]: PermissionDefinitionItem[];
};

// --- Componente Modal (para Criar/Editar) ---
const DefinitionModal = ({
    isOpen,
    onClose,
    onSave,
    definitionToEdit, // Null para criar, objeto para editar
    isSavingApi,
    existingActions // Passa as actions existentes para validar duplicidade no client-side
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<PermissionDefinitionItem>) => Promise<void>;
    definitionToEdit: PermissionDefinitionItem | null;
    isSavingApi: boolean;
    existingActions: Set<string>;
}) => {
    const [action, setAction] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [modalError, setModalError] = useState('');
    const isEditing = !!definitionToEdit;

    useEffect(() => {
        if (isOpen) {
            setAction(definitionToEdit?.action || '');
            setCategory(definitionToEdit?.category || '');
            setDescription(definitionToEdit?.description || '');
            setModalError(''); // Limpa erro ao abrir/reabrir
        }
    }, [isOpen, definitionToEdit]);

    const validateAction = (value: string): boolean => {
        return /^[a-z0-9_:]+$/.test(value);
    };

    const handleInternalSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError('');

        if (!action.trim() || !category.trim() || !description.trim()) {
            setModalError('Ação, Categoria e Descrição são obrigatórios.');
            return;
        }
        if (!validateAction(action)) {
             setModalError('Ação inválida. Use apenas minúsculas, números, _ e :');
             return;
        }
        // Validação de duplicidade (apenas na criação)
        if (!isEditing && existingActions.has(action.trim())) {
             setModalError(`A ação "${action.trim()}" já existe.`);
             return;
        }


        await onSave({
            action: action.trim(),
            category: category.trim(),
            description: description.trim(),
        });
        // onClose será chamado pelo onSave em caso de sucesso
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
                {/* Cabeçalho Modal */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gradient-to-r from-neutral-800 to-neutral-700">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <ListChecks size={20} />
                        {isEditing ? 'Editar Definição' : 'Nova Definição de Permissão'}
                    </h2>
                    <button onClick={onClose} disabled={isSavingApi} className="text-white/80 hover:text-white disabled:opacity-50 p-1.5 rounded-full hover:bg-white/10 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Formulário Modal */}
                <form id="definitionForm" onSubmit={handleInternalSave} className="p-6 space-y-4 overflow-y-auto">
                    {modalError && (
                        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                            <span>{modalError}</span>
                        </div>
                    )}

                    {/* Campo Ação */}
                    <div>
                        <label htmlFor="modalAction" className="block text-sm font-semibold text-gray-700 mb-1.5">Ação (Identificador Único) *</label>
                        <input
                            type="text" id="modalAction" value={action}
                            onChange={(e) => setAction(e.target.value.toLowerCase())} // Força minúsculas
                            required pattern="[a-z0-9_:]+"
                            title="Use apenas minúsculas, números, _ e :"
                            disabled={isSavingApi || isEditing} // Não permite editar a ação (chave primária)
                            placeholder="ex: invoice:create, user:view_profile"
                            className="input-with-icon pl-4 disabled:bg-gray-100 disabled:cursor-not-allowed" // Sem ícone, mais padding
                        />
                        <p className="mt-1 text-xs text-gray-500">Formato: `recurso:acao`. Não pode ser alterado depois.</p>
                    </div>

                     {/* Campo Categoria */}
                    <div>
                        <label htmlFor="modalCategory" className="block text-sm font-semibold text-gray-700 mb-1.5">Categoria *</label>
                        <input
                            type="text" id="modalCategory" value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required disabled={isSavingApi}
                            placeholder="Ex: Financeiro, Usuários, Blog"
                             className="input-with-icon pl-4" // Sem ícone
                        />
                         <p className="mt-1 text-xs text-gray-500">Agrupa permissões na interface.</p>
                    </div>

                    {/* Campo Descrição */}
                    <div>
                        <label htmlFor="modalDescription" className="block text-sm font-semibold text-gray-700 mb-1.5">Descrição *</label>
                         <textarea
                            id="modalDescription" rows={3} value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required disabled={isSavingApi}
                            className="input-with-icon pl-4 pt-2.5 resize-y" // Sem ícone
                            placeholder="O que esta permissão permite fazer?"
                        />
                    </div>
                </form>

                 {/* Rodapé Modal */}
                <div className="flex justify-end items-center p-4 border-t border-gray-200 bg-gray-50 gap-3">
                    <button type="button" onClick={onClose} disabled={isSavingApi} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-md transition-all disabled:opacity-50">Cancelar</button>
                    <button
                        type="submit" form="definitionForm" disabled={isSavingApi}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-2 px-5 rounded-md inline-flex items-center gap-2 shadow-sm transition-all disabled:opacity-60 disabled:cursor-wait"
                    >
                        {isSavingApi ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
                        {isEditing ? 'Salvar Alterações' : 'Criar Definição'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Componente Principal da Página ---
export default function PermissoesDefinicoesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [definitions, setDefinitions] = useState<GroupedPermissionDefinitions>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [definitionToEdit, setDefinitionToEdit] = useState<PermissionDefinitionItem | null>(null);
    const [isSavingApi, setIsSavingApi] = useState(false); // Para o modal
    const [filterCategory, setFilterCategory] = useState<string>('all');

     // Verifica permissão para acessar a página
    useEffect(() => {
        if (status === 'loading') return; // Aguarda carregar sessão
        if (status === 'unauthenticated') {
            router.push('/login'); // Redireciona se deslogado
            return;
        }
        // Verifica se tem role permitida
        const allowedRoles = ['Diretor Executivo (CEO)', 'Diretor Operacional (COO)']; // Mesma lógica da API
        if (!session?.user?.roleName || !allowedRoles.includes(session.user.roleName)) {
            router.push('/admin/acesso-negado'); // Redireciona se não tem permissão
        }
    }, [status, session, router]);


    // --- Função Fetch ---
    const fetchDefinitionsData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/permissions/definitions');
            if (!response.ok) throw new Error(`Erro ${response.status} ao buscar definições`);
            const data: GroupedPermissionDefinitions = await response.json();
            setDefinitions(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar definições.');
            setDefinitions({});
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === 'authenticated') { // Só busca se autenticado
             fetchDefinitionsData();
        }
    }, [fetchDefinitionsData, status]);

    // --- Ações ---
    const openModalForCreate = () => {
        setDefinitionToEdit(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (definition: PermissionDefinitionItem) => {
        setDefinitionToEdit(definition);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setDefinitionToEdit(null); // Limpa ao fechar
    };

    const handleSave = async (data: Partial<PermissionDefinitionItem>) => {
        setIsSavingApi(true);
        setError(null); // Limpa erro anterior
        const isEditing = !!definitionToEdit;
        const url = isEditing
            ? `/api/permissions/definitions/${definitionToEdit?.action}`
            : '/api/permissions/definitions';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro ${response.status}`);
            }
            await fetchDefinitionsData(); // Rebusca a lista
            closeModal(); // Fecha modal em sucesso
        } catch (err) {
            // Define o erro PARA o MODAL
             const modalErrorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
             // Atualiza o estado de erro do modal (requer passar setError para o Modal se quiser mostrar lá)
             // Neste exemplo, vamos mostrar o erro geral na página
             setError(`Falha ao ${isEditing ? 'editar' : 'criar'}: ${modalErrorMsg}`);
             // NÃO fecha o modal em caso de erro para o usuário corrigir
             console.error(`Erro ${method} ${url}:`, err);

        } finally {
            setIsSavingApi(false);
        }
    };

     const handleDelete = async (definition: PermissionDefinitionItem) => {
        if (!confirm(`Tem certeza que deseja excluir a permissão "${definition.action}"? Todas as atribuições existentes serão removidas.`)) {
            return;
        }
        setError(null); // Limpa erro anterior
        setIsLoading(true); // Usa loading geral para indicar processamento

        try {
            const response = await fetch(`/api/permissions/definitions/${definition.action}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro ${response.status}`);
            }
            await fetchDefinitionsData(); // Rebusca a lista
        } catch (err) {
             setError(err instanceof Error ? `Erro ao excluir: ${err.message}` : 'Erro desconhecido ao excluir.');
             console.error(`Erro DELETE /api/permissions/definitions/${definition.action}:`, err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Memoização para Filtro e Lista de Ações ---
    const categories = useMemo(() => Object.keys(definitions).sort(), [definitions]);

    const filteredDefinitions = useMemo(() => {
        if (filterCategory === 'all') return definitions;
        const filtered: GroupedPermissionDefinitions = {};
        if (definitions[filterCategory]) {
            filtered[filterCategory] = definitions[filterCategory];
        }
        return filtered;
    }, [definitions, filterCategory]);

    // Usado na validação de duplicidade no modal
    const existingActionsSet = useMemo(() => {
        const actions = new Set<string>();
        Object.values(definitions).forEach(group => {
            group.forEach(def => actions.add(def.action));
        });
        return actions;
    }, [definitions]);


    // --- Renderização ---
     if (status === 'loading' || (status === 'authenticated' && isLoading)) { // Verifica status e loading
         return (
             <div className="flex justify-center items-center min-h-[calc(100vh-12rem)] text-gray-600">
                <Loader2 className="animate-spin mr-2" size={24} /> Carregando definições...
             </div>
         );
    }
     if (status === 'unauthenticated') {
        // O useEffect já deve ter redirecionado, mas como fallback:
        return <div className="p-6 text-center text-red-600">Não autorizado. Redirecionando...</div>;
    }


    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 p-3 rounded-xl shadow-lg">
                        <ListChecks size={32} className="text-white" />
                    </div>
                    Definições de Permissão
                </h1>
                 <div className="flex gap-3">
                    <Link href="/admin/permissoes" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium py-2 px-4 rounded-md inline-flex items-center gap-1.5 transition-colors">
                        <ArrowLeft size={16} /> Voltar
                    </Link>
                    <button
                        onClick={openModalForCreate}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold py-2 px-4 rounded-md inline-flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                        <PlusCircle size={16} /> Nova Definição
                    </button>
                 </div>
            </div>

             {/* Exibição de Erro Geral */}
            {error && (
                <div className="text-center py-3 px-4 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md">
                    <AlertTriangle size={16} className="inline-block mr-2 -mt-0.5" />
                    {error}
                     <button
                        onClick={fetchDefinitionsData}
                        className="ml-3 px-2 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                     >
                        Tentar Novamente
                    </button>
                </div>
             )}


            {/* Filtro de Categoria */}
             <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500" />
                    <label htmlFor="filterCategory" className="text-sm font-medium text-gray-700">Filtrar por Categoria:</label>
                    <select
                        id="filterCategory"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        disabled={isLoading || categories.length === 0}
                        className="ml-2 flex-grow sm:flex-grow-0 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 bg-white disabled:bg-gray-100"
                    >
                        <option value="all">Todas as Categorias</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
             </div>


            {/* Lista de Definições Agrupadas */}
             <div className="space-y-5">
                {!isLoading && Object.keys(filteredDefinitions).length === 0 && !error && (
                     <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <ListChecks size={32} className="mx-auto mb-3 text-gray-400"/>
                        Nenhuma definição encontrada {filterCategory !== 'all' ? `na categoria "${filterCategory}"` : ''}.
                    </div>
                )}

                {Object.entries(filteredDefinitions)
                    .sort(([catA], [catB]) => catA.localeCompare(catB)) // Garante ordem das categorias
                    .map(([category, definitions]) => (
                    <div key={category} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <h3 className="text-base font-semibold text-gray-700 bg-gray-50 px-5 py-3 border-b border-gray-200">{category}</h3>
                        <ul className="divide-y divide-gray-100">
                            {definitions
                                .sort((a,b) => a.action.localeCompare(b.action)) // Garante ordem das actions
                                .map(def => (
                                <li key={def.id} className="px-5 py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:bg-neutral-50/50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-mono font-medium text-neutral-800">{def.action}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{def.description}</p>
                                    </div>
                                    <div className="flex-shrink-0 flex gap-2 self-end sm:self-center">
                                         <button
                                            onClick={() => openModalForEdit(def)}
                                            disabled={isLoading || isSavingApi}
                                            className="p-1.5 text-gray-500 hover:text-neutral-700 hover:bg-gray-100 rounded-md transition-colors text-xs disabled:opacity-50" title="Editar">
                                            <Edit size={14} />
                                        </button>
                                         <button
                                            onClick={() => handleDelete(def)}
                                            disabled={isLoading || isSavingApi}
                                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors text-xs disabled:opacity-50" title="Excluir">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
             </div>


            {/* Modal */}
            <DefinitionModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                definitionToEdit={definitionToEdit}
                isSavingApi={isSavingApi}
                existingActions={existingActionsSet}
            />

            {/* Animação do Modal */}
             <style jsx global>{`
                @keyframes scale-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
                }
                .animate-scale-in { animation: scale-in 0.15s ease-out forwards; }
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>

        </div>
    );
}