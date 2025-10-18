// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; 
import './globals.css';

// 1. Importar os componentes de cliente
import Header from './components/Header';
import ScrollToTopButton from './components/ScrollToTopButton';

// Configuração da fonte
const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

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
    <html lang="pt-br">
      <body className={inter.className}>
        
        {/* 2. Adicionamos o Header e o Botão aqui */}
        {/* Eles agora vivem "fora" da página, no layout */}
        <Header />
        <ScrollToTopButton />
        
        {/* 3. O 'children' aqui será o seu page.tsx */}
        {children}

      </body>
    </html>
  );
}