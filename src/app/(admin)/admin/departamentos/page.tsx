// src/app/(admin)/admin/departamentos/page.tsx
'use client'; 

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
    Building, PlusCircle, Edit, Trash2, Loader2, AlertTriangle, 
    ShieldCheck, // Ícone para Módulo de Acesso
    Users // Ícone para contagem de funcionários
} from 'lucide-react'; 

// --- Tipo Atualizado (incluindo userCount) ---
type Department = {
  id: string;
  name: string;
  accessModule: string; 
  description: string | null;
  userCount: number; // << Novo campo da API
};

// --- Mapeamento de Módulos (para exibir nomes amigáveis) ---
const moduloLabels: { [key: string]: string } = {
  DIRETORIA: "Diretoria",
  MARKETING: "Marketing",
  OPERACIONAL: "Operacional",
  FINANCEIRO: "Financeiro",
  ADMINISTRATIVO: "Administrativo",
  JURIDICO: "Jurídico",
  RH: "Recursos Humanos",
  SISTEMA: "Sistema",
  // Adicione outros se necessário
};

// --- Componente Skeleton Card (para Loading) ---
function SkeletonCard() {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-5"></div>
      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <div className="h-8 bg-gray-200 rounded w-10"></div>
        <div className="h-8 bg-gray-200 rounded w-10"></div>
      </div>
    </div>
  );
}

export default function DepartamentosPage() {
  const router = useRouter();
  
  const [departamentos, setDepartamentos] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Função para buscar os dados da API (agora espera userCount) ---
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
      console.log("Departamentos recebidos com contagem:", data);
    } catch (err: any) {
      console.error("Falha ao buscar departamentos:", err);
      setError(`Não foi possível carregar os departamentos: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartamentos();
  }, []); 

  // --- Funções de Ação (Editar e Excluir) ---
  const handleEdit = (id: string) => {
    router.push(`/admin/departamentos/editar/${id}`); 
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o departamento "${name}"? Cargos e funcionários vinculados podem impedir a exclusão.`)) {
      return; 
    }
    setError(null); 
    
    try {
      const response = await fetch(`/api/departamentos/${id}`, { method: 'DELETE' });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || `Erro HTTP: ${response.status}`); }
      alert(`Departamento "${name}" excluído com sucesso!`);
      setDepartamentos(prev => prev.filter(depto => depto.id !== id));
    } catch (err: any) {
      console.error("Falha ao excluir departamento:", err);
      setError(`Erro ao excluir: ${err.message || 'Erro desconhecido'}`);
      alert(`Erro ao excluir o departamento "${name}": ${err.message || 'Verifique o console.'}`);
    }
  };


  return (
    <div className="pt-14"> 
      {/* Cabeçalho da Página */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Building size={32} className="text-indigo-600" /> Departamentos
        </h1>
        <Link 
          href="/admin/departamentos/novo" 
          className="bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors shadow-sm text-sm"
        >
          <PlusCircle size={18} /> Novo Departamento
        </Link>
      </div>

      {/* Exibição de Erro Global */}
      {error && !isLoading && (
         <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
           <AlertTriangle size={24} className="mx-auto mb-2" />
           <p className="font-semibold">Falha ao carregar dados!</p>
           <p className="text-sm">{error}</p>
           <button 
              onClick={fetchDepartamentos} 
              className="mt-4 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
           >
              Tentar Novamente
          </button>
        </div>
      )}

      {/* Grid de Cartões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Estado de Loading com Skeletons */}
        {isLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* Estado Carregado (com dados) */}
        {!isLoading && !error && departamentos.length > 0 && (
          departamentos.map((depto) => (
            <div 
              key={depto.id} 
              className="flex flex-col justify-between bg-white p-5 rounded-xl shadow-lg border border-gray-100 hover:shadow-indigo-100 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Conteúdo do Card */}
              <div>
                {/* Cabeçalho do Card (Ícone, Nome, Módulo) */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Building size={24} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 truncate" title={depto.name}>
                      {depto.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-1">
                      <ShieldCheck size={14} className="text-gray-400" />
                      <span>{moduloLabels[depto.accessModule] || depto.accessModule}</span>
                    </div>
                  </div>
                </div>
                
                {/* Descrição */}
                <p className="text-sm text-gray-600 mb-4 min-h-[40px] line-clamp-2" title={depto.description || ''}>
                  {depto.description || <span className="italic text-gray-400">Sem descrição</span>}
                </p>
                
                {/* Contagem de Funcionários */}
                <div className="flex items-center gap-2 text-gray-700 mb-5">
                  <Users size={18} />
                  <span className="text-lg font-semibold">{depto.userCount}</span>
                  <span className="text-sm text-gray-500">Funcionário(s)</span>
                </div>
              </div>

              {/* Rodapé do Card (Ações) */}
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-auto">
                <button 
                  onClick={() => handleEdit(depto.id)} 
                  className="bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-1.5 px-3 rounded-md text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Editar"
                >
                  <Edit size={14} /> <span>Editar</span>
                </button>
                <button 
                  onClick={() => handleDelete(depto.id, depto.name)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-1.5 px-3 rounded-md text-xs inline-flex items-center gap-1.5 transition-colors" 
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Estado Vazio */}
        {!isLoading && !error && departamentos.length === 0 && (
           <div className="col-span-full text-center py-16 text-gray-500 bg-white rounded-lg shadow-md border border-gray-100">
             <Building size={40} className="mx-auto mb-4 text-gray-400" />
             <h3 className="text-lg font-semibold text-gray-700">Nenhum departamento cadastrado</h3>
             <p className="text-sm mt-1 mb-4">Comece por adicionar o seu primeiro departamento.</p>
             <Link 
                href="/admin/departamentos/novo" 
                className="bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-5 rounded-lg inline-flex items-center gap-2 transition-colors shadow-sm text-sm"
            >
                <PlusCircle size={18} /> Novo Departamento
            </Link>
           </div>
        )}

      </div>
    </div>
  );
}