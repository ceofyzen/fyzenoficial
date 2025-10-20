// app/(admin)/admin/cargos/editar/[id]/page.tsx
'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation'; 
import { Briefcase, Save, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';

// --- Tipos ---
type DepartmentOption = {
  id: string;
  name: string;
};
type RoleData = { // Dados esperados da API GET /api/cargos/[id]
  id: string;
  name: string;
  departmentId: string;
  description: string | null;
  isDirector: boolean;
  department?: { // Pode ou não vir dependendo da API
    name: string;
  };
};
// --- Fim dos Tipos ---

export default function EditarCargoPage() {
  const router = useRouter();
  const params = useParams(); 
  const cargoId = params.id as string; 

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isDirector, setIsDirector] = useState(false);
  
  // Estados de controle
  const [departamentos, setDepartamentos] = useState<DepartmentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading inicial de dados
  const [isSaving, setIsSaving] = useState(false); // Loading do submit
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  // --- useEffect para buscar dados do Cargo e a lista de Departamentos ---
  useEffect(() => {
    if (cargoId) {
      const fetchData = async () => {
        setIsLoading(true);
        setError('');
        setNotFound(false);
        console.log("Buscando dados via API para o cargo ID:", cargoId);

        try {
          // Busca os dados do cargo específico E a lista de departamentos em paralelo
          const [cargoResponse, deptsResponse] = await Promise.all([
            fetch(`/api/cargos/${cargoId}`),
            fetch('/api/departamentos') 
          ]);

          // Trata erros da busca de departamentos
          if (!deptsResponse.ok) throw new Error('Falha ao buscar departamentos para o dropdown');
          const deptsData: DepartmentOption[] = await deptsResponse.json();
          setDepartamentos(deptsData);

          // Trata erros da busca do cargo
          if (cargoResponse.status === 404) {
             setNotFound(true);
             throw new Error('Cargo não encontrado');
          }
          if (!cargoResponse.ok) {
            const errorData = await cargoResponse.json();
            throw new Error(errorData.error || `Erro HTTP: ${cargoResponse.status}`);
          }

          // Preenche o formulário com os dados do cargo
          const cargoData: RoleData = await cargoResponse.json();
          setNome(cargoData.name);
          setDepartamentoId(cargoData.departmentId); // Garante que o ID existe na lista buscada
          setDescricao(cargoData.description || '');
          setIsDirector(cargoData.isDirector || false);
          console.log("Dados do cargo recebidos:", cargoData);

        } catch (err: any) {
          console.error("Falha ao buscar dados:", err);
          setError(err.message || 'Erro ao carregar dados.');
          // Mantém notFound=true se o erro foi 404
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [cargoId]); 

  // --- Função handleSubmit conectada à API PUT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

     if (!departamentoId) {
      setError('Por favor, selecione um departamento.');
      setIsSaving(false);
      return;
    }

    // --- LÓGICA DE ATUALIZAÇÃO (CONECTADA À API) ---
    console.log("Enviando atualização para API:", cargoId, { name: nome, departmentId: departamentoId, description: descricao, isDirector });
    
    try {
       const response = await fetch(`/api/cargos/${cargoId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: nome, 
          departmentId: departamentoId, 
          description: descricao,
          isDirector: isDirector
        }), 
      });

       if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      const cargoAtualizado = await response.json();
      console.log("Cargo atualizado via API:", cargoAtualizado);
      alert(`Cargo "${cargoAtualizado.name}" atualizado com sucesso!`);
      router.push('/admin/cargos'); 
      router.refresh(); 

    } catch (err: any) {
      console.error("Erro ao atualizar cargo via API:", err);
      setError(`Erro ao atualizar: ${err.message || 'Erro desconhecido'}. Verifique o console.`);
    } finally {
       setIsSaving(false);
    }
    // --- Fim da Lógica ---
  };

  // --- Renderização Condicional ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin text-gray-500" size={32} />
        <p className="ml-2 text-gray-600">Carregando dados do cargo...</p>
      </div>
    );
  }

  if (notFound) {
     return (
        <div>
           <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2"><AlertTriangle/> Erro</h1>
             <Link 
               href="/admin/cargos" 
               className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1 transition-colors"
             >
               <ArrowLeft size={16} /> Voltar para Lista
             </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-red-200">
             <p className="text-gray-700">{error}</p>
          </div>
        </div>
     )
  }

  // --- Formulário de Edição ---
  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Briefcase size={28} /> Editar Cargo
        </h1>
        <Link 
          href="/admin/cargos" 
          className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para Lista
        </Link>
      </div>

      {/* Formulário */}
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-center text-red-600 bg-red-100 p-2 rounded">{error}</p>}
          
          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Cargo <span className="text-red-600">*</span>
            </label>
            <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={isSaving} className="input-form"/>
          </div>

          {/* Departamento */}
          <div>
            <label htmlFor="departamentoId" className="block text-sm font-medium text-gray-700 mb-1">
              Departamento <span className="text-red-600">*</span>
            </label>
            <select id="departamentoId" value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)} required disabled={isSaving || departamentos.length === 0} className="input-form bg-white">
              <option value="" disabled>Selecione um departamento</option>
              {departamentos.map((depto) => (
                <option key={depto.id} value={depto.id}>{depto.name}</option>
              ))}
            </select>
             <p className="mt-1 text-xs text-gray-500">Define a qual departamento este cargo pertence.</p>
          </div>
          
           {/* Checkbox Diretor */}
           <div className="flex items-center">
             <input
               id="isDirector" name="isDirector" type="checkbox" checked={isDirector} onChange={(e) => setIsDirector(e.target.checked)} disabled={isSaving} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
             />
             <label htmlFor="isDirector" className="ml-2 block text-sm text-gray-900">
               Este é um cargo de Diretor de Departamento?
             </label>
           </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (Opcional)
            </label>
            <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} disabled={isSaving} className="input-form"/>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className={`bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-6 rounded inline-flex items-center gap-2 transition-colors
                          ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save size={18} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Estilo helper
const InputFormStyle = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
// Aplique className="input-form"