import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const obras: any[] = [];

const materiais = [
  { codigo: 'TUB-PVC-110', nome: 'Tubo PVC DN110', categoria: 'TUBAGENS' as const, unidade: 'METRO' as const, quantidadeStock: 850, stockMinimo: 200, localizacao: 'Armazém A - Prateleira 1', fornecedor: 'Politejo', precoUnitario: 12.5 },
  { codigo: 'TUB-PVC-160', nome: 'Tubo PVC DN160', categoria: 'TUBAGENS' as const, unidade: 'METRO' as const, quantidadeStock: 420, stockMinimo: 150, localizacao: 'Armazém A - Prateleira 2', fornecedor: 'Politejo', precoUnitario: 22.8 },
  { codigo: 'TUB-PE-32', nome: 'Tubo PEAD DN32', categoria: 'TUBAGENS' as const, unidade: 'METRO' as const, quantidadeStock: 1200, stockMinimo: 300, localizacao: 'Armazém A - Prateleira 3', fornecedor: 'Uponor', precoUnitario: 4.2 },
  { codigo: 'TUB-PE-63', nome: 'Tubo PEAD DN63', categoria: 'TUBAGENS' as const, unidade: 'METRO' as const, quantidadeStock: 680, stockMinimo: 200, localizacao: 'Armazém A - Prateleira 4', fornecedor: 'Uponor', precoUnitario: 8.5 },
  { codigo: 'TUB-ACO-150', nome: 'Tubo Aço DN150', categoria: 'MATERIAL_GAS' as const, unidade: 'METRO' as const, quantidadeStock: 95, stockMinimo: 100, localizacao: 'Armazém B - Zona Gás', fornecedor: 'ArcelorMittal', precoUnitario: 45.0 },
  { codigo: 'VAL-ESFERA-32', nome: 'Válvula Esfera DN32', categoria: 'VALVULAS' as const, unidade: 'UNIDADE' as const, quantidadeStock: 45, stockMinimo: 20, localizacao: 'Armazém C - Prateleira 1', fornecedor: 'Genebre', precoUnitario: 28.5 },
  { codigo: 'VAL-ESFERA-63', nome: 'Válvula Esfera DN63', categoria: 'VALVULAS' as const, unidade: 'UNIDADE' as const, quantidadeStock: 18, stockMinimo: 15, localizacao: 'Armazém C - Prateleira 2', fornecedor: 'Genebre', precoUnitario: 65.0 },
  { codigo: 'VAL-RETENCAO-110', nome: 'Válvula Retenção DN110', categoria: 'VALVULAS' as const, unidade: 'UNIDADE' as const, quantidadeStock: 12, stockMinimo: 10, localizacao: 'Armazém C - Prateleira 3', fornecedor: 'AVK', precoUnitario: 120.0 },
  { codigo: 'UNI-PVC-110', nome: 'União PVC DN110', categoria: 'ACESSORIOS' as const, unidade: 'UNIDADE' as const, quantidadeStock: 150, stockMinimo: 50, localizacao: 'Armazém A - Caixa 5', fornecedor: 'Politejo', precoUnitario: 3.5 },
  { codigo: 'CURVA-PVC-110', nome: 'Curva PVC 45° DN110', categoria: 'ACESSORIOS' as const, unidade: 'UNIDADE' as const, quantidadeStock: 80, stockMinimo: 30, localizacao: 'Armazém A - Caixa 6', fornecedor: 'Politejo', precoUnitario: 5.2 },
  { codigo: 'TE-PVC-110', nome: 'Te PVC DN110', categoria: 'ACESSORIOS' as const, unidade: 'UNIDADE' as const, quantidadeStock: 65, stockMinimo: 25, localizacao: 'Armazém A - Caixa 7', fornecedor: 'Politejo', precoUnitario: 8.8 },
  { codigo: 'COL-EPDM', nome: 'Cola EPDM para Juntas', categoria: 'MATERIAL_AGUA' as const, unidade: 'LITRO' as const, quantidadeStock: 25, stockMinimo: 10, localizacao: 'Armazém D - Químico', fornecedor: 'Sika', precoUnitario: 18.0 },
  { codigo: 'JUNTA-RUBBER', nome: 'Juntas de Borracha DN110', categoria: 'MATERIAL_AGUA' as const, unidade: 'UNIDADE' as const, quantidadeStock: 200, stockMinimo: 80, localizacao: 'Armazém A - Caixa 8', fornecedor: 'Politejo', precoUnitario: 2.1 },
  { codigo: 'REG-PVC-110', nome: 'Registo PVC DN110', categoria: 'MATERIAL_SANEAMENTO' as const, unidade: 'UNIDADE' as const, quantidadeStock: 35, stockMinimo: 15, localizacao: 'Armazém A - Caixa 9', fornecedor: 'Politejo', precoUnitario: 45.0 },
  { codigo: 'POCO-VISITA', nome: 'Poço de Visita Pré-fabricado', categoria: 'MATERIAL_SANEAMENTO' as const, unidade: 'UNIDADE' as const, quantidadeStock: 8, stockMinimo: 5, localizacao: 'Armazém E - Exterior', fornecedor: 'Precon', precoUnitario: 350.0 },
  { codigo: 'REG-GAS-32', nome: 'Registo de Gás DN32', categoria: 'MATERIAL_GAS' as const, unidade: 'UNIDADE' as const, quantidadeStock: 22, stockMinimo: 10, localizacao: 'Armazém B - Zona Gás', fornecedor: 'Galp', precoUnitario: 85.0 },
  { codigo: 'FITA-AVISO', nome: 'Fita de Aviso Subterrâneo', categoria: 'OUTROS' as const, unidade: 'METRO' as const, quantidadeStock: 500, stockMinimo: 100, localizacao: 'Armazém D - Prateleira 1', fornecedor: 'Brady', precoUnitario: 0.8 },
  { codigo: 'AREIA-BETAO', nome: 'Areia para Betão', categoria: 'PAVIMENTACAO' as const, unidade: 'KG' as const, quantidadeStock: 5000, stockMinimo: 1000, localizacao: 'Armazém E - Exterior', fornecedor: 'Secil', precoUnitario: 0.05 },
  { codigo: 'ASF-FRIAVEL', nome: 'Mistura Asfáltica a Frio', categoria: 'PAVIMENTACAO' as const, unidade: 'KG' as const, quantidadeStock: 800, stockMinimo: 500, localizacao: 'Armazém E - Exterior', fornecedor: 'Cimpor', precoUnitario: 0.12 },
  { codigo: 'PARALELO-GRAN', nome: 'Paralelo de Granito', categoria: 'PAVIMENTACAO' as const, unidade: 'UNIDADE' as const, quantidadeStock: 1500, stockMinimo: 500, localizacao: 'Armazém E - Exterior', fornecedor: 'Granitos do Centro', precoUnitario: 1.5 },
  { codigo: 'CINTA-PEAD', nome: 'Cinta de PEAD para Ramal', categoria: 'ACESSORIOS' as const, unidade: 'CAIXA' as const, quantidadeStock: 3, stockMinimo: 5, localizacao: 'Armazém A - Caixa 10', fornecedor: 'Uponor', precoUnitario: 45.0 },
  { codigo: 'CONTADOR-AGUA', nome: 'Contador de Água DN15', categoria: 'MATERIAL_AGUA' as const, unidade: 'UNIDADE' as const, quantidadeStock: 40, stockMinimo: 20, localizacao: 'Armazém C - Prateleira 4', fornecedor: 'Sensus', precoUnitario: 95.0 },
];

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
  const gestorPassword = await bcrypt.hash('gestor123', 10);

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

  const gestor = await prisma.user.create({
    data: {
      nome: 'Gestor de Obras',
      email: 'gestor@tarefasobedientes.pt',
      password: gestorPassword,
      role: 'GESTOR',
    },
  });

  await prisma.user.create({
    data: {
      nome: 'Gestor de Obras (Alt)',
      email: 'gestor@aquaredes.pt',
      password: gestorPassword,
      role: 'GESTOR',
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
