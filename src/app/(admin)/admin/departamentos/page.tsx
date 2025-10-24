// src/app/(admin)/admin/departamentos/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react'; // Adicionado useMemo
import {
    Building, PlusCircle, Edit, Trash2, Loader2, AlertTriangle, Users,
    BarChart3 // Ícone para Stats
    // ShieldCheck removido se accessModule não for mais usado/exibido
} from 'lucide-react';

// --- Tipo Atualizado ---
type Department = {
  id: string;
  name: string;
  // accessModule: string; // Removido se não existir mais no schema/API
  description: string | null;
  userCount: number; // Já temos a contagem
};

// --- Componente Skeleton Card Aprimorado ---
function SkeletonCardEnhanced() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-pulse flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0"></div>
        <div className="flex-1 mt-1">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          {/* <div className="h-4 bg-gray-200 rounded w-1/2"></div> */}
        </div>
      </div>
      {/* Description */}
      <div className="space-y-2 mb-5 flex-grow">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-11/12"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      {/* User Count */}
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-auto">
        <div className="h-8 bg-gray-300 rounded-md w-20"></div>
        <div className="h-8 bg-gray-300 rounded-md w-12"></div>
      </div>
    </div>
  );
}

// --- Componente Stat Card Skeleton ---
function SkeletonStatCard() {
    return (
        <div className="bg-gradient-to-br from-gray-200 to-gray-300 p-5 rounded-xl shadow-lg animate-pulse">
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-4 bg-gray-400 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-400 rounded w-12 mt-1"></div>
                </div>
                <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
            </div>
        </div>
    );
}


export default function DepartamentosPage() {
  const router = useRouter();

  const [departamentos, setDepartamentos] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Função para buscar os dados da API ---
  const fetchDepartamentos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/departamentos');
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data: Department[] = await response.json();
      setDepartamentos(data);
    } catch (err: any) {
      console.error("Falha ao buscar departamentos:", err);
      setError(`Não foi possível carregar: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  // Calcular estatísticas totais
  const totalFuncionarios = useMemo(() => {
      return departamentos.reduce((sum, dept) => sum + dept.userCount, 0);
  }, [departamentos]);

  // --- Funções de Ação ---
  const handleEdit = (id: string) => {
    router.push(`/admin/departamentos/editar/${id}`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o departamento "${name}"? Cargos e funcionários vinculados podem impedir a exclusão.`)) {
      return;
    }
    setError(null);
    // Otimista: remove da UI antes da resposta da API
    const originalDepartamentos = [...departamentos];
    setDepartamentos(prev => prev.filter(depto => depto.id !== id));

    try {
      const response = await fetch(`/api/departamentos/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        // Reverte a UI em caso de erro
        setDepartamentos(originalDepartamentos);
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      // Sucesso - UI já está atualizada
      console.log(`Departamento ${id} excluído.`);

    } catch (err: any) {
      console.error("Falha ao excluir departamento:", err);
      setError(`Erro ao excluir "${name}": ${err.message || 'Erro desconhecido'}`);
      // Reverte a UI (já feito no bloco if (!response.ok))
      alert(`Erro ao excluir o departamento "${name}": ${err.message || 'Verifique o console.'}`); // Mantém alerta de erro
    }
  };


  return (
    <div className="pt-4 pb-12 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100"> {/* Fundo sutilmente diferente */}

      {/* Cabeçalho Aprimorado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-4 mb-4 sm:mb-0">
            {/* Ícone com fundo gradiente */}
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-600 p-3 rounded-xl shadow-lg">
              <Building size={32} className="text-white" />
            </div>
          Departamentos
        </h1>
        <Link
          href="/admin/departamentos/novo"
          className="bg-neutral-800 hover:bg-neutral-900 text-white font-semibold py-2.5 px-6 rounded-lg inline-flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group" // Botão mais proeminente
        >
          <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Novo Departamento
        </Link>
      </div>

       {/* Seção de Estatísticas */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-4 sm:px-6 lg:px-8">
           {isLoading ? (
               <> <SkeletonStatCard /> <SkeletonStatCard /> </>
           ) : (
                <>
                    {/* Card Total Departamentos */}
                    <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 p-5 rounded-xl shadow-xl text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-300 text-sm font-medium uppercase tracking-wider">Total Deptos</p>
                                <p className="text-4xl font-bold mt-1">{departamentos.length}</p>
                            </div>
                            <Building size={36} className="text-neutral-400 opacity-80" />
                        </div>
                    </div>
                     {/* Card Total Funcionários */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-5 rounded-xl shadow-xl text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-200 text-sm font-medium uppercase tracking-wider">Total Funcionários</p>
                                <p className="text-4xl font-bold mt-1">{totalFuncionarios}</p>
                            </div>
                            <Users size={36} className="text-purple-300 opacity-90" />
                        </div>
                    </div>
                    {/* Adicionar mais cards de stats se relevante */}
               </>
            )}
       </div>

      {/* Exibição de Erro Global */}
      {error && !isLoading && (
         <div className="mx-4 sm:mx-6 lg:mx-8 text-center py-8 text-red-700 bg-red-50 p-4 rounded-lg border border-red-200 mb-6 shadow-sm animate-fade-in">
           <AlertTriangle size={28} className="mx-auto mb-3 text-red-500" />
           <p className="font-semibold text-lg mb-1">Oops! Algo deu errado.</p>
           <p className="text-sm mb-4">{error}</p>
           <button onClick={fetchDepartamentos} className="mt-2 px-4 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors">
              Tentar Novamente
          </button>
        </div>
      )}

      {/* Grid de Cartões Aprimorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8">

        {/* Estado de Loading */}
        {isLoading && (
          <> <SkeletonCardEnhanced /> <SkeletonCardEnhanced /> <SkeletonCardEnhanced /> <SkeletonCardEnhanced /> </>
        )}

        {/* Estado Carregado (com dados) */}
        {!isLoading && !error && departamentos.length > 0 && (
          departamentos.map((depto) => (
            <div
              key={depto.id}
              className="flex flex-col justify-between bg-white p-6 rounded-xl shadow-lg hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1 group" // Estilo do card principal
            >
              {/* Parte Superior: Ícone, Nome */}
              <div>
                <div className="flex items-start gap-4 mb-4">
                  {/* Ícone com Fundo Gradiente */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-600 flex items-center justify-center shadow-md group-hover:from-neutral-900 group-hover:to-neutral-700 transition-colors">
                    <Building size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0 mt-1">
                    {/* Nome do Departamento */}
                    <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-neutral-800 transition-colors" title={depto.name}>
                      {depto.name}
                    </h3>
                     {/* REMOVIDO: Exibição do Módulo de Acesso */}
                    {/* <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-1">
                      <ShieldCheck size={14} className="text-gray-400" />
                      <span>{moduloLabels[depto.accessModule] || depto.accessModule}</span>
                    </div> */}
                  </div>
                </div>

                {/* Descrição */}
                <p className="text-sm text-gray-600 mb-5 min-h-[60px] line-clamp-3 group-hover:text-gray-700 transition-colors" title={depto.description || ''}> {/* Permite 3 linhas */}
                  {depto.description || <span className="italic text-gray-400">Sem descrição detalhada</span>}
                </p>

                {/* Contagem de Funcionários */}
                <div className="flex items-center gap-2 text-gray-700 mb-6">
                  <Users size={18} className="text-neutral-500 group-hover:text-neutral-600 transition-colors" />
                  <span className="text-lg font-semibold text-neutral-800">{depto.userCount}</span>
                  <span className="text-sm text-gray-500">Funcionário(s)</span>
                </div>
              </div>

              {/* Rodapé do Card: Botões */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-auto">
                <button
                  onClick={() => handleEdit(depto.id)}
                  className="bg-neutral-100 hover:bg-neutral-800 text-neutral-700 hover:text-white font-semibold py-2 px-4 rounded-md text-xs inline-flex items-center gap-1.5 transition-all duration-200 shadow-sm border border-neutral-200 hover:border-neutral-800"
                  title="Editar Departamento"
                >
                  <Edit size={14} /> <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(depto.id, depto.name)}
                  className="bg-red-50 hover:bg-red-600 text-red-700 hover:text-white font-semibold py-2 px-3 rounded-md text-xs inline-flex items-center gap-1.5 transition-all duration-200 shadow-sm border border-red-100 hover:border-red-600"
                  title="Excluir Departamento"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Estado Vazio Aprimorado */}
        {!isLoading && !error && departamentos.length === 0 && (
           <div className="col-span-full text-center py-20 px-6 text-gray-500 bg-white rounded-xl shadow-md border border-gray-100 animate-fade-in">
             <div className="bg-gray-100 p-4 rounded-full inline-block mb-5 border border-gray-200">
                <Building size={48} className="text-gray-400" />
             </div>
             <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum departamento por aqui ainda...</h3>
             <p className="text-base text-gray-600 mb-6">Que tal criar o primeiro para organizar sua equipe?</p>
             <Link
                href="/admin/departamentos/novo"
                className="bg-neutral-800 hover:bg-neutral-900 text-white font-semibold py-2.5 px-6 rounded-lg inline-flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group" // Mesmo estilo do botão do header
            >
                <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Criar Departamento
            </Link>
           </div>
        )}

      </div>
       {/* Animação fade-in (opcional) */}
       <style jsx global>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
       `}</style>
    </div>
  );
}