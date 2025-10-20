// app/(admin)/admin/departamentos/novo/page.tsx
'use client'; 

import { useState, useEffect } from 'react'; // Adicionado useEffect para buscar Enum
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { Building, Save, ArrowLeft } from 'lucide-react';

// --- Tipo e Mapeamento do Enum ---
// Idealmente, viria de um local compartilhado ou API, mas vamos definir aqui por ora
enum ModuloEnum {
  DIRETORIA = "Diretoria",
  MARKETING = "Marketing",
  OPERACIONAL = "Operacional",
  FINANCEIRO = "Financeiro",
  ADMINISTRATIVO = "Administrativo",
  JURIDICO = "Jurídico",
  RH = "Recursos Humanos",
  SISTEMA = "Sistema",
}
// --- Fim do Enum ---

export default function NovoDepartamentoPage() {
  const [nome, setNome] = useState('');
  // Inicia vazio, pois o Enum será carregado ou definido
  const [moduloAcesso, setModuloAcesso] = useState(''); 
  const [descricao, setDescricao] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Define o módulo de acesso padrão após a montagem do componente
  useEffect(() => {
    // Define o primeiro valor do Enum como padrão inicial
    const firstModuleKey = Object.keys(ModuloEnum)[0] as keyof typeof ModuloEnum;
    if (firstModuleKey) {
       setModuloAcesso(firstModuleKey); // Usa a CHAVE (ex: 'DIRETORIA')
    }
  }, []); // Roda apenas uma vez


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!moduloAcesso) {
       setError('Por favor, selecione um módulo de acesso.');
       setIsLoading(false);
       return;
    }

    // --- LÓGICA DE CRIAÇÃO (CONECTADA À API) ---
    console.log("Enviando para API:", { name: nome, accessModule: moduloAcesso, description: descricao });
    
    try {
      const response = await fetch('/api/departamentos', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: nome, 
          // Enviamos a CHAVE do enum (ex: 'MARKETING') para a API
          accessModule: moduloAcesso, 
          description: descricao 
        }), 
      });

      if (!response.ok) {
        // Se a API retornou um erro (4xx ou 5xx)
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      // Sucesso!
      const novoDepartamento = await response.json();
      console.log("Departamento criado via API:", novoDepartamento);
      alert(`Departamento "${novoDepartamento.name}" criado com sucesso!`);
      router.push('/admin/departamentos'); // Volta para a lista
      // O router.refresh() pode ser útil se a página de lista usa Server Components
      // e precisa revalidar os dados. Se for Client Component com fetch,
      // a lista antiga pode aparecer brevemente.
      router.refresh(); 

    } catch (err: any) {
      console.error("Erro ao criar departamento via API:", err);
      setError(`Erro ao criar departamento: ${err.message || 'Erro desconhecido'}. Verifique o console.`);
      // Mantém o loading como false para permitir nova tentativa
    } finally {
       setIsLoading(false); // Garante que o loading termine
    }
    // --- Fim da Lógica de Criação ---
  };

  return (
    <div>
      {/* Cabeçalho (sem alteração) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Building size={28} /> Novo Departamento
        </h1>
        <Link 
          href="/admin/departamentos" 
          className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para Lista
        </Link>
      </div>

      {/* Formulário (sem alteração visual, apenas funcional) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-center text-red-600 bg-red-100 p-2 rounded">{error}</p>}
          
          {/* Campo Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Departamento <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              disabled={isLoading}
              className="input-form"
              placeholder="Ex: Marketing Digital"
            />
          </div>

          {/* Campo Módulo de Acesso */}
          <div>
            <label htmlFor="moduloAcesso" className="block text-sm font-medium text-gray-700 mb-1">
              Módulo Principal de Acesso <span className="text-red-600">*</span>
            </label>
            <select
              id="moduloAcesso"
              value={moduloAcesso} // O valor agora é a CHAVE do enum (ex: 'MARKETING')
              onChange={(e) => setModuloAcesso(e.target.value)}
              required
              disabled={isLoading}
              className="input-form bg-white"
            >
              <option value="" disabled>Selecione um módulo</option>
              {/* Mapeia CHAVE e VALOR do Enum para as opções */}
              {Object.entries(ModuloEnum).map(([key, label]) => (
                <option key={key} value={key}>{label}</option> // value={key} envia a chave
              ))}
            </select>
             <p className="mt-1 text-xs text-gray-500">Define a qual seção principal do sistema este departamento terá acesso.</p>
          </div>

          {/* Campo Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (Opcional)
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              disabled={isLoading}
              className="input-form"
              placeholder="Descreva brevemente o objetivo deste departamento..."
            />
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-neutral-900 hover:bg-neutral-700 text-white font-semibold py-2 px-6 rounded inline-flex items-center gap-2 transition-colors
                          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save size={18} /> {isLoading ? 'Salvando...' : 'Salvar Departamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Estilo helper (pode mover para globals.css)
const InputFormStyle = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
// Aplique className="input-form"