// createAdmin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@fyzen.com'; // SEU EMAIL DE ADMIN
  const plainPassword = 'senha123'; // SUA SENHA TEMPORÁRIA
  const saltRounds = 10;

  // Encontre o ID do cargo 'Chief Executive Officer' (AJUSTE SE O ID FOR DIFERENTE)
  const ceoRole = await prisma.role.findUnique({
    where: { name: 'Chief Executive Officer' }, 
  });

  if (!ceoRole) {
    console.error("Erro: Cargo 'Chief Executive Officer' não encontrado. Crie os cargos primeiro.");
    return;
  }

  const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

  try {
    const newUser = await prisma.user.create({
      data: {
        email: email,
        passwordHash: passwordHash,
        name: 'Administrador Fyzen', // Nome Completo
        roleId: ceoRole.id, // Vincula ao cargo CEO
        isActive: true,
        // Adicione outros campos obrigatórios se houver
      },
    });
    console.log('Usuário admin criado com sucesso:', newUser);
  } catch (error) {
     if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
         console.log('Usuário admin já existe:', email);
     } else {
         console.error('Erro ao criar usuário admin:', error);
     }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });