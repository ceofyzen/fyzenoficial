// app/layout.tsx
import type { Metadata } from 'next';
// 1. Importar a fonte 'Inter'
import { Inter } from 'next/font/google'; 
import './globals.css';

// 2. Configurar a fonte 'Inter' com os pesos que estamos usando
// (light, regular, medium, bold)
const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

export const metadata: Metadata = {
  // O título e descrição continuam os mesmos
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
      {/* 3. Aplicar a classe 'inter.className' ao body */}
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}