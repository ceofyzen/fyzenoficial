// app/components/Header.tsx
'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
// REMOVIDO: useState, useEffect
import { 
    ChevronDown, 
    MonitorSmartphone, 
    AppWindow, 
    Smartphone, 
    Server, 
    Globe, 
    Zap 
} from 'lucide-react'; 

export default function Header() {
  const pathname = usePathname(); 
  // REMOVIDO: const [isScrolled, setIsScrolled] = useState(false);
  // REMOVIDO: useEffect para detectar scroll

  // --- Funções de classe (sem mudança) ---
  const getIsActive = (path: string) => {
    if (path === '/') return pathname === path;
    return pathname === path || pathname.startsWith(path + '/');
  };

  const getLinkClass = (path: string) => {
    const isActive = getIsActive(path);
    return [
      'font-normal tracking-wide relative transition-colors duration-300',
      isActive ? 'text-white' : 'text-gray-300', 
      'hover:text-white',
      'flex items-center gap-1.5'
    ].join(' ');
  };

  const underlineClass = (path: string) => {
    const isActive = getIsActive(path);
    return [
      'absolute left-0 -bottom-1', 'w-full h-0.5', 'bg-white', 
      'transform transition-transform duration-300 ease-out',
      isActive ? 'scale-x-100' : 'scale-x-0', 
    ].join(' ');
  };
  
  const dropdownLinkClass = "flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-neutral-800 transition-colors";
  // --- Fim das funções de classe ---

  return (
    // ***** MUDANÇA PRINCIPAL AQUI *****
    // Header agora é SEMPRE fixo com fundo escuro
    <header 
      className={`fixed top-0 left-0 w-full z-50 py-4 px-4 sm:px-8
                  bg-black/90 backdrop-blur-md`} 
                  // Removida a lógica condicional e a transição
    >
      
      <nav className="container mx-auto flex justify-between items-center">
        
        {/* Coluna 1: Logo */}
        <div className="flex-1">
          <Link href="/" className="text-2xl font-bold text-white">
            Fyzen
          </Link>
        </div>

        {/* Coluna 2: Menu (com dropdown) */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-8">
          
          {/* Link: Página Inicial */}
          <div className="relative"> 
              <Link href="/" className={getLinkClass('/')}>
                <span>Página Inicial</span>
              </Link>
              <span className={underlineClass('/')}></span>
          </div>

          {/* Menu "Serviços" com Dropdown */}
          <div className="relative group"> 
            <div className='relative'> 
                <Link href="/servicos" className={getLinkClass('/serviços')}>
                    <span>Serviços</span>
                    <ChevronDown size={16} className="transition-transform group-hover:rotate-180 duration-200" />
                </Link>
                <span className={underlineClass('/serviços')}></span>
            </div>
            <div className="
              absolute top-full left-1/2 -translate-x-1/2 pt-3 
              w-60 bg-black/90 backdrop-blur-md 
              border border-gray-800 rounded-lg shadow-lg
              flex flex-col overflow-hidden
              opacity-0 scale-95 pointer-events-none 
              group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
              transition-all duration-150 ease-out
            ">
              <Link href="/servicos/criacao-de-sites" className={dropdownLinkClass}>
                <MonitorSmartphone size={16} /> <span>Criação de Sites</span>
              </Link>
              <Link href="/servicos/criacao-de-saas" className={dropdownLinkClass}>
                <AppWindow size={16} /> <span>Criação de SaaS</span>
              </Link>
              <Link href="/servicos/criacao-de-app" className={dropdownLinkClass}>
                <Smartphone size={16} /> <span>Criação de APP</span>
              </Link>
              <Link href="/servicos/hospedagem" className={dropdownLinkClass}>
                <Server size={16} /> <span>Hospedagem</span> 
              </Link>
              <Link href="/servicos/dominio" className={dropdownLinkClass}>
                <Globe size={16} /> <span>Domínio</span> 
              </Link>
              <Link href="/servicos/automatizacao" className={dropdownLinkClass}>
                <Zap size={16} /> <span>Automatização</span>
              </Link>
            </div>
          </div>
          {/* Fim do Dropdown "Serviços" */}

          {/* Link: Portfolio */}
          <div className="relative">
              <Link href="/portfolio" className={getLinkClass('/portfolio')}>
                <span>Portfolio</span>
              </Link>
              <span className={underlineClass('/portfolio')}></span>
          </div>

          {/* Link: Sobre */}
          <div className="relative">
              <Link href="/sobre" className={getLinkClass('/sobre')}>
                <span>Sobre</span>
              </Link>
              <span className={underlineClass('/sobre')}></span>
          </div>
        </div>

        {/* Coluna 3: Botões */}
        <div className="flex flex-1 justify-end items-center gap-4">
          <Link 
            href="/login" 
            className="hidden sm:block text-sm font-normal tracking-wide 
                       text-gray-300
                       hover:text-white transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/orcamento"
            className="ml-4 px-4 py-2 rounded-lg 
                       bg-white text-black font-medium
                       transition-colors
                       hover:bg-gray-200"
          >
            Solicite um Orçamento
          </Link>
        </div>
      </nav>
    </header>
  );
}