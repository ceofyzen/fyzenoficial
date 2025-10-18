// app/login/page.tsx
'use client'; // Esta página precisa ser Client Component para interagir com o formulário

import { useState } from 'react';
import { signIn } from 'next-auth/react'; // Hook do NextAuth para iniciar o login
import { useRouter } from 'next/navigation'; // Para redirecionar após login

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpa erros anteriores

    try {
      // Tenta fazer login com o provedor 'credentials'
      const result = await signIn('credentials', {
        redirect: false, // Não redireciona automaticamente, vamos tratar manualmente
        email: email,
        password: password,
      });

      if (result?.error) {
        // Se o 'authorize' retornou null ou houve erro
        console.error("Erro de login:", result.error);
        setError('Credenciais inválidas. Tente novamente.');
      } else if (result?.ok) {
        // Login bem-sucedido! Redireciona para o dashboard admin
        console.log("Login OK, redirecionando...");
        router.push('/admin'); // Ou para onde quer que o usuário vá após login
        router.refresh(); // Garante que o estado do servidor seja atualizado
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    } catch (err) {
      console.error("Erro no processo de signIn:", err);
      setError('Erro ao tentar fazer login.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Login - Painel Fyzen</h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-neutral-900 hover:bg-neutral-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}