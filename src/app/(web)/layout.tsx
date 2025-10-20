// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; 
import '../globals.css';
import Providers from '../Providers'; // 1. Importar o Providers

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
        {/* 2. Envolver 'children' com o Providers */}
        <Providers>
          {children} 
        </Providers>
      </body>
    </html>
  );
}