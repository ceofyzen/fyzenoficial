// src/app/(admin)/admin/funcionarios/page.tsx
'use client'; 

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react'; 
import { 
    Users, PlusCircle, Edit, Trash2, Loader2, AlertTriangle, 
    BadgeCheck, BadgeX, UserCircle, Search, Filter, ArrowUpDown, 
    Building, Mail, Phone, CalendarDays, MapPin, Hash, 
    Briefcase 
} from 'lucide-react'; 

// --- Tipos ---
type DepartmentOption = { id: string; name: string; };
type RoleOption = { id: string; name: string; departmentId: string; };
type FuncionarioListData = {
  id: string; name: string | null; email: string | null; image?: string | null; 
  isActive: boolean; admissionDate: Date | string; phone: string | null;
  cpf?: string | null; rg?: string | null; birthDate?: Date | string | null; address?: string | null;
  role: { id: string; name: string; department?: { id: string; name: string; } | null; } | null; 
};
// --- Fim Tipos ---

// --- Função de Formatar Data (Formato DD/MM/YYYY) ---
const formatDate = (date: Date | string | null | undefined): string => { 
    if (!date) return '-'; 
    try { 
        const d = new Date(date);
        if (isNaN(d.getTime())) { return '-'; }
        const day = String(d.getUTCDate()).padStart(2, '0');
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const year = d.getUTCFullYear();
        if (year < 1900 || year > 2100) return '-'; 
        return `${day}/${month}/${year}`; 
    } catch (e) { 
        console.error("Erro ao formatar data:", date, e);
        return '-'; 
    }
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

  // --- useEffect para buscar funcionários ---
  useEffect(() => {
    const fetchFuncionarios = async () => {
      setIsLoading(true); setError(null);
      let response: Response | null = null;
      try {
        response = await fetch('/api/funcionarios'); 
        if (!response.ok) {
          let errorBody = await response.text(); let errorMessage = `Falha (${response.status})`;
          try { errorMessage = JSON.parse(errorBody).error || errorMessage; } 
          catch (parseError) { errorMessage = errorBody.substring(0, 100) || errorMessage; }
          throw new Error(errorMessage);
        }
        const data: FuncionarioListData[] = await response.json(); 
        setFuncionarios(data);
      } catch (err: any) {
        console.error("Erro buscar funcionários:", err); setError(String(err.message || 'Erro desconhecido'));
      } finally { setIsLoading(false); console.log("Fetch func finalizado:", response?.status); }
    };
    fetchFuncionarios();
  }, []); 

  // --- useEffect para buscar filtros ---
  useEffect(() => {
    const fetchFilterData = async () => {
      setIsLoadingFilters(true);
      try {
        const [deptsResponse, rolesResponse] = await Promise.all([ fetch('/api/departamentos'), fetch('/api/cargos') ]);
        if (deptsResponse.ok) setDepartamentos(await deptsResponse.json()); else console.warn("Falha carregar depts.");
        if (rolesResponse.ok) setCargos(await rolesResponse.json()); else console.warn("Falha carregar cargos.");
      } catch (err) { console.error("Erro carregar filtros:", err); } 
      finally { setIsLoadingFilters(false); }
    };
    fetchFilterData();
  }, []); 

  // --- Lógica Filtro/Sort ---
  const filteredAndSortedFuncionarios = useMemo(() => { 
      if (isLoading || !Array.isArray(funcionarios)) return []; 
      let result = [...funcionarios]; 
      if (selectedDepartment !== 'all') { result = result.filter(f => f.role?.department?.id === selectedDepartment); }
      if (selectedRole !== 'all') { result = result.filter(f => f.role?.id === selectedRole); }
      if (searchTerm.trim()) { const lower = searchTerm.toLowerCase(); result = result.filter(f => f.name?.toLowerCase().includes(lower) || f.email?.toLowerCase().includes(lower)); }
      result.sort((a, b) => { 
        switch (sortBy) {
          case 'admissionDateAsc': return (a.admissionDate ? new Date(a.admissionDate).getTime() : 0) - (b.admissionDate ? new Date(b.admissionDate).getTime() : 0);
          case 'admissionDateDesc': return (b.admissionDate ? new Date(b.admissionDate).getTime() : 0) - (a.admissionDate ? new Date(a.admissionDate).getTime() : 0);
          default: return (a.name || '').localeCompare(b.name || '');
        }
      });
      return result; 
  }, [funcionarios, selectedDepartment, selectedRole, searchTerm, sortBy, isLoading]); 

  // --- useEffect para selecionar o primeiro ---
  useEffect(() => {
    if (!isLoading && filteredAndSortedFuncionarios.length > 0) {
        const isSelectedValid = filteredAndSortedFuncionarios.some(f => f.id === selectedFuncionario?.id);
        if (!isSelectedValid || !selectedFuncionario) { setSelectedFuncionario(filteredAndSortedFuncionarios[0]); }
    } else if (!isLoading && filteredAndSortedFuncionarios.length === 0) { setSelectedFuncionario(null); }
  }, [filteredAndSortedFuncionarios, isLoading, selectedFuncionario]); 

  // --- Handlers ---
  const handleEdit = (id: string | undefined) => { if(id) router.push(`/admin/funcionarios/editar/${id}`); };
  const handleDelete = async (id: string | undefined, name: string | null) => { 
      if (!id || !confirm(`Desativar "${name || 'este colaborador'}"?`)) return;
      const originalFuncionarios = [...funcionarios]; const originalSelected = selectedFuncionario ? {...selectedFuncionario} : null;
      setFuncionarios(funcionarios.map(f => f.id === id ? { ...f, isActive: false } : f));
      if (selectedFuncionario?.id === id) { setSelectedFuncionario(prev => prev ? { ...prev, isActive: false } : null); }
      try {
          const response = await fetch(`/api/funcionarios/${id}`, { method: 'DELETE' });
          if (!response.ok) { const d = await response.json(); throw new Error(d.error || `Erro ${response.status}`); }
          alert('Colaborador desativado.');
      } catch (err: any) {
          console.error("Erro ao desativar:", err); alert(`Erro: ${err.message}`);
          setFuncionarios(originalFuncionarios); setSelectedFuncionario(originalSelected);
      }
  };

  // --- RENDERIZAÇÃO ---
  return (
    // ***** CORREÇÃO AQUI ***** Aumentado para pt-8 (pode ajustar para pt-6 ou pt-10 se necessário)
    <div className="pt-8"> 
      {/* Cabeçalho da Página */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 px-0"> 
        <h1 className="text-2xl font-bold text-gray-800">Colaboradores</h1>
        <Link href="/admin/funcionarios/novo" title="Novo Funcionário" className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg inline-flex items-center justify-center transition-colors shadow-sm">
           <PlusCircle size={20} />
        </Link>
      </div>
       
      {/* --- LAYOUT PRINCIPAL: FLEX PARA AS COLUNAS --- */}
      <div className="flex flex-col lg:flex-row gap-6"> 
        
        {/* === COLUNA ESQUERDA: DETALHES === */}
        <div className="lg:w-[380px] flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24 border border-gray-100 min-h-[300px]"> 
                {/* Feedback Visual */}
                {isLoading && <div className="text-center text-gray-500 py-10"><Loader2 className="animate-spin inline-block mr-2" />Carregando Detalhes...</div>}
                {!isLoading && error && <div className="text-center text-red-500 py-10"><AlertTriangle className="inline-block mr-2" />{error}</div>} 
                
                {/* Conteúdo dos Detalhes */}
                {!isLoading && !error && selectedFuncionario && ( 
                    <div>
                        {/* Avatar, Nome, Cargo */}
                        <div className="flex flex-col items-center mb-6 text-center">
                            <div className="w-28 h-28 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden mb-3 border-4 border-white shadow-lg relative">
                                {selectedFuncionario.image ? (<img src={selectedFuncionario.image} alt={selectedFuncionario.name || 'Avatar'} className="w-full h-full object-cover" />) 
                                : (<UserCircle size={60} className="text-neutral-400" />)}
                                <span className={`absolute bottom-1 right-1 block h-4 w-4 rounded-full border-2 border-white ${selectedFuncionario.isActive ? 'bg-green-400' : 'bg-red-400'}`} title={selectedFuncionario.isActive ? 'Ativo' : 'Inativo'}></span>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">{selectedFuncionario.name || 'Nome não informado'}</h2>
                            <p className="text-sm text-indigo-600 font-medium">{selectedFuncionario.role?.name || 'Cargo não definido'}</p>
                        </div>
                        {/* Informações Detalhadas */}
                        <div className="space-y-3 text-sm border-t border-gray-200 pt-4">
                            <div className="flex items-start gap-3"><Building size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/><span className="text-gray-500 font-medium w-24 flex-shrink-0">Departamento:</span><span className="text-gray-800">{selectedFuncionario.role?.department?.name || 'N/A'}</span></div>
                            <div className="flex items-start gap-3"><CalendarDays size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/><span className="text-gray-500 font-medium w-24 flex-shrink-0">Admissão:</span><span className="text-gray-800">{formatDate(selectedFuncionario.admissionDate)}</span></div>
                            <div className="flex items-start gap-3"><Mail size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/><span className="text-gray-500 font-medium w-24 flex-shrink-0">Email:</span><a href={`mailto:${selectedFuncionario.email}`} className="text-indigo-600 hover:underline truncate" title={selectedFuncionario.email || ''}>{selectedFuncionario.email || '-'}</a></div>
                            <div className="flex items-start gap-3"><Phone size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/><span className="text-gray-500 font-medium w-24 flex-shrink-0">Telefone:</span><span className="text-gray-800">{selectedFuncionario.phone || '-'}</span></div>
                            <div className="flex items-start gap-3"><Hash size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/><span className="text-gray-500 font-medium w-24 flex-shrink-0">CPF:</span><span className="text-gray-800">{selectedFuncionario.cpf || '-'}</span></div>
                            <div className="flex items-start gap-3"><Users size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/><span className="text-gray-500 font-medium w-24 flex-shrink-0">Gestor:</span><span className="text-gray-800 italic text-gray-400">Não definido</span></div>
                            <div className="flex items-start gap-3"><Briefcase size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/><span className="text-gray-500 font-medium w-24 flex-shrink-0">C. Custo:</span><span className="text-gray-800 italic text-gray-400">Não definido</span></div>
                            <div className="flex items-start gap-3">
                                <span className="text-gray-500 font-medium w-24 flex-shrink-0">Status:</span>
                                {selectedFuncionario.isActive ? ( <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"><BadgeCheck size={14} className='mr-1'/> Ativo</span> ) 
                                : ( <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"><BadgeX size={14} className='mr-1'/> Inativo</span> )}
                            </div>
                        </div>
                        {/* Botões de Ação */}
                        <div className="mt-6 border-t border-gray-200 pt-4 flex gap-3">
                            <button onClick={() => handleEdit(selectedFuncionario.id)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-sm inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm"><Edit size={16} /> Editar</button>
                            <button onClick={() => handleDelete(selectedFuncionario.id, selectedFuncionario.name)} className={`flex-1 font-medium py-2 px-4 rounded-lg text-sm inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm ${selectedFuncionario.isActive ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`} disabled={!selectedFuncionario.isActive}><Trash2 size={16} /> Desativar</button>
                        </div>
                    </div>
                )}
                {/* Mensagem se nenhum selecionado */}
                {!isLoading && !error && !selectedFuncionario && (
                    <p className="text-center text-gray-500 py-10">Selecione um colaborador na lista.</p>
                )}
            </div>
        </div>

        {/* === COLUNA DIREITA: LISTA === */}
        <div className="flex-1 bg-white rounded-lg shadow overflow-hidden border border-gray-100 flex flex-col min-h-[500px]">
          {/* Filtros e Ordenação */}
           <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-end gap-3 bg-gray-50/50 flex-shrink-0"> 
              <div className="flex flex-wrap items-center gap-3">
                  <select id="filter-dept-list" value={selectedDepartment} onChange={(e) => { setSelectedDepartment(e.target.value); setSelectedRole('all'); }} className="py-1.5 pl-2 pr-7 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm" title="Filtrar por Departamento" disabled={isLoading || isLoadingFilters} >
                      <option value="all">Departamentos</option>
                      {isLoadingFilters ? <option disabled>Carregando...</option> : departamentos.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
                  </select>
                   <select id="filter-role-list" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="py-1.5 pl-2 pr-7 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm" title="Filtrar por Cargo" disabled={isLoading || isLoadingFilters} >
                      <option value="all">Cargos</option>
                      {isLoadingFilters ? <option disabled>Carregando...</option> : cargos .filter(role => selectedDepartment === 'all' || role.departmentId === selectedDepartment) .map(role => (<option key={role.id} value={role.id}>{role.name}</option>))}
                  </select>
              </div>
               <div className="relative">
                  <select id="sort-by-list" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="appearance-none py-1.5 pl-2 pr-7 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm" title="Ordenar por" disabled={isLoading} >
                      <option value="nameAsc">Nome</option>
                      <option value="admissionDateDesc">Admissão Recente</option>
                      <option value="admissionDateAsc">Admissão Antiga</option>
                  </select>
                   <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><ArrowUpDown size={14} /></span>
               </div>
          </div>

          {/* Lista Rolável */}
          <div className="flex-1 overflow-y-auto"> 
             {isLoading && <div className="p-6 text-center text-gray-500"><Loader2 className="animate-spin inline-block mr-2" />Carregando lista...</div>}
             {!isLoading && error && <div className="p-6 text-center text-red-500"><AlertTriangle className="inline-block mr-2" />{error}</div>}
             
             {!isLoading && !error && (
                 filteredAndSortedFuncionarios.length === 0 ? (
                    <p className="text-center text-gray-500 py-6 px-6">Nenhum colaborador encontrado.</p>
                 ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredAndSortedFuncionarios.map((func) => (
                          <button 
                            key={func.id}
                            onClick={() => setSelectedFuncionario(func)} 
                            className={`w-full grid grid-cols-[auto_1fr_repeat(4,auto)] items-center gap-4 px-4 py-3 text-left transition-colors duration-150 focus:outline-none focus:bg-indigo-50 border-l-4 ${selectedFuncionario?.id === func.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-transparent hover:bg-gray-50'}`} 
                          >
                             {/* Col 1: Avatar */}
                             <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                                {func.image ? (<img src={func.image} alt={func.name || 'Avatar'} className="w-full h-full object-cover" />) 
                                : (<UserCircle size={22} className="text-neutral-500" />)}
                                 <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border border-white ${func.isActive ? 'bg-green-400' : 'bg-red-400'}`} title={func.isActive ? 'Ativo' : 'Inativo'}></span>
                             </div>
                             {/* Col 2: Nome/Cargo */}
                             <div className="min-w-0"> 
                               <p className="text-sm font-medium text-gray-900 truncate">{func.name || '-'}</p>
                               <p className="text-xs text-gray-500 truncate">{func.role?.name || 'Sem Cargo'}</p>
                             </div>
                             {/* Col 3: Empresa */}
                             <div className="hidden md:block text-sm text-gray-500 flex-shrink-0 truncate w-24" title="Fyzen">Fyzen</div>
                             {/* Col 4: Departamento */}
                             <div className="hidden lg:block text-sm text-gray-500 flex-shrink-0 truncate w-28" title={func.role?.department?.name || ''}>{func.role?.department?.name || ''}</div>
                             {/* Col 5: Admissão */}
                             <div className="hidden xl:block text-sm text-gray-500 flex-shrink-0 w-24 text-right">{formatDate(func.admissionDate)}</div>
                             {/* Col 6: Salário */}
                             <div className="hidden xl:block text-sm font-semibold text-gray-700 flex-shrink-0 w-20 text-right">R$ ?.???</div>
                          </button>
                      ))}
                    </div>
                 )
             )}
          </div>
        </div>
      </div> 
    </div>
  );
}

// Estilos de Badge e animação (podem ir para globals.css)
/* Exemplo animação (adicione ao globals.css se não estiver lá):
@keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
.animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
*/