// app/(admin)/admin/page.tsx

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Admin</h1>
      <p className="text-gray-600 mb-8">Bem-vindo ao painel de administração da Fyzen.</p>

      {/* Placeholder para Widgets ou Informações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Clientes Ativos</h3>
          <p className="text-3xl font-bold">15</p> {/* Exemplo */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Projetos em Andamento</h3>
          <p className="text-3xl font-bold">8</p> {/* Exemplo */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Posts Recentes no Blog</h3>
          <p className="text-3xl font-bold">3</p> {/* Exemplo */}
        </div>
      </div>
    </div>
  );
}