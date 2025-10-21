// src/app/(admin)/admin/funcionarios/editar/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Users, Save, ArrowLeft, Loader2, AlertTriangle, DollarSign } from 'lucide-react';

// --- Tipos ---
type RoleOption = { id: string; name: string; };
type FuncionarioData = {
  id: string; name: string | null; email: string | null; isActive: boolean;
  admissionDate: Date | string; phone: string | null; cpf: string | null; rg: string | null;
  birthDate: Date | string | null; address: string | null;
  salary?: number | null; // Salário incluído
  roleId: string | null;
  role?: { name: string } | null;
};
// --- Fim dos Tipos ---

// Helper para formatar data (YYYY-MM-DD)
const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    // Ajusta para fuso horário local ANTES de pegar YYYY-MM-DD para o input
    const offset = d.getTimezoneOffset();
    const adjustedDate = new Date(d.getTime() - (offset*60*1000));
    return adjustedDate.toISOString().split('T')[0];
  } catch (e) { console.error("Erro formatar data para input:", date, e); return ''; }
};

export default function EditarFuncionarioPage() {
  const router = useRouter();
  const params = useParams();
  const funcionarioId = params.id as string;

  // Estados do formulário
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [cargoId, setCargoId] = useState<string | null>('');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [salary, setSalary] = useState(''); // Estado para salário (string)

  // Estados de controle
  const [cargos, setCargos] = useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  // --- useEffect para buscar dados ---
  useEffect(() => {
    if (funcionarioId) {
      const fetchData = async () => {
        setIsLoading(true); setError(''); setNotFound(false);
        try {
          const [funcResponse, rolesResponse] = await Promise.all([
            fetch(`/api/funcionarios/${funcionarioId}`),
            fetch('/api/cargos')
          ]);

          if (!rolesResponse.ok) throw new Error('Falha ao buscar cargos');
          setCargos(await rolesResponse.json());

          if (funcResponse.status === 404) { setNotFound(true); throw new Error('Funcionário não encontrado'); }
          if (!funcResponse.ok) { const d = await funcResponse.json(); throw new Error(d.error || `Erro ${funcResponse.status}`); }

          const funcData: FuncionarioData = await funcResponse.json();
          setNomeCompleto(funcData.name || '');
          setEmail(funcData.email || '');
          setCargoId(funcData.roleId || '');
          setDataAdmissao(formatDateForInput(funcData.admissionDate));
          setTelefone(funcData.phone || '');
          setCpf(funcData.cpf || '');
          setRg(funcData.rg || '');
          setDataNascimento(formatDateForInput(funcData.birthDate));
          setEndereco(funcData.address || '');
          setAtivo(funcData.isActive);
          setSalary(funcData.salary !== null && funcData.salary !== undefined ? String(funcData.salary) : '');
          console.log("Dados do funcionário recebidos:", funcData);

        } catch (err: any) {
          console.error("Falha ao buscar dados:", err); setError(err.message || 'Erro ao carregar dados.');
          if (err.message === 'Funcionário não encontrado') {
              setNotFound(true);
          }
        } finally { setIsLoading(false); }
      };
      fetchData();
    }
  }, [funcionarioId]);

  // --- Função handleSubmit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true); setError('');

    if (!cargoId) { setError('Selecione um cargo.'); setIsSaving(false); return; }
    if (salary && isNaN(parseFloat(salary))) { setError('Salário inválido.'); setIsSaving(false); return; }

     const dadosAtualizados = {
        name: nomeCompleto, email, roleId: cargoId, admissionDate: dataAdmissao,
        phone: telefone || null, cpf: cpf || null, rg: rg || null,
        birthDate: dataNascimento || null, address: endereco || null, isActive: ativo,
        salary: salary ? parseFloat(salary) : null // Envia como número ou null
    };

    console.log("Enviando atualização para API:", funcionarioId, dadosAtualizados);

    try {
       const response = await fetch(`/api/funcionarios/${funcionarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados),
      });

       if (!response.ok) { const d = await response.json(); throw new Error(d.error || `Erro ${response.status}`); }

      const funcAtualizado = await response.json();
      alert(`Funcionário "${funcAtualizado.name}" atualizado!`);
      router.push('/admin/funcionarios');
      router.refresh();

    } catch (err: any) {
      console.error("Erro ao atualizar funcionário:", err); setError(`Erro: ${err.message || 'Erro desconhecido'}.`);
    } finally { setIsSaving(false); }
  };

  // --- Renderização Condicional ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 pt-8"> {/* Adicionado pt-8 */}
        <Loader2 className="animate-spin text-gray-500" size={32} />
        <p className="ml-2 text-gray-600">Carregando dados...</p>
      </div>
    );
  }

  if (notFound) {
     return (
        <div className="pt-8"> {/* Adicionado pt-8 */}
           <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2"><AlertTriangle/> Erro</h1>
             <Link href="/admin/funcionarios" className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1 transition-colors">
               <ArrowLeft size={16} /> Voltar
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
    // Adicionado pt-8 para espaçamento do header
    <div className="pt-8">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><Users size={28} /> Editar Funcionário</h1>
         <Link href="/admin/funcionarios" className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1 transition-colors"><ArrowLeft size={16} /> Voltar</Link>
      </div>

      {/* Formulário */}
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-center text-red-600 bg-red-100 p-2 rounded">{error}</p>}

          {/* Dados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700 mb-1">Nome <span className="text-red-600">*</span></label><input type="text" id="nomeCompleto" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} required disabled={isSaving} className="input-form" /></div>
              <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-600">*</span></label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSaving} className="input-form"/></div>
          </div>

           {/* Senha (Não editável) e Cargo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Senha</label><input type="password" disabled value="********" title="Senha não editável aqui" className="input-form bg-gray-100 cursor-not-allowed" /></div>
              <div>
                <label htmlFor="cargoId" className="block text-sm font-medium text-gray-700 mb-1">Cargo <span className="text-red-600">*</span></label>
                <select id="cargoId" value={cargoId ?? ''} onChange={(e) => setCargoId(e.target.value)} required disabled={isSaving || cargos.length === 0} className="input-form bg-white">
                  <option value="" disabled>Selecione</option>
                  {cargos.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
          </div>

          {/* Data Admissão, Salário, Telefone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label htmlFor="dataAdmissao" className="block text-sm font-medium text-gray-700 mb-1">Admissão <span className="text-red-600">*</span></label><input type="date" id="dataAdmissao" value={dataAdmissao} onChange={(e) => setDataAdmissao(e.target.value)} required disabled={isSaving} className="input-form" /></div>
               <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">Salário (R$)</label>
                  <div className="relative"><span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><DollarSign size={16}/></span><input type="number" id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} step="0.01" min="0" disabled={isSaving} className="input-form pl-9" placeholder="1500.00" /></div>
               </div>
              <div><label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input type="tel" id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} disabled={isSaving} className="input-form" /></div>
          </div>

           {/* Data Nasc */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-1">Nascimento</label><input type="date" id="dataNascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} disabled={isSaving} className="input-form" /></div>
              <div></div><div></div>
           </div>

            {/* Documentos */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div><label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">CPF</label><input type="text" id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} disabled={isSaving} className="input-form"/></div>
               <div><label htmlFor="rg" className="block text-sm font-medium text-gray-700 mb-1">RG</label><input type="text" id="rg" value={rg} onChange={(e) => setRg(e.target.value)} disabled={isSaving} className="input-form" /></div>
           </div>

           {/* Endereço */}
           <div><label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">Endereço</label><textarea id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} rows={2} disabled={isSaving} className="input-form"></textarea></div>

            {/* Status */}
           <div className="flex items-center"><input id="ativo" type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} disabled={isSaving} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/><label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">Funcionário Ativo</label></div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className={`bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-6 rounded inline-flex items-center gap-2 transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
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
// Aplique className="input-form"
// (O ideal é que .input-form esteja em globals.css)