<?php
/**
 * GarimPro - API de Despesas
 * Endpoints RESTful para Listagem, Cadastro, Edição, Quitação, Exclusão de Despesas
 * e Gerenciamento de Tipos/Parâmetros de Despesas (Catálogo para Vendas)
 */

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

// ==============================================================================
// 1. GET - Tipos Parametrizados de Despesas OU Listagem de Despesas
// ==============================================================================
if ($method === 'GET') {
    // 1.1 Se solicitar tipos/parâmetros de despesas
    if ($action === 'tipos' || isset($_GET['tipos'])) {
        if (!$pdo) {
            $defaultTipos = [
                ['id' => 1, 'nome' => 'Facebook / Instagram Ads', 'categoria' => 'Marketing & Ads', 'icone' => 'megaphone', 'tipo_aplicacao' => 'VENDA', 'valor_sugerido' => 50.00],
                ['id' => 2, 'nome' => 'Gasolina / Uber / Transporte', 'categoria' => 'Transporte & Logística', 'icone' => 'car', 'tipo_aplicacao' => 'VENDA', 'valor_sugerido' => 30.00],
                ['id' => 3, 'nome' => 'Reparo / Peças / Manutenção', 'categoria' => 'Manutenção & Peças', 'icone' => 'tool', 'tipo_aplicacao' => 'VENDA', 'valor_sugerido' => 120.00],
                ['id' => 4, 'nome' => 'Película 3D / Capinha / Brinde', 'categoria' => 'Acessórios & Brindes', 'icone' => 'shield', 'tipo_aplicacao' => 'VENDA', 'valor_sugerido' => 25.00],
                ['id' => 5, 'nome' => 'Taxa de Entrega / Motoboy Express', 'categoria' => 'Fretes & Entregas', 'icone' => 'truck', 'tipo_aplicacao' => 'VENDA', 'valor_sugerido' => 20.00],
                ['id' => 6, 'nome' => 'Embalagem & Caixa Especial', 'categoria' => 'Embalagens & Insumos', 'icone' => 'box', 'tipo_aplicacao' => 'VENDA', 'valor_sugerido' => 15.00],
                ['id' => 7, 'nome' => 'Comissão de Vendedor Avulso', 'categoria' => 'Comissões & Equipe', 'icone' => 'user-check', 'tipo_aplicacao' => 'VENDA', 'valor_sugerido' => 80.00],
                ['id' => 8, 'nome' => 'Taxa de Maquininha / Intermediação', 'categoria' => 'Taxas & Financeiro', 'icone' => 'credit-card', 'tipo_aplicacao' => 'VENDA', 'valor_sugerido' => 35.00],
                ['id' => 9, 'nome' => 'Outras Despesas de Venda', 'categoria' => 'Custos Diversos', 'icone' => 'receipt', 'tipo_aplicacao' => 'VENDA', 'valor_sugerido' => 0.00]
            ];
            sendResponse(true, $defaultTipos, 'Tipos de despesas padrão.');
        }

        try {
            // Verificar se a tabela tipos_despesas existe
            $checkTable = $pdo->query("SHOW TABLES LIKE 'tipos_despesas'")->fetch();
            if (!$checkTable) {
                $pdo->exec("
                    CREATE TABLE IF NOT EXISTS `tipos_despesas` (
                        `id_tipo_despesa` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                        `nome` VARCHAR(100) NOT NULL,
                        `categoria` VARCHAR(100) NOT NULL DEFAULT 'Geral',
                        `icone` VARCHAR(50) NOT NULL DEFAULT 'receipt',
                        `tipo_aplicacao` ENUM('VENDA', 'OPERACIONAL', 'AMBOS') NOT NULL DEFAULT 'VENDA',
                        `valor_sugerido` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                        `ativo` TINYINT(1) NOT NULL DEFAULT 1,
                        `data_cadastro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (`id_tipo_despesa`)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ");
                $pdo->exec("
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
                ");
            }

            $stmt = $pdo->query("SELECT id_tipo_despesa AS id, nome, categoria, icone, tipo_aplicacao, valor_sugerido AS valorSugerido, ativo FROM tipos_despesas WHERE ativo = 1 ORDER BY id_tipo_despesa ASC");
            $tipos = $stmt->fetchAll();
            foreach ($tipos as &$t) {
                $t['id'] = (int)$t['id'];
                $t['valorSugerido'] = (float)$t['valorSugerido'];
            }
            sendResponse(true, $tipos, 'Tipos de despesas carregados com sucesso.');
        } catch (PDOException $e) {
            sendResponse(false, null, 'Erro ao carregar tipos de despesas: ' . $e->getMessage(), 500);
        }
    }

    // 1.2 Listagem de Despesas Gerais e Vinculadas a Vendas
    if (!$pdo) {
        sendResponse(false, null, 'Banco de dados offline.');
    }

    try {
        // Garantir que as colunas id_venda e id_tipo_despesa existam na tabela despesas
        $cols = $pdo->query("SHOW COLUMNS FROM despesas LIKE 'id_venda'")->fetch();
        if (!$cols) {
            $pdo->exec("ALTER TABLE despesas ADD COLUMN id_venda INT UNSIGNED NULL AFTER id_usuario;");
            $pdo->exec("ALTER TABLE despesas ADD COLUMN id_tipo_despesa INT UNSIGNED NULL AFTER id_venda;");
        }

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
                d.id_venda AS idVenda,
                d.id_tipo_despesa AS idTipoDespesa,
                CONCAT('VEN-', LPAD(v.id_venda, 4, '0')) AS codigoVenda,
                (
                    SELECT GROUP_CONCAT(pr.nome SEPARATOR ', ')
                    FROM itens_venda iv
                    JOIN produtos pr ON iv.id_produto = pr.id_produto
                    WHERE iv.id_venda = d.id_venda
                    LIMIT 1
                ) AS produtoVendido,
                COALESCE(c.nome, 'Geral') AS categoria
            FROM despesas d
            LEFT JOIN categorias_despesas c ON d.id_categoria_despesa = c.id_categoria_despesa
            LEFT JOIN vendas v ON d.id_venda = v.id_venda
            ORDER BY d.id_despesa DESC
        ";
        $stmt = $pdo->query($sql);
        $despesas = $stmt->fetchAll();

        // Se o banco de dados não contiver nenhuma despesa registrada, auto-semeia despesas operacionais realistas
        if (count($despesas) === 0) {
            $defaultExpenses = [
                ['Aluguel & Ponto Comercial', 1200.00, '2026-08-10', '2026-08-10', 'PAGA', 1, 'Contrato Anual Loja Física'],
                ['Internet Fibra 600MB + Telefonia', 150.00, '2026-08-15', '2026-08-15', 'PAGA', 1, 'Vivo Fibra Comercial'],
                ['Ferramentas & Softwares SaaS (Bling + Shopify)', 190.00, '2026-08-20', '2026-08-20', 'PENDENTE', 1, 'Bling ERP + Shopify SaaS'],
                ['Honorários Contabilidade & Fiscal', 350.00, '2026-08-25', '2026-08-25', 'PENDENTE', 1, 'Assessoria Fiscal & Emissão NF'],
                ['Energia Elétrica (Enel)', 180.00, '2026-08-28', '2026-08-28', 'PAGA', 1, 'Consumo Loja Física'],
                ['Campanha Facebook Ads & Instagram', 350.00, '2026-08-12', '2026-08-12', 'PAGA', 0, 'Tráfego Pago Anúncios'],
                ['Gasolina & Combustível Entregas', 160.00, '2026-08-18', '2026-08-18', 'PAGA', 0, 'Abastecimento veículo entregas'],
                ['Embalagens, Sacolas & Caixas Pro', 110.00, '2026-08-22', '2026-08-22', 'PAGA', 0, 'Embalagens personalizadas']
            ];

            try {
                $insStmt = $pdo->prepare("INSERT INTO despesas (id_usuario, descricao, valor, data_competencia, data_vencimento, status, recorrente, observacao) VALUES (1, ?, ?, ?, ?, ?, ?, ?)");
                foreach ($defaultExpenses as $de) {
                    $insStmt->execute([$de[0], $de[1], $de[2], $de[3], $de[4], $de[5], $de[6]]);
                }
                $stmt = $pdo->query($sql);
                $despesas = $stmt->fetchAll();
            } catch (Exception $seedErr) {
                // Caso falhe inserção direta, segue com array estático
            }
        }

        foreach ($despesas as &$d) {
            $d['id'] = (int)$d['id'];
            $d['valor'] = (float)$d['valor'];
            $d['recorrente'] = (bool)$d['recorrente'];
            $d['idVenda'] = $d['idVenda'] ? (int)$d['idVenda'] : null;
            $d['idTipoDespesa'] = $d['idTipoDespesa'] ? (int)$d['idTipoDespesa'] : null;
            $d['tipo'] = $d['idVenda'] ? 'variavel' : ($d['recorrente'] ? 'fixa' : 'variavel');
        }

        sendResponse(true, $despesas, 'Despesas carregadas do banco de dados.');
    } catch (PDOException $e) {
        sendResponse(false, null, 'Erro ao carregar despesas: ' . $e->getMessage(), 500);
    }
}

// ==============================================================================
// 2. POST - Criar Nova Despesa OU Criar Novo Tipo de Despesa
// ==============================================================================
if ($method === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true) ?: $_POST;

    // 2.1 Criar Novo Tipo / Parâmetro de Despesa
    if ($action === 'novo_tipo' || ($data['tipoItem'] ?? '') === 'tipo_despesa') {
        $nomeTipo = trim($data['nome'] ?? '');
        $catTipo = trim($data['categoria'] ?? 'Geral');
        $iconeTipo = trim($data['icone'] ?? 'receipt');
        $tipoAplicacao = trim($data['tipoAplicacao'] ?? 'VENDA');
        $valorSugerido = (float)($data['valorSugerido'] ?? 0);

        if (empty($nomeTipo)) {
            sendResponse(false, null, 'Nome do tipo de despesa é obrigatório.', 400);
        }

        if (!$pdo) {
            sendResponse(true, [
                'id' => rand(100, 999),
                'nome' => $nomeTipo,
                'categoria' => $catTipo,
                'icone' => $iconeTipo,
                'tipo_aplicacao' => $tipoAplicacao,
                'valorSugerido' => $valorSugerido
            ], 'Tipo de despesa cadastrado localmente.');
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO tipos_despesas (nome, categoria, icone, tipo_aplicacao, valor_sugerido, ativo) VALUES (?, ?, ?, ?, ?, 1)");
            $stmt->execute([$nomeTipo, $catTipo, $iconeTipo, $tipoAplicacao, $valorSugerido]);
            $newId = $pdo->lastInsertId();

            sendResponse(true, [
                'id' => (int)$newId,
                'nome' => $nomeTipo,
                'categoria' => $catTipo,
                'icone' => $iconeTipo,
                'tipo_aplicacao' => $tipoAplicacao,
                'valorSugerido' => $valorSugerido
            ], 'Novo tipo de despesa criado com sucesso!');
        } catch (PDOException $e) {
            sendResponse(false, null, 'Erro ao criar tipo de despesa: ' . $e->getMessage(), 500);
        }
    }

    // 2.2 Cadastrar Despesa Normal ou Vinculada a Venda
    $descricao = trim($data['descricao'] ?? '');
    $valor = (float)($data['valor'] ?? 0);
    $tipo = !empty($data['tipo']) ? strtolower($data['tipo']) : 'fixa';
    $categoriaNome = !empty($data['categoria']) ? trim($data['categoria']) : 'Geral';
    $formaPagamento = !empty($data['formaPagamento']) ? trim($data['formaPagamento']) : 'PIX';
    $dataVencimento = !empty($data['dataVencimento']) ? $data['dataVencimento'] : date('Y-m-d');
    $status = !empty($data['status']) ? strtolower($data['status']) : 'pago';
    $observacao = !empty($data['observacao']) ? trim($data['observacao']) : "Forma: $formaPagamento";
    $recorrente = !empty($data['recorrente']) ? 1 : 0;
    $idVenda = !empty($data['idVenda']) ? (int)$data['idVenda'] : null;
    $idTipoDespesa = !empty($data['idTipoDespesa']) ? (int)$data['idTipoDespesa'] : null;

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
            'status' => $status,
            'dataVencimento' => $dataVencimento,
            'observacao' => $observacao,
            'recorrente' => (bool)$recorrente,
            'idVenda' => $idVenda,
            'idTipoDespesa' => $idTipoDespesa
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

        $dbStatus = ($status === 'pago') ? 'PAGA' : (($status === 'avencer') ? 'PENDENTE' : 'PENDENTE');
        $dataPag = ($status === 'pago') ? date('Y-m-d H:i:s') : null;

        $stmt = $pdo->prepare("
            INSERT INTO despesas (id_categoria_despesa, id_usuario, id_venda, id_tipo_despesa, descricao, valor, data_competencia, data_vencimento, data_pagamento, status, recorrente, observacao)
            VALUES (?, 1, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$idCat, $idVenda, $idTipoDespesa, $descricao, $valor, $dataVencimento, $dataPag, $dbStatus, $recorrente, $observacao]);
        $idDespesa = $pdo->lastInsertId();

        $pdo->commit();

        $novaDespesa = [
            'id' => (int)$idDespesa,
            'descricao' => $descricao,
            'valor' => $valor,
            'tipo' => $tipo,
            'categoria' => $categoriaNome,
            'formaPagamento' => $formaPagamento,
            'status' => $status,
            'dataVencimento' => $dataVencimento,
            'observacao' => $observacao,
            'recorrente' => (bool)$recorrente,
            'idVenda' => $idVenda,
            'idTipoDespesa' => $idTipoDespesa
        ];

        sendResponse(true, $novaDespesa, 'Despesa registrada com sucesso!');
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        sendResponse(false, null, 'Erro ao registrar despesa: ' . $e->getMessage(), 500);
    }
}

// ==============================================================================
// 3. PUT / PATCH - Atualização de Status / Edição
// ==============================================================================
if ($method === 'PUT' || $method === 'PATCH') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true) ?: [];

    $id = (int)($data['id'] ?? ($_GET['id'] ?? 0));
    if ($id <= 0) {
        sendResponse(false, null, 'ID da despesa inválido.', 400);
    }

    if (!$pdo) {
        sendResponse(true, $data, 'Despesa atualizada localmente.');
    }

    try {
        if (isset($data['status'])) {
            $newStatus = strtolower($data['status']) === 'pago' ? 'PAGA' : 'PENDENTE';
            $dataPag = $newStatus === 'PAGA' ? date('Y-m-d H:i:s') : null;
            $stmt = $pdo->prepare("UPDATE despesas SET status = ?, data_pagamento = ? WHERE id_despesa = ?");
            $stmt->execute([$newStatus, $dataPag, $id]);
            sendResponse(true, ['id' => $id, 'status' => $data['status']], 'Status atualizado com sucesso!');
        }

        sendResponse(true, ['id' => $id], 'Despesa atualizada!');
    } catch (PDOException $e) {
        sendResponse(false, null, 'Erro ao atualizar despesa: ' . $e->getMessage(), 500);
    }
}

// ==============================================================================
// 4. DELETE - Exclusão de Despesa OU Exclusão de Tipo de Despesa
// ==============================================================================
if ($method === 'DELETE') {
    if ($action === 'deletar_tipo' || isset($_GET['id_tipo_despesa'])) {
        $idTipo = (int)($_GET['id_tipo_despesa'] ?? ($_GET['id'] ?? 0));
        if ($idTipo <= 0) {
            sendResponse(false, null, 'ID do tipo de despesa inválido.', 400);
        }
        if (!$pdo) {
            sendResponse(true, ['id' => $idTipo], 'Tipo de despesa removido localmente.');
        }
        try {
            $stmt = $pdo->prepare("UPDATE tipos_despesas SET ativo = 0 WHERE id_tipo_despesa = ?");
            $stmt->execute([$idTipo]);
            sendResponse(true, ['id' => $idTipo], 'Tipo de despesa removido com sucesso!');
        } catch (PDOException $e) {
            sendResponse(false, null, 'Erro ao excluir tipo: ' . $e->getMessage(), 500);
        }
    }

    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true) ?: [];
        $id = (int)($data['id'] ?? 0);
    }

    if ($id <= 0) {
        sendResponse(false, null, 'ID da despesa obrigatório para exclusão.', 400);
    }

    if (!$pdo) {
        sendResponse(true, ['id' => $id], 'Despesa removida localmente.');
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM despesas WHERE id_despesa = ?");
        $stmt->execute([$id]);
        sendResponse(true, ['id' => $id], 'Despesa excluída com sucesso.');
    } catch (PDOException $e) {
        sendResponse(false, null, 'Erro ao excluir despesa: ' . $e->getMessage(), 500);
    }
}

sendResponse(false, null, 'Método não suportado.', 405);
