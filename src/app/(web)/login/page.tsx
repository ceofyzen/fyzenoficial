// app/login/page.tsx
'use client'; 

import { useState } from 'react';
import { signIn } from 'next-auth/react'; 
import { useRouter } from 'next/navigation'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Adicionado estado de loading
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); 
    setIsLoading(true); // Inicia o loading

    try {
      const result = await signIn('credentials', {
        redirect: false, 
        email: email,
        password: password,
      });

      // ***** MUDANÇA: Logar o objeto result inteiro para depuração *****
      console.log("Resultado do signIn:", result); 

      if (result?.ok) {
        // Login bem-sucedido! Redireciona
        console.log("Login OK, redirecionando para /admin...");
        // router.push('/admin'); // router.push pode ter problemas com cache em App Router
        // Usar window.location.href garante um refresh completo e limpa estados
        window.location.href = '/admin'; 
        // Não precisa mais do router.refresh() aqui
      } else if (result?.error) {
        // Se houve erro E o login NÃO foi ok
        console.error("Erro detalhado do login:", result.error);
        if (result.error === 'CredentialsSignin') {
            setError('Email ou senha inválidos. Verifique seus dados.');
        } else {
            setError('Ocorreu um erro durante o login. Tente novamente.');
        }
      } else {
        setError('Ocorreu um erro inesperado durante o login.');
      }
    } catch (err) {
      console.error("Erro no processo de signIn:", err);
      setError('Erro crítico ao tentar fazer login.');
    } finally {
       setIsLoading(false); // Finaliza o loading, mesmo se der erro
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
              disabled={isLoading} // Desabilita input durante loading
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
              disabled={isLoading} // Desabilita input durante loading
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className={`bg-neutral-900 hover:bg-neutral-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full
                          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} // Estilo de loading
              type="submit"
              disabled={isLoading} // Desabilita botão durante loading
            >
              {isLoading ? 'Entrando...' : 'Entrar'} 
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}