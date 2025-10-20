// app/portfolio/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';


// Ícones para a página de Portfolio
import { 
  Briefcase, // Ícone principal
  LayoutGrid, // Placeholder
  ArrowRight, // Ícone para botão "Ver Projeto"
  MessageSquare // Ícone para CTA
} from 'lucide-react'; 
// import Image from 'next/image'; // Se usar imagens reais

export default function PortfolioPage() {
  // Placeholder para dados dos projetos - No futuro, isso virá de um CMS ou API
  const projects = [
    { id: 1, title: 'Nome do Projeto Incrível 1', description: 'Uma breve descrição do projeto, destacando o desafio e a solução implementada.', imageUrl: '/images/placeholder-project.png', link: '/portfolio/projeto-1', tags: ['Website', 'Next.js', 'Tailwind'] },
    { id: 2, title: 'Plataforma SaaS Inovadora', description: 'Desenvolvimento de um SaaS complexo que otimizou processos para o cliente X.', imageUrl: '/images/placeholder-project.png', link: '/portfolio/projeto-2', tags: ['SaaS', 'Node.js', 'React'] },
    { id: 3, title: 'Aplicativo Mobile Engajador', description: 'Criação de um app iOS e Android focado em experiência do usuário.', imageUrl: '/images/placeholder-project.png', link: '/portfolio/projeto-3', tags: ['App', 'React Native'] },
    // Adicione mais placeholders conforme necessário
    { id: 4, title: 'Sistema de Automação Eficaz', description: 'Implementação de automação que reduziu custos operacionais em Y%.', imageUrl: '/images/placeholder-project.png', link: '/portfolio/projeto-4', tags: ['Automação', 'API'] },
    { id: 5, title: 'E-commerce de Alta Conversão', description: 'Loja virtual completa com foco em performance e vendas.', imageUrl: '/images/placeholder-project.png', link: '/portfolio/projeto-5', tags: ['E-commerce', 'Next.js'] },
    { id: 6, title: 'Portal Corporativo Moderno', description: 'Redesign e desenvolvimento de um portal para a empresa Z.', imageUrl: '/images/placeholder-project.png', link: '/portfolio/projeto-6', tags: ['Website', 'CMS'] },
  ];

  return (
    <main>
      <Header />

      {/* --- SEÇÃO 1: HERO - FOCO EM RESULTADOS VISUAIS --- */}
      <section className="w-full pt-28 md:pt-40 pb-16 md:pb-24 bg-white text-black"> 
        <div className="container mx-auto max-w-6xl px-4 text-center">
            <Briefcase size={40} className="text-neutral-800 mb-4 mx-auto" /> 
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Nossos Projetos de Sucesso
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Explore alguns dos trabalhos que realizamos, transformando ideias e desafios 
              em soluções digitais impactantes e eficientes para nossos clientes.
            </p>
            {/* Opcional: Botão para filtrar ou CTA secundário */}
            {/* <a
              href="#projetos" 
              className="bg-neutral-900 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-neutral-700 transition-all"
            >
              Ver Todos os Projetos
            </a> */}
        </div>
      </section>

      {/* --- SEÇÃO 2: GRID DE PROJETOS --- */}
      <section id="projetos" className="w-full py-16 md:py-24 bg-gray-50"> 
        <div className="container mx-auto max-w-6xl px-4">
          {/* Grid responsivo para os cards de projeto */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Mapeando os projetos placeholder */}
            {projects.map((project) => (
              <div key={project.id} className="relative group bg-neutral-900 text-white rounded-2xl overflow-hidden shadow-lg border border-neutral-800 transition-all duration-300 hover:border-neutral-700 hover:shadow-[0_0_30px_5px_theme(colors.gray.400/0.2)] hover:-translate-y-2">
                {/* Placeholder da Imagem */}
                <div className="w-full h-48 bg-neutral-800 flex items-center justify-center">
                  {/* Substitua por <Image /> quando tiver imagens */}
                  {/* <img src={project.imageUrl} alt={project.title} className="object-cover w-full h-full" /> */}
                   <LayoutGrid size={40} className="text-neutral-600" />
                </div>
                
                {/* Conteúdo do Card */}
                <div className="p-6">
                  {/* Tags (Opcional) */}
                  {project.tags && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-gray-100 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-neutral-400 mb-4">
                    {project.description}
                  </p>
                  
                  {/* Botão/Link para Ver Mais */}
                  <a 
                    href={project.link} 
                    className="inline-flex items-center text-sm font-medium text-white hover:text-gray-200 transition-colors group"
                  >
                    Ver Projeto 
                    <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            ))}
            
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 3: CTA FINAL --- */}
       <section className="w-full py-20 md:py-28 bg-neutral-900 text-white text-center">
          <div className="container mx-auto max-w-3xl px-4">
             <MessageSquare size={48} className="text-white mb-6 mx-auto opacity-80" />
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Tem um Projeto em Mente?
             </h2>
             <p className="text-xl text-neutral-300 mb-10">
                Vamos conversar sobre suas ideias e como a Fyzen pode ajudar a 
                transformá-las em realidade. Entre em contato para uma consulta gratuita.
             </p>
             <a
                href="/orcamento" 
                className="bg-white text-neutral-900 font-semibold py-4 px-12 rounded-lg shadow-lg hover:bg-neutral-200 transition-all text-lg"
             >
                Fale Conosco Sobre Seu Projeto
             </a>
          </div>
       </section>

      <Footer />
    </main>
  );
}