<?php
/**
 * GarimPro - API de Despesas
 * Endpoints RESTful para Listagem e Cadastro de Despesas Operacionais
 */

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    if (!$pdo) {
        sendResponse(false, null, 'Banco de dados offline.');
    }

    try {
        $sql = "
            SELECT 
                d.id_despesa AS id,
                d.descricao,
                d.valor,
                d.data_competencia AS dataCompetencia,
                d.data_vencimento AS dataVencimento,
                d.data_pagamento AS dataPagamento,
                d.status,
                d.recorrente,
                d.observacao,
                COALESCE(c.nome, 'Geral') AS categoria
            FROM despesas d
            LEFT JOIN categorias_despesas c ON d.id_categoria_despesa = c.id_categoria_despesa
            ORDER BY d.id_despesa DESC
        ";
        $stmt = $pdo->query($sql);
        $despesas = $stmt->fetchAll();

        foreach ($despesas as &$d) {
            $d['id'] = (int)$d['id'];
            $d['valor'] = (float)$d['valor'];
        }

        sendResponse(true, $despesas, 'Despesas carregadas do banco.');
    } catch (PDOException $e) {
        sendResponse(false, null, 'Erro ao carregar despesas: ' . $e->getMessage(), 500);
    }
}

if ($method === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true) ?: $_POST;

    $descricao = trim($data['descricao'] ?? '');
    $valor = (float)($data['valor'] ?? 0);
    $tipo = !empty($data['tipo']) ? $data['tipo'] : 'FIXA';
    $categoriaNome = !empty($data['categoria']) ? $data['categoria'] : 'Geral';
    $formaPagamento = !empty($data['formaPagamento']) ? $data['formaPagamento'] : 'PIX';
    $dataVencimento = !empty($data['dataVencimento']) ? $data['dataVencimento'] : date('Y-m-d');

    if (empty($descricao) || $valor <= 0) {
        sendResponse(false, null, 'Descrição e valor válido são obrigatórios.', 400);
    }

    if (!$pdo) {
        $novaDespesa = [
            'id' => rand(1000, 9999),
            'descricao' => $descricao,
            'valor' => $valor,
            'tipo' => $tipo,
            'categoria' => $categoriaNome,
            'formaPagamento' => $formaPagamento,
            'status' => 'PAGA',
            'dataVencimento' => $dataVencimento
        ];
        sendResponse(true, $novaDespesa, 'Despesa cadastrada localmente.');
    }

    try {
        $pdo->beginTransaction();

        $stmtCat = $pdo->prepare("SELECT id_categoria_despesa FROM categorias_despesas WHERE nome LIKE ? LIMIT 1");
        $stmtCat->execute(['%' . $categoriaNome . '%']);
        $cat = $stmtCat->fetch();
        if ($cat) {
            $idCat = $cat['id_categoria_despesa'];
        } else {
            $stmtInsertCat = $pdo->prepare("INSERT INTO categorias_despesas (nome, ativo) VALUES (?, 1)");
            $stmtInsertCat->execute([$categoriaNome]);
            $idCat = $pdo->lastInsertId();
        }

        $stmt = $pdo->prepare("
            INSERT INTO despesas (id_categoria_despesa, id_usuario, descricao, valor, data_competencia, data_vencimento, data_pagamento, status, recorrente, observacao)
            VALUES (?, 1, ?, ?, CURDATE(), ?, NOW(), 'PAGA', 0, ?)
        ");
        $stmt->execute([$idCat, $descricao, $valor, $dataVencimento, "Forma: $formaPagamento"]);
        $idDespesa = $pdo->lastInsertId();

        $pdo->commit();

        $novaDespesa = [
            'id' => (int)$idDespesa,
            'descricao' => $descricao,
            'valor' => $valor,
            'tipo' => $tipo,
            'categoria' => $categoriaNome,
            'formaPagamento' => $formaPagamento,
            'status' => 'PAGA',
            'dataVencimento' => $dataVencimento
        ];

        sendResponse(true, $novaDespesa, 'Despesa registrada no banco de dados com sucesso!');
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        sendResponse(false, null, 'Erro ao registrar despesa: ' . $e->getMessage(), 500);
    }
}

sendResponse(false, null, 'Método não suportado.', 405);
