// src/app/(admin)/admin/perfil/editar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    User, Save, ArrowLeft, Loader2, AlertTriangle, Mail, Phone, Camera,
    Hash, MapPin, Globe, AlignLeft, CalendarDays, Search // <-- Ícones adicionados
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload'; // Reutilizar o componente

// --- Tipos --- (Adicionados tipos necessários)
type ViaCepResponse = {
    cep: string; logradouro: string; complemento: string; bairro: string;
    localidade: string; uf: string; ibge: string; gia: string; ddd: string; siafi: string; erro?: boolean;
};
// --- Fim Tipos ---

// --- Helper (igual ao de editar funcionário) ---
const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    if (year < 1900 || year > 2100) return '';
    return `${year}-${month}-${day}`;
  } catch (e) { return ''; }
};
// --- Fim Helper ---


export default function EditarPerfilPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    // Estados do formulário (ADICIONADOS NOVOS ESTADOS)
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [cpf, setCpf] = useState('');             // <-- Adicionado
    const [rg, setRg] = useState('');               // <-- Adicionado
    const [dataNascimento, setDataNascimento] = useState(''); // <-- Adicionado
    const [cep, setCep] = useState('');             // <-- Adicionado
    const [logradouro, setLogradouro] = useState(''); // <-- Adicionado
    const [numero, setNumero] = useState('');       // <-- Adicionado
    const [complemento, setComplemento] = useState(''); // <-- Adicionado
    const [bairro, setBairro] = useState('');       // <-- Adicionado
    const [cidade, setCidade] = useState('');       // <-- Adicionado
    const [estado, setEstado] = useState('');       // <-- Adicionado
    const [pais, setPais] = useState('Brasil');     // <-- Adicionado
    const [isCepLoading, setIsCepLoading] = useState(false); // <-- Adicionado
    const [cepError, setCepError] = useState<string | null>(null); // <-- Adicionado

    // Estados de controle
    const [isLoading, setIsLoading] = useState(true); // Para carregar dados iniciais
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Efeito para carregar dados iniciais do perfil (ATUALIZADO PARA USAR A API)
    useEffect(() => {
        const fetchProfileData = async () => {
            if (status === 'authenticated') {
                setIsLoading(true);
                setError('');
                try {
                    const response = await fetch('/api/perfil'); // Chama a API GET
                    if (!response.ok) {
                        throw new Error('Falha ao buscar dados do perfil.');
                    }
                    const data = await response.json();
                    setNome(data.name || '');
                    setEmail(data.email || '');
                    setInitialImageUrl(data.image || null);
                    setTelefone(data.phone || '');
                    setCpf(data.cpf || '');             // <-- Carrega CPF
                    setRg(data.rg || '');               // <-- Carrega RG
                    setDataNascimento(formatDateForInput(data.birthDate)); // <-- Carrega Data Nascimento
                    setCep(data.cep || '');             // <-- Carrega CEP
                    setLogradouro(data.logradouro || ''); // <-- Carrega Logradouro
                    setNumero(data.numero || '');       // <-- Carrega Numero
                    setComplemento(data.complemento || ''); // <-- Carrega Complemento
                    setBairro(data.bairro || '');       // <-- Carrega Bairro
                    setCidade(data.cidade || '');       // <-- Carrega Cidade
                    setEstado(data.estado || '');       // <-- Carrega Estado
                    setPais(data.pais || 'Brasil');     // <-- Carrega Pais
                } catch (err: any) {
                    setError(`Erro ao carregar perfil: ${err.message}`);
                    console.error("Erro fetch perfil:", err);
                } finally {
                    setIsLoading(false);
                }
            } else if (status === 'unauthenticated') {
                router.push('/login');
            }
        };
        fetchProfileData();
    }, [status, router]);

    // --- useEffect para busca de CEP com Debounce (ADICIONADO) ---
    useEffect(() => {
        const fetchAddressFromCep = async (cepValue: string) => {
            const numericCep = cepValue.replace(/\D/g, '');
            if (numericCep.length !== 8) {
                setCepError(null); return;
            }
            setIsCepLoading(true); setCepError(null);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${numericCep}/json/`);
                if (!response.ok) throw new Error('Falha ao buscar CEP.');
                const data: ViaCepResponse = await response.json();
                if (data.erro) { throw new Error('CEP não encontrado.'); }
                if (!logradouro) setLogradouro(data.logradouro || '');
                if (!bairro) setBairro(data.bairro || '');
                if (!cidade) setCidade(data.localidade || '');
                if (!estado) setEstado(data.uf || '');
                document.getElementById('numero')?.focus();
            } catch (err: any) { setCepError(err.message || 'Erro.');
            } finally { setIsCepLoading(false); }
        };
        const debounceTimeout = setTimeout(() => { fetchAddressFromCep(cep); }, 500);
        return () => clearTimeout(debounceTimeout);
    }, [cep, logradouro, bairro, cidade, estado]);
    // --- Fim useEffect CEP ---


    // --- Função Upload REAL (sem alterações) ---
    const uploadImage = async (file: File): Promise<string> => {
        // ... (código da função uploadImage continua igual)
        setIsUploadingImage(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP ${response.status}`);
            }
            const result = await response.json();
            if (result.success && result.url) {
                return result.url;
            } else {
                throw new Error(result.error || 'API não retornou URL.');
            }
        } catch (uploadError: any) {
            setError(`Falha no upload: ${uploadError.message}`);
            throw uploadError;
        } finally {
            setIsUploadingImage(false);
        }
    };

    // Função para salvar as alterações (ATUALIZADA com novos campos)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccessMessage(null);

        let imageUrlToSave: string | null = initialImageUrl;

        if (newImageFile) {
            try {
                imageUrlToSave = await uploadImage(newImageFile);
            } catch (uploadError) {
                setIsSaving(false);
                return;
            }
        } else if (initialImageUrl === null) {
             imageUrlToSave = null;
        }

        try {
            const response = await fetch('/api/perfil', { // Chama a API PUT
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ // **** ENVIA NOVOS CAMPOS ****
                    name: nome,
                    email: email,
                    phone: telefone || null,
                    image: imageUrlToSave,
                    cpf: cpf || null,       // <-- Envia CPF
                    rg: rg || null,         // <-- Envia RG
                    birthDate: dataNascimento || null, // <-- Envia Data Nascimento
                    cep: cep || null,       // <-- Envia CEP
                    logradouro: logradouro || null, // <-- Envia Logradouro
                    numero: numero || null, // <-- Envia Numero
                    complemento: complemento || null, // <-- Envia Complemento
                    bairro: bairro || null, // <-- Envia Bairro
                    cidade: cidade || null, // <-- Envia Cidade
                    estado: estado || null, // <-- Envia Estado
                    pais: pais || 'Brasil', // <-- Envia Pais
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP ${response.status}`);
            }

            const updatedUser = await response.json();

            // Atualiza a sessão localmente (apenas campos relevantes da sessão)
            await update({
                 user: {
                    name: updatedUser.name,
                    email: updatedUser.email,
                    image: updatedUser.image,
                 }
            });

            setSuccessMessage('Perfil atualizado com sucesso!');

        } catch (err: any) {
            console.error("Erro ao atualizar perfil:", err);
            setError(`Erro ao salvar: ${err.message || 'Erro desconhecido'}.`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Renderização Loading --- (sem alteração)
    if (isLoading || status === 'loading') { /* ... */ }

    // --- Renderização Formulário (ATUALIZADO com novos campos) ---
    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 pt-14">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <User size={32} className="text-neutral-900" /> Editar Perfil
                </h1>
                <Link href="/admin" className="inline-flex items-center text-neutral-700 hover:text-neutral-900 transition-colors font-medium">
                    <ArrowLeft size={18} className="mr-2" /> Voltar ao Dashboard
                </Link>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto"> {/* Aumentado max-w */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-lg border border-red-200 mb-6">{error}</p>}
                    {successMessage && <p className="text-center text-green-600 bg-green-100 p-3 rounded-lg border border-green-200 mb-6">{successMessage}</p>}

                    {/* --- Seção Avatar e Dados Básicos --- */}
                     <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start border-b pb-6 mb-6">
                        <div className="flex-shrink-0 w-full md:w-auto text-center">
                            <ImageUpload
                                initialImageUrl={initialImageUrl}
                                onImageChange={setNewImageFile}
                                onImageUrlChange={setInitialImageUrl}
                                disabled={isSaving || isUploadingImage}
                                isLoading={isUploadingImage}
                            />
                        </div>
                        <div className="flex-grow w-full space-y-4">
                             <div><label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-1">Nome <span className="text-red-600">*</span></label><div className="relative"><User size={18} className="icon-input"/><input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={isSaving || isUploadingImage} className="input-with-icon pl-10"/></div></div>
                             <div><label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-600">*</span></label><div className="relative"><Mail size={18} className="icon-input"/><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSaving || isUploadingImage} className="input-with-icon pl-10"/></div><p className="mt-1 text-xs text-gray-500">Alterar o email pode exigir verificação.</p></div>
                             <div><label htmlFor="telefone" className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label><div className="relative"><Phone size={18} className="icon-input"/><input type="tel" id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" placeholder="(XX) XXXXX-XXXX"/></div></div>
                        </div>
                    </div>
                    {/* --- Fim Seção Avatar --- */}

                    {/* --- Seção Dados Pessoais --- */}
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 pt-4">Dados Pessoais</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label htmlFor="dataNascimento" className="block text-sm font-semibold text-gray-700 mb-1">Data de Nascimento</label><div className="relative"><CalendarDays size={18} className="icon-input"/><input type="date" id="dataNascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" /></div></div>
                        <div><label htmlFor="cpf" className="block text-sm font-semibold text-gray-700 mb-1">CPF</label><div className="relative"><Hash size={18} className="icon-input"/><input type="text" id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" placeholder="000.000.000-00"/></div></div>
                        <div><label htmlFor="rg" className="block text-sm font-semibold text-gray-700 mb-1">RG</label><div className="relative"><Hash size={18} className="icon-input"/><input type="text" id="rg" value={rg} onChange={(e) => setRg(e.target.value)} disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" /></div></div>
                    </div>
                    {/* --- Fim Dados Pessoais --- */}

                    {/* --- SEÇÃO DE ENDEREÇO --- */}
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 pt-4">Endereço</h2>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-4">
                        <div className="md:col-span-2">
                            <label htmlFor="cep" className="block text-sm font-semibold text-gray-700 mb-1">CEP</label>
                            <div className="relative"><Search size={18} className="icon-input"/><input type="text" id="cep" value={cep} onChange={(e) => setCep(e.target.value)} maxLength={9} placeholder="00000-000" disabled={isSaving || isUploadingImage} className={`input-with-icon pl-10 ${cepError ? 'border-red-500' : ''}`} />{isCepLoading && <Loader2 className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>}</div>{cepError && <p className="text-xs text-red-600 mt-1">{cepError}</p>}
                        </div>
                        <div className="md:col-span-4"><label htmlFor="logradouro" className="block text-sm font-semibold text-gray-700 mb-1">Logradouro</label><div className="relative"><MapPin size={18} className="icon-input"/><input type="text" id="logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} disabled={isSaving || isUploadingImage || isCepLoading} className="input-with-icon pl-10 disabled:bg-gray-100" /></div></div>
                        <div className="md:col-span-2"><label htmlFor="numero" className="block text-sm font-semibold text-gray-700 mb-1">Número</label><div className="relative"><Hash size={18} className="icon-input"/><input type="text" id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" /></div></div>
                        <div className="md:col-span-4"><label htmlFor="complemento" className="block text-sm font-semibold text-gray-700 mb-1">Complemento</label><div className="relative"><AlignLeft size={18} className="icon-input"/><input type="text" id="complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" placeholder="Apto, Bloco..." /></div></div>
                        <div className="md:col-span-3"><label htmlFor="bairro" className="block text-sm font-semibold text-gray-700 mb-1">Bairro</label><div className="relative"><MapPin size={18} className="icon-input"/><input type="text" id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} disabled={isSaving || isUploadingImage || isCepLoading} className="input-with-icon pl-10 disabled:bg-gray-100" /></div></div>
                        <div className="md:col-span-3"><label htmlFor="cidade" className="block text-sm font-semibold text-gray-700 mb-1">Cidade</label><div className="relative"><MapPin size={18} className="icon-input"/><input type="text" id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={isSaving || isUploadingImage || isCepLoading} className="input-with-icon pl-10 disabled:bg-gray-100" /></div></div>
                        <div className="md:col-span-2"><label htmlFor="estado" className="block text-sm font-semibold text-gray-700 mb-1">Estado (UF)</label><div className="relative"><MapPin size={18} className="icon-input"/><input type="text" id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} maxLength={2} disabled={isSaving || isUploadingImage || isCepLoading} className="input-with-icon pl-10 disabled:bg-gray-100" /></div></div>
                        <div className="md:col-span-4"><label htmlFor="pais" className="block text-sm font-semibold text-gray-700 mb-1">País</label><div className="relative"><Globe size={18} className="icon-input"/><input type="text" id="pais" value={pais} onChange={(e) => setPais(e.target.value)} disabled={isSaving || isUploadingImage} className="input-with-icon pl-10" /></div></div>
                    </div>
                    {/* --- FIM SEÇÃO ENDEREÇO --- */}

                    {/* Botão Salvar */}
                    <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
                        <button
                            type="submit"
                            disabled={isSaving || isUploadingImage || isCepLoading} // Adicionado isCepLoading
                            className={`bg-neutral-900 hover:bg-neutral-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition-colors duration-200 shadow-md transform hover:scale-105 ${(isSaving || isUploadingImage || isCepLoading) ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {isSaving || isUploadingImage || isCepLoading ? (<><Loader2 className="animate-spin" size={20} /> Salvando...</>) : (<><Save size={20} /> Salvar Alterações</>)}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}