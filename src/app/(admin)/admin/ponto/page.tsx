// src/app/(admin)/admin/ponto/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Clock, AlertTriangle, Calendar as CalendarIcon, User, PlusCircle,
    ChevronDown, Loader2, Edit2, Trash2, X, Save, Download, TrendingUp,
    CheckCircle2, XCircle, AlertCircle, Search, Filter, BarChart3
} from 'lucide-react';

// --- Tipos ---
type FuncionarioOption = { id: string; name: string | null; };
type PontoRegistroApi = {
    id: string; userId: string; userName: string | null; timestamp: string;
    type: 'ENTRADA' | 'SAIDA'; source: 'AUTOMATICO' | 'MANUAL'; justificativa?: string | null;
};
type RegistroProcessadoDia = {
    key: string; userId: string; userName: string; date: string;
    registros: { entrada: string; saida: string; sourceEntrada?: PontoSource; sourceSaida?: PontoSource; idEntrada?: string; idSaida?: string }[];
    totalHoras: string; temBatidaImpar: boolean;
};
enum PontoSource { AUTOMATICO = 'AUTOMATICO', MANUAL = 'MANUAL' }
enum PontoTipo { ENTRADA = 'ENTRADA', SAIDA = 'SAIDA' }

// --- Helpers ---
const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '-';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('pt-BR');
    } catch { return '-'; }
};

const formatTime = (date: Date | string | undefined): string => {
    if (!date) return '-';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch { return '-'; }
};

const processarRegistros = (registros: PontoRegistroApi[], funcionariosList: FuncionarioOption[]): RegistroProcessadoDia[] => {
    const groupedByUserDay: { [key: string]: PontoRegistroApi[] } = {};
    registros.forEach(reg => {
        const timestampDate = new Date(reg.timestamp);
        if (isNaN(timestampDate.getTime())) return;
        const dateKey = formatDate(timestampDate);
        if (dateKey === '-') return;
        const userDateKey = `${reg.userId}-${dateKey}`;
        if (!groupedByUserDay[userDateKey]) {
            groupedByUserDay[userDateKey] = [];
        }
        groupedByUserDay[userDateKey].push(reg);
    });

    const processed: RegistroProcessadoDia[] = [];

    for (const key in groupedByUserDay) {
        const [userId, date] = key.split('-');
        const dailyRegistros = groupedByUserDay[key].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const userInfo = funcionariosList.find(f => f.id === userId);

        let totalMillis = 0;
        const registrosDoDiaFormatados: RegistroProcessadoDia['registros'] = [];
        let lastEntrada: PontoRegistroApi | null = null;
        let temBatidaImpar = false;

        dailyRegistros.forEach(reg => {
            const regType = reg.type.toUpperCase() as PontoTipo;
            const regSource = reg.source.toUpperCase() as PontoSource;

            if (regType === PontoTipo.ENTRADA) {
                if (lastEntrada) {
                    registrosDoDiaFormatados.push({
                        entrada: formatTime(lastEntrada.timestamp), saida: '-',
                        sourceEntrada: lastEntrada.source, idEntrada: lastEntrada.id
                    });
                    temBatidaImpar = true;
                }
                lastEntrada = reg;
            } else if (regType === PontoTipo.SAIDA) {
                if (lastEntrada) {
                    const entradaTime = new Date(lastEntrada.timestamp);
                    const saidaTime = new Date(reg.timestamp);
                    if (saidaTime > entradaTime) { totalMillis += saidaTime.getTime() - entradaTime.getTime(); }
                    registrosDoDiaFormatados.push({
                        entrada: formatTime(entradaTime), saida: formatTime(saidaTime),
                        sourceEntrada: lastEntrada.source, sourceSaida: regSource,
                        idEntrada: lastEntrada.id, idSaida: reg.id
                    });
                    lastEntrada = null;
                } else {
                    registrosDoDiaFormatados.push({
                        entrada: '-', saida: formatTime(reg.timestamp),
                        sourceSaida: regSource, idSaida: reg.id
                    });
                    temBatidaImpar = true;
                }
            }
        });

        if (lastEntrada) {
            registrosDoDiaFormatados.push({
                entrada: formatTime(lastEntrada.timestamp), saida: '-',
                sourceEntrada: lastEntrada.source, idEntrada: lastEntrada.id
            });
            temBatidaImpar = true;
        }

        const totalHours = totalMillis / (1000 * 60 * 60);
        const hours = Math.floor(totalHours);
        const minutes = Math.round((totalHours - hours) * 60);

        processed.push({
            key, userId,
            userName: userInfo?.name || `ID: ${userId.substring(0, 8)}...`,
            date, registros: registrosDoDiaFormatados,
            totalHoras: totalMillis >= 0 ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` : 'Erro',
            temBatidaImpar
        });
    }
    return processed;
};

// --- COMPONENTE MODAL ---
const RegistroManualModal = ({
    isOpen, onClose, onSave, registroParaEditar, funcionarios, isLoadingApi
}: {
    isOpen: boolean; onClose: () => void; onSave: (data: any) => Promise<void>;
    registroParaEditar: PontoRegistroApi | null; funcionarios: FuncionarioOption[]; isLoadingApi: boolean;
}) => {
    const [userId, setUserId] = useState('');
    const [data, setData] = useState('');
    const [hora, setHora] = useState('');
    const [tipo, setTipo] = useState<PontoTipo>(PontoTipo.ENTRADA);
    const [justificativa, setJustificativa] = useState('');
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (registroParaEditar) {
                setUserId(registroParaEditar.userId);
                const ts = new Date(registroParaEditar.timestamp);
                const offset = ts.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(ts.getTime() - offset)).toISOString();
                setData(localISOTime.split('T')[0]);
                setHora(localISOTime.substring(11, 16));
                setTipo(registroParaEditar.type);
                setJustificativa(registroParaEditar.justificativa || '');
                setModalError('');
            } else {
                setUserId(funcionarios.length > 0 ? funcionarios[0].id : '');
                const now = new Date();
                const offset = now.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(now.getTime() - offset)).toISOString();
                setData(localISOTime.split('T')[0]);
                setHora(localISOTime.substring(11, 16));
                setTipo(PontoTipo.ENTRADA);
                setJustificativa('');
                setModalError('');
            }
        }
    }, [registroParaEditar, isOpen, funcionarios]);

    const handleInternalSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError('');
        if (!userId || !data || !hora) {
            setModalError('Funcionário, Data e Hora são obrigatórios.');
            return;
        }
        const timestampLocal = new Date(`${data}T${hora}:00`);
        if (isNaN(timestampLocal.getTime())) {
            setModalError('Data ou Hora inválida.');
            return;
        }
        const timestampISO = timestampLocal.toISOString();

        await onSave({
            ...(registroParaEditar && { id: registroParaEditar.id }),
            userId, timestamp: timestampISO, type: tipo,
            justificativa: justificativa.trim() || null,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-neutral-800 to-neutral-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Clock size={24} />
                        {registroParaEditar ? 'Editar Registro' : 'Novo Registro'}
                    </h2>
                    <button onClick={onClose} disabled={isLoadingApi} className="text-white/80 hover:text-white disabled:opacity-50 p-2 rounded-full hover:bg-white/10 transition-all">
                        <X size={22} />
                    </button>
                </div>
                <form id="registroManualForm" onSubmit={handleInternalSave} className="p-6 space-y-5 overflow-y-auto">
                    {modalError && (
                        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                            <span>{modalError}</span>
                        </div>
                    )}
                    <div>
                        <label htmlFor="modalFuncionario" className="block text-sm font-semibold text-gray-700 mb-2">
                            Funcionário *
                        </label>
                        <select
                            id="modalFuncionario" value={userId} onChange={e => setUserId(e.target.value)} required
                            disabled={isLoadingApi || !!registroParaEditar}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-800 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                        >
                            <option value="" disabled>Selecione...</option>
                            {funcionarios.map(f => (
                                <option key={f.id} value={f.id}>{f.name || `ID: ${f.id.substring(0,8)}...`}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="modalData" className="block text-sm font-semibold text-gray-700 mb-2">Data *</label>
                            <input 
                                type="date" 
                                id="modalData" 
                                value={data} 
                                onChange={e => setData(e.target.value)} 
                                required 
                                disabled={isLoadingApi} 
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-800 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="modalHora" className="block text-sm font-semibold text-gray-700 mb-2">Hora *</label>
                            <input 
                                type="time" 
                                id="modalHora" 
                                value={hora} 
                                onChange={e => setHora(e.target.value)} 
                                required 
                                disabled={isLoadingApi} 
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-800 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="modalTipo" className="block text-sm font-semibold text-gray-700 mb-2">Tipo *</label>
                        <select
                            id="modalTipo" value={tipo} onChange={e => setTipo(e.target.value as PontoTipo)} required disabled={isLoadingApi}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-800 focus:border-transparent transition-all"
                        >
                            <option value={PontoTipo.ENTRADA}>🟢 Entrada</option>
                            <option value={PontoTipo.SAIDA}>🔴 Saída</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="modalJustificativa" className="block text-sm font-semibold text-gray-700 mb-2">Justificativa</label>
                        <textarea
                            id="modalJustificativa" rows={3} value={justificativa} onChange={e => setJustificativa(e.target.value)} disabled={isLoadingApi}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-800 focus:border-transparent resize-none transition-all"
                            placeholder="Ex: Esquecimento, ajuste de horário, sistema fora do ar..."
                        />
                    </div>
                </form>
                <div className="flex justify-end items-center p-6 border-t border-gray-200 bg-gray-50 gap-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isLoadingApi} 
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit" 
                        form="registroManualForm" 
                        disabled={isLoadingApi}
                        className="bg-neutral-800 hover:bg-neutral-900 text-white font-semibold py-2.5 px-6 rounded-lg inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-wait"
                    >
                        {isLoadingApi ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                        {registroParaEditar ? 'Salvar Alterações' : 'Salvar Registro'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function ControlePontoPage() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [registros, setRegistros] = useState<PontoRegistroApi[]>([]);
  const [funcionarios, setFuncionarios] = useState<FuncionarioOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registroParaEditar, setRegistroParaEditar] = useState<PontoRegistroApi | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'userName' | 'totalHoras'>('date');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [isSavingApi, setIsSavingApi] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.append('inicio', dataInicio);
      if (dataFim) params.append('fim', dataFim);
      if (selectedFuncionarioId !== 'all') params.append('userId', selectedFuncionarioId);

      const [registrosRes, funcionariosRes] = await Promise.all([
        fetch(`/api/ponto?${params.toString()}`),
        fetch('/api/funcionarios')
      ]);

      if (!registrosRes.ok || !funcionariosRes.ok) {
        throw new Error('Erro ao carregar dados');
      }

      const registrosData = await registrosRes.json();
      const funcionariosData = await funcionariosRes.json();

      setRegistros(registrosData);
      setFuncionarios(funcionariosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [dataInicio, dataFim, selectedFuncionarioId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const registrosProcessadosEOrdenados = useMemo(() => {
    let processed = processarRegistros(registros, funcionarios);
    
    // Filtro de busca
    if (searchTerm) {
      processed = processed.filter(item => 
        item.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return processed.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        comparison = dateA.getTime() - dateB.getTime();
      } else if (sortBy === 'userName') {
        comparison = a.userName.localeCompare(b.userName);
      } else if (sortBy === 'totalHoras') {
        const [hoursA, minutesA] = a.totalHoras.split(':').map(Number);
        const [hoursB, minutesB] = b.totalHoras.split(':').map(Number);
        const totalA = (hoursA || 0) * 60 + (minutesA || 0);
        const totalB = (hoursB || 0) * 60 + (minutesB || 0);
        comparison = totalA - totalB;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [registros, funcionarios, sortBy, sortDirection, searchTerm]);

  // Estatísticas
  const stats = useMemo(() => {
    const totalRegistros = registrosProcessadosEOrdenados.length;
    const registrosImpares = registrosProcessadosEOrdenados.filter(r => r.temBatidaImpar).length;
    const totalHorasMinutos = registrosProcessadosEOrdenados.reduce((acc, item) => {
      const [h, m] = item.totalHoras.split(':').map(Number);
      return acc + (h || 0) * 60 + (m || 0);
    }, 0);
    const totalHoras = Math.floor(totalHorasMinutos / 60);
    const totalMinutos = totalHorasMinutos % 60;

    return {
      totalRegistros,
      registrosImpares,
      totalHoras: `${totalHoras}h ${totalMinutos}m`,
      registrosManuais: registros.filter(r => r.source === 'MANUAL').length
    };
  }, [registrosProcessadosEOrdenados, registros]);

  const handleSort = (column: 'date' | 'userName' | 'totalHoras') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const abrirModalRegistroManual = (registro?: PontoRegistroApi) => {
    setRegistroParaEditar(registro || null);
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setRegistroParaEditar(null);
  };

  const handleSaveRegistroManual = async (data: any) => {
    setIsSavingApi(true);
    try {
      const method = data.id ? 'PUT' : 'POST';
      const url = data.id ? `/api/ponto/${data.id}` : '/api/ponto';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar registro');
      }

      await fetchData();
      fecharModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar registro');
    } finally {
      setIsSavingApi(false);
    }
  };

  const handleDeleteRegistro = async (registroId: string | undefined) => {
    if (!registroId) return;
    
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    try {
      const response = await fetch(`/api/ponto/${registroId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir registro');
      }

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir registro');
    }
  };

  const exportarCSV = () => {
    const csvContent = [
      ['Funcionário', 'Data', 'Entrada', 'Saída', 'Total Horas', 'Status'].join(','),
      ...registrosProcessadosEOrdenados.flatMap(item =>
        item.registros.map(reg =>
          [
            item.userName,
            item.date,
            reg.entrada,
            reg.saida,
            item.totalHoras,
            item.temBatidaImpar ? 'Incompleto' : 'Completo'
          ].join(',')
        )
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ponto_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header com Título e Botão */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-600 p-3 rounded-xl shadow-lg">
              <Clock size={32} className="text-white" />
            </div>
            Controle de Ponto
          </h1>
          <p className="text-gray-600 mt-2">Gerencie registros de entrada e saída</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportarCSV}
            disabled={isLoading || registrosProcessadosEOrdenados.length === 0}
            className="bg-white border-2 border-neutral-800 text-neutral-800 hover:bg-neutral-800 hover:text-white font-semibold py-2.5 px-5 rounded-lg inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} /> Exportar
          </button>
          <button
            onClick={() => abrirModalRegistroManual()}
            disabled={isLoading}
            className="bg-gradient-to-r from-neutral-800 to-neutral-700 hover:from-neutral-900 hover:to-neutral-800 text-white font-semibold py-2.5 px-5 rounded-lg inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle size={18} /> Registrar Ponto
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Registros</p>
              <p className="text-3xl font-bold mt-1">{stats.totalRegistros}</p>
            </div>
            <BarChart3 size={40} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Horas</p>
              <p className="text-3xl font-bold mt-1">{stats.totalHoras}</p>
            </div>
            <TrendingUp size={40} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Incompletos</p>
              <p className="text-3xl font-bold mt-1">{stats.registrosImpares}</p>
            </div>
            <AlertCircle size={40} className="text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Manuais</p>
              <p className="text-3xl font-bold mt-1">{stats.registrosManuais}</p>
            </div>
            <Edit2 size={40} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-neutral-700" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="dataInicio" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <CalendarIcon size={14}/> Data Início
            </label>
            <input 
              type="date" 
              id="dataInicio" 
              value={dataInicio} 
              onChange={e => setDataInicio(e.target.value)} 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-800 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="dataFim" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <CalendarIcon size={14}/> Data Fim
            </label>
            <input 
              type="date" 
              id="dataFim" 
              value={dataFim} 
              onChange={e => setDataFim(e.target.value)} 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-800 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="funcionario" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <User size={14}/> Funcionário
            </label>
            <select 
              id="funcionario" 
              value={selectedFuncionarioId} 
              onChange={e => setSelectedFuncionarioId(e.target.value)}
              disabled={isLoading || funcionarios.length === 0}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-800 focus:border-transparent disabled:bg-gray-100 transition-all"
            >
              <option value="all">Todos os Funcionários</option>
              {funcionarios.map(f => (
                <option key={f.id} value={f.id}>{f.name || `ID: ${f.id.substring(0,8)}...`}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="searchTerm" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Search size={14}/> Buscar
            </label>
            <input 
              type="text" 
              id="searchTerm" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Nome do funcionário..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-800 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => { 
                setDataInicio(''); 
                setDataFim(''); 
                setSelectedFuncionarioId('all'); 
                setSearchTerm('');
              }} 
              disabled={isLoading}
              className="w-full px-4 py-2 text-sm font-medium text-neutral-700 hover:text-white hover:bg-neutral-800 border border-neutral-300 rounded-lg transition-all disabled:opacity-50"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        {isLoading && (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="animate-spin mb-4 text-neutral-800" size={40} />
            <p className="font-medium text-lg">Carregando registros...</p>
          </div>
        )}
        
        {error && !isLoading && (
          <div className="p-16 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="bg-red-100 p-4 rounded-full mb-4">
              <AlertTriangle className="text-red-600" size={40} />
            </div>
            <p className='font-bold text-xl text-red-700 mb-2'>Erro ao carregar</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchData} 
              className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all shadow-md"
            >
              Tentar Novamente
            </button>
          </div>
        )}
        
        {!isLoading && !error && registrosProcessadosEOrdenados.length === 0 && (
          <div className="p-16 text-center text-gray-500 min-h-[300px] flex flex-col items-center justify-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Clock size={40} className="text-gray-400"/>
            </div>
            <p className="font-bold text-xl text-gray-700 mb-2">Nenhum registro encontrado</p>
            <p className="text-sm text-gray-500">Ajuste os filtros ou registre um novo ponto manualmente.</p>
          </div>
        )}

        {!isLoading && !error && registrosProcessadosEOrdenados.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-neutral-800 to-neutral-700">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-neutral-900/50 transition-colors" 
                    onClick={() => handleSort('userName')}
                  >
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      Funcionário 
                      {sortBy === 'userName' && (
                        <span className="text-yellow-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-neutral-900/50 transition-colors" 
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} />
                      Data 
                      {sortBy === 'date' && (
                        <span className="text-yellow-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      Registros
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-neutral-900/50 transition-colors" 
                    onClick={() => handleSort('totalHoras')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <TrendingUp size={16} />
                      Total Horas 
                      {sortBy === 'totalHoras' && (
                        <span className="text-yellow-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {registrosProcessadosEOrdenados.map((item, idx) => (
                  <tr 
                    key={item.key} 
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      item.temBatidaImpar 
                        ? 'bg-orange-50 hover:bg-orange-100' 
                        : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-neutral-100 p-2 rounded-lg">
                          <User size={18} className="text-neutral-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{item.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-700 font-medium">{item.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.registros.length === 0 && (
                        <span className="text-sm text-gray-400 italic">Sem registros</span>
                      )}
                      {item.registros.map((reg, idx) => (
                        <div key={idx} className="flex items-center gap-2 group relative py-1">
                          <span className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-lg ${
                            reg.entrada === '-' || reg.saida === '-' 
                              ? 'bg-orange-100 text-orange-700 border border-orange-300' 
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                            {reg.entrada} → {reg.saida}
                          </span>
                          {(reg.sourceEntrada === PontoSource.MANUAL || reg.sourceSaida === PontoSource.MANUAL) && (
                            <>
                              <span 
                                title="Registro Manual" 
                                className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full"
                              >
                                M
                              </span>
                              <div className="absolute left-full ml-2 hidden group-hover:flex items-center gap-1 bg-white p-1 rounded-lg shadow-lg border border-gray-200 z-10">
                                <button 
                                  onClick={() => {
                                    const registroCompleto = registros.find(r => r.id === (reg.idEntrada || reg.idSaida));
                                    if (registroCompleto) abrirModalRegistroManual(registroCompleto);
                                  }} 
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all" 
                                  title="Editar"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteRegistro(reg.idEntrada || reg.idSaida)} 
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all" 
                                  title="Excluir"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-lg font-bold tabular-nums ${
                        item.temBatidaImpar || item.totalHoras === 'Erro' 
                          ? 'text-orange-600' 
                          : 'text-green-600'
                      }`}>
                        {item.totalHoras}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {item.temBatidaImpar ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-300">
                          <XCircle size={14} />
                          Incompleto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-300">
                          <CheckCircle2 size={14} />
                          Completo
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <RegistroManualModal
        isOpen={isModalOpen}
        onClose={fecharModal}
        onSave={handleSaveRegistroManual}
        registroParaEditar={registroParaEditar}
        funcionarios={funcionarios}
        isLoadingApi={isSavingApi}
      />

      <style jsx global>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}