// app/(admin)/admin/departamentos/editar/[id]/page.tsx
'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation'; 
import { Building, Save, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';

// --- Enum (Definido localmente ou importado) ---
enum ModuloEnum {
  DIRETORIA = "Diretoria",
  MARKETING = "Marketing",
  OPERACIONAL = "Operacional",
  FINANCEIRO = "Financeiro",
  ADMINISTRATIVO = "Administrativo",
  JURIDICO = "Jurídico",
  RH = "Recursos Humanos",
  SISTEMA = "Sistema",
}
// --- Fim do Enum ---

// Tipo para os dados do departamento (pode vir do Prisma no futuro)
type DepartmentData = {
  id: string;
  name: string;
  accessModule: keyof typeof ModuloEnum; // Usa as chaves do Enum
  description: string | null;
};

export default function EditarDepartamentoPage() {
  const router = useRouter();
  const params = useParams(); 
  const departamentoId = params.id as string; 

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [moduloAcesso, setModuloAcesso] = useState<keyof typeof ModuloEnum | ''>(''); // Usa a chave do Enum
  const [descricao, setDescricao] = useState('');
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  // Efeito para buscar os dados do departamento via API
  useEffect(() => {
    if (departamentoId) {
      const fetchDepartamento = async () => {
        setIsLoading(true);
        setError('');
        setNotFound(false);
        console.log("Buscando dados via API para o departamento ID:", departamentoId);

        try {
          const response = await fetch(`/api/departamentos/${departamentoId}`); // Chama a API GET /api/departamentos/[id]
          
          if (response.status === 404) {
             throw new Error('Departamento não encontrado');
          }
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
          }

          const data: DepartmentData = await response.json();
          setNome(data.name);
          // Garante que o valor do estado corresponda a uma chave válida do Enum
          if (Object.keys(ModuloEnum).includes(data.accessModule)) {
             setModuloAcesso(data.accessModule as keyof typeof ModuloEnum);
          } else {
             console.warn(`Módulo de acesso inválido recebido da API: ${data.accessModule}`);
             // Define um valor padrão ou deixa vazio para o usuário corrigir
             setModuloAcesso(''); 
          }
          setDescricao(data.description || '');
          console.log("Dados recebidos da API:", data);

        } catch (err: any) {
          console.error("Falha ao buscar departamento:", err);
          setError(err.message || 'Erro ao carregar dados.');
          if (err.message === 'Departamento não encontrado') {
              setNotFound(true);
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDepartamento();
    }
  }, [departamentoId]); 

  // Função para salvar as alterações via API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

     if (!moduloAcesso) {
      setError('Por favor, selecione um módulo de acesso.');
      setIsSaving(false);
      return;
    }

    // --- LÓGICA DE ATUALIZAÇÃO (CONECTADA À API) ---
    console.log("Enviando atualização para API:", departamentoId, { name: nome, accessModule: moduloAcesso, description: descricao });
    
    try {
       const response = await fetch(`/api/departamentos/${departamentoId}`, { 
        method: 'PUT', // Método HTTP para atualização
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: nome, 
          accessModule: moduloAcesso, // Envia a chave do Enum
          description: descricao 
        }), 
      });

       if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      const departamentoAtualizado = await response.json();
      console.log("Departamento atualizado via API:", departamentoAtualizado);
      alert(`Departamento "${departamentoAtualizado.name}" atualizado com sucesso!`);
      router.push('/admin/departamentos'); 
      router.refresh(); 

    } catch (err: any) {
      console.error("Erro ao atualizar departamento via API:", err);
      setError(`Erro ao atualizar: ${err.message || 'Erro desconhecido'}. Verifique o console.`);
    } finally {
       setIsSaving(false);
    }
    // --- Fim da Lógica de Atualização ---
  };

  // --- Renderização condicional para Loading e Not Found ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin text-gray-500" size={32} />
        <p className="ml-2 text-gray-600">Carregando dados do departamento...</p>
      </div>
    );
  }

  if (notFound) {
     return (
        <div>
           <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2"><AlertTriangle/> Erro</h1>
             <Link 
               href="/admin/departamentos" 
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Building size={28} /> Editar Departamento
        </h1>
        <Link 
          href="/admin/departamentos" 
          className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para Lista
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-center text-red-600 bg-red-100 p-2 rounded">{error}</p>}
          
          {/* Campo Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Departamento <span className="text-red-600">*</span>
            </label>
            <input
              type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={isSaving} className="input-form"
            />
          </div>

          {/* Campo Módulo de Acesso */}
          <div>
            <label htmlFor="moduloAcesso" className="block text-sm font-medium text-gray-700 mb-1">
              Módulo Principal de Acesso <span className="text-red-600">*</span>
            </label>
            <select
              id="moduloAcesso" value={moduloAcesso} onChange={(e) => setModuloAcesso(e.target.value as keyof typeof ModuloEnum)} required disabled={isSaving} className="input-form bg-white"
            >
              <option value="" disabled>Selecione um módulo</option>
              {Object.entries(ModuloEnum).map(([key, label]) => (
                <option key={key} value={key}>{label}</option> 
              ))}
            </select>
             <p className="mt-1 text-xs text-gray-500">Define a qual seção principal do sistema este departamento terá acesso.</p>
          </div>

          {/* Campo Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (Opcional)
            </label>
            <textarea
              id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} disabled={isSaving} className="input-form"
            />
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

// Estilo helper (defina novamente ou mova para globals.css)
const InputFormStyle = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
// Aplique className="input-form"