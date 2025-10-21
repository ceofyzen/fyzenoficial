// src/app/(admin)/admin/funcionarios/novo/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Users, Save, ArrowLeft, Loader2, AlertTriangle, User, Mail, Lock,
    Briefcase, CalendarDays, DollarSign, Phone, Hash, MapPin, Building,
    Info, SquareUser, ChevronDown, Camera, XCircle, UserCircle, Search, Globe,
    AlignLeft // <<< ÍCONE ADICIONADO AQUI
} from 'lucide-react';

import ImageUpload from '@/components/ImageUpload';

// --- Tipos ---
type RoleOption = { id: string; name: string; departmentId: string };
type DepartmentOption = { id: string; name: string };
type ManagerOption = { id: string; name: string | null };
type ViaCepResponse = {
    cep: string; logradouro: string; complemento: string; bairro: string;
    localidade: string; uf: string; ibge: string; gia: string; ddd: string; siafi: string; erro?: boolean;
};
// --- Fim Tipos ---

// --- Mapeamento de Status ---
const statusOptions: { [key: string]: string } = {
    Ativo: 'Ativo',
    Ferias: 'Férias',
    Atestado: 'Atestado',
};

// Helper para data
const getDefaultDate = (): string => new Date().toISOString().split('T')[0];

export default function NovoFuncionarioPage() {
  // --- Estados do formulário ---
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDepartamentoId, setSelectedDepartamentoId] = useState<string>('');
  const [cargoId, setCargoId] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState(getDefaultDate());
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [status, setStatus] = useState<string>('Ativo');
  const [managerId, setManagerId] = useState<string>('');
  const [salary, setSalary] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [pais, setPais] = useState('Brasil');
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  // --- Estados de controle ---
  const [cargos, setCargos] = useState<RoleOption[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartmentOption[]>([]);
  const [potentialManagers, setPotentialManagers] = useState<ManagerOption[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Loading do submit
  const [isFetchingRelatedData, setIsFetchingRelatedData] = useState(true); // Loading inicial dos selects
  const [error, setError] = useState('');
  const router = useRouter();

  // --- useEffect para buscar Dados Relacionados ---
  useEffect(() => {
    const fetchRelatedData = async () => {
      setIsFetchingRelatedData(true);
      setError('');
      try {
        const [deptsResponse, rolesResponse, allFuncsResponse] = await Promise.all([
          fetch('/api/departamentos'),
          fetch('/api/cargos'),
          fetch('/api/funcionarios')
        ]);

        if (!deptsResponse.ok) throw new Error('Falha ao buscar departamentos');
        setDepartamentos(await deptsResponse.json());

        if (!rolesResponse.ok) throw new Error('Falha ao buscar cargos');
        setCargos(await rolesResponse.json());

        if (!allFuncsResponse.ok) throw new Error('Falha ao buscar lista de funcionários');
        const allFuncsData: ManagerOption[] = await allFuncsResponse.json();
        setPotentialManagers(allFuncsData);

      } catch (err: any) {
        console.error("Falha ao buscar dados relacionados:", err);
        setError(`Erro ao carregar opções: ${err.message || 'Erro desconhecido'}`);
      } finally {
        setIsFetchingRelatedData(false);
      }
    };
    fetchRelatedData();
  }, []);

  // --- LÓGICA DE BUSCA DO CEP ---
  useEffect(() => {
    const fetchAddressFromCep = async (cepValue: string) => {
      const numericCep = cepValue.replace(/\D/g, '');
      if (numericCep.length !== 8) { setCepError(null); return; }
      setIsCepLoading(true); setCepError(null);
      setLogradouro(''); setBairro(''); setCidade(''); setEstado('');
      try {
        const response = await fetch(`https://viacep.com.br/ws/${numericCep}/json/`);
        if (!response.ok) throw new Error('Falha ao buscar CEP.');
        const data: ViaCepResponse = await response.json();
        if (data.erro) throw new Error('CEP não encontrado.');
        setLogradouro(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
        setEstado(data.uf || '');
        document.getElementById('numero')?.focus();
      } catch (err: any) { console.error("Erro ao buscar CEP:", err); setCepError(err.message || 'Erro.'); }
      finally { setIsCepLoading(false); }
    };
    const debounceTimeout = setTimeout(() => { fetchAddressFromCep(cep); }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [cep]);

  // --- Função Upload (Simulação) ---
  const uploadImage = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          const mockUrl = URL.createObjectURL(file);
          console.log("Simulando upload:", mockUrl);
          setIsUploadingImage(false);
          resolve(mockUrl);
        }, 1500);
      } catch (error) {
        console.error("Erro simulando upload:", error);
        setIsUploadingImage(false);
        reject(new Error("Falha ao simular upload"));
      }
    });
  };

  // --- Função handleSubmit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setError('');
    if (!cargoId) { setError('Selecione um cargo.'); setIsLoading(false); return; }
    if (salary && isNaN(parseFloat(salary))) { setError('Salário inválido.'); setIsLoading(false); return; }
    if (!status) { setError('Selecione um status.'); setIsLoading(false); return; }

    let imageUrlToSave: string | null = null;
    if (newImageFile) { try { imageUrlToSave = await uploadImage(newImageFile); } catch (uploadError: any) { setError(`Erro upload imagem: ${uploadError.message}`); setIsLoading(false); return; } }

    const novoFuncionario = {
        name: nomeCompleto, email, password: password || null, roleId: cargoId, admissionDate: dataAdmissao,
        phone: telefone || null, cpf: cpf || null, rg: rg || null, birthDate: dataNascimento || null,
        cep: cep || null, logradouro: logradouro || null, numero: numero || null, complemento: complemento || null,
        bairro: bairro || null, cidade: cidade || null, estado: estado || null, pais: pais || null,
        status: status, managerId: managerId || null,
        salary: salary ? parseFloat(salary) : null,
        image: imageUrlToSave,
    };

    console.log("Enviando para API /api/funcionarios:", novoFuncionario);
    try {
      const response = await fetch('/api/funcionarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novoFuncionario), });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || `Erro HTTP: ${response.status}`); }
      const funcionarioCriado = await response.json();
      alert(`Funcionário "${funcionarioCriado.name}" criado com sucesso!`);
      router.push('/admin/funcionarios'); router.refresh();
    } catch (err: any) { console.error("Erro ao criar funcionário:", err); setError(`Erro: ${err.message || 'Erro desconhecido'}.`); }
    finally { setIsLoading(false); setIsUploadingImage(false); }
  };

  // --- Renderização ---
  if (isFetchingRelatedData && !error) { return ( <div className="flex justify-center items-center min-h-[calc(100vh-100px)] text-gray-600"><Loader2 className="animate-spin mr-2" size={24} /> Carregando opções...</div> ); }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 pt-14">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3"><Users size={32} className="text-indigo-600" /> Contratar Funcionário</h1>
         <Link href="/admin/funcionarios" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors font-medium"><ArrowLeft size={18} className="mr-2" /> Voltar</Link>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-lg border border-red-200 mb-6">{error}</p>}

          {/* Seção Avatar e Dados Pessoais */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start border-b pb-6 mb-6">
            <div className="flex-shrink-0 w-full md:w-auto text-center"><ImageUpload onImageChange={setNewImageFile} disabled={isLoading || isUploadingImage} isLoading={isUploadingImage}/></div>
            <div className="flex-grow w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label htmlFor="nomeCompleto" className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo <span className="text-red-600">*</span></label><div className="relative"><User size={18} className="icon-input"/><input type="text" id="nomeCompleto" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} required disabled={isLoading || isUploadingImage} className="input-with-icon pl-10" /></div></div>
                <div><label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-600">*</span></label><div className="relative"><Mail size={18} className="icon-input"/><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading || isUploadingImage} className="input-with-icon pl-10" placeholder="usuario@fyzen.com"/></div></div>
              </div>
              <div><label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Senha Inicial <span className="text-gray-500 text-xs">(para 1º login)</span></label><div className="relative"><Lock size={18} className="icon-input"/><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading || isUploadingImage} className="input-with-icon pl-10" /></div></div>
            </div>
          </div>

          {/* Seção Informações de Emprego */}
          <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Informações de Emprego</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
             <div className="lg:col-span-1"><label htmlFor="departamento" className="block text-sm font-semibold text-gray-700 mb-1">Departamento <span className="text-red-600">*</span></label><div className="relative"><Building size={18} className="icon-input"/><select id="departamento" value={selectedDepartamentoId} onChange={(e) => { setSelectedDepartamentoId(e.target.value); setCargoId(''); }} required disabled={isLoading || isUploadingImage || departamentos.length === 0} className="input-with-icon appearance-none bg-white pl-10"><option value="" disabled>Selecione</option>{departamentos.map((dept) => ( <option key={dept.id} value={dept.id}>{dept.name}</option> ))}</select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div></div>
             <div className="lg:col-span-1"><label htmlFor="cargoId" className="block text-sm font-semibold text-gray-700 mb-1">Cargo <span className="text-red-600">*</span></label><div className="relative"><Briefcase size={18} className="icon-input"/><select id="cargoId" value={cargoId} onChange={(e) => setCargoId(e.target.value)} required disabled={!selectedDepartamentoId || isLoading || isUploadingImage || cargos.length === 0} className="input-with-icon appearance-none bg-white pl-10 disabled:bg-gray-100 disabled:cursor-not-allowed"><option value="" disabled>Selecione</option>{cargos.filter(c => c.departmentId === selectedDepartamentoId).map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}</select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div></div>
             <div className="lg:col-span-1"><label htmlFor="dataAdmissao" className="block text-sm font-semibold text-gray-700 mb-1">Data de Admissão <span className="text-red-600">*</span></label><div className="relative"><CalendarDays size={18} className="icon-input"/><input type="date" id="dataAdmissao" value={dataAdmissao} onChange={(e) => setDataAdmissao(e.target.value)} required disabled={isLoading || isUploadingImage} className="input-with-icon pl-10" /></div></div>
             <div className="lg:col-span-1"><label htmlFor="salary" className="block text-sm font-semibold text-gray-700 mb-1">Salário (R$)</label><div className="relative"><span className="absolute inset-y-0 left-3 flex items-center text-gray-500 text-sm pointer-events-none">R$</span><input type="number" id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} step="0.01" min="0" disabled={isLoading || isUploadingImage} className="input-with-icon pl-9" placeholder="0.00"/></div></div>
             <div className="lg:col-span-1"><label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-1">Status Inicial <span className="text-red-600">*</span></label><div className="relative"><Info size={18} className="icon-input"/><select id="status" value={status} onChange={(e) => setStatus(e.target.value)} required disabled={isLoading || isUploadingImage} className="input-with-icon appearance-none bg-white pl-10">{Object.entries(statusOptions).map(([key, text]) => ( <option key={key} value={key}>{text}</option> ))}</select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div></div>
             <div className="lg:col-span-1"><label htmlFor="managerId" className="block text-sm font-semibold text-gray-700 mb-1">Gestor</label><div className="relative"><SquareUser size={18} className="icon-input"/><select id="managerId" value={managerId} onChange={(e) => setManagerId(e.target.value)} disabled={isLoading || isUploadingImage} className="input-with-icon appearance-none bg-white pl-10"><option value="">Nenhum</option>{potentialManagers.map((manager) => (<option key={manager.id} value={manager.id}>{manager.name || 'Nome não definido'}</option>))}</select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div></div>
          </div>

          {/* Seção Contato e Pessoal */}
          <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 pt-4">Contato e Pessoal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="telefone" className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label><div className="relative"><Phone size={18} className="icon-input"/><input type="tel" id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} disabled={isLoading || isUploadingImage} className="input-with-icon pl-10" placeholder="(XX) XXXXX-XXXX"/></div></div>
            <div><label htmlFor="dataNascimento" className="block text-sm font-semibold text-gray-700 mb-1">Data de Nascimento</label><div className="relative"><CalendarDays size={18} className="icon-input"/><input type="date" id="dataNascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} disabled={isLoading || isUploadingImage} className="input-with-icon pl-10" /></div></div>
            <div><label htmlFor="cpf" className="block text-sm font-semibold text-gray-700 mb-1">CPF</label><div className="relative"><Hash size={18} className="icon-input"/><input type="text" id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} disabled={isLoading || isUploadingImage} className="input-with-icon pl-10" placeholder="000.000.000-00"/></div></div>
            <div><label htmlFor="rg" className="block text-sm font-semibold text-gray-700 mb-1">RG</label><div className="relative"><Hash size={18} className="icon-input"/><input type="text" id="rg" value={rg} onChange={(e) => setRg(e.target.value)} disabled={isLoading || isUploadingImage} className="input-with-icon pl-10" /></div></div>
          </div>

          {/* SEÇÃO DE ENDEREÇO REORGANIZADA E CORRIGIDA */}
          <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 pt-4">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-4">
               {/* CEP (Ocupa 2 colunas de 6) */}
               <div className="md:col-span-2">
                  <label htmlFor="cep" className="block text-sm font-semibold text-gray-700 mb-1">CEP</label>
                  <div className="relative">
                      <Search size={18} className="icon-input"/>
                      <input type="text" id="cep" value={cep} onChange={(e) => setCep(e.target.value)} maxLength={9} placeholder="00000-000" disabled={isLoading || isUploadingImage} className={`input-with-icon pl-10 ${cepError ? 'border-red-500' : ''}`} />
                      {isCepLoading && <Loader2 className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>}
                  </div>
                  {cepError && <p className="text-xs text-red-600 mt-1">{cepError}</p>}
               </div>

                {/* Logradouro (Ocupa 4 colunas de 6) */}
                <div className="md:col-span-4">
                     <label htmlFor="logradouro" className="block text-sm font-semibold text-gray-700 mb-1">Logradouro</label>
                     <div className="relative"><MapPin size={18} className="icon-input"/><input type="text" id="logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} disabled={isLoading || isUploadingImage || isCepLoading} className="input-with-icon pl-10 disabled:bg-gray-100" /></div>
                 </div>

                {/* Número (Ocupa 2 colunas de 6) */}
                <div className="md:col-span-2">
                     <label htmlFor="numero" className="block text-sm font-semibold text-gray-700 mb-1">Número</label>
                     {/* CORRIGIDO: Adicionado ícone e classe input-with-icon */}
                     <div className="relative"><Hash size={18} className="icon-input"/><input type="text" id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} disabled={isLoading || isUploadingImage || isCepLoading} className="input-with-icon pl-10" /></div>
                 </div>

                {/* Complemento (Ocupa 4 colunas de 6) */}
                <div className="md:col-span-4">
                     <label htmlFor="complemento" className="block text-sm font-semibold text-gray-700 mb-1">Complemento</label>
                     {/* CORRIGIDO: Adicionado ícone e classe input-with-icon */}
                     <div className="relative"><AlignLeft size={18} className="icon-input"/><input type="text" id="complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} disabled={isLoading || isUploadingImage || isCepLoading} className="input-with-icon pl-10" placeholder="Apto, Bloco, Casa..." /></div>
                 </div>

                {/* Bairro (Ocupa 3 colunas de 6) */}
                <div className="md:col-span-3">
                     <label htmlFor="bairro" className="block text-sm font-semibold text-gray-700 mb-1">Bairro</label>
                     <div className="relative"><MapPin size={18} className="icon-input"/><input type="text" id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} disabled={isLoading || isUploadingImage || isCepLoading} className="input-with-icon pl-10 disabled:bg-gray-100" /></div>
                 </div>

                 {/* Cidade (Ocupa 3 colunas de 6) */}
                <div className="md:col-span-3">
                     <label htmlFor="cidade" className="block text-sm font-semibold text-gray-700 mb-1">Cidade</label>
                     <div className="relative"><MapPin size={18} className="icon-input"/><input type="text" id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={isLoading || isUploadingImage || isCepLoading} className="input-with-icon pl-10 disabled:bg-gray-100" /></div>
                 </div>

                {/* Estado (Ocupa 2 colunas de 6) */}
                <div className="md:col-span-2">
                     <label htmlFor="estado" className="block text-sm font-semibold text-gray-700 mb-1">Estado (UF)</label>
                     <div className="relative"><MapPin size={18} className="icon-input"/><input type="text" id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} maxLength={2} disabled={isLoading || isUploadingImage || isCepLoading} className="input-with-icon pl-10 disabled:bg-gray-100" /></div>
                 </div>

                {/* País (Ocupa 4 colunas de 6) */}
                <div className="md:col-span-4">
                     <label htmlFor="pais" className="block text-sm font-semibold text-gray-700 mb-1">País</label>
                     <div className="relative"><Globe size={18} className="icon-input"/><input type="text" id="pais" value={pais} onChange={(e) => setPais(e.target.value)} disabled={isLoading || isUploadingImage} className="input-with-icon pl-10" /></div>
                 </div>
           </div>
          {/* FIM SEÇÃO ENDEREÇO */}


          {/* Botão Salvar */}
          <div className="flex justify-end pt-6 border-t mt-8">
            <button
              type="submit"
              disabled={isLoading || isFetchingRelatedData || isUploadingImage || isCepLoading}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition-colors duration-200 shadow-md transform hover:scale-105 ${(isLoading || isFetchingRelatedData || isUploadingImage || isCepLoading) ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                {isLoading || isUploadingImage || isCepLoading ? (<><Loader2 className="animate-spin" size={20} /> Salvando...</>) : (<><Save size={20} /> Salvar Funcionário</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Estilos CSS (adicionar ao globals.css se necessário)
/*
.input-form {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm;
}
.input-with-icon {
  @apply w-full pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm;
}
.input-with-icon:disabled { @apply bg-gray-100 cursor-not-allowed; }
select.input-with-icon { @apply bg-white; }
select.input-with-icon:disabled { @apply bg-gray-100 text-gray-500; }
.icon-input {
  @apply absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none;
}
.icon-input-textarea {
  @apply absolute left-3 top-3 text-gray-400 pointer-events-none;
}
.btn-primary {
  @apply bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200;
}
*/