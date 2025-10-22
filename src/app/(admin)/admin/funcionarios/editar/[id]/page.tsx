// src/app/(admin)/admin/funcionarios/editar/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    Users, Save, ArrowLeft, Loader2, AlertTriangle, User, Mail, Lock,
    Briefcase, CalendarDays, DollarSign, Phone, Hash, MapPin, Building,
    Info, SquareUser, ChevronDown, Camera, XCircle, UserCircle, Search, Globe,
    AlignLeft
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { UserStatus } from '@prisma/client'; // Importar UserStatus

// --- Tipos ---
type RoleOption = { id: string; name: string; departmentId: string };
type ManagerOption = { id: string; name: string | null; };
type DepartmentOption = { id: string; name: string };
type ViaCepResponse = {
    cep: string; logradouro: string; complemento: string; bairro: string;
    localidade: string; uf: string; ibge: string; gia: string; ddd: string; siafi: string; erro?: boolean;
};
type FuncionarioData = {
    id: string; name: string | null; email: string | null;
    status: UserStatus; // Alterado para UserStatus
    admissionDate: Date | string;
    phone: string | null; cpf: string | null; rg: string | null; birthDate: Date | string | null;
    cep: string | null; logradouro: string | null; numero: string | null; complemento: string | null;
    bairro: string | null; cidade: string | null; estado: string | null; pais: string | null;
    salary: number | null;
    image: string | null;
    roleId: string | null;
    role: { id: string; name: string; departmentId: string; } | null;
    managerId: string | null;
};
// --- Fim Tipos ---

// --- Mapeamento ---
const statusOptions: { [key in UserStatus]: string } = {
    Ativo: 'Ativo',
    Inativo: 'Inativo',
    Ferias: 'Férias',
    Atestado: 'Atestado',
};
// --- Fim Mapeamento ---

// --- Helpers ---
const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.warn("Data inválida recebida:", date);
      return '';
    }
    // Formata como YYYY-MM-DD para o input type="date"
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    if (year < 1900 || year > 2100) return ''; // Validação básica do ano
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Erro ao formatar data para input:", date, e);
    return '';
  }
};
// --- Fim Helpers ---

export default function EditarFuncionarioPage() {
  const router = useRouter();
  const params = useParams();
  const funcionarioId = params.id as string;
  const { data: session, update } = useSession(); // Inclui a função update

  // --- Estados do formulário ---
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  // const [password, setPassword] = useState(''); // Senha não deve ser carregada ou alterada aqui diretamente
  const [selectedDepartamentoId, setSelectedDepartamentoId] = useState<string>('');
  const [cargoId, setCargoId] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [status, setStatus] = useState<UserStatus>(UserStatus.Ativo); // Tipo correto
  const [managerId, setManagerId] = useState<string>('');
  const [salary, setSalary] = useState('');
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingRelatedData, setIsFetchingRelatedData] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  // --- useEffect para buscar Dados do Funcionário e Relacionados ---
  useEffect(() => {
    if (!funcionarioId) {
      setError("ID do funcionário não fornecido.");
      setIsLoading(false);
      setNotFound(true);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setIsFetchingRelatedData(true);
      setError('');
      setNotFound(false);
      try {
        // Busca funcionário, departamentos, cargos e todos os funcionários (para gestores) em paralelo
        const [funcResponse, deptsResponse, rolesResponse, allFuncsResponse] = await Promise.all([
          fetch(`/api/funcionarios/${funcionarioId}`),
          fetch('/api/departamentos'),
          fetch('/api/cargos'),
          fetch('/api/funcionarios') // Para popular a lista de gestores potenciais
        ]);

        // Trata Departamentos
        if (!deptsResponse.ok) throw new Error('Falha ao buscar departamentos');
        setDepartamentos(await deptsResponse.json());

        // Trata Cargos
        if (!rolesResponse.ok) throw new Error('Falha ao buscar cargos');
        setCargos(await rolesResponse.json());

        // Trata lista de todos os funcionários (para Gestores)
        if (!allFuncsResponse.ok) throw new Error('Falha ao buscar lista de funcionários');
        const allFuncsData: ManagerOption[] = await allFuncsResponse.json();
        // Filtra para não incluir o próprio funcionário na lista de possíveis gestores
        setPotentialManagers(allFuncsData.filter(f => f.id !== funcionarioId));

        // Trata Funcionário específico
        if (funcResponse.status === 404) {
          setNotFound(true);
          throw new Error('Funcionário não encontrado');
        }
        if (!funcResponse.ok) {
          const errorData = await funcResponse.json();
          throw new Error(errorData.error || `Erro HTTP: ${funcResponse.status}`);
        }
        const funcData: FuncionarioData = await funcResponse.json();

        // Preenche os estados com os dados do funcionário
        setNomeCompleto(funcData.name || '');
        setEmail(funcData.email || '');
        setStatus(funcData.status || UserStatus.Ativo); // Define o status
        setDataAdmissao(formatDateForInput(funcData.admissionDate));
        setTelefone(funcData.phone || '');
        setCpf(funcData.cpf || '');
        setRg(funcData.rg || '');
        setDataNascimento(formatDateForInput(funcData.birthDate));
        setCep(funcData.cep || '');
        setLogradouro(funcData.logradouro || '');
        setNumero(funcData.numero || '');
        setComplemento(funcData.complemento || '');
        setBairro(funcData.bairro || '');
        setCidade(funcData.cidade || '');
        setEstado(funcData.estado || '');
        setPais(funcData.pais || 'Brasil');
        setSalary(funcData.salary?.toString() || '');
        setInitialImageUrl(funcData.image || null);
        setManagerId(funcData.managerId || '');

        // Preenche Departamento e Cargo
        if (funcData.role) {
          setSelectedDepartamentoId(funcData.role.departmentId || '');
          setCargoId(funcData.role.id || '');
        } else {
          setSelectedDepartamentoId('');
          setCargoId('');
        }

      } catch (err: any) {
        console.error("Falha ao buscar dados:", err);
        setError(`Erro ao carregar: ${err.message || 'Erro desconhecido'}`);
        if (err.message === 'Funcionário não encontrado') {
          setNotFound(true);
        }
      } finally {
        setIsLoading(false);
        setIsFetchingRelatedData(false);
      }
    };

    fetchData();
  }, [funcionarioId]);

  // --- useEffect para busca de CEP com Debounce ---
  useEffect(() => {
    // 1. Define a função de busca *dentro* do useEffect
    const fetchAddressFromCep = async (cepValue: string) => {
      const numericCep = cepValue.replace(/\D/g, '');
      if (numericCep.length !== 8) {
        setCepError(null);
        // Não limpa os campos aqui, pois podem ter sido preenchidos manualmente ou vindo do DB
        return;
      }

      setIsCepLoading(true);
      setCepError(null);

      try {
        const response = await fetch(`https://viacep.com.br/ws/${numericCep}/json/`);
        if (!response.ok) throw new Error('Falha ao buscar CEP.');
        const data: ViaCepResponse = await response.json();

        if (data.erro) {
            throw new Error('CEP não encontrado.');
        }

        // Só atualiza se os campos estiverem vazios, para não sobrescrever edição manual
        if (!logradouro) setLogradouro(data.logradouro || '');
        if (!bairro) setBairro(data.bairro || '');
        if (!cidade) setCidade(data.localidade || '');
        if (!estado) setEstado(data.uf || '');

        // Foca no campo "numero" após preencher automaticamente
        document.getElementById('numero')?.focus();

      } catch (err: any) {
        console.error("Erro ao buscar CEP:", err);
        setCepError(err.message || 'Erro.');
        // Não limpa os campos em caso de erro para não apagar dados já existentes
      } finally {
        setIsCepLoading(false);
      }
    };

    // 2. Configura o debounce (atraso)
    const debounceTimeout = setTimeout(() => {
      fetchAddressFromCep(cep); // Chama a função interna
    }, 500); // 500ms de atraso após o usuário parar de digitar

    // 3. Limpa o timeout se o usuário digitar novamente (componentWillUnmount)
    return () => clearTimeout(debounceTimeout);

  // Adiciona os campos de endereço como dependência para evitar sobrescrever se o usuário já editou
  }, [cep, logradouro, bairro, cidade, estado]);


  // --- Função Upload (Simulação) ---
  const uploadImage = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    // Simulação - substitua pela lógica real de upload (ex: para S3, Cloudinary)
    return new Promise((resolve, reject) => {
      try {
        // Simula um tempo de upload
        setTimeout(() => {
          // Cria uma URL temporária para o preview local (NÃO PERSISTE)
          // Na aplicação real, você receberia a URL final do serviço de storage
          const mockUrl = URL.createObjectURL(file);
          console.log("Simulando upload, URL temporária:", mockUrl);
          setIsUploadingImage(false);
          resolve(mockUrl); // Retorna a URL mockada
          // Idealmente:
          // const uploadedUrl = await uploadToCloudStorage(file);
          // resolve(uploadedUrl);
        }, 1500);
      } catch (error) {
        console.error("Erro na simulação de upload:", error);
        setIsUploadingImage(false);
        reject(new Error("Falha no upload simulado"));
      }
    });
  };

  // --- Função handleSubmit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    if (!cargoId) {
      setError('Selecione um cargo.');
      setIsSaving(false);
      return;
    }
    if (salary && isNaN(parseFloat(salary))) {
      setError('Salário inválido.');
      setIsSaving(false);
      return;
    }
    if (!status) { // Verifica se status é válido (não deve ser vazio)
        setError('Selecione um status.');
        setIsSaving(false);
        return;
    }
    // Verifica se o usuário está tentando se auto-inativar
    if (session?.user?.id === funcionarioId && status === UserStatus.Inativo) {
        setError('Você não pode inativar sua própria conta.');
        setIsSaving(false);
        return;
    }
    // Verifica se o usuário está tentando se definir como próprio gestor
    if (managerId === funcionarioId) {
        setError('Um funcionário não pode ser seu próprio gestor.');
        setIsSaving(false);
        return;
    }


    let imageUrlToSave: string | null = initialImageUrl; // Assume a imagem inicial por padrão
    let isBlobUrl = false; // Flag para saber se a URL é temporária (blob)

    if (newImageFile) { // Se um NOVO arquivo foi selecionado
      try {
        imageUrlToSave = await uploadImage(newImageFile);
        isBlobUrl = imageUrlToSave.startsWith('blob:'); // Verifica se é uma URL blob
         // --- ALERTA DE DESENVOLVIMENTO ---
         if (isBlobUrl) {
            console.warn("ATENÇÃO: A imagem foi 'upada' como URL blob local. Implemente o upload real para persistência!");
            // Numa aplicação real, você teria a URL final aqui, não uma blob URL.
            // imageUrlToSave = "url_real_do_servidor_de_imagens";
         }
         // --- FIM ALERTA ---
      } catch (uploadError: any) {
        setError(`Erro no upload da imagem: ${uploadError.message}`);
        setIsSaving(false);
        return;
      }
    } else if (initialImageUrl && !newImageFile && !document.getElementById(`image-preview-${funcionarioId}`)?.getAttribute('src')) {
        // Se a imagem inicial existia, não há novo arquivo E a preview foi removida (pelo botão X)
        imageUrlToSave = null;
    }
    // Se initialImageUrl era null e newImageFile é null, imageUrlToSave continua null.


    const dadosAtualizados = {
      name: nomeCompleto,
      email,
      roleId: cargoId,
      admissionDate: dataAdmissao,
      phone: telefone || null,
      cpf: cpf || null,
      rg: rg || null,
      birthDate: dataNascimento || null,
      cep: cep || null,
      logradouro: logradouro || null,
      numero: numero || null,
      complemento: complemento || null,
      bairro: bairro || null,
      cidade: cidade || null,
      estado: estado || null,
      pais: pais || 'Brasil',
      status: status, // Status já está no tipo correto
      managerId: managerId || null,
      salary: salary ? parseFloat(salary) : null,
      // Salva a URL da imagem (se for blob, SÓ VAI FUNCIONAR LOCALMENTE NO NAVEGADOR ATUAL)
      image: imageUrlToSave,
    };

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

      const funcAtualizado = await response.json();

      // Forçar atualização da sessão se o usuário editado for o logado
      if (session?.user?.id === funcionarioId && typeof update === 'function') {
         console.log("Atualizando sessão do usuário logado...");
         await update({
            user: {
               name: funcAtualizado.name,
               image: funcAtualizado.image // Atualiza a imagem na sessão também
               // Adicionar outros campos que você queira refletir imediatamente se necessário
            }
         });
         console.log("Sessão atualizada.");
      }


      router.push('/admin/funcionarios'); // Redireciona para a lista após sucesso
      router.refresh(); // Garante que a lista seja atualizada

    } catch (err: any) {
      console.error("Erro ao atualizar funcionário:", err);
      setError(`Erro ao salvar: ${err.message || 'Erro desconhecido'}.`);
      // Se deu erro no PUT, e usamos uma blob URL, revoga ela para liberar memória
      if (isBlobUrl && imageUrlToSave) {
          URL.revokeObjectURL(imageUrlToSave);
      }
    } finally {
      setIsSaving(false);
      setIsUploadingImage(false); // Garante que o estado de upload reset
    }
  };

  // --- Renderização Condicional ---
  if (isLoading) {
    // Pode manter ou adicionar um skeleton/loading state aqui se preferir
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)] text-gray-600">
        <Loader2 className="animate-spin mr-2" size={24} /> Carregando dados do funcionário...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="pt-14 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center px-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro - Funcionário Não Encontrado</h2>
        <p className="text-gray-600 mb-6">O funcionário que você está tentando editar não foi encontrado.</p>
        <Link href="/admin/funcionarios" className="bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-6 rounded-lg inline-flex items-center gap-2 transition-colors shadow-sm">
          <ArrowLeft size={18} /> Voltar para Funcionários
        </Link>
      </div>
    );
  }

  // --- Formulário ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 pt-14">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
             <Users size={32} className="text-neutral-900" /> Editar Colaborador
         </h1>
         <Link href="/admin/funcionarios" className="inline-flex items-center text-neutral-700 hover:text-neutral-900 transition-colors font-medium">
             <ArrowLeft size={18} className="mr-2" /> Voltar
         </Link>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-lg border border-red-200 mb-6">{error}</p>}

          {/* Seção Avatar e Dados Pessoais */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start border-b pb-6 mb-6">
             <div className="flex-shrink-0 w-full md:w-auto text-center">
                 <ImageUpload
                    initialImageUrl={initialImageUrl}
                    onImageChange={setNewImageFile}
                    disabled={isSaving || isUploadingImage}
                    isLoading={isUploadingImage}
                    // Adiciona um ID único à imagem para referência, se necessário
                    // (Exemplo: para verificar se foi removida no submit)
                    // Poderia passar o ID do funcionário aqui
                    // previewId={`image-preview-${funcionarioId}`}
                 />
            </div>
            <div className="flex-grow w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label htmlFor="nomeCompleto" className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo <span className="text-red-600">*</span></label><div className="relative"><User size={18} className="icon-input"/><input type="text" id="nomeCompleto" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} required disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" /></div></div>
                <div><label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-600">*</span></label><div className="relative"><Mail size={18} className="icon-input"/><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSaving || isUploadingImage} className="input-with-icon pl-10"/></div></div>
              </div>
              {/* Senha: REMOVIDO DA EDIÇÃO. Idealmente, ter uma tela separada para reset de senha. */}
              {/* <div><label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Nova Senha <span className="text-gray-500 text-xs">(opcional)</span></label><div className="relative"><Lock size={18} className="icon-input"/><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" /></div></div> */}
            </div>
          </div>

          {/* Seção Informações de Emprego */}
          <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Informações de Emprego</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
             <div className="lg:col-span-1"><label htmlFor="departamento" className="block text-sm font-semibold text-gray-700 mb-1">Departamento <span className="text-red-600">*</span></label><div className="relative"><Building size={18} className="icon-input"/><select id="departamento" value={selectedDepartamentoId} onChange={(e) => { setSelectedDepartamentoId(e.target.value); setCargoId(''); }} required disabled={isSaving || isUploadingImage || isFetchingRelatedData || departamentos.length === 0} className="input-with-icon appearance-none bg-white pl-10"><option value="" disabled>Selecione</option>{departamentos.map((dept) => ( <option key={dept.id} value={dept.id}>{dept.name}</option> ))}</select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div></div>
             <div className="lg:col-span-1"><label htmlFor="cargoId" className="block text-sm font-semibold text-gray-700 mb-1">Cargo <span className="text-red-600">*</span></label><div className="relative"><Briefcase size={18} className="icon-input"/><select id="cargoId" value={cargoId} onChange={(e) => setCargoId(e.target.value)} required disabled={!selectedDepartamentoId || isSaving || isUploadingImage || isFetchingRelatedData || cargos.length === 0} className="input-with-icon appearance-none bg-white pl-10 disabled:bg-gray-100 disabled:cursor-not-allowed"><option value="" disabled>Selecione</option>{cargos.filter(c => c.departmentId === selectedDepartamentoId).map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}</select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div></div>
             <div className="lg:col-span-1"><label htmlFor="dataAdmissao" className="block text-sm font-semibold text-gray-700 mb-1">Data de Admissão <span className="text-red-600">*</span></label><div className="relative"><CalendarDays size={18} className="icon-input"/><input type="date" id="dataAdmissao" value={dataAdmissao} onChange={(e) => setDataAdmissao(e.target.value)} required disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" /></div></div>
             <div className="lg:col-span-1"><label htmlFor="salary" className="block text-sm font-semibold text-gray-700 mb-1">Salário (R$)</label><div className="relative"><span className="absolute inset-y-0 left-3 flex items-center text-gray-500 text-sm pointer-events-none">R$</span><input type="number" id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} step="0.01" min="0" disabled={isSaving || isUploadingImage} className="input-with-icon pl-9" placeholder="0.00"/></div></div>
             <div className="lg:col-span-1"><label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-1">Status <span className="text-red-600">*</span></label><div className="relative"><Info size={18} className="icon-input"/><select id="status" value={status} onChange={(e) => setStatus(e.target.value as UserStatus)} required disabled={isSaving || isUploadingImage} className="input-with-icon appearance-none bg-white pl-10">{Object.entries(statusOptions).map(([key, text]) => ( <option key={key} value={key}>{text}</option> ))}</select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div></div>
             <div className="lg:col-span-1"><label htmlFor="managerId" className="block text-sm font-semibold text-gray-700 mb-1">Gestor</label><div className="relative"><SquareUser size={18} className="icon-input"/><select id="managerId" value={managerId} onChange={(e) => setManagerId(e.target.value)} disabled={isSaving || isUploadingImage || isFetchingRelatedData} className="input-with-icon appearance-none bg-white pl-10"><option value="">Nenhum</option>{potentialManagers.map((manager) => (<option key={manager.id} value={manager.id}>{manager.name || 'Nome não definido'}</option>))}</select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div></div>
          </div>

          {/* Seção Contato e Pessoal */}
          <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 pt-4">Contato e Pessoal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="telefone" className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label><div className="relative"><Phone size={18} className="icon-input"/><input type="tel" id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" placeholder="(XX) XXXXX-XXXX"/></div></div>
            <div><label htmlFor="dataNascimento" className="block text-sm font-semibold text-gray-700 mb-1">Data de Nascimento</label><div className="relative"><CalendarDays size={18} className="icon-input"/><input type="date" id="dataNascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" /></div></div>
            <div><label htmlFor="cpf" className="block text-sm font-semibold text-gray-700 mb-1">CPF</label><div className="relative"><Hash size={18} className="icon-input"/><input type="text" id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" placeholder="000.000.000-00"/></div></div>
            <div><label htmlFor="rg" className="block text-sm font-semibold text-gray-700 mb-1">RG</label><div className="relative"><Hash size={18} className="icon-input"/><input type="text" id="rg" value={rg} onChange={(e) => setRg(e.target.value)} disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" /></div></div>
          </div>

          {/* SEÇÃO DE ENDEREÇO */}
          <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 pt-4">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-4">
               <div className="md:col-span-2">
                  <label htmlFor="cep" className="block text-sm font-semibold text-gray-700 mb-1">CEP</label>
                  <div className="relative">
                      <Search size={18} className="icon-input"/>
                      <input type="text" id="cep" value={cep} onChange={(e) => setCep(e.target.value)} maxLength={9} placeholder="00000-000" disabled={isSaving || isUploadingImage} className={`input-with-icon pl-10 ${cepError ? 'border-red-500' : ''}`} />
                      {isCepLoading && <Loader2 className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>}
                  </div>
                  {cepError && <p className="text-xs text-red-600 mt-1">{cepError}</p>}
               </div>
                <div className="md:col-span-4">
                     <label htmlFor="logradouro" className="block text-sm font-semibold text-gray-700 mb-1">Logradouro</label>
                     <div className="relative"><MapPin size={18} className="icon-input"/><input type="text" id="logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} disabled={isSaving || isUploadingImage || isCepLoading} className="input-with-icon pl-10 disabled:bg-gray-100" /></div>
                 </div>
                <div className="md:col-span-2">
                     <label htmlFor="numero" className="block text-sm font-semibold text-gray-700 mb-1">Número</label>
                     <div className="relative"><Hash size={18} className="icon-input"/><input type="text" id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" /></div>
                 </div>
                <div className="md:col-span-4">
                     <label htmlFor="complemento" className="block text-sm font-semibold text-gray-700 mb-1">Complemento</label>
                     <div className="relative"><AlignLeft size={18} className="icon-input"/><input type="text" id="complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" placeholder="Apto, Bloco, Casa..." /></div>
                 </div>
                <div className="md:col-span-3">
                     <label htmlFor="bairro" className="block text-sm font-semibold text-gray-700 mb-1">Bairro</label>
                     <div className="relative"><MapPin size={18} className="icon-input"/><input type="text" id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} disabled={isSaving || isUploadingImage || isCepLoading} className="input-with-icon pl-10 disabled:bg-gray-100" /></div>
                 </div>
                <div className="md:col-span-3">
                     <label htmlFor="cidade" className="block text-sm font-semibold text-gray-700 mb-1">Cidade</label>
                     <div className="relative"><MapPin size={18} className="icon-input"/><input type="text" id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={isSaving || isUploadingImage || isCepLoading} className="input-with-icon pl-10 disabled:bg-gray-100" /></div>
                 </div>
                <div className="md:col-span-2">
                     <label htmlFor="estado" className="block text-sm font-semibold text-gray-700 mb-1">Estado (UF)</label>
                     <div className="relative"><MapPin size={18} className="icon-input"/><input type="text" id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} maxLength={2} disabled={isSaving || isUploadingImage || isCepLoading} className="input-with-icon pl-10 disabled:bg-gray-100" /></div>
                 </div>
                <div className="md:col-span-4">
                     <label htmlFor="pais" className="block text-sm font-semibold text-gray-700 mb-1">País</label>
                     <div className="relative"><Globe size={18} className="icon-input"/><input type="text" id="pais" value={pais} onChange={(e) => setPais(e.target.value)} disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" /></div>
                 </div>
           </div>
          {/* FIM SEÇÃO ENDEREÇO */}

          {/* Botão Salvar */}
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
            <button
              type="submit"
              disabled={isSaving || isFetchingRelatedData || isUploadingImage || isCepLoading}
              className={`bg-neutral-900 hover:bg-neutral-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition-colors duration-200 shadow-md transform hover:scale-105 ${(isSaving || isFetchingRelatedData || isUploadingImage || isCepLoading) ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                {isSaving || isUploadingImage || isCepLoading ? (<><Loader2 className="animate-spin" size={20} /> Salvando...</>) : (<><Save size={20} /> Salvar Alterações</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}