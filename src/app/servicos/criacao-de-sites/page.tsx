// app/servicos/criacao-de-sites/page.tsx
// Header import removed assuming it's in layout.tsx
import Footer from '@/app/components/Footer';

// MonitorSmartphone removed from imports
import {
  LayoutGrid,
  Rocket, Search, Users as UsersIcon, BarChart3,
  Cpu, Shield, CheckCircle,
  Users, FastForward, Handshake,
  Sparkles, PenTool, Code, Send
} from 'lucide-react';
// import Image from 'next/image';

export default function CriacaoDeSitesPage() {
  return (
    <main>
      {/* <Header /> */}

      {/* --- SEÇÃO 1: HERO --- */}
      <section className="w-full pt-28 md:pt-40 pb-16 md:pb-24 bg-white text-black">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-semibold uppercase text-gray-500 tracking-wider mb-2 block">Criação de Sites Profissionais</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Seu Site é Seu Maior Vendedor Online
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl">
              Na Fyzen, criamos mais do que sites bonitos. Desenvolvemos plataformas digitais
              estratégicas, rápidas e otimizadas para <strong className="text-gray-800">converter visitantes em clientes</strong> e
              impulsionar o crescimento do seu negócio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/orcamento" className="bg-neutral-900 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-neutral-700 transition-all text-center">
                Solicitar Proposta
              </a>
               <a href="/portfolio" className="bg-transparent border border-neutral-300 text-neutral-700 font-semibold py-3 px-8 rounded-lg hover:bg-neutral-100 hover:border-neutral-400 transition-all text-center">
                Ver Projetos
              </a>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="w-full aspect-video bg-neutral-900 rounded-lg flex items-center justify-center shadow-lg">
              <LayoutGrid size={80} className="text-white opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 2: BENEFÍCIOS --- */}
      <section className="w-full py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Transforme Sua Presença Online
             </h2>
             <p className="text-lg text-gray-600">
               Um site desenvolvido pela Fyzen não é apenas um cartão de visitas, é uma ferramenta de crescimento.
             </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card">
              <Search size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Alcance Mais Clientes (SEO)</h3>
              <p className="feature-card-description">
                Otimizado para Google, atraindo tráfego qualificado organicamente.
              </p>
            </div>
            <div className="feature-card">
              <UsersIcon size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Marca Forte e Confiável</h3>
              <p className="feature-card-description">
                Design profissional que passa segurança, autoridade e profissionalismo.
              </p>
            </div>
            <div className="feature-card">
              <Rocket size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Converta Visitantes em Leads</h3>
              <p className="feature-card-description">
                Estrutura e CTAs focados em capturar contatos e gerar oportunidades.
              </p>
            </div>
            <div className="feature-card">
              <BarChart3 size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Experiência Impecável (UX/UI)</h3>
              <p className="feature-card-description">
                Navegação intuitiva e visual atraente em desktops, tablets e celulares.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 3: NOSSO PROCESSO --- */}
      <section className="w-full py-16 md:py-24 bg-white text-black">
         <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Nosso Processo Colaborativo
               </h2>
               <p className="text-lg text-gray-600">
                  Trabalhamos lado a lado com você em cada etapa para garantir um resultado que supere as expectativas.
               </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
               <div className="p-4">
                  <div className="bg-neutral-900 rounded-full p-3 mb-3 inline-block">
                     <Sparkles size={24} className="text-white" />
                  </div>
                  <h4 className="font-semibold mb-1">1. Descoberta</h4>
                  <p className="text-sm text-gray-600">Entendemos seus objetivos e público.</p>
               </div>
               <div className="p-4">
                  <div className="bg-neutral-900 rounded-full p-3 mb-3 inline-block">
                     <PenTool size={24} className="text-white" />
                  </div>
                  <h4 className="font-semibold mb-1">2. Design</h4>
                  <p className="text-sm text-gray-600">Criamos layouts focados em UX e UI.</p>
               </div>
               <div className="p-4">
                  <div className="bg-neutral-900 rounded-full p-3 mb-3 inline-block">
                     <Code size={24} className="text-white" />
                  </div>
                  <h4 className="font-semibold mb-1">3. Desenvolvimento</h4>
                  <p className="text-sm text-gray-600">Codificamos com tecnologias modernas.</p>
               </div>
               <div className="p-4">
                   <div className="bg-neutral-900 rounded-full p-3 mb-3 inline-block">
                     <Send size={24} className="text-white" />
                  </div>
                  <h4 className="font-semibold mb-1">4. Lançamento</h4>
                  <p className="text-sm text-gray-600">Publicamos e acompanhamos seu site.</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- SEÇÃO 4: PERFORMANCE E SEO --- */}
      <section className="w-full py-16 md:py-24 bg-gray-50 text-black">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center items-center">
             <div className="w-full aspect-video bg-neutral-900 rounded-lg flex items-center justify-center shadow-lg">
               <LayoutGrid size={80} className="text-white opacity-30" />
             </div>
          </div>
          <div>
            <span className="text-sm font-semibold uppercase text-gray-500 tracking-wider mb-2 block">Otimização Contínua</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Construído para <br />Performance e Visibilidade
            </h2>
            <p className="text-lg text-gray-600 mb-4">
               Um site lento afasta clientes e prejudica seu ranking no Google. Na Fyzen,
               performance é prioridade. Usamos tecnologias como Next.js e otimizações
               avançadas para garantir <strong className="text-gray-800">carregamento ultra-rápido</strong>.
            </p>
             <p className="text-lg text-gray-600">
               Além disso, implementamos as melhores práticas de SEO desde o início,
               para que seu site seja facilmente encontrado pelos seus clientes ideais.
            </p>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 5: TECNOLOGIA E SEGURANÇA --- */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
           <div className="text-center max-w-3xl mx-auto mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Tecnologia de Ponta e Segurança Robusta
             </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card">
              <Cpu size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Stack Moderno</h3>
              <p className="feature-card-description">
                React/Next.js para interfaces ricas, rápidas e SEO-friendly.
              </p>
            </div>
            <div className="feature-card">
              <Shield size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Segurança Essencial</h3>
              <p className="feature-card-description">
                HTTPS, headers de segurança e proteção contra vulnerabilidades comuns.
              </p>
            </div>
            <div className="feature-card">
              <CheckCircle size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Autonomia com CMS</h3>
              <p className="feature-card-description">
                Gerencie seu conteúdo facilmente com um painel intuitivo (opcional).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 6: DEPOIMENTOS (ASPAS CORRIGIDAS) --- */}
       <section className="w-full py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            O Que Nossos Clientes Dizem
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* CORREÇÃO: " trocado por &quot; */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-left">
              <p className="text-gray-600 italic mb-4">&quot;Placeholder: A Fyzen entregou um site incrível que superou nossas expectativas...&quot;</p>
              <p className="font-semibold text-gray-800">- Nome do Cliente</p>
              <p className="text-sm text-gray-500">Empresa do Cliente</p>
            </div>
             <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-left">
              <p className="text-gray-600 italic mb-4">&quot;Placeholder: O processo foi transparente e o resultado final nos trouxe muitos leads...&quot;</p>
              <p className="font-semibold text-gray-800">- Outro Cliente</p>
              <p className="text-sm text-gray-500">Outra Empresa</p>
            </div>
             <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-left">
              <p className="text-gray-600 italic mb-4">&quot;Placeholder: Recomendamos a Fyzen pela qualidade técnica e atenção aos detalhes...&quot;</p>
              <p className="font-semibold text-gray-800">- Mais um Cliente</p>
              <p className="text-sm text-gray-500">Empresa XYZ</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 7: Por que escolher a Fyzen --- */}
      <section className="w-full py-16 md:py-24 bg-neutral-900 text-white">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Por que escolher a{" "}
              <span className="text-gray-100">Fyzen</span>
            </h2>
            <p className="text-lg text-neutral-300">
              Nossa abordagem é <strong>centrada no cliente</strong>, garantindo que
              cada projeto seja único e atenda às suas necessidades
              específicas.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="bg-neutral-800 p-6 rounded-lg flex items-center gap-5 border border-neutral-700">
              <Users size={32} className="text-white flex-shrink-0" />
              <span className="font-semibold">
                Equipe qualificada e experiente
              </span>
            </div>
            <div className="bg-neutral-800 p-6 rounded-lg flex items-center gap-5 border border-neutral-700">
              <FastForward size={32} className="text-white flex-shrink-0" />
              <span className="font-semibold">
                Metodologias ágeis e entrega eficiente
              </span>
            </div>
            <div className="bg-neutral-800 p-6 rounded-lg flex items-center gap-5 border border-neutral-700">
              <Handshake size={32} className="text-white flex-shrink-0" />
              <span className="font-semibold">
                Colaboração constante com o cliente
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 8: CTA FINAL --- */}
       <section className="w-full py-20 md:py-28 bg-white text-center">
          <div className="container mx-auto max-w-3xl px-4">
             <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Vamos Construir Seu Próximo Site de Sucesso?
             </h2>
             <p className="text-xl text-gray-600 mb-10">
                Entre em contato hoje mesmo para discutir seu projeto e receber uma proposta personalizada, sem compromisso.
             </p>
             <a
                href="/orcamento"
                className="bg-neutral-900 text-white font-semibold py-4 px-12 rounded-lg shadow-lg hover:bg-neutral-700 transition-all text-lg"
             >
                Solicitar Proposta Gratuita
             </a>
          </div>
       </section>

      <Footer />
    </main>
  );
}