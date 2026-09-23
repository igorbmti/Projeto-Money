/**
 * Garimpa - Mock Data Store
 * Dados alinhados ao modelo DER e à referência visual
 */

const MockData = {
  // Informações do Usuário e Loja
  user: {
    nome: "Igor",
    sobrenome: "Silva",
    email: "igor@garimpa.com.br",
    cargo: "Administrador / Proprietário",
    loja: "Garimpa Store",
    avatar: "IS"
  },

  // Períodos disponíveis
  periodos: [
    { id: "hoje", label: "Hoje" },
    { id: "7dias", label: "Últimos 7 dias" },
    { id: "este_mes", label: "Agosto 2026", default: true },
    { id: "mes_passado", label: "Julho 2026" },
    { id: "ano", label: "Ano 2026" }
  ],

  // Indicadores Principais (KPIs)
  kpis: {
    faturamento: {
      valor: 20180.00,
      formatado: "R$ 20.180,00",
      vendasCount: 21,
      crescimento: 21.6,
      periodoComp: "vs Julho",
      positivo: true
    },
    lucro: {
      valor: 2879.50,
      formatado: "R$ 2.879,50",
      margem: 14.3,
      crescimento: 14.3,
      periodoComp: "vs Julho",
      positivo: true
    },
    vendas: {
      valor: 21,
      formatado: "21",
      ticketMedio: "R$ 960,95",
      crescimento: 31.2,
      periodoComp: "vs Julho",
      positivo: true
    },
    aReceber: {
      valor: 4250.00,
      formatado: "R$ 4.250,00",
      pendentes: 3,
      crescimento: 8.7,
      periodoComp: "vs Julho",
      positivo: true
    },
    investimento: {
      valor: 17300.50,
      formatado: "R$ 17.300,50",
      estoqueValor: "R$ 64.800,00",
      crescimento: 5.2,
      periodoComp: "vs Julho",
      positivo: true
    },
    despesas: {
      valor: 1840.00,
      formatado: "R$ 1.840,00",
      qtdContas: 5,
      crescimento: -3.4,
      periodoComp: "vs Julho",
      positivo: true // redução de despesas é positivo
    }
  },

  // Dados diários para evolução no gráfico de barras (31 dias)
  graficoEvolucao: {
    dias: ["01/08", "03/08", "06/08", "09/08", "12/08", "15/08", "18/08", "20/08", "22/08", "25/08", "28/08", "31/08"],
    faturamento: [1100, 1450, 950, 1800, 2200, 1600, 2900, 4680, 2100, 1500, 1800, 2700],
    lucro: [220, 310, 180, 420, 560, 340, 680, 1150, 480, 320, 390, 620],
    investimento: [880, 1140, 770, 1380, 1640, 1260, 2220, 3530, 1620, 1180, 1410, 2080],
    despesas: [150, 80, 200, 120, 300, 140, 220, 180, 90, 160, 110, 90],
    stats: {
      maiorDia: { valor: "R$ 4.680,00", data: "20/08/2026" },
      mediaDiaria: { valor: "R$ 651,00", base: "31 dias" },
      crescimentoGeral: { valor: "+21,6%", ref: "vs Julho" }
    }
  },

  // Faturamento por Plataforma
  plataformas: [
    { id: "meli", nome: "Mercado Livre", percentual: 42, valor: 8475.60, cor: "#f59e0b", icone: "assets/icons/mercadolivre-badge.png", vendasQtd: 9 },
    { id: "shopee", nome: "Shopee", percentual: 28, valor: 5650.40, cor: "#ee4d2d", icone: "assets/icons/Shopee.png", vendasQtd: 6 },
    { id: "wpp", nome: "WhatsApp", percentual: 18, valor: 3632.40, cor: "#22c55e", icone: "assets/icons/Whatsapp.png", vendasQtd: 4 },
    { id: "insta", nome: "Instagram", percentual: 8, valor: 1614.40, cor: "#e1306c", icone: "assets/icons/Instagram.png", vendasQtd: 1 },
    { id: "outros", nome: "Outros / Balcão", percentual: 4, valor: 807.20, cor: "#8b5cf6", icone: "assets/icons/balcao.svg", vendasQtd: 1 }
  ],

  // Formas de Pagamento
  formasPagamento: [
    { id: "pix", nome: "PIX", percentual: 45, valor: 9081.00, transacoes: 9, cor: "#06b6d4" },
    { id: "cartao_credito", nome: "Cartão de Crédito", percentual: 32, valor: 6457.60, transacoes: 7, cor: "#7c3aed" },
    { id: "cartao_debito", nome: "Cartão de Débito", percentual: 15, valor: 3027.00, transacoes: 3, cor: "#3b82f6" },
    { id: "dinheiro", nome: "Dinheiro", percentual: 6, valor: 1210.80, transacoes: 1, cor: "#10b981" },
    { id: "outros", nome: "Outros", percentual: 2, valor: 403.60, transacoes: 1, cor: "#ec4899" }
  ],

  // Top Produtos Mais Vendidos
  topProdutos: [
    {
      id: 1,
      nome: "iPhone 13 128GB Grafite",
      detalhe: "Bateria 92% | Impecável",
      vendas: 6,
      faturamento: 5460.00,
      share: "27% do faturamento",
      imagem: "assets/products/iphone13.png",
      icone: "📱"
    },
    {
      id: 2,
      nome: "iPhone 12 128GB Preto",
      detalhe: "Bateria 88% | Caixa original",
      vendas: 5,
      faturamento: 4250.00,
      share: "21% do faturamento",
      imagem: "assets/products/iphone13.png",
      icone: "📱"
    },
    {
      id: 3,
      nome: "iPhone 11 128GB Branco",
      detalhe: "Bateria 85% | Cabo incluso",
      vendas: 4,
      faturamento: 3240.00,
      share: "16% do faturamento",
      imagem: "assets/products/iphone13.png",
      icone: "📱"
    },
    {
      id: 4,
      nome: "Apple Watch Series 7 45mm",
      detalhe: "Midnight | Saúde 100%",
      vendas: 3,
      faturamento: 2380.00,
      share: "12% do faturamento",
      imagem: "assets/products/apple_watch.jpg",
      icone: "⌚"
    }
  ],

  // Catálogo de Produtos para Venda & Gestão de Estoque
  produtosCatalogo: [
    {
      id: 101,
      nome: "iPhone 14 Pro Max 256GB Deep Purple",
      sku: "IP14PM-256-DP",
      investimento: 4600.00,
      precoVenda: 5890.00,
      lucroProjetado: 1290.00,
      margemProjetada: 21.9,
      gigas: "256GB",
      cor: "Deep Purple",
      bateria: 96,
      quantidade: 4,
      diasEstoque: 12,
      categoria: "Smartphones",
      imagem: "assets/products/iphone13.png"
    },
    {
      id: 102,
      nome: "iPhone 13 128GB Grafite",
      sku: "IP13-128-GR",
      investimento: 2450.00,
      precoVenda: 3190.00,
      lucroProjetado: 740.00,
      margemProjetada: 23.2,
      gigas: "128GB",
      cor: "Grafite",
      bateria: 92,
      quantidade: 8,
      diasEstoque: 18,
      categoria: "Smartphones",
      imagem: "assets/products/iphone13.png"
    },
    {
      id: 103,
      nome: "iPhone 12 128GB Preto",
      sku: "IP12-128-PR",
      investimento: 1980.00,
      precoVenda: 2550.00,
      lucroProjetado: 570.00,
      margemProjetada: 22.4,
      gigas: "128GB",
      cor: "Preto",
      bateria: 88,
      quantidade: 6,
      diasEstoque: 28,
      categoria: "Smartphones",
      imagem: "assets/products/iphone13.png"
    },
    {
      id: 104,
      nome: "Apple Watch Series 8 45mm",
      sku: "AW-S8-45-MN",
      investimento: 1750.00,
      precoVenda: 2390.00,
      lucroProjetado: 640.00,
      margemProjetada: 26.8,
      gigas: null, // Sem armazenamento específico
      cor: "Midnight",
      bateria: 100,
      quantidade: 5,
      diasEstoque: 22,
      categoria: "Smartwatches",
      imagem: "assets/products/apple_watch.jpg"
    },
    {
      id: 105,
      nome: "iPhone 11 64GB Branco",
      sku: "IP11-64-BR",
      investimento: 1420.00,
      precoVenda: 1890.00,
      lucroProjetado: 470.00,
      margemProjetada: 24.9,
      gigas: "64GB",
      cor: "Branco",
      bateria: 85,
      quantidade: 11,
      diasEstoque: 42,
      categoria: "Smartphones",
      imagem: "assets/products/iphone13.png"
    },
    {
      id: 106,
      nome: "MacBook Air M1 256GB Space Gray",
      sku: "MBA-M1-SG",
      investimento: 3800.00,
      precoVenda: 4890.00,
      lucroProjetado: 1090.00,
      margemProjetada: 22.3,
      gigas: "256GB",
      cor: "Space Gray",
      bateria: 94,
      quantidade: 2,
      diasEstoque: 15,
      categoria: "Notebooks",
      imagem: "assets/products/iphone13.png"
    },
    {
      id: 107,
      nome: "AirPods Pro 2ª Geração MagSafe",
      sku: "APP-GEN2-MAG",
      investimento: 980.00,
      precoVenda: 1450.00,
      lucroProjetado: 470.00,
      margemProjetada: 32.4,
      gigas: null, // Não se aplica
      cor: "Branco Glacial",
      bateria: null, // Sem medição individual de % bateria
      quantidade: 14,
      diasEstoque: 54,
      categoria: "Acessórios",
      imagem: "assets/products/iphone13.png"
    },
    {
      id: 108,
      nome: "Samsung Galaxy S23 Ultra 512GB",
      sku: "S23U-512-PH",
      investimento: 3950.00,
      precoVenda: 5190.00,
      lucroProjetado: 1240.00,
      margemProjetada: 23.9,
      gigas: "512GB",
      cor: "Phantom Black",
      bateria: 97,
      quantidade: 3,
      diasEstoque: 9,
      categoria: "Smartphones",
      imagem: "assets/products/iphone13.png"
    }
  ],

  // Lista de Vendas Recentes do Ciclo Mensal (com despesas operacionais vinculadas)
  vendasRecentes: [
    {
      id: "VND-8492",
      vendaNumero: 1,
      cliente: "Marcos Vinicius",
      plataforma: "Mercado Livre",
      plataformaId: "meli",
      itens: "iPhone 13 128GB Grafite",
      qtdItens: 1,
      pagamento: "PIX",
      valorTotal: 3190.00,
      custoCMV: 2450.00,
      despesasTotal: 105.00,
      despesasExtras: [
        { id_tipo: 2, nome: "Gasolina / Uber Entrega", categoria: "Transporte", icone: "car", valor: 30.00 },
        { id_tipo: 4, nome: "Película 3D & Aplicação", categoria: "Acessórios", icone: "shield", valor: 25.00 },
        { id_tipo: 1, nome: "Facebook Ads", categoria: "Marketing", icone: "megaphone", valor: 50.00 }
      ],
      lucro: 635.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "Hoje, 16:42",
      mesCiclo: "Agosto/2026"
    },
    {
      id: "VND-8491",
      vendaNumero: 2,
      cliente: "Camila Rodrigues",
      plataforma: "WhatsApp",
      plataformaId: "wpp",
      itens: "iPhone 12 128GB + AirPods",
      qtdItens: 2,
      pagamento: "Cartão (3x)",
      valorTotal: 4000.00,
      custoCMV: 2960.00,
      despesasTotal: 75.00,
      despesasExtras: [
        { id_tipo: 2, nome: "Gasolina / Uber Entrega", categoria: "Transporte", icone: "car", valor: 30.00 },
        { id_tipo: 8, nome: "Refeição em Trânsito", categoria: "Alimentação", icone: "coffee", valor: 45.00 }
      ],
      lucro: 965.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "Hoje, 14:15",
      mesCiclo: "Agosto/2026"
    },
    {
      id: "VND-8490",
      vendaNumero: 3,
      cliente: "Lucas Santana",
      plataforma: "Shopee",
      plataformaId: "shopee",
      itens: "Apple Watch Series 7 45mm",
      qtdItens: 1,
      pagamento: "PIX",
      valorTotal: 2380.00,
      custoCMV: 1750.00,
      despesasTotal: 35.00,
      despesasExtras: [
        { id_tipo: 5, nome: "Taxa Motoboy Express", categoria: "Logística", icone: "truck", valor: 20.00 },
        { id_tipo: 6, nome: "Embalagem Especial Presente", categoria: "Insumos", icone: "box", valor: 15.00 }
      ],
      lucro: 595.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "Hoje, 11:20",
      mesCiclo: "Agosto/2026"
    },
    {
      id: "VND-8489",
      vendaNumero: 4,
      cliente: "Beatriz Nogueira",
      plataforma: "Instagram",
      plataformaId: "insta",
      itens: "iPhone 11 128GB Branco",
      qtdItens: 1,
      pagamento: "PIX",
      valorTotal: 2150.00,
      custoCMV: 1420.00,
      despesasTotal: 95.00,
      despesasExtras: [
        { id_tipo: 1, nome: "Instagram Ads", categoria: "Marketing", icone: "megaphone", valor: 60.00 },
        { id_tipo: 2, nome: "Uber Retirada Fornecedor", categoria: "Transporte", icone: "car", valor: 35.00 }
      ],
      lucro: 635.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "Ontem, 19:30",
      mesCiclo: "Agosto/2026"
    },
    {
      id: "VND-8488",
      vendaNumero: 5,
      cliente: "Renato Albuquerque",
      plataforma: "Loja Física",
      plataformaId: "outros",
      itens: "iPhone 14 Pro Max 256GB",
      qtdItens: 1,
      pagamento: "Dinheiro + PIX",
      valorTotal: 5890.00,
      custoCMV: 4600.00,
      despesasTotal: 155.00,
      despesasExtras: [
        { id_tipo: 1, nome: "Facebook Ads Campanha", categoria: "Marketing", icone: "megaphone", valor: 80.00 },
        { id_tipo: 4, nome: "Película 3D Cerâmica", categoria: "Acessórios", icone: "shield", valor: 40.00 },
        { id_tipo: 8, nome: "Refeição em Negociação", categoria: "Alimentação", icone: "coffee", valor: 35.00 }
      ],
      lucro: 1135.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "Ontem, 16:05",
      mesCiclo: "Agosto/2026"
    },
    {
      id: "VND-8487",
      vendaNumero: 6,
      cliente: "Juliana Mendes",
      plataforma: "Mercado Livre",
      plataformaId: "meli",
      itens: "AirPods Pro 2ª Geração",
      qtdItens: 1,
      pagamento: "Cartão (1x)",
      valorTotal: 1450.00,
      custoCMV: 980.00,
      despesasTotal: 25.00,
      despesasExtras: [
        { id_tipo: 5, nome: "Motoboy Ponto de Coleta", categoria: "Logística", icone: "truck", valor: 25.00 }
      ],
      lucro: 445.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "28/08, 15:40",
      mesCiclo: "Agosto/2026"
    },
    {
      id: "VND-8486",
      vendaNumero: 7,
      cliente: "Felipe Guedes",
      plataforma: "WhatsApp",
      plataformaId: "wpp",
      itens: "MacBook Air M1 256GB",
      qtdItens: 1,
      pagamento: "PIX",
      valorTotal: 4890.00,
      custoCMV: 3800.00,
      despesasTotal: 90.00,
      despesasExtras: [
        { id_tipo: 5, nome: "Sedex com Seguro", categoria: "Logística", icone: "truck", valor: 65.00 },
        { id_tipo: 6, nome: "Caixa Reforçada e Bolha", categoria: "Insumos", icone: "box", valor: 25.00 }
      ],
      lucro: 1000.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "27/08, 11:15",
      mesCiclo: "Agosto/2026"
    },
    {
      id: "VND-8485",
      vendaNumero: 8,
      cliente: "Larissa Rezende",
      plataforma: "Shopee",
      plataformaId: "shopee",
      itens: "Samsung Galaxy S23 Ultra",
      qtdItens: 1,
      pagamento: "Cartão (6x)",
      valorTotal: 5190.00,
      custoCMV: 3950.00,
      despesasTotal: 110.00,
      despesasExtras: [
        { id_tipo: 1, nome: "Facebook Ads Conversão", categoria: "Marketing", icone: "megaphone", valor: 75.00 },
        { id_tipo: 2, nome: "Uber Coleta Lote", categoria: "Transporte", icone: "car", valor: 35.00 }
      ],
      lucro: 1130.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "26/08, 18:30",
      mesCiclo: "Agosto/2026"
    },
    {
      id: "VND-8484",
      vendaNumero: 9,
      cliente: "Gabriel Arantes",
      plataforma: "Mercado Livre",
      plataformaId: "meli",
      itens: "iPhone 12 64GB Azul",
      qtdItens: 1,
      pagamento: "PIX",
      valorTotal: 2400.00,
      custoCMV: 1850.00,
      despesasTotal: 110.00,
      despesasExtras: [
        { id_tipo: 3, nome: "Revisão e Troca Selo", categoria: "Manutenção", icone: "tool", valor: 85.00 },
        { id_tipo: 4, nome: "Película 3D", categoria: "Acessórios", icone: "shield", valor: 25.00 }
      ],
      lucro: 440.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "25/08, 14:00",
      mesCiclo: "Agosto/2026"
    },
    {
      id: "VND-8483",
      vendaNumero: 10,
      cliente: "Thiago Moreira",
      plataforma: "WhatsApp",
      plataformaId: "wpp",
      itens: "Apple Watch SE 40mm",
      qtdItens: 1,
      pagamento: "PIX",
      valorTotal: 1650.00,
      custoCMV: 1200.00,
      despesasTotal: 0.00,
      despesasExtras: [],
      lucro: 450.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "24/08, 10:20",
      mesCiclo: "Agosto/2026"
    },
    {
      id: "VND-8482",
      vendaNumero: 11,
      cliente: "Patricia Cunha",
      plataforma: "Instagram",
      plataformaId: "insta",
      itens: "iPhone 13 Pro 128GB Sierra Blue",
      qtdItens: 1,
      pagamento: "Cartão (2x)",
      valorTotal: 4100.00,
      custoCMV: 3200.00,
      despesasTotal: 85.00,
      despesasExtras: [
        { id_tipo: 1, nome: "Meta Ads Story", categoria: "Marketing", icone: "megaphone", valor: 55.00 },
        { id_tipo: 4, nome: "Cabo Turbo Brinde", categoria: "Acessórios", icone: "shield", valor: 30.00 }
      ],
      lucro: 815.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "23/08, 16:50",
      mesCiclo: "Agosto/2026"
    },
    {
      id: "VND-8481",
      vendaNumero: 12,
      cliente: "Rodrigo Fagundes",
      plataforma: "Loja Física",
      plataformaId: "outros",
      itens: "iPhone 11 64GB Preto",
      qtdItens: 1,
      pagamento: "PIX",
      valorTotal: 1890.00,
      custoCMV: 1420.00,
      despesasTotal: 50.00,
      despesasExtras: [
        { id_tipo: 4, nome: "Película 3D Cerâmica", categoria: "Acessórios", icone: "shield", valor: 25.00 },
        { id_tipo: 8, nome: "Almoço Equipe Balcão", categoria: "Alimentação", icone: "coffee", valor: 25.00 }
      ],
      lucro: 420.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "22/08, 15:10",
      mesCiclo: "Agosto/2026"
    }
  ],

  // Modelos e Tipos Parametrizados de Despesas (Configurados na Central de Despesas)
  tiposDespesasVenda: [
    { id: 1, nome: "Facebook / Instagram Ads", categoria: "Marketing & Ads", icone: "megaphone", tipoAplicacao: "VENDA", valorSugerido: 50.00 },
    { id: 2, nome: "Gasolina / Uber / Transporte", categoria: "Transporte & Logística", icone: "car", tipoAplicacao: "VENDA", valorSugerido: 30.00 },
    { id: 3, nome: "Reparo / Peças / Manutenção", categoria: "Manutenção & Peças", icone: "tool", tipoAplicacao: "VENDA", valorSugerido: 120.00 },
    { id: 4, nome: "Película 3D / Capinha / Brinde", categoria: "Acessórios & Brindes", icone: "shield", tipoAplicacao: "VENDA", valorSugerido: 25.00 },
    { id: 5, nome: "Taxa de Entrega / Motoboy Express", categoria: "Fretes & Entregas", icone: "truck", tipoAplicacao: "VENDA", valorSugerido: 20.00 },
    { id: 6, nome: "Embalagem & Caixa Especial", categoria: "Embalagens & Insumos", icone: "box", tipoAplicacao: "VENDA", valorSugerido: 15.00 },
    { id: 7, nome: "Comissão de Vendedor Avulso", categoria: "Comissões & Equipe", icone: "user-check", tipoAplicacao: "VENDA", valorSugerido: 80.00 },
    { id: 8, nome: "Taxa de Maquininha / Intermediação", categoria: "Taxas & Financeiro", icone: "credit-card", tipoAplicacao: "VENDA", valorSugerido: 35.00 },
    { id: 9, nome: "Outras Despesas de Venda", categoria: "Custos Diversos", icone: "receipt", tipoAplicacao: "VENDA", valorSugerido: 0.00 }
  ],

  // Notificações do Sistema
  notificacoes: [
    { id: 1, titulo: "Estoque Baixo", desc: "MacBook Air M1 possui apenas 2 unidades.", tempo: "Há 25 min", unread: true },
    { id: 2, titulo: "Venda Aprovada", desc: "Venda #VND-8492 no Mercado Livre foi paga via PIX.", tempo: "Há 1h", unread: true },
    { id: 3, titulo: "Meta Atingida", desc: "Parabéns! Faturamento superou R$ 20.000 no mês.", tempo: "Há 3h", unread: false }
  ],

  // Despesas Cadastradas (Fixas, Variáveis e Vinculadas a Vendas)
  despesas: [
    // --- DESPESAS FIXAS ---
    {
      id: 1,
      tipo: "fixa",
      descricao: "Aluguel & Ponto Comercial",
      categoria: "Aluguel & Instalações",
      valor: 1200.00,
      data: "Todo dia 10",
      dataVencimento: "2026-08-10",
      status: "pago",
      formaPagamento: "PIX",
      recorrente: true,
      observacao: "Contrato Anual Loja Física"
    },
    {
      id: 2,
      tipo: "fixa",
      descricao: "Internet Fibra 600MB + Telefonia",
      categoria: "Internet & Telefone",
      valor: 150.00,
      data: "Todo dia 15",
      dataVencimento: "2026-08-15",
      status: "pago",
      formaPagamento: "Boleto Bancário",
      recorrente: true,
      observacao: "Vivo Fibra Comercial"
    },
    {
      id: 3,
      tipo: "fixa",
      descricao: "Ferramentas & Softwares SaaS",
      categoria: "Software & SaaS",
      valor: 190.00,
      data: "Todo dia 20",
      dataVencimento: "2026-08-20",
      status: "avencer",
      formaPagamento: "Cartão de Crédito",
      recorrente: true,
      observacao: "Bling ERP + Shopify"
    },
    {
      id: 4,
      tipo: "fixa",
      descricao: "Honorários Contabilidade",
      categoria: "Contabilidade & Jurídico",
      valor: 350.00,
      data: "Todo dia 25",
      dataVencimento: "2026-08-25",
      status: "pendente",
      formaPagamento: "PIX",
      recorrente: true,
      observacao: "Assessoria Fiscal & Emissão NF"
    },
    {
      id: 5,
      tipo: "fixa",
      descricao: "Energia Elétrica (Enel)",
      categoria: "Energia Elétrica",
      valor: 180.00,
      data: "Todo dia 28",
      dataVencimento: "2026-08-28",
      status: "pago",
      formaPagamento: "Boleto Bancário",
      recorrente: true,
      observacao: "Consumo Loja"
    },

    // --- DESPESAS VINCULADAS A VENDAS (CUSTOS DIRETOS) ---
    {
      id: 12,
      tipo: "variavel",
      descricao: "Facebook Ads (Venda #VND-8492 • iPhone 13 128GB)",
      categoria: "Marketing & Ads",
      valor: 50.00,
      data: "Hoje, 16:42",
      dataVencimento: "2026-08-31",
      status: "pago",
      formaPagamento: "Cartão de Crédito",
      recorrente: false,
      idVenda: "VND-8492",
      produtoVendido: "iPhone 13 128GB Grafite",
      observacao: "Anúncio direcionado Instagram"
    },
    {
      id: 13,
      tipo: "variavel",
      descricao: "Película 3D & Aplicação (Venda #VND-8492 • iPhone 13 128GB)",
      categoria: "Acessórios & Brindes",
      valor: 25.00,
      data: "Hoje, 16:42",
      dataVencimento: "2026-08-31",
      status: "pago",
      formaPagamento: "PIX",
      recorrente: false,
      idVenda: "VND-8492",
      produtoVendido: "iPhone 13 128GB Grafite",
      observacao: "Película cerâmica cortesia"
    },
    {
      id: 14,
      tipo: "variavel",
      descricao: "Gasolina / Uber Entrega (Venda #VND-8491 • iPhone 12)",
      categoria: "Transporte & Logística",
      valor: 30.00,
      data: "Hoje, 14:15",
      dataVencimento: "2026-08-31",
      status: "pago",
      formaPagamento: "PIX",
      recorrente: false,
      idVenda: "VND-8491",
      produtoVendido: "iPhone 12 128GB + AirPods",
      observacao: "Deslocamento até o cliente"
    },

    // --- DESPESAS VARIÁVEIS GERAIS ---
    {
      id: 6,
      tipo: "variavel",
      descricao: "Gasolina (Abastecimento Retirada Lote)",
      categoria: "Gasolina & Combustível",
      valor: 220.00,
      data: "04/08/2026",
      dataVencimento: "2026-08-04",
      status: "pago",
      formaPagamento: "Cartão de Débito",
      recorrente: false,
      observacao: "Posto Shell - Viagem busca fornecedor"
    },
    {
      id: 7,
      tipo: "variavel",
      descricao: "Refeição & Alimentação em Trânsito",
      categoria: "Refeição & Alimentação",
      valor: 85.50,
      data: "03/08/2026",
      dataVencimento: "2026-08-03",
      status: "pago",
      formaPagamento: "PIX",
      recorrente: false,
      observacao: "Almoço na Santa Ifigênia"
    },
    {
      id: 8,
      tipo: "variavel",
      descricao: "Pedágio Rodovia dos Bandeirantes",
      categoria: "Pedágio & Estacionamento",
      valor: 34.80,
      data: "02/08/2026",
      dataVencimento: "2026-08-02",
      status: "pago",
      formaPagamento: "Sem Parar",
      recorrente: false,
      observacao: "2 praças de pedágio ida e volta"
    },
    {
      id: 9,
      tipo: "variavel",
      descricao: "Embalagens & Plástico Bolha 100m",
      categoria: "Embalagens & Logística",
      valor: 160.00,
      data: "01/08/2026",
      dataVencimento: "2026-08-01",
      status: "pago",
      formaPagamento: "PIX",
      recorrente: false,
      observacao: "Caixas correios + fita lacre"
    },
    {
      id: 10,
      tipo: "variavel",
      descricao: "Meta Ads (Anúncios Tráfego Pago Instagram)",
      categoria: "Marketing & Ads",
      valor: 450.00,
      data: "28/07/2026",
      dataVencimento: "2026-07-28",
      status: "pago",
      formaPagamento: "Cartão de Crédito",
      recorrente: false,
      observacao: "Campanha iPhone 13 & Watch"
    },
    {
      id: 11,
      tipo: "variavel",
      descricao: "Entrega Expressa Motoboy (Cliente VIP)",
      categoria: "Fretes & Entregas",
      valor: 45.00,
      data: "27/07/2026",
      dataVencimento: "2026-07-27",
      status: "pago",
      formaPagamento: "PIX",
      recorrente: false,
      observacao: "Entrega direta na Av. Paulista"
    }
  ]
};
