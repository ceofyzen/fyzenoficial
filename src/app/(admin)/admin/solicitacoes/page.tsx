// src/app/(admin)/admin/solicitacoes/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    CalendarDays, Loader2, AlertTriangle, CheckCircle, XCircle,
    User, FileText, Clock, Filter, Search, ChevronDown, ListFilter,
    ThumbsUp, // Ícone para Aprovar
    ThumbsDown, // Ícone para Rejeitar
    MessageSquare // Ícone para Justificativa/Observação (opcional)
} from 'lucide-react';
import Link from 'next/link'; // Pode ser útil para links futuros

// --- Tipos (Exemplo - Ajuste conforme seu schema Prisma/API) ---
type SolicitacaoStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO';
type SolicitacaoTipo = 'FERIAS' | 'ATESTADO' | 'LICENCA_NAO_REMUNERADA' | 'OUTRO';

type Solicitacao = {
  id: string;
  userId: string;
  userName: string | null; // Nome do funcionário
  userRole?: string | null; // Cargo do funcionário (opcional)
  tipo: SolicitacaoTipo;
  dataInicio: string; // Ou Date
  dataFim: string; // Ou Date
  justificativa: string | null; // Justificativa do funcionário
  observacaoRh?: string | null; // Observação do RH ao aprovar/rejeitar
  status: SolicitacaoStatus;
  createdAt: string; // Ou Date
  updatedAt?: string | null; // Ou Date | null
};

// Mapeamento para exibição amigável dos tipos
const tipoLabels: { [key in SolicitacaoTipo]: string } = {
  FERIAS: 'Férias',
  ATESTADO: 'Atestado Médico',
  LICENCA_NAO_REMUNERADA: 'Licença Não Remunerada',
  OUTRO: 'Outro',
};

// Mapeamento para badges de status
const statusConfig: { [key in SolicitacaoStatus]: { text: string; icon: React.ElementType; badgeClass: string; } } = {
  PENDENTE: { text: 'Pendente', icon: Clock, badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  APROVADO: { text: 'Aprovado', icon: CheckCircle, badgeClass: 'bg-green-100 text-green-800 border-green-300' },
  REJEITADO: { text: 'Rejeitado', icon: XCircle, badgeClass: 'bg-red-100 text-red-800 border-red-300' },
};
// --- Fim Tipos ---

// --- Componente ---
export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<SolicitacaoStatus | 'TODOS'>('PENDENTE'); // Começa mostrando pendentes
  const [filtroTipo, setFiltroTipo] = useState<SolicitacaoTipo | 'TODOS'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null); // Guarda o ID da solicitação sendo processada

  // Função para buscar dados da API
  const fetchSolicitacoes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // *** ATIVAR A CHAMADA REAL À API ***
      const params = new URLSearchParams();
      if (filtroStatus !== 'TODOS') params.append('status', filtroStatus);
      if (filtroTipo !== 'TODOS') params.append('tipo', filtroTipo);
      if (searchTerm) params.append('search', searchTerm);

      // Descomente estas linhas para fazer a chamada real à API
      const response = await fetch(`/api/solicitacoes?${params.toString()}`);
      if (!response.ok) {
         const errorData = await response.json(); // Tenta pegar a mensagem de erro da API
         throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      const data: Solicitacao[] = await response.json();
      setSolicitacoes(data);
      // *** FIM DA CHAMADA REAL À API ***


      // **** REMOVER OU COMENTAR OS DADOS MOCKADOS ****
      /*
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay
      const mockData: Solicitacao[] = [
        { id: '1', userId: 'user1', userName: 'Alice Silva', userRole: 'Desenvolvedora', tipo: 'FERIAS', dataInicio: '2025-11-10', dataFim: '2025-11-20', justificativa: 'Viagem planejada', status: 'PENDENTE', createdAt: new Date().toISOString() },
        { id: '2', userId: 'user2', userName: 'Bruno Costa', userRole: 'Designer', tipo: 'ATESTADO', dataInicio: '2025-10-22', dataFim: '2025-10-24', justificativa: 'Consulta médica e repouso', status: 'PENDENTE', createdAt: new Date().toISOString() },
        { id: '3', userId: 'user1', userName: 'Alice Silva', userRole: 'Desenvolvedora', tipo: 'FERIAS', dataInicio: '2025-09-01', dataFim: '2025-09-05', justificativa: 'Férias anteriores', status: 'APROVADO', createdAt: new Date().toISOString() },
         { id: '4', userId: 'user3', userName: 'Carlos Pereira', userRole: 'Analista de Marketing', tipo: 'OUTRO', dataInicio: '2025-11-01', dataFim: '2025-11-01', justificativa: 'Resolver assuntos pessoais urgentes.', status: 'PENDENTE', createdAt: new Date().toISOString() },
      ];
       // Aplicar filtros mockados (substituir pela query da API depois)
       let filteredData = mockData;
       if (filtroStatus !== 'TODOS') filteredData = filteredData.filter(s => s.status === filtroStatus);
       if (filtroTipo !== 'TODOS') filteredData = filteredData.filter(s => s.tipo === filtroTipo);
       if (searchTerm) filteredData = filteredData.filter(s => s.userName?.toLowerCase().includes(searchTerm.toLowerCase()));
       setSolicitacoes(filteredData);
       */
      // **** FIM DA REMOÇÃO DOS DADOS MOCKADOS ****

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar.');
      setSolicitacoes([]); // Limpa em caso de erro
    } finally {
      setIsLoading(false);
    }
  }, [filtroStatus, filtroTipo, searchTerm]); // Dependências do useCallback

  // Busca inicial e quando filtros mudam
  useEffect(() => {
    fetchSolicitacoes();
  }, [fetchSolicitacoes]);

  // Funções para aprovar/rejeitar
  const handleAction = async (id: string, newStatus: 'APROVADO' | 'REJEITADO') => {
    setIsProcessing(id); // Indica que esta solicitação está sendo processada
    setError(null);
    try {
      // *** ATIVAR A CHAMADA REAL À API ***
      console.log(`Ação: ${newStatus} para Solicitação ID: ${id}`);
      // Exemplo:
      const response = await fetch(`/api/solicitacoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus /*, observacaoRh: 'Sua observação aqui (opcional)' */ }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ao ${newStatus === 'APROVADO' ? 'aprovar' : 'rejeitar'}`);
      }
      // *** FIM CHAMADA REAL À API ***

      // await new Promise(resolve => setTimeout(resolve, 800)); // Simula delay da API (REMOVER)

      // Atualiza o estado localmente (ou refaz o fetch)
      // setSolicitacoes(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      fetchSolicitacoes(); // Refaz o fetch para pegar o estado atualizado do backend

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar solicitação.');
      alert(`Erro ao ${newStatus === 'APROVADO' ? 'aprovar' : 'rejeitar'}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsProcessing(null); // Libera o processamento
    }
  };


  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {/* DIV COM CLASSES ALTERADAS */}
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 p-3 rounded-xl shadow-lg"> {/* <-- Alterado aqui */}
              <CalendarDays size={32} className="text-white" />
            </div>
          Gerenciar Solicitações
        </h1>
        {/* Futuro botão para funcionário solicitar: <Link href="/solicitar-ausencia">...</Link> */}
      </div>

      {/* Filtros */}
      <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <ListFilter size={20} className="text-neutral-700" />
          <h3 className="text-lg font-semibold text-gray-800">Filtrar Solicitações</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro por Status */}
          <div className='flex flex-col gap-1'>
            <label htmlFor="filtroStatus" className="text-sm font-medium text-gray-600">Status</label>
            <select
              id="filtroStatus"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as SolicitacaoStatus | 'TODOS')}
              disabled={isLoading}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-800 focus:border-transparent transition-all text-sm bg-white"
            >
              <option value="TODOS">Todos</option>
              <option value="PENDENTE">⏳ Pendentes</option>
              <option value="APROVADO">✅ Aprovados</option>
              <option value="REJEITADO">❌ Rejeitados</option>
            </select>
          </div>
          {/* Filtro por Tipo */}
          <div className='flex flex-col gap-1'>
            <label htmlFor="filtroTipo" className="text-sm font-medium text-gray-600">Tipo</label>
            <select
              id="filtroTipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as SolicitacaoTipo | 'TODOS')}
              disabled={isLoading}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-800 focus:border-transparent transition-all text-sm bg-white"
            >
              <option value="TODOS">Todos</option>
              {Object.entries(tipoLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          {/* Busca por Nome */}
          <div className='flex flex-col gap-1 lg:col-span-2'>
             <label htmlFor="searchTerm" className="text-sm font-medium text-gray-600">Funcionário</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={16} /></span>
              <input
                type="search"
                id="searchTerm"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

       {/* Exibição de Erro Global */}
       {error && !isLoading && (
         <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
           <AlertTriangle size={24} className="mx-auto mb-2" />
           <p className="font-semibold">Falha ao carregar dados!</p>
           <p className="text-sm">{error}</p>
           <button onClick={() => fetchSolicitacoes()} className="mt-4 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
              Tentar Novamente
          </button>
        </div>
      )}

      {/* Tabela/Lista de Solicitações */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-neutral-800 to-neutral-700">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Funcionário</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tipo</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Período</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Justificativa</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className='inline-flex items-center gap-2'>
                      <Loader2 className="animate-spin text-neutral-800" size={20} /> Carregando solicitações...
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && !error && solicitacoes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                     <CalendarDays size={32} className="mx-auto mb-3 text-gray-400"/>
                    Nenhuma solicitação encontrada com os filtros atuais.
                  </td>
                </tr>
              )}
              {!isLoading && !error && solicitacoes.map((sol) => {
                 const currentStatusConfig = statusConfig[sol.status];
                 const isItemProcessing = isProcessing === sol.id;
                 return (
                  <tr key={sol.id} className={`hover:bg-gray-50 transition-colors ${isItemProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {/* Placeholder para avatar */}
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold">
                          {sol.userName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{sol.userName || 'Desconhecido'}</div>
                          <div className="text-xs text-gray-500">{sol.userRole || 'Cargo não informado'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{tipoLabels[sol.tipo] || sol.tipo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(sol.dataInicio).toLocaleDateString('pt-BR')} - {new Date(sol.dataFim).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={sol.justificativa || ''}>
                      {sol.justificativa || <span className='italic text-gray-400'>N/A</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentStatusConfig.badgeClass}`}>
                        <currentStatusConfig.icon size={14} />
                        {currentStatusConfig.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {sol.status === 'PENDENTE' ? (
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleAction(sol.id, 'APROVADO')}
                            disabled={isItemProcessing}
                            className="p-2 rounded-md text-green-600 hover:text-green-800 hover:bg-green-100 transition-colors disabled:opacity-50"
                            title="Aprovar"
                          >
                             {isItemProcessing ? <Loader2 className="animate-spin" size={18}/> : <ThumbsUp size={18} />}
                          </button>
                          <button
                            onClick={() => handleAction(sol.id, 'REJEITADO')}
                            disabled={isItemProcessing}
                            className="p-2 rounded-md text-red-600 hover:text-red-800 hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="Rejeitar"
                          >
                             {isItemProcessing ? <Loader2 className="animate-spin" size={18}/> : <ThumbsDown size={18} />}
                          </button>
                          {/* Botão opcional para adicionar observação */}
                          {/* <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Adicionar Observação"><MessageSquare size={18} /></button> */}
                        </div>
                      ) : (
                        <span className='text-xs text-gray-400 italic'>Processado</span>
                      )}
                    </td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}