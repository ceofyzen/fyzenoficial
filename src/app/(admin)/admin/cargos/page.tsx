// src/app/(admin)/admin/cargos/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as LucideIcons from 'lucide-react';
import {
    Briefcase, PlusCircle, Edit, Trash2, Loader2, AlertTriangle,
    Building, ChevronDown, Users, BookOpenText, ShieldCheck, Hash,
    Icon as IconPlaceholder
} from 'lucide-react';

// --- Tipo (Incluindo iconName) ---
type Role = {
  id: string;
  name: string;
  departmentId: string;
  description: string | null;
  isDirector: boolean;
  hierarchyLevel: number;
  iconName?: string | null; // Nome do ícone escolhido
  department: {
    name: string;
  };
   _count?: {
    users: number;
  }
};
// --- Fim do Tipo ---

interface GroupedRoles { [departmentName: string]: Role[]; }

// --- Componente Ícone Dinâmico ---
const DynamicLucideIcon = ({ name, fallback: Fallback, ...props }: { name: string | null | undefined, fallback: React.ElementType } & LucideIcons.LucideProps) => {
  // @ts-ignore
  const IconComponent = name ? LucideIcons[name] : null;

  if (IconComponent) {
    // @ts-ignore
    return <IconComponent {...props} />;
  }
  return <Fallback {...props} />;
};
// --- Fim Componente Ícone Dinâmico ---


// --- Componente Skeleton ---
function SkeletonCard() {
    return (
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 animate-pulse flex flex-col h-full">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-11/12 mb-4"></div>
        <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-md bg-gray-200"></div>
            <div className="w-8 h-8 rounded-md bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

function SkeletonDepartmentSection() {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }
// --- Fim Skeletons ---

export default function CargosPage() {
  const router = useRouter();
  const [cargos, setCargos] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- fetchCargos ---
  const fetchCargos = async () => {
      setIsLoading(true); setError(null);
      try {
          const response = await fetch('/api/cargos');
          if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
          const data: Role[] = await response.json();
          setCargos(data);
      } catch (err: any) {
          console.error("Falha ao buscar cargos:", err);
          setError(`Não foi possível carregar: ${err.message || 'Erro'}`);
      } finally { setIsLoading(false); }
  };
  useEffect(() => { fetchCargos(); }, []);

// --- groupedCargos (useMemo com ordenação hierárquica de departamentos) ---
  const groupedCargos = useMemo(() => {
    if (isLoading || error || !Array.isArray(cargos)) return {}; // Retorna objeto vazio se carregando, erro ou dados inválidos

    try {
        // 1. Agrupa os cargos por nome do departamento
        const groups = cargos.reduce((acc, cargo) => {
          const deptName = cargo?.department?.name || 'Sem Departamento';
          if (!acc[deptName]) { acc[deptName] = { roles: [], minLevel: 999 }; } // Inicializa com nível alto
          acc[deptName].roles.push(cargo);
          // Atualiza o nível mínimo do departamento
          const currentLevel = cargo.hierarchyLevel ?? 99;
          if (currentLevel < acc[deptName].minLevel) {
            acc[deptName].minLevel = currentLevel;
          }
          return acc;
        }, {} as { [departmentName: string]: { roles: Role[]; minLevel: number } }); // Tipo ajustado

        // 2. Ordena os cargos DENTRO de cada departamento (como antes)
        Object.keys(groups).forEach(deptName => {
          groups[deptName].roles.sort((a, b) => {
            const levelA = a.hierarchyLevel ?? 99;
            const levelB = b.hierarchyLevel ?? 99;
            if (levelA !== levelB) { return levelA - levelB; } // Primeiro por nível hierárquico
            return a.name.localeCompare(b.name); // Depois por nome
          });
        });

        // 3. Ordena os NOMES DOS DEPARTAMENTOS pela hierarquia (minLevel) e depois alfabeticamente
        const sortedDepartmentNames = Object.keys(groups).sort((a, b) => {
            const levelDeptA = groups[a].minLevel;
            const levelDeptB = groups[b].minLevel;
            if (levelDeptA !== levelDeptB) {
                return levelDeptA - levelDeptB; // Ordena pelo nível mais alto (menor número)
            }
            return a.localeCompare(b); // Se níveis iguais, ordena alfabeticamente
        });

        // 4. Cria o objeto final ordenado contendo apenas a lista de cargos
        const sortedGroupedCargos = sortedDepartmentNames.reduce((acc, deptName) => {
          acc[deptName] = groups[deptName].roles; // Pega apenas o array de roles ordenado
          return acc;
        }, {} as GroupedRoles); // Usa o tipo original GroupedRoles

        return sortedGroupedCargos;

    } catch (e) {
         console.error("Erro ao processar groupedCargos:", e);
         setError("Erro ao organizar os cargos por departamento."); // Informa o usuário
         return {}; // Retorna objeto vazio em caso de erro
    }
  }, [cargos, isLoading, error]);

  // --- Handlers (Editar/Excluir) ---
  const handleEdit = (id: string) => { router.push(`/admin/cargos/editar/${id}`); };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cargo "${name}"? ...`)) { return; }
    setError(null);
    try {
      const response = await fetch(`/api/cargos/${id}`, { method: 'DELETE' });
      if (!response.ok) { const d = await response.json(); throw new Error(d.error || `Erro HTTP: ${response.status}`); }
      // --- ALERT REMOVIDO ---
      fetchCargos(); // Re-busca dados como feedback
    } catch (err: any) {
      console.error("Falha ao excluir cargo:", err);
      setError(`Erro ao excluir: ${err.message || 'Erro desconhecido'}`);
      // Manter alerta de ERRO
      alert(`Erro ao excluir o cargo "${name}": ${err.message || 'Verifique o console.'}`);
    }
  };


  return (
    <div className="pt-14 pb-8 min-h-screen bg-gray-50">
      {/* Cabeçalho (Neutro) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 mb-4 sm:mb-0">
          <Briefcase size={32} className="text-neutral-900" /> Gestão de Cargos
        </h1>
        <Link
          href="/admin/cargos/novo"
          className="bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-5 rounded-lg inline-flex items-center gap-2 transition-colors duration-200 shadow-md text-sm group"
        >
          <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-200" />
          Novo Cargo
        </Link>
      </div>

      {/* Exibição de Erro Global */}
      {error && !isLoading && (
         <div className="mx-4 sm:mx-6 lg:mx-8 text-center py-10 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 mb-6 animate-fade-in">
           <AlertTriangle size={24} className="mx-auto mb-2" />
           <p className="font-semibold">Falha ao carregar dados!</p>
           <p className="text-sm">{error}</p>
           <button onClick={fetchCargos} className="mt-4 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
              Tentar Novamente
          </button>
        </div>
      )}

      {/* Container Principal */}
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Estado de Loading */}
        {isLoading && (
          <>
            <SkeletonDepartmentSection />
            <SkeletonDepartmentSection />
          </>
        )}

        {/* Estado Carregado (COM A CORREÇÃO) */}
        {/* CORREÇÃO AQUI: Adicionado "groupedCargos &&" */}
        {!isLoading && !error && groupedCargos && Object.keys(groupedCargos).length > 0 && (
            Object.entries(groupedCargos).map(([departmentName, rolesInDept], index) => (
              <details
                key={departmentName}
                className="bg-white rounded-xl shadow-lg border border-gray-100 group overflow-hidden transition-all duration-300 ease-in-out"
                open={index === 0}
              >
                {/* Cabeçalho Departamento (Neutro) */}
                <summary className="list-none flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-white cursor-pointer border-b border-gray-200 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <Building size={20} className="text-neutral-600" />
                    <h2 className="text-lg font-semibold text-gray-800 tracking-wide">{departmentName}</h2>
                    <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        {rolesInDept.length} Cargos
                    </span>
                  </div>
                  <ChevronDown size={22} className="text-gray-500 group-open:rotate-180 transition-transform duration-300" />
                </summary>

                {/* Grid de Cards para os Cargos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                  {rolesInDept.map((cargo) => (
<div
                      key={cargo.id}
                      className="flex flex-col justify-between bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 relative group"
                    >
                      {/* BADGE DIRETOR FOI REMOVIDO DAQUI */}

                      {/* Header do Card (Ícone Dinâmico) */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center shadow bg-gray-100 text-neutral-700`}
                           title={cargo.iconName ? `Ícone: ${cargo.iconName}` : 'Ícone Padrão'}
                         >
                           <DynamicLucideIcon name={cargo.iconName ?? undefined} fallback={Briefcase} size={20} />
                         </div>
                        <div className="flex-1 mt-0.5">
                          {/* Título - Removido 'truncate', adicionado 'break-words' se necessário */}
                          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 break-words" title={cargo.name}>
                           {cargo.name}
                          </h3>
                          {/* Nível e Badge Diretor agrupados */}
                          <div className="flex items-center gap-2 flex-wrap"> {/* Adicionado flex-wrap para responsividade */}
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                 <Hash size={14} /> Nível {cargo.hierarchyLevel}
                              </p>
                              {/* BADGE DIRETOR MOVIDO PARA CÁ */}
                              {cargo.isDirector && (
                                <div className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <ShieldCheck size={14} /> Diretor
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Descrição (Neutra) */}
                      <div className="mb-4 text-sm text-gray-600 min-h-[40px] line-clamp-2" title={cargo.description || ''}>
                          <BookOpenText size={16} className="inline-block mr-2 text-gray-400 -mt-0.5" />
                          {cargo.description || <span className="italic text-gray-400">Sem descrição</span>}
                      </div>

                      {/* Footer do Card (Neutro) */}
                      <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-4">
                         <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                            <Users size={16} className="text-neutral-500" />
                            <span>{cargo._count?.users ?? 0} funcionário(s)</span>
                         </div>
                         <div className="flex gap-2">
                           <button onClick={() => handleEdit(cargo.id)} className="text-gray-600 hover:text-neutral-900 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200" title="Editar Cargo">
                             <Edit size={18} />
                           </button>
                           <button onClick={() => handleDelete(cargo.id, cargo.name)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors duration-200" title="Excluir Cargo">
                             <Trash2 size={18} />
                           </button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))
        )}

        {/* Estado Vazio (Neutro) */}
        {!isLoading && !error && groupedCargos && Object.keys(groupedCargos).length === 0 && (
           <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-md border border-gray-100 mx-auto max-w-xl animate-fade-in">
             <Briefcase size={50} className="mx-auto mb-6 text-gray-400" />
             <h3 className="text-xl font-semibold text-gray-800">Nenhum Cargo Cadastrado</h3>
             <p className="text-base mt-2 mb-6 text-gray-600">Crie o primeiro cargo agora!</p>
             <Link
                href="/admin/cargos/novo"
                className="bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition-colors duration-200 shadow-lg text-base group"
            >
                <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-200" /> Novo Cargo
            </Link>
           </div>
        )}
      </div>
    </div>
  );
}