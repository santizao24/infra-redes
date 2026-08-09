import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const obras = [
  {
    nome: 'Rede de Água - Rua Principal',
    referencia: 'OBR-2026-001',
    cliente: 'Câmara Municipal de Coimbra',
    tipo: 'AGUA' as const,
    estado: 'EM_EXECUCAO' as const,
    responsavel: 'João Silva',
    dataInicio: new Date('2026-03-10'),
    dataPrevistaFim: new Date('2026-06-30'),
    latitude: 40.2033,
    longitude: -8.4103,
    morada: 'Rua Principal, Coimbra',
    metrosPrevistos: 2000,
    metrosExecutados: 1450,
    tipoPavimento: 'ASFALTO' as const,
    estadoPavimento: 'PROVISORIO' as const,
    areaPavimento: 450,
    dataReposicaoProvisoria: new Date('2026-04-15'),
    descricao: 'Substituição de rede de abastecimento de água em via urbana.',
    imagemUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
    publica: true,
  },
  {
    nome: 'Rede de Saneamento - Oliveira do Hospital',
    referencia: 'OBR-2026-002',
    cliente: 'Águas do Centro Litoral',
    tipo: 'SANEAMENTO' as const,
    estado: 'EM_EXECUCAO' as const,
    responsavel: 'Maria Santos',
    dataInicio: new Date('2026-01-15'),
    dataPrevistaFim: new Date('2026-08-15'),
    latitude: 40.3596,
    longitude: -7.8619,
    morada: 'Av. Central, Oliveira do Hospital',
    metrosPrevistos: 3500,
    metrosExecutados: 2100,
    tipoPavimento: 'ASFALTO' as const,
    estadoPavimento: 'PROVISORIO' as const,
    descricao: 'Construção de coletor de saneamento principal.',
    imagemUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
    publica: true,
  },
  {
    nome: 'Rede de Gás - Zona Industrial',
    referencia: 'OBR-2026-003',
    cliente: 'Galp Gás Natural',
    tipo: 'GAS' as const,
    estado: 'PLANEADA' as const,
    responsavel: 'Pedro Costa',
    dataInicio: new Date('2026-05-01'),
    dataPrevistaFim: new Date('2026-10-30'),
    latitude: 40.6443,
    longitude: -8.6455,
    morada: 'Zona Industrial de Aveiro',
    metrosPrevistos: 1800,
    metrosExecutados: 0,
    descricao: 'Instalação de rede de distribuição de gás natural.',
    imagemUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
    publica: true,
  },
  {
    nome: 'Requalificação Água + Saneamento - Largo da Igreja',
    referencia: 'OBR-2025-004',
    cliente: 'Junta de Freguesia de Arganil',
    tipo: 'AGUA_SANEAMENTO' as const,
    estado: 'CONCLUIDA' as const,
    responsavel: 'Ana Ferreira',
    dataInicio: new Date('2025-06-01'),
    dataPrevistaFim: new Date('2025-11-30'),
    dataFim: new Date('2025-11-28'),
    latitude: 40.2183,
    longitude: -8.0542,
    morada: 'Largo da Igreja, Arganil',
    metrosPrevistos: 1200,
    metrosExecutados: 1200,
    tipoPavimento: 'CALCADA' as const,
    estadoPavimento: 'DEFINITIVO' as const,
    dataReposicaoDefinitiva: new Date('2025-11-20'),
    descricao: 'Requalificação integral de redes de água e saneamento.',
    imagemUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
    publica: true,
  },
  {
    nome: 'Rede de Água - Bairro Novo',
    referencia: 'OBR-2026-005',
    cliente: 'Municipio de Viseu',
    tipo: 'AGUA' as const,
    estado: 'EM_PREPARACAO' as const,
    responsavel: 'Carlos Mendes',
    dataInicio: new Date('2026-04-01'),
    dataPrevistaFim: new Date('2026-09-30'),
    latitude: 40.6566,
    longitude: -7.9122,
    morada: 'Bairro Novo, Viseu',
    metrosPrevistos: 2800,
    metrosExecutados: 0,
    descricao: 'Nova rede de abastecimento para expansão urbana.',
    imagemUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
    publica: true,
  },
  {
    nome: 'Coletor de Saneamento - Ribeira',
    referencia: 'OBR-2026-006',
    cliente: 'Câmara Municipal de Leiria',
    tipo: 'SANEAMENTO' as const,
    estado: 'SUSPENSA' as const,
    responsavel: 'João Silva',
    dataInicio: new Date('2026-02-01'),
    dataPrevistaFim: new Date('2026-07-31'),
    latitude: 39.7436,
    longitude: -8.8071,
    morada: 'Margem da Ribeira, Leiria',
    metrosPrevistos: 1500,
    metrosExecutados: 600,
    tipoPavimento: 'TERRA' as const,
    estadoPavimento: 'PROVISORIO' as const,
    descricao: 'Obra suspensa por condições meteorológicas adversas.',
    imagemUrl: 'https://images.unsplash.com/photo-1590856029826-c4a885a0d16?w=800',
    publica: true,
  },
  {
    nome: 'Rede de Gás - Centro Histórico',
    referencia: 'OBR-2025-007',
    cliente: 'Dourogás',
    tipo: 'GAS' as const,
    estado: 'CONCLUIDA' as const,
    responsavel: 'Pedro Costa',
    dataInicio: new Date('2025-03-01'),
    dataPrevistaFim: new Date('2025-08-31'),
    dataFim: new Date('2025-08-15'),
    latitude: 41.1579,
    longitude: -8.6291,
    morada: 'Centro Histórico, Porto',
    metrosPrevistos: 900,
    metrosExecutados: 900,
    tipoPavimento: 'PARALELOS' as const,
    estadoPavimento: 'DEFINITIVO' as const,
    descricao: 'Instalação de rede de gás em zona patrimonial.',
    imagemUrl: 'https://images.unsplash.com/photo-1589939705382-55e49310667?w=800',
    publica: true,
  },
  {
    nome: 'Infraestruturas Técnicas - Parque Empresarial',
    referencia: 'OBR-2026-008',
    cliente: 'Parque Industrial de Guarda',
    tipo: 'OUTRA' as const,
    estado: 'EM_EXECUCAO' as const,
    responsavel: 'Maria Santos',
    dataInicio: new Date('2026-02-15'),
    dataPrevistaFim: new Date('2026-12-15'),
    latitude: 40.5373,
    longitude: -7.2657,
    morada: 'Parque Empresarial, Guarda',
    metrosPrevistos: 4200,
    metrosExecutados: 1680,
    tipoPavimento: 'BETAO' as const,
    estadoPavimento: 'PROVISORIO' as const,
    descricao: 'Execução de infraestruturas subterrâneas técnicas.',
    imagemUrl: 'https://images.unsplash.com/photo-1541976590-713941681597?w=800',
    publica: true,
  },
  {
    nome: 'Rede de Água - Escola Secundária',
    referencia: 'OBR-2026-009',
    cliente: 'Ministério da Educação',
    tipo: 'AGUA' as const,
    estado: 'PLANEADA' as const,
    responsavel: 'Ana Ferreira',
    dataPrevistaFim: new Date('2026-11-30'),
    latitude: 40.2111,
    longitude: -8.4292,
    morada: 'Escola Secundária, Coimbra',
    metrosPrevistos: 650,
    metrosExecutados: 0,
    descricao: 'Renovação de rede de abastecimento escolar.',
    imagemUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800',
    publica: true,
  },
  {
    nome: 'Saneamento - Condomínio Residencial',
    referencia: 'OBR-2026-010',
    cliente: 'Condomínio Quinta das Flores',
    tipo: 'SANEAMENTO' as const,
    estado: 'EM_EXECUCAO' as const,
    responsavel: 'Carlos Mendes',
    dataInicio: new Date('2026-03-01'),
    dataPrevistaFim: new Date('2026-05-31'),
    latitude: 40.6405,
    longitude: -8.6538,
    morada: 'Quinta das Flores, Aveiro',
    metrosPrevistos: 800,
    metrosExecutados: 520,
    tipoPavimento: 'ASFALTO' as const,
    estadoPavimento: 'PROVISORIO' as const,
    descricao: 'Ligação ao coletor municipal de saneamento.',
    imagemUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
    publica: true,
  },
];

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
