// app/(admin)/admin/departamentos/page.tsx
'use client'; 

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'; // Importar useState e useEffect
import { Building, PlusCircle, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react'; 
// O tipo Department pode ser importado do Prisma Client se você configurar a exportação ou definir manualmente
// import { Department } from '@prisma/client'; 
// Ou definir um tipo local:
type Department = {
  id: string;
  name: string;
  accessModule: string; // Manter como string por simplicidade ou usar o Enum importado
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};


// --- Mapeamento de Módulos (mantido) ---
const moduloLabels: { [key: string]: string } = {
  DIRETORIA: "Diretoria",
  MARKETING: "Marketing",
  OPERACIONAL: "Operacional",
  FINANCEIRO: "Financeiro",
  ADMINISTRATIVO: "Administrativo",
  JURIDICO: "Jurídico",
  RH: "Recursos Humanos",
  SISTEMA: "Sistema",
};
// --- Fim do Mapeamento ---

export default function DepartamentosPage() {
  const router = useRouter();
  
  // --- Estados para gerenciar dados, loading e erros ---
  const [departamentos, setDepartamentos] = useState<Department[]>([]); // Armazena os dados da API
  const [isLoading, setIsLoading] = useState(true); // Controla o estado de carregamento inicial
  const [error, setError] = useState<string | null>(null); // Armazena mensagens de erro

  // --- Função para buscar os dados da API ---
  const fetchDepartamentos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/departamentos'); // Chama nossa API GET
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data: Department[] = await response.json();
      setDepartamentos(data);
    } catch (err: any) {
      console.error("Falha ao buscar departamentos:", err);
      setError(`Não foi possível carregar os departamentos: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- useEffect para buscar os dados quando o componente montar ---
  useEffect(() => {
    fetchDepartamentos();
  }, []); // O array vazio [] garante que rode apenas uma vez

  // --- Funções de Ação (Editar e Excluir) ---
  const handleEdit = (id: string) => {
    router.push(`/admin/departamentos/editar/${id}`); 
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o departamento "${name}"? Cargos vinculados podem impedir a exclusão.`)) {
      return; 
    }

    // Adiciona feedback visual para a exclusão
    setError(null); 
    // Poderia adicionar um estado de loading específico para a linha/botão

    try {
      const response = await fetch(`/api/departamentos/${id}`, { 
        method: 'DELETE', 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      console.log(`Departamento ${id} excluído com sucesso.`);
      alert(`Departamento "${name}" excluído com sucesso!`);
      // Atualiza a lista removendo o item excluído (ou refaz o fetch)
      setDepartamentos(prev => prev.filter(depto => depto.id !== id));
      // Alternativa: fetchDepartamentos(); // Busca a lista atualizada do servidor

    } catch (err: any) {
      console.error("Falha ao excluir departamento:", err);
      setError(`Erro ao excluir: ${err.message || 'Erro desconhecido'}`);
      alert(`Erro ao excluir o departamento "${name}": ${err.message || 'Verifique o console.'}`);
    } finally {
      // Remover loading específico se adicionado
    }
  };


  return (
    <div>
      {/* Cabeçalho da Página (sem alteração) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Building size={28} /> Gerenciar Departamentos
        </h1>
        <Link 
          href="/admin/departamentos/novo" 
          className="bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-4 rounded inline-flex items-center gap-2 transition-colors"
        >
          <PlusCircle size={18} /> Novo Departamento
        </Link>
      </div>

      {/* Container da Tabela com Loading e Erro */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        {/* Indicador de Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin text-gray-500" size={24} />
            <p className="ml-2 text-gray-600">Carregando departamentos...</p>
          </div>
        )}

        {/* Mensagem de Erro */}
        {!isLoading && error && (
           <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded border border-red-200">
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

        {/* Tabela (só mostra se não estiver carregando e não houver erro) */}
        {!isLoading && !error && (
          <>
            {departamentos.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo de Acesso</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departamentos.map((depto) => (
                    <tr key={depto.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{depto.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{moduloLabels[depto.accessModule] || depto.accessModule}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={depto.description || ''}>{depto.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleEdit(depto.id)} 
                          className="text-indigo-600 hover:text-indigo-900" 
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(depto.id, depto.name)} // Passa o nome para o confirm/alert
                          className="text-red-600 hover:text-red-900" 
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500 py-4">Nenhum departamento cadastrado.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}