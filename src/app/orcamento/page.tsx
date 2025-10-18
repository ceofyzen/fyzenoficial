// app/orcamento/page.tsx
import Link from 'next/link';

export default function OrcamentoPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Solicite um Orçamento</h1>
      <p className="mb-8">(Seu formulário de contato virá aqui)</p>
      <Link href="/" className="text-blue-400 hover:underline">
        Voltar para a Home
      </Link>
    </div>
  );
}