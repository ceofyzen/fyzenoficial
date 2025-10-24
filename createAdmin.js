// createAdmin.js
const { PrismaClient, ModuloEnum, UserStatus } = require('@prisma/client'); // Importar Enums
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'ceo@fyzen.com.br'; // SEU EMAIL DE ADMIN
  const plainPassword = 'senha123'; // SUA SENHA TEMPORÁRIA
  const saltRounds = 10;
  const departmentName = 'Diretoria';
  const roleName = 'Diretor Executivo (CEO)';

  try {
    // 1. Garante que o Departamento 'Diretoria' exista
    const diretoriaDept = await prisma.department.upsert({
      where: { name: departmentName },
      update: {}, // Não precisa atualizar nada se já existir
      create: {
        name: departmentName,
        // Removido: accessModule: ModuloEnum.DIRETORIA, // Definir o módulo correto
        description: 'Departamento responsável pela alta gestão da empresa.'
      },
    });
    console.log(`Departamento '${diretoriaDept.name}' garantido com ID: ${diretoriaDept.id}`);

    // 2. Garante que o Cargo 'Diretor Executivo (CEO)' exista e esteja ligado à Diretoria
    const ceoRole = await prisma.role.upsert({
      where: { name: roleName },
      update: { departmentId: diretoriaDept.id }, // Garante que está no departamento correto
      create: {
        name: roleName,
        departmentId: diretoriaDept.id, // Liga ao departamento criado/encontrado
        isDirector: true, // Marcar como diretor
        hierarchyLevel: 0, // Nível mais alto
        description: 'Responsável pela estratégia geral e gestão da empresa.',
      },
    });
    console.log(`Cargo '${ceoRole.name}' garantido com ID: ${ceoRole.id}`);

    // 3. Cria o usuário admin (ou informa se já existe)
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        passwordHash: passwordHash,
        name: 'Maycon Sousa', // Nome Completo
        roleId: ceoRole.id, // Vincula ao cargo CEO criado/encontrado
        status: UserStatus.Ativo, // <<-- Alterado de isActive para status
        admissionDate: new Date(), // Define data de admissão como agora
        // Adicione outros campos padrão se necessário
      },
    });
    console.log('\nUsuário admin criado com sucesso:', newUser.email);

  } catch (error) {
     if (error.code === 'P2002') {
        // Verifica qual constraint única falhou
        const target = error.meta?.target;
        if (target?.includes('email')) {
            console.log('\nAVISO: Usuário admin já existe com o email:', email);
        } else if (target?.includes('name') && error.modelName === 'Department') {
            console.log(`\nAVISO: Departamento '${departmentName}' já existe.`);
             // Tenta buscar o departamento existente para continuar
             const diretoriaDept = await prisma.department.findUnique({ where: { name: departmentName } });
             if (diretoriaDept) {
                console.log('Continuando com departamento existente...');
                // Você pode re-tentar a criação do cargo e usuário aqui se desejar,
                // mas a lógica atual com upsert já deve lidar com isso.
             } else {
                console.error('Erro crítico: Não foi possível encontrar o departamento existente.');
             }
        } else if (target?.includes('name') && error.modelName === 'Role') {
            console.log(`\nAVISO: Cargo '${roleName}' já existe.`);
             // Tenta buscar o cargo existente para continuar
             const ceoRole = await prisma.role.findUnique({ where: { name: roleName } });
              if (ceoRole) {
                console.log('Continuando com cargo existente...');
                // Tenta criar apenas o usuário se o cargo já existe
                try {
                    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);
                    const newUser = await prisma.user.create({
                      data: {
                        email: email, passwordHash: passwordHash, name: 'Maycon Sousa',
                        roleId: ceoRole.id, status: UserStatus.Ativo, admissionDate: new Date(),
                      },
                    });
                    console.log('\nUsuário admin criado com sucesso (cargo já existia):', newUser.email);
                } catch (userError) {
                    if (userError.code === 'P2002' && userError.meta?.target?.includes('email')) {
                         console.log('\nAVISO: Usuário admin já existe com o email:', email);
                    } else {
                         console.error('\nErro ao criar usuário admin (após cargo existente):', userError);
                    }
                }
             } else {
                 console.error('Erro crítico: Não foi possível encontrar o cargo existente.');
             }
        } else {
            console.error('\nErro ao criar:', error);
        }
     } else {
         console.error('\nErro desconhecido:', error);
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
    console.log("\nScript finalizado.");
  });