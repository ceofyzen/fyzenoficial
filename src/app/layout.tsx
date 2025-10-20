// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; 
import './globals.css';
import Providers from './Providers'; // Importa o SessionProvider

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

// Metadata é importante para o <head>
export const metadata: Metadata = {
  title: 'Fyzen - Criação de Sites e Soluções Digitais',
  description: 'Transformamos sua ideia em um site profissional de alta performance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. Tag <html> OBRIGATÓRIA
    <html lang="pt-br"> 
      {/* O <head> é gerenciado automaticamente pelo Next.js 
        através do objeto 'metadata'
      */}
      
      {/* 2. Tag <body> OBRIGATÓRIA */}
      <body className={inter.className}>
        {/* O SessionProvider (ou outros providers) devem vir aqui,
          dentro do body, envolvendo os children.
        */}
        <Providers>
          {/* {children} representa o conteúdo da página atual
            ou o layout do grupo de rotas correspondente (ex: (web)/layout.tsx)
          */}
          {children} 
        </Providers>
      </body>
    </html>
  );
}