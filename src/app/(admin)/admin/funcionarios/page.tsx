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

const formatDate = (date: Date | string | null | undefined): string => { /* ... */ };

export default function FuncionariosPage() {
  const router = useRouter();
  
  // --- Estados ---
  const [funcionarios, setFuncionarios] = useState<FuncionarioListData[]>([]); 
  const [departamentos, setDepartamentos] = useState<DepartmentOption[]>([]); 
  const [cargos, setCargos] = useState<RoleOption[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all'); 
  const [selectedRole, setSelectedRole] = useState<string>('all'); 
  const [sortBy, setSortBy] = useState<'admissionDateDesc' | 'admissionDateAsc' | 'nameAsc'>('nameAsc'); 
  const [selectedFuncionario, setSelectedFuncionario] = useState<FuncionarioListData | null>(null);

  // --- Funções Fetch (Simplificada Inicialmente) ---
  const fetchData = async () => { 
      setIsLoading(true); 
      setError(null);
      console.log("Iniciando fetchData...");
      try {
        // Busca APENAS funcionários primeiro para simplificar
        const funcResponse = await fetch('/api/funcionarios'); 
        console.log("Status Resposta Funcionários:", funcResponse.status);
        if (!funcResponse.ok) {
            const errorText = await funcResponse.text();
            console.error("Erro Raw Funcionários:", errorText);
            throw new Error(`Falha ao buscar funcionários (${funcResponse.status})`);
        }
        const funcData: FuncionarioListData[] = await funcResponse.json();
        console.log("Funcionários recebidos:", funcData);
        setFuncionarios(funcData); 

        // Busca Departamentos e Cargos (separado para não travar o carregamento inicial dos funcionários)
        Promise.all([
             fetch('/api/departamentos'),
             fetch('/api/cargos')
         ]).then(async ([deptsResponse, rolesResponse]) => {
             if (!deptsResponse.ok || !rolesResponse.ok) {
                 console.warn("Falha ao buscar deps ou roles para filtros.");
                 // Pode definir um erro secundário se quiser
                 return; 
             }
             const deptsData: DepartmentOption[] = await deptsResponse.json();
             const rolesData: RoleOption[] = await rolesResponse.json();
             console.log("Departamentos e Cargos para filtros carregados.");
             setDepartamentos(deptsData);
             setCargos(rolesData);
         }).catch(filterError => {
             console.error("Erro ao carregar dados de filtro:", filterError);
             // Define um erro específico para filtros se necessário
         });

        // Seleciona o primeiro funcionário APÓS a ordenação inicial
        if (funcData.length > 0) { 
            const sortedInitial = [...funcData].sort((a,b) => (a.name || '').localeCompare(b.name || ''));
            setSelectedFuncionario(sortedInitial[0]); 
            console.log("Primeiro funcionário selecionado:", sortedInitial[0]);
        } else { 
            setSelectedFuncionario(null); 
            console.log("Nenhum funcionário para selecionar.");
        }
      } catch (err: any) { 
          console.error("Falha CRÍTICA no fetchData:", err); 
          setError(`Erro: ${err.message || 'Erro desconhecido ao carregar funcionários'}`); 
      } finally { 
          setIsLoading(false); 
          console.log("fetchData finalizado.");
      }
  };
  useEffect(() => { fetchData(); }, []); 
  
  // --- Handlers (sem alteração) ---
  const handleEdit = (id: string | undefined) => { /* ... */ };
  const handleDelete = async (id: string | undefined, name: string | null) => { /* ... */ };
  // --- Fim Handlers ---

  // --- Lógica Filtro/Sort (useMemo - sem alteração na lógica interna, apenas na dependência) ---
  const filteredAndSortedFuncionarios = useMemo(() => { 
      // Adicionado log para depuração
      console.log("Calculando filteredAndSortedFuncionarios...");
      if (!funcionarios || funcionarios.length === 0) {
          console.log(" -> Funcionários vazio ou null, retornando [].");
          return []; 
      }
      
      let filteredResult = funcionarios; 
      // Logs para filtros
      console.log(` -> Filtrando Depto: ${selectedDepartment}, Cargo: ${selectedRole}, Busca: "${searchTerm}"`);
      if (selectedDepartment !== 'all') filteredResult = filteredResult.filter(f => f.role?.department?.id === selectedDepartment);
      if (selectedRole !== 'all') filteredResult = filteredResult.filter(f => f.role?.id === selectedRole);
      if (searchTerm.trim()) { const l = searchTerm.toLowerCase(); filteredResult = filteredResult.filter(f => f.name?.toLowerCase().includes(l) || f.email?.toLowerCase().includes(l)); }
      
      const sortedResult = [...filteredResult]; 
      // Log para ordenação
      console.log(` -> Ordenando por: ${sortBy}`);
      sortedResult.sort((a, b) => { 
        switch (sortBy) {
          case 'admissionDateAsc': const dateA = a.admissionDate ? new Date(a.admissionDate).getTime() : 0; const dateB = b.admissionDate ? new Date(b.admissionDate).getTime() : 0; return dateA - dateB;
          case 'admissionDateDesc': const dateDescA = b.admissionDate ? new Date(b.admissionDate).getTime() : 0; const dateDescB = a.admissionDate ? new Date(a.admissionDate).getTime() : 0; return dateDescA - dateDescB;
          case 'nameAsc': default: return (a.name || '').localeCompare(b.name || '');
        }
      });
      console.log(" -> Resultado final:", sortedResult);
      return sortedResult; 
  }, [funcionarios, selectedDepartment, selectedRole, searchTerm, sortBy]);
  // --- Fim Lógica ---

  return (
    <div className='h-full flex flex-col'> 
      {/* Cabeçalho */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Colaboradores</h1>
        <div className='flex items-center gap-3'>
            <div className="relative flex-grow sm:w-64"> {/* ... input busca ... */} </div>
            <Link href="/admin/funcionarios/novo" title="Novo Funcionário" className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg inline-flex items-center justify-center transition-colors shadow-sm">
              <PlusCircle size={20} />
            </Link>
        </div>
      </div>
       
      {/* Layout de Duas Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        
        {/* === COLUNA ESQUERDA: DETALHES === */}
        <div className="lg:col-span-4 bg-white rounded-lg shadow p-6 self-start sticky top-20 border border-gray-100"> 
            {/* Feedback Visual (Loading/Error) */}
            {isLoading && <div className="text-center text-gray-500 py-10"><Loader2 className="animate-spin inline-block mr-2" />Carregando Detalhes...</div>}
            {!isLoading && error && !selectedFuncionario && <div className="text-center text-red-500 py-10"><AlertTriangle className="inline-block mr-2" />Erro ao carregar.</div>} 
            
            {/* Conteúdo dos Detalhes */}
            {!isLoading && selectedFuncionario ? ( 
                <div>
                    {/* ... (código dos detalhes como antes) ... */}
                </div>
            ) : null} {/* Renderiza null se selectedFuncionario for null */}

            {/* Mensagem se nenhum selecionado (agora só aparece se não estiver carregando e não houver erro E não houver selecionado) */}
            {!isLoading && !error && !selectedFuncionario && (
                <p className="text-center text-gray-500 py-10">Selecione um colaborador na lista para ver os detalhes.</p>
            )}
        </div>


        {/* === COLUNA DIREITA: LISTA === */}
        <div className="lg:col-span-8 bg-white rounded-lg shadow overflow-hidden border border-gray-100">
          {/* Filtros e Ordenação */}
           <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-end gap-3 bg-gray-50/50"> 
              {/* ... (código dos filtros/ordenação como antes) ... */}
          </div>

          {/* Lista Rolável */}
          <div className="overflow-y-auto h-[calc(100vh-18rem)]"> 
             {/* Loading (AGORA MOSTRA LOADING DA LISTA AQUI) */}
             {isLoading && <div className="p-6 text-center text-gray-500"><Loader2 className="animate-spin inline-block mr-2" />Carregando lista...</div>}
             {/* Erro */}
             {!isLoading && error && <div className="p-6 text-center text-red-500"><AlertTriangle className="inline-block mr-2" />{error}</div>}
             
             {/* Mensagem Vazia ou Lista */}
             {!isLoading && !error && (
                // A verificação Array.isArray ainda é boa aqui
                Array.isArray(filteredAndSortedFuncionarios) && filteredAndSortedFuncionarios.length === 0 ? (
                    <p className="text-center text-gray-500 py-6 px-6">Nenhum colaborador encontrado com os filtros aplicados.</p>
                 ) : (
                    Array.isArray(filteredAndSortedFuncionarios) && filteredAndSortedFuncionarios.length > 0 && (
                        <div className="divide-y divide-gray-100">
                        {filteredAndSortedFuncionarios.map((func) => (
                            <button 
                                key={func.id}
                                onClick={() => setSelectedFuncionario(func)} 
                                className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors duration-150 focus:outline-none focus:bg-indigo-50 border-l-4 ${selectedFuncionario?.id === func.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-transparent hover:bg-gray-50'}`} 
                            >
                                {/* ... (conteúdo do botão/linha como antes) ... */}
                            </button>
                        ))}
                        </div>
                    )
                 )
             )}
          </div>
        </div>

      </div> 
      {/* <Footer /> - REMOVIDO pois já deve estar no layout principal */}
    </div>
  );
}

// Estilos Badge...