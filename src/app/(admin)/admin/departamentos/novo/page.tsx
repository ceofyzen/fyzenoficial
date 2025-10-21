// src/app/(admin)/admin/departamentos/novo/page.tsx
'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { 
    Building, Save, ArrowLeft, Loader2, AlertTriangle,
    ShieldCheck, // Ícone para Módulo
    AlignLeft, // Ícone para Descrição
    ChevronDown, // Ícone para Select
    CheckCircle // Ícone para Sucesso
} from 'lucide-react';

// --- Enum ---
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

export default function NovoDepartamentoPage() {
  const [nome, setNome] = useState('');
  const [moduloAcesso, setModuloAcesso] = useState(''); 
  const [descricao, setDescricao] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const firstModuleKey = Object.keys(ModuloEnum)[0] as keyof typeof ModuloEnum;
    if (firstModuleKey) {
       setModuloAcesso(firstModuleKey);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (!moduloAcesso) {
       setError('Por favor, selecione um módulo de acesso.');
       setIsLoading(false);
       return;
    }
    
    try {
      const response = await fetch('/api/departamentos', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome, accessModule: moduloAcesso, description: descricao }), 
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || `Erro HTTP: ${response.status}`); }
      const novoDepartamento = await response.json();
      
      // --- ALERT REMOVIDO ---
      // Em vez de alert, definimos a msg de sucesso para mostrar a tela elegante
      setSuccessMessage(`Departamento "${novoDepartamento.name}" criado com sucesso!`);

    } catch (err: any) {
      console.error("Erro ao criar departamento via API:", err);
      setError(`Erro ao criar departamento: ${err.message || 'Erro desconhecido'}.`);
    } finally {
       setIsLoading(false);
    }
  };

  // --- RENDERIZAÇÃO DE SUCESSO (Botão Preto) ---
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
              className="bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-sm" // COR ALTERADA
            >
              Voltar para Departamentos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- FORMULÁRIO DE CRIAÇÃO (Cores Alteradas) ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 pt-14">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
             <Building size={32} className="text-neutral-900" /> Novo Departamento {/* COR ALTERADA */}
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
                  type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)}
                  required disabled={isLoading} className="input-with-icon pl-10"
                  placeholder="Ex: Marketing Digital"
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
                  id="moduloAcesso" value={moduloAcesso} onChange={(e) => setModuloAcesso(e.target.value)}
                  required disabled={isLoading} className="input-with-icon appearance-none bg-white pl-10"
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
                   id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)}
                   rows={3} disabled={isLoading} className="input-with-icon pl-10 pt-3 resize-y"
                   placeholder="Descreva o objetivo..."
                 />
            </div>
          </div>

          {/* Botão Salvar (Cor Alterada) */}
          <div className="flex justify-end pt-6 border-t mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-neutral-900 hover:bg-neutral-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition-colors duration-200 shadow-md transform hover:scale-105
                          ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`} // COR ALTERADA
            >
              {isLoading ? (<><Loader2 className="animate-spin" size={20} /> Salvando...</>) : (<><Save size={20} /> Salvar Departamento</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}