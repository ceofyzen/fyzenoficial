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

// --- Tipos, Mapeamento, Helpers (sem alterações) ---
type RoleOption = { id: string; name: string; departmentId: string };
type ManagerOption = { id: string; name: string | null; };
type DepartmentOption = { id: string; name: string };
type ViaCepResponse = { /* ... */ };
type FuncionarioData = { /* ... */ };
const statusOptions: { [key: string]: string } = { Ativo: 'Ativo', Inativo: 'Inativo', Ferias: 'Férias', Atestado: 'Atestado' };
const formatDateForInput = (date: Date | string | null | undefined): string => { /* ... */ };
// --- Fim ---

export default function EditarFuncionarioPage() {
  const router = useRouter();
  const params = useParams();
  const funcionarioId = params.id as string;
  const { update } = useSession();

  // --- Estados (sem alterações) ---
  const [nomeCompleto, setNomeCompleto] = useState('');
  // ... (todos os outros estados)
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  // --- useEffects (sem alterações na lógica interna) ---
  useEffect(() => { /* ... fetchData ... */ }, [funcionarioId]);
  useEffect(() => {
    // 1. Define a função de busca *dentro* do useEffect
    const fetchAddressFromCep = async (cepValue: string) => {
      const numericCep = cepValue.replace(/\D/g, '');
      if (numericCep.length !== 8) {
        setCepError(null);
        // Não limpa os campos aqui, pois podem ter sido preenchidos manualmente
        return;
      }
      setIsCepLoading(true); setCepError(null);
      
      try {
        const response = await fetch(`https://viacep.com.br/ws/${numericCep}/json/`);
        if (!response.ok) throw new Error('Falha ao buscar CEP.');
        const data: ViaCepResponse = await response.json();
        if (data.erro) throw new Error('CEP não encontrado.');
        
        // Só atualiza se os campos estiverem vazios, para não sobrescrever edição manual
        if (!logradouro) setLogradouro(data.logradouro || '');
        if (!bairro) setBairro(data.bairro || '');
        if (!cidade) setCidade(data.localidade || '');
        if (!estado) setEstado(data.uf || '');
        
        document.getElementById('numero')?.focus();
      } catch (err: any) {
        console.error("Erro ao buscar CEP:", err);
        setCepError(err.message || 'Erro.');
      } finally {
        setIsCepLoading(false);
      }
    };
    // 2. Configura o debounce
    const debounceTimeout = setTimeout(() => {
      fetchAddressFromCep(cep);
    }, 500);
    // 3. Limpa o timeout
    return () => clearTimeout(debounceTimeout);
  }, [cep, logradouro, bairro, cidade, estado]); // Adiciona os campos de endereço como dependência

  // --- Função Upload (sem alterações) ---
  const uploadImage = async (file: File): Promise<string> => { /* ... */ };

  // --- Função handleSubmit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true); setError('');
    if (!cargoId) { setError('Selecione um cargo.'); setIsSaving(false); return; }
    // ... (outras validações) ...

    let imageUrlToSave: string | null = initialImageUrl;
    let isBlobUrl = false;
    // ... (lógica de upload de imagem) ...

    const dadosAtualizados = {
        name: nomeCompleto, email, roleId: cargoId, admissionDate: dataAdmissao,
        // ... (todos os outros campos)
        image: imageUrlToSave,
    };

    try {
      const response = await fetch(`/api/funcionarios/${funcionarioId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosAtualizados), });
      if (!response.ok) { const d = await response.json(); throw new Error(d.error || `Erro ${response.status}`); }
      
      // --- ALERT REMOVIDO ---
      // const funcAtualizado = await response.json();
      // alert(`Funcionário "${funcAtualizado.name}" atualizado!`);
      
      if (typeof update === 'function') { /* ... (lógica de update de sessão) ... */ }
      router.push('/admin/funcionarios'); // Redireciona como feedback
      router.refresh();
    } catch (err: any) { 
        console.error("Erro ao atualizar funcionário:", err); 
        setError(`Erro: ${err.message || 'Erro desconhecido'}.`); 
    }
    finally { setIsSaving(false); setIsUploadingImage(false); }
  };

  // --- Renderização Condicional (Botão Preto) ---
  if (isLoading) { /* ... */ }
  if (notFound) { return ( <div className="pt-14 ..."><h2 className="..."><AlertTriangle .../>Erro</h2><p className="...">...</p><Link href="/admin/funcionarios" className="bg-neutral-900 hover:bg-neutral-700 text-white ..."><ArrowLeft size={18} /> Voltar</Link></div> ); } // COR ALTERADA NO LINK

  // --- Formulário (Cores Alteradas) ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 pt-14">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
             <Users size={32} className="text-neutral-900" /> Editar Colaborador {/* COR ALTERADA */}
         </h1>
         <Link href="/admin/funcionarios" className="inline-flex items-center text-neutral-700 hover:text-neutral-900 transition-colors font-medium"> {/* COR ALTERADA */}
             <ArrowLeft size={18} className="mr-2" /> Voltar
         </Link>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="...">{error}</p>}
          
          {/* ... (Seções do formulário - Foco dos inputs corrigido via globals.css) ... */}

          {/* Botão Salvar (Cor Alterada) */}
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
            <button
              type="submit"
              disabled={isSaving || isFetchingRelatedData || isUploadingImage || isCepLoading}
              className={`bg-neutral-900 hover:bg-neutral-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition-colors duration-200 shadow-md transform hover:scale-105 ${(isSaving || isFetchingRelatedData || isUploadingImage || isCepLoading) ? 'opacity-60 cursor-not-allowed' : ''}`} // COR ALTERADA
            >
                {isSaving || isUploadingImage || isCepLoading ? (<><Loader2 className="animate-spin" size={20} /> Salvando...</>) : (<><Save size={20} /> Salvar Alterações</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}