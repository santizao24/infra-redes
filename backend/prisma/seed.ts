import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const obras: any[] = [];

const materiais: any[] = [];

async function main() {
  console.log('🌱 A iniciar seed da base de dados (dados de demonstração)...');

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
        descricao: 'Obra criada (dados de demonstração)',
        data: obra.dataInicio || new Date(),
      },
    });

    if (obra.estado === 'EM_EXECUCAO' && obra.metrosExecutados > 0) {
      await prisma.historicoObra.create({
        data: {
          obraId: created.id,
          utilizadorId: gestor.id,
          descricao: `Início da execução — ${obra.metrosExecutados} m executados`,
          data: obra.dataInicio || new Date(),
        },
      });
    }

    if (obra.estadoPavimento === 'PROVISORIO' && obra.dataReposicaoProvisoria) {
      await prisma.historicoObra.create({
        data: {
          obraId: created.id,
          utilizadorId: gestor.id,
          descricao: 'Pavimento provisório realizado',
          data: obra.dataReposicaoProvisoria,
        },
      });
    }
  }

  const createdMateriais = [];
  for (const mat of materiais) {
    const created = await prisma.material.create({ data: mat });
    createdMateriais.push(created);
  }

  // Relacionar materiais com obras
  await prisma.materialObra.createMany({
    data: [
      { obraId: createdObras[0].id, materialId: createdMateriais[0].id, quantidade: 500 },
      { obraId: createdObras[0].id, materialId: createdMateriais[5].id, quantidade: 20 },
      { obraId: createdObras[0].id, materialId: createdMateriais[8].id, quantidade: 15 },
      { obraId: createdObras[1].id, materialId: createdMateriais[1].id, quantidade: 800 },
      { obraId: createdObras[1].id, materialId: createdMateriais[13].id, quantidade: 12 },
    ],
  });

  // Movimentos de stock de exemplo
  await prisma.movimentoStock.create({
    data: {
      materialId: createdMateriais[0].id,
      obraId: createdObras[0].id,
      tipo: 'SAIDA',
      quantidade: 500,
      utilizadorId: gestor.id,
      responsavel: 'João Silva',
      observacoes: 'Saída para obra OBR-2026-001',
    },
  });

  const stats = [
    { chave: 'obras_realizadas', valor: '100+' },
    { chave: 'km_redes', valor: '500+' },
    { chave: 'anos_experiencia', valor: '20+' },
    { chave: 'clientes', valor: '50+' },
  ];

  for (const stat of stats) {
    await prisma.siteConfig.create({ data: stat });
  }

  console.log('✅ Seed concluído!');
  console.log('   Admin: admin@tarefasobedientes.pt / admin123');
  console.log('   Gestor: gestor@tarefasobedientes.pt / gestor123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
