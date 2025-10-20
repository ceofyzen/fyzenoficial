// createRegularUser.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const saltRounds = 10;

// --- CONFIGURAÇÕES DO NOVO USUÁRIO ---
const email = 'user@fyzen.com'; // <<< Altere o email aqui
const plainPassword = 'senha123';   // <<< Altere a senha aqui
const nomeCompleto = 'Usuário Comum';      // <<< Altere o nome aqui
const nomeCargoDesejado = 'Desenvolvedor Junior'; // <<< Altere para o nome EXATO do cargo desejado
// --- FIM DAS CONFIGURAÇÕES ---

async function main() {
  // 1. Encontra o ID do cargo desejado
  let cargoDesejado;
  try {
    cargoDesejado = await prisma.role.findUnique({
      where: { name: nomeCargoDesejado },
    });
  } catch (error) {
    console.error(`Erro ao buscar o cargo "${nomeCargoDesejado}":`, error);
    return; // Interrompe se não conseguir buscar
  }
  

  if (!cargoDesejado) {
    console.error(`\nERRO: Cargo "${nomeCargoDesejado}" não encontrado no banco de dados.`);
    console.log("Verifique se o nome está correto ou crie o cargo primeiro via Prisma Studio ou outra migração.");
    return; // Interrompe se o cargo não existe
  }

  console.log(`Cargo "${nomeCargoDesejado}" encontrado com ID: ${cargoDesejado.id}`);

  // 2. Gera o hash da senha
  const passwordHash = await bcrypt.hash(plainPassword, saltRounds);
  console.log(`Hash gerado para a senha.`);

  // 3. Tenta criar o novo usuário
  try {
    const newUser = await prisma.user.create({
      data: {
        email: email,
        passwordHash: passwordHash,
        name: nomeCompleto,
        roleId: cargoDesejado.id, // Vincula ao cargo encontrado
        isActive: true,
        // Adicione outros campos padrão se necessário (admissionDate já tem default)
      },
    });
    console.log('\nUsuário criado com sucesso:');
    console.log(`  ID: ${newUser.id}`);
    console.log(`  Email: ${newUser.email}`);
    console.log(`  Nome: ${newUser.name}`);
    console.log(`  Cargo: ${nomeCargoDesejado} (ID: ${newUser.roleId})`);

  } catch (error) {
     // @ts-ignore Pega o código do erro do Prisma
     if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
         console.log(`\nAVISO: Usuário com email "${email}" já existe.`);
     } else {
         console.error('\nErro ao criar usuário:', error);
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