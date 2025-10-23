// src/app/(admin)/admin/solicitacoes/page.tsx
'use client'; // Necessário se for adicionar interatividade no futuro

import { CalendarDays, AlertTriangle, PlusCircle } from 'lucide-react'; // Importar ícones relevantes
import Link from 'next/link';

export default function SolicitacoesPage() {
  // No futuro, aqui virão estados para buscar dados, filtros, etc.
  // const [solicitacoes, setSolicitacoes] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   // Lógica para buscar as solicitações da API
  // }, []);

  return (
    <div className="pt-0"> {/* Ajuste o padding se necessário, pois o layout já tem */}
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 mb-4 sm:mb-0">
          <CalendarDays size={32} className="text-neutral-900" /> Solicitações e Ausências
        </h1>
        {/* Adicionar botões de ação aqui, como "Nova Solicitação" ou filtros */}
        {/* Exemplo:
        <div className="flex gap-2">
           <Link href="/admin/solicitacoes/nova" className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-2 px-4 rounded-lg text-sm inline-flex items-center gap-1.5">
              <PlusCircle size={16} /> Nova Solicitação
           </Link>
        </div>
        */}
      </div>

      {/* Placeholder para o conteúdo */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 min-h-[300px] flex items-center justify-center text-center text-gray-500">
         <div>
           <AlertTriangle size={40} className="mx-auto mb-4 text-gray-400" />
           <p className="font-semibold text-lg text-gray-700">Página em Construção</p>
           <p className="text-sm mt-1">A funcionalidade de Solicitações (férias, atestados, etc.) será implementada aqui.</p>
           <p className="text-xs mt-2">(Ex: Tabela de solicitações, filtros por tipo/status, botões de aprovação/rejeição, etc.)</p>
        </div>
      </div>
    </div>
  );
}