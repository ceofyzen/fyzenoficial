// src/app/(admin)/admin/funcionarios/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import {
    Users, PlusCircle, Edit, Trash2, Loader2, AlertTriangle,
    BadgeCheck, BadgeX, UserCircle, Search, Filter, ArrowUpDown,
    Building, Mail, Phone, CalendarDays, MapPin, Hash,
    // Briefcase removido
    ChevronDown,
    BedDouble, // Ícone para Férias
    ClipboardPlus, // Ícone para Atestado
    HelpCircle, // Ícone para status desconhecido
    Info // Ícone para Status
} from 'lucide-react';
// REMOVIDO: import { UserStatus } from '@prisma/client';

// --- Tipos Atualizados (usando string para status) ---
type DepartmentOption = { id: string; name: string; };
type RoleOption = { id: string; name: string; departmentId: string; };
type FuncionarioListData = {
  id: string; name: string | null; email: string | null; image?: string | null;
  status: string; // ALTERADO PARA STRING
  admissionDate: Date | string; phone: string | null;
  cpf?: string | null; rg?: string | null; birthDate?: Date | string | null;
  // Campos de endereço (baseado no schema anterior)
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  pais?: string | null;
  // Fim endereço
  salary?: number | null;
  role: { id: string; name: string; department?: { id: string; name: string; } | null; } | null;
  manager?: { id: string; name: string | null; } | null;
};
// --- Fim Tipos ---

// --- Função de Formatar Data ---
const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '-';
    try { const d = new Date(date); if (isNaN(d.getTime())) { return '-'; } const day = String(d.getUTCDate()).padStart(2, '0'); const month = String(d.getUTCMonth() + 1).padStart(2, '0'); const year = d.getUTCFullYear(); if (year < 1900 || year > 2100) return '-'; return `${day}/${month}/${year}`; } catch (e) { console.error("Erro ao formatar data:", date, e); return '-'; }
};

// --- Mapeamento de Status para Badges (usando strings como chaves) ---
const statusConfig: { [key: string]: { text: string; icon: React.ElementType; badgeClass: string; dotClass: string } } = {
    Ativo: { text: 'Ativo', icon: BadgeCheck, badgeClass: 'bg-green-100 text-green-800', dotClass: 'bg-green-400' },
    Inativo: { text: 'Inativo', icon: BadgeX, badgeClass: 'bg-red-100 text-red-800', dotClass: 'bg-red-400' },
    Ferias: { text: 'Férias', icon: BedDouble, badgeClass: 'bg-blue-100 text-blue-800', dotClass: 'bg-blue-400' },
    Atestado: { text: 'Atestado', icon: ClipboardPlus, badgeClass: 'bg-yellow-100 text-yellow-800', dotClass: 'bg-yellow-400' },
    default: { text: '?', icon: HelpCircle, badgeClass: 'bg-gray-100 text-gray-800', dotClass: 'bg-gray-400'}
};


export default function FuncionariosPage() {
  const router = useRouter();

  // --- Estados ---
  const [funcionarios, setFuncionarios] = useState<FuncionarioListData[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartmentOption[]>([]);
  const [cargos, setCargos] = useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'admissionDateDesc' | 'admissionDateAsc' | 'nameAsc'>('nameAsc');
  const [selectedFuncionario, setSelectedFuncionario] = useState<FuncionarioListData | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');


  // --- useEffects para buscar dados ---
  useEffect(() => {
    const fetchFuncionarios = async () => { setIsLoading(true); setError(null); let response: Response | null = null; try { response = await fetch('/api/funcionarios'); if (!response.ok) { let errorBody = await response.text(); let errorMessage = `Falha (${response.status})`; try { errorMessage = JSON.parse(errorBody).error || errorMessage; } catch (parseError) { errorMessage = errorBody.substring(0, 100) || errorMessage; } throw new Error(errorMessage); } const data: FuncionarioListData[] = await response.json(); setFuncionarios(data); } catch (err: any) { console.error("Erro buscar funcionários:", err); setError(String(err.message || 'Erro desconhecido')); } finally { setIsLoading(false); console.log("Fetch func finalizado:", response?.status); } };
    fetchFuncionarios();
   }, []);

  useEffect(() => {
    const fetchFilterData = async () => { setIsLoadingFilters(true); try { const [deptsResponse, rolesResponse] = await Promise.all([ fetch('/api/departamentos'), fetch('/api/cargos') ]); if (deptsResponse.ok) setDepartamentos(await deptsResponse.json()); else console.warn("Falha carregar depts."); if (rolesResponse.ok) setCargos(await rolesResponse.json()); else console.warn("Falha carregar cargos."); } catch (err: any) { console.error("Erro carregar filtros:", err); } finally { setIsLoadingFilters(false); } };
    fetchFilterData();
   }, []);

  // --- Lógica Filtro/Sort ---
  const filteredAndSortedFuncionarios = useMemo(() => {
      if (isLoading || !Array.isArray(funcionarios)) return [];
      let result = [...funcionarios];
      if (selectedDepartment !== 'all') { result = result.filter(f => f.role?.department?.id === selectedDepartment); }
      if (selectedRole !== 'all') { result = result.filter(f => f.role?.id === selectedRole); }
      if (selectedStatus !== 'all') { result = result.filter(f => f.status === selectedStatus); }
      if (searchTerm.trim()) { const lowerSearchTerm = searchTerm.toLowerCase(); result = result.filter(f => f.name?.toLowerCase().includes(lowerSearchTerm) || f.email?.toLowerCase().includes(lowerSearchTerm)); }
      result.sort((a, b) => {
        switch (sortBy) {
          case 'admissionDateAsc': const dateA = a.admissionDate ? new Date(a.admissionDate).getTime() : 0; const dateB = b.admissionDate ? new Date(b.admissionDate).getTime() : 0; return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
          case 'admissionDateDesc': const dateADesc = a.admissionDate ? new Date(a.admissionDate).getTime() : 0; const dateBDesc = b.admissionDate ? new Date(b.admissionDate).getTime() : 0; return (isNaN(dateBDesc) ? 0 : dateBDesc) - (isNaN(dateADesc) ? 0 : dateADesc);
          case 'nameAsc': default: return (a.name || '').localeCompare(b.name || '');
        }
      });
      return result;
  }, [funcionarios, selectedDepartment, selectedRole, searchTerm, sortBy, isLoading, selectedStatus]);


  // --- useEffect para selecionar o primeiro ---
  useEffect(() => {
    if (!isLoading) {
        if (filteredAndSortedFuncionarios.length > 0) {
            const isSelectedStillValid = filteredAndSortedFuncionarios.some(f => f.id === selectedFuncionario?.id);
            if (!isSelectedStillValid || !selectedFuncionario) { setSelectedFuncionario(filteredAndSortedFuncionarios[0]); }
        } else { setSelectedFuncionario(null); }
    }
  }, [filteredAndSortedFuncionarios, isLoading]); // Dependências corrigidas

  // --- Handlers ---
  const handleEdit = (id: string | undefined) => { if(id) router.push(`/admin/funcionarios/editar/${id}`); };

  const handleDelete = async (id: string | undefined, name: string | null) => {
      if (!id || !confirm(`Tem certeza que deseja definir o status de "${name || 'este colaborador'}" como INATIVO?`)) { return; }
      const originalFuncionarios = [...funcionarios]; const originalSelected = selectedFuncionario ? {...selectedFuncionario} : null;
      setFuncionarios(currentFuncionarios => currentFuncionarios.map(f => (f.id === id ? { ...f, status: 'Inativo' } : f)));
      if (selectedFuncionario?.id === id) { setSelectedFuncionario(prev => (prev ? { ...prev, status: 'Inativo' } : null)); }
      try {
          const response = await fetch(`/api/funcionarios/${id}`, { method: 'DELETE' });
          if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || `Erro HTTP: ${response.status}`); }
          alert('Colaborador definido como Inativo.');
      } catch (err: any) {
          console.error("Erro ao inativar colaborador:", err); alert(`Erro ao inativar: ${err.message}`);
          setFuncionarios(originalFuncionarios); setSelectedFuncionario(originalSelected);
      }
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="pt-2">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 px-0">
        <h1 className="text-2xl font-bold text-gray-800">Colaboradores</h1>
        <Link href="/admin/funcionarios/novo" className="bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors shadow-sm text-sm">
           <PlusCircle size={18} /> <span>Contratar Funcionário</span>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* === COLUNA ESQUERDA: DETALHES === */}
        <div className="lg:w-[380px] flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24 border border-gray-100 min-h-[300px]">
                {/* Loading / Erro */}
                {isLoading && !error && ( <div className="flex flex-col items-center justify-center text-center text-gray-500 py-10"><Loader2 className="animate-spin mb-2" size={24} /> Carregando Detalhes...</div> )}
                {!isLoading && error && ( <div className="flex flex-col items-center justify-center text-center text-red-600 bg-red-50 p-4 rounded border border-red-200 py-10"><AlertTriangle className="mb-2" size={24} /><p className="font-semibold">Erro ao carregar</p><p className="text-sm">{error}</p></div> )}

                {/* Conteúdo Detalhes */}
                {!isLoading && !error && selectedFuncionario && (
                    <div className="animate-fade-in">
                        {/* Avatar, Nome, Cargo */}
                        <div className="flex flex-col items-center mb-6 text-center">
                            <div className="w-28 h-28 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden mb-3 border-4 border-white shadow-lg relative">
                                {selectedFuncionario.image ? (<img src={selectedFuncionario.image} alt={selectedFuncionario.name || 'Avatar'} className="w-full h-full object-cover" />) : (<UserCircle size={60} className="text-neutral-400" />)}
                                {/* PONTO DE STATUS REMOVIDO DA FOTO */}
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">{selectedFuncionario.name || 'Nome não informado'}</h2>
                            <p className="text-sm text-indigo-600 font-medium">{selectedFuncionario.role?.name || 'Cargo não definido'}</p>
                        </div>
                        {/* Informações Detalhadas */}
                        <div className="space-y-3 text-sm border-t border-gray-200 pt-4">
                            <div className="flex items-start gap-3"><Building size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/><span className="text-gray-500 font-medium w-24 flex-shrink-0">Departamento:</span><span className="text-gray-800">{selectedFuncionario.role?.department?.name || 'N/A'}</span></div>
                            <div className="flex items-start gap-3"><CalendarDays size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/><span className="text-gray-500 font-medium w-24 flex-shrink-0">Admissão:</span><span className="text-gray-800">{formatDate(selectedFuncionario.admissionDate)}</span></div>
                            <div className="flex items-start gap-3"><CalendarDays size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/><span className="text-gray-500 font-medium w-24 flex-shrink-0">Nascimento:</span><span className="text-gray-800">{formatDate(selectedFuncionario.birthDate)}</span></div>
                            <div className="flex items-start gap-3"><Mail size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/><span className="text-gray-500 font-medium w-24 flex-shrink-0">Email:</span><a href={`mailto:${selectedFuncionario.email}`} className="text-indigo-600 hover:underline truncate" title={selectedFuncionario.email || ''}>{selectedFuncionario.email || '-'}</a></div>
                            <div className="flex items-start gap-3"><Phone size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/><span className="text-gray-500 font-medium w-24 flex-shrink-0">Telefone:</span><span className="text-gray-800">{selectedFuncionario.phone || '-'}</span></div>
                            <div className="flex items-start gap-3"><Hash size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/><span className="text-gray-500 font-medium w-24 flex-shrink-0">CPF:</span><span className="text-gray-800">{selectedFuncionario.cpf || '-'}</span></div>
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/>
                                <span className="text-gray-500 font-medium w-24 flex-shrink-0">Cidade/UF:</span>
                                <span className="text-gray-800">
                                    {(selectedFuncionario.cidade || '-') + (selectedFuncionario.estado ? ` - ${selectedFuncionario.estado}` : '')}
                                </span>
                            </div>
                            <div className="flex items-start gap-3"><Users size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/><span className="text-gray-500 font-medium w-24 flex-shrink-0">Gestor:</span><span className="text-gray-800">{selectedFuncionario.manager?.name || 'Não definido'}</span></div>
                            {/* LINHA C. CUSTO REMOVIDA */}
                            <div className="flex items-start gap-3">
                                <Info size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/>
                                <span className="text-gray-500 font-medium w-24 flex-shrink-0">Status:</span>
                                {(() => { const config = statusConfig[selectedFuncionario.status] || statusConfig.default; const Icon = config.icon; return (<span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.badgeClass}`}><Icon size={14} className='mr-1'/> {config.text}</span>); })()}
                            </div>
                        </div>
                        {/* Botões */}
                        <div className="mt-6 border-t border-gray-200 pt-4 flex gap-3">
                            {/* <<< BOTÃO EDITAR CORRIGIDO >>> */}
                            <button
                                onClick={() => handleEdit(selectedFuncionario.id)}
                                className="flex-1 bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-4 rounded-lg text-sm inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                <Edit size={16} /> Editar
                            </button>
                            <button
                                onClick={() => handleDelete(selectedFuncionario.id, selectedFuncionario.name)}
                                className={`flex-1 font-medium py-2 px-4 rounded-lg text-sm inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm ${selectedFuncionario.status === 'Ativo' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`}
                                disabled={selectedFuncionario.status !== 'Ativo'}
                                title={selectedFuncionario.status === 'Ativo' ? 'Definir como Inativo' : 'Colaborador não está Ativo'}>
                                <Trash2 size={16} /> Inativar
                            </button>
                        </div>
                    </div>
                )}
                {!isLoading && !error && !selectedFuncionario && (<p className="text-center text-gray-500 py-10">Selecione um colaborador na lista para ver os detalhes.</p>)}
            </div>
        </div>

        {/* === COLUNA DIREITA: LISTA === */}
        <div className="flex-1 bg-white rounded-lg shadow overflow-hidden border border-gray-100 flex flex-col min-h-[500px]">
           {/* Filtros e Ordenação */}
           <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 flex-shrink-0">
               <div className="relative flex-grow sm:flex-grow-0 sm:w-64"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={16} /></span><input type="search" placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" disabled={isLoading}/></div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative"><select id="filter-dept-list" value={selectedDepartment} onChange={(e) => { setSelectedDepartment(e.target.value); setSelectedRole('all'); }} className="py-2 pl-3 pr-8 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm appearance-none cursor-pointer hover:border-gray-400" title="Filtrar por Departamento" disabled={isLoading || isLoadingFilters}><option value="all">Todos Departamentos</option>{isLoadingFilters ? <option disabled>Carregando...</option> : departamentos.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}</select><ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div>
                    <div className="relative"><select id="filter-role-list" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="py-2 pl-3 pr-8 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm appearance-none cursor-pointer hover:border-gray-400" title="Filtrar por Cargo" disabled={isLoading || isLoadingFilters}><option value="all">Todos Cargos</option>{isLoadingFilters ? <option disabled>Carregando...</option> : cargos.filter(role => selectedDepartment === 'all' || role.departmentId === selectedDepartment).map(role => (<option key={role.id} value={role.id}>{role.name}</option>))}</select><ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div>
                    <div className="relative"><select id="filter-status-list" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="py-2 pl-3 pr-8 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm appearance-none cursor-pointer hover:border-gray-400" title="Filtrar por Status" disabled={isLoading || isLoadingFilters}><option value="all">Todos Status</option>{Object.entries(statusConfig).filter(([key]) => key !== 'default').map(([statusKey, config]) => (<option key={statusKey} value={statusKey}>{config.text}</option>))}</select><ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div>
                  <div className="relative"><select id="sort-by-list" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="appearance-none py-2 pl-3 pr-8 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm cursor-pointer hover:border-gray-400" title="Ordenar por" disabled={isLoading}><option value="nameAsc">Nome (A-Z)</option><option value="admissionDateDesc">Admissão (Recente)</option><option value="admissionDateAsc">Admissão (Antiga)</option></select><span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><ChevronDown size={16} /></span></div>
              </div>
          </div>
           {/* Lista Rolável */}
           <div className="flex-1 overflow-y-auto">
               {isLoading && ( <div className="p-6 text-center text-gray-500 flex items-center justify-center"><Loader2 className="animate-spin inline-block mr-2" size={18}/>Carregando lista...</div> )}
               {!isLoading && error && ( <div className="p-6 text-center text-red-500 flex items-center justify-center"><AlertTriangle className="inline-block mr-2" size={18}/>{error}</div> )}
               {!isLoading && !error && (
                   filteredAndSortedFuncionarios.length === 0 ? (
                      <p className="text-center text-gray-500 py-6 px-6">Nenhum colaborador encontrado com os filtros aplicados.</p>
                   ) : (
                      <div className="divide-y divide-gray-100">
                        {filteredAndSortedFuncionarios.map((func) => {
                            const currentStatusConfig = statusConfig[func.status] || statusConfig.default;
                            return (
                                <button key={func.id} onClick={() => setSelectedFuncionario(func)} className={`w-full grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_repeat(3,auto)] lg:grid-cols-[auto_1fr_repeat(4,auto)] xl:grid-cols-[auto_1fr_repeat(5,auto)] items-center gap-4 px-4 py-3 text-left transition-colors duration-150 focus:outline-none focus:bg-indigo-50 border-l-4 ${selectedFuncionario?.id === func.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-transparent hover:bg-gray-50'}`} aria-current={selectedFuncionario?.id === func.id ? 'true' : 'false'}>
                                   {/* Avatar da Lista (CORRIGIDO) */}
                                   <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                                      {func.image ? (<img src={func.image} alt={func.name || 'Avatar'} className="w-full h-full object-cover" />) : (<UserCircle size={22} className="text-neutral-500" />)}
                                       {/* PONTO DE STATUS REMOVIDO DA LISTA */}
                                       {/* <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border border-white ${currentStatusConfig.dotClass}`} title={currentStatusConfig.text}></span> */}
                                   </div>
                                   <div className="min-w-0"><p className="text-sm font-medium text-gray-900 truncate" title={func.name || ''}>{func.name || '-'}</p><p className="text-xs text-gray-500 truncate" title={func.role?.name || ''}>{func.role?.name || 'Sem Cargo'}</p></div>
                                   <div className="hidden sm:block text-sm text-gray-500 flex-shrink-0 truncate w-28 text-right" title={func.role?.department?.name || ''}>{func.role?.department?.name || '-'}</div>
                                   <div className="hidden lg:block text-sm text-gray-500 flex-shrink-0 w-24 text-right">{formatDate(func.admissionDate)}</div>
                                   <div className="hidden lg:block w-20 text-right"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${currentStatusConfig.badgeClass}`}>{currentStatusConfig.text}</span></div>
                                   <div className="hidden xl:block text-sm font-semibold text-gray-700 flex-shrink-0 w-20 text-right">{func.salary !== null && func.salary !== undefined ? func.salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</div>
                                </button>
                            );
                        })}
                      </div>
                   )
               )}
            </div>
        </div>
      </div>
    </div>
  );
}