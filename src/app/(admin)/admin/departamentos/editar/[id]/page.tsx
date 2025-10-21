// src/app/(admin)/admin/departamentos/editar/[id]/page.tsx
'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation'; 
import { 
    Building, Save, ArrowLeft, Loader2, AlertTriangle,
    ShieldCheck, // Ícone para Módulo
    AlignLeft, // Ícone para Descrição
    ChevronDown, // Ícone para Select
    CheckCircle // Ícone para Sucesso
} from 'lucide-react';

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

// Tipo para os dados do departamento
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
  const [moduloAcesso, setModuloAcesso] = useState<keyof typeof ModuloEnum | ''>('');
  const [descricao, setDescricao] = useState('');
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState(true); // Loading inicial
  const [isSaving, setIsSaving] = useState(false); // Loading do submit
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // <<< ESTADO DE SUCESSO

  // Efeito para buscar os dados do departamento
  useEffect(() => {
    if (departamentoId) {
      const fetchDepartamento = async () => {
        setIsLoading(true);
        setError('');
        setNotFound(false);
        console.log("Buscando dados via API para o departamento ID:", departamentoId);

        try {
          const response = await fetch(`/api/departamentos/${departamentoId}`);
          
          if (response.status === 404) {
             setNotFound(true);
             throw new Error('Departamento não encontrado');
          }
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
          }

          const data: DepartmentData = await response.json();
          setNome(data.name);
          if (Object.keys(ModuloEnum).includes(data.accessModule)) {
             setModuloAcesso(data.accessModule as keyof typeof ModuloEnum);
          } else {
             console.warn(`Módulo inválido: ${data.accessModule}`);
             setModuloAcesso(''); 
          }
          setDescricao(data.description || '');
          console.log("Dados recebidos da API:", data);

        } catch (err: any) {
          console.error("Falha ao buscar departamento:", err);
          setError(err.message || 'Erro ao carregar dados.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDepartamento();
    }
  }, [departamentoId]); 

  // Função para salvar as alterações
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

     if (!moduloAcesso) {
      setError('Por favor, selecione um módulo de acesso.');
      setIsSaving(false);
      return;
    }

    console.log("Enviando atualização para API:", departamentoId, { name: nome, accessModule: moduloAcesso, description: descricao });
    
    try {
       const response = await fetch(`/api/departamentos/${departamentoId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: nome, 
          accessModule: moduloAcesso, 
          description: descricao 
        }), 
      });

       if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      const departamentoAtualizado = await response.json();
      
      // --- MUDANÇA AQUI ---
      // alert(`Departamento "${departamentoAtualizado.name}" atualizado com sucesso!`);
      setSuccessMessage(`Departamento "${departamentoAtualizado.name}" atualizado com sucesso!`);
      // router.push('/admin/departamentos'); 
      // router.refresh(); 

    } catch (err: any) {
      console.error("Erro ao atualizar departamento via API:", err);
      setError(`Erro ao atualizar: ${err.message || 'Erro desconhecido'}.`);
    } finally {
       setIsSaving(false);
    }
  };

  // --- RENDERIZAÇÃO DE SUCESSO ---
  if (successMessage) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 pt-14 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md mx-auto text-center">
          <CheckCircle size={60} className="text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sucesso!</h1>
          <p className="text-gray-600 mb-8">{successMessage}</p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/admin/departamentos" 
              className="bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-sm"
            >
              Voltar para Departamentos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Renderização Condicional Loading / Not Found ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)] text-gray-600 pt-14">
        <Loader2 className="animate-spin mr-2" size={32} />
        <p className="ml-2 text-gray-600">Carregando dados do departamento...</p>
      </div>
    );
  }

  if (notFound) {
     return (
        <div className="pt-14 p-6 md:p-8">
           <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2"><AlertTriangle/> Erro</h1>
             <Link href="/admin/departamentos" className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1 transition-colors"><ArrowLeft size={16} /> Voltar</Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-red-200 max-w-2xl mx-auto">
             <p className="text-gray-700 text-center">{error}</p>
          </div>
        </div>
     )
  }

  // --- Formulário de Edição ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 pt-14">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
             <Building size={32} className="text-indigo-600" /> Editar Departamento
         </h1>
         <Link href="/admin/departamentos" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors font-medium">
            <ArrowLeft size={18} className="mr-2" /> Voltar
         </Link>
      </div>

      {/* Formulário em Card */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-lg border border-red-200">{error}</p>}
          
          {/* Campo Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-1">
              Nome do Departamento <span className="text-red-600">*</span>
            </label>
             <div className="relative">
                <Building size={18} className="icon-input" />
                <input
                  type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={isSaving} className="input-with-icon pl-10"
                />
            </div>
          </div>

          {/* Campo Módulo de Acesso */}
          <div>
            <label htmlFor="moduloAcesso" className="block text-sm font-semibold text-gray-700 mb-1">
              Módulo Principal de Acesso <span className="text-red-600">*</span>
            </label>
             <div className="relative">
                <ShieldCheck size={18} className="icon-input" />
                <select
                  id="moduloAcesso" value={moduloAcesso} onChange={(e) => setModuloAcesso(e.target.value as keyof typeof ModuloEnum)} required disabled={isSaving} className="input-with-icon appearance-none bg-white pl-10"
                >
                  <option value="" disabled>Selecione um módulo</option>
                  {Object.entries(ModuloEnum).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option> 
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
             <p className="mt-2 text-xs text-gray-500">Define a qual seção principal do sistema este departamento terá acesso.</p>
          </div>

          {/* Campo Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 mb-1">
              Descrição (Opcional)
            </label>
             <div className="relative">
                 <AlignLeft size={18} className="icon-input-textarea" />
                <textarea
                  id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} disabled={isSaving} className="input-with-icon pl-10 pt-3 resize-y"
                />
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-6 border-t mt-8">
            <button
              type="submit"
              disabled={isSaving}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition-colors duration-200 shadow-md transform hover:scale-105
                          ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <Save size={18} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}