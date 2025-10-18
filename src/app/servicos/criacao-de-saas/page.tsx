// app/servicos/criacao-de-saas/page.tsx
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// Ícones específicos para esta versão
import {
  DollarSign, BarChartBig, Users, Zap, // Ícones de Crescimento/Benefícios
  ClipboardCheck, Rocket, Scaling, LineChart, // Ícones das Fases
  Cloud, DatabaseZap, ShieldCheck, BarChartHorizontalBig, // Ícones de Tecnologia
  LayoutGrid,        // Placeholder
  TrendingUp, // Ícone para CTA
  Lightbulb, // Ícone da Seção 5
  Code // ***** IMPORTAÇÃO CORRIGIDA AQUI *****
} from 'lucide-react';
// import Image from 'next/image'; // Se usar imagens reais

export default function CriacaoDeSaaSPageCrescimento() {
  return (
    <main>
      <Header />

      {/* --- SEÇÃO 1: HERO - FOCO EM CRESCIMENTO EXPONENCIAL --- */}
      <section className="w-full pt-28 md:pt-40 pb-16 md:pb-24 bg-white text-black">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Coluna Esquerda: Texto */}
          <div>
            <span className="text-sm font-semibold uppercase text-gray-500 tracking-wider mb-2 block">SaaS para Crescimento</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transforme Seu Negócio com Receita <span className="text-gray-700">Recorrente e Escalável</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl">
              Crie um Software como Serviço (SaaS) que não apenas resolve problemas, mas
              se torna um motor de crescimento contínuo, gerando receita previsível e
              abrindo novas oportunidades de mercado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/orcamento"
                className="bg-neutral-900 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-neutral-700 transition-all text-center"
              >
                Construir Meu SaaS
              </a>
               <a
                href="#fases"
                className="bg-transparent border border-neutral-300 text-neutral-700 font-semibold py-3 px-8 rounded-lg hover:bg-neutral-100 hover:border-neutral-400 transition-all text-center"
              >
                Ver as Fases
              </a>
            </div>
          </div>
          {/* Coluna Direita: Placeholder Gráfico */}
          <div className="flex justify-center items-center">
            <div className="w-full aspect-video bg-neutral-900 rounded-lg flex items-center justify-center shadow-lg">
              <BarChartBig size={80} className="text-white opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 2: SAAS: SEU MOTOR DE CRESCIMENTO --- */}
      <section className="w-full py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Como um SaaS Fyzen Impulsiona Seu Crescimento
             </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             <div className="text-center">
                <DollarSign size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Receita Recorrente Previsível</h4>
                <p className="text-sm text-gray-600">Modelo de assinatura que garante fluxo de caixa constante e facilita o planejamento financeiro.</p>
             </div>
              <div className="text-center">
                <Users size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Expansão de Mercado Facilitada</h4>
                <p className="text-sm text-gray-600">Alcance clientes globalmente sem barreiras geográficas, adaptando planos e funcionalidades.</p>
             </div>
              <div className="text-center">
                <Zap size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Eficiência Operacional Escalável</h4>
                <p className="text-sm text-gray-600">Automatize processos, reduza custos e atenda a mais clientes sem aumentar a equipe proporcionalmente.</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 3: DO MVP À LIDERANÇA DE MERCADO --- */}
      <section id="fases" className="w-full py-16 md:py-24 bg-white text-black">
         <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Fases Estratégicas para o Sucesso do Seu SaaS
               </h2>
               <p className="text-lg text-gray-600">
                  Acompanhamos você desde a validação inicial até a consolidação no mercado.
               </p>
            </div>
            <div className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="flex justify-center md:justify-end">
                      <div className="bg-neutral-900 rounded-full p-4 inline-block">
                        <ClipboardCheck size={32} className="text-white" />
                      </div>
                  </div>
                  <div className="md:col-span-2">
                     <h4 className="text-2xl font-semibold mb-2">Fase 1: Validação e MVP Rápido</h4>
                     <p className="text-gray-600">Foco em testar sua hipótese central com um Produto Mínimo Viável (MVP) funcional, coletando feedback real e ajustando a rota rapidamente para garantir o product-market fit.</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="flex justify-center md:justify-end">
                      <div className="bg-neutral-900 rounded-full p-4 inline-block">
                        <Rocket size={32} className="text-white" />
                      </div>
                  </div>
                  <div className="md:col-span-2">
                     <h4 className="text-2xl font-semibold mb-2">Fase 2: Tração Inicial e Otimização</h4>
                     <p className="text-gray-600">Com o MVP validado, focamos em adquirir os primeiros usuários (early adopters), otimizar a conversão, a usabilidade e preparar a infraestrutura para o crescimento.</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="flex justify-center md:justify-end">
                      <div className="bg-neutral-900 rounded-full p-4 inline-block">
                        <Scaling size={32} className="text-white" />
                      </div>
                  </div>
                  <div className="md:col-span-2">
                     <h4 className="text-2xl font-semibold mb-2">Fase 3: Escala Sustentável e Evolução</h4>
                     <p className="text-gray-600">Desenvolvimento contínuo de novas features, otimização da performance, expansão da infraestrutura e análise de dados para retenção e crescimento da base de clientes.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- SEÇÃO 4: TECNOLOGIA QUE GARANTE O FUTURO (Cards Escuros) --- */}
      <section className="w-full py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Tecnologia Pensada para o Futuro do Seu SaaS
             </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card">
              <Cloud size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Cloud Escalável</h3>
              <p className="feature-card-description">
                Infraestrutura flexível (AWS/GCP/Azure) que se adapta ao seu crescimento.
              </p>
            </div>
            <div className="feature-card">
              <DatabaseZap size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">APIs Robustas</h3>
              <p className="feature-card-description">
                Integrações facilitadas e possibilidade de ecossistema para seu produto.
              </p>
            </div>
             <div className="feature-card">
              <ShieldCheck size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Segurança por Design</h3>
              <p className="feature-card-description">
                Proteção de dados e conformidade (LGPD, etc.) como prioridade.
              </p>
            </div>
            <div className="feature-card">
              <BarChartHorizontalBig size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Business Intelligence</h3>
              <p className="feature-card-description">
                Coleta e análise de dados para decisões estratégicas sobre produto e negócio.
              </p>
            </div>
          </div>
        </div>
      </section>

       {/* --- SEÇÃO 5: FYZEN: PARCERIA PARA O CRESCIMENTO --- */}
       <section className="w-full py-16 md:py-24 bg-white text-black">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Coluna Esquerda: Placeholder */}
          <div className="flex justify-center items-center">
             <div className="w-full aspect-square bg-neutral-900 rounded-lg flex items-center justify-center shadow-lg">
               <TrendingUp size={80} className="text-white opacity-30" />
             </div>
          </div>
          {/* Coluna Direita: Texto */}
          <div>
            <span className="text-sm font-semibold uppercase text-gray-500 tracking-wider mb-2 block">Seu Parceiro SaaS</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Fyzen: Acelerando Sua Visão SaaS
            </h2>
            <p className="text-lg text-gray-600 mb-6">
               Não construímos apenas software, construímos negócios SaaS. Nossa expertise combina:
            </p>
             <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                    <Lightbulb size={20} className="text-neutral-800 mt-1 flex-shrink-0" />
                    <span><strong className="text-gray-900">Visão de Produto:</strong> Ajudamos a definir e refinar sua proposta de valor.</span>
                </li>
                 <li className="flex items-start gap-3">
                    <Code size={20} className="text-neutral-800 mt-1 flex-shrink-0" />
                    <span><strong className="text-gray-900">Excelência Técnica:</strong> Código limpo, testado e pronto para escalar.</span>
                </li>
                <li className="flex items-start gap-3">
                    <LineChart size={20} className="text-neutral-800 mt-1 flex-shrink-0" />
                    <span><strong className="text-gray-900">Foco em Métricas:</strong> Orientamos o desenvolvimento por dados e KPIs de crescimento.</span>
                </li>
             </ul>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 6: CTA FINAL - FOCO NO CRESCIMENTO --- */}
       <section className="w-full py-20 md:py-28 bg-neutral-900 text-white text-center">
          <div className="container mx-auto max-w-3xl px-4">
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Pronto para Construir Seu Motor de Crescimento?
             </h2>
             <p className="text-xl text-neutral-300 mb-10">
                Vamos transformar sua ideia em um SaaS de sucesso. Agende uma conversa
                e descubra como podemos impulsionar seu negócio.
             </p>
             <a
                href="/orcamento"
                className="bg-white text-neutral-900 font-semibold py-4 px-12 rounded-lg shadow-lg hover:bg-neutral-200 transition-all text-lg"
             >
                Iniciar Meu Projeto SaaS
             </a>
          </div>
       </section>

      <Footer />
    </main>
  );
}