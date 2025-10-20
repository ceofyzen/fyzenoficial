// app/components/Footer.tsx
import { Linkedin, Github, Instagram } from 'lucide-react'; 
import Link from 'next/link'; // 1. IMPORTAR O LINK DO NEXT.JS

export default function Footer() {
  return (
    <footer className="bg-black text-neutral-400 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Coluna 1: Logo */}
          <div>
            {/* 2. MUDANÇA: 'a' -> 'Link' */}
            <Link href="/" className="text-2xl font-bold text-white mb-3 block">
              Fyzen
            </Link>
          </div>

          {/* Coluna 2: Navegação */}
          <div>
            <h5 className="font-semibold text-white mb-4 uppercase text-sm tracking-wider">Navegação</h5>
            <ul className="space-y-2">
              {/* 3. MUDANÇA: 'a' -> 'Link' */}
              <li><Link href="/" className="hover:text-white transition-colors text-sm">Página Inicial</Link></li>
              <li><Link href="/servicos" className="hover:text-white transition-colors text-sm">Serviços</Link></li>
              <li><Link href="/portfolio" className="hover:text-white transition-colors text-sm">Portfolio</Link></li>
              <li><Link href="/sobre" className="hover:text-white transition-colors text-sm">Sobre</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Legal */}
          <div>
            <h5 className="font-semibold text-white mb-4 uppercase text-sm tracking-wider">Legal</h5>
            <ul className="space-y-2">
              {/* 4. MUDANÇA: 'a' -> 'Link' */}
              <li><Link href="/politica-privacidade" className="hover:text-white transition-colors text-sm">Política de Privacidade</Link></li>
              <li><Link href="/termos-de-uso" className="hover:text-white transition-colors text-sm">Termos de Uso</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Social */}
          <div>
            <h5 className="font-semibold text-white mb-4 uppercase text-sm tracking-wider">Conecte-se</h5>
            <div className="flex space-x-4">
              {/* Links externos continuam como 'a' */}
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white transition-colors"><Linkedin size={20} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-white transition-colors"><Github size={20} /></a>
              <a href="https://www.instagram.com/_fyzen/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

        </div>
        
        {/* Linha Divisória e Copyright */}
        <hr className="border-neutral-800 mt-8" /> 
        <div className="text-center pt-4">
          <p className='text-sm'>&copy; {new Date().getFullYear()} Fyzen. Todos os direitos reservados.</p>
        </div>

      </div>
    </footer>
  );
}