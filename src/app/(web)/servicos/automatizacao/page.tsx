// app/servicos/automatizacao/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Ícones específicos para Automatização
import {
  Zap, // Ícone principal
  Clock, TrendingDown, CheckSquare, BrainCircuit, // Ícones Benefícios
  Workflow, Code2, Bot, DatabaseZap, // Ícones Tipos
  Search, DraftingCompass, Settings2, Rocket, LineChart, // Ícones Processo
  CheckCircle // Ícone CTA
} from 'lucide-react';

export default function AutomatizacaoPage() {
  return (
    <main>
      <Header />

      {/* --- SEÇÃO 1: HERO --- */}
      <section className="w-full pt-28 md:pt-40 pb-16 md:pb-24 bg-neutral-900 text-white">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Coluna Esquerda: Texto */}
          <div>
            <span className="text-sm font-semibold uppercase text-neutral-400 tracking-wider mb-2 block">Automatização de Processos</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Faça Mais Com Menos: Libere o Potencial da <span className="text-neutral-300">Sua Equipe</span>
            </h1>
            <p className="text-lg text-neutral-300 mb-8 max-w-xl">
              Elimine tarefas manuais repetitivas, reduza erros e otimize seus fluxos de trabalho
              com soluções de automação personalizadas da Fyzen. Integramos suas ferramentas
              e criamos robôs (RPA) para que sua equipe foque no estratégico.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/orcamento"
                className="bg-white text-neutral-900 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-neutral-200 transition-all text-center"
              >
                Avaliar Minha Automação
              </a>
               <a
                href="#tipos-automacao"
                className="bg-transparent border border-neutral-700 text-neutral-300 font-semibold py-3 px-8 rounded-lg hover:bg-neutral-800 hover:border-neutral-600 transition-all text-center"
              >
                Ver Tipos de Automação
              </a>
            </div>
          </div>
          {/* Coluna Direita: Placeholder */}
          <div className="flex justify-center items-center">
            <div className="w-full aspect-video bg-neutral-800 rounded-lg flex items-center justify-center shadow-lg">
              <Zap size={80} className="text-white opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 2: BENEFÍCIOS --- */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Os Impactos Reais da Automatização no Seu Negócio
             </h2>
             <p className="text-lg text-gray-600">
               Automatizar não é apenas sobre tecnologia, é sobre resultados tangíveis.
             </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
             <div className="text-center">
                <Clock size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Ganho de Tempo Massivo</h4>
                <p className="text-sm text-gray-600">Libere horas preciosas da sua equipe para tarefas de maior valor agregado.</p>
             </div>
              <div className="text-center">
                <TrendingDown size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Redução Drástica de Custos</h4>
                <p className="text-sm text-gray-600">Diminua custos operacionais eliminando trabalho manual e retrabalho.</p>
             </div>
              <div className="text-center">
                <CheckSquare size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Minimização de Erros</h4>
                <p className="text-sm text-gray-600">Garanta consistência e precisão em processos críticos, evitando falhas humanas.</p>
             </div>
              <div className="text-center">
                <BrainCircuit size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Foco no Estratégico</h4>
                <p className="text-sm text-gray-600">Permita que sua equipe se concentre em inovação, análise e crescimento.</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 3: TIPOS DE AUTOMAÇÃO --- */}
      <section id="tipos-automacao" className="w-full py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Como Podemos Automatizar Seus Processos
             </h2>
             <p className="text-lg text-gray-600">
                Soluções flexíveis para diferentes necessidades e complexidades.
             </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card">
              <DatabaseZap size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Integração via APIs</h3>
              <p className="feature-card-description">
                Conectamos suas ferramentas (CRMs, ERPs, etc.) para que conversem entre si automaticamente.
              </p>
            </div>
            <div className="feature-card">
              <Workflow size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Automação de Workflows</h3>
              <p className="feature-card-description">
                Mapeamos e automatizamos fluxos de trabalho complexos com ferramentas No-Code/Low-Code (Zapier, Make).
              </p>
            </div>
             <div className="feature-card">
              <Bot size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Robotic Process Automation (RPA)</h3>
              <p className="feature-card-description">
                Criamos &quot;robôs&quot; de software para executar tarefas repetitivas em sistemas legados ou interfaces.
              </p>
            </div>
            <div className="feature-card">
              <Code2 size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Scripts Personalizados</h3>
              <p className="feature-card-description">
                Desenvolvemos soluções de automação sob medida para desafios específicos e complexos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 4: NOSSO PROCESSO --- */}
      <section className="w-full py-16 md:py-24 bg-white text-black">
         <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Da Análise à Otimização Contínua
               </h2>
               <p className="text-lg text-gray-600">
                  Nossa metodologia garante que a automação traga resultados reais e mensuráveis.
               </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
               <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <Search size={32} className="text-neutral-800 mb-4 mx-auto" />
                  <h4 className="text-xl font-semibold mb-2">1. Análise</h4>
                  <p className="text-sm text-gray-600">Identificamos os processos com maior potencial de automação.</p>
               </div>
               <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <DraftingCompass size={32} className="text-neutral-800 mb-4 mx-auto" />
                  <h4 className="text-xl font-semibold mb-2">2. Mapeamento</h4>
                  <p className="text-sm text-gray-600">Detalhamos o fluxo atual e desenhamos a solução otimizada.</p>
               </div>
               <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <Settings2 size={32} className="text-neutral-800 mb-4 mx-auto" />
                  <h4 className="text-xl font-semibold mb-2">3. Implementação</h4>
                  <p className="text-sm text-gray-600">Configuramos ou desenvolvemos a automação.</p>
               </div>
               <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <Rocket size={32} className="text-neutral-800 mb-4 mx-auto" />
                  <h4 className="text-xl font-semibold mb-2">4. Testes e Go-Live</h4>
                  <p className="text-sm text-gray-600">Validamos e colocamos a automação em produção.</p>
               </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <LineChart size={32} className="text-neutral-800 mb-4 mx-auto" />
                  <h4 className="text-xl font-semibold mb-2">5. Monitoramento</h4>
                  <p className="text-sm text-gray-600">Acompanhamos os resultados e otimizamos.</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- SEÇÃO 5: CTA FINAL --- */}
       <section className="w-full py-20 md:py-28 bg-neutral-900 text-white text-center">
          <div className="container mx-auto max-w-3xl px-4">
             <CheckCircle size={48} className="text-white mb-6 mx-auto" />
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Pronto para Automatizar e Escalar Seu Negócio?
             </h2>
             <p className="text-xl text-neutral-300 mb-10">
                Descubra os processos na sua empresa que podem ser otimizados.
                Agende uma avaliação gratuita com nossos especialistas.
             </p>
             <a
                href="/orcamento"
                className="bg-white text-neutral-900 font-semibold py-4 px-12 rounded-lg shadow-lg hover:bg-neutral-200 transition-all text-lg"
             >
                Solicitar Avaliação Gratuita
             </a>
          </div>
       </section>

      <Footer />
    </main>
  );
}