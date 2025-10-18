// app/servicos/hospedagem/page.tsx
import Header from '@/app/components/Header'; 
import Footer from '@/app/components/Footer';

// Ícones específicos para Hospedagem (NÃO USADOS REMOVIDOS)
import { 
  CloudLightning, // Ícone principal
  TrendingUp, Smile, ShoppingCart, 
  Gauge, Lock, DatabaseBackup, Globe as GlobeIcon, LifeBuoy, HardDrive, 
  Wind, 
  ShieldCheck, ScanEye, FileLock, 
  Headset, 
  // Server, Network, Truck, CheckCircle REMOVIDOS
} from 'lucide-react'; 

export default function HospedagemPage() {
  return (
    <main>
      <Header />

      {/* --- SEÇÃO 1: HERO --- */}
      <section className="w-full pt-28 md:pt-40 pb-16 md:pb-24 bg-neutral-900 text-white"> 
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-semibold uppercase text-neutral-400 tracking-wider mb-2 block">Hospedagem de Sites Otimizada</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Velocidade, Segurança e Confiabilidade <span className="text-neutral-300">para Seu Site</span>
            </h1>
            <p className="text-lg text-neutral-300 mb-8 max-w-xl">
              Garanta que seu site esteja sempre online, rápido e protegido com a infraestrutura de hospedagem 
              de alta performance da Fyzen. Foco total na experiência do seu usuário e nos resultados do seu negócio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/orcamento" className="bg-white text-neutral-900 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-neutral-200 transition-all text-center">
                Ver Planos de Hospedagem
              </a>
              <a href="#features" className="bg-transparent border border-neutral-700 text-neutral-300 font-semibold py-3 px-8 rounded-lg hover:bg-neutral-800 hover:border-neutral-600 transition-all text-center">
                Conhecer Recursos
              </a>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="w-full aspect-video bg-neutral-800 rounded-lg flex items-center justify-center shadow-lg">
              <CloudLightning size={80} className="text-white opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 2: POR QUE A HOSPEDAGEM CERTA É CRUCIAL? --- */}
      <section className="w-full py-16 md:py-24 bg-white"> 
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Sua Hospedagem Impacta Diretamente Seus Resultados
             </h2>
             <p className="text-lg text-gray-600">
               Uma hospedagem lenta ou instável prejudica sua marca, afasta clientes e derruba seu ranking no Google.
             </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             <div className="text-center">
                <TrendingUp size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Melhor Posicionamento (SEO)</h4>
                <p className="text-sm text-gray-600">O Google prioriza sites rápidos. Uma hospedagem otimizada ajuda você a subir no ranking.</p>
             </div>
              <div className="text-center">
                <Smile size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Experiência do Usuário Superior</h4>
                <p className="text-sm text-gray-600">Ninguém gosta de esperar. Sites rápidos mantêm os visitantes engajados e satisfeitos.</p>
             </div>
              <div className="text-center">
                <ShoppingCart size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Mais Conversões</h4>
                <p className="text-sm text-gray-600">Um site rápido e confiável aumenta a taxa de conversão, seja em vendas, leads ou contatos.</p>
             </div>
          </div>
        </div>
      </section>
      
      {/* --- SEÇÃO 3: RECURSOS ESSENCIAIS --- */}
      <section id="features" className="w-full py-16 md:py-24 bg-gray-50"> 
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Recursos Essenciais da Hospedagem Fyzen
             </h2>
             <p className="text-lg text-gray-600">
                Tudo que você precisa para uma presença online de alta performance.
             </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="feature-card">
              <HardDrive size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Armazenamento SSD NVMe</h3>
              <p className="feature-card-description">
                Velocidade máxima de leitura e escrita para carregamento ultra-rápido.
              </p>
            </div>
            <div className="feature-card">
              <Lock size={36} className="feature-card-icon" /> 
              <h3 className="feature-card-title">Certificado SSL Gratuito</h3>
              <p className="feature-card-description">
                Conexão segura (HTTPS) para todos os seus sites, sem custo adicional.
              </p>
            </div>
             <div className="feature-card">
              <DatabaseBackup size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Backups Automáticos Diários</h3>
              <p className="feature-card-description">
                Seus dados protegidos com cópias de segurança frequentes e restauração fácil.
              </p>
            </div>
             <div className="feature-card">
              <GlobeIcon size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">CDN Global (Opcional)</h3>
              <p className="feature-card-description">
                Distribua seu conteúdo mundialmente para velocidade máxima em qualquer lugar.
              </p>
            </div>
             <div className="feature-card">
              <Gauge size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Servidores Otimizados</h3>
              <p className="feature-card-description">
                Configurações de servidor (LiteSpeed/Nginx) focadas em performance web.
              </p>
            </div>
            <div className="feature-card">
              <LifeBuoy size={36} className="feature-card-icon" />
              <h3 className="feature-card-title">Suporte Técnico Especializado</h3>
              <p className="feature-card-description">
                Nossa equipe pronta para ajudar você com qualquer dúvida ou problema.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 4: PERFORMANCE OTIMIZADA --- */}
      <section className="w-full py-16 md:py-24 bg-white text-black">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center items-center">
             <div className="w-full aspect-video bg-neutral-900 rounded-lg flex items-center justify-center shadow-lg">
               <Wind size={80} className="text-white opacity-30" />
             </div>
          </div>
          <div>
            <span className="text-sm font-semibold uppercase text-gray-500 tracking-wider mb-2 block">Velocidade Extrema</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Infraestrutura Construída para Performance
            </h2>
            <p className="text-lg text-gray-600 mb-4">
               Não comprometemos a velocidade. Utilizamos servidores de última geração, 
               armazenamento SSD NVMe e tecnologias de cache avançadas para garantir 
               que seu site carregue o mais rápido possível.
            </p>
             <p className="text-lg text-gray-600">
               Integramos opcionalmente com as melhores CDNs (Content Delivery Networks) 
               para entregar seu conteúdo a partir do local mais próximo do seu visitante, 
               reduzindo a latência globalmente.
            </p>
          </div>
        </div>
      </section>

       {/* --- SEÇÃO 5: SEGURANÇA ROBUSTA --- */}
      <section className="w-full py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Sua Tranquilidade é Nossa Prioridade
             </h2>
             <p className="text-lg text-gray-600">
               Implementamos múltiplas camadas de segurança para proteger seu site contra ameaças.
             </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             <div className="text-center">
                <ShieldCheck size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Firewall de Aplicação (WAF)</h4>
                <p className="text-sm text-gray-600">Filtramos tráfego malicioso antes que ele chegue ao seu site.</p>
             </div>
              <div className="text-center">
                <ScanEye size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Monitoramento e Scan de Malware</h4>
                <p className="text-sm text-gray-600">Verificações proativas para detectar e remover ameaças rapidamente.</p>
             </div>
              <div className="text-center">
                <FileLock size={36} className="text-neutral-800 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Backups e SSL</h4>
                <p className="text-sm text-gray-600">Cópias de segurança diárias e criptografia HTTPS para proteger seus dados.</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 6: MIGRAÇÃO E SUPORTE --- */}
      <section className="w-full py-16 md:py-24 bg-white text-black">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-semibold uppercase text-gray-500 tracking-wider mb-2 block">Estamos Com Você</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Migração Gratuita e Suporte Humanizado
            </h2>
            <p className="text-lg text-gray-600 mb-6">
               Mudar de hospedagem pode ser complicado. Deixe que nossa equipe cuide da 
               <strong className="text-gray-800">migração do seu site gratuitamente</strong>, garantindo uma transição suave e sem downtime.
            </p>
             <p className="text-lg text-gray-600">
               E se precisar de ajuda, nosso suporte técnico especializado está disponível 
               para responder suas dúvidas e resolver problemas rapidamente.
            </p>
          </div>
          <div className="flex justify-center items-center">
             <div className="w-full aspect-square bg-neutral-900 rounded-lg flex items-center justify-center shadow-lg">
               <Headset size={80} className="text-white opacity-30" />
             </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 7: CTA FINAL --- */}
       <section className="w-full py-20 md:py-28 bg-neutral-900 text-white text-center">
          <div className="container mx-auto max-w-3xl px-4">
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Dê ao Seu Site a Performance e Segurança que Ele Merece
             </h2>
             <p className="text-xl text-neutral-300 mb-10">
                Escolha a hospedagem Fyzen e foque no crescimento do seu negócio, 
                enquanto cuidamos da sua infraestrutura.
             </p>
             <a href="/orcamento" className="bg-white text-neutral-900 font-semibold py-4 px-12 rounded-lg shadow-lg hover:bg-neutral-200 transition-all text-lg">
                Ver Planos e Preços
             </a>
          </div>
       </section>

      <Footer />
    </main>
  );
}