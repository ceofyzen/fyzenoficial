// app/(admin)/admin/cargos/page.tsx
'use client'; 

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'; // Importar hooks
import { Briefcase, PlusCircle, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react'; 

// --- Tipo para os dados do Cargo (pode vir do Prisma ou ser definido aqui) ---
type Role = {
  id: string;
  name: string;
  departmentId: string;
  description: string | null;
  department: { // Incluído pela API GET /api/cargos
    name: string;
  }
  // Adicione outros campos se necessário
};
// --- Fim do Tipo ---

export default function CargosPage() {
  const router = useRouter();
  
  // --- Estados ---
  const [cargos, setCargos] = useState<Role[]>([]); // Armazena os dados da API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Função para buscar os dados da API ---
  const fetchCargos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cargos'); // Chama a API GET /api/cargos
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data: Role[] = await response.json();
      setCargos(data);
    } catch (err: any) {
      console.error("Falha ao buscar cargos:", err);
      setError(`Não foi possível carregar os cargos: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- useEffect para buscar os dados ao montar ---
  useEffect(() => {
    fetchCargos();
  }, []); 

  // --- Funções de Ação ---
  const handleEdit = (id: string) => {
    router.push(`/admin/cargos/editar/${id}`); 
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cargo "${name}"? Funcionários vinculados terão o cargo removido.`)) {
      return; 
    }
    setError(null); 
    // Adicionar loading específico se desejar

    try {
      const response = await fetch(`/api/cargos/${id}`, { 
        method: 'DELETE', 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      console.log(`Cargo ${id} excluído com sucesso.`);
      alert(`Cargo "${name}" excluído com sucesso!`);
      // Atualiza a lista localmente ou refaz o fetch
      setCargos(prev => prev.filter(cargo => cargo.id !== id));
      // Alternativa: fetchCargos(); 

    } catch (err: any) {
      console.error("Falha ao excluir cargo:", err);
      setError(`Erro ao excluir: ${err.message || 'Erro desconhecido'}`);
      alert(`Erro ao excluir o cargo "${name}": ${err.message || 'Verifique o console.'}`);
    } finally {
      // Remover loading específico
    }
  };


  return (
    <div>
      {/* Cabeçalho (sem alteração) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Briefcase size={28} /> Gerenciar Cargos
        </h1>
        <Link 
          href="/admin/cargos/novo" 
          className="bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-4 rounded inline-flex items-center gap-2 transition-colors"
        >
          <PlusCircle size={18} /> Novo Cargo
        </Link>
      </div>

      {/* Container da Tabela com Loading e Erro */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin text-gray-500" size={24} />
            <p className="ml-2 text-gray-600">Carregando cargos...</p>
          </div>
        )}

        {/* Erro */}
        {!isLoading && error && (
           <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded border border-red-200">
             <AlertTriangle size={24} className="mx-auto mb-2" />
             <p className="font-semibold">Falha ao carregar dados!</p>
             <p className="text-sm">{error}</p>
             <button 
                onClick={fetchCargos} 
                className="mt-4 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
             >
                Tentar Novamente
            </button>
          </div>
        )}

        {/* Tabela */}
        {!isLoading && !error && (
          <>
            {cargos.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Cargo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cargos.map((cargo) => (
                    <tr key={cargo.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cargo.name}</td>
                      {/* Acessa o nome do departamento incluído pela API */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cargo.department?.name || 'N/A'}</td> 
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={cargo.description || ''}>{cargo.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleEdit(cargo.id)} 
                          className="text-indigo-600 hover:text-indigo-900" 
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cargo.id, cargo.name)}
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
              <p className="text-center text-gray-500 py-4">Nenhum cargo cadastrado.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}