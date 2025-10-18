// app/page.tsx
'use client'; 

import Header from './components/Header';
import ScrollToTopButton from './components/ScrollToTopButton';
import AccessibilityButton from './components/AccessibilityButton'; 
import Footer from './components/Footer'; 
import Image from 'next/image'; // 1. IMPORTAR O IMAGE DO NEXT.JS

import { 
  // Nossos Serviços
  MonitorSmartphone, AppWindow, Smartphone, Server, Globe, Zap,
  
  // Novas Seções (do seu arquivo)
  Settings, User, TrendingUp, BarChart, Cpu, Shield, CheckCircle,
  Users, FastForward, Handshake, LayoutGrid
} from 'lucide-react'; 

export default function HomePage() {
  return (
    <main>
      
      <Header />
      <ScrollToTopButton />
      <AccessibilityButton />
      
      {/* --- SEÇÃO 1: HERO (COM IMAGEM OTIMIZADA) --- */}
      <section className="relative flex items-center justify-center min-h-screen text-white overflow-hidden bg-black">
        
        {/* 2. MUDANÇA: 'img' -> 'Image' */}
        <div className="absolute inset-0 z-0 opacity-60"> 
          <Image
            src="/images/globe-bg-static.jpg" // Caminho para sua imagem estática
            alt="Globo digital"
            fill={true} // Faz a imagem preencher o div pai (essencial para fundos)
            priority={true} // Prioriza o carregamento (bom para a imagem do hero)
            style={{ objectFit: 'cover' }} // Equivalente ao 'object-cover' do Tailwind
          />
          {/* O gradiente ainda funciona */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50"></div>
        </div>

        {/* Conteúdo do Hero (Sem mudança) */}
        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Criação de Sites que Geram Resultados
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 font-light max-w-2xl mx-auto mb-10">
            Transformamos sua visão em uma presença digital de impacto. Sites modernos, rápidos e otimizados para converter visitantes em clientes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/portfolio" className="bg-white text-black font-medium py-3 px-8 rounded-lg text-lg hover:bg-gray-200 transition-all duration-200">
              Ver Portfolio
            </a>
            <a href="/orcamento" className="bg-transparent border border-gray-700 text-white font-medium py-3 px-8 rounded-lg text-lg hover:bg-white hover:text-black transition-all duration-200">
              Falar com Especialista
            </a>
          </div>
        </div>
      </section>

      {/* --- O RESTANTE DAS SEÇÕES CONTINUA IGUAL --- */}
      {/* --- SEÇÃO 2: NOSSOS SERVIÇOS --- */}
      <section className="relative z-10 bg-white text-black py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 [background:radial-gradient(circle_at_50%_30%,_theme(colors.gray.100),_transparent_70%)]" />
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Nossos Serviços
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Soluções digitais completas que impulsionam o seu negócio.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative bg-neutral-900 text-white rounded-2xl p-8 border border-neutral-800 transition-all duration-300 hover:border-neutral-700 hover:shadow-[0_0_30px_5px_theme(colors.gray.400/0.2)] hover:-translate-y-2">
              <div className="mb-6"><MonitorSmartphone size={32} className="text-white" /></div>
              <h3 className="text-2xl font-semibold mb-3">Criação de Sites</h3>
              <p className="text-neutral-400">Sites profissionais, rápidos e responsivos.</p>
            </div>
            <div className="relative bg-neutral-900 text-white rounded-2xl p-8 border border-neutral-800 transition-all duration-300 hover:border-neutral-700 hover:shadow-[0_0_30px_5px_theme(colors.gray.400/0.2)] hover:-translate-y-2">
              <div className="mb-6"><AppWindow size={32} className="text-white" /></div>
              <h3 className="text-2xl font-semibold mb-3">Criação de SaaS</h3>
              <p className="text-neutral-400">Software como serviço focado em escalabilidade.</p>
            </div>
            <div className="relative bg-neutral-900 text-white rounded-2xl p-8 border border-neutral-800 transition-all duration-300 hover:border-neutral-700 hover:shadow-[0_0_30px_5px_theme(colors.gray.400/0.2)] hover:-translate-y-2">
              <div className="mb-6"><Smartphone size={32} className="text-white" /></div>
              <h3 className="text-2xl font-semibold mb-3">Criação de APP</h3>
              <p className="text-neutral-400">Aplicativos móveis nativos e híbridos (iOS/Android).</p>
            </div>
            <div className="relative bg-neutral-900 text-white rounded-2xl p-8 border border-neutral-800 transition-all duration-300 hover:border-neutral-700 hover:shadow-[0_0_30px_5px_theme(colors.gray.400/0.2)] hover:-translate-y-2">
              <div className="mb-6"><Server size={32} className="text-white" /></div>
              <h3 className="text-2xl font-semibold mb-3">Hospedagem</h3>
              <p className="text-neutral-400">Infraestrutura de alta velocidade e segurança.</p>
            </div>
            <div className="relative bg-neutral-900 text-white rounded-2xl p-8 border border-neutral-800 transition-all duration-300 hover:border-neutral-700 hover:shadow-[0_0_30px_5px_theme(colors.gray.400/0.2)] hover:-translate-y-2">
              <div className="mb-6"><Globe size={32} className="text-white" /></div>
              <h3 className="text-2xl font-semibold mb-3">Registro de Domínio</h3>
              <p className="text-neutral-400">Encontramos o nome perfeito para seu negócio.</p>
            </div>
            <div className="relative bg-neutral-900 text-white rounded-2xl p-8 border border-neutral-800 transition-all duration-300 hover:border-neutral-700 hover:shadow-[0_0_30px_5px_theme(colors.gray.400/0.2)] hover:-translate-y-2">
              <div className="mb-6"><Zap size={32} className="text-white" /></div>
              <h3 className="text-2xl font-semibold mb-3">Automatização</h3>
              <p className="text-neutral-400">Otimização de processos e integração de sistemas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 3: Web e Mobile --- */}
      <section className="w-full py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <div className="w-[400px] h-[500px] bg-neutral-900 rounded-lg flex items-center justify-center">
              <LayoutGrid size={80} className="text-white opacity-50" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Desenvolvimento de<br />Aplicativos Web e Mobile
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Nossas <strong>soluções personalizadas</strong> unem tecnologia de
              ponta, usabilidade e performance. Criamos produtos intuitivos e
              funcionais para manter seu negócio sempre à frente da concorrência.
            </p>
            <a
              href="#contato"
              className="bg-neutral-900 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-neutral-700 transition-all"
            >
              Entre em contato
            </a>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 4: O que entregamos --- */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            O que entregamos para você:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card">
              <Settings size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Eficiência Operacional</h3>
              <p className="feature-card-description">
                Automatize e otimize processos internos com soluções
                personalizadas que impulsionam a produtividade.
              </p>
            </div>
            <div className="feature-card">
              <User size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Experiência do usuário</h3>
              <p className="feature-card-description">
                Interfaces intuitivas e funcionais que elevam a satisfação,
                engajamento e retenção dos usuários.
              </p>
            </div>
            <div className="feature-card">
              <TrendingUp size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Escalabilidade</h3>
              <p className="feature-card-description">
                Soluções que crescem com o seu negócio, permitindo a adição de
                novas funcionalidades, conforme necessário.
              </p>
            </div>
            <div className="feature-card">
              <BarChart size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Vantagem competitiva</h3>
              <p className="feature-card-description">
                Tecnologia de ponta para manter seu produto inovador,
                diferenciado e sempre à frente no mercado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 5: Software Embarcado --- */}
      <section className="w-full py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Software Embarcado
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Desenvolvemos software embarcado para uma variedade de
                dispositivos, garantindo <strong>performance, segurança e
                eficiência.</strong>
              </p>
              <p className="text-lg text-gray-600">
                Nossa equipe possui vasta experiência em sistemas embarcados,
                desde a concepção até a implementação.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-[500px] h-[350px] bg-neutral-900 rounded-lg flex items-center justify-center">
                <LayoutGrid size={80} className="text-white opacity-50" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card">
              <Cpu size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Alta Performance</h3>
              <p className="feature-card-description">
                Soluções otimizadas para garantir o máximo desempenho dos
                dispositivos.
              </p>
            </div>
            <div className="feature-card">
              <Shield size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Segurança</h3>
              <p className="feature-card-description">
                Implementação de medidas robustas de segurança para proteger
                dados e operações.
              </p>
            </div>
            <div className="feature-card">
              <CheckCircle size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Confiabilidade</h3>
              <p className="feature-card-description">
                Sistemas testados e validados para garantir operação contínua e
                sem falhas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 6: Por que escolher --- */}
      <section className="w-full py-16 md:py-24 bg-neutral-900 text-white">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Por que escolher a{" "}
              <span className="text-gray-100">Fyzen</span>
            </h2>
            <p className="text-lg text-neutral-300">
              Oferecemos mais do que somente desenvolvimento de software. Nossa
              abordagem é <strong>centrada no cliente</strong>, garantindo que
              cada projeto seja único e atenda às suas necessidades
              específicas.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="bg-neutral-800 p-6 rounded-lg flex items-center gap-5 border border-neutral-700">
              <Users size={32} className="text-white flex-shrink-0" />
              <span className="font-semibold">
                Equipe altamente qualificada e experiente
              </span>
            </div>
            <div className="bg-neutral-800 p-6 rounded-lg flex items-center gap-5 border border-neutral-700">
              <FastForward size={32} className="text-white flex-shrink-0" />
              <span className="font-semibold">
                Metodologias ágeis para entrega rápida e eficiente
              </span>
            </div>
            <div className="bg-neutral-800 p-6 rounded-lg flex items-center gap-5 border border-neutral-700">
              <Handshake size={32} className="text-white flex-shrink-0" />
              <span className="font-semibold">
                Proximidade e colaboração constante com o cliente
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO FINAL: FOOTER --- */}
      <Footer />

    </main>
  );
}