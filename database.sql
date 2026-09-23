-- ==============================================================================
-- SISTEMA DE CONTROLE DE VENDAS
-- Script DDL & DML Completo para Banco de Dados Relacional
-- Compatibilidade: MySQL 8.x / MariaDB 10.4+ (Otimizado para Hostinger)
-- Engine: InnoDB | Charset: UTF8MB4 | Collation: utf8mb4_unicode_ci
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '-03:00';

CREATE DATABASE IF NOT EXISTS `controle_vendas`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `controle_vendas`;

-- ==============================================================================
-- 1. TABELA: perfis
-- ==============================================================================
DROP TABLE IF EXISTS `perfis`;
CREATE TABLE `perfis` (
    `id_perfil` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(50) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` TINYINT(1) NOT NULL DEFAULT 1,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_perfil`),
    UNIQUE KEY `uk_perfis_nome` (`nome`),
    KEY `idx_perfis_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Perfis de acesso e permissões do sistema';

-- ==============================================================================
-- 2. TABELA: usuarios
-- ==============================================================================
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
    `id_usuario` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_perfil` INT UNSIGNED NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(20) NULL,
    `foto` VARCHAR(255) NULL,
    `ativo` TINYINT(1) NOT NULL DEFAULT 1,
    `ultimo_acesso` DATETIME NULL,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_usuario`),
    UNIQUE KEY `uk_usuarios_email` (`email`),
    KEY `idx_usuarios_perfil` (`id_perfil`),
    KEY `idx_usuarios_ativo` (`ativo`),
    CONSTRAINT `fk_usuarios_perfis` FOREIGN KEY (`id_perfil`)
        REFERENCES `perfis` (`id_perfil`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Operadores, vendedores e administradores do sistema';

-- ==============================================================================
-- 3. TABELA: categorias_produtos
-- ==============================================================================
DROP TABLE IF EXISTS `categorias_produtos`;
CREATE TABLE `categorias_produtos` (
    `id_categoria` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` TINYINT(1) NOT NULL DEFAULT 1,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_categoria`),
    UNIQUE KEY `uk_categorias_nome` (`nome`),
    KEY `idx_categorias_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Categorias para agrupamento dos produtos';

-- ==============================================================================
-- 4. TABELA: produtos
-- ==============================================================================
DROP TABLE IF EXISTS `produtos`;
CREATE TABLE `produtos` (
    `id_produto` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_categoria` INT UNSIGNED NOT NULL,
    `nome` VARCHAR(150) NOT NULL,
    `sku` VARCHAR(50) NULL,
    `codigo_barras` VARCHAR(50) NULL,
    `descricao` TEXT NULL,
    `foto` LONGTEXT NULL,
    `unidade` VARCHAR(10) NOT NULL DEFAULT 'UN',
    `preco_venda` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `margem_desejada` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `estoque_minimo` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `controla_estoque` TINYINT(1) NOT NULL DEFAULT 1,
    `controla_unidade` TINYINT(1) NOT NULL DEFAULT 0,
    `ativo` TINYINT(1) NOT NULL DEFAULT 1,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_produto`),
    UNIQUE KEY `uk_produtos_sku` (`sku`),
    UNIQUE KEY `uk_produtos_codigo_barras` (`codigo_barras`),
    KEY `idx_produtos_categoria` (`id_categoria`),
    KEY `idx_produtos_nome` (`nome`),
    KEY `idx_produtos_ativo` (`ativo`),
    CONSTRAINT `fk_produtos_categorias` FOREIGN KEY (`id_categoria`)
        REFERENCES `categorias_produtos` (`id_categoria`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cadastro principal de produtos e mercadorias';

-- ==============================================================================
-- 5. TABELA: unidades_produto (Prontidão para controle serializado / IMEI)
-- ==============================================================================
DROP TABLE IF EXISTS `unidades_produto`;
CREATE TABLE `unidades_produto` (
    `id_unidade_produto` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_produto` INT UNSIGNED NOT NULL,
    `numero_serie` VARCHAR(100) NULL,
    `imei` VARCHAR(50) NULL,
    `custo_aquisicao` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `estado_conservacao` ENUM('NOVO', 'SEMINOVO', 'EXCELENTE', 'BOM', 'AVARIADO', 'RECONDICIONADO') NOT NULL DEFAULT 'NOVO',
    `percentual_bateria` DECIMAL(5,2) NULL,
    `status` ENUM('DISPONIVEL', 'RESERVADO', 'VENDIDO', 'DEVOLVIDO', 'GARANTIA', 'BAIXADO') NOT NULL DEFAULT 'DISPONIVEL',
    `data_entrada` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_saida` DATETIME NULL,
    `observacao` TEXT NULL,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_unidade_produto`),
    KEY `idx_unidades_produto` (`id_produto`),
    KEY `idx_unidades_serie` (`numero_serie`),
    KEY `idx_unidades_imei` (`imei`),
    KEY `idx_unidades_status` (`status`),
    CONSTRAINT `fk_unidades_produtos` FOREIGN KEY (`id_produto`)
        REFERENCES `produtos` (`id_produto`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Rastreamento individualizado de unidades (Smartphones, Eletrônicos, Seriais)';

-- ==============================================================================
-- 6. TABELA: historico_custos
-- ==============================================================================
DROP TABLE IF EXISTS `historico_custos`;
CREATE TABLE `historico_custos` (
    `id_historico_custo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_produto` INT UNSIGNED NOT NULL,
    `custo_unitario` DECIMAL(12,2) NOT NULL,
    `quantidade` DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    `data_custo` DATE NOT NULL,
    `observacao` VARCHAR(255) NULL,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_historico_custo`),
    KEY `idx_hist_custos_produto` (`id_produto`),
    KEY `idx_hist_custos_data` (`data_custo`),
    CONSTRAINT `fk_hist_custos_produtos` FOREIGN KEY (`id_produto`)
        REFERENCES `produtos` (`id_produto`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Histórico cronológico de custos de aquisição dos produtos';

-- ==============================================================================
-- 7. TABELA: estoque
-- ==============================================================================
DROP TABLE IF EXISTS `estoque`;
CREATE TABLE `estoque` (
    `id_estoque` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_produto` INT UNSIGNED NOT NULL,
    `quantidade_atual` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `custo_medio` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `valor_investido` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_estoque`),
    UNIQUE KEY `uk_estoque_produto` (`id_produto`),
    KEY `idx_estoque_qtd` (`quantidade_atual`),
    CONSTRAINT `fk_estoque_produtos` FOREIGN KEY (`id_produto`)
        REFERENCES `produtos` (`id_produto`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Posição atual consolidada de estoque por produto (Relação 1:1)';

-- ==============================================================================
-- 8. TABELA: movimentacoes_estoque
-- ==============================================================================
DROP TABLE IF EXISTS `movimentacoes_estoque`;
CREATE TABLE `movimentacoes_estoque` (
    `id_movimentacao` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_produto` INT UNSIGNED NOT NULL,
    `id_usuario` INT UNSIGNED NOT NULL,
    `tipo_movimentacao` ENUM('ENTRADA', 'VENDA', 'DEVOLUCAO', 'AJUSTE_ENTRADA', 'AJUSTE_SAIDA', 'PERDA', 'CANCELAMENTO') NOT NULL,
    `quantidade` DECIMAL(10,2) NOT NULL,
    `custo_unitario` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `documento_referencia` VARCHAR(100) NULL,
    `observacao` TEXT NULL,
    `data_movimentacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_movimentacao`),
    KEY `idx_mov_estoque_produto` (`id_produto`),
    KEY `idx_mov_estoque_usuario` (`id_usuario`),
    KEY `idx_mov_estoque_tipo` (`tipo_movimentacao`),
    KEY `idx_mov_estoque_data` (`data_movimentacao`),
    CONSTRAINT `fk_mov_estoque_produtos` FOREIGN KEY (`id_produto`)
        REFERENCES `produtos` (`id_produto`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT `fk_mov_estoque_usuarios` FOREIGN KEY (`id_usuario`)
        REFERENCES `usuarios` (`id_usuario`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Extrato detalhado de todas as movimentações de estoque';

-- ==============================================================================
-- 9. TABELA: clientes
-- ==============================================================================
DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
    `id_cliente` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `cpf_cnpj` VARCHAR(20) NULL,
    `telefone` VARCHAR(20) NULL,
    `email` VARCHAR(100) NULL,
    `cep` VARCHAR(10) NULL,
    `logradouro` VARCHAR(150) NULL,
    `numero` VARCHAR(20) NULL,
    `complemento` VARCHAR(100) NULL,
    `bairro` VARCHAR(100) NULL,
    `cidade` VARCHAR(100) NULL,
    `estado` CHAR(2) NULL,
    `observacoes` TEXT NULL,
    `ativo` TINYINT(1) NOT NULL DEFAULT 1,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_cliente`),
    KEY `idx_clientes_nome` (`nome`),
    KEY `idx_clientes_cpf_cnpj` (`cpf_cnpj`),
    KEY `idx_clientes_telefone` (`telefone`),
    KEY `idx_clientes_email` (`email`),
    KEY `idx_clientes_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cadastro de clientes físicos e jurídicos';

-- ==============================================================================
-- 10. TABELA: plataformas
-- ==============================================================================
DROP TABLE IF EXISTS `plataformas`;
CREATE TABLE `plataformas` (
    `id_plataforma` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `percentual_comissao_padrao` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `taxa_fixa_padrao` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `ativo` TINYINT(1) NOT NULL DEFAULT 1,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_plataforma`),
    UNIQUE KEY `uk_plataformas_nome` (`nome`),
    KEY `idx_plataformas_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Canais e plataformas de venda (Mercado Livre, Shopee, Loja física, etc.)';

-- ==============================================================================
-- 11. TABELA: formas_pagamento
-- ==============================================================================
DROP TABLE IF EXISTS `formas_pagamento`;
CREATE TABLE `formas_pagamento` (
    `id_forma_pagamento` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `tipo` ENUM('PIX', 'DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'BOLETO', 'TRANSFERENCIA', 'OUTRO') NOT NULL,
    `ativo` TINYINT(1) NOT NULL DEFAULT 1,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_forma_pagamento`),
    UNIQUE KEY `uk_formas_pagto_nome` (`nome`),
    KEY `idx_formas_pagto_tipo` (`tipo`),
    KEY `idx_formas_pagto_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Modalidades e meios de pagamento aceitos';

-- ==============================================================================
-- 12. TABELA: vendas
-- ==============================================================================
DROP TABLE IF EXISTS `vendas`;
CREATE TABLE `vendas` (
    `id_venda` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_cliente` INT UNSIGNED NULL,
    `id_usuario` INT UNSIGNED NOT NULL,
    `id_plataforma` INT UNSIGNED NOT NULL,
    `data_venda` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `desconto` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `frete` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `valor_total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `custo_total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `taxas_total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `despesas_total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `lucro_bruto` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `lucro_liquido` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `margem_percentual` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `tipo_venda` ENUM('A_VISTA', 'A_PRAZO') NOT NULL,
    `status` ENUM('PENDENTE', 'CONCLUIDA', 'CANCELADA', 'DEVOLVIDA') NOT NULL DEFAULT 'PENDENTE',
    `observacoes` TEXT NULL,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_venda`),
    KEY `idx_vendas_cliente` (`id_cliente`),
    KEY `idx_vendas_usuario` (`id_usuario`),
    KEY `idx_vendas_plataforma` (`id_plataforma`),
    KEY `idx_vendas_data` (`data_venda`),
    KEY `idx_vendas_status` (`status`),
    KEY `idx_vendas_tipo` (`tipo_venda`),
    CONSTRAINT `fk_vendas_clientes` FOREIGN KEY (`id_cliente`)
        REFERENCES `clientes` (`id_cliente`)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT `fk_vendas_usuarios` FOREIGN KEY (`id_usuario`)
        REFERENCES `usuarios` (`id_usuario`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT `fk_vendas_plataformas` FOREIGN KEY (`id_plataforma`)
        REFERENCES `plataformas` (`id_plataforma`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro mestre de vendas e cabeçalho financeiro';

-- ==============================================================================
-- 13. TABELA: itens_venda
-- ==============================================================================
DROP TABLE IF EXISTS `itens_venda`;
CREATE TABLE `itens_venda` (
    `id_item_venda` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_venda` INT UNSIGNED NOT NULL,
    `id_produto` INT UNSIGNED NOT NULL,
    `quantidade` DECIMAL(10,2) NOT NULL,
    `preco_unitario` DECIMAL(12,2) NOT NULL,
    `desconto` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `custo_unitario` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `custo_total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `valor_total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `lucro_bruto` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_item_venda`),
    KEY `idx_itens_venda_venda` (`id_venda`),
    KEY `idx_itens_venda_produto` (`id_produto`),
    CONSTRAINT `fk_itens_venda_vendas` FOREIGN KEY (`id_venda`)
        REFERENCES `vendas` (`id_venda`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT `fk_itens_venda_produtos` FOREIGN KEY (`id_produto`)
        REFERENCES `produtos` (`id_produto`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Itens individuais comercializados com snapshot de custo histórico';

-- ==============================================================================
-- 14. TABELA: pagamentos
-- ==============================================================================
DROP TABLE IF EXISTS `pagamentos`;
CREATE TABLE `pagamentos` (
    `id_pagamento` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_venda` INT UNSIGNED NOT NULL,
    `id_forma_pagamento` INT UNSIGNED NOT NULL,
    `valor` DECIMAL(12,2) NOT NULL,
    `quantidade_parcelas` INT UNSIGNED NOT NULL DEFAULT 1,
    `percentual_taxa` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `valor_taxa` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `data_pagamento` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('PENDENTE', 'CONFIRMADO', 'CANCELADO', 'ESTORNADO') NOT NULL DEFAULT 'CONFIRMADO',
    `observacao` VARCHAR(255) NULL,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_pagamento`),
    KEY `idx_pagamentos_venda` (`id_venda`),
    KEY `idx_pagamentos_forma` (`id_forma_pagamento`),
    KEY `idx_pagamentos_status` (`status`),
    KEY `idx_pagamentos_data` (`data_pagamento`),
    CONSTRAINT `fk_pagamentos_vendas` FOREIGN KEY (`id_venda`)
        REFERENCES `vendas` (`id_venda`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT `fk_pagamentos_formas` FOREIGN KEY (`id_forma_pagamento`)
        REFERENCES `formas_pagamento` (`id_forma_pagamento`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lançamentos de pagamento associados à venda (Suporta pagamentos múltiplos)';

-- ==============================================================================
-- 15. TABELA: parcelas
-- ==============================================================================
DROP TABLE IF EXISTS `parcelas`;
CREATE TABLE `parcelas` (
    `id_parcela` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_pagamento` INT UNSIGNED NOT NULL,
    `numero_parcela` INT UNSIGNED NOT NULL,
    `quantidade_parcelas` INT UNSIGNED NOT NULL,
    `valor` DECIMAL(12,2) NOT NULL,
    `data_vencimento` DATE NOT NULL,
    `data_recebimento` DATETIME NULL,
    `valor_recebido` DECIMAL(12,2) NULL,
    `status` ENUM('PENDENTE', 'RECEBIDA', 'ATRASADA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `observacao` VARCHAR(255) NULL,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_parcela`),
    KEY `idx_parcelas_pagamento` (`id_pagamento`),
    KEY `idx_parcelas_vencimento` (`data_vencimento`),
    KEY `idx_parcelas_status` (`status`),
    KEY `idx_parcelas_recebimento` (`data_recebimento`),
    CONSTRAINT `fk_parcelas_pagamentos` FOREIGN KEY (`id_pagamento`)
        REFERENCES `pagamentos` (`id_pagamento`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Desdobramento de contas a receber e parcelamentos';

-- ==============================================================================
-- 16. TABELA: taxas
-- ==============================================================================
DROP TABLE IF EXISTS `taxas`;
CREATE TABLE `taxas` (
    `id_taxa` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_venda` INT UNSIGNED NOT NULL,
    `id_pagamento` INT UNSIGNED NULL,
    `id_plataforma` INT UNSIGNED NULL,
    `tipo_taxa` ENUM('COMISSAO_PLATAFORMA', 'TAXA_CARTAO', 'TAXA_ANTECIPACAO', 'TAXA_FIXA', 'FRETE', 'OUTRA') NOT NULL,
    `descricao` VARCHAR(150) NOT NULL,
    `percentual` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `valor` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_taxa`),
    KEY `idx_taxas_venda` (`id_venda`),
    KEY `idx_taxas_pagamento` (`id_pagamento`),
    KEY `idx_taxas_plataforma` (`id_plataforma`),
    KEY `idx_taxas_tipo` (`tipo_taxa`),
    CONSTRAINT `fk_taxas_vendas` FOREIGN KEY (`id_venda`)
        REFERENCES `vendas` (`id_venda`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT `fk_taxas_pagamentos` FOREIGN KEY (`id_pagamento`)
        REFERENCES `pagamentos` (`id_pagamento`)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT `fk_taxas_plataformas` FOREIGN KEY (`id_plataforma`)
        REFERENCES `plataformas` (`id_plataforma`)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Discriminação das taxas e comissões incidentes em cada venda';

-- ==============================================================================
-- 17. TABELA: categorias_despesas
-- ==============================================================================
DROP TABLE IF EXISTS `categorias_despesas`;
CREATE TABLE `categorias_despesas` (
    `id_categoria_despesa` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` TINYINT(1) NOT NULL DEFAULT 1,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_categoria_despesa`),
    UNIQUE KEY `uk_cat_despesas_nome` (`nome`),
    KEY `idx_cat_despesas_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Categorias para classificação das despesas operacionais e fixas';

-- ==============================================================================
-- 17.1 TABELA: tipos_despesas (Catálogo de Tipos de Custos para Vendas e Geral)
-- ==============================================================================
DROP TABLE IF EXISTS `tipos_despesas`;
CREATE TABLE `tipos_despesas` (
    `id_tipo_despesa` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `categoria` VARCHAR(100) NOT NULL DEFAULT 'Geral',
    `icone` VARCHAR(50) NOT NULL DEFAULT 'receipt',
    `tipo_aplicacao` ENUM('VENDA', 'OPERACIONAL', 'AMBOS') NOT NULL DEFAULT 'VENDA',
    `valor_sugerido` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `ativo` TINYINT(1) NOT NULL DEFAULT 1,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_tipo_despesa`),
    KEY `idx_tipos_desp_nome` (`nome`),
    KEY `idx_tipos_desp_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Modelos e tipos parametrizados de despesas selecionáveis em vendas';

-- ==============================================================================
-- 18. TABELA: despesas
-- ==============================================================================
DROP TABLE IF EXISTS `despesas`;
CREATE TABLE `despesas` (
    `id_despesa` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_categoria_despesa` INT UNSIGNED NOT NULL,
    `id_usuario` INT UNSIGNED NOT NULL,
    `id_venda` INT UNSIGNED NULL COMMENT 'Vínculo opcional se a despesa foi originada em uma venda',
    `id_tipo_despesa` INT UNSIGNED NULL COMMENT 'Vínculo ao modelo de tipo de custo',
    `descricao` VARCHAR(255) NOT NULL,
    `valor` DECIMAL(12,2) NOT NULL,
    `data_competencia` DATE NOT NULL,
    `data_vencimento` DATE NOT NULL,
    `data_pagamento` DATETIME NULL,
    `status` ENUM('PENDENTE', 'PAGA', 'ATRASADA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `recorrente` TINYINT(1) NOT NULL DEFAULT 0,
    `observacao` TEXT NULL,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_despesa`),
    KEY `idx_despesas_categoria` (`id_categoria_despesa`),
    KEY `idx_despesas_usuario` (`id_usuario`),
    KEY `idx_despesas_venda` (`id_venda`),
    KEY `idx_despesas_tipo` (`id_tipo_despesa`),
    KEY `idx_despesas_competencia` (`data_competencia`),
    KEY `idx_despesas_vencimento` (`data_vencimento`),
    KEY `idx_despesas_status` (`status`),
    CONSTRAINT `fk_despesas_categorias` FOREIGN KEY (`id_categoria_despesa`)
        REFERENCES `categorias_despesas` (`id_categoria_despesa`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT `fk_despesas_usuarios` FOREIGN KEY (`id_usuario`)
        REFERENCES `usuarios` (`id_usuario`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT `fk_despesas_vendas` FOREIGN KEY (`id_venda`)
        REFERENCES `vendas` (`id_venda`)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Despesas operacionais, fixas e custos adicionais vinculados a vendas';

-- ==============================================================================
-- 19. TABELA: metas
-- ==============================================================================
DROP TABLE IF EXISTS `metas`;
CREATE TABLE `metas` (
    `id_meta` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_usuario` INT UNSIGNED NULL,
    `tipo_meta` ENUM('FATURAMENTO', 'LUCRO', 'VENDAS') NOT NULL,
    `valor_meta` DECIMAL(12,2) NOT NULL,
    `data_inicio` DATE NOT NULL,
    `data_fim` DATE NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `ativo` TINYINT(1) NOT NULL DEFAULT 1,
    `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_meta`),
    KEY `idx_metas_usuario` (`id_usuario`),
    KEY `idx_metas_periodo` (`data_inicio`, `data_fim`),
    KEY `idx_metas_tipo` (`tipo_meta`),
    CONSTRAINT `fk_metas_usuarios` FOREIGN KEY (`id_usuario`)
        REFERENCES `usuarios` (`id_usuario`)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Metas de vendas, lucro e faturamento da empresa ou vendedor';

-- ==============================================================================
-- 20. TABELA: auditoria
-- ==============================================================================
DROP TABLE IF EXISTS `auditoria`;
CREATE TABLE `auditoria` (
    `id_auditoria` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_usuario` INT UNSIGNED NULL,
    `tabela` VARCHAR(50) NOT NULL,
    `id_registro` VARCHAR(50) NULL,
    `acao` ENUM('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'CANCELAMENTO') NOT NULL,
    `dados_anteriores` JSON NULL,
    `dados_novos` JSON NULL,
    `endereco_ip` VARCHAR(45) NULL,
    `data_hora` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_auditoria`),
    KEY `idx_auditoria_usuario` (`id_usuario`),
    KEY `idx_auditoria_tabela` (`tabela`),
    KEY `idx_auditoria_acao` (`acao`),
    KEY `idx_auditoria_data` (`data_hora`),
    CONSTRAINT `fk_auditoria_usuarios` FOREIGN KEY (`id_usuario`)
        REFERENCES `usuarios` (`id_usuario`)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de logs de auditoria e conformidade';

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- CARGA INICIAL DE DADOS PADRÃO (SEEDS)
-- ==============================================================================

-- Perfis
INSERT INTO `perfis` (`nome`, `descricao`, `ativo`) VALUES
('Administrador', 'Acesso irrestrito a todas as funcionalidades e configurações', 1),
('Gerente', 'Gestão de vendas, estoque, relatórios e controle de equipe', 1),
('Vendedor', 'Realização e consulta de vendas, clientes e estoque', 1),
('Financeiro', 'Gestão financeira, contas a receber, despesas e fluxo de caixa', 1);

-- Usuário Administrador Inicial (Senha padrão com hash bcrypt de exemplo)
INSERT INTO `usuarios` (`id_perfil`, `nome`, `email`, `senha`, `telefone`, `ativo`) VALUES
(1, 'Administrador do Sistema', 'admin@sistema.local', '$2y$10$wN92mJv8.vR.xZ6Zl63YfOHW7y93Yw5z1Y7LpXh71F.N.kYI3/H1.', '(11) 99999-9999', 1);

-- Formas de Pagamento
INSERT INTO `formas_pagamento` (`nome`, `tipo`, `ativo`) VALUES
('PIX', 'PIX', 1),
('Dinheiro', 'DINHEIRO', 1),
('Cartão de Débito', 'CARTAO_DEBITO', 1),
('Cartão de Crédito', 'CARTAO_CREDITO', 1),
('Boleto', 'BOLETO', 1),
('Transferência', 'TRANSFERENCIA', 1),
('Outro', 'OUTRO', 1);

-- Plataformas de Venda
INSERT INTO `plataformas` (`nome`, `descricao`, `percentual_comissao_padrao`, `taxa_fixa_padrao`, `ativo`) VALUES
('Mercado Livre', 'Marketplace Mercado Livre (Comissão e taxas integradas)', 16.00, 5.00, 1),
('Shopee', 'Marketplace Shopee', 14.00, 4.00, 1),
('WhatsApp', 'Vendas diretas via WhatsApp', 0.00, 0.00, 1),
('Instagram', 'Vendas originadas do Instagram Direct', 0.00, 0.00, 1),
('Venda presencial', 'Balcão da loja física', 0.00, 0.00, 1),
('Site próprio', 'E-commerce próprio / Loja virtual', 4.50, 0.50, 1),
('Outra', 'Outros canais não especificados', 0.00, 0.00, 1);

-- Categorias de Despesas
INSERT INTO `categorias_despesas` (`nome`, `descricao`, `ativo`) VALUES
('Operacionais', 'Despesas com manutenção, limpeza e operação do dia a dia', 1),
('Marketing', 'Anúncios no Meta Ads, Google Ads, influencers e branding', 1),
('Logística', 'Embalagens, caixas, fita adesiva e motoboy local', 1),
('Impostos', 'DAS Simples Nacional, tributos e taxas municipais/estaduais', 1),
('Aluguel', 'Locação de imóvel comercial ou galpão', 1),
('Energia', 'Conta de energia elétrica', 1),
('Internet', 'Conexão banda larga e telefonia', 1),
('Salários', 'Folha de pagamento, comissões fixas e pró-labore', 1),
('Outras', 'Despesas diversas não categorizadas', 1);

-- Modelos / Tipos Parametrizados de Despesas (Catálogo para Vendas e Gestão)
INSERT INTO `tipos_despesas` (`nome`, `categoria`, `icone`, `tipo_aplicacao`, `valor_sugerido`, `ativo`) VALUES
('Facebook / Instagram Ads', 'Marketing & Ads', 'megaphone', 'VENDA', 50.00, 1),
('Gasolina / Uber / Transporte', 'Transporte & Logística', 'car', 'VENDA', 30.00, 1),
('Reparo / Peças / Manutenção', 'Manutenção & Peças', 'tool', 'VENDA', 120.00, 1),
('Película 3D / Capinha / Brinde', 'Acessórios & Brindes', 'shield', 'VENDA', 25.00, 1),
('Taxa de Entrega / Motoboy Express', 'Fretes & Entregas', 'truck', 'VENDA', 20.00, 1),
('Embalagem & Caixa Especial', 'Embalagens & Insumos', 'box', 'VENDA', 15.00, 1),
('Comissão de Vendedor Avulso', 'Comissões & Equipe', 'user-check', 'VENDA', 80.00, 1),
('Taxa de Maquininha / Intermediação', 'Taxas & Financeiro', 'credit-card', 'VENDA', 35.00, 1),
('Outras Despesas de Venda', 'Custos Diversos', 'receipt', 'VENDA', 0.00, 1);

-- Categorias Iniciais de Exemplo de Produtos
INSERT INTO `categorias_produtos` (`nome`, `descricao`, `ativo`) VALUES
('Smartphones', 'Aparelhos celulares novos e seminovos', 1),
('Acessórios', 'Capinhas, películas, cabos e carregadores', 1),
('Smartwatches', 'Relógios inteligentes e pulseiras', 1),
('Áudio', 'Fones de ouvido, fones bluetooth e caixas de som', 1);

-- ==============================================================================
-- VIEWS DE INTELIGÊNCIA E RELATÓRIOS ANALÍTICOS
-- ==============================================================================

-- 1. Resumo Consolidado de Vendas
DROP VIEW IF EXISTS `vw_resumo_vendas`;
CREATE VIEW `vw_resumo_vendas` AS
SELECT 
    v.`id_venda`,
    v.`data_venda`,
    DATE(v.`data_venda`) AS `data`,
    v.`status`,
    v.`tipo_venda`,
    c.`id_cliente`,
    COALESCE(c.`nome`, 'Cliente Não Identificado') AS `nome_cliente`,
    u.`id_usuario`,
    u.`nome` AS `nome_vendedor`,
    p.`id_plataforma`,
    p.`nome` AS `nome_plataforma`,
    v.`subtotal`,
    v.`desconto`,
    v.`frete`,
    v.`valor_total` AS `faturamento`,
    v.`custo_total`,
    v.`taxas_total`,
    v.`lucro_bruto`,
    v.`lucro_liquido`,
    v.`margem_percentual`
FROM `vendas` v
LEFT JOIN `clientes` c ON v.`id_cliente` = c.`id_cliente`
INNER JOIN `usuarios` u ON v.`id_usuario` = u.`id_usuario`
INNER JOIN `plataformas` p ON v.`id_plataforma` = p.`id_plataforma`;

-- 2. Análise Detalhada de Lucro por Venda
DROP VIEW IF EXISTS `vw_lucro_vendas`;
CREATE VIEW `vw_lucro_vendas` AS
SELECT 
    v.`id_venda`,
    v.`data_venda`,
    p.`nome` AS `plataforma`,
    v.`valor_total` AS `faturamento`,
    v.`custo_total` AS `custo_produtos`,
    (v.`valor_total` - v.`custo_total`) AS `lucro_bruto_calculado`,
    v.`taxas_total` AS `taxas_aplicadas`,
    (v.`valor_total` - v.`custo_total` - v.`taxas_total`) AS `lucro_liquido_calculado`,
    CASE 
        WHEN v.`valor_total` > 0 
        THEN ROUND(((v.`valor_total` - v.`custo_total` - v.`taxas_total`) / v.`valor_total`) * 100, 2)
        ELSE 0.00 
    END AS `margem_liquida_percentual`,
    v.`status`
FROM `vendas` v
INNER JOIN `plataformas` p ON v.`id_plataforma` = p.`id_plataforma`;

-- 3. Resumo de Posição de Estoque
DROP VIEW IF EXISTS `vw_resumo_estoque`;
CREATE VIEW `vw_resumo_estoque` AS
SELECT 
    pr.`id_produto`,
    pr.`sku`,
    pr.`codigo_barras`,
    pr.`nome` AS `nome_produto`,
    c.`nome` AS `categoria`,
    pr.`unidade`,
    pr.`preco_venda`,
    e.`custo_medio`,
    e.`quantidade_atual`,
    pr.`estoque_minimo`,
    e.`valor_investido`,
    (e.`quantidade_atual` * pr.`preco_venda`) AS `valor_potencial_venda`,
    ((e.`quantidade_atual` * pr.`preco_venda`) - e.`valor_investido`) AS `lucro_projetado`,
    CASE 
        WHEN pr.`controla_estoque` = 1 AND e.`quantidade_atual` <= pr.`estoque_minimo` THEN 1 
        ELSE 0 
    END AS `alerta_estoque_baixo`,
    pr.`ativo`
FROM `produtos` pr
INNER JOIN `categorias_produtos` c ON pr.`id_categoria` = c.`id_categoria`
LEFT JOIN `estoque` e ON pr.`id_produto` = e.`id_produto`;

-- 4. Produtos Mais Vendidos e Rentabilidade
DROP VIEW IF EXISTS `vw_produtos_mais_vendidos`;
CREATE VIEW `vw_produtos_mais_vendidos` AS
SELECT 
    pr.`id_produto`,
    pr.`sku`,
    pr.`nome` AS `nome_produto`,
    c.`nome` AS `categoria`,
    COUNT(DISTINCT iv.`id_venda`) AS `total_pedidos`,
    SUM(iv.`quantidade`) AS `quantidade_total_vendida`,
    SUM(iv.`valor_total`) AS `faturamento_total`,
    SUM(iv.`custo_total`) AS `custo_total`,
    SUM(iv.`lucro_bruto`) AS `lucro_bruto_acumulado`,
    CASE 
        WHEN SUM(iv.`valor_total`) > 0 
        THEN ROUND((SUM(iv.`lucro_bruto`) / SUM(iv.`valor_total`)) * 100, 2)
        ELSE 0.00 
    END AS `margem_bruta_media`
FROM `itens_venda` iv
INNER JOIN `vendas` v ON iv.`id_venda` = v.`id_venda`
INNER JOIN `produtos` pr ON iv.`id_produto` = pr.`id_produto`
INNER JOIN `categorias_produtos` c ON pr.`id_categoria` = c.`id_categoria`
WHERE v.`status` = 'CONCLUIDA'
GROUP BY pr.`id_produto`, pr.`sku`, pr.`nome`, c.`nome`;

-- 5. Performance de Vendas por Plataforma
DROP VIEW IF EXISTS `vw_vendas_por_plataforma`;
CREATE VIEW `vw_vendas_por_plataforma` AS
SELECT 
    p.`id_plataforma`,
    p.`nome` AS `plataforma`,
    COUNT(v.`id_venda`) AS `quantidade_vendas`,
    COALESCE(SUM(v.`valor_total`), 0.00) AS `faturamento_total`,
    COALESCE(SUM(v.`custo_total`), 0.00) AS `custo_produtos_total`,
    COALESCE(SUM(v.`taxas_total`), 0.00) AS `taxas_totais`,
    COALESCE(SUM(v.`lucro_liquido`), 0.00) AS `lucro_liquido_total`,
    CASE 
        WHEN SUM(v.`valor_total`) > 0 
        THEN ROUND((SUM(v.`lucro_liquido`) / SUM(v.`valor_total`)) * 100, 2)
        ELSE 0.00 
    END AS `margem_liquida_media`
FROM `plataformas` p
LEFT JOIN `vendas` v ON p.`id_plataforma` = v.`id_plataforma` AND v.`status` = 'CONCLUIDA'
GROUP BY p.`id_plataforma`, p.`nome`;

-- 6. Vendas e Faturamento por Forma de Pagamento
DROP VIEW IF EXISTS `vw_vendas_por_forma_pagamento`;
CREATE VIEW `vw_vendas_por_forma_pagamento` AS
SELECT 
    fp.`id_forma_pagamento`,
    fp.`nome` AS `forma_pagamento`,
    fp.`tipo`,
    COUNT(pg.`id_pagamento`) AS `total_lancamentos`,
    COALESCE(SUM(pg.`valor`), 0.00) AS `valor_total_pago`,
    COALESCE(SUM(pg.`valor_taxa`), 0.00) AS `taxas_totais_pagamento`,
    COALESCE(SUM(pg.`valor` - pg.`valor_taxa`), 0.00) AS `valor_liquido_recebido`
FROM `formas_pagamento` fp
LEFT JOIN `pagamentos` pg ON fp.`id_forma_pagamento` = pg.`id_forma_pagamento` AND pg.`status` = 'CONFIRMADO'
GROUP BY fp.`id_forma_pagamento`, fp.`nome`, fp.`tipo`;

-- 7. Resumo de Despesas Operacionais por Categoria
DROP VIEW IF EXISTS `vw_resumo_despesas`;
CREATE VIEW `vw_resumo_despesas` AS
SELECT 
    cd.`id_categoria_despesa`,
    cd.`nome` AS `categoria_despesa`,
    COUNT(d.`id_despesa`) AS `quantidade_despesas`,
    COALESCE(SUM(d.`valor`), 0.00) AS `total_despesas`,
    COALESCE(SUM(CASE WHEN d.`status` = 'PAGA' THEN d.`valor` ELSE 0.00 END), 0.00) AS `total_pago`,
    COALESCE(SUM(CASE WHEN d.`status` = 'PENDENTE' THEN d.`valor` ELSE 0.00 END), 0.00) AS `total_pendente`,
    COALESCE(SUM(CASE WHEN d.`status` = 'ATRASADA' THEN d.`valor` ELSE 0.00 END), 0.00) AS `total_atrasado`
FROM `categorias_despesas` cd
LEFT JOIN `despesas` d ON cd.`id_categoria_despesa` = d.`id_categoria_despesa` AND d.`status` != 'CANCELADA'
GROUP BY cd.`id_categoria_despesa`, cd.`nome`;

-- 8. Contas a Receber e Controle de Parcelas
DROP VIEW IF EXISTS `vw_contas_receber`;
CREATE VIEW `vw_contas_receber` AS
SELECT 
    par.`id_parcela`,
    par.`id_pagamento`,
    v.`id_venda`,
    v.`data_venda`,
    COALESCE(c.`nome`, 'Cliente Não Identificado') AS `cliente`,
    c.`telefone` AS `telefone_cliente`,
    fp.`nome` AS `forma_pagamento`,
    par.`numero_parcela`,
    par.`quantidade_parcelas`,
    par.`valor` AS `valor_parcela`,
    par.`data_vencimento`,
    par.`data_recebimento`,
    par.`valor_recebido`,
    par.`status`,
    CASE 
        WHEN par.`status` = 'PENDENTE' AND par.`data_vencimento` < CURDATE() 
        THEN DATEDIFF(CURDATE(), par.`data_vencimento`)
        ELSE 0 
    END AS `dias_em_atraso`
FROM `parcelas` par
INNER JOIN `pagamentos` pg ON par.`id_pagamento` = pg.`id_pagamento`
INNER JOIN `vendas` v ON pg.`id_venda` = v.`id_venda`
INNER JOIN `formas_pagamento` fp ON pg.`id_forma_pagamento` = fp.`id_forma_pagamento`
LEFT JOIN `clientes` c ON v.`id_cliente` = c.`id_cliente`;

-- 9. Evolução e DRE Financeiro Sintético por Mês/Competência
DROP VIEW IF EXISTS `vw_evolucao_financeira`;
CREATE VIEW `vw_evolucao_financeira` AS
SELECT 
    ano_mes,
    COALESCE(SUM(faturamento), 0.00) AS `faturamento_bruto`,
    COALESCE(SUM(custo_produtos), 0.00) AS `custo_produtos`,
    COALESCE(SUM(taxas_venda), 0.00) AS `taxas_venda`,
    COALESCE(SUM(faturamento - custo_produtos - taxas_venda), 0.00) AS `lucro_liquido_vendas`,
    COALESCE(SUM(despesas_operacionais_pagas), 0.00) AS `despesas_operacionais`,
    COALESCE(SUM(faturamento - custo_produtos - taxas_venda - despesas_operacionais_pagas), 0.00) AS `resultado_operacional_liquido`
FROM (
    -- Entradas de Vendas
    SELECT 
        DATE_FORMAT(v.`data_venda`, '%Y-%m') AS `ano_mes`,
        v.`valor_total` AS `faturamento`,
        v.`custo_total` AS `custo_produtos`,
        v.`taxas_total` AS `taxas_venda`,
        0.00 AS `despesas_operacionais_pagas`
    FROM `vendas` v
    WHERE v.`status` = 'CONCLUIDA'
    
    UNION ALL
    
    -- Saídas de Despesas Operacionais Pagas
    SELECT 
        DATE_FORMAT(d.`data_competencia`, '%Y-%m') AS `ano_mes`,
        0.00 AS `faturamento`,
        0.00 AS `custo_produtos`,
        0.00 AS `taxas_venda`,
        d.`valor` AS `despesas_operacionais_pagas`
    FROM `despesas` d
    WHERE d.`status` = 'PAGA'
) AS consolidado
GROUP BY ano_mes
ORDER BY ano_mes DESC;
