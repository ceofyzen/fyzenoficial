// app/components/Header.tsx
'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { useState, useEffect } from 'react'; 

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

  // --- Funções de classe ---

  // Esta função usa 'pathname === path' (correspondência EXATA)
  // Isso garante que estar em '/sobre' NÃO ativará '/'
  const getLinkClass = (path: string) => {
    const isActive = pathname === path; 
    return [
      'font-normal tracking-wide relative group transition-colors duration-300',
      isActive ? 'text-white' : 'text-gray-300', 
      'hover:text-white'
    ].join(' ');
  };

  // Esta função TAMBÉM usa 'pathname === path'
  const underlineClass = (path: string) => {
    const isActive = pathname === path;
    return [
      'absolute left-0 -bottom-1', 'w-full h-0.5', 'bg-white', 
      'transform transition-transform duration-300 ease-out',
      // Apenas o link ativo (isActive) receberá o 'scale-x-100'
      isActive ? 'scale-x-100' : 'scale-x-0', 
    ].join(' ');
  };
  // --- Fim das funções de classe ---

  return (
    <header 
      className={`top-0 left-0 w-full z-50 py-4 px-4 sm:px-8
                  transition-all duration-300
                  ${isScrolled 
                    // Estilo QUANDO ROLADO (sem borda)
                    ? 'fixed bg-black/90 backdrop-blur-md' 
                    // Estilo NO TOPO
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
          <Link href="/" className={getLinkClass('/')}>
            <span>Página Inicial</span>
            <span className={underlineClass('/')}></span>
          </Link>
          <Link href="/servicos" className={getLinkClass('/servicos')}>
            <span>Serviços</span>
            <span className={underlineClass('/servicos')}></span>
          </Link>
          <Link href="/portfolio" className={getLinkClass('/portfolio')}>
            <span>Portfolio</span>
            <span className={underlineClass('/portfolio')}></span>
          </Link>
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