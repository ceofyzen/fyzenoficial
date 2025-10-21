// src/app/(admin)/admin/departamentos/editar/[id]/page.tsx
'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation'; 
import { 
    Building, Save, ArrowLeft, Loader2, AlertTriangle,
    ShieldCheck, AlignLeft, ChevronDown, CheckCircle 
} from 'lucide-react';

// --- Enum ---
enum ModuloEnum {
  DIRETORIA = "Diretoria", MARKETING = "Marketing", OPERACIONAL = "Operacional",
  FINANCEIRO = "Financeiro", ADMINISTRATIVO = "Administrativo", JURIDICO = "Jurídico",
  RH = "Recursos Humanos", SISTEMA = "Sistema",
}
// --- Fim do Enum ---

type DepartmentData = {
  id: string; name: string;
  accessModule: keyof typeof ModuloEnum;
  description: string | null;
};

export default function EditarDepartamentoPage() {
  const router = useRouter();
  const params = useParams(); 
  const departamentoId = params.id as string; 

  // Estados
  const [nome, setNome] = useState('');
  const [moduloAcesso, setModuloAcesso] = useState<keyof typeof ModuloEnum | ''>('');
  const [descricao, setDescricao] = useState('');
  const [isLoading, setIsLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false); 
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Efeito para buscar os dados
  useEffect(() => {
    if (departamentoId) {
      const fetchDepartamento = async () => {
        setIsLoading(true); setError(''); setNotFound(false);
        try {
          const response = await fetch(`/api/departamentos/${departamentoId}`);
          if (response.status === 404) { setNotFound(true); throw new Error('Departamento não encontrado'); }
          if (!response.ok) { const d = await response.json(); throw new Error(d.error || `Erro ${response.status}`); }
          const data: DepartmentData = await response.json();
          setNome(data.name);
          if (Object.keys(ModuloEnum).includes(data.accessModule)) { setModuloAcesso(data.accessModule); } 
          else { setModuloAcesso(''); }
          setDescricao(data.description || '');
        } catch (err: any) {
          console.error("Falha ao buscar departamento:", err);
          setError(err.message || 'Erro ao carregar dados.');
        } finally { setIsLoading(false); }
      };
      fetchDepartamento();
    }
  }, [departamentoId]); 

  // Função para salvar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true); setError('');
    if (!moduloAcesso) { setError('Selecione um módulo.'); setIsSaving(false); return; }
    
    try {
       const response = await fetch(`/api/departamentos/${departamentoId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome, accessModule: moduloAcesso, description: descricao }), 
      });
       if (!response.ok) { const d = await response.json(); throw new Error(d.error || `Erro ${response.status}`); }
       const departamentoAtualizado = await response.json();
      
      // --- ALERT REMOVIDO ---
      // Em vez de alert, definimos a msg de sucesso para mostrar a tela elegante
      setSuccessMessage(`Departamento "${departamentoAtualizado.name}" atualizado com sucesso!`);

    } catch (err: any) {
      console.error("Erro ao atualizar:", err);
      setError(`Erro ao atualizar: ${err.message || 'Erro desconhecido'}.`);
    } finally { setIsSaving(false); }
  };

  // --- RENDERIZAÇÃO DE SUCESSO (Botão Preto) ---
  if (successMessage) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 pt-14 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md mx-auto text-center">
          <CheckCircle size={60} className="text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sucesso!</h1>
          <p className="text-gray-600 mb-8">{successMessage}</p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/admin/departamentos" 
              className="bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-sm" // COR ALTERADA
            >
              Voltar para Departamentos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Renderização Condicional Loading / Not Found (sem alterações) ---
  if (isLoading) { /* ... */ }
  if (notFound) { /* ... */ }

  // --- Formulário de Edição (Cores Alteradas) ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 pt-14">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
             <Building size={32} className="text-neutral-900" /> Editar Departamento {/* COR ALTERADA */}
         </h1>
         <Link href="/admin/departamentos" className="inline-flex items-center text-neutral-700 hover:text-neutral-900 transition-colors font-medium"> {/* COR ALTERADA */}
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
              Módulo Principal <span className="text-red-600">*</span>
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
             <p className="mt-2 text-xs text-gray-500">Define a seção principal do sistema.</p>
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

          {/* Botão Salvar (Cor Alterada) */}
          <div className="flex justify-end pt-6 border-t mt-8">
            <button
              type="submit"
              disabled={isSaving}
              className={`bg-neutral-900 hover:bg-neutral-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition-colors duration-200 shadow-md transform hover:scale-105
                          ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`} // COR ALTERADA
            >
              <Save size={18} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}