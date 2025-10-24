// src/app/(admin)/admin/cargos/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as LucideIcons from 'lucide-react';
import {
    Briefcase, PlusCircle, Edit, Trash2, Loader2, AlertTriangle, Building,
    ChevronDown, Users, Hash, ShieldCheck, BookOpenText,
    Icon as IconPlaceholder, // Fallback icon
    Layers, // For total cargos stat
    UserCheck // For avg users stat (example)
} from 'lucide-react';

// --- Tipo (Incluindo iconName) ---
type Role = {
  id: string;
  name: string;
  departmentId: string;
  description: string | null;
  isDirector: boolean;
  hierarchyLevel: number;
  iconName?: string | null;
  department: {
    name: string;
  };
   _count?: { // Contagem de usuários
    users: number;
  }
};
// --- Fim do Tipo ---

interface GroupedRoles { [departmentName: string]: Role[]; }

// --- Componente Ícone Dinâmico (sem alterações) ---
const DynamicLucideIcon = ({ name, fallback: Fallback, ...props }: { name: string | null | undefined, fallback: React.ElementType } & LucideIcons.LucideProps) => {
  // @ts-ignore
  const IconComponent = name ? LucideIcons[name] : null;
  if (IconComponent) { return <IconComponent {...props} />; }
  return <Fallback {...props} />;
};
// --- Fim Componente Ícone Dinâmico ---


// --- Componente Skeleton Aprimorado ---
function SkeletonCardV2() {
    return (
      <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100 animate-pulse flex flex-col h-full transition-all duration-300">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0"></div>
          <div className="flex-1 mt-1">
            <div className="h-6 bg-gray-300 rounded w-4/5 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        {/* Description */}
        <div className="space-y-2 mb-4 flex-grow">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-11/12"></div>
        </div>
        {/* Footer */}
        <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-3">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-md bg-gray-200"></div>
            <div className="w-8 h-8 rounded-md bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
}

function SkeletonDepartmentSectionV2() {
    return (
      <div className="mb-8">
        {/* Header da Seção */}
        <div className="px-1 pb-3 mb-4 border-b-2 border-gray-200">
             <div className="h-7 bg-gray-300 rounded w-1/3 animate-pulse"></div>
        </div>
        {/* Grid de Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <SkeletonCardV2 /><SkeletonCardV2 /><SkeletonCardV2 /><SkeletonCardV2 />
        </div>
      </div>
    );
}

// --- Skeleton Stat Card (Reutilizado de Departamentos) ---
function SkeletonStatCard() { /* ... (código do SkeletonStatCard) ... */
    return (
        <div className="bg-gradient-to-br from-gray-200 to-gray-300 p-5 rounded-xl shadow-lg animate-pulse">
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-4 bg-gray-400 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-400 rounded w-12 mt-1"></div>
                </div>
                <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
            </div>
        </div>
    );
}
// --- Fim Skeletons ---

export default function CargosPageV2() {
  const router = useRouter();
  const [cargos, setCargos] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- fetchCargos (sem alterações) ---
  const fetchCargos = async () => { /* ... (código fetchCargos existente) ... */
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

  // --- groupedCargos (sem alterações na lógica, apenas no nome) ---
  const groupedCargos = useMemo(() => { /* ... (código groupedCargos existente) ... */
    if (isLoading || error || !Array.isArray(cargos)) return {}; // Retorna objeto vazio se carregando, erro ou dados inválidos
    try {
        const groups = cargos.reduce((acc, cargo) => {
          const deptName = cargo?.department?.name || 'Sem Departamento';
          if (!acc[deptName]) { acc[deptName] = { roles: [], minLevel: 999 }; }
          acc[deptName].roles.push(cargo);
          const currentLevel = cargo.hierarchyLevel ?? 99;
          if (currentLevel < acc[deptName].minLevel) { acc[deptName].minLevel = currentLevel; }
          return acc;
        }, {} as { [departmentName: string]: { roles: Role[]; minLevel: number } });

        Object.keys(groups).forEach(deptName => {
          groups[deptName].roles.sort((a, b) => {
            const levelA = a.hierarchyLevel ?? 99; const levelB = b.hierarchyLevel ?? 99;
            if (levelA !== levelB) { return levelA - levelB; }
            return a.name.localeCompare(b.name);
          });
        });

        const sortedDepartmentNames = Object.keys(groups).sort((a, b) => {
            const levelDeptA = groups[a].minLevel; const levelDeptB = groups[b].minLevel;
            if (levelDeptA !== levelDeptB) { return levelDeptA - levelDeptB; }
            return a.localeCompare(b);
        });

        const sortedGroupedCargos = sortedDepartmentNames.reduce((acc, deptName) => {
          acc[deptName] = groups[deptName].roles;
          return acc;
        }, {} as GroupedRoles);
        return sortedGroupedCargos;
    } catch (e) { console.error("Erro ao processar groupedCargos:", e); setError("Erro ao organizar os cargos."); return {}; }
  }, [cargos, isLoading, error]);

  // --- Handlers (Editar/Excluir - Atualização Otimista) ---
  const handleEdit = (id: string) => { router.push(`/admin/cargos/editar/${id}`); };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cargo "${name}"? Funcionários vinculados podem impedir a exclusão.`)) { return; }
    setError(null);
    const originalCargos = [...cargos]; // Guarda estado original
    // Otimista: Remove da UI
    setCargos(prev => prev.filter(cargo => cargo.id !== id));

    try {
      const response = await fetch(`/api/cargos/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const d = await response.json();
        setCargos(originalCargos); // Reverte em caso de erro
        throw new Error(d.error || `Erro HTTP: ${response.status}`);
      }
      // Sucesso: UI já está ok
      console.log(`Cargo ${id} excluído com sucesso.`);
      // Opcional: Mostrar uma notificação de sucesso brevemente
    } catch (err: any) {
      console.error("Falha ao excluir cargo:", err);
      // Reverte (já feito no if !response.ok)
      setError(`Erro ao excluir "${name}": ${err.message || 'Erro desconhecido'}`);
      alert(`Erro ao excluir o cargo "${name}": ${err.message || 'Verifique o console.'}`); // Mantém alerta
    }
  };

   // --- Calcular Estatísticas ---
   const totalCargos = useMemo(() => cargos.length, [cargos]);
   const mediaFuncionariosPorCargo = useMemo(() => {
       if (cargos.length === 0) return 0;
       const totalFuncionarios = cargos.reduce((sum, cargo) => sum + (cargo._count?.users ?? 0), 0);
       return (totalFuncionarios / cargos.length).toFixed(1); // Média com 1 decimal
   }, [cargos]);


  return (
    <div className="pt-4 pb-12 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">

      {/* Cabeçalho Aprimorado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-4 sm:px-6 lg:px-8">
         <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-4 mb-4 sm:mb-0">
             <div className="bg-gradient-to-br from-neutral-800 to-neutral-600 p-3 rounded-xl shadow-lg">
               <Briefcase size={32} className="text-white" />
             </div>
           Gestão de Cargos
         </h1>
        <Link
          href="/admin/cargos/novo"
          className="bg-neutral-800 hover:bg-neutral-900 text-white font-semibold py-2.5 px-6 rounded-lg inline-flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
        >
          <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Novo Cargo
        </Link>
      </div>

       {/* Seção de Estatísticas */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 px-4 sm:px-6 lg:px-8">
           {isLoading ? (
               <> <SkeletonStatCard /> <SkeletonStatCard /> </>
           ) : (
                <>
                    {/* Card Total Cargos */}
                    <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 p-5 rounded-xl shadow-xl text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-300 text-sm font-medium uppercase tracking-wider">Total Cargos</p>
                                <p className="text-4xl font-bold mt-1">{totalCargos}</p>
                            </div>
                            <Layers size={36} className="text-neutral-400 opacity-80" />
                        </div>
                    </div>
                     {/* Card Média Funcionários/Cargo */}
                    <div className="bg-gradient-to-br from-teal-600 to-cyan-700 p-5 rounded-xl shadow-xl text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-cyan-200 text-sm font-medium uppercase tracking-wider">Média Func./Cargo</p>
                                <p className="text-4xl font-bold mt-1">{mediaFuncionariosPorCargo}</p>
                            </div>
                            <UserCheck size={36} className="text-cyan-300 opacity-90" />
                        </div>
                    </div>
                    {/* Adicionar mais stats se necessário */}
               </>
            )}
       </div>

      {/* Exibição de Erro Global */}
      {error && !isLoading && (
         <div className="mx-4 sm:mx-6 lg:px-8 text-center py-8 text-red-700 bg-red-50 p-4 rounded-lg border border-red-200 mb-6 shadow-sm animate-fade-in">
           <AlertTriangle size={28} className="mx-auto mb-3 text-red-500" />
           <p className="font-semibold text-lg mb-1">Oops! Falha ao carregar.</p>
           <p className="text-sm mb-4">{error}</p>
           <button onClick={fetchCargos} className="mt-2 px-4 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors">
              Tentar Novamente
          </button>
        </div>
      )}

      {/* Container Principal */}
      <div className="space-y-10 px-4 sm:px-6 lg:px-8"> {/* Aumentado space-y */}
        {/* Estado de Loading */}
        {isLoading && ( <> <SkeletonDepartmentSectionV2 /> <SkeletonDepartmentSectionV2 /> </> )}

        {/* Estado Carregado */}
        {!isLoading && !error && groupedCargos && Object.keys(groupedCargos).length > 0 && (
            Object.entries(groupedCargos).map(([departmentName, rolesInDept]) => (
              <section key={departmentName} className="animate-fade-in"> {/* Animação suave */}
                {/* Cabeçalho Departamento Estilizado */}
                <div className="flex items-center justify-between px-1 pb-3 mb-5 border-b-2 border-neutral-200">
                  <div className="flex items-center gap-3">
                    <Building size={22} className="text-neutral-500" />
                    <h2 className="text-xl font-semibold text-gray-800 tracking-wide">{departmentName}</h2>
                  </div>
                  <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-full border border-neutral-200">
                      {rolesInDept.length} {rolesInDept.length === 1 ? 'Cargo' : 'Cargos'}
                  </span>
                </div>

                {/* Grid de Cards para os Cargos (Novo Design) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {rolesInDept.map((cargo) => (
                    <div
                      key={cargo.id}
                      className="flex flex-col justify-between bg-white p-5 rounded-lg shadow-md hover:shadow-lg border border-gray-100 hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden" // Card base
                    >
                       {/* Efeito de fundo sutil no hover */}
                       <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-0"></div>

                      {/* Conteúdo Principal (relativo para z-index) */}
                      <div className="relative z-10 flex flex-col h-full">
                          {/* Header do Card (Ícone, Nome, Nível, Diretor) */}
                          <div className="flex items-start gap-4 mb-4">
                            {/* Ícone Maior com Fundo */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center shadow bg-gradient-to-br from-neutral-100 to-gray-200 text-neutral-600 group-hover:from-neutral-700 group-hover:to-neutral-800 group-hover:text-white transition-all duration-300`}
                              title={cargo.iconName ? `Ícone: ${cargo.iconName}` : 'Ícone Padrão'}
                            >
                              <DynamicLucideIcon name={cargo.iconName ?? undefined} fallback={Briefcase} size={24} />
                            </div>
                            <div className="flex-1 mt-0.5">
                              {/* Nome do Cargo */}
                              <h3 className="text-base font-bold text-gray-900 leading-tight mb-1 group-hover:text-neutral-800 transition-colors break-words" title={cargo.name}>
                              {cargo.name}
                              </h3>
                              {/* Nível e Badge Diretor */}
                              <div className="flex items-center gap-2 flex-wrap text-xs">
                                  <p className="text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                    <Hash size={12} /> Nível {cargo.hierarchyLevel}
                                  </p>
                                  {cargo.isDirector && (
                                    <div className="bg-yellow-100 text-yellow-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border border-yellow-200">
                                      <ShieldCheck size={12} /> Diretor
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>

                          {/* Descrição */}
                          <div className="mb-4 text-xs text-gray-600 min-h-[30px] line-clamp-2 flex-grow group-hover:text-gray-700 transition-colors" title={cargo.description || ''}>
                              <BookOpenText size={14} className="inline-block mr-1.5 text-gray-400 -mt-0.5" />
                              {cargo.description || <span className="italic text-gray-400">Sem descrição</span>}
                          </div>

                          {/* Footer do Card (Contagem e Botões) */}
                          <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-3">
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium group-hover:text-neutral-700 transition-colors">
                                <Users size={14} />
                                <span>{cargo._count?.users ?? 0} funcionário(s)</span>
                            </div>
                            {/* Botões aparecem no hover do card */}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button onClick={() => handleEdit(cargo.id)} className="text-gray-500 hover:text-neutral-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200" title="Editar Cargo">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => handleDelete(cargo.id, cargo.name)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors duration-200" title="Excluir Cargo">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                      </div> {/* Fim Conteúdo Principal */}
                    </div> // Fim Card Base
                  ))}
                </div>
              </section>
            ))
        )}

        {/* Estado Vazio (Estilo Aprimorado) */}
        {!isLoading && !error && groupedCargos && Object.keys(groupedCargos).length === 0 && (
           <div className="text-center py-20 px-6 text-gray-500 bg-white rounded-xl shadow-md border border-gray-100 mx-auto max-w-lg animate-fade-in">
             <div className="bg-gray-100 p-4 rounded-full inline-block mb-5 border border-gray-200">
                <Briefcase size={48} className="text-gray-400" />
             </div>
             <h3 className="text-xl font-semibold text-gray-800 mb-2">Ainda não há cargos cadastrados</h3>
             <p className="text-base text-gray-600 mb-6">Comece adicionando os cargos da sua empresa.</p>
             <Link
                href="/admin/cargos/novo"
                 className="bg-neutral-800 hover:bg-neutral-900 text-white font-semibold py-2.5 px-6 rounded-lg inline-flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group" // Mesmo estilo do botão do header
            >
                <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Criar Primeiro Cargo
            </Link>
           </div>
        )}
      </div>
       {/* Animação fade-in */}
       <style jsx global>{`
            @keyframes fade-in { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
            .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
       `}</style>
    </div>
  );
}