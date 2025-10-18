// app/components/Header.tsx
'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { useState, useEffect } from 'react'; 
import { ChevronDown } from 'lucide-react'; // 1. IMPORTAR O ÍCONE DE SETA

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

  // --- Funções de classe ATUALIZADAS ---

  // 2. LÓGICA ATUALIZADA:
  // O link agora fica ativo se a URL for EXATA ou se for uma "filha"
  // Ex: '/servicos' fica ativo em '/servicos/criacao-de-sites'
  const getIsActive = (path: string) => {
    if (path === '/') {
      return pathname === path; // Página Inicial só ativa com exatidão
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  const getLinkClass = (path: string) => {
    const isActive = getIsActive(path);
    return [
      'font-normal tracking-wide relative group transition-colors duration-300',
      isActive ? 'text-white' : 'text-gray-300', 
      'hover:text-white',
      'flex items-center gap-1.5' // Adicionado flex para o ícone
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
  
  // Classe para os links do dropdown
  const dropdownLinkClass = "block px-5 py-3 text-sm text-gray-300 hover:text-white hover:bg-neutral-800 transition-colors";

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

        {/* Coluna 2: Menu (COM O SUBMENU) */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-8">
          
          {/* Link: Página Inicial */}
          <Link href="/" className={getLinkClass('/')}>
            <span>Página Inicial</span>
            <span className={underlineClass('/')}></span>
          </Link>

          {/* 3. MENU "SERVIÇOS" COM DROPDOWN */}
          <div className="relative group"> {/* O 'group' que ativa o dropdown */}
            
            {/* O link "Serviços" */}
            <Link href="/servicos" className={getLinkClass('/serviços')}>
              <span>Serviços</span>
              <ChevronDown size={16} className="transition-transform group-hover:rotate-180 duration-200" />
              <span className={underlineClass('/serviços')}></span>
            </Link>
            
            {/* O Dropdown em si */}
            <div className="
              absolute top-full left-1/2 -translate-x-1/2 mt-3 
              w-60 {/* Largura do menu */}
              bg-black/90 backdrop-blur-md 
              border border-gray-800 rounded-lg shadow-lg
              flex flex-col overflow-hidden {/* Layout dos links */}
              
              opacity-0 scale-95 pointer-events-none {/* Escondido por padrão */}
              group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto {/* Mostra no hover */}
              transition-all duration-150 ease-out
            ">
              <Link href="/servicos/criacao-de-sites" className={dropdownLinkClass}>Criação de Sites</Link>
              <Link href="/servicos/criacao-de-saas" className={dropdownLinkClass}>Criação de SaaS</Link>
              <Link href="/servicos/criacao-de-app" className={dropdownLinkClass}>Criação de APP</Link>
              <Link href="/servicos/hospedagem" className={dropdownLinkClass}>Hospedagem de Sites</Link>
              <Link href="/servicos/dominio" className={dropdownLinkClass}>Registro de Domínio</Link>
              <Link href="/servicos/automatizacao" className={dropdownLinkClass}>Automatização</Link>
            </div>
          </div>
          {/* Fim do Dropdown "Serviços" */}

          {/* Link: Portfolio */}
          <Link href="/portfolio" className={getLinkClass('/portfolio')}>
            <span>Portfolio</span>
            <span className={underlineClass('/portfolio')}></span>
          </Link>

          {/* Link: Sobre */}
          <Link href="/sobre" className={getLinkClass('/sobre')}>
            <span>Sobre</span>
            <span className={underlineClass('/sobre')}></span>
          </Link>
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