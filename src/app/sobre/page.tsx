// app/sobre/page.tsx
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// Ícones para esta versão da página Sobre
import {
  Building2, // Ícone principal
  Lightbulb, Brain, Handshake, // Filosofia
  Search, DraftingCompass, Code, Rocket, // Processo
  Cpu, Zap, ShieldCheck, BarChart3, // Diferencial
  Cog, Database, Cloud,
  Smartphone, // ***** IMPORTAÇÃO CORRIGIDA AQUI *****
  MessageSquare // Ícone CTA
} from 'lucide-react';
// import Image from 'next/image';

export default function SobrePageAlternativa() {
  return (
    <main>
      <Header />

      {/* --- SEÇÃO 1: HERO - FOCO NA PARCERIA E RESULTADOS --- */}
      <section className="w-full pt-28 md:pt-40 pb-16 md:pb-24 bg-neutral-900 text-white">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Coluna Esquerda: Texto */}
          <div>
            <span className="text-sm font-semibold uppercase text-neutral-400 tracking-wider mb-2 block">Sobre a Fyzen</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Seu Parceiro Estratégico em Soluções <span className="text-neutral-300">Digitais</span>
            </h1>
            <p className="text-lg text-neutral-300 mb-8 max-w-xl">
              Na Fyzen, combinamos expertise técnica com uma profunda compreensão de negócios
              para criar softwares e sites que não apenas funcionam, mas impulsionam
              resultados reais e duradouros para nossos clientes.
            </p>
            <a
              href="/portfolio"
              className="bg-white text-neutral-900 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-neutral-200 transition-all text-center"
            >
              Conheça Nossos Projetos
            </a>
          </div>
          {/* Coluna Direita: Placeholder Abstrato */}
          <div className="flex justify-center items-center">
            <div className="w-full aspect-video bg-neutral-800 rounded-lg flex items-center justify-center shadow-lg">
              <Building2 size={80} className="text-white opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 2: NOSSA FILOSOFIA --- */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Nossa Filosofia de Trabalho
             </h2>
             <p className="text-lg text-gray-600">
               Acreditamos que a tecnologia deve servir ao negócio, e não o contrário.
             </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             <div className="text-center md:text-left">
                <Lightbulb size={36} className="text-neutral-800 mb-4 mx-auto md:mx-0" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Entender Antes de Construir</h4>
                <p className="text-sm text-gray-600">Mergulhamos nos seus desafios e objetivos para garantir que a solução proposta seja a mais eficaz.</p>
             </div>
              <div className="text-center md:text-left">
                <Brain size={36} className="text-neutral-800 mb-4 mx-auto md:mx-0" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Tecnologia como Ferramenta</h4>
                <p className="text-sm text-gray-600">Selecionamos as tecnologias certas para o trabalho, focando em performance, escalabilidade e manutenibilidade.</p>
             </div>
              <div className="text-center md:text-left">
                <Handshake size={36} className="text-neutral-800 mb-4 mx-auto md:mx-0" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Parceria e Transparência</h4>
                <p className="text-sm text-gray-600">Trabalhamos em colaboração estreita, com comunicação clara e honesta em todas as etapas.</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 3: COMO TRABALHAMOS (PROCESSO) --- */}
      <section className="w-full py-16 md:py-24 bg-gray-50 text-black">
         <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Nosso Processo Comprovado
               </h2>
               <p className="text-lg text-gray-600">
                  Da concepção ao lançamento e além, seguimos um fluxo estruturado para garantir o sucesso do seu projeto.
               </p>
            </div>
            <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                   <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm relative z-10">
                      <div className="bg-neutral-900 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                      <Search size={28} className="text-neutral-800 mb-3 mx-auto" />
                      <h4 className="font-semibold mb-1">Discovery & Estratégia</h4>
                      <p className="text-xs text-gray-500">Análise de requisitos, mercado e definição do escopo.</p>
                   </div>
                   <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm relative z-10">
                      <div className="bg-neutral-900 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                      <DraftingCompass size={28} className="text-neutral-800 mb-3 mx-auto" />
                      <h4 className="font-semibold mb-1">Design UX/UI</h4>
                      <p className="text-xs text-gray-500">Criação de wireframes, protótipos e interfaces intuitivas.</p>
                   </div>
                   <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm relative z-10">
                      <div className="bg-neutral-900 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                      <Code size={28} className="text-neutral-800 mb-3 mx-auto" />
                      <h4 className="font-semibold mb-1">Desenvolvimento Ágil</h4>
                      <p className="text-xs text-gray-500">Codificação, testes e entregas incrementais.</p>
                   </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm relative z-10">
                      <div className="bg-neutral-900 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
                      <Rocket size={28} className="text-neutral-800 mb-3 mx-auto" />
                      <h4 className="font-semibold mb-1">Lançamento & Suporte</h4>
                      <p className="text-xs text-gray-500">Implantação, monitoramento e suporte contínuo.</p>
                   </div>
                </div>
            </div>
         </div>
      </section>

      {/* --- SEÇÃO 4: O DIFERENCIAL FYZEN (Cards Escuros) --- */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               O Diferencial Fyzen
             </h2>
             <p className="text-lg text-gray-600">
                O que nos destaca na entrega de soluções digitais excepcionais.
             </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card">
              <Cpu size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Expertise Técnica</h3>
              <p className="feature-card-description">
                Equipe sênior proficiente nas tecnologias mais modernas e eficazes.
              </p>
            </div>
            <div className="feature-card">
              <Zap size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Agilidade e Eficiência</h3>
              <p className="feature-card-description">
                Processos otimizados para entregar valor rapidamente, sem burocracia.
              </p>
            </div>
             <div className="feature-card">
              <ShieldCheck size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Foco na Qualidade</h3>
              <p className="feature-card-description">
                Código bem escrito, testado e documentado para garantir longevidade.
              </p>
            </div>
            <div className="feature-card">
              <BarChart3 size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Orientação a Resultados</h3>
              <p className="feature-card-description">
                Nosso sucesso está atrelado ao sucesso e crescimento do seu negócio.
              </p>
            </div>
          </div>
        </div>
      </section>

       {/* --- SEÇÃO 5: TECNOLOGIAS QUE DOMINAMOS --- */}
      <section className="w-full py-16 md:py-24 bg-gray-50 text-black">
         <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Tecnologias que Dominamos
               </h2>
               <p className="text-lg text-gray-600">
                  Utilizamos um stack robusto e moderno para construir suas soluções.
               </p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 text-gray-600">
               <div className='flex items-center gap-2'><Cloud size={20}/> Cloud (AWS, GCP)</div>
               <div className='flex items-center gap-2'><Database size={20}/> Bancos de Dados (SQL/NoSQL)</div>
               <div className='flex items-center gap-2'><Cog size={20}/> Backend (Node.js, Python)</div>
               <div className='flex items-center gap-2'><Code size={20}/> Frontend (React, Next.js, Vue)</div>
               <div className='flex items-center gap-2'><Smartphone size={20}/> Mobile (React Native, Flutter)</div>
            </div>
         </div>
      </section>


      {/* --- SEÇÃO 6: CTA FINAL - FOCO EM PARCERIA --- */}
       <section className="w-full py-20 md:py-28 bg-neutral-900 text-white text-center">
          <div className="container mx-auto max-w-3xl px-4">
             <MessageSquare size={48} className="text-white mb-6 mx-auto opacity-80" />
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Vamos Construir o Futuro do Seu Negócio Juntos?
             </h2>
             <p className="text-xl text-neutral-300 mb-10">
                Estamos prontos para ouvir sobre seus desafios e discutir como a Fyzen
                pode ajudar a alcançar seus objetivos.
             </p>
             <a
                href="/orcamento"
                className="bg-white text-neutral-900 font-semibold py-4 px-12 rounded-lg shadow-lg hover:bg-neutral-200 transition-all text-lg"
             >
                Entre em Contato
             </a>
          </div>
       </section>

      <Footer />
    </main>
  );
}