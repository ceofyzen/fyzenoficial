// src/app/(admin)/admin/permissoes/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Loader2, AlertTriangle, ShieldCheck, Save, CheckCircle,
    Building, Briefcase, User as UserIcon, Search, Info
} from 'lucide-react';
import { ModuloEnum, PermissionTargetType } from '@prisma/client';

// --- Tipos Locais ---
type SelectableItem = { id: string; name: string; };
type PermissionData = { [moduleId in ModuloEnum]: boolean };
type TargetData = SelectableItem & {
  permissions: PermissionData;
  inheritedPermissions?: PermissionData;
  departmentName?: string;
  roleName?: string;
};

const allModules = Object.values(ModuloEnum);
// Mapeamento para nomes mais amigáveis (opcional, ajuste conforme necessário)
const moduleLabels: { [key in ModuloEnum]: string } = {
  DIRETORIA: "Diretoria",
  MARKETING: "Marketing",
  OPERACIONAL: "Operacional",
  FINANCEIRO: "Financeiro",
  ADMINISTRATIVO: "Administrativo",
  JURIDICO: "Jurídico",
  RH: "Recursos Humanos",
  SISTEMA: "Sistema",
  PERMISSOES: "Permissões",
};


// --- Componente Principal ---
export default function PermissoesPage() {
  const [activeTab, setActiveTab] = useState<PermissionTargetType>(PermissionTargetType.DEPARTMENT);
  const [departments, setDepartments] = useState<TargetData[]>([]);
  const [roles, setRoles] = useState<TargetData[]>([]);
  const [users, setUsers] = useState<TargetData[]>([]);
  const [allDepartments, setAllDepartments] = useState<SelectableItem[]>([]);
  const [allRoles, setAllRoles] = useState<(SelectableItem & { departmentId?: string })[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Funções fetchData, handlePermissionChange, handleSaveChanges (sem alterações lógicas) ---
  const fetchData = useCallback(async () => {
    // ...(código da função fetchData inalterado)...
     setIsLoading(true);
    setError(null);
    setSaveSuccess(null);
    setSaveError(null);
    try {
      const [deptRes, roleRes, userRes] = await Promise.all([
        fetch('/api/departamentos').then(res => res.ok ? res.json() : Promise.reject(new Error('Falha ao buscar Departamentos'))),
        fetch('/api/cargos').then(res => res.ok ? res.json() : Promise.reject(new Error('Falha ao buscar Cargos'))),
        fetch('/api/users').then(res => res.ok ? res.json() : Promise.reject(new Error('Falha ao buscar Utilizadores')))
      ]);

      const departmentsList: SelectableItem[] = deptRes.map((d: any) => ({ id: d.id, name: d.name }));
      const rolesList: (SelectableItem & { departmentId?: string })[] = roleRes.map((r: any) => ({ id: r.id, name: r.name, departmentId: r.departmentId }));
      setAllDepartments(departmentsList);
      setAllRoles(rolesList);

      const fetchPermissionsForTarget = async (type: PermissionTargetType, id: string): Promise<PermissionData> => {
        const initialPermissions: PermissionData = {} as PermissionData;
        allModules.forEach(m => initialPermissions[m] = false);
        try {
          const res = await fetch(`/api/permissions/${type.toLowerCase()}/${id}`);
          if (res.ok) {
            const allowed: ModuloEnum[] = await res.json();
            allowed.forEach(m => { if (initialPermissions.hasOwnProperty(m)) initialPermissions[m] = true; });
          } else { console.warn(`Erro buscando permissões ${type} ${id}: ${res.status}`); }
        } catch (e) { console.error(`Erro fetch permissões ${type} ${id}:`, e); }
        return initialPermissions;
      };

      const deptDataPromises = departmentsList.map(async (dept) => ({
        id: dept.id,
        name: dept.name,
        permissions: await fetchPermissionsForTarget(PermissionTargetType.DEPARTMENT, dept.id)
      }));
      const resolvedDeptData = await Promise.all(deptDataPromises);
      resolvedDeptData.sort((a,b)=> a.name.localeCompare(b.name));
      setDepartments(resolvedDeptData);

      const roleDataPromises = rolesList.map(async (role) => {
        const deptId = role.departmentId;
        const deptPermissions = deptId ? resolvedDeptData.find(d => d.id === deptId)?.permissions : undefined;
        const deptName = deptId ? departmentsList.find(d => d.id === deptId)?.name : undefined;
        return {
          id: role.id,
          name: role.name,
          departmentName: deptName || 'N/A',
          permissions: await fetchPermissionsForTarget(PermissionTargetType.ROLE, role.id),
          inheritedPermissions: deptPermissions
        };
      });
       const resolvedRoleData = await Promise.all(roleDataPromises);
       resolvedRoleData.sort((a,b)=> a.name.localeCompare(b.name));
       setRoles(resolvedRoleData);

      const filteredUsers = searchTerm
         ? userRes.filter((u: any) => u.name?.toLowerCase().includes(searchTerm.toLowerCase()))
         : userRes;

      // TODO: Ajustar API /api/users para incluir roleId.
      const userDataPromises = filteredUsers.slice(0, 50).map(async (user: any & { roleId?: string }) => {
         const roleId = user.roleId; // Assumindo que a API retorna roleId
         const roleInfo = roleId ? rolesList.find(r => r.id === roleId) : undefined;
         const rolePermissions = roleId ? resolvedRoleData.find(r => r.id === roleId)?.permissions : undefined;
         const deptId = roleInfo?.departmentId;
         const deptPermissions = deptId ? resolvedDeptData.find(d => d.id === deptId)?.permissions : undefined;

         return {
           id: user.id,
           name: user.name || `User ${user.id.substring(0, 6)}`,
           roleName: roleInfo?.name || 'Sem Cargo',
           permissions: await fetchPermissionsForTarget(PermissionTargetType.USER, user.id),
           inheritedPermissions: rolePermissions ?? deptPermissions
         };
       });
       const resolvedUserData = await Promise.all(userDataPromises);
       resolvedUserData.sort((a,b)=> a.name.localeCompare(b.name));
       setUsers(resolvedUserData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
      setDepartments([]); setRoles([]); setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePermissionChange = ( type: PermissionTargetType, targetId: string, module: ModuloEnum, isChecked: boolean ) => {
    // ...(código da função handlePermissionChange inalterado)...
      const setData = type === PermissionTargetType.DEPARTMENT ? setDepartments :
                      type === PermissionTargetType.ROLE ? setRoles : setUsers;

      setData(prevData =>
        prevData.map(item => {
          if (item.id === targetId) {
            const updatedPermissions = { ...item.permissions, [module]: isChecked };
            return { ...item, permissions: updatedPermissions };
          }
          return item;
        })
      );
      if (saveSuccess === targetId) setSaveSuccess(null);
      if (saveError === targetId) setSaveError(null);
  };

  const handleSaveChanges = async (type: PermissionTargetType, targetId: string) => {
    // ...(código da função handleSaveChanges inalterado)...
     const data = type === PermissionTargetType.DEPARTMENT ? departments :
                 type === PermissionTargetType.ROLE ? roles : users;
    const itemToSave = data.find(item => item.id === targetId);
    if (!itemToSave) return;

    setIsSaving(targetId);
    setSaveSuccess(null);
    setSaveError(null);

    const allowedModules = allModules.filter(m => itemToSave.permissions[m] === true);

    try {
      const response = await fetch(`/api/permissions/${type.toLowerCase()}/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules: allowedModules }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      setSaveSuccess(targetId);
      if (type === PermissionTargetType.DEPARTMENT || type === PermissionTargetType.ROLE) {
          setTimeout(fetchData, 300);
      }

    } catch (err) {
      console.error(`Erro ao salvar ${type} ${targetId}:`, err);
      setSaveError(targetId);
    } finally {
      setIsSaving(null);
    }
  };
  // --- Fim das Funções ---


  // --- Componente Reutilizável para a Linha de Permissões (COM ESTILO MODERNO) ---
  const PermissionRow = ({ target, type }: { target: TargetData, type: PermissionTargetType }) => {
    const isItemSaving = isSaving === target.id;
    return (
      <div key={target.id} className="bg-white rounded-lg border border-gray-200/80 shadow-sm overflow-hidden mb-6 transition-shadow hover:shadow-md">
        {/* Cabeçalho do Item */}
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              {/* Ícone baseado no tipo */}
              {type === PermissionTargetType.DEPARTMENT && <Building size={16} className="text-gray-500" />}
              {type === PermissionTargetType.ROLE && <Briefcase size={16} className="text-gray-500" />}
              {type === PermissionTargetType.USER && <UserIcon size={16} className="text-gray-500" />}
              {target.name}
            </h2>
            {/* Informações adicionais (Departamento/Cargo) */}
            {type === PermissionTargetType.ROLE && target.departmentName && <p className="text-xs text-gray-500 pl-6 sm:pl-0">Departamento: {target.departmentName}</p>}
            {type === PermissionTargetType.USER && target.roleName && <p className="text-xs text-gray-500 pl-6 sm:pl-0">Cargo: {target.roleName}</p>}
          </div>
          {/* Botão Salvar e Feedback */}
          <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
             {/* Feedback mais visual */}
             {saveSuccess === target.id && <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle size={14}/> Salvo</span>}
             {saveError === target.id && <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1"><AlertTriangle size={14}/> Erro</span>}
            <button
              onClick={() => handleSaveChanges(type, target.id)}
              disabled={isItemSaving}
              className={`bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold py-2 px-4 rounded-md inline-flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-neutral-500`} // Estilo aprimorado
            >
              {isItemSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              {isItemSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
        {/* Grid de Checkboxes (Layout melhorado) */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
          {allModules
            .map((module) => {
            const isCheckedExplicitly = target.permissions[module];
            const isInherited = !isCheckedExplicitly && target.inheritedPermissions?.[module];
            const isChecked = isCheckedExplicitly || !!isInherited;
            const inheritedFrom = type === PermissionTargetType.ROLE ? 'Departamento' : type === PermissionTargetType.USER ? (target.roleName !== 'Sem Cargo' ? 'Cargo' : 'Departamento') : '';

            return (
              <label
                key={module}
                className={`flex items-center gap-2.5 cursor-pointer p-2 -m-2 rounded group transition-colors
                           ${isItemSaving ? 'opacity-60 cursor-not-allowed' : 'hover:bg-neutral-50'}
                           `}
                title={isInherited && !isCheckedExplicitly ? `Permitido via ${inheritedFrom}` : moduleLabels[module]} // Tooltip mais claro
              >
                {/* Checkbox estilizado */}
                <div className={`relative flex items-center justify-center h-5 w-5 border-2 rounded transition-all duration-150 flex-shrink-0 ${
                    isChecked ? 'bg-neutral-800 border-neutral-800' : 'bg-white border-gray-300 group-hover:border-neutral-400'
                } ${isInherited && !isCheckedExplicitly ? 'border-gray-300 bg-gray-100' : ''}`}>
                    {isChecked && <CheckCircle size={14} className={`absolute text-white ${isInherited && !isCheckedExplicitly ? '!text-gray-400' : '' }`} strokeWidth={3} />}
                     {/* Input real escondido */}
                     <input
                      type="checkbox"
                      className="opacity-0 absolute h-full w-full cursor-pointer disabled:cursor-not-allowed"
                      checked={isChecked}
                      onChange={(e) => handlePermissionChange(type, target.id, module, e.target.checked)}
                      disabled={isItemSaving}
                    />
                </div>

                <span className={`text-sm font-medium select-none ${
                    isInherited && !isCheckedExplicitly ? 'text-gray-400' : 'text-gray-700 group-hover:text-neutral-800'
                }`}>
                  {moduleLabels[module] || module} {/* Usa label amigável */}
                </span>
                {/* Ícone de informação para herdado */}
                {isInherited && !isCheckedExplicitly && (
                    <Info size={12} className="text-gray-400" />
                )}
              </label>
            );
          })}
        </div>
      </div>
    );
  };


  // --- Renderização Principal ---
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 p-3 rounded-xl shadow-lg">
              <ShieldCheck size={32} className="text-white" />
            </div>
          Gerenciar Permissões de Acesso
        </h1>
      </div>

       {/* Exibição de Erro Global */}
       {error && !isLoading && (
         <div className="text-center py-6 text-red-700 bg-red-100 p-4 rounded-lg border border-red-200">
           <AlertTriangle size={20} className="mx-auto mb-2" />
           <p className="font-semibold mb-1">Falha ao carregar ou salvar!</p>
           <p className="text-sm">{error}</p>
           <button onClick={fetchData} className="mt-3 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-medium">
              Tentar Novamente
          </button>
        </div>
      )}

      {/* Tabs (Estilo aprimorado) */}
      <div className="border-b border-gray-200 sticky top-16 bg-gray-50/80 backdrop-blur-sm z-10 py-2 -mx-6 px-6"> {/* Fixo e com fundo */}
         <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
           {(Object.keys(PermissionTargetType) as Array<keyof typeof PermissionTargetType>).map((key) => {
             const type = PermissionTargetType[key];
             const Icon = type === 'DEPARTMENT' ? Building : type === 'ROLE' ? Briefcase : UserIcon;
             return (
               <button
                 key={type}
                 onClick={() => { setActiveTab(type); setSearchTerm(''); setIsLoading(true); /* Mostra loading ao trocar tab */ }}
                 className={`whitespace-nowrap pb-3 pt-1 px-1 border-b-2 font-semibold text-sm flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1 rounded-t-sm ${
                   activeTab === type
                     ? 'border-neutral-700 text-neutral-800' // Tab ativa
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' // Tab inativa
                 }`}
                 aria-current={activeTab === type ? 'page' : undefined}
                 disabled={isLoading}
               >
                 <Icon size={16} strokeWidth={activeTab === type ? 2.5 : 2} />
                 {type === 'DEPARTMENT' ? 'Departamentos' : type === 'ROLE' ? 'Cargos' : 'Utilizadores'}
               </button>
             );
            })}
         </nav>
       </div>

        {/* Loading */}
        {isLoading && (
           <div className="bg-white rounded-xl shadow border border-gray-100 p-10 text-center text-gray-500">
            <Loader2 className="animate-spin text-neutral-600 mx-auto mb-3" size={32} />
            Carregando...
          </div>
        )}

        {/* Conteúdo da Tab Ativa */}
        {!isLoading && !error && (
            <div className="pt-2"> {/* Adiciona um pouco de espaço acima do primeiro card */}
              {/* Tab Departamentos */}
              {activeTab === PermissionTargetType.DEPARTMENT && departments.length === 0 && <p className="text-center text-gray-500 py-6">Nenhum departamento encontrado.</p>}
              {activeTab === PermissionTargetType.DEPARTMENT && departments.map(dept => <PermissionRow key={dept.id} target={dept} type={PermissionTargetType.DEPARTMENT} />)}

              {/* Tab Cargos */}
              {activeTab === PermissionTargetType.ROLE && roles.length === 0 && <p className="text-center text-gray-500 py-6">Nenhum cargo encontrado.</p>}
              {activeTab === PermissionTargetType.ROLE && roles.map(role => <PermissionRow key={role.id} target={role} type={PermissionTargetType.ROLE} />)}

              {/* Tab Utilizadores */}
              {activeTab === PermissionTargetType.USER && (
                <div className="mb-5">
                  <div className="relative max-w-sm">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={16} /></span>
                    <input
                      type="search"
                      placeholder="Buscar utilizador por nome..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 shadow-sm"
                    />
                  </div>
                  {users.length > 0 && <p className="text-xs text-gray-500 mt-1">Exibindo resultados para "{searchTerm}" (limite de 50).</p>}
                </div>
              )}
              {activeTab === PermissionTargetType.USER && users.length === 0 && !searchTerm && (
                  <p className="text-center text-gray-500 py-6 bg-white rounded-lg border border-gray-100 shadow-sm">Use a busca para encontrar utilizadores específicos.</p>
              )}
              {activeTab === PermissionTargetType.USER && users.length === 0 && searchTerm && (
                  <p className="text-center text-gray-500 py-6 bg-white rounded-lg border border-gray-100 shadow-sm">Nenhum utilizador encontrado para "{searchTerm}".</p>
              )}
              {activeTab === PermissionTargetType.USER && users.map(user => <PermissionRow key={user.id} target={user} type={PermissionTargetType.USER} />)}

            </div>
        )}
    </div>
  );
}