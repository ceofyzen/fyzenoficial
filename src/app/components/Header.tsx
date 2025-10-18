// app/components/Header.tsx
'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { useState, useEffect } from 'react'; 
// 1. IMPORTAR TODOS OS ÍCONES (MENU E SUBMENU)
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
  const [isScrolled, setIsScrolled] = useState(false); 

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // --- Funções de classe (sem mudança) ---
  const getIsActive = (path: string) => {
    if (path === '/') return pathname === path;
    return pathname === path || pathname.startsWith(path + '/');
  };

  const getLinkClass = (path: string) => {
    const isActive = getIsActive(path);
    return [
      'font-normal tracking-wide relative transition-colors duration-300', // Removido 'group' daqui
      isActive ? 'text-white' : 'text-gray-300', 
      'hover:text-white',
      'flex items-center gap-1.5' // Mantido flex para o ícone ChevronDown
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
  
  // Classe para os links do dropdown (ATUALIZADA com flex e gap)
  const dropdownLinkClass = "flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-neutral-800 transition-colors";

  // --- Fim das funções de classe ---

  return (
    <header 
      className={`top-0 left-0 w-full z-50 py-4 px-4 sm:px-8
                  transition-all duration-300
                  ${isScrolled 
                    ? 'fixed bg-black/90 backdrop-blur-md' 
                    : 'absolute' 
                  }`}
    >
      
      <nav className="container mx-auto flex justify-between items-center">
        
        {/* Coluna 1: Logo */}
        <div className="flex-1">
          <Link href="/" className="text-2xl font-bold text-white">
            Fyzen
          </Link>
        </div>

        {/* Coluna 2: Menu */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-8">
          
          {/* Link: Página Inicial */}
          <div className="relative"> {/* Adicionado relative para o sublinhado */}
              <Link href="/" className={getLinkClass('/')}>
                <span>Página Inicial</span>
              </Link>
              <span className={underlineClass('/')}></span>
          </div>

          {/* 2. CORREÇÃO DO HOVER + ÍCONES */}
          {/* O 'group' agora está neste 'div' pai */}
          <div className="relative group"> 
            
            {/* O link "Serviços" (agora dentro do novo 'group') */}
            <div className='relative'> {/* Adicionado relative para o sublinhado */}
                <Link href="/servicos" className={getLinkClass('/serviços')}>
                    <span>Serviços</span>
                    {/* A seta ainda gira */}
                    <ChevronDown size={16} className="transition-transform group-hover:rotate-180 duration-200" />
                </Link>
                {/* O sublinhado agora precisa estar aqui */}
                <span className={underlineClass('/serviços')}></span>
            </div>
            
            {/* O Dropdown (agora dentro do novo 'group') */}
            <div className="
              absolute top-full left-1/2 -translate-x-1/2 pt-3 {/* Adicionado pt-3 para dar espaço */}
              w-60 bg-black/90 backdrop-blur-md 
              border border-gray-800 rounded-lg shadow-lg
              flex flex-col overflow-hidden
              
              opacity-0 scale-95 pointer-events-none 
              group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
              transition-all duration-150 ease-out
            ">
              {/* Links com Ícones */}
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
                <Server size={16} /> <span>Hospedagem</span> {/* Removido 'de Sites' para caber */}
              </Link>
              <Link href="/servicos/dominio" className={dropdownLinkClass}>
                <Globe size={16} /> <span>Domínio</span> {/* Removido 'Registro de' para caber */}
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