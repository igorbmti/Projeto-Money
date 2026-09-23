# Dicionário de Dados do Sistema de Controle de Vendas

Este documento contém o dicionário técnico detalhado de todas as tabelas, colunas, tipos de dados, restrições e finalidades de negócio do banco de dados relacional.

---

## Índice de Tabelas

1. [perfis](#1-tabela-perfis)
2. [usuarios](#2-tabela-usuarios)
3. [categorias_produtos](#3-tabela-categorias_produtos)
4. [produtos](#4-tabela-produtos)
5. [unidades_produto](#5-tabela-unidades_produto)
6. [historico_custos](#6-tabela-historico_custos)
7. [estoque](#7-tabela-estoque)
8. [movimentacoes_estoque](#8-tabela-movimentacoes_estoque)
9. [clientes](#9-tabela-clientes)
10. [plataformas](#10-tabela-plataformas)
11. [formas_pagamento](#11-tabela-formas_pagamento)
12. [vendas](#12-tabela-vendas)
13. [itens_venda](#13-tabela-itens_venda)
14. [pagamentos](#14-tabela-pagamentos)
15. [parcelas](#15-tabela-parcelas)
16. [taxas](#16-tabela-taxas)
17. [categorias_despesas](#17-tabela-categorias_despesas)
18. [despesas](#18-tabela-despesas)
19. [metas](#19-tabela-metas)
20. [auditoria](#20-tabela-auditoria)

---

### 1. Tabela: `perfis`
**Descrição:** Armazena os níveis e papéis de permissão de acesso ao sistema (ex.: Administrador, Gerente, Vendedor, Financeiro).

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_perfil` | INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador único do perfil |
| `nome` | VARCHAR(50) | NÃO | UK | - | Nome descritivo do perfil de acesso |
| `descricao` | VARCHAR(255) | SIM | - | NULL | Detalhes sobre os privilégios concedidos |
| `ativo` | TINYINT(1) | NÃO | IDX | 1 | Flag indicando se o perfil está ativo (1) ou inativo (0) |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data e hora de criação do registro |
| `data_atualizacao`| DATETIME | NÃO | - | CURRENT_TIMESTAMP ON UPDATE | Data e hora da última modificação |

---

### 2. Tabela: `usuarios`
**Descrição:** Contas de operadores, administradores e vendedores do sistema com hash seguro de senha.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_usuario` | INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador único do usuário |
| `id_perfil` | INT UNSIGNED | NÃO | FK, IDX | - | Referência ao perfil de permissões (`perfis.id_perfil`) |
| `nome` | VARCHAR(100) | NÃO | - | - | Nome completo do usuário |
| `email` | VARCHAR(100) | NÃO | UK | - | E-mail corporativo único para login |
| `senha` | VARCHAR(255) | NÃO | - | - | Hash criptográfico da senha (Bcrypt / Argon2) |
| `telefone` | VARCHAR(20) | SIM | - | NULL | Telefone ou WhatsApp de contato |
| `foto` | VARCHAR(255) | SIM | - | NULL | Caminho ou URL da foto de perfil |
| `ativo` | TINYINT(1) | NÃO | IDX | 1 | Status do usuário: 1=Ativo, 0=Inativo |
| `ultimo_acesso` | DATETIME | SIM | - | NULL | Timestamp do último login efetuado |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de cadastro |
| `data_atualizacao`| DATETIME | NÃO | - | CURRENT_TIMESTAMP ON UPDATE | Data da última alteração |

---

### 3. Tabela: `categorias_produtos`
**Descrição:** Agrupamento taxonômico de produtos para navegação, relatórios e filtros.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_categoria` | INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador único da categoria |
| `nome` | VARCHAR(100) | NÃO | UK | - | Nome da categoria (ex: Smartphones, Acessórios) |
| `descricao` | VARCHAR(255) | SIM | - | NULL | Breve descrição da categoria |
| `ativo` | TINYINT(1) | NÃO | IDX | 1 | 1=Ativa, 0=Inativa |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de criação |
| `data_atualizacao`| DATETIME | NÃO | - | CURRENT_TIMESTAMP ON UPDATE | Data de alteração |

---

### 4. Tabela: `produtos`
**Descrição:** Catálogo mestre de itens comercializáveis com definições de preço, estoque mínimo e flags de controle.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_produto` | INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador único do produto |
| `id_categoria` | INT UNSIGNED | NÃO | FK, IDX | - | Chave estrangeira para `categorias_produtos` |
| `nome` | VARCHAR(150) | NÃO | IDX | - | Nome comercial do produto |
| `sku` | VARCHAR(50) | SIM | UK | NULL | Código de controle de estoque interno (SKU) |
| `codigo_barras` | VARCHAR(50) | SIM | UK | NULL | Código de barras padrão EAN/UPC |
| `descricao` | TEXT | SIM | - | NULL | Especificações técnicas e descrição |
| `unidade` | VARCHAR(10) | NÃO | - | 'UN' | Unidade de medida (UN, CX, PAR, KG, MT) |
| `preco_venda` | DECIMAL(12,2) | NÃO | - | 0.00 | Preço padrão de venda ao consumidor |
| `margem_desejada`| DECIMAL(5,2) | NÃO | - | 0.00 | Margem de lucro pretendida (%) |
| `estoque_minimo` | DECIMAL(10,2) | NÃO | - | 0.00 | Ponto de pedido / alerta de reposição |
| `controla_estoque`| TINYINT(1) | NÃO | - | 1 | 1=Controla saldo físico, 0=Não controla |
| `controla_unidade`| TINYINT(1) | NÃO | - | 0 | 1=Exige rastreamento serial/IMEI individual |
| `ativo` | TINYINT(1) | NÃO | IDX | 1 | 1=Disponível, 0=Desativado |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de cadastro |
| `data_atualizacao`| DATETIME | NÃO | - | CURRENT_TIMESTAMP ON UPDATE | Data de alteração |

---

### 5. Tabela: `unidades_produto`
**Descrição:** Rastreamento individualizado de aparelhos e itens com número de série/IMEI, saúde de bateria e estado.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_unidade_produto`| INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador da unidade física |
| `id_produto` | INT UNSIGNED | NÃO | FK, IDX | - | Referência ao produto pai |
| `numero_serie` | VARCHAR(100) | SIM | IDX | NULL | Número de série do fabricante |
| `imei` | VARCHAR(50) | SIM | IDX | NULL | Código IMEI 1 ou 2 do celular |
| `custo_aquisicao` | DECIMAL(12,2) | NÃO | - | 0.00 | Valor pago nesta peça específica |
| `estado_conservacao`| ENUM | NÃO | - | 'NOVO' | NOVO, SEMINOVO, EXCELENTE, BOM, AVARIADO, RECONDICIONADO |
| `percentual_bateria`| DECIMAL(5,2) | SIM | - | NULL | Saúde da bateria em % (para iPhones/smartphones) |
| `status` | ENUM | NÃO | IDX | 'DISPONIVEL' | DISPONIVEL, RESERVADO, VENDIDO, DEVOLVIDO, GARANTIA, BAIXADO |
| `data_entrada` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de recebimento no estoque |
| `data_saida` | DATETIME | SIM | - | NULL | Data de venda ou descarte |
| `observacao` | TEXT | SIM | - | NULL | Observações de inspeção e avarias |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de inserção |
| `data_atualizacao`| DATETIME | NÃO | - | CURRENT_TIMESTAMP ON UPDATE | Data da última alteração |

---

### 6. Tabela: `historico_custos`
**Descrição:** Registra a evolução cronológica dos custos de compra por produto para auditoria e custeio.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_historico_custo`| INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador do histórico |
| `id_produto` | INT UNSIGNED | NÃO | FK, IDX | - | Referência ao produto (`produtos.id_produto`) |
| `custo_unitario` | DECIMAL(12,2) | NÃO | - | - | Valor de custo por unidade no lote |
| `quantidade` | DECIMAL(10,2) | NÃO | - | 1.00 | Quantidade de itens adquiridos no lote |
| `data_custo` | DATE | NÃO | IDX | - | Data da compra ou nota fiscal |
| `observacao` | VARCHAR(255) | SIM | - | NULL | Fornecedor, NF ou detalhe da aquisição |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de inclusão do registro |

---

### 7. Tabela: `estoque`
**Descrição:** Posição consolidada de saldo, custo médio ponderado e capital total imobilizado por produto.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_estoque` | INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador da posição de estoque |
| `id_produto` | INT UNSIGNED | NÃO | FK, UK | - | Chave única do produto (relação 1:1) |
| `quantidade_atual`| DECIMAL(10,2) | NÃO | IDX | 0.00 | Saldo físico atual em estoque |
| `custo_medio` | DECIMAL(12,2) | NÃO | - | 0.00 | Custo médio ponderado por unidade |
| `valor_investido` | DECIMAL(14,2) | NÃO | - | 0.00 | Valor total em estoque (`quantidade * custo_medio`) |
| `data_atualizacao`| DATETIME | NÃO | - | CURRENT_TIMESTAMP ON UPDATE | Timestamp da última movimentação |

---

### 8. Tabela: `movimentacoes_estoque`
**Descrição:** Livro razão de todas as entradas, saídas, perdas e ajustes de inventário.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_movimentacao`| INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador da movimentação |
| `id_produto` | INT UNSIGNED | NÃO | FK, IDX | - | Produto movimentado |
| `id_usuario` | INT UNSIGNED | NÃO | FK, IDX | - | Usuário operador responsável |
| `tipo_movimentacao`| ENUM | NÃO | IDX | - | ENTRADA, VENDA, DEVOLUCAO, AJUSTE_ENTRADA, AJUSTE_SAIDA, PERDA, CANCELAMENTO |
| `quantidade` | DECIMAL(10,2) | NÃO | - | - | Volume movimentado (sempre positivo) |
| `custo_unitario` | DECIMAL(12,2) | NÃO | - | 0.00 | Custo unitário no momento da movimentação |
| `documento_referencia`| VARCHAR(100)| SIM | - | NULL | Número de Pedido, NF ou Chamado |
| `observacao` | TEXT | SIM | - | NULL | Justificativa do ajuste ou detalhamento |
| `data_movimentacao`| DATETIME | NÃO | IDX | CURRENT_TIMESTAMP | Data da ocorrência |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de inserção |

---

### 9. Tabela: `clientes`
**Descrição:** Cadastro de pessoas físicas e jurídicas compradoras.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_cliente` | INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador do cliente |
| `nome` | VARCHAR(120) | NÃO | IDX | - | Nome completo ou Razão Social |
| `cpf_cnpj` | VARCHAR(20) | SIM | IDX | NULL | Documento fiscal do cliente |
| `telefone` | VARCHAR(20) | SIM | IDX | NULL | Telefone / Celular / WhatsApp |
| `email` | VARCHAR(100) | SIM | IDX | NULL | E-mail para envio de comprovantes |
| `cep` | VARCHAR(10) | SIM | - | NULL | CEP de entrega/cobrança |
| `logradouro` | VARCHAR(150) | SIM | - | NULL | Rua, Avenida, etc. |
| `numero` | VARCHAR(20) | SIM | - | NULL | Número do endereço |
| `complemento` | VARCHAR(100) | SIM | - | NULL | Apartamento, Sala, etc. |
| `bairro` | VARCHAR(100) | SIM | - | NULL | Bairro |
| `cidade` | VARCHAR(100) | SIM | - | NULL | Cidade |
| `estado` | CHAR(2) | SIM | - | NULL | Sigla da UF (ex: SP, RJ, MG) |
| `observacoes` | TEXT | SIM | - | NULL | Notas e histórico do cliente |
| `ativo` | TINYINT(1) | NÃO | IDX | 1 | 1=Ativo, 0=Inativo |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de cadastro |
| `data_atualizacao`| DATETIME | NÃO | - | CURRENT_TIMESTAMP ON UPDATE | Data da última alteração |

---

### 10. Tabela: `plataformas`
**Descrição:** Canais de venda (Mercado Livre, Shopee, Loja Física, WhatsApp) e parâmetros padrão de taxa.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_plataforma` | INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador da plataforma |
| `nome` | VARCHAR(100) | NÃO | UK | - | Nome do canal (ex: Mercado Livre, Shopee) |
| `descricao` | VARCHAR(255) | SIM | - | NULL | Descrição do canal |
| `percentual_comissao_padrao`| DECIMAL(5,2)| NÃO | - | 0.00 | Percentual médio de comissão cobrado |
| `taxa_fixa_padrao`| DECIMAL(12,2)| NÃO | - | 0.00 | Custo fixo cobrado por pedido |
| `ativo` | TINYINT(1) | NÃO | IDX | 1 | 1=Ativo, 0=Inativo |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de cadastro |
| `data_atualizacao`| DATETIME | NÃO | - | CURRENT_TIMESTAMP ON UPDATE | Data de alteração |

---

### 11. Tabela: `formas_pagamento`
**Descrição:** Meios de liquidação financeira aceitos (PIX, Cartão, Dinheiro, Boleto).

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_forma_pagamento`| INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador da forma de pagamento |
| `nome` | VARCHAR(100) | NÃO | UK | - | Descrição amigável (ex: Cartão de Crédito) |
| `tipo` | ENUM | NÃO | IDX | - | PIX, DINHEIRO, CARTAO_DEBITO, CARTAO_CREDITO, BOLETO, TRANSFERENCIA, OUTRO |
| `ativo` | TINYINT(1) | NÃO | IDX | 1 | 1=Ativa, 0=Inativa |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de cadastro |
| `data_atualizacao`| DATETIME | NÃO | - | CURRENT_TIMESTAMP ON UPDATE | Data de alteração |

---

### 12. Tabela: `vendas`
**Descrição:** Cabeçalho consolidado da transação comercial e métricas de lucro e margem.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_venda` | INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador único da venda |
| `id_cliente` | INT UNSIGNED | SIM | FK, IDX | NULL | Cliente comprador (opcional) |
| `id_usuario` | INT UNSIGNED | NÃO | FK, IDX | - | Vendedor ou operador do caixa |
| `id_plataforma` | INT UNSIGNED | NÃO | FK, IDX | - | Canal de origem do pedido |
| `data_venda` | DATETIME | NÃO | IDX | CURRENT_TIMESTAMP | Momento da efetivação da venda |
| `subtotal` | DECIMAL(12,2) | NÃO | - | 0.00 | Soma dos produtos sem frete/desconto |
| `desconto` | DECIMAL(12,2) | NÃO | - | 0.00 | Desconto global aplicado |
| `frete` | DECIMAL(12,2) | NÃO | - | 0.00 | Valor de frete cobrado do cliente |
| `valor_total` | DECIMAL(12,2) | NÃO | - | 0.00 | Faturamento final (`subtotal - desconto + frete`)|
| `custo_total` | DECIMAL(12,2) | NÃO | - | 0.00 | Soma dos custos históricos dos itens vendidos |
| `taxas_total` | DECIMAL(12,2) | NÃO | - | 0.00 | Soma das taxas de canal e processamento |
| `lucro_bruto` | DECIMAL(12,2) | NÃO | - | 0.00 | `valor_total - custo_total` |
| `lucro_liquido` | DECIMAL(12,2) | NÃO | - | 0.00 | `lucro_bruto - taxas_total` |
| `margem_percentual`| DECIMAL(5,2) | NÃO | - | 0.00 | `(lucro_liquido / valor_total) * 100` |
| `tipo_venda` | ENUM | NÃO | IDX | - | A_VISTA, A_PRAZO |
| `status` | ENUM | NÃO | IDX | 'PENDENTE' | PENDENTE, CONCLUIDA, CANCELADA, DEVOLVIDA |
| `observacoes` | TEXT | SIM | - | NULL | Observações comerciais e notas fiscais |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Timestamp de criação |
| `data_atualizacao`| DATETIME | NÃO | - | CURRENT_TIMESTAMP ON UPDATE | Timestamp de alteração |

---

### 13. Tabela: `itens_venda`
**Descrição:** Produtos incluídos na venda com snapshot do custo de compra na época da venda.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_item_venda` | INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador do item |
| `id_venda` | INT UNSIGNED | NÃO | FK, IDX | - | Venda à qual o item pertence |
| `id_produto` | INT UNSIGNED | NÃO | FK, IDX | - | Produto comercializado |
| `quantidade` | DECIMAL(10,2) | NÃO | - | - | Quantidade vendida |
| `preco_unitario`| DECIMAL(12,2) | NÃO | - | - | Preço unitário praticado na venda |
| `desconto` | DECIMAL(12,2) | NÃO | - | 0.00 | Desconto aplicado no item |
| `custo_unitario`| DECIMAL(12,2) | NÃO | - | 0.00 | Custo do produto no momento da venda (preservado) |
| `custo_total` | DECIMAL(12,2) | NÃO | - | 0.00 | `quantidade * custo_unitario` |
| `valor_total` | DECIMAL(12,2) | NÃO | - | 0.00 | `(quantidade * preco_unitario) - desconto` |
| `lucro_bruto` | DECIMAL(12,2) | NÃO | - | 0.00 | `valor_total - custo_total` |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de inclusão |

---

### 14. Tabela: `pagamentos`
**Descrição:** Liquidações financeiras da venda, suportando divisão em múltiplos meios.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_pagamento` | INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador do pagamento |
| `id_venda` | INT UNSIGNED | NÃO | FK, IDX | - | Venda associada |
| `id_forma_pagamento`| INT UNSIGNED| NÃO | FK, IDX | - | Meio de pagamento selecionado |
| `valor` | DECIMAL(12,2) | NÃO | - | - | Montante pago nesta modalidade |
| `quantidade_parcelas`| INT UNSIGNED| NÃO | - | 1 | Número de parcelas negociadas |
| `percentual_taxa`| DECIMAL(5,2) | NÃO | - | 0.00 | Alíquota de taxa da operadora de cartão |
| `valor_taxa` | DECIMAL(12,2) | NÃO | - | 0.00 | Valor monetário retido pela adquirente |
| `data_pagamento`| DATETIME | NÃO | IDX | CURRENT_TIMESTAMP | Data da transação financeira |
| `status` | ENUM | NÃO | IDX | 'CONFIRMADO' | PENDENTE, CONFIRMADO, CANCELADO, ESTORNADO |
| `observacao` | VARCHAR(255) | SIM | - | NULL | Código de autorização, NSU ou comprovante |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de criação |
| `data_atualizacao`| DATETIME | NÃO | - | CURRENT_TIMESTAMP ON UPDATE | Data de atualização |

---

### 15. Tabela: `parcelas`
**Descrição:** Desdobramento de pagamentos a prazo e controle individual de recebimento/inadimplência.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_parcela` | INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador da parcela |
| `id_pagamento` | INT UNSIGNED | NÃO | FK, IDX | - | Pagamento pai |
| `numero_parcela`| INT UNSIGNED | NÃO | - | - | Número sequencial da parcela (ex: 1, 2, 3) |
| `quantidade_parcelas`| INT UNSIGNED| NÃO | - | - | Total de parcelas do plano |
| `valor` | DECIMAL(12,2) | NÃO | - | - | Valor nominal da parcela |
| `data_vencimento`| DATE | NÃO | IDX | - | Data limite para pagamento |
| `data_recebimento`| DATETIME | SIM | IDX | NULL | Data efetiva do crédito em conta |
| `valor_recebido`| DECIMAL(12,2) | SIM | - | NULL | Valor líquido/bruto efetivamente recebido |
| `status` | ENUM | NÃO | IDX | 'PENDENTE' | PENDENTE, RECEBIDA, ATRASADA, CANCELADA |
| `observacao` | VARCHAR(255) | SIM | - | NULL | Justificativa de baixa ou estorno |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de cadastro |
| `data_atualizacao`| DATETIME | NÃO | - | CURRENT_TIMESTAMP ON UPDATE | Data da última alteração |

---

### 16. Tabela: `taxas`
**Descrição:** Discriminação de custos indiretos de venda (comissões de marketplace, taxas de cartão, antecipações).

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_taxa` | INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador da taxa |
| `id_venda` | INT UNSIGNED | NÃO | FK, IDX | - | Venda associada |
| `id_pagamento` | INT UNSIGNED | SIM | FK, IDX | NULL | Pagamento associado (se taxa de cartão) |
| `id_plataforma`| INT UNSIGNED | SIM | FK, IDX | NULL | Plataforma associada (se comissão) |
| `tipo_taxa` | ENUM | NÃO | IDX | - | COMISSAO_PLATAFORMA, TAXA_CARTAO, TAXA_ANTECIPACAO, TAXA_FIXA, FRETE, OUTRA |
| `descricao` | VARCHAR(150) | NÃO | - | - | Descritivo claro da dedução |
| `percentual` | DECIMAL(5,2) | NÃO | - | 0.00 | Alíquota aplicada em percentual |
| `valor` | DECIMAL(12,2) | NÃO | - | 0.00 | Valor monetário em R$ retido |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de inserção |

---

### 17. Tabela: `categorias_despesas`
**Descrição:** Classificação contábil das despesas fixas e operacionais do negócio.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_categoria_despesa`| INT UNSIGNED| NÃO | PK | AUTO_INCREMENT | Identificador da categoria de despesa |
| `nome` | VARCHAR(100) | NÃO | UK | - | Nome da categoria (ex: Aluguel, Marketing, Impostos) |
| `descricao` | VARCHAR(255) | SIM | - | NULL | Detalhes contábeis |
| `ativo` | TINYINT(1) | NÃO | IDX | 1 | 1=Ativa, 0=Inativa |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de criação |
| `data_atualizacao`| DATETIME | NÃO | - | CURRENT_TIMESTAMP ON UPDATE | Data de alteração |

---

### 18. Tabela: `despesas`
**Descrição:** Lançamento de despesas operacionais da empresa (separadas dos custos dos produtos).

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_despesa` | INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador da despesa |
| `id_categoria_despesa`| INT UNSIGNED| NÃO | FK, IDX | - | Categoria de despesa associada |
| `id_usuario` | INT UNSIGNED | NÃO | FK, IDX | - | Usuário que cadastrou/aprovou o gasto |
| `descricao` | VARCHAR(255) | NÃO | - | - | Descrição do gasto ou credor |
| `valor` | DECIMAL(12,2) | NÃO | - | - | Valor a pagar/pago |
| `data_competencia`| DATE | NÃO | IDX | - | Mês/Ano de competência contábil |
| `data_vencimento`| DATE | NÃO | IDX | - | Vencimento do boleto ou fatura |
| `data_pagamento`| DATETIME | SIM | - | NULL | Data da quitação bancária |
| `status` | ENUM | NÃO | IDX | 'PENDENTE' | PENDENTE, PAGA, ATRASADA, CANCELADA |
| `recorrente` | TINYINT(1) | NÃO | - | 0 | 1=Gasto mensal fixo, 0=Eventual |
| `observacao` | TEXT | SIM | - | NULL | Comprovante, número do documento |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de cadastro |
| `data_atualizacao`| DATETIME | NÃO | - | CURRENT_TIMESTAMP ON UPDATE | Data de alteração |

---

### 19. Tabela: `metas`
**Descrição:** Metas comerciais por vendedor ou gerais da empresa para períodos específicos.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_meta` | INT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador da meta |
| `id_usuario` | INT UNSIGNED | SIM | FK, IDX | NULL | Vendedor vinculado (NULL = Meta global da empresa) |
| `tipo_meta` | ENUM | NÃO | IDX | - | FATURAMENTO, LUCRO, VENDAS |
| `valor_meta` | DECIMAL(12,2) | NÃO | - | - | Valor monetário ou quantidade alvo |
| `data_inicio` | DATE | NÃO | IDX | - | Início da vigência da meta |
| `data_fim` | DATE | NÃO | IDX | - | Fim da vigência da meta |
| `descricao` | VARCHAR(255) | SIM | - | NULL | Nome da campanha / objetivo |
| `ativo` | TINYINT(1) | NÃO | - | 1 | 1=Em vigor, 0=Cancelada |
| `data_cadastro` | DATETIME | NÃO | - | CURRENT_TIMESTAMP | Data de inclusão |
| `data_atualizacao`| DATETIME | NÃO | - | CURRENT_TIMESTAMP ON UPDATE | Data de alteração |

---

### 20. Tabela: `auditoria`
**Descrição:** Trilha de auditoria e segurança para rastreabilidade de eventos, dados anteriores e novos em JSON.

| Coluna | Tipo | Nulo | Chave / Índice | Padrão | Descrição |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id_auditoria` | BIGINT UNSIGNED | NÃO | PK | AUTO_INCREMENT | Identificador único do log de auditoria |
| `id_usuario` | INT UNSIGNED | SIM | FK, IDX | NULL | Usuário que executou a ação |
| `tabela` | VARCHAR(50) | NÃO | IDX | - | Nome da tabela afetada |
| `id_registro` | VARCHAR(50) | SIM | - | NULL | ID do registro manipulado |
| `acao` | ENUM | NÃO | IDX | - | INSERT, UPDATE, DELETE, LOGIN, LOGOUT, CANCELAMENTO |
| `dados_anteriores`| JSON | SIM | - | NULL | Payload JSON com estado anterior |
| `dados_novos` | JSON | SIM | - | NULL | Payload JSON com novo estado |
| `endereco_ip` | VARCHAR(45) | SIM | - | NULL | IP do cliente (suporta IPv4 e IPv6) |
| `data_hora` | DATETIME | NÃO | IDX | CURRENT_TIMESTAMP | Timestamp preciso do evento |
