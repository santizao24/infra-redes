import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const obras: any[] = [];
const materiais: any[] = [];

async function main() {
  console.log('🌱 A iniciar seed da base de dados...');

  await prisma.movimentoStock.deleteMany();
  await prisma.materialObra.deleteMany();
  await prisma.historicoObra.deleteMany();
  await prisma.obra.deleteMany();
  await prisma.material.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteConfig.deleteMany();

  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      nome: 'Administrador',
      email: 'admin@tarefasobedientes.pt',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.create({
    data: {
      nome: 'Administrador (Alt)',
      email: 'admin@aquaredes.pt',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const createdObras = [];
  for (const obra of obras) {
    const created = await prisma.obra.create({ data: obra });
    createdObras.push(created);

    await prisma.historicoObra.create({
      data: {
        obraId: created.id,
        utilizadorId: admin.id,
        descricao: 'Obra criada',
        data: obra.dataInicio || new Date(),
      },
    });
  }

  const createdMateriais = [];
  for (const mat of materiais) {
    const created = await prisma.material.create({ data: mat });
    createdMateriais.push(created);
  }

  const stats = [
    { chave: 'obras_realizadas', valor: '100+' },
    { chave: 'km_redes', valor: '500+' },
    { chave: 'anos_experiencia', valor: '20+' },
    { chave: 'clientes', valor: '50+' },
  ];

  for (const stat of stats) {
    await prisma.siteConfig.create({ data: stat });
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log('   Admin: admin@tarefasobedientes.pt / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
