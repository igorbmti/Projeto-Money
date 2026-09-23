<?php
/**
 * GarimPro - API de Produtos & Estoque
 * Endpoints RESTful para Listagem, Cadastro e Consulta de Estoque
 */

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// ==============================================================================
// 1. GET - Listar produtos / estoque
// ==============================================================================
if ($method === 'GET') {
    if (!$pdo) {
        sendResponse(false, null, 'Banco de dados MySQL offline ou não configurado. Utilizando armazenamento local.', 200);
    }

    try {
        // Busca produtos ativos com dados consolidados de estoque e unidades
        $sql = "
            SELECT 
                p.id_produto AS id,
                p.nome,
                p.sku,
                p.descricao,
                p.preco_venda AS precoVenda,
                p.margem_desejada AS margemProjetada,
                COALESCE(e.quantidade_atual, 1) AS quantidade,
                COALESCE(e.custo_medio, 0.00) AS investimento,
                (p.preco_venda - COALESCE(e.custo_medio, 0.00)) AS lucroProjetado,
                u.percentual_bateria AS bateria,
                u.estado_conservacao AS estado,
                c.nome AS categoria,
                COALESCE(p.foto, 'assets/products/iphone13.png') AS imagem,
                p.data_cadastro AS dataCadastro
            FROM produtos p
            LEFT JOIN categorias_produtos c ON p.id_categoria = c.id_categoria
            LEFT JOIN estoque e ON p.id_produto = e.id_produto
            LEFT JOIN (
                SELECT id_produto, percentual_bateria, estado_conservacao
                FROM unidades_produto
                WHERE status = 'DISPONIVEL'
                GROUP BY id_produto
            ) u ON p.id_produto = u.id_produto
            WHERE p.ativo = 1
            ORDER BY p.id_produto DESC
        ";

        $stmt = $pdo->query($sql);
        $produtos = $stmt->fetchAll();

        // Formata os campos adicionais extraídos da descrição ou SKU
        foreach ($produtos as &$prod) {
            $prod['id'] = (int)$prod['id'];
            $prod['investimento'] = (float)$prod['investimento'];
            $prod['precoVenda'] = (float)$prod['precoVenda'];
            $prod['lucroProjetado'] = (float)$prod['lucroProjetado'];
            $prod['margemProjetada'] = $prod['precoVenda'] > 0 ? round(($prod['lucroProjetado'] / $prod['precoVenda']) * 100, 1) : 0;
            $prod['quantidade'] = (int)$prod['quantidade'];
            $prod['diasEstoque'] = !empty($prod['dataCadastro']) ? max(1, (int)floor((time() - strtotime($prod['dataCadastro'])) / 86400)) : 15;
            
            // Extrai Gigas e Cor da descrição ou nome se não preenchido
            if (empty($prod['gigas'])) {
                if (preg_match('/(64|128|256|512)\s*GB|1\s*TB/i', $prod['nome'], $matches)) {
                    $prod['gigas'] = strtoupper($matches[0]);
                } else {
                    $prod['gigas'] = null;
                }
            }
        }

        sendResponse(true, $produtos, 'Produtos carregados com sucesso do banco de dados.');
    } catch (PDOException $e) {
        sendResponse(false, null, 'Erro na consulta do banco: ' . $e->getMessage(), 500);
    }
}

// ==============================================================================
// 2. POST - Cadastrar novo equipamento no estoque
// ==============================================================================
if ($method === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        $data = $_POST;
    }

    $nome = trim($data['nome'] ?? '');
    $investimento = (float)($data['investimento'] ?? 0);
    $precoVenda = (float)($data['precoVenda'] ?? 0);
    $gigas = !empty($data['gigas']) ? trim($data['gigas']) : null;
    $cor = !empty($data['cor']) ? trim($data['cor']) : null;
    $bateria = isset($data['bateria']) && $data['bateria'] !== '' ? (float)$data['bateria'] : null;
    $imagem = !empty($data['imagem']) ? trim($data['imagem']) : 'assets/products/iphone13.png';
    
    // Se a imagem for uma string Base64 enviada pelo frontend, salva o arquivo físico em assets/products/
    if (strpos($imagem, 'data:image/') === 0) {
        $base64Parts = explode(',', $imagem);
        if (count($base64Parts) === 2) {
            $imgData = base64_decode($base64Parts[1]);
            if ($imgData !== false) {
                $ext = 'jpg';
                if (strpos($base64Parts[0], 'png') !== false) {
                    $ext = 'png';
                } elseif (strpos($base64Parts[0], 'webp') !== false) {
                    $ext = 'webp';
                }
                $filename = 'upload_' . time() . '_' . rand(1000, 9999) . '.' . $ext;
                $uploadDir = __DIR__ . '/../assets/products/';
                if (!is_dir($uploadDir)) {
                    @mkdir($uploadDir, 0777, true);
                }
                $filePath = $uploadDir . $filename;
                if (@file_put_contents($filePath, $imgData)) {
                    $imagem = 'assets/products/' . $filename;
                }
            }
        }
    }

    $categoriaNome = !empty($data['categoria']) ? trim($data['categoria']) : 'Smartphones';
    $quantidade = (int)($data['quantidade'] ?? 1);
    if ($quantidade < 1) $quantidade = 1;

    if (empty($nome)) {
        sendResponse(false, null, 'O nome do produto é obrigatório.', 400);
    }

    // Calcula margem e lucro
    $lucroProjetado = $precoVenda - $investimento;
    $margemProjetada = $precoVenda > 0 ? round(($lucroProjetado / $precoVenda) * 100, 2) : 0;

    // Se o banco estiver offline, retorna objeto formatado para gravação local
    if (!$pdo) {
        $novoProduto = [
            'id' => rand(1000, 9999),
            'nome' => $nome,
            'investimento' => $investimento,
            'precoVenda' => $precoVenda,
            'lucroProjetado' => $lucroProjetado,
            'margemProjetada' => $margemProjetada,
            'gigas' => $gigas,
            'cor' => $cor,
            'bateria' => $bateria,
            'imagem' => $imagem,
            'categoria' => $categoriaNome,
            'quantidade' => $quantidade,
            'dataCadastro' => date('Y-m-d H:i:s'),
            'fonte' => 'local_fallback'
        ];
        sendResponse(true, $novoProduto, 'Produto registrado localmente com sucesso.');
    }

    try {
        $pdo->beginTransaction();

        // 1. Obter ou criar categoria
        $stmtCat = $pdo->prepare("SELECT id_categoria FROM categorias_produtos WHERE nome = ? LIMIT 1");
        $stmtCat->execute([$categoriaNome]);
        $cat = $stmtCat->fetch();
        if ($cat) {
            $idCategoria = $cat['id_categoria'];
        } else {
            $stmtInsertCat = $pdo->prepare("INSERT INTO categorias_produtos (nome, ativo) VALUES (?, 1)");
            $stmtInsertCat->execute([$categoriaNome]);
            $idCategoria = $pdo->lastInsertId();
        }

        // 2. Gerar SKU simples
        $skuPrefix = strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $nome), 0, 4));
        $sku = $skuPrefix . '-' . ($gigas ? preg_replace('/[^0-9]/', '', $gigas) : 'STD') . '-' . rand(100, 999);

        // 3. Inserir produto mestre
        $stmtProd = $pdo->prepare("
            INSERT INTO produtos (id_categoria, nome, sku, preco_venda, margem_desejada, controla_estoque, ativo, foto, descricao)
            VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?)
        ");
        $descricaoDetalhada = "Cor: " . ($cor ?? 'Padrão') . " | Armazenamento: " . ($gigas ?? 'N/A') . ($bateria ? " | Bateria: {$bateria}%" : "");
        $stmtProd->execute([$idCategoria, $nome, $sku, $precoVenda, $margemProjetada, $imagem, $descricaoDetalhada]);
        $idProduto = $pdo->lastInsertId();

        // 4. Inserir na tabela de estoque
        $stmtEstoque = $pdo->prepare("
            INSERT INTO estoque (id_produto, quantidade_atual, custo_medio, valor_investido)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                quantidade_atual = quantidade_atual + VALUES(quantidade_atual),
                custo_medio = VALUES(custo_medio),
                valor_investido = valor_investido + VALUES(valor_investido)
        ");
        $valorTotalInvestido = $investimento * $quantidade;
        $stmtEstoque->execute([$idProduto, $quantidade, $investimento, $valorTotalInvestido]);

        // 5. Inserir unidades físicas rastreadas
        $stmtUnidade = $pdo->prepare("
            INSERT INTO unidades_produto (id_produto, custo_aquisicao, percentual_bateria, estado_conservacao, status, observacao)
            VALUES (?, ?, ?, 'EXCELENTE', 'DISPONIVEL', ?)
        ");
        for ($i = 0; $i < $quantidade; $i++) {
            $stmtUnidade->execute([$idProduto, $investimento, $bateria, "Cor: " . ($cor ?? 'N/A')]);
        }

        $pdo->commit();

        $novoProduto = [
            'id' => (int)$idProduto,
            'nome' => $nome,
            'sku' => $sku,
            'investimento' => $investimento,
            'precoVenda' => $precoVenda,
            'lucroProjetado' => $lucroProjetado,
            'margemProjetada' => $margemProjetada,
            'gigas' => $gigas,
            'cor' => $cor,
            'bateria' => $bateria,
            'imagem' => $imagem,
            'categoria' => $categoriaNome,
            'quantidade' => $quantidade,
            'dataCadastro' => date('Y-m-d H:i:s'),
            'fonte' => 'mysql'
        ];

        sendResponse(true, $novoProduto, 'Equipamento cadastrado com sucesso no banco de dados e adicionado ao estoque!');
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        sendResponse(false, null, 'Erro ao salvar no banco de dados: ' . $e->getMessage(), 500);
    }
}

sendResponse(false, null, 'Método HTTP não suportado.', 405);
