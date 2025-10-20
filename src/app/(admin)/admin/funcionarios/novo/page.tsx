// src/app/(admin)/admin/funcionarios/novo/page.tsx
'use client'; 

import { useState, useEffect } from 'react'; 
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { Users, Save, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react'; 

// --- Tipos ---
type RoleOption = { // Para o dropdown de cargos
  id: string;
  name: string;
};
// --- Fim dos Tipos ---

export default function NovoFuncionarioPage() {
  // Estados do formulário
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [cargoId, setCargoId] = useState(''); // Inicia vazio
  const [dataAdmissao, setDataAdmissao] = useState(new Date().toISOString().split('T')[0]); 
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [ativo, setAtivo] = useState(true);

  // Estados de controle
  const [cargos, setCargos] = useState<RoleOption[]>([]); // Lista de cargos da API
  const [isLoading, setIsLoading] = useState(false); // Loading do submit
  const [isFetchingRoles, setIsFetchingRoles] = useState(true); // Loading inicial dos cargos
  const [error, setError] = useState('');
  const router = useRouter();

  // --- useEffect para buscar Cargos para o dropdown ---
  useEffect(() => {
    const fetchCargos = async () => {
      setIsFetchingRoles(true);
      setError('');
      try {
        const response = await fetch('/api/cargos'); // Busca da API de cargos
        if (!response.ok) throw new Error('Falha ao buscar cargos');
        const data: RoleOption[] = await response.json();
        setCargos(data);
        // Define o primeiro cargo como padrão, se a lista não estiver vazia
        if (data.length > 0) {
           setCargoId(data[0].id);
        }
      } catch (err: any) {
        console.error("Erro ao buscar cargos:", err);
        setError("Erro ao carregar lista de cargos. Tente recarregar.");
      } finally {
        setIsFetchingRoles(false);
      }
    };
    fetchCargos();
  }, []); 

  // --- Função handleSubmit conectada à API POST ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!cargoId) {
      setError('Por favor, selecione um cargo.');
      setIsLoading(false);
      return;
    }

    const novoFuncionario = {
        name: nomeCompleto, // API espera 'name'
        email, 
        password: password || null, // Envia null se a senha estiver vazia
        roleId: cargoId, 
        admissionDate: dataAdmissao, 
        phone: telefone || null, 
        cpf: cpf || null, 
        rg: rg || null, 
        birthDate: dataNascimento || null, 
        address: endereco || null, 
        isActive: ativo
    };

    // --- LÓGICA DE CRIAÇÃO (CONECTADA À API) ---
    console.log("Enviando para API /api/funcionarios:", novoFuncionario);
    
    try {
      const response = await fetch('/api/funcionarios', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoFuncionario), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      const funcionarioCriado = await response.json();
      console.log("Funcionário criado via API:", funcionarioCriado);
      alert(`Funcionário "${funcionarioCriado.name}" criado com sucesso!`);
      router.push('/admin/funcionarios'); 
      router.refresh(); 

    } catch (err: any) {
      console.error("Erro ao criar funcionário via API:", err);
      setError(`Erro ao criar funcionário: ${err.message || 'Erro desconhecido'}. Verifique o console.`);
    } finally {
       setIsLoading(false); 
    }
    // --- Fim da Lógica ---
  };

  // Mostrar loading inicial se estiver buscando cargos
  if (isFetchingRoles) {
     return (
       <div className="flex justify-center items-center h-40">
         <Loader2 className="animate-spin text-gray-500" size={32} />
         <p className="ml-2 text-gray-600">Carregando cargos...</p>
       </div>
     );
  }

  // Mostrar erro se falhar ao buscar cargos (impede submissão)
   if (error && cargos.length === 0) {
      return (
        <div>
           <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2"><AlertTriangle/> Erro</h1>
             <Link 
               href="/admin/funcionarios" 
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
          <Users size={28} /> Novo Funcionário
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
              <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo <span className="text-red-600">*</span>
              </label>
              <input type="text" id="nomeCompleto" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} required disabled={isLoading || isFetchingRoles} className="input-form" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-600">*</span>
              </label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading || isFetchingRoles} className="input-form" placeholder="usuario@fyzen.com"/>
            </div>
          </div>
          
           {/* Senha e Cargo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha Inicial <span className="text-gray-500 text-xs">(Obrigatória para 1º login)</span>
                </label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading || isFetchingRoles} className="input-form" />
              </div>
            <div>
              <label htmlFor="cargoId" className="block text-sm font-medium text-gray-700 mb-1">
                Cargo <span className="text-red-600">*</span>
              </label>
              <select id="cargoId" value={cargoId} onChange={(e) => setCargoId(e.target.value)} required disabled={isLoading || isFetchingRoles || cargos.length === 0} className="input-form bg-white">
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
                <label htmlFor="dataAdmissao" className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Admissão <span className="text-red-600">*</span>
                </label>
                <input type="date" id="dataAdmissao" value={dataAdmissao} onChange={(e) => setDataAdmissao(e.target.value)} required disabled={isLoading || isFetchingRoles} className="input-form" />
              </div>
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input type="tel" id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} disabled={isLoading || isFetchingRoles} className="input-form" placeholder="(XX) XXXXX-XXXX" />
              </div>
                <div>
                  <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                  <input type="date" id="dataNascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} disabled={isLoading || isFetchingRoles} className="input-form" />
                </div>
           </div>
           
            {/* Documentos */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                 <input type="text" id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} disabled={isLoading || isFetchingRoles} className="input-form" placeholder="000.000.000-00"/>
               </div>
               <div>
                 <label htmlFor="rg" className="block text-sm font-medium text-gray-700 mb-1">RG</label>
                 <input type="text" id="rg" value={rg} onChange={(e) => setRg(e.target.value)} disabled={isLoading || isFetchingRoles} className="input-form" />
               </div>
           </div>
           
           {/* Endereço */}
           <div>
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <textarea id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} rows={2} disabled={isLoading || isFetchingRoles} className="input-form" placeholder="Rua, Número, Bairro, Cidade - Estado, CEP"></textarea>
           </div>
           
            {/* Status */}
           <div className="flex items-center">
             <input
               id="ativo" name="ativo" type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} disabled={isLoading || isFetchingRoles} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
             />
             <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
               Funcionário Ativo
             </label>
           </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || isFetchingRoles}
              className={`bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-6 rounded inline-flex items-center gap-2 transition-colors
                          ${(isLoading || isFetchingRoles) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save size={18} /> {isLoading ? 'Salvando...' : 'Salvar Funcionário'}
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