// app/page.tsx
'use client'; 

import Header from './components/Header';
import ScrollToTopButton from './components/ScrollToTopButton';

// 1. MUDANÇA: Adicionamos MAIS ícones (para a Seção 2 e a nova Seção 3)
import { 
  MonitorSmartphone, // Sites
  AppWindow,         // SaaS
  Smartphone,        // APP
  Server,            // Hospedagem
  Globe,             // Domínio
  Zap,               // Automatização
  Layers,            // Ícone para nova seção (Escalabilidade)
  Award,             // Ícone para nova seção (Qualidade)
  Smile,             // Ícone para nova seção (UX)
  TrendingUp         // Ícone para nova seção (Eficiência)
} from 'lucide-react'; 

export default function HomePage() {
  return (
    // 'main' é o container principal da página
    <main>
      
      <Header />               {/* Nosso header inteligente */}
      <ScrollToTopButton />    {/* Nosso botão de voltar ao topo */}
      
      {/* --- SEÇÃO 1: HERO (FUNDO COM VÍDEO) --- */}
      <section className="relative flex items-center justify-center min-h-screen text-white overflow-hidden bg-black">
        
        {/* Vídeo de Fundo */}
        <div className="absolute inset-0 z-0 opacity-60"> 
          <video
            src="/videos/globe-bg.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50"></div>
        </div>

        {/* Conteúdo do Hero */}
        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Criação de Sites que Geram Resultados
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 font-light max-w-2xl mx-auto mb-10">
            Transformamos sua visão em uma presença digital de impacto. Sites modernos, rápidos e otimizados para converter visitantes em clientes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/portfolio" 
              className="bg-white text-black font-medium py-3 px-8 rounded-lg text-lg hover:bg-gray-200 transition-all duration-200"
            >
              Ver Portfolio
            </a>
            <a 
              href="/orcamento" 
              className="bg-transparent border border-gray-700 text-white font-medium py-3 px-8 rounded-lg text-lg hover:bg-white hover:text-black transition-all duration-200"
            >
              Falar com Especialista
            </a>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 2: NOSSOS SERVIÇOS (COM 6 CARDS) --- */}
      <section className="relative z-10 bg-white text-black py-20 sm:py-24 overflow-hidden">
        
        {/* O "GLOW" DE FUNDO (Sutil) */}
        <div className="absolute inset-0 -z-10 [background:radial-gradient(circle_at_50%_30%,_theme(colors.gray.100),_transparent_70%)]" />

        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* TÍTULO */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Nossos Serviços
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Vamos além do básico. Criamos soluções digitais completas que impulsionam o seu negócio.
            </p>
          </div>

          {/* Grid com 6 CARDS */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Card 1: Criação de Sites */}
            <div className="relative bg-neutral-900 text-white rounded-2xl p-8
                            border border-neutral-800 transition-all duration-300
                            hover:border-neutral-700 hover:shadow-[0_0_30px_5px_theme(colors.gray.400_0.2)]
                            hover:-translate-y-2">
              <div className="mb-6"><MonitorSmartphone size={32} className="text-white" /></div>
              <h3 className="text-2xl font-semibold mb-3">Criação de Sites</h3>
              <p className="text-neutral-400">Apresente sua empresa ao mundo com um site profissional, rápido e responsivo.</p>
            </div>

            {/* Card 2: Criação de SaaS */}
            <div className="relative bg-neutral-900 text-white rounded-2xl p-8
                            border border-neutral-800 transition-all duration-300
                            hover:border-neutral-700 hover:shadow-[0_0_30px_5px_theme(colors.gray.400_0.2)]
                            hover:-translate-y-2">
              <div className="mb-6"><AppWindow size={32} className="text-white" /></div>
              <h3 className="text-2xl font-semibold mb-3">Criação de SaaS</h3>
              <p className="text-neutral-400">Desenvolvemos seu software como serviço do zero, focado em escalabilidade e performance.</p>
            </div>

            {/* Card 3: Criação de APP */}
            <div className="relative bg-neutral-900 text-white rounded-2xl p-8
                            border border-neutral-800 transition-all duration-300
                            hover:border-neutral-700 hover:shadow-[0_0_30px_5px_theme(colors.gray.400_0.2)]
                            hover:-translate-y-2">
              <div className="mb-6"><Smartphone size={32} className="text-white" /></div>
              <h3 className="text-2xl font-semibold mb-3">Criação de APP</h3>
              <p className="text-neutral-400">Aplicativos móveis nativos e híbridos para iOS e Android, feitos para engajar seus usuários.</p>
            </div>

            {/* Card 4: Hospedagem de Sites */}
            <div className="relative bg-neutral-900 text-white rounded-2xl p-8
                            border border-neutral-800 transition-all duration-300
                            hover:border-neutral-700 hover:shadow-[0_0_30px_5px_theme(colors.gray.400_0.2)]
                            hover:-translate-y-2">
              <div className="mb-6"><Server size={32} className="text-white" /></div>
              <h3 className="text-2xl font-semibold mb-3">Hospedagem de Sites</h3>
              <p className="text-neutral-400">Infraestrutura de alta velocidade e segurança para garantir que seu site esteja sempre online.</p>
            </div>

            {/* Card 5: Registro de Domínio */}
            <div className="relative bg-neutral-900 text-white rounded-2xl p-8
                            border border-neutral-800 transition-all duration-300
                            hover:border-neutral-700 hover:shadow-[0_0_30px_5px_theme(colors.gray.400_0.2)]
                            hover:-translate-y-2">
              <div className="mb-6"><Globe size={32} className="text-white" /></div>
              <h3 className="text-2xl font-semibold mb-3">Registro de Domínio</h3>
              <p className="text-neutral-400">Encontramos e registramos o nome perfeito para seu novo projeto ou negócio.</p>
            </div>

            {/* Card 6: Automatização */}
            <div className="relative bg-neutral-900 text-white rounded-2xl p-8
                            border border-neutral-800 transition-all duration-300
                            hover:border-neutral-700 hover:shadow-[0_0_30px_5px_theme(colors.gray.400_0.2)]
                            hover:-translate-y-2">
              <div className="mb-6"><Zap size={32} className="text-white" /></div>
              <h3 className="text-2xl font-semibold mb-3">Automatização</h3>
              <p className="text-neutral-400">Otimizamos seus processos com automação de tarefas e integração de sistemas (APIs).</p>
            </div>

          </div>
        </div>
      </section>

      {/* --- SEÇÃO 3: NOSSOS DIFERENCIAIS (Inspirada no site da Venturus) --- */}
      {/* Esta é a nova seção */}
      <section className="relative z-10 bg-gray-50 text-black py-20 sm:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Grid de 2 Colunas */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Coluna 1: Título e Texto */}
            <div className="pr-8">
              <span className="text-sm font-semibold uppercase text-blue-600">Por que escolher a Fyzen?</span>
              <h2 className="text-4xl sm:text-5xl font-bold my-4 text-gray-900">
                O que entregamos para você
              </h2>
              <p className="text-lg text-gray-600 max-w-xl">
                Mais do que software, entregamos soluções que geram valor real. Nossa abordagem é focada no seu resultado, garantindo que cada projeto seja único e atenda às suas necessidades.
              </p>
            </div>

            {/* Coluna 2: Lista de Diferenciais */}
            <div className="grid sm:grid-cols-2 gap-8">
              
              {/* Diferencial 1 */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <TrendingUp size={32} className="text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Eficiência Operacional</h4>
                <p className="text-gray-600 text-sm">Otimizamos processos com soluções personalizadas que impulsionam a produtividade.</p>
              </div>

              {/* Diferencial 2 */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <Smile size={32} className="text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Experiência do Usuário</h4>
                <p className="text-gray-600 text-sm">Interfaces intuitivas e funcionais que elevam a satisfação e engajamento.</p>
              </div>

              {/* Diferencial 3 */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <Layers size={32} className="text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Escalabilidade</h4>
                <p className="text-gray-600 text-sm">Soluções que crescem com o seu negócio, prontas para o futuro.</p>
              </div>

              {/* Diferencial 4 */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <Award size={32} className="text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Vantagem Competitiva</h4>
                <p className="text-gray-600 text-sm">Tecnologia de ponta para manter seu produto inovador e à frente no mercado.</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 4: FOOTER (Exemplo) --- */}
      {/* Você pode adicionar seu footer aqui */}
      <footer className="bg-neutral-900 text-neutral-400 py-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Fyzen. Todos os direitos reservados.</p>
        </div>
      </footer>

    </main>
  );
}