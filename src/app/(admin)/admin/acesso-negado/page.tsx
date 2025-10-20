// src/app/(admin)/acesso-negado/page.tsx
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function AcessoNegadoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(space.16))] text-center px-4"> {/* Ajuste min-h se o layout admin tiver header */}
      <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
      <p className="text-gray-600 mb-6">Você não tem permissão para acessar esta página.</p>
      <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 font-semibold">
        Voltar para o Dashboard
      </Link>
    </div>
  );
}