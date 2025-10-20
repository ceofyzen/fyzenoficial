// app/(admin)/admin/cargos/novo/page.tsx
'use client'; 

import { useState, useEffect } from 'react'; // Importar useEffect
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { Briefcase, Save, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react'; // Adicionar Loader2, AlertTriangle

// --- Tipo para Departamentos (simplificado para o dropdown) ---
type DepartmentOption = {
  id: string;
  name: string;
};
// --- Fim do Tipo ---

export default function NovoCargoPage() {
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [departamentoId, setDepartamentoId] = useState(''); // Inicia vazio
  const [descricao, setDescricao] = useState('');
  const [isDirector, setIsDirector] = useState(false); // Adicionado estado para Diretor

  // Estados de controle
  const [departamentos, setDepartamentos] = useState<DepartmentOption[]>([]); // Lista de departamentos da API
  const [isLoading, setIsLoading] = useState(false); // Loading do submit
  const [isFetchingDepts, setIsFetchingDepts] = useState(true); // Loading inicial dos departamentos
  const [error, setError] = useState('');
  const router = useRouter();

  // --- useEffect para buscar Departamentos para o dropdown ---
  useEffect(() => {
    const fetchDepartamentos = async () => {
      setIsFetchingDepts(true);
      setError('');
      try {
        const response = await fetch('/api/departamentos');
        if (!response.ok) throw new Error('Falha ao buscar departamentos');
        const data: DepartmentOption[] = await response.json();
        setDepartamentos(data);
        // Define o primeiro departamento como padrão, se a lista não estiver vazia
        if (data.length > 0) {
           setDepartamentoId(data[0].id);
        }
      } catch (err: any) {
        console.error("Erro ao buscar departamentos:", err);
        setError("Erro ao carregar lista de departamentos. Tente recarregar a página.");
        // Impede o usuário de submeter se não conseguir carregar os departamentos
      } finally {
        setIsFetchingDepts(false);
      }
    };
    fetchDepartamentos();
  }, []); // Roda na montagem

  // --- Função handleSubmit conectada à API POST ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!departamentoId) {
      setError('Por favor, selecione um departamento.');
      setIsLoading(false);
      return;
    }

    // --- LÓGICA DE CRIAÇÃO (CONECTADA À API) ---
    console.log("Enviando para API:", { name: nome, departmentId: departamentoId, description: descricao, isDirector });
    
    try {
      const response = await fetch('/api/cargos', { 
        method: 'POST', 
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
      
      const novoCargo = await response.json();
      console.log("Cargo criado via API:", novoCargo);
      alert(`Cargo "${novoCargo.name}" criado com sucesso!`);
      router.push('/admin/cargos'); 
      router.refresh(); 

    } catch (err: any) {
      console.error("Erro ao criar cargo via API:", err);
      setError(`Erro ao criar cargo: ${err.message || 'Erro desconhecido'}. Verifique o console.`);
    } finally {
       setIsLoading(false); 
    }
    // --- Fim da Lógica ---
  };

  // Mostrar loading inicial se estiver buscando departamentos
  if (isFetchingDepts) {
     return (
       <div className="flex justify-center items-center h-40">
         <Loader2 className="animate-spin text-gray-500" size={32} />
         <p className="ml-2 text-gray-600">Carregando departamentos...</p>
       </div>
     );
  }

  // Mostrar erro se falhar ao buscar departamentos
   if (error && departamentos.length === 0) {
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
      );
  }


  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Briefcase size={28} /> Novo Cargo
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
          
          {/* Campo Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Cargo <span className="text-red-600">*</span>
            </label>
            <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={isLoading || isFetchingDepts} className="input-form" placeholder="Ex: Desenvolvedor Pleno" />
          </div>

          {/* Campo Departamento (Populando com dados da API) */}
          <div>
            <label htmlFor="departamentoId" className="block text-sm font-medium text-gray-700 mb-1">
              Departamento <span className="text-red-600">*</span>
            </label>
            <select id="departamentoId" value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)} required disabled={isLoading || isFetchingDepts || departamentos.length === 0} className="input-form bg-white">
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
               id="isDirector"
               name="isDirector"
               type="checkbox"
               checked={isDirector}
               onChange={(e) => setIsDirector(e.target.checked)}
               disabled={isLoading || isFetchingDepts}
               className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
             />
             <label htmlFor="isDirector" className="ml-2 block text-sm text-gray-900">
               Este é um cargo de Diretor de Departamento?
             </label>
           </div>


          {/* Campo Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (Opcional)
            </label>
            <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} disabled={isLoading || isFetchingDepts} className="input-form" placeholder="Descreva brevemente as responsabilidades..." />
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || isFetchingDepts}
              className={`bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-6 rounded inline-flex items-center gap-2 transition-colors
                          ${(isLoading || isFetchingDepts) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save size={18} /> {isLoading ? 'Salvando...' : 'Salvar Cargo'}
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