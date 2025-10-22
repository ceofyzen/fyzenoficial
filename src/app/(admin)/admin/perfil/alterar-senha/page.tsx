// src/app/(admin)/admin/perfil/alterar-senha/page.tsx
'use client';

import { useState, useEffect } from 'react'; // <--- useEffect importado aqui
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    KeyRound, Save, ArrowLeft, Loader2, AlertTriangle, Lock
} from 'lucide-react';

export default function AlterarSenhaPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Estados do formulário
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Estados de controle
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

     // Redireciona se não estiver logado
    useEffect(() => { // <--- Agora o useEffect está definido
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Função para salvar a nova senha
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccessMessage(null);

        if (newPassword !== confirmPassword) {
            setError('A nova senha e a confirmação não coincidem.');
            setIsSaving(false);
            return;
        }

        if (newPassword.length < 6) { // Exemplo de validação mínima
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            setIsSaving(false);
            return;
        }

        try {
            // *** TODO: Criar a API /api/perfil/alterar-senha ***
            const response = await fetch('/api/perfil/alterar-senha', {
                method: 'POST', // Usar POST para alteração de senha é mais comum
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Tenta dar uma mensagem de erro mais específica
                if (response.status === 401) {
                    throw new Error(errorData.error || 'Senha atual incorreta.');
                }
                throw new Error(errorData.error || `Erro HTTP ${response.status}`);
            }

            setSuccessMessage('Senha alterada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            // Opcional: Redirecionar após um tempo ou deixar na página

        } catch (err: any) {
            console.error("Erro ao alterar senha:", err);
            setError(`Erro ao alterar senha: ${err.message || 'Erro desconhecido'}.`);
        } finally {
            setIsSaving(false);
        }
    };

     if (status === 'loading') {
        return (
          <div className="flex justify-center items-center min-h-[calc(100vh-100px)] text-gray-600">
            <Loader2 className="animate-spin mr-2" size={24} /> Carregando...
          </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 pt-14">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <KeyRound size={32} className="text-neutral-900" /> Alterar Senha
                </h1>
                <Link href="/admin" className="inline-flex items-center text-neutral-700 hover:text-neutral-900 transition-colors font-medium">
                    <ArrowLeft size={18} className="mr-2" /> Voltar ao Dashboard
                </Link>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-lg mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-lg border border-red-200 mb-6">{error}</p>}
                    {successMessage && <p className="text-center text-green-600 bg-green-100 p-3 rounded-lg border border-green-200 mb-6">{successMessage}</p>}

                    {/* Senha Atual */}
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-1">Senha Atual <span className="text-red-600">*</span></label>
                        <div className="relative"><Lock size={18} className="icon-input"/><input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required disabled={isSaving} className="input-with-icon pl-10"/></div>
                    </div>

                    {/* Nova Senha */}
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-1">Nova Senha <span className="text-red-600">*</span></label>
                        <div className="relative"><Lock size={18} className="icon-input"/><input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={isSaving} className="input-with-icon pl-10"/></div>
                         <p className="mt-1 text-xs text-gray-500">Mínimo de 6 caracteres.</p>
                    </div>

                    {/* Confirmar Nova Senha */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Nova Senha <span className="text-red-600">*</span></label>
                        <div className="relative"><Lock size={18} className="icon-input"/><input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isSaving} className="input-with-icon pl-10"/></div>
                    </div>


                    {/* Botão Salvar */}
                    <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`bg-neutral-900 hover:bg-neutral-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition-colors duration-200 shadow-md transform hover:scale-105 ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {isSaving ? (<><Loader2 className="animate-spin" size={20} /> Alterando...</>) : (<><Save size={20} /> Alterar Senha</>)}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}