<?php
/**
 * GarimPro - API de Vendas
 * Endpoints RESTful para Listagem e Cadastro de Vendas com Transações e Atualização de Estoque
 */

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// ==============================================================================
// 1. GET - Listar vendas consolidadas
// ==============================================================================
if ($method === 'GET') {
    if (!$pdo) {
        sendResponse(false, null, 'Banco de dados offline. Usando dados locais.', 200);
    }

    try {
        $sql = "
            SELECT 
                v.id_venda AS id,
                CONCAT('VEN-', LPAD(v.id_venda, 4, '0')) AS codigo,
                v.data_venda AS dataVenda,
                v.status,
                COALESCE(c.nome, 'Cliente Avulso') AS cliente,
                COALESCE(u.nome, 'Vendedor') AS vendedor,
                COALESCE(p.nome, 'WhatsApp / Direto') AS plataforma,
                v.valor_total AS faturamento,
                v.custo_total AS custo,
                v.taxas_total AS taxas,
                v.lucro_liquido AS lucro,
                v.margem_percentual AS margem,
                (
                    SELECT GROUP_CONCAT(CONCAT(pr.nome, ' (x', CAST(iv.quantidade AS UNSIGNED), ')') SEPARATOR ', ')
                    FROM itens_venda iv
                    JOIN produtos pr ON iv.id_produto = pr.id_produto
                    WHERE iv.id_venda = v.id_venda
                ) AS produto,
                (
                    SELECT pr.foto
                    FROM itens_venda iv
                    JOIN produtos pr ON iv.id_produto = pr.id_produto
                    WHERE iv.id_venda = v.id_venda
                    LIMIT 1
                ) AS produtoImagem,
                (
                    SELECT fp.nome
                    FROM pagamentos pg
                    JOIN formas_pagamento fp ON pg.id_forma_pagamento = fp.id_forma_pagamento
                    WHERE pg.id_venda = v.id_venda
                    LIMIT 1
                ) AS formaPagamento
            FROM vendas v
            LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
            LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
            LEFT JOIN plataformas p ON v.id_plataforma = p.id_plataforma
            ORDER BY v.id_venda DESC
        ";

        $stmt = $pdo->query($sql);
        $vendas = $stmt->fetchAll();

        foreach ($vendas as &$v) {
            $v['id'] = (int)$v['id'];
            $v['faturamento'] = (float)$v['faturamento'];
            $v['custo'] = (float)$v['custo'];
            $v['taxas'] = (float)$v['taxas'];
            $v['lucro'] = (float)$v['lucro'];
            $v['margem'] = (float)$v['margem'];
            if (empty($v['produtoImagem'])) {
                $v['produtoImagem'] = 'assets/products/iphone13.png';
            }
            if (empty($v['produto'])) {
                $v['produto'] = 'Equipamento Comercializado';
            }
        }

        sendResponse(true, $vendas, 'Vendas carregadas do banco de dados.');
    } catch (PDOException $e) {
        sendResponse(false, null, 'Erro ao consultar vendas: ' . $e->getMessage(), 500);
    }
}

// ==============================================================================
// 2. POST - Cadastrar Nova Venda
// ==============================================================================
if ($method === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true) ?: $_POST;

    $idProduto = (int)($data['idProduto'] ?? 0);
    $quantidade = (int)($data['quantidade'] ?? 1);
    $valorVenda = (float)($data['valorVenda'] ?? 0);
    $valorCusto = (float)($data['valorCusto'] ?? 0);
    $taxaPlataformaPct = (float)($data['taxaPlataformaPct'] ?? 0);
    $clienteNome = trim($data['clienteNome'] ?? 'Cliente Avulso');
    $plataformaNome = trim($data['plataforma'] ?? 'WhatsApp / Direto');
    $formaPagamentoNome = trim($data['formaPagamento'] ?? 'PIX');
    $status = !empty($data['status']) ? strtoupper(trim($data['status'])) : 'CONCLUIDA';

    $faturamento = $valorVenda * $quantidade;
    $custoTotal = $valorCusto * $quantidade;
    $taxasTotal = ($faturamento * ($taxaPlataformaPct / 100));
    $lucroLiquido = $faturamento - $custoTotal - $taxasTotal;
    $margemPercentual = $faturamento > 0 ? round(($lucroLiquido / $faturamento) * 100, 2) : 0;

    if (!$pdo) {
        $novaVenda = [
            'id' => rand(1000, 9999),
            'codigo' => 'VEN-' . rand(1000, 9999),
            'cliente' => $clienteNome,
            'faturamento' => $faturamento,
            'custo' => $custoTotal,
            'taxas' => $taxasTotal,
            'lucro' => $lucroLiquido,
            'margem' => $margemPercentual,
            'plataforma' => $plataformaNome,
            'formaPagamento' => $formaPagamentoNome,
            'status' => $status,
            'dataVenda' => date('Y-m-d H:i:s')
        ];
        sendResponse(true, $novaVenda, 'Venda cadastrada localmente.');
    }

    try {
        $pdo->beginTransaction();

        // 1. Obter ou criar Cliente
        $stmtCli = $pdo->prepare("SELECT id_cliente FROM clientes WHERE nome = ? LIMIT 1");
        $stmtCli->execute([$clienteNome]);
        $cli = $stmtCli->fetch();
        if ($cli) {
            $idCliente = $cli['id_cliente'];
        } else {
            $stmtInsertCli = $pdo->prepare("INSERT INTO clientes (nome, tipo, ativo) VALUES (?, 'PF', 1)");
            $stmtInsertCli->execute([$clienteNome]);
            $idCliente = $pdo->lastInsertId();
        }

        // 2. Obter Plataforma
        $stmtPlat = $pdo->prepare("SELECT id_plataforma FROM plataformas WHERE nome LIKE ? LIMIT 1");
        $stmtPlat->execute(['%' . $plataformaNome . '%']);
        $plat = $stmtPlat->fetch();
        $idPlataforma = $plat ? $plat['id_plataforma'] : 1;

        // 3. Obter Forma de Pagamento
        $stmtFp = $pdo->prepare("SELECT id_forma_pagamento FROM formas_pagamento WHERE nome LIKE ? LIMIT 1");
        $stmtFp->execute(['%' . $formaPagamentoNome . '%']);
        $fp = $stmtFp->fetch();
        $idFormaPagamento = $fp ? $fp['id_forma_pagamento'] : 1;

        // 4. Inserir Venda Mestre
        $stmtVenda = $pdo->prepare("
            INSERT INTO vendas (id_cliente, id_usuario, id_plataforma, tipo_venda, status, subtotal, desconto, frete, valor_total, custo_total, taxas_total, lucro_bruto, lucro_liquido, margem_percentual)
            VALUES (?, 1, ?, 'A_VISTA', ?, ?, 0.00, 0.00, ?, ?, ?, ?, ?, ?)
        ");
        $lucroBruto = $faturamento - $custoTotal;
        $stmtVenda->execute([
            $idCliente, $idPlataforma, $status,
            $faturamento, $faturamento, $custoTotal, $taxasTotal,
            $lucroBruto, $lucroLiquido, $margemPercentual
        ]);
        $idVenda = $pdo->lastInsertId();

        // 5. Inserir Itens da Venda
        if ($idProduto > 0) {
            $stmtItem = $pdo->prepare("
                INSERT INTO itens_venda (id_venda, id_produto, quantidade, preco_unitario, custo_unitario, custo_total, valor_total, lucro_bruto)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmtItem->execute([$idVenda, $idProduto, $quantidade, $valorVenda, $valorCusto, $custoTotal, $faturamento, $lucroBruto]);

            // Atualizar estoque
            $stmtBaixaEstoque = $pdo->prepare("
                UPDATE estoque SET quantidade_atual = GREATEST(0, quantidade_atual - ?) WHERE id_produto = ?
            ");
            $stmtBaixaEstoque->execute([$quantidade, $idProduto]);
        }

        // 6. Inserir Pagamento
        $stmtPag = $pdo->prepare("
            INSERT INTO pagamentos (id_venda, id_forma_pagamento, valor, quantidade_parcelas, percentual_taxa, valor_taxa, status)
            VALUES (?, ?, ?, 1, ?, ?, 'CONFIRMADO')
        ");
        $stmtPag->execute([$idVenda, $idFormaPagamento, $faturamento, $taxaPlataformaPct, $taxasTotal]);

        $pdo->commit();

        $novaVenda = [
            'id' => (int)$idVenda,
            'codigo' => 'VEN-' . str_pad($idVenda, 4, '0', STR_PAD_LEFT),
            'cliente' => $clienteNome,
            'faturamento' => $faturamento,
            'custo' => $custoTotal,
            'taxas' => $taxasTotal,
            'lucro' => $lucroLiquido,
            'margem' => $margemPercentual,
            'plataforma' => $plataformaNome,
            'formaPagamento' => $formaPagamentoNome,
            'status' => $status,
            'dataVenda' => date('Y-m-d H:i:s')
        ];

        sendResponse(true, $novaVenda, 'Venda cadastrada e sincronizada com sucesso no banco de dados!');
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        sendResponse(false, null, 'Erro ao registrar venda: ' . $e->getMessage(), 500);
    }
}

sendResponse(false, null, 'Método não suportado.', 405);
