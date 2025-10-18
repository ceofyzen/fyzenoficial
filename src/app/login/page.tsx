// app/login/page.tsx
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Página de Login</h1>
      <p className="mb-8">(Seu formulário de login virá aqui)</p>
      <Link href="/" className="text-blue-400 hover:underline">
        Voltar para a Home
      </Link>
    </div>
  );
}