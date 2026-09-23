/**
 * Garimpa - Mock Data Store
 * Dados alinhados visualmente à experiência de alta performance do GarimPro
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
      valor: 4130.00,
      formatado: "R$ 4.130,00",
      vendasCount: 2,
      crescimento: 21.6,
      periodoComp: "vs Julho",
      positivo: true
    },
    lucro: {
      valor: 960.20,
      formatado: "R$ 960,20",
      margem: 14.3,
      crescimento: 14.3,
      periodoComp: "vs Julho",
      positivo: true
    },
    vendas: {
      valor: 2,
      formatado: "2",
      ticketMedio: "R$ 2.065,00",
      crescimento: 31.2,
      periodoComp: "vs Julho",
      positivo: true
    },
    aReceber: {
      valor: 0.00,
      formatado: "R$ 0,00",
      pendentes: 0,
      crescimento: 8.7,
      periodoComp: "vs Julho",
      positivo: true
    },
    investimento: {
      valor: 2600.00,
      formatado: "R$ 2.600,00",
      estoqueValor: "R$ 15.680,00",
      crescimento: 5.2,
      periodoComp: "vs Julho",
      positivo: true
    },
    despesas: {
      valor: 110.00,
      formatado: "R$ 110,00",
      qtdContas: 2,
      crescimento: -3.4,
      periodoComp: "vs Julho",
      positivo: true
    }
  },

  // Dados diários para evolução no gráfico de barras (12 pontos de referência)
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
    { id: "meli", nome: "Mercado Livre", percentual: 42, valor: 3530.00, cor: "#f59e0b", icone: "assets/icons/mercadolivre-badge.png", vendasQtd: 1 },
    { id: "shopee", nome: "Shopee", percentual: 28, valor: 1400.00, cor: "#ee4d2d", icone: "assets/icons/Shopee.png", vendasQtd: 0 },
    { id: "wpp", nome: "WhatsApp", percentual: 18, valor: 800.00, cor: "#22c55e", icone: "assets/icons/Whatsapp.png", vendasQtd: 0 },
    { id: "insta", nome: "Instagram", percentual: 8, valor: 400.00, cor: "#e1306c", icone: "assets/icons/Instagram.png", vendasQtd: 0 },
    { id: "outros", nome: "Balcão / Loja", percentual: 4, valor: 600.00, cor: "#8b5cf6", icone: "assets/icons/balcao.svg", vendasQtd: 1 }
  ],

  // Formas de Pagamento
  formasPagamento: [
    { id: "pix", nome: "PIX", percentual: 45, valor: 590.00, transacoes: 2, cor: "#06b6d4" },
    { id: "cartao_credito", nome: "Cartão de Crédito", percentual: 35, valor: 3530.00, transacoes: 1, cor: "#7c3aed" },
    { id: "dinheiro", nome: "Dinheiro", percentual: 12, valor: 200.00, transacoes: 1, cor: "#10b981" },
    { id: "cartao_debito", nome: "Cartão de Débito", percentual: 5, valor: 0.00, transacoes: 0, cor: "#3b82f6" },
    { id: "outros", nome: "Outros", percentual: 3, valor: 0.00, transacoes: 0, cor: "#ec4899" }
  ],

  // Top Produtos Mais Vendidos
  topProdutos: [
    {
      id: 2,
      nome: "Cabo USB-C Lightning 1m Original",
      detalhe: "Original Apple | 1 metro",
      vendas: 2,
      faturamento: 710.00,
      share: "17.2% do faturamento",
      imagem: "assets/products/iphone13.png",
      icone: "🔌"
    },
    {
      id: 1,
      nome: "iPhone 13 128GB Meia-Noite",
      detalhe: "Bateria 100% | Novo",
      vendas: 1,
      faturamento: 3500.00,
      share: "84.7% do faturamento",
      imagem: "assets/products/iphone13.png",
      icone: "📱"
    },
    {
      id: 3,
      nome: "Capinha Silicone iPhone 13",
      detalhe: "Silicone Premium",
      vendas: 1,
      faturamento: 80.00,
      share: "1.9% do faturamento",
      imagem: "assets/products/iphone13.png",
      icone: "🛡️"
    },
    {
      id: 5,
      nome: "Fone de Ouvido Bluetooth Teste",
      detalhe: "Cor: Preto | Armazenamento: N/A",
      vendas: 0,
      faturamento: 0.00,
      share: "0% do faturamento",
      imagem: "assets/products/iphone13.png",
      icone: "🎧"
    },
    {
      id: 6,
      nome: "Fone 22",
      detalhe: "Cor: preto | Armazenamento: N/A",
      vendas: 0,
      faturamento: 0.00,
      share: "0% do faturamento",
      imagem: "assets/products/upload_1788825430_3604.jpg",
      icone: "🎧"
    }
  ],

  // Catálogo de Produtos para Venda & Gestão de Estoque
  produtosCatalogo: [
    {
      id: 6,
      nome: "Fone 22",
      sku: "FONE-STD-596",
      investimento: 500.00,
      precoVenda: 800.00,
      lucroProjetado: 300.00,
      margemProjetada: 37.5,
      gigas: null,
      cor: "Preto",
      bateria: null,
      quantidade: 1,
      diasEstoque: 15,
      categoria: "Acessórios",
      imagem: "assets/products/upload_1788825430_3604.jpg"
    },
    {
      id: 5,
      nome: "Fone de Ouvido Bluetooth Teste",
      sku: "FONE-STD-600",
      investimento: 600.00,
      precoVenda: 800.00,
      lucroProjetado: 200.00,
      margemProjetada: 25.0,
      gigas: null,
      cor: "Preto",
      bateria: null,
      quantidade: 1,
      diasEstoque: 15,
      categoria: "Acessórios",
      imagem: "assets/products/iphone13.png"
    },
    {
      id: 3,
      nome: "Capinha Silicone iPhone 13",
      sku: "CAP-SIL-IPH13",
      investimento: 20.00,
      precoVenda: 80.00,
      lucroProjetado: 60.00,
      margemProjetada: 75.0,
      gigas: null,
      cor: "Transparente",
      bateria: null,
      quantidade: 30,
      diasEstoque: 20,
      categoria: "Acessórios",
      imagem: "assets/products/iphone13.png"
    },
    {
      id: 2,
      nome: "Cabo USB-C Lightning 1m Original",
      sku: "CAB-USBC-LG-1M",
      investimento: 43.57,
      precoVenda: 120.00,
      lucroProjetado: 76.43,
      margemProjetada: 63.7,
      gigas: null,
      cor: "Branco",
      bateria: null,
      quantidade: 65,
      diasEstoque: 20,
      categoria: "Acessórios",
      imagem: "assets/products/iphone13.png"
    },
    {
      id: 1,
      nome: "iPhone 13 128GB Meia-Noite",
      sku: "IPH13-128-BLK",
      investimento: 2400.00,
      precoVenda: 3500.00,
      lucroProjetado: 1100.00,
      margemProjetada: 31.4,
      gigas: "128GB",
      cor: "Meia-Noite",
      bateria: 100,
      quantidade: 4,
      diasEstoque: 20,
      categoria: "Smartphones",
      imagem: "assets/products/iphone13.png"
    }
  ],

  // Histórico de Vendas
  vendasRecentes: [
    {
      id: "VEN-0003",
      vendaNumero: 3,
      cliente: "João da Silva",
      plataforma: "Venda presencial",
      plataformaId: "outros",
      itens: "Cabo USB-C Lightning 1m Original (x5)",
      qtdItens: 5,
      pagamento: "PIX",
      valorTotal: 600.00,
      custoCMV: 200.00,
      despesasTotal: 35.00,
      despesasExtras: [
        { id_tipo: 5, nome: "Taxa Motoboy Express", categoria: "Logística", icone: "truck", valor: 20.00 },
        { id_tipo: 6, nome: "Embalagem Especial Presente", categoria: "Insumos", icone: "box", valor: 15.00 }
      ],
      lucro: 365.00,
      status: "Concluído",
      statusClass: "badge-success",
      data: "15/08, 16:00",
      mesCiclo: "Agosto/2026"
    },
    {
      id: "VEN-0002",
      vendaNumero: 2,
      cliente: "Maria Souza",
      plataforma: "Mercado Livre",
      plataformaId: "meli",
      itens: "iPhone 13 128GB Meia-Noite (x1)",
      qtdItens: 1,
      pagamento: "Cartão de Crédito",
      valorTotal: 3530.00,
      custoCMV: 2400.00,
      despesasTotal: 75.00,
      despesasExtras: [
        { id_tipo: 2, nome: "Gasolina / Uber Entrega", categoria: "Transporte", icone: "car", valor: 30.00 },
        { id_tipo: 8, nome: "Refeição em Trânsito", categoria: "Alimentação", icone: "coffee", valor: 45.00 }
      ],
      lucro: 485.20,
      status: "Concluído",
      statusClass: "badge-success",
      data: "12/08, 14:15",
      mesCiclo: "Agosto/2026"
    },
    {
      id: "VEN-0001",
      vendaNumero: 1,
      cliente: "João da Silva",
      plataforma: "Venda presencial",
      plataformaId: "outros",
      itens: "Cabo USB-C Lightning (x1), Capinha Silicone (x1)",
      qtdItens: 2,
      pagamento: "PIX",
      valorTotal: 190.00,
      custoCMV: 60.00,
      despesasTotal: 105.00,
      despesasExtras: [
        { id_tipo: 2, nome: "Gasolina / Uber Entrega", categoria: "Transporte", icone: "car", valor: 30.00 },
        { id_tipo: 4, nome: "Película 3D & Aplicação", categoria: "Acessórios", icone: "shield", valor: 25.00 },
        { id_tipo: 1, nome: "Facebook Ads", categoria: "Marketing", icone: "megaphone", valor: 50.00 }
      ],
      lucro: 25.00,
      status: "Cancelada",
      statusClass: "badge-danger",
      data: "10/08, 10:30",
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
    { id: 1, titulo: "Estoque Baixo", desc: "iPhone 13 possui apenas 4 unidades.", tempo: "Há 25 min", unread: true },
    { id: 2, titulo: "Venda Aprovada", desc: "Venda #VEN-0002 no Mercado Livre foi paga via Cartão de Crédito.", tempo: "Há 1h", unread: true },
    { id: 3, titulo: "Meta Atingida", desc: "Parabéns! Faturamento superou R$ 4.000 no mês.", tempo: "Há 3h", unread: false }
  ],

  // Despesas Cadastradas
  despesas: [
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
    {
      id: 12,
      tipo: "variavel",
      descricao: "Gasolina / Uber Entrega (Venda #VEN-0002 • iPhone 13)",
      categoria: "Transporte & Logística",
      valor: 30.00,
      data: "12/08, 14:15",
      dataVencimento: "2026-08-12",
      status: "pago",
      formaPagamento: "PIX",
      recorrente: false,
      idVenda: "VEN-0002",
      produtoVendido: "iPhone 13 128GB Meia-Noite",
      observacao: "Deslocamento entrega"
    },
    {
      id: 13,
      tipo: "variavel",
      descricao: "Refeição em Trânsito (Venda #VEN-0002 • iPhone 13)",
      categoria: "Refeição & Alimentação",
      valor: 45.00,
      data: "12/08, 14:15",
      dataVencimento: "2026-08-12",
      status: "pago",
      formaPagamento: "PIX",
      recorrente: false,
      idVenda: "VEN-0002",
      produtoVendido: "iPhone 13 128GB Meia-Noite",
      observacao: "Alimentação entrega"
    },
    {
      id: 14,
      tipo: "variavel",
      descricao: "Taxa Motoboy Express (Venda #VEN-0003 • Cabos USB-C)",
      categoria: "Fretes & Entregas",
      valor: 20.00,
      data: "15/08, 16:00",
      dataVencimento: "2026-08-15",
      status: "pago",
      formaPagamento: "PIX",
      recorrente: false,
      idVenda: "VEN-0003",
      produtoVendido: "Cabo USB-C Lightning 1m Original",
      observacao: "Entrega expressa"
    },
    {
      id: 15,
      tipo: "variavel",
      descricao: "Embalagem Especial Presente (Venda #VEN-0003 • Cabos USB-C)",
      categoria: "Embalagens & Logística",
      valor: 15.00,
      data: "15/08, 16:00",
      dataVencimento: "2026-08-15",
      status: "pago",
      formaPagamento: "PIX",
      recorrente: false,
      idVenda: "VEN-0003",
      produtoVendido: "Cabo USB-C Lightning 1m Original",
      observacao: "Caixa presente"
    }
  ]
};
