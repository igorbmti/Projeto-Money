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

  // Catálogo de Produtos para Venda / Gestão
  produtosCatalogo: [
    { id: 101, nome: "iPhone 14 Pro Max 256GB Deep Purple", sku: "IP14PM-256-DP", precoVenda: 5890.00, custoMedio: 4600.00, estoque: 4, categoria: "Smartphones" },
    { id: 102, nome: "iPhone 13 128GB Grafite", sku: "IP13-128-GR", precoVenda: 3190.00, custoMedio: 2450.00, estoque: 8, categoria: "Smartphones" },
    { id: 103, nome: "iPhone 12 128GB Preto", sku: "IP12-128-PR", precoVenda: 2550.00, custoMedio: 1980.00, estoque: 6, categoria: "Smartphones" },
    { id: 104, nome: "iPhone 11 64GB Branco", sku: "IP11-64-BR", precoVenda: 1890.00, custoMedio: 1420.00, estoque: 11, categoria: "Smartphones" },
    { id: 105, nome: "Apple Watch Series 8 45mm", sku: "AW-S8-45", precoVenda: 2390.00, custoMedio: 1750.00, estoque: 5, categoria: "Smartwatches" },
    { id: 106, nome: "AirPods Pro 2ª Geração", sku: "APP-GEN2", precoVenda: 1450.00, custoMedio: 980.00, estoque: 14, categoria: "Acessórios" },
    { id: 107, nome: "MacBook Air M1 256GB Space Gray", sku: "MBA-M1-SG", precoVenda: 4890.00, custoMedio: 3800.00, estoque: 2, categoria: "Notebooks" }
  ],

  // Lista de Vendas Recentes
  vendasRecentes: [
    {
      id: "VND-8492",
      cliente: "Marcos Vinicius",
      plataforma: "Mercado Livre",
      plataformaId: "meli",
      itens: "iPhone 13 128GB Grafite",
      qtdItens: 1,
      pagamento: "PIX",
      valorTotal: 3190.00,
      lucro: 740.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "Hoje, 16:42"
    },
    {
      id: "VND-8491",
      cliente: "Camila Rodrigues",
      plataforma: "WhatsApp",
      plataformaId: "wpp",
      itens: "iPhone 12 128GB + AirPods",
      qtdItens: 2,
      pagamento: "Cartão (3x)",
      valorTotal: 4000.00,
      lucro: 850.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "Hoje, 14:15"
    },
    {
      id: "VND-8490",
      cliente: "Lucas Santana",
      plataforma: "Shopee",
      plataformaId: "shopee",
      itens: "Apple Watch Series 7 45mm",
      qtdItens: 1,
      pagamento: "PIX",
      valorTotal: 2380.00,
      lucro: 490.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "Hoje, 11:20"
    },
    {
      id: "VND-8489",
      cliente: "Beatriz Nogueira",
      plataforma: "Instagram",
      plataformaId: "insta",
      itens: "iPhone 11 128GB Branco",
      qtdItens: 1,
      pagamento: "PIX",
      valorTotal: 2150.00,
      lucro: 420.00,
      status: "Pendente",
      statusClass: "badge-warning",
      data: "Ontem, 19:30"
    },
    {
      id: "VND-8488",
      cliente: "Renato Albuquerque",
      plataforma: "Loja Física",
      plataformaId: "outros",
      itens: "iPhone 14 Pro Max 256GB",
      qtdItens: 1,
      pagamento: "Dinheiro + PIX",
      valorTotal: 5890.00,
      lucro: 1290.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "Ontem, 16:05"
    },
    {
      id: "VND-8487",
      cliente: "Juliana Mendes",
      plataforma: "Mercado Livre",
      plataformaId: "meli",
      itens: "AirPods Pro 2ª Geração",
      qtdItens: 1,
      pagamento: "Cartão (1x)",
      valorTotal: 1450.00,
      lucro: 320.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "28/08, 15:40"
    }
  ],

  // Notificações do Sistema
  notificacoes: [
    { id: 1, titulo: "Estoque Baixo", desc: "MacBook Air M1 possui apenas 2 unidades.", tempo: "Há 25 min", unread: true },
    { id: 2, titulo: "Venda Aprovada", desc: "Venda #VND-8492 no Mercado Livre foi paga via PIX.", tempo: "Há 1h", unread: true },
    { id: 3, titulo: "Meta Atingida", desc: "Parabéns! Faturamento superou R$ 20.000 no mês.", tempo: "Há 3h", unread: false }
  ]
};
