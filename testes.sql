-- ==============================================================================
-- BATERIA DE TESTES DE INTEGRIDADE, TRANSAÇÕES E REGRAS FINANCEIRAS
-- ==============================================================================

USE `controle_vendas`;

-- ------------------------------------------------------------------------------
-- 1. PREPARAÇÃO DE DADOS BASE DE TESTE
-- ------------------------------------------------------------------------------

-- Inserção de Vendedor
INSERT INTO `usuarios` (`id_perfil`, `nome`, `email`, `senha`, `telefone`, `ativo`) VALUES
(3, 'Carlos Vendedor', 'carlos@vendas.com', '$2y$10$wN92mJv8.vR.xZ6Zl63YfOHW7y93Yw5z1Y7LpXh71F.N.kYI3/H1.', '(11) 98888-1111', 1);
SET @id_usuario_vendedor = LAST_INSERT_ID();

-- Inserção de Clientes
INSERT INTO `clientes` (`nome`, `cpf_cnpj`, `telefone`, `email`, `cidade`, `estado`, `ativo`) VALUES
('João da Silva', '123.456.789-00', '(11) 97777-2222', 'joao@cliente.com', 'São Paulo', 'SP', 1),
('Maria Souza', '987.654.321-99', '(21) 96666-3333', 'maria@cliente.com', 'Rio de Janeiro', 'RJ', 1);
SET @id_cliente_joao = 1;
SET @id_cliente_maria = 2;

-- Inserção de Produtos
-- Produto 1: iPhone 13 128GB (Controlado individualmente e com estoque)
INSERT INTO `produtos` (`id_categoria`, `nome`, `sku`, `codigo_barras`, `unidade`, `preco_venda`, `margem_desejada`, `estoque_minimo`, `controla_estoque`, `controla_unidade`) VALUES
(1, 'iPhone 13 128GB Meia-Noite', 'IPH13-128-BLK', '789100000001', 'UN', 3500.00, 25.00, 2.00, 1, 1);
SET @id_prod_iphone = LAST_INSERT_ID();

-- Produto 2: Cabo USB-C Lightning 1m (Controlado por quantidade)
INSERT INTO `produtos` (`id_categoria`, `nome`, `sku`, `codigo_barras`, `unidade`, `preco_venda`, `margem_desejada`, `estoque_minimo`, `controla_estoque`, `controla_unidade`) VALUES
(2, 'Cabo USB-C Lightning 1m Original', 'CAB-USBC-LG-1M', '789100000002', 'UN', 120.00, 50.00, 10.00, 1, 0);
SET @id_prod_cabo = LAST_INSERT_ID();

-- Produto 3: Capinha Silicone Premium (Controlado por quantidade)
INSERT INTO `produtos` (`id_categoria`, `nome`, `sku`, `codigo_barras`, `unidade`, `preco_venda`, `margem_desejada`, `estoque_minimo`, `controla_estoque`, `controla_unidade`) VALUES
(2, 'Capinha Silicone iPhone 13', 'CAP-SIL-IPH13', '789100000003', 'UN', 80.00, 60.00, 5.00, 1, 0);
SET @id_prod_capa = LAST_INSERT_ID();

-- Inserção de Custos Iniciais e Saldo Inicial de Estoque
-- iPhone: Custo R$ 2.400,00 | Qtd: 5 unidades
INSERT INTO `historico_custos` (`id_produto`, `custo_unitario`, `quantidade`, `data_custo`, `observacao`) VALUES
(@id_prod_iphone, 2400.00, 5.00, '2026-08-01', 'Lote de importação NF 101');

INSERT INTO `estoque` (`id_produto`, `quantidade_atual`, `custo_medio`, `valor_investido`) VALUES
(@id_prod_iphone, 5.00, 2400.00, 12000.00);

INSERT INTO `movimentacoes_estoque` (`id_produto`, `id_usuario`, `tipo_movimentacao`, `quantidade`, `custo_unitario`, `documento_referencia`, `observacao`) VALUES
(@id_prod_iphone, 1, 'ENTRADA', 5.00, 2400.00, 'NF 101', 'Entrada inicial de estoque');

-- Cabo: Custo R$ 40,00 | Qtd: 50 unidades
INSERT INTO `historico_custos` (`id_produto`, `custo_unitario`, `quantidade`, `data_custo`, `observacao`) VALUES
(@id_prod_cabo, 40.00, 50.00, '2026-08-05', 'Fornecedor Distribuidor SP');

INSERT INTO `estoque` (`id_produto`, `quantidade_atual`, `custo_medio`, `valor_investido`) VALUES
(@id_prod_cabo, 50.00, 40.00, 2000.00);

INSERT INTO `movimentacoes_estoque` (`id_produto`, `id_usuario`, `tipo_movimentacao`, `quantidade`, `custo_unitario`, `documento_referencia`, `observacao`) VALUES
(@id_prod_cabo, 1, 'ENTRADA', 50.00, 40.00, 'NF 102', 'Estoque inicial cabos');

-- Capinha: Custo R$ 20,00 | Qtd: 30 unidades
INSERT INTO `historico_custos` (`id_produto`, `custo_unitario`, `quantidade`, `data_custo`, `observacao`) VALUES
(@id_prod_capa, 20.00, 30.00, '2026-08-05', 'Fornecedor Acessórios');

INSERT INTO `estoque` (`id_produto`, `quantidade_atual`, `custo_medio`, `valor_investido`) VALUES
(@id_prod_capa, 30.00, 20.00, 600.00);

INSERT INTO `movimentacoes_estoque` (`id_produto`, `id_usuario`, `tipo_movimentacao`, `quantidade`, `custo_unitario`, `documento_referencia`, `observacao`) VALUES
(@id_prod_capa, 1, 'ENTRADA', 30.00, 20.00, 'NF 103', 'Estoque inicial capinhas');

-- Rastreabilidade de unidades físicas serializadas (iPhone)
INSERT INTO `unidades_produto` (`id_produto`, `numero_serie`, `imei`, `custo_aquisicao`, `estado_conservacao`, `percentual_bateria`, `status`) VALUES
(@id_prod_iphone, 'DNPD9876K3', '352987110001234', 2400.00, 'NOVO', 100.00, 'DISPONIVEL'),
(@id_prod_iphone, 'DNPD9877K4', '352987110001235', 2400.00, 'NOVO', 100.00, 'DISPONIVEL');

-- ------------------------------------------------------------------------------
-- TESTE 1: VENDA À VISTA (Presencial / Balcão, 1 Cabo + 1 Capinha, PIX)
-- Subtotal: R$ 200,00 | Desconto: R$ 10,00 | Total: R$ 190,00
-- Custo: (40 + 20) = R$ 60,00 | Lucro Bruto: R$ 130,00 | Taxa: R$ 0,00 | Lucro Líquido: R$ 130,00 | Margem: 68.42%
-- ------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `vendas` (
    `id_cliente`, `id_usuario`, `id_plataforma`, `data_venda`,
    `subtotal`, `desconto`, `frete`, `valor_total`,
    `custo_total`, `taxas_total`, `lucro_bruto`, `lucro_liquido`, `margem_percentual`,
    `tipo_venda`, `status`, `observacoes`
) VALUES (
    @id_cliente_joao, @id_usuario_vendedor, 5, '2026-08-10 10:30:00',
    200.00, 10.00, 0.00, 190.00,
    60.00, 0.00, 130.00, 130.00, 68.42,
    'A_VISTA', 'CONCLUIDA', 'Venda balcão paga via PIX'
);
SET @id_venda_1 = LAST_INSERT_ID();

-- Itens da venda
INSERT INTO `itens_venda` (`id_venda`, `id_produto`, `quantidade`, `preco_unitario`, `desconto`, `custo_unitario`, `custo_total`, `valor_total`, `lucro_bruto`) VALUES
(@id_venda_1, @id_prod_cabo, 1.00, 120.00, 10.00, 40.00, 40.00, 110.00, 70.00),
(@id_venda_1, @id_prod_capa, 1.00, 80.00, 0.00, 20.00, 20.00, 80.00, 60.00);

-- Pagamento à vista PIX
INSERT INTO `pagamentos` (`id_venda`, `id_forma_pagamento`, `valor`, `quantidade_parcelas`, `percentual_taxa`, `valor_taxa`, `data_pagamento`, `status`, `observacao`) VALUES
(@id_venda_1, 1, 190.00, 1, 0.00, 0.00, '2026-08-10 10:30:00', 'CONFIRMADO', 'PIX chave telefone');

-- Baixa no estoque
UPDATE `estoque` SET `quantidade_atual` = `quantidade_atual` - 1.00, `valor_investido` = `quantidade_atual` * `custo_medio` WHERE `id_produto` = @id_prod_cabo;
UPDATE `estoque` SET `quantidade_atual` = `quantidade_atual` - 1.00, `valor_investido` = `quantidade_atual` * `custo_medio` WHERE `id_produto` = @id_prod_capa;

-- Extrato de movimentação
INSERT INTO `movimentacoes_estoque` (`id_produto`, `id_usuario`, `tipo_movimentacao`, `quantidade`, `custo_unitario`, `documento_referencia`, `observacao`) VALUES
(@id_prod_cabo, @id_usuario_vendedor, 'VENDA', 1.00, 40.00, CONCAT('VENDA #', @id_venda_1), 'Saída venda balcão'),
(@id_prod_capa, @id_usuario_vendedor, 'VENDA', 1.00, 20.00, CONCAT('VENDA #', @id_venda_1), 'Saída venda balcão');

-- Auditoria
INSERT INTO `auditoria` (`id_usuario`, `tabela`, `id_registro`, `acao`, `dados_novos`) VALUES
(@id_usuario_vendedor, 'vendas', @id_venda_1, 'INSERT', JSON_OBJECT('id_venda', @id_venda_1, 'valor_total', 190.00, 'status', 'CONCLUIDA'));

COMMIT;

-- ------------------------------------------------------------------------------
-- TESTE 2: VENDA A PRAZO NO MERCADO LIVRE COM PARCELAS E TAXAS
-- Produto: 1 iPhone 13 (R$ 3.500,00) + Frete: R$ 30,00 = R$ 3.530,00
-- Custo: R$ 2.400,00 | Taxa ML (16% + R$ 5,00) = R$ 569,80
-- Lucro Bruto: R$ 3.530 - R$ 2.400 = R$ 1.130,00
-- Lucro Líquido: R$ 1.130,00 - R$ 569,80 = R$ 560,20 | Margem Líquida: 15.87%
-- Pagamento em 3x no Cartão de Crédito
-- ------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `vendas` (
    `id_cliente`, `id_usuario`, `id_plataforma`, `data_venda`,
    `subtotal`, `desconto`, `frete`, `valor_total`,
    `custo_total`, `taxas_total`, `lucro_bruto`, `lucro_liquido`, `margem_percentual`,
    `tipo_venda`, `status`, `observacoes`
) VALUES (
    @id_cliente_maria, @id_usuario_vendedor, 1, '2026-08-12 14:15:00',
    3500.00, 0.00, 30.00, 3530.00,
    2400.00, 569.80, 1130.00, 560.20, 15.87,
    'A_PRAZO', 'CONCLUIDA', 'Venda Mercado Livre #MLB-998822'
);
SET @id_venda_2 = LAST_INSERT_ID();

-- Item
INSERT INTO `itens_venda` (`id_venda`, `id_produto`, `quantidade`, `preco_unitario`, `desconto`, `custo_unitario`, `custo_total`, `valor_total`, `lucro_bruto`) VALUES
(@id_venda_2, @id_prod_iphone, 1.00, 3500.00, 0.00, 2400.00, 2400.00, 3500.00, 1100.00);

-- Taxa da Plataforma / Cartão
INSERT INTO `taxas` (`id_venda`, `id_plataforma`, `tipo_taxa`, `descricao`, `percentual`, `valor`) VALUES
(@id_venda_2, 1, 'COMISSAO_PLATAFORMA', 'Comissão Mercado Livre 16% + Taxa Fixa', 16.00, 569.80);

-- Pagamento em 3x no Cartão
INSERT INTO `pagamentos` (`id_venda`, `id_forma_pagamento`, `valor`, `quantidade_parcelas`, `percentual_taxa`, `valor_taxa`, `data_pagamento`, `status`, `observacao`) VALUES
(@id_venda_2, 4, 3530.00, 3, 0.00, 0.00, '2026-08-12 14:15:00', 'CONFIRMADO', 'Cartão 3x sem juros');
SET @id_pagamento_2 = LAST_INSERT_ID();

-- Parcelas
INSERT INTO `parcelas` (`id_pagamento`, `numero_parcela`, `quantidade_parcelas`, `valor`, `data_vencimento`, `status`) VALUES
(@id_pagamento_2, 1, 3, 1176.68, '2026-09-12', 'RECEBIDA'),
(@id_pagamento_2, 2, 3, 1176.66, '2026-10-12', 'PENDENTE'),
(@id_pagamento_2, 3, 3, 1176.66, '2026-11-12', 'PENDENTE');

-- Baixa de estoque
UPDATE `estoque` SET `quantidade_atual` = `quantidade_atual` - 1.00, `valor_investido` = `quantidade_atual` * `custo_medio` WHERE `id_produto` = @id_prod_iphone;

-- Atualizar status da unidade individual (IMEI / Serial)
UPDATE `unidades_produto` SET `status` = 'VENDIDO', `data_saida` = '2026-08-12 14:15:00' WHERE `numero_serie` = 'DNPD9876K3';

-- Movimentação
INSERT INTO `movimentacoes_estoque` (`id_produto`, `id_usuario`, `tipo_movimentacao`, `quantidade`, `custo_unitario`, `documento_referencia`, `observacao`) VALUES
(@id_prod_iphone, @id_usuario_vendedor, 'VENDA', 1.00, 2400.00, CONCAT('VENDA #', @id_venda_2), 'Saída serial DNPD9876K3');

-- Auditoria
INSERT INTO `auditoria` (`id_usuario`, `tabela`, `id_registro`, `acao`, `dados_novos`) VALUES
(@id_usuario_vendedor, 'vendas', @id_venda_2, 'INSERT', JSON_OBJECT('id_venda', @id_venda_2, 'valor_total', 3530.00, 'status', 'CONCLUIDA'));

COMMIT;

-- ------------------------------------------------------------------------------
-- TESTE 3: VENDA COM MÚLTIPLAS FORMAS DE PAGAMENTO (HÍBRIDA: PIX + DINHEIRO)
-- 5 Cabos USB-C = R$ 600,00 | Custo: 5 * 40 = R$ 200,00 | Lucro: R$ 400,00
-- Pagamento: R$ 400 no PIX + R$ 200 em Dinheiro
-- ------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `vendas` (
    `id_cliente`, `id_usuario`, `id_plataforma`, `data_venda`,
    `subtotal`, `desconto`, `frete`, `valor_total`,
    `custo_total`, `taxas_total`, `lucro_bruto`, `lucro_liquido`, `margem_percentual`,
    `tipo_venda`, `status`, `observacoes`
) VALUES (
    @id_cliente_joao, @id_usuario_vendedor, 5, '2026-08-15 16:00:00',
    600.00, 0.00, 0.00, 600.00,
    200.00, 0.00, 400.00, 400.00, 66.67,
    'A_VISTA', 'CONCLUIDA', 'Venda híbrida PIX + Dinheiro'
);
SET @id_venda_3 = LAST_INSERT_ID();

INSERT INTO `itens_venda` (`id_venda`, `id_produto`, `quantidade`, `preco_unitario`, `desconto`, `custo_unitario`, `custo_total`, `valor_total`, `lucro_bruto`) VALUES
(@id_venda_3, @id_prod_cabo, 5.00, 120.00, 0.00, 40.00, 200.00, 600.00, 400.00);

-- Pagamento 1: PIX R$ 400,00
INSERT INTO `pagamentos` (`id_venda`, `id_forma_pagamento`, `valor`, `quantidade_parcelas`, `data_pagamento`, `status`, `observacao`) VALUES
(@id_venda_3, 1, 400.00, 1, '2026-08-15 16:00:00', 'CONFIRMADO', 'Parte 1 em PIX');

-- Pagamento 2: Dinheiro R$ 200,00
INSERT INTO `pagamentos` (`id_venda`, `id_forma_pagamento`, `valor`, `quantidade_parcelas`, `data_pagamento`, `status`, `observacao`) VALUES
(@id_venda_3, 2, 200.00, 1, '2026-08-15 16:00:00', 'CONFIRMADO', 'Parte 2 em espécie no caixa');

-- Baixa de estoque
UPDATE `estoque` SET `quantidade_atual` = `quantidade_atual` - 5.00, `valor_investido` = `quantidade_atual` * `custo_medio` WHERE `id_produto` = @id_prod_cabo;

INSERT INTO `movimentacoes_estoque` (`id_produto`, `id_usuario`, `tipo_movimentacao`, `quantidade`, `custo_unitario`, `documento_referencia`, `observacao`) VALUES
(@id_prod_cabo, @id_usuario_vendedor, 'VENDA', 5.00, 40.00, CONCAT('VENDA #', @id_venda_3), 'Saída 5 unidades cabo');

COMMIT;

-- ------------------------------------------------------------------------------
-- TESTE 4: PRESERVAÇÃO DO HISTÓRICO DE CUSTO (ALTERAÇÃO DE PREÇO FUTURO)
-- Novo lote de cabos chega a R$ 55,00 (antes era R$ 40,00).
-- As vendas passadas (Venda 1 e Venda 3) DEVEM manter custo_unitario = 40.00!
-- ------------------------------------------------------------------------------
INSERT INTO `historico_custos` (`id_produto`, `custo_unitario`, `quantidade`, `data_custo`, `observacao`) VALUES
(@id_prod_cabo, 55.00, 20.00, '2026-08-20', 'Novo lote com reajuste de fornecedor');

-- Atualização de custo médio no estoque
UPDATE `estoque` 
SET `quantidade_atual` = `quantidade_atual` + 20.00,
    `custo_medio` = ROUND(((`quantidade_atual` * `custo_medio`) + (20.00 * 55.00)) / (`quantidade_atual` + 20.00), 2),
    `valor_investido` = `quantidade_atual` * `custo_medio`
WHERE `id_produto` = @id_prod_cabo;

INSERT INTO `movimentacoes_estoque` (`id_produto`, `id_usuario`, `tipo_movimentacao`, `quantidade`, `custo_unitario`, `documento_referencia`, `observacao`) VALUES
(@id_prod_cabo, 1, 'ENTRADA', 20.00, 55.00, 'NF 205', 'Novo lote reajustado');

-- ------------------------------------------------------------------------------
-- TESTE 5: DESPESAS OPERACIONAIS (SEPARADAS DE CUSTO DE PRODUTO E TAXA)
-- ------------------------------------------------------------------------------
INSERT INTO `despesas` (`id_categoria_despesa`, `id_usuario`, `descricao`, `valor`, `data_competencia`, `data_vencimento`, `data_pagamento`, `status`, `recorrente`) VALUES
(5, 1, 'Aluguel Loja Física Agosto/2026', 1200.00, '2026-08-01', '2026-08-10', '2026-08-09 11:00:00', 'PAGA', 1),
(2, 1, 'Meta Ads - Anúncios Instagram', 300.00, '2026-08-01', '2026-08-25', '2026-08-24 15:30:00', 'PAGA', 0),
(6, 1, 'Conta de Luz Enel', 180.00, '2026-08-01', '2026-08-28', NULL, 'PENDENTE', 1);

-- ------------------------------------------------------------------------------
-- TESTE 6: CANCELAMENTO DE VENDA COM DEVOLUÇÃO AO ESTOQUE E AUDITORIA
-- Simulação de cancelamento da Venda #1
-- ------------------------------------------------------------------------------
START TRANSACTION;

-- 1. Capturar estado anterior para auditoria
SELECT JSON_OBJECT('id_venda', `id_venda`, 'status', `status`, 'valor_total', `valor_total`) 
INTO @dados_anteriores 
FROM `vendas` 
WHERE `id_venda` = @id_venda_1;

-- 2. Alterar status da venda para CANCELADA
UPDATE `vendas` SET `status` = 'CANCELADA' WHERE `id_venda` = @id_venda_1;

-- 3. Cancelar pagamentos
UPDATE `pagamentos` SET `status` = 'CANCELADO' WHERE `id_venda` = @id_venda_1;

-- 4. Devolver estoque dos produtos vendidos
UPDATE `estoque` SET `quantidade_atual` = `quantidade_atual` + 1.00, `valor_investido` = `quantidade_atual` * `custo_medio` WHERE `id_produto` = @id_prod_cabo;
UPDATE `estoque` SET `quantidade_atual` = `quantidade_atual` + 1.00, `valor_investido` = `quantidade_atual` * `custo_medio` WHERE `id_produto` = @id_prod_capa;

-- 5. Registrar movimentação de estorno
INSERT INTO `movimentacoes_estoque` (`id_produto`, `id_usuario`, `tipo_movimentacao`, `quantidade`, `custo_unitario`, `documento_referencia`, `observacao`) VALUES
(@id_prod_cabo, 1, 'CANCELAMENTO', 1.00, 40.00, CONCAT('CANCELAMENTO VENDA #', @id_venda_1), 'Estorno por cancelamento da venda'),
(@id_prod_capa, 1, 'CANCELAMENTO', 1.00, 20.00, CONCAT('CANCELAMENTO VENDA #', @id_venda_1), 'Estorno por cancelamento da venda');

-- 6. Gravar auditoria
INSERT INTO `auditoria` (`id_usuario`, `tabela`, `id_registro`, `acao`, `dados_anteriores`, `dados_novos`, `endereco_ip`) VALUES
(1, 'vendas', @id_venda_1, 'CANCELAMENTO', @dados_anteriores, JSON_OBJECT('id_venda', @id_venda_1, 'status', 'CANCELADA'), '127.0.0.1');

COMMIT;

-- ------------------------------------------------------------------------------
-- TESTE 7: METAS DE VENDAS E DESEMPENHO
-- ------------------------------------------------------------------------------
INSERT INTO `metas` (`id_usuario`, `tipo_meta`, `valor_meta`, `data_inicio`, `data_fim`, `descricao`) VALUES
(@id_usuario_vendedor, 'FATURAMENTO', 20000.00, '2026-08-01', '2026-08-31', 'Meta de faturamento agosto vendedor Carlos'),
(NULL, 'FATURAMENTO', 50000.00, '2026-08-01', '2026-08-31', 'Meta global da empresa agosto/2026');

-- ==============================================================================
-- CONSULTAS DE VALIDAÇÃO DAS VIEWS E RELATÓRIOS
-- ==============================================================================

SELECT '--- VW_RESUMO_VENDAS ---' AS Relatorio;
SELECT * FROM `vw_resumo_vendas`;

SELECT '--- VW_LUCRO_VENDAS ---' AS Relatorio;
SELECT * FROM `vw_lucro_vendas`;

SELECT '--- VW_RESUMO_ESTOQUE ---' AS Relatorio;
SELECT * FROM `vw_resumo_estoque`;

SELECT '--- VW_PRODUTOS_MAIS_VENDIDOS ---' AS Relatorio;
SELECT * FROM `vw_produtos_mais_vendidos`;

SELECT '--- VW_VENDAS_POR_PLATAFORMA ---' AS Relatorio;
SELECT * FROM `vw_vendas_por_plataforma`;

SELECT '--- VW_VENDAS_POR_FORMA_PAGAMENTO ---' AS Relatorio;
SELECT * FROM `vw_vendas_por_forma_pagamento`;

SELECT '--- VW_RESUMO_DESPESAS ---' AS Relatorio;
SELECT * FROM `vw_resumo_despesas`;

SELECT '--- VW_CONTAS_RECEBER ---' AS Relatorio;
SELECT * FROM `vw_contas_receber`;

SELECT '--- VW_EVOLUCAO_FINANCEIRA (DRE) ---' AS Relatorio;
SELECT * FROM `vw_evolucao_financeira`;

SELECT '--- AUDITORIA REGISTRADA ---' AS Relatorio;
SELECT `id_auditoria`, `id_usuario`, `tabela`, `id_registro`, `acao`, `dados_anteriores`, `dados_novos`, `data_hora` FROM `auditoria`;
