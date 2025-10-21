// app/(admin)/admin/cargos/novo/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Briefcase, Save, ArrowLeft, Loader2, AlertTriangle,
    Building, AlignLeft, ShieldCheck, ChevronDown, CheckCircle,
    TrendingUp, // Nível Hierárquico
    Smile // Ícone para o campo Icon Name
} from 'lucide-react';

type DepartmentOption = { id: string; name: string; };

export default function NovoCargoPage() {
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isDirector, setIsDirector] = useState(false);
  const [hierarchyLevel, setHierarchyLevel] = useState('99');
  const [iconName, setIconName] = useState('');

  // Estados de controle
  const [departamentos, setDepartamentos] = useState<DepartmentOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDepts, setIsFetchingDepts] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // --- useEffect para buscar Departamentos ---
  useEffect(() => {
    const fetchDepartamentos = async () => {
      setIsFetchingDepts(true); setError('');
      try {
        const response = await fetch('/api/departamentos');
        if (!response.ok) throw new Error('Falha ao buscar departamentos');
        const data: DepartmentOption[] = await response.json();
        setDepartamentos(data);
        if (data.length > 0) { setDepartamentoId(data[0].id); }
      } catch (err: any) {
        console.error("Erro ao buscar departamentos:", err);
        setError("Erro ao carregar lista de departamentos. Tente recarregar.");
      } finally { setIsFetchingDepts(false); }
    };
    fetchDepartamentos();
  }, []);

  // --- Função handleSubmit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setError('');
    if (!departamentoId) { setError('Por favor, selecione um departamento.'); setIsLoading(false); return; }

    const levelNumber = parseInt(hierarchyLevel, 10);
    if (isNaN(levelNumber) || levelNumber < 0) {
        setError('Nível Hierárquico deve ser um número inteiro não negativo (0 ou maior).');
        setIsLoading(false);
        return;
    }

    console.log("Enviando:", { name: nome, departmentId: departamentoId, description: descricao, isDirector, hierarchyLevel: levelNumber, iconName });

    try {
      const response = await fetch('/api/cargos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nome, departmentId: departamentoId, description: descricao,
          isDirector: isDirector, hierarchyLevel: levelNumber,
          iconName: iconName.trim() || null
        }),
      });
      if (!response.ok) { const d = await response.json(); throw new Error(d.error || `Erro ${response.status}`); }
      const novoCargo = await response.json();
      alert(`Cargo "${novoCargo.name}" criado!`);
      router.push('/admin/cargos'); router.refresh();
    } catch (err: any) {
      console.error("Erro:", err); setError(err.message || 'Erro.');
    } finally { setIsLoading(false); }
  };

  // --- Renderização Loading/Erro ---
  if (isFetchingDepts) { return ( <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-gray-500" size={32} /><p className="ml-3 text-gray-600">Carregando...</p></div> ); }
  if (error && departamentos.length === 0) { return ( <div className="pt-14 p-6"><div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-red-600 flex items-center gap-2"><AlertTriangle/> Erro</h1><Link href="/admin/cargos" className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1"><ArrowLeft size={16} /> Voltar</Link></div><div className="bg-white p-6 rounded-lg shadow border border-red-200"><p className="text-gray-700">{error}</p></div></div> ); }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 pt-14">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
             <Briefcase size={32} className="text-neutral-900" /> Novo Cargo {/* Ícone do título alterado */}
         </h1>
         <Link href="/admin/cargos" className="inline-flex items-center text-neutral-700 hover:text-neutral-900 transition-colors font-medium"> {/* Cor do link alterada */}
            <ArrowLeft size={18} className="mr-2" /> Voltar para Cargos
         </Link>
      </div>

      {/* Formulário */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-lg border border-red-200">{error}</p>}

          {/* Linha 1: Nome, Nível Hierárquico */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2">
               <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-1">Nome <span className="text-red-600">*</span></label>
               <div className="relative"><Briefcase size={18} className="icon-input"/><input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={isLoading || isFetchingDepts} className="input-with-icon pl-10"/></div>
             </div>
             <div>
               <label htmlFor="hierarchyLevel" className="block text-sm font-semibold text-gray-700 mb-1">Nível <span className="text-red-600">*</span></label>
               <div className="relative"><TrendingUp size={18} className="icon-input"/><input type="number" id="hierarchyLevel" value={hierarchyLevel} onChange={(e) => setHierarchyLevel(e.target.value)} required min="0" step="1" disabled={isLoading || isFetchingDepts} className="input-with-icon pl-10"/></div>
               <p className="mt-1 text-xs text-gray-500">0 = Mais alto.</p>
             </div>
          </div>

          {/* Linha 2: Departamento, Ícone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label htmlFor="departamentoId" className="block text-sm font-semibold text-gray-700 mb-1">Departamento <span className="text-red-600">*</span></label>
                <div className="relative"><Building size={18} className="icon-input"/><select id="departamentoId" value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)} required disabled={isLoading || isFetchingDepts || !departamentos.length} className="input-with-icon appearance-none bg-white pl-10"><option value="" disabled>Selecione</option>{departamentos.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}</select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div>
             </div>
             <div>
                <label htmlFor="iconName" className="block text-sm font-semibold text-gray-700 mb-1">Ícone (Opcional)</label>
                <div className="relative"><Smile size={18} className="icon-input"/><input type="text" id="iconName" value={iconName} onChange={(e) => setIconName(e.target.value)} disabled={isLoading || isFetchingDepts} className="input-with-icon pl-10" placeholder="Nome do Lucide Icon"/></div>
                <p className="mt-1 text-xs text-gray-500">Ex: Code (<a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">ver nomes</a>)</p>
             </div>
          </div>

          {/* Linha 3: Checkbox Diretor */}
           <div className="flex items-center">
             <input id="isDirector" name="isDirector" type="checkbox" checked={isDirector} onChange={(e) => setIsDirector(e.target.checked)} disabled={isLoading || isFetchingDepts} className="h-4 w-4 text-neutral-600 focus:ring-neutral-500 border-gray-300 rounded"/> {/* Cor alterada */}
             <label htmlFor="isDirector" className="ml-2 block text-sm text-gray-900"> Cargo de Diretor?</label>
           </div>

          {/* Linha 4: Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 mb-1">Descrição (Opcional)</label>
            <div className="relative"><AlignLeft size={18} className="icon-input-textarea"/><textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} disabled={isLoading || isFetchingDepts} className="input-with-icon pl-10 pt-3 resize-y"/></div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-6 border-t mt-8">
            {/* COR DO BOTÃO ALTERADA AQUI */}
            <button
              type="submit"
              disabled={isLoading || isFetchingDepts}
              className={`bg-neutral-900 hover:bg-neutral-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition-colors duration-200 shadow-md transform hover:scale-105 ${(isLoading || isFetchingDepts) ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <Save size={18} /> {isLoading ? 'Salvando...' : 'Salvar Cargo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}