// app/components/ScrollToTopButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react'; // Importa o ícone

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Mostra o botão quando o usuário rolar 300px
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Função para rolar suavemente ao topo
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-black text-white
                  shadow-lg transition-all duration-300 ease-in-out
                  ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                  hover:bg-gray-800`}
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
    >
      <ArrowUp size={20} />
    </button>
  );
}