// app/servicos/dominio/page.tsx
import Header from '@/components/Header'; 
import Footer from '@/components/Footer';

// Ícones específicos para Domínio
import { 
  Globe, // Ícone principal
  Search, CheckSquare, Shield, LifeBuoy, Dna, // Ícones Features
  Building, Fingerprint, Route, // Ícones Importância
  ArrowRightLeft, // Ícone Transferência
  SearchCheck // Ícone CTA
} from 'lucide-react'; 

export default function DominioPage() {
  return (
    <main>
      <Header />

      {/* --- SEÇÃO 1: HERO - FOCO NA IDENTIDADE ONLINE --- */}
      <section className="w-full pt-28 md:pt-40 pb-16 md:pb-24 bg-white text-black"> 
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Coluna Esquerda: Texto */}
          <div>
            <span className="text-sm font-semibold uppercase text-gray-500 tracking-wider mb-2 block">Registro de Domínio</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Seu Endereço Exclusivo na <span className="text-gray-700">Internet</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl">
              Garanta o nome perfeito para sua marca ou projeto online. Na Fyzen, 
              o registro do seu domínio é simples, rápido e seguro, com todas as 
              ferramentas que você precisa para gerenciar sua identidade digital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#search-domain" // Link para uma futura seção de busca?
                className="bg-neutral-900 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-neutral-700 transition-all text-center"
              >
                Buscar Meu Domínio
              </a>
               <a
                href="#features-domain" 
                className="bg-transparent border border-neutral-300 text-neutral-700 font-semibold py-3 px-8 rounded-lg hover:bg-neutral-100 hover:border-neutral-400 transition-all text-center"
              >
                Ver Recursos
              </a>
            </div>
          </div>
          {/* Coluna Direita: Placeholder Abstrato */}
          <div className="flex justify-center items-center">
            {/* SUGESTÃO: Use uma imagem abstrata de um globo com uma barra de endereço */}
            <div className="w-full aspect-video bg-neutral-900 rounded-lg flex items-center justify-center shadow-lg">
              <Globe size={80} className="text-white opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 2: POR QUE SEU DOMÍNIO É SUA IDENTIDADE DIGITAL? --- */}
      <section className="w-full py-16 md:py-24 bg-gray-50"> 
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Mais que um Endereço, Sua Marca Online
             </h2>
             <p className="text-lg text-gray-600">
               Um bom nome de domínio é fundamental para o sucesso do seu projeto na web.
             </p>
          </div>
          {/* Layout de Ícones + Título + Descrição */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             {/* Item 1 */}
             <div className="text-center">
                <Building size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Credibilidade Profissional</h4>
                <p className="text-sm text-gray-600">Um domínio próprio (seunome.com) passa muito mais confiança do que subdomínios gratuitos.</p>
             </div>
             {/* Item 2 */}
              <div className="text-center">
                <Fingerprint size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Identidade Única</h4>
                <p className="text-sm text-gray-600">Reforce sua marca com um nome fácil de lembrar e que represente seu negócio ou ideia.</p>
             </div>
             {/* Item 3 */}
              <div className="text-center">
                <Route size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Melhor Visibilidade (SEO)</h4>
                <p className="text-sm text-gray-600">Domínios relevantes podem ajudar no seu posicionamento em buscadores como o Google.</p>
             </div>
          </div>
        </div>
      </section>
      
      {/* --- SEÇÃO 3: RECURSOS DO REGISTRO FYZEN (Cards Escuros) --- */}
      <section id="features-domain" className="w-full py-16 md:py-24 bg-white"> 
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Tudo Incluído no Registro do Seu Domínio
             </h2>
          </div>
          {/* Cards Escuros '.feature-card' */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card">
              <Search size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Busca Fácil e Rápida</h3>
              <p className="feature-card-description">
                Encontre o domínio perfeito com sugestões inteligentes e verificação instantânea.
              </p>
            </div>
            <div className="feature-card">
              <CheckSquare size={36} className="feature-card-icon" /> 
              <h3 className="feature-card-title">Gerenciamento DNS Simples</h3>
              <p className="feature-card-description">
                Painel intuitivo para apontar seu domínio para qualquer servidor ou serviço.
              </p>
            </div>
             <div className="feature-card">
              <Shield size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Proteção de Privacidade (WHOIS)</h3>
              <p className="feature-card-description">
                Mantenha seus dados pessoais ocultos nas consultas públicas de domínio (opcional).
              </p>
            </div>
            <div className="feature-card">
              <LifeBuoy size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Suporte Especializado</h3>
              <p className="feature-card-description">
                Nossa equipe pronta para ajudar com qualquer configuração ou dúvida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 4: ESCOLHENDO O DOMÍNIO CERTO --- */}
      <section className="w-full py-16 md:py-24 bg-gray-50 text-black">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Coluna Esquerda: Placeholder */}
          <div className="flex justify-center items-center">
             {/* SUGESTÃO: Imagem com várias extensões de domínio (.com, .br, .io, etc.) */}
             <div className="w-full aspect-video bg-neutral-900 rounded-lg flex items-center justify-center shadow-lg">
               <Dna size={80} className="text-white opacity-30" />
             </div>
          </div>
          {/* Coluna Direita: Texto */}
          <div>
            <span className="text-sm font-semibold uppercase text-gray-500 tracking-wider mb-2 block">Dicas Essenciais</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Como Escolher o Nome de Domínio Perfeito
            </h2>
            <ul className="space-y-3 text-lg text-gray-600 list-disc list-inside">
               <li><strong className="text-gray-800">Seja Curto e Memorável:</strong> Fácil de digitar e lembrar.</li>
               <li><strong className="text-gray-800">Use Palavras-Chave:</strong> Se relevante para seu nicho e SEO.</li>
               <li><strong className="text-gray-800">Prefira .com ou .com.br:</strong> São as extensões mais populares e confiáveis.</li>
               <li><strong className="text-gray-800">Evite Hifens e Números:</strong> Podem dificultar a digitação e memorização.</li>
               <li><strong className="text-gray-800">Verifique a Disponibilidade:</strong> Garanta que o nome e as redes sociais estejam livres.</li>
            </ul>
          </div>
        </div>
      </section>

       {/* --- SEÇÃO 5: TRANSFERÊNCIA SIMPLIFICADA --- */}
      <section className="w-full py-16 md:py-24 bg-white text-black">
        <div className="container mx-auto max-w-4xl px-4 text-center">
            <ArrowRightLeft size={40} className="text-neutral-800 mb-6 mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Já Tem um Domínio? Transfira para a Fyzen!
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
               Traga seu domínio existente para nossa plataforma e centralize todo o gerenciamento 
               do seu site e domínio em um só lugar, com nosso suporte especializado.
            </p>
             <a
                href="/contato" // Ou página de transferência
                className="bg-neutral-900 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-neutral-700 transition-all"
             >
                Saiba Mais Sobre Transferência
             </a>
        </div>
      </section>

      {/* --- SEÇÃO 6: CTA FINAL --- */}
       <section className="w-full py-20 md:py-28 bg-neutral-900 text-white text-center">
          <div className="container mx-auto max-w-3xl px-4">
             <SearchCheck size={48} className="text-white mb-6 mx-auto" />
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Encontre e Registre Seu Domínio Hoje Mesmo
             </h2>
             <p className="text-xl text-neutral-300 mb-10">
                Não perca o nome ideal para sua marca. Verifique a disponibilidade e 
                garanta seu endereço na internet com a Fyzen.
             </p>
             <a
                href="#search-domain" // Idealmente, link para uma ferramenta de busca
                className="bg-white text-neutral-900 font-semibold py-4 px-12 rounded-lg shadow-lg hover:bg-neutral-200 transition-all text-lg"
             >
                Buscar Domínio Agora
             </a>
          </div>
       </section>

      <Footer />
    </main>
  );
}