<?php
/**
 * GarimPro - Dashboard & KPIs Live API
 * Métricas consolidadas em tempo real do banco de dados MySQL
 */

require_once __DIR__ . '/db.php';

if (!$pdo) {
    sendResponse(false, null, 'Banco de dados MySQL offline. Utilizando dados locais.');
}

try {
    // 1. KPIs Gerais (Faturamento, Lucro, Vendas, Despesas)
    $kpiQuery = "
        SELECT 
            COALESCE(SUM(valor_total), 0) AS totalFaturamento,
            COALESCE(SUM(lucro_liquido), 0) AS totalLucro,
            COUNT(id_venda) AS totalVendas,
            COALESCE(AVG(margem_percentual), 0) AS margemMedia
        FROM vendas 
        WHERE status = 'CONCLUIDA' OR status = 'PENDENTE'
    ";
    $kpis = $pdo->query($kpiQuery)->fetch();

    $despesasQuery = "
        SELECT COALESCE(SUM(valor), 0) AS totalDespesas 
        FROM despesas 
        WHERE status = 'PAGA' OR status = 'PENDENTE'
    ";
    $desp = $pdo->query($despesasQuery)->fetch();

    // 2. Top Produtos Ranking
    $topProdQuery = "
        SELECT 
            p.id_produto AS id,
            p.nome,
            COALESCE(p.foto, 'assets/products/iphone13.png') AS imagem,
            COUNT(iv.id_item_venda) AS vendas,
            COALESCE(SUM(iv.valor_total), 0) AS faturamento,
            COALESCE(c.nome, 'Geral') AS categoria
        FROM produtos p
        LEFT JOIN itens_venda iv ON p.id_produto = iv.id_produto
        LEFT JOIN categorias_produtos c ON p.id_categoria = c.id_categoria
        GROUP BY p.id_produto
        ORDER BY vendas DESC, faturamento DESC
        LIMIT 5
    ";
    $topProdutos = $pdo->query($topProdQuery)->fetchAll();

    // 3. Vendas por Plataforma
    $platQuery = "
        SELECT 
            p.id_plataforma AS id,
            p.nome,
            COUNT(v.id_venda) AS vendasQtd,
            COALESCE(SUM(v.valor_total), 0) AS faturamentoTotal
        FROM plataformas p
        LEFT JOIN vendas v ON p.id_plataforma = v.id_plataforma
        GROUP BY p.id_plataforma
        ORDER BY faturamentoTotal DESC
    ";
    $plataformas = $pdo->query($platQuery)->fetchAll();

    // 4. Vendas por Forma de Pagamento
    $fpQuery = "
        SELECT 
            fp.id_forma_pagamento AS id,
            fp.nome,
            fp.tipo,
            COALESCE(SUM(pg.valor), 0) AS valorTotal,
            COUNT(pg.id_pagamento) AS totalLancamentos
        FROM formas_pagamento fp
        LEFT JOIN pagamentos pg ON fp.id_forma_pagamento = pg.id_forma_pagamento
        GROUP BY fp.id_forma_pagamento
        ORDER BY valorTotal DESC
    ";
    $formasPagamento = $pdo->query($fpQuery)->fetchAll();

    $response = [
        'kpis' => [
            'faturamento' => (float)$kpis['totalFaturamento'],
            'lucro' => (float)$kpis['totalLucro'],
            'vendas' => (int)$kpis['totalVendas'],
            'despesas' => (float)$desp['totalDespesas'],
            'margemMedia' => round((float)$kpis['margemMedia'], 1)
        ],
        'topProdutos' => $topProdutos,
        'plataformas' => $plataformas,
        'formasPagamento' => $formasPagamento
    ];

    sendResponse(true, $response, 'Dados consolidados do dashboard.');
} catch (PDOException $e) {
    sendResponse(false, null, 'Erro ao carregar métricas: ' . $e->getMessage(), 500);
}
