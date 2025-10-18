// app/servicos/criacao-de-app/page.tsx
import Header from '@/app/components/Header'; 
import Footer from '@/app/components/Footer';

// Ícones específicos para esta página de App
import { 
  Smartphone, // Ícone principal
  Heart, Zap, Gem, // Ícones de Benefícios
  Apple, Bot, // Ícones Nativo/Híbrido
  Lightbulb, PenTool, Code, Rocket, // Ícones do Processo
  Database, Cloud, BarChart, // Ícones de Tecnologia
  MessageSquare // Ícone para CTA
} from 'lucide-react'; 

export default function CriacaoDeAppPage() {
  return (
    <main>
      <Header />

      {/* --- SEÇÃO 1: HERO - FOCO EM EXPERIÊNCIA E ENGAJAMENTO --- */}
      <section className="w-full pt-28 md:pt-40 pb-16 md:pb-24 bg-neutral-900 text-white"> 
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Coluna Esquerda: Texto */}
          <div>
            <span className="text-sm font-semibold uppercase text-neutral-400 tracking-wider mb-2 block">Desenvolvimento de Aplicativos</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Crie uma Conexão Direta com Seus Clientes
            </h1>
            <p className="text-lg text-neutral-300 mb-8 max-w-xl">
              Transformamos sua ideia em um aplicativo móvel intuitivo e de alta performance para iOS e Android, 
              projetado para engajar, fidelizar e fortalecer sua marca na palma da mão do seu público.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/orcamento" 
                className="bg-white text-neutral-900 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-neutral-200 transition-all text-center"
              >
                Transformar Ideia em App
              </a>
               <a
                href="#processo" 
                className="bg-transparent border border-neutral-700 text-neutral-300 font-semibold py-3 px-8 rounded-lg hover:bg-neutral-800 hover:border-neutral-600 transition-all text-center"
              >
                Nosso Processo
              </a>
            </div>
          </div>
          {/* Coluna Direita: Placeholder de App */}
          <div className="flex justify-center items-center">
            {/* SUGESTÃO: Use uma imagem de um celular com uma UI de app atraente */}
            <div className="w-72 h-[36rem] bg-neutral-800 rounded-3xl flex items-center justify-center shadow-2xl p-4 border border-neutral-700">
              <div className="w-full h-full border-2 border-neutral-700 rounded-2xl flex items-center justify-center">
                <Smartphone size={80} className="text-white opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 2: POR QUE UM APP É ESSENCIAL? --- */}
      <section className="w-full py-16 md:py-24 bg-white"> 
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Seu Negócio na Mão do Cliente, 24/7
             </h2>
             <p className="text-lg text-gray-600">
               Um aplicativo vai além de um site, criando um canal de comunicação e serviço direto e poderoso.
             </p>
          </div>
          {/* Layout de Ícones + Título + Descrição (3 colunas) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             {/* Item 1 */}
             <div className="text-center">
                <Heart size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Fidelização e Engajamento</h4>
                <p className="text-sm text-gray-600">Crie uma experiência personalizada, envie notificações push e mantenha sua marca sempre presente.</p>
             </div>
             {/* Item 2 */}
              <div className="text-center">
                <Zap size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Performance Superior</h4>
                <p className="text-sm text-gray-600">Aproveite ao máximo os recursos do dispositivo para oferecer uma experiência rápida e fluida.</p>
             </div>
             {/* Item 3 */}
              <div className="text-center">
                <Gem size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Inovação e Vantagem</h4>
                <p className="text-sm text-gray-600">Ofereça funcionalidades exclusivas, como geolocalização e câmera, que não são possíveis em um site.</p>
             </div>
          </div>
        </div>
      </section>
      
      {/* --- SEÇÃO 3: NOSSA EXPERTISE: IOS & ANDROID (Cards Escuros) --- */}
      <section className="w-full py-16 md:py-24 bg-gray-50"> 
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               A Tecnologia Certa para Sua Necessidade
             </h2>
             <p className="text-lg text-gray-600">
                Desenvolvemos para iOS e Android, escolhendo a abordagem ideal para seu projeto e orçamento.
             </p>
          </div>
          {/* Cards Escuros '.feature-card' em 2 colunas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="feature-card">
              <Apple size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Desenvolvimento Nativo</h3>
              <p className="feature-card-description">
                Máxima performance e acesso total aos recursos do sistema (iOS com Swift, Android com Kotlin). Ideal para apps que exigem alto desempenho.
              </p>
            </div>
            <div className="feature-card">
              <Bot size={36} className="feature-card-icon" /> 
              <h3 className="feature-card-title">Desenvolvimento Híbrido</h3>
              <p className="feature-card-description">
                Código único para ambas as plataformas (React Native, Flutter). Ótimo custo-benefício e agilidade para a maioria dos casos de uso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 4: DO CONCEITO À APP STORE --- */}
      <section id="processo" className="w-full py-16 md:py-24 bg-white text-black">
         <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Nossa Metodologia de Desenvolvimento de Apps
               </h2>
               <p className="text-lg text-gray-600">
                  Um processo transparente e colaborativo para transformar sua visão em um aplicativo de sucesso.
               </p>
            </div>
            {/* Steps em formato de cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <Lightbulb size={32} className="text-neutral-800 mb-4 mx-auto" />
                  <h4 className="text-xl font-semibold mb-2">1. Estratégia e UX</h4>
                  <p className="text-sm text-gray-600">Definição de escopo, fluxos de usuário e wireframes.</p>
               </div>
               <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <PenTool size={32} className="text-neutral-800 mb-4 mx-auto" />
                  <h4 className="text-xl font-semibold mb-2">2. Design UI</h4>
                  <p className="text-sm text-gray-600">Criação de interfaces visualmente atraentes e intuitivas.</p>
               </div>
               <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <Code size={32} className="text-neutral-800 mb-4 mx-auto" />
                  <h4 className="text-xl font-semibold mb-2">3. Desenvolvimento</h4>
                  <p className="text-sm text-gray-600">Codificação ágil, testes contínuos e garantia de qualidade.</p>
               </div>
               <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <Rocket size={32} className="text-neutral-800 mb-4 mx-auto" />
                  <h4 className="text-xl font-semibold mb-2">4. Lançamento</h4>
                  <p className="text-sm text-gray-600">Publicação nas lojas (App Store e Google Play) e suporte.</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- SEÇÃO 5: TECNOLOGIAS E FERRAMENTAS --- */}
      <section className="w-full py-16 md:py-24 bg-gray-50"> 
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Tecnologias que Impulsionam Nossos Apps
             </h2>
          </div>
          {/* Cards Escuros '.feature-card' */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card">
              <Smartphone size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Frontend Mobile</h3>
              <p className="feature-card-description">
                React Native, Flutter, Swift (iOS) e Kotlin (Android).
              </p>
            </div>
            <div className="feature-card">
              <Database size={36} className="feature-card-icon" /> 
              <h3 className="feature-card-title">Backend e APIs</h3>
              <p className="feature-card-description">
                Node.js, Python, e Go para APIs REST/GraphQL robustas e escaláveis.
              </p>
            </div>
             <div className="feature-card">
              <Cloud size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Infraestrutura Cloud</h3>
              <p className="feature-card-description">
                Firebase, AWS Amplify e serviços cloud para autenticação, banco de dados e mais.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* --- SEÇÃO 6: CTA FINAL --- */}
       <section className="w-full py-20 md:py-28 bg-neutral-900 text-white text-center">
          <div className="container mx-auto max-w-3xl px-4">
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Pronto para Lançar Seu App?
             </h2>
             <p className="text-xl text-neutral-300 mb-10">
                Vamos transformar sua ideia em um aplicativo de sucesso. 
                Fale com nossos especialistas e comece hoje mesmo.
             </p>
             <a
                href="/orcamento" 
                className="bg-white text-neutral-900 font-semibold py-4 px-12 rounded-lg shadow-lg hover:bg-neutral-200 transition-all text-lg"
             >
                Iniciar Meu Projeto de App
             </a>
          </div>
       </section>

      <Footer />
    </main>
  );
}