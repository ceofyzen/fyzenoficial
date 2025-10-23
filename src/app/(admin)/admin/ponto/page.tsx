// src/app/(admin)/admin/ponto/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Clock, AlertTriangle, Filter, Calendar as CalendarIcon, User, PlusCircle,
    ArrowUpDown, ChevronDown, Loader2, Edit2, Trash2, X, Save, // Adicionados X e Save para o modal
} from 'lucide-react';
// Link não está sendo usado no momento, pode remover se não for adicionar links
// import Link from 'next/link';

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
// --- Fim Tipos ---

// --- Helpers ---
const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '-';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('pt-BR'); // DD/MM/YYYY
    } catch { return '-'; }
};
const formatTime = (date: Date | string | undefined): string => {
    if (!date) return '-';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); // HH:MM
    } catch { return '-'; }
};

// Função para agrupar e calcular horas (MAIS DETALHADA)
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
    // Ordenação movida para useMemo
    return processed;
};
// --- Fim Helpers ---

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
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {registroParaEditar ? 'Editar Registro Manual' : 'Registrar Ponto Manualmente'}
                    </h2>
                    <button onClick={onClose} disabled={isLoadingApi} className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
                <form id="registroManualForm" onSubmit={handleInternalSave} className="p-6 space-y-4 overflow-y-auto">
                    {modalError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">{modalError}</p>}
                    <div>
                        <label htmlFor="modalFuncionario" className="block text-sm font-medium text-gray-700 mb-1">Funcionário *</label>
                        <select
                            id="modalFuncionario" value={userId} onChange={e => setUserId(e.target.value)} required
                            disabled={isLoadingApi || !!registroParaEditar}
                            className="input-with-icon pl-3 pr-8 !py-2 bg-white disabled:bg-gray-100/70 disabled:cursor-not-allowed appearance-none"
                        >
                            <option value="" disabled>Selecione...</option>
                            {funcionarios.map(f => (
                                <option key={f.id} value={f.id}>{f.name || `ID: ${f.id.substring(0,8)}...`}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="modalData" className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                            <input type="date" id="modalData" value={data} onChange={e => setData(e.target.value)} required disabled={isLoadingApi} className="input-with-icon pl-3 !py-2"/>
                        </div>
                        <div>
                            <label htmlFor="modalHora" className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
                            <input type="time" id="modalHora" value={hora} onChange={e => setHora(e.target.value)} required disabled={isLoadingApi} className="input-with-icon pl-3 !py-2"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="modalTipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                        <select
                            id="modalTipo" value={tipo} onChange={e => setTipo(e.target.value as PontoTipo)} required disabled={isLoadingApi}
                            className="input-with-icon pl-3 pr-8 !py-2 bg-white appearance-none"
                        >
                            <option value={PontoTipo.ENTRADA}>Entrada</option>
                            <option value={PontoTipo.SAIDA}>Saída</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="modalJustificativa" className="block text-sm font-medium text-gray-700 mb-1">Justificativa</label>
                        <textarea
                            id="modalJustificativa" rows={3} value={justificativa} onChange={e => setJustificativa(e.target.value)} disabled={isLoadingApi}
                            className="input-with-icon pl-3 !py-2 resize-none"
                            placeholder="Ex: Esquecimento, ajuste..."
                        />
                    </div>
                </form>
                <div className="flex justify-end items-center p-4 border-t border-gray-200 bg-gray-50 space-x-3">
                    <button type="button" onClick={onClose} disabled={isLoadingApi} className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded disabled:opacity-50">
                        Cancelar
                    </button>
                    <button
                        type="submit" form="registroManualForm" disabled={isLoadingApi}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-2 px-5 rounded-md text-sm inline-flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-wait"
                    >
                        {isLoadingApi ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
                        {registroParaEditar ? 'Salvar Alterações' : 'Salvar Registro'}
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- *** FIM COMPONENTE MODAL *** ---


export default function ControlePontoPage() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState('all');
  const [registros, setRegistros] = useState<PontoRegistroApi[]>([]);
  const [funcionarios, setFuncionarios] = useState<FuncionarioOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registroParaEditar, setRegistroParaEditar] = useState<PontoRegistroApi | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'userName' | 'totalHoras'>('date');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [isSavingApi, setIsSavingApi] = useState(false);

  const fetchData = useCallback(async () => { /* ... (igual antes) ... */ }, [dataInicio, dataFim, selectedFuncionarioId]);
  useEffect(() => { fetchData(); }, [fetchData]);
  const registrosProcessadosEOrdenados = useMemo(() => { /* ... (igual antes) ... */ }, [registros, funcionarios, sortBy, sortDirection]);
  const handleSort = (column: 'date' | 'userName' | 'totalHoras') => { /* ... (igual antes) ... */ };
  const abrirModalRegistroManual = (registro?: PontoRegistroApi) => { /* ... (igual antes) ... */ };
  const fecharModal = () => { /* ... (igual antes) ... */ };
  const handleSaveRegistroManual = async (data: any) => { /* ... (igual antes) ... */ };
  const handleDeleteRegistro = async (registroId: string | undefined) => { /* ... (igual antes) ... */ };

  return (
    // **** CORREÇÃO PRINCIPAL: Adicionado um container com padding ****
    <div className="space-y-6">

      {/* Cabeçalho da Página: Título e Botão lado a lado */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-3 self-start sm:self-center"> {/* Ajuste alinhamento */}
          <Clock size={28} className="text-neutral-600" /> Controle de Ponto
        </h1>
         <button
            onClick={() => abrirModalRegistroManual()}
            disabled={isLoading}
            className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-2 px-4 rounded-md text-sm inline-flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end sm:self-center" // Ajuste alinhamento
         >
            <PlusCircle size={16} /> Registrar Ponto Manual
         </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* ... (inputs de filtro como antes) ... */}
          <div className="flex flex-col gap-1">
              <label htmlFor="dataInicio" className="text-xs font-medium text-gray-600 flex items-center gap-1"><CalendarIcon size={12}/> De:</label>
              <input type="date" id="dataInicio" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="input-with-icon pl-3 !py-1.5"/>
          </div>
          <div className="flex flex-col gap-1">
              <label htmlFor="dataFim" className="text-xs font-medium text-gray-600 flex items-center gap-1"><CalendarIcon size={12}/> Até:</label>
              <input type="date" id="dataFim" value={dataFim} onChange={e => setDataFim(e.target.value)} className="input-with-icon pl-3 !py-1.5"/>
          </div>
          <div className="flex flex-col gap-1 lg:col-span-1">
              <label htmlFor="funcionario" className="text-xs font-medium text-gray-600 flex items-center gap-1"><User size={12}/> Funcionário:</label>
              <div className="relative">
                 <select id="funcionario" value={selectedFuncionarioId} onChange={e => setSelectedFuncionarioId(e.target.value)}
                   disabled={isLoading || funcionarios.length === 0}
                   className="input-with-icon pl-3 pr-8 !py-1.5 bg-white disabled:bg-gray-100/70 appearance-none w-full"
                  >
                    <option value="all">Todos os Funcionários</option>
                    {funcionarios.length === 0 && !isLoading && <option disabled>Carregando...</option>}
                    {funcionarios.map(f => (<option key={f.id} value={f.id}>{f.name || `ID: ${f.id.substring(0,8)}...`}</option>))}
                 </select>
                 <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
          </div>
          <div className="flex items-end">
              <button onClick={() => { setDataInicio(''); setDataFim(''); setSelectedFuncionarioId('all'); }} disabled={isLoading}
                className="text-xs text-neutral-600 hover:text-neutral-800 underline disabled:text-gray-300 disabled:no-underline disabled:cursor-not-allowed pb-1.5"
                > Limpar Filtros </button>
          </div>
      </div>

       {/* Botão Registrar Manualmente REMOVIDO DAQUI */}

      {/* Tabela de Registros */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
         {/* ... Estados Loading/Error/Vazio (como corrigido antes) ... */}
         {isLoading && ( <div className="p-10 text-center text-gray-500 flex items-center justify-center min-h-[200px]"><Loader2 className="animate-spin mr-3" size={20} /> Carregando...</div> )}
         {error && !isLoading && ( <div className="p-10 text-center text-red-700 bg-red-50 border border-red-200 rounded m-4 flex flex-col items-center justify-center min-h-[200px]"><AlertTriangle className="mb-2" size={24} /><p className='font-semibold'>Erro</p><p className="text-sm mt-1">{error}</p><button onClick={fetchData} className="mt-4 text-xs bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700">Tentar Novamente</button></div> )}
         {!isLoading && !error && registrosProcessadosEOrdenados.length === 0 && ( <div className="p-10 text-center text-gray-500 min-h-[200px] flex flex-col items-center justify-center"><Clock size={32} className="mb-3 text-gray-400"/><p className="font-medium">Nenhum registro</p><p className="text-sm">Ajuste os filtros ou registre manualmente.</p></div> )}

         {!isLoading && !error && registrosProcessadosEOrdenados.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                   {/* ... Cabeçalhos da tabela como antes ... */}
                   <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200/70 transition-colors" onClick={() => handleSort('userName')}> <div className="flex items-center gap-1"> Funcionário {sortBy === 'userName' && (sortDirection === 'asc' ? '▲' : '▼')} </div> </th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200/70 transition-colors" onClick={() => handleSort('date')}> <div className="flex items-center gap-1"> Data {sortBy === 'date' && (sortDirection === 'asc' ? '▲' : '▼')} </div> </th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Registos (Entrada/Saída)</th>
                   <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200/70 transition-colors" onClick={() => handleSort('totalHoras')}> <div className="flex items-center justify-end gap-1"> Total Horas {sortBy === 'totalHoras' && (sortDirection === 'asc' ? '▲' : '▼')} </div> </th>
                   <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {registrosProcessadosEOrdenados.map((item) => (
                  <tr key={item.key} className={`hover:bg-gray-50/70 transition-colors duration-150 ${item.temBatidaImpar ? 'bg-yellow-50/60 hover:bg-yellow-100/60' : ''}`} title={item.temBatidaImpar ? 'Registros ímpares neste dia' : ''}>
                    {/* ... Linhas da tabela como antes ... */}
                    <td className="px-6 py-3 whitespace-nowrap"> <div className="text-sm font-medium text-gray-900">{item.userName}</div> </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">{item.date}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-600">
                      {item.registros.length === 0 && <span className="text-gray-400 italic">Sem registros</span>}
                      {item.registros.map((reg, idx) => (
                          <div key={idx} className="flex items-center gap-1 group relative py-0.5">
                              <span className={`tabular-nums ${reg.entrada === '-' || reg.saida === '-' ? 'text-orange-600 font-medium' : ''}`}> [{reg.entrada} - {reg.saida}] </span>
                              {(reg.sourceEntrada === PontoSource.MANUAL || reg.sourceSaida === PontoSource.MANUAL) && <span title="Registro Manual" className="text-blue-600 font-bold ml-1">*</span> }
                              {(reg.sourceEntrada === PontoSource.MANUAL || reg.sourceSaida === PontoSource.MANUAL) && (
                                  <div className="absolute left-full ml-2 hidden group-hover:flex items-center gap-0.5 bg-white p-0.5 rounded shadow border border-gray-200 z-10">
                                      {/* <button onClick={() => abrirModalRegistroManual(/* TODO * /)} className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded" title="Editar"><Edit2 size={14} /></button> */}
                                      <button onClick={() => handleDeleteRegistro(reg.idEntrada || reg.idSaida)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" title="Excluir"><Trash2 size={14} /></button>
                                  </div>
                              )}
                          </div>
                      ))}
                    </td>
                    <td className={`px-6 py-3 whitespace-nowrap text-right text-sm font-bold tabular-nums ${item.temBatidaImpar || item.totalHoras === 'Erro' ? 'text-orange-600' : 'text-gray-800'}`}>{item.totalHoras}</td>
                     <td className="px-4 py-3 whitespace-nowrap text-center text-sm"> {/* Ações */} </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

       {/* Renderiza o Modal */}
       <RegistroManualModal
           isOpen={isModalOpen}
           onClose={fecharModal}
           onSave={handleSaveRegistroManual}
           registroParaEditar={registroParaEditar}
           funcionarios={funcionarios}
           isLoadingApi={isSavingApi}
       />
    </div>
  );
}