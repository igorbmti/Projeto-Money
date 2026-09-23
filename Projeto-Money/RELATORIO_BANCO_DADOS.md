# Relatório do Banco de Dados

## 1. Identificação do projeto

- **Nome**: Sistema de Controle de Vendas e Gestão Financeira
- **Banco**: `controle_vendas`
- **Tecnologia**: MySQL 8.x / MariaDB 10.4+ (compatível com Hostinger)
- **Hospedagem**: Hostinger (Cloud / cPanel / hPanel)
- **Versão**: 1.0.0 (Produção)
- **Engine**: `InnoDB`
- **Charset / Collation**: `utf8mb4` / `utf8mb4_unicode_ci`

---

## 2. Objetivo

Desenvolver e validar a infraestrutura completa do banco de dados relacional para um sistema web moderno de **Controle de Vendas, Estoque, Custos, Lucros, Taxas de Marketplace, Despesas Operacionais, Contas a Receber e Auditoria**.

A modelagem foi concebida para ser totalmente independente da camada de apresentação (front-end/dashboard), atuando como o núcleo das regras de negócio, integridade transacional, persistência histórica de custos e governança de dados para vendas à vista, vendas a prazo, parcelamentos e transações híbridas.

---

## 3. Arquitetura

A arquitetura do banco foi organizada em 6 módulos integrados e normalizados na Terceira Forma Normal (3FN):

1. **Módulo de Acesso e Segurança**: `perfis`, `usuarios`.
2. **Módulo de Produtos e Catálogo**: `categorias_produtos`, `produtos`, `unidades_produto` (prontidão para controle serial/IMEI).
3. **Módulo de Estoque e Custos**: `estoque` (1:1), `historico_custos`, `movimentacoes_estoque`.
4. **Módulo Comercial e Clientes**: `clientes`, `plataformas`, `formas_pagamento`.
5. **Módulo de Vendas e Liquidação**: `vendas`, `itens_venda`, `pagamentos`, `parcelas`, `taxas`.
6. **Módulo de Gestão Financeira, Metas e Auditoria**: `categorias_despesas`, `despesas`, `metas`, `auditoria`.

A camada de leitura conta com **9 Views Analíticas** otimizadas para dashboards e relatórios de DRE sintético, lucro líquido, rentabilidade por canal, contas a receber e controle de inventário.

---

## 4. Tabelas criadas

Foram criadas 20 tabelas relacionais com engine `InnoDB`:

1. `perfis`
2. `usuarios`
3. `categorias_produtos`
4. `produtos`
5. `unidades_produto`
6. `historico_custos`
7. `estoque`
8. `movimentacoes_estoque`
9. `clientes`
10. `plataformas`
11. `formas_pagamento`
12. `vendas`
13. `itens_venda`
14. `pagamentos`
15. `parcelas`
16. `taxas`
17. `categorias_despesas`
18. `despesas`
19. `metas`
20. `auditoria`

---

## 5. Colunas

Todas as colunas utilizam **snake_case**, em **Português**, sem caracteres acentuados:

- **`perfis`**: `id_perfil` (PK), `nome` (UK), `descricao`, `ativo`, `data_cadastro`, `data_atualizacao`.
- **`usuarios`**: `id_usuario` (PK), `id_perfil` (FK), `nome`, `email` (UK), `senha`, `telefone`, `foto`, `ativo`, `ultimo_acesso`, `data_cadastro`, `data_atualizacao`.
- **`categorias_produtos`**: `id_categoria` (PK), `nome` (UK), `descricao`, `ativo`, `data_cadastro`, `data_atualizacao`.
- **`produtos`**: `id_produto` (PK), `id_categoria` (FK), `nome`, `sku` (UK), `codigo_barras` (UK), `descricao`, `unidade`, `preco_venda`, `margem_desejada`, `estoque_minimo`, `controla_estoque`, `controla_unidade`, `ativo`, `data_cadastro`, `data_atualizacao`.
- **`unidades_produto`**: `id_unidade_produto` (PK), `id_produto` (FK), `numero_serie`, `imei`, `custo_aquisicao`, `estado_conservacao`, `percentual_bateria`, `status`, `data_entrada`, `data_saida`, `observacao`, `data_cadastro`, `data_atualizacao`.
- **`historico_custos`**: `id_historico_custo` (PK), `id_produto` (FK), `custo_unitario`, `quantidade`, `data_custo`, `observacao`, `data_cadastro`.
- **`estoque`**: `id_estoque` (PK), `id_produto` (FK, UK), `quantidade_atual`, `custo_medio`, `valor_investido`, `data_atualizacao`.
- **`movimentacoes_estoque`**: `id_movimentacao` (PK), `id_produto` (FK), `id_usuario` (FK), `tipo_movimentacao`, `quantidade`, `custo_unitario`, `documento_referencia`, `observacao`, `data_movimentacao`, `data_cadastro`.
- **`clientes`**: `id_cliente` (PK), `nome`, `cpf_cnpj`, `telefone`, `email`, `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `observacoes`, `ativo`, `data_cadastro`, `data_atualizacao`.
- **`plataformas`**: `id_plataforma` (PK), `nome` (UK), `descricao`, `percentual_comissao_padrao`, `taxa_fixa_padrao`, `ativo`, `data_cadastro`, `data_atualizacao`.
- **`formas_pagamento`**: `id_forma_pagamento` (PK), `nome` (UK), `tipo`, `ativo`, `data_cadastro`, `data_atualizacao`.
- **`vendas`**: `id_venda` (PK), `id_cliente` (FK), `id_usuario` (FK), `id_plataforma` (FK), `data_venda`, `subtotal`, `desconto`, `frete`, `valor_total`, `custo_total`, `taxas_total`, `lucro_bruto`, `lucro_liquido`, `margem_percentual`, `tipo_venda`, `status`, `observacoes`, `data_cadastro`, `data_atualizacao`.
- **`itens_venda`**: `id_item_venda` (PK), `id_venda` (FK), `id_produto` (FK), `quantidade`, `preco_unitario`, `desconto`, `custo_unitario`, `custo_total`, `valor_total`, `lucro_bruto`, `data_cadastro`.
- **`pagamentos`**: `id_pagamento` (PK), `id_venda` (FK), `id_forma_pagamento` (FK), `valor`, `quantidade_parcelas`, `percentual_taxa`, `valor_taxa`, `data_pagamento`, `status`, `observacao`, `data_cadastro`, `data_atualizacao`.
- **`parcelas`**: `id_parcela` (PK), `id_pagamento` (FK), `numero_parcela`, `quantidade_parcelas`, `valor`, `data_vencimento`, `data_recebimento`, `valor_recebido`, `status`, `observacao`, `data_cadastro`, `data_atualizacao`.
- **`taxas`**: `id_taxa` (PK), `id_venda` (FK), `id_pagamento` (FK), `id_plataforma` (FK), `tipo_taxa`, `descricao`, `percentual`, `valor`, `data_cadastro`.
- **`categorias_despesas`**: `id_categoria_despesa` (PK), `nome` (UK), `descricao`, `ativo`, `data_cadastro`, `data_atualizacao`.
- **`despesas`**: `id_despesa` (PK), `id_categoria_despesa` (FK), `id_usuario` (FK), `descricao`, `valor`, `data_competencia`, `data_vencimento`, `data_pagamento`, `status`, `recorrente`, `observacao`, `data_cadastro`, `data_atualizacao`.
- **`metas`**: `id_meta` (PK), `id_usuario` (FK), `tipo_meta`, `valor_meta`, `data_inicio`, `data_fim`, `descricao`, `ativo`, `data_cadastro`, `data_atualizacao`.
- **`auditoria`**: `id_auditoria` (PK), `id_usuario` (FK), `tabela`, `id_registro`, `acao`, `dados_anteriores` (JSON), `dados_novos` (JSON), `endereco_ip`, `data_hora`.

---

## 6. Relacionamentos

A integridade referencial foi mapeada e implementada com as seguintes cardinalidades e ações:

- `perfis` (1:N) `usuarios` (`ON DELETE RESTRICT`)
- `categorias_produtos` (1:N) `produtos` (`ON DELETE RESTRICT`)
- `produtos` (1:1) `estoque` (`ON DELETE RESTRICT`, `UNIQUE(id_produto)`)
- `produtos` (1:N) `historico_custos` (`ON DELETE RESTRICT`)
- `produtos` (1:N) `unidades_produto` (`ON DELETE RESTRICT`)
- `produtos` (1:N) `movimentacoes_estoque` (`ON DELETE RESTRICT`)
- `usuarios` (1:N) `movimentacoes_estoque` (`ON DELETE RESTRICT`)
- `clientes` (1:N) `vendas` (`ON DELETE SET NULL`)
- `usuarios` (1:N) `vendas` (`ON DELETE RESTRICT`)
- `plataformas` (1:N) `vendas` (`ON DELETE RESTRICT`)
- `vendas` (1:N) `itens_venda` (`ON DELETE CASCADE`)
- `produtos` (1:N) `itens_venda` (`ON DELETE RESTRICT`)
- `vendas` (1:N) `pagamentos` (`ON DELETE CASCADE`)
- `formas_pagamento` (1:N) `pagamentos` (`ON DELETE RESTRICT`)
- `pagamentos` (1:N) `parcelas` (`ON DELETE CASCADE`)
- `vendas` (1:N) `taxas` (`ON DELETE CASCADE`)
- `pagamentos` (1:N) `taxas` (`ON DELETE SET NULL`)
- `plataformas` (1:N) `taxas` (`ON DELETE SET NULL`)
- `categorias_despesas` (1:N) `despesas` (`ON DELETE RESTRICT`)
- `usuarios` (1:N) `despesas` (`ON DELETE RESTRICT`)
- `usuarios` (1:N) `metas` (`ON DELETE SET NULL`)
- `usuarios` (1:N) `auditoria` (`ON DELETE SET NULL`)

---

## 7. Regras de negócio

1. **Cliente Opcional**: Vendas de balcão e rápidas podem ser concluídas sem vínculo com `clientes` (`id_cliente NULL`).
2. **Preservação de Custo Histórico**: Ao lançar um item na venda (`itens_venda`), o campo `custo_unitario` grava o custo vigente no momento da transação. Reajustes futuros no produto não alteram o lucro passado.
3. **Múltiplos Pagamentos por Venda**: Suporte a divisão da conta (ex.: PIX + Dinheiro, ou Entrada no PIX + Saldo no Cartão).
4. **Desdobramento de Parcelas**: Pagamentos a prazo registram a previsão de cada vencimento e o status de liquidação.
5. **Separação Contábil Estrita**:
   - **Custo do Produto**: Direto da mercadoria vendida (`itens_venda.custo_total`).
   - **Taxa da Venda**: Tarifas de cartão, frete e comissões de marketplace (`taxas`).
   - **Despesas Operacionais**: Gastos gerais e fixos (`despesas`), avaliados separadamente na DRE.
6. **Imutabilidade e Soft Delete**: Vendas concluídas não são excluídas fisicamente; em caso de cancelamento, o status passa para `CANCELADA`, com devolução de estoque, movimentação correspondente e registro em `auditoria`.

---

## 8. Regras financeiras

Fórmulas implementadas e validadas:

- **Faturamento Bruto**: $\sum \text{valor\_total das vendas com status = 'CONCLUIDA'}$
- **Custo Total das Vendas**: $\sum \text{custo\_total dos itens das vendas concluídas}$
- **Lucro Bruto**: $\text{Faturamento} - \text{Custo Total}$
- **Taxas da Venda**: $\sum \text{taxas (comissões de plataforma + taxas de cartão + fretes)}$
- **Lucro Líquido da Venda**: $\text{Lucro Bruto} - \text{Taxas da Venda}$
- **Margem Líquida (%)**: $\left(\frac{\text{Lucro Líquido}}{\text{Faturamento}}\right) \times 100$
- **Resultado Operacional Líquido (DRE)**: $\text{Lucro Líquido das Vendas} - \text{Despesas Operacionais Pagas}$

---

## 9. Controle de estoque

- **Posição Atual**: Mantida na tabela `estoque` em relação 1:1 com `produtos`.
- **Custo Médio Ponderado**: Recalculado a cada lote de entrada através da média ponderada de estoque e valor investido.
- **Extrato Contínuo**: Cada entrada, venda, perda, devolução ou cancelamento gera registro imutável em `movimentacoes_estoque`.
- **Rastreabilidade Serial**: Suporte a controle de números de série e IMEI na tabela `unidades_produto`.
- **Transações ACID**: Abertura de `START TRANSACTION`, validação de saldo, registro da venda/itens/pagamentos/taxas, dedução no estoque e registro do extrato antes de `COMMIT` (ou `ROLLBACK` em caso de falha).

---

## 10. Segurança

- **Senhas Criptografadas**: Armazenamento exclusivo via hash criptográfico (`VARCHAR(255)` para Bcrypt / Argon2).
- **Proteção contra SQL Injection**: Uso de types rígidos, compatibilidade com prepared statements na aplicação.
- **Trilha de Auditoria**: Registro de IP, data/hora, usuário, ação (`INSERT`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`, `CANCELAMENTO`) com snapshots em JSON (`dados_anteriores` e `dados_novos`).
- **Integridade de Restrição**: `RESTRICT` em cadastros essenciais para evitar exclusão acidental de dados com histórico contábil.

---

## 11. Índices

Foram criados índices direcionados para alta performance em consultas analíticas e filtros frequentes:

- **Datas**: `vendas.data_venda`, `parcelas.data_vencimento`, `parcelas.data_recebimento`, `despesas.data_competencia`, `despesas.data_vencimento`, `auditoria.data_hora`.
- **Chaves de Relacionamento**: `vendas.id_cliente`, `vendas.id_usuario`, `vendas.id_plataforma`, `itens_venda.id_venda`, `itens_venda.id_produto`, `pagamentos.id_venda`, `parcelas.id_pagamento`, `taxas.id_venda`.
- **Códigos e Identificadores**: `produtos.sku` (UK), `produtos.codigo_barras` (UK), `unidades_produto.numero_serie`, `unidades_produto.imei`.
- **Status e Filtros**: `vendas.status`, `vendas.tipo_venda`, `pagamentos.status`, `parcelas.status`, `despesas.status`, `produtos.ativo`, `clientes.ativo`.

---

## 12. Views

Foram implementadas as seguintes 9 views analíticas:

1. **`vw_resumo_vendas`**: Visão unificada de faturamento, cliente, vendedor, canal, custos, lucro bruto e líquido.
2. **`vw_lucro_vendas`**: Comparativo direto de rentabilidade com faturamento, custo de produto, taxas e margem líquida percentual.
3. **`vw_resumo_estoque`**: Posição de estoque, custo médio, capital investido, projeção de lucro e flag de alerta de reposição (`alerta_estoque_baixo`).
4. **`vw_produtos_mais_vendidos`**: Ranking de produtos comercializados, pedidos, receita gerada e margem bruta média (apenas vendas concluídas).
5. **`vw_vendas_por_plataforma`**: Performance segregada por canal (Mercado Livre, Shopee, Loja Física, WhatsApp) com comissões e margem líquida.
6. **`vw_vendas_por_forma_pagamento`**: Volume e valor líquido recebido por forma de pagamento (PIX, Cartão, Dinheiro).
7. **`vw_resumo_despesas`**: Agrupamento contábil de despesas por categoria com totalizadores de valores pagos, pendentes e atrasados.
8. **`vw_contas_receber`**: Gestão de recebíveis e parcelamentos com cálculo dinâmico de dias em atraso para títulos pendentes vencidos.
9. **`vw_evolucao_financeira`**: DRE resumido mensal confrontando receitas de vendas concluídas, custos, taxas e despesas operacionais pagas.

---

## 13. Dados iniciais

O script `database.sql` inclui a carga inicial dos seguintes dados padrão:

- **Perfis**: `Administrador`, `Gerente`, `Vendedor`, `Financeiro`.
- **Formas de Pagamento**: `PIX`, `Dinheiro`, `Cartão de Débito`, `Cartão de Crédito`, `Boleto`, `Transferência`, `Outro`.
- **Plataformas**: `Mercado Livre` (16% + R$ 5,00), `Shopee` (14% + R$ 4,00), `WhatsApp`, `Instagram`, `Venda presencial`, `Site próprio` (4,5% + R$ 0,50), `Outra`.
- **Categorias de Despesas**: `Operacionais`, `Marketing`, `Logística`, `Impostos`, `Aluguel`, `Energia`, `Internet`, `Salários`, `Outras`.
- **Categorias de Produtos**: `Smartphones`, `Acessórios`, `Smartwatches`, `Áudio`.
- **Usuário Inicial**: Administrador do Sistema (`admin@sistema.local`).

---

## 14. Testes realizados

Todos os testes foram executados e validados no banco de dados local através do script `testes.sql`:

| Cenário Testado | Ações Executadas | Resultado |
| :--- | :--- | :---: |
| **Criação do Schema** | Execução de `database.sql` no MariaDB 10.4 / MySQL | **SUCESSO** |
| **Carga de Dados Básicos** | Cadastro de vendedor, clientes, produtos com estoque inicial | **SUCESSO** |
| **Venda à Vista** | Venda balcão de R$ 190,00 no PIX, dedução de estoque e lucro de R$ 130,00 | **SUCESSO** |
| **Venda a Prazo com Taxas** | Venda no Mercado Livre de R$ 3.530,00 em 3x no Cartão com taxa de R$ 569,80 | **SUCESSO** |
| **Parcelamento** | Geração automática de 3 parcelas de R$ 1.176,68 / R$ 1.176,66 / R$ 1.176,66 | **SUCESSO** |
| **Múltiplos Pagamentos** | Venda de R$ 600,00 dividida em R$ 400,00 no PIX + R$ 200,00 em Dinheiro | **SUCESSO** |
| **Custo Histórico** | Entrada de novo lote com preço reajustado; conferência de que vendas antigas mantiveram seus custos originais | **SUCESSO** |
| **Despesas Operacionais** | Lançamento de Aluguel (R$ 1.200,00), Ads (R$ 300,00) e Luz (R$ 180,00) | **SUCESSO** |
| **Cancelamento de Venda** | Alteração de status para CANCELADA, estorno de estoque no extrato e log na auditoria | **SUCESSO** |
| **Cálculo de Lucro e Margem** | Validação de margem de 68.42% (venda 1), 15.87% (venda 2) e 66.67% (venda 3) | **SUCESSO** |
| **DRE e Views Analíticas** | Execução de todas as 9 views com consolidação matemática exata | **SUCESSO** |
| **Auditoria** | Inserção de logs com payloads em formato JSON para INSERT e CANCELAMENTO | **SUCESSO** |

---

## 15. Pendências

- Nenhuma pendência técnica ou de modelagem. A estrutura encontra-se 100% pronta para implantação em produção na Hostinger.

---

## 16. Conclusão

O banco de dados relacional `controle_vendas` atende integralmente a todos os requisitos arquiteturais, funcionais e de integridade exigidos. A estrutura oferece isolamento contábil rigoroso entre custos de aquisição, taxas comerciais e despesas fixas, garante precisão matemática em cálculos de rentabilidade, suporta vendas simples e compostas, e está pronta para expansões futuras (como rastreamento por IMEI e integrações via API de marketplaces).
