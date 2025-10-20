// src/app/(admin)/admin/funcionarios/editar/[id]/page.tsx
'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation'; 
import { Users, Save, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';

// --- Tipos ---
type RoleOption = {
  id: string;
  name: string;
};
type FuncionarioData = { // Dados esperados da API GET /api/funcionarios/[id]
  id: string;
  name: string | null;
  email: string | null;
  isActive: boolean;
  admissionDate: Date | string; 
  phone: string | null;
  cpf: string | null;
  rg: string | null;
  birthDate: Date | string | null;
  address: string | null;
  roleId: string | null; 
  // O role pode vir junto se incluído na API GET
  role?: { name: string } | null; 
};
// --- Fim dos Tipos ---

// Helper para formatar data (YYYY-MM-DD)
const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const adjustedDate = new Date(d.getTime() - (offset*60*1000));
    return adjustedDate.toISOString().split('T')[0];
  } catch (e) { console.error("Erro formatar data:", date, e); return ''; }
};

export default function EditarFuncionarioPage() {
  const router = useRouter();
  const params = useParams(); 
  const funcionarioId = params.id as string; 

  // Estados do formulário
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [cargoId, setCargoId] = useState<string | null>(''); // Permitir null temporariamente
  const [dataAdmissao, setDataAdmissao] = useState(''); 
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [ativo, setAtivo] = useState(true);

  // Estados de controle
  const [cargos, setCargos] = useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  // --- useEffect para buscar dados do Funcionário e a lista de Cargos ---
  useEffect(() => {
    if (funcionarioId) {
      const fetchData = async () => {
        setIsLoading(true);
        setError('');
        setNotFound(false);
        console.log("Buscando dados via API para funcionário:", funcionarioId);

        try {
          // Busca dados do funcionário E lista de cargos em paralelo
          const [funcResponse, rolesResponse] = await Promise.all([
            fetch(`/api/funcionarios/${funcionarioId}`),
            fetch('/api/cargos') 
          ]);

          // Trata erros da busca de cargos
          if (!rolesResponse.ok) throw new Error('Falha ao buscar cargos para o dropdown');
          const rolesData: RoleOption[] = await rolesResponse.json();
          setCargos(rolesData);

          // Trata erros da busca do funcionário
          if (funcResponse.status === 404) {
             setNotFound(true);
             throw new Error('Funcionário não encontrado');
          }
          if (!funcResponse.ok) {
            const errorData = await funcResponse.json();
            throw new Error(errorData.error || `Erro HTTP: ${funcResponse.status}`);
          }

          // Preenche o formulário
          const funcData: FuncionarioData = await funcResponse.json();
          setNomeCompleto(funcData.name || '');
          setEmail(funcData.email || '');
          setCargoId(funcData.roleId || ''); // Define o cargo atual
          setDataAdmissao(formatDateForInput(funcData.admissionDate));
          setTelefone(funcData.phone || '');
          setCpf(funcData.cpf || '');
          setRg(funcData.rg || '');
          setDataNascimento(formatDateForInput(funcData.birthDate));
          setEndereco(funcData.address || '');
          setAtivo(funcData.isActive);
          console.log("Dados do funcionário recebidos:", funcData);

        } catch (err: any) {
          console.error("Falha ao buscar dados:", err);
          setError(err.message || 'Erro ao carregar dados.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [funcionarioId]); 

  // --- Função handleSubmit conectada à API PUT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

     if (!cargoId) {
      setError('Por favor, selecione um cargo.');
      setIsSaving(false);
      return;
    }

     // Monta o objeto com os dados atualizados (sem senha)
     const dadosAtualizados = {
        name: nomeCompleto, // API espera 'name'
        email, 
        roleId: cargoId, 
        admissionDate: dataAdmissao, 
        phone: telefone || null, 
        cpf: cpf || null, 
        rg: rg || null, 
        birthDate: dataNascimento || null, 
        address: endereco || null, 
        isActive: ativo
    };

    // --- LÓGICA DE ATUALIZAÇÃO (CONECTADA À API) ---
    console.log("Enviando atualização para API:", funcionarioId, dadosAtualizados);
    
    try {
       const response = await fetch(`/api/funcionarios/${funcionarioId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados), 
      });

       if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      const funcionarioAtualizado = await response.json();
      console.log("Funcionário atualizado via API:", funcionarioAtualizado);
      alert(`Funcionário "${funcionarioAtualizado.name}" atualizado com sucesso!`);
      router.push('/admin/funcionarios'); 
      router.refresh(); 

    } catch (err: any) {
      console.error("Erro ao atualizar funcionário via API:", err);
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
        <p className="ml-2 text-gray-600">Carregando dados do funcionário...</p>
      </div>
    );
  }

  if (notFound) {
     return (
        <div>
           <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2"><AlertTriangle/> Erro</h1>
             <Link href="/admin/funcionarios" className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1 transition-colors">
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
          <Users size={28} /> Editar Funcionário
        </h1>
        <Link 
          href="/admin/funcionarios" 
          className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para Lista
        </Link>
      </div>

      {/* Formulário */}
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-center text-red-600 bg-red-100 p-2 rounded">{error}</p>}
          
          {/* Dados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo <span className="text-red-600">*</span></label>
              <input type="text" id="nomeCompleto" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} required disabled={isSaving} className="input-form" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-600">*</span></label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSaving} className="input-form"/>
            </div>
          </div>
          
           {/* Senha (Não editável) e Cargo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input type="password" disabled value="********" title="A senha não pode ser editada aqui" className="input-form bg-gray-100 cursor-not-allowed" />
              </div>
            <div>
              <label htmlFor="cargoId" className="block text-sm font-medium text-gray-700 mb-1">Cargo <span className="text-red-600">*</span></label>
              <select id="cargoId" value={cargoId ?? ''} onChange={(e) => setCargoId(e.target.value)} required disabled={isSaving || cargos.length === 0} className="input-form bg-white">
                <option value="" disabled>Selecione um cargo</option>
                {cargos.map((cargo) => (
                  <option key={cargo.id} value={cargo.id}>{cargo.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dados Pessoais */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="dataAdmissao" className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão <span className="text-red-600">*</span></label>
                <input type="date" id="dataAdmissao" value={dataAdmissao} onChange={(e) => setDataAdmissao(e.target.value)} required disabled={isSaving} className="input-form" />
              </div>
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input type="tel" id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} disabled={isSaving} className="input-form" />
              </div>
                <div>
                  <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                  <input type="date" id="dataNascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} disabled={isSaving} className="input-form" />
                </div>
           </div>
           
            {/* Documentos */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                 <input type="text" id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} disabled={isSaving} className="input-form"/>
               </div>
               <div>
                 <label htmlFor="rg" className="block text-sm font-medium text-gray-700 mb-1">RG</label>
                 <input type="text" id="rg" value={rg} onChange={(e) => setRg(e.target.value)} disabled={isSaving} className="input-form" />
               </div>
           </div>
           
           {/* Endereço */}
           <div>
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <textarea id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} rows={2} disabled={isSaving} className="input-form"></textarea>
           </div>
           
            {/* Status */}
           <div className="flex items-center">
             <input id="ativo" name="ativo" type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} disabled={isSaving} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
             <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">Funcionário Ativo</label>
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