/**
 * Garimpa - Main Application Engine
 * Renderiza os dados dinâmicos, cálculos em tempo real e reatividade
 */

const App = {
  salesList: [...MockData.vendasRecentes],
  productsList: [...MockData.produtosCatalogo],
  expensesList: [...(MockData.despesas || [])],
  expenseTypesList: [...(MockData.tiposDespesasVenda || [])],
  currentExpenseFilter: 'all',
  currentExpenseCategoryFilter: 'all',
  currentExpenseSort: 'latest',
  expenseRankLimit: 10,
  currentExpenseSearch: '',
  currentBudgetReduction: 10,
  productsVisibleLimit: 5,
  currentCategoryFilter: 'all',
  currentSearchQuery: '',

  init() {
    this.renderKPIs();
    this.renderRanking();
    this.renderSalesTable(this.salesList);
    this.renderSalesKpis();
    this.renderPaymentPills();
    this.renderPlatformLegends();
    this.renderNotifications();
    this.setupSalesFilters();
    this.setupSaleExpensesBuilder();
    this.setupNewSaleCalculator();
    this.setupNewSaleSubmit();
    this.setupScrollReveal();

    // Sincronização em tempo real com o Banco de Dados MySQL
    this.fetchDashboardFromDB();
    this.fetchSalesFromDB();
    this.fetchExpensesFromDB();
    this.fetchExpenseTypesFromDB();

    // Módulo de Produtos & Estoque
    this.setupProductsEvents();
    this.setupNewProductForm();
    this.fetchProductsFromDB();

    // Módulo de Despesas (Fixas, Variáveis e Tipos Parametrizados)
    this.setupExpensesEvents();
    this.setupExpenseTypesModal();

    // Módulo Financeiro, Investimentos & DRE
    this.renderFinancialView();
    this.renderExpensesView();

    // Módulo de Relatórios & Exportação por Período
    this.setupReportsView();

    // Módulo de Sugestões & Ideias
    this.setupSuggestionsView();

    // Inicializar módulos de suporte
    Navigation.init();
    ChartsEngine.init();
  },

  /* ==========================================================================
     RENDERIZAÇÃO DE INDICADORES (KPIs)
     ========================================================================== */
  renderKPIs() {
    const k = MockData.kpis;
    
    // Faturamento
    document.getElementById("kpiFaturamentoVal").textContent = k.faturamento.formatado;
    document.getElementById("kpiFaturamentoTrend").innerHTML = `
      <span class="kpi-trend-pill">↑ ${k.faturamento.crescimento}%</span>
      <span class="kpi-trend-context">${k.faturamento.periodoComp}</span>
    `;

    // Lucro Líquido
    document.getElementById("kpiLucroVal").textContent = k.lucro.formatado;
    document.getElementById("kpiLucroTrend").innerHTML = `
      <span class="kpi-trend-pill">↑ ${k.lucro.crescimento}%</span>
      <span class="kpi-trend-context">${k.lucro.periodoComp}</span>
    `;

    // Vendas
    document.getElementById("kpiVendasVal").textContent = k.vendas.formatado;
    document.getElementById("kpiVendasTrend").innerHTML = `
      <span class="kpi-trend-pill">↑ ${k.vendas.crescimento}%</span>
      <span class="kpi-trend-context">${k.vendas.periodoComp}</span>
    `;

    // A Receber / Despesas
    document.getElementById("kpiReceberVal").textContent = k.aReceber.formatado;
    document.getElementById("kpiReceberTrend").innerHTML = `
      <span class="kpi-trend-pill">↑ ${k.aReceber.crescimento}%</span>
      <span class="kpi-trend-context">${k.aReceber.periodoComp}</span>
    `;
  },

  /* ==========================================================================
     RENDERIZAÇÃO DO RANKING TOP PRODUTOS
     ========================================================================== */
  renderRanking() {
    const container = document.getElementById("topProductsList");
    if (!container) return;

    container.innerHTML = MockData.topProdutos.map((item, idx) => `
      <div class="ranking-item">
        <div class="ranking-left">
          <div class="ranking-position ranking-pos-${idx + 1}">${idx + 1}</div>
          <div class="ranking-thumb">
            ${item.imagem 
              ? `<img src="${item.imagem}" alt="${item.nome}" class="ranking-thumb-img" onerror="this.onerror=null; this.parentElement.innerHTML='${item.icone || '📱'}';">`
              : (item.icone || '📱')}
          </div>
          <div class="ranking-info">
            <span class="ranking-title">${item.nome}</span>
            <div class="ranking-meta-row">
              <span class="ranking-badge-sales">${item.vendas} vendas</span>
              <span class="ranking-bullet">•</span>
              <span class="ranking-detalhe">${item.detalhe}</span>
            </div>
          </div>
        </div>
        <div class="ranking-right">
          <span class="ranking-revenue">R$ ${item.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          <span class="ranking-share">${item.share}</span>
        </div>
      </div>
    `).join('');
  },

  /* ==========================================================================
     RENDERIZAÇÃO DE FORMAS DE PAGAMENTO & PLATAFORMAS
     ========================================================================== */
  renderPaymentPills() {
    const container = document.getElementById("paymentPillGrid");
    if (!container) return;

    container.innerHTML = MockData.formasPagamento.map(item => `
      <div class="payment-pill-card" data-pay-id="${item.id}">
        <div class="payment-pill-header">
          <span class="payment-pill-name">${item.nome}</span>
          <span class="payment-pill-pct">${item.percentual}%</span>
        </div>
        <div class="payment-pill-val">R$ ${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
      </div>
    `).join('');
  },

  renderPlatformLegends() {
    const container = document.getElementById("platformLegendList");
    if (container) {
      container.innerHTML = MockData.plataformas.map(p => `
        <div class="platform-row-item" data-platform-id="${p.id}">
          <div class="platform-item-left">
            <div class="platform-thumb-box" style="--thumb-color: ${p.cor};">
              <img src="${p.icone}" alt="${p.nome}" class="platform-thumb-img" onerror="this.style.display='none'">
            </div>
            <div class="platform-meta">
              <div class="platform-title-line">
                <span class="platform-name">${p.nome}</span>
                <span class="platform-sales-tag">${p.vendasQtd} ${p.vendasQtd === 1 ? 'venda' : 'vendas'}</span>
              </div>
              <div class="platform-progress-bg">
                <div class="platform-progress-fill" style="--target-width: ${p.percentual}%; width: ${p.percentual}%; background: ${p.cor};"></div>
              </div>
            </div>
          </div>
          <div class="platform-item-right">
            <span class="platform-val">R$ ${p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span class="platform-pct" style="color: ${p.cor}; background: ${p.cor}18; border: 1px solid ${p.cor}33;">${p.percentual}%</span>
          </div>
        </div>
      `).join('');
    }

    const containerPay = document.getElementById("paymentLegendList");
    if (containerPay) {
      containerPay.innerHTML = MockData.formasPagamento.map(p => `
        <div class="payment-legend-row" data-pay-id="${p.id}">
          <div class="payment-legend-left">
            <span class="payment-glow-dot" style="--pay-color: ${p.cor}; background-color: ${p.cor}; box-shadow: 0 0 6px ${p.cor};"></span>
            <span class="payment-legend-name">${p.nome}</span>
          </div>
          <span class="payment-legend-pct">${p.percentual}%</span>
        </div>
      `).join('');
    }
  },

  getPaymentIconSvg(id) {
    switch (id) {
      case 'pix':
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 12l10 10 10-10L12 2z"/><path d="M12 6.5L6.5 12 12 17.5 17.5 12 12 6.5z"/></svg>`;
      case 'cartao_credito':
      case 'cartao':
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`;
      case 'cartao_debito':
      case 'debito':
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><path d="M5 15h4M15 15h4"></path></svg>`;
      case 'dinheiro':
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>`;
      case 'boleto':
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v16M8 4v16M11 4v16M14 4v16M17 4v16M20 4v16"></path></svg>`;
      case 'outros':
      default:
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.5"></circle><circle cx="19" cy="12" r="1.5"></circle><circle cx="5" cy="12" r="1.5"></circle></svg>`;
    }
  },

  /* ==========================================================================
     RENDERIZAÇÃO DA TABELA ADAPTATIVA (DESKTOP + MOBILE)
     ========================================================================== */
  renderSalesTable(list) {
    const desktopTbody = document.getElementById("salesTableDesktopTbody");
    const historyDesktopTbody = document.getElementById("salesHistoryTableDesktopTbody");
    const mobileList = document.getElementById("salesMobileCardList");
    const historyMobileList = document.getElementById("salesHistoryMobileCardList");
    const countLabel = document.getElementById("salesTotalCount");
    const historyCountLabel = document.getElementById("salesHistoryTotalCount");

    const countText = `Mostrando ${list.length} de ${this.salesList.length} vendas`;
    if (countLabel) countLabel.textContent = countText;
    if (historyCountLabel) historyCountLabel.textContent = countText;

    const tableHtml = list.length === 0
      ? `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--text-tertiary);">Nenhuma venda encontrada com os filtros aplicados.</td></tr>`
      : list.map(s => {
          const hasExpenses = Number(s.despesasTotal || 0) > 0;
          const expensesTooltip = Array.isArray(s.despesasExtras) && s.despesasExtras.length > 0
            ? s.despesasExtras.map(e => `${e.nome || e.descricao || 'Custo'}: R$ ${Number(e.valor).toFixed(2)}`).join(' • ')
            : `R$ ${Number(s.despesasTotal || 0).toFixed(2)} em despesas`;

          return `
          <tr>
            <td class="col-main">#${s.id}</td>
            <td class="col-client">
              <div style="font-weight:600; color:var(--text-primary);">${s.cliente}</div>
              <div class="text-xs text-tertiary">${s.data}</div>
            </td>
            <td>
              <span class="platform-pill platform-${s.plataformaId}">
                <span class="platform-dot"></span>
                ${s.plataforma}
              </span>
            </td>
            <td class="col-items" title="${s.itens}">
              <div>${s.itens}</div>
              ${hasExpenses ? `<span class="sale-expense-badge" title="${expensesTooltip}">⚡ -R$ ${Number(s.despesasTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} custos</span>` : ''}
            </td>
            <td><span class="badge badge-primary">${s.pagamento}</span></td>
            <td class="col-value">R$ ${s.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td class="col-profit">
              <div>+R$ ${s.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              ${hasExpenses ? `<span class="text-xs" style="color:#f472b6; font-size:0.68rem; font-weight:600;">(abatido custos)</span>` : ''}
            </td>
            <td class="col-actions">
              <span class="badge ${s.statusClass}">${s.status}</span>
            </td>
          </tr>
        `;}).join('');

    if (desktopTbody) desktopTbody.innerHTML = tableHtml;
    if (historyDesktopTbody) historyDesktopTbody.innerHTML = tableHtml;

    const mobileHtml = list.length === 0
      ? `<div style="text-align:center; padding:24px; color:var(--text-tertiary);">Nenhuma venda encontrada.</div>`
      : list.map(s => {
          const hasExpenses = Number(s.despesasTotal || 0) > 0;
          const expensesTooltip = Array.isArray(s.despesasExtras) && s.despesasExtras.length > 0
            ? s.despesasExtras.map(e => `${e.nome || e.descricao || 'Custo'}: R$ ${Number(e.valor).toFixed(2)}`).join(' • ')
            : `R$ ${Number(s.despesasTotal || 0).toFixed(2)} em despesas`;

          return `
          <div class="adaptive-data-card">
            <div class="adaptive-card-header">
              <span class="adaptive-card-id">#${s.id}</span>
              <span class="badge ${s.statusClass}">${s.status}</span>
            </div>
            <div class="adaptive-card-body">
              <div class="adaptive-client-info">
                <span class="adaptive-client-name">${s.cliente}</span>
                <span class="adaptive-order-items">${s.itens}</span>
                ${hasExpenses ? `<span class="sale-expense-badge" style="margin-top:4px;" title="${expensesTooltip}">⚡ -R$ ${Number(s.despesasTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} custos</span>` : ''}
                <div class="adaptive-platform-badge">
                  <span class="platform-pill platform-${s.plataformaId}" style="padding:2px 6px; font-size:0.7rem;">
                    <span class="platform-dot"></span>
                    ${s.plataforma} • ${s.pagamento}
                  </span>
                </div>
              </div>
            </div>
            <div class="adaptive-card-footer">
              <div class="adaptive-price-group">
                <span class="adaptive-total-val">R$ ${s.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span class="adaptive-profit-val">+R$ ${s.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <span class="text-xs text-tertiary">${s.data}</span>
            </div>
          </div>
        `;}).join('');

    if (mobileList) mobileList.innerHTML = mobileHtml;
    if (historyMobileList) historyMobileList.innerHTML = mobileHtml;
  },

  /* ==========================================================================
     FILTROS EM TEMPO REAL DA TABELA
     ========================================================================== */
  setupSalesFilters() {
    const searchInputs = [
      document.getElementById("salesSearchInput"),
      document.getElementById("salesHistorySearchInput")
    ].filter(Boolean);

    const platformSelects = [
      document.getElementById("salesPlatformFilter"),
      document.getElementById("salesHistoryPlatformFilter")
    ].filter(Boolean);

    const statusSelects = [
      document.getElementById("salesStatusFilter"),
      document.getElementById("salesHistoryStatusFilter")
    ].filter(Boolean);

    const applyFiltersFrom = (sourceInput, sourcePlatform, sourceStatus) => {
      const search = (sourceInput ? sourceInput.value : "").toLowerCase().trim();
      const platform = sourcePlatform ? sourcePlatform.value : "all";
      const status = sourceStatus ? sourceStatus.value : "all";

      // Sincronizar os campos da outra visualização
      searchInputs.forEach(inp => { if (inp !== sourceInput) inp.value = sourceInput ? sourceInput.value : ""; });
      platformSelects.forEach(sel => { if (sel !== sourcePlatform) sel.value = platform; });
      statusSelects.forEach(sel => { if (sel !== sourceStatus) sel.value = status; });

      const filtered = this.salesList.filter(s => {
        const matchesSearch = s.cliente.toLowerCase().includes(search) || 
                              s.id.toLowerCase().includes(search) || 
                              s.itens.toLowerCase().includes(search);
        const matchesPlatform = platform === "all" || s.plataformaId === platform;
        const matchesStatus = status === "all" || s.status.toLowerCase() === status.toLowerCase();

        return matchesSearch && matchesPlatform && matchesStatus;
      });

      this.renderSalesTable(filtered);
    };

    searchInputs.forEach(inp => {
      inp.addEventListener("input", () => {
        const pSel = inp.id === "salesSearchInput" ? document.getElementById("salesPlatformFilter") : document.getElementById("salesHistoryPlatformFilter");
        const sSel = inp.id === "salesSearchInput" ? document.getElementById("salesStatusFilter") : document.getElementById("salesHistoryStatusFilter");
        applyFiltersFrom(inp, pSel, sSel);
      });
    });

    platformSelects.forEach(sel => {
      sel.addEventListener("change", () => {
        const sInp = sel.id === "salesPlatformFilter" ? document.getElementById("salesSearchInput") : document.getElementById("salesHistorySearchInput");
        const sSel = sel.id === "salesPlatformFilter" ? document.getElementById("salesStatusFilter") : document.getElementById("salesHistoryStatusFilter");
        applyFiltersFrom(sInp, sel, sSel);
      });
    });

    statusSelects.forEach(sel => {
      sel.addEventListener("change", () => {
        const sInp = sel.id === "salesStatusFilter" ? document.getElementById("salesSearchInput") : document.getElementById("salesHistorySearchInput");
        const pSel = sel.id === "salesStatusFilter" ? document.getElementById("salesPlatformFilter") : document.getElementById("salesHistoryPlatformFilter");
        applyFiltersFrom(sInp, pSel, sel);
      });
    });
  },

  /* ==========================================================================
     MÓDULO: CONSTRUTOR DINÂMICO DE DESPESAS DA VENDA (CUSTOS EXTRAS)
     ========================================================================== */
  setupSaleExpensesBuilder() {
    const btnAdd = document.getElementById("btnAddSaleExpenseRow");
    const container = document.getElementById("saleExpensesListContainer");
    if (!btnAdd || !container) return;

    btnAdd.addEventListener("click", () => {
      this.addSaleExpenseRow();
    });
  },

  addSaleExpenseRow(initialTipoId = null, initialValor = null) {
    const container = document.getElementById("saleExpensesListContainer");
    if (!container) return;

    const rowId = `saleExpRow_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const rowEl = document.createElement("div");
    rowEl.className = "sale-expense-row";
    rowEl.id = rowId;

    // Gerar opções a partir dos tipos parametrizados
    const optionsHtml = this.expenseTypesList.map(t => `
      <option value="${t.id}" data-cat="${t.categoria}" data-default-val="${t.valorSugerido || 0}" ${initialTipoId && Number(initialTipoId) === Number(t.id) ? 'selected' : ''}>
        ${t.nome}
      </option>
    `).join('');

    const defaultFirstVal = initialValor !== null ? initialValor : (this.expenseTypesList[0] ? (this.expenseTypesList[0].valorSugerido || '') : '');

    rowEl.innerHTML = `
      <div>
        <select class="form-select sale-expense-type-select" style="padding: 7px 10px; font-size: 0.82rem; font-weight: 600;">
          ${optionsHtml}
        </select>
      </div>
      <div style="position: relative;">
        <span style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-weight: 700; color: #f472b6; font-size: 0.75rem;">R$</span>
        <input type="number" step="0.01" min="0" class="form-input sale-expense-val-input" placeholder="0,00" value="${defaultFirstVal}" style="padding-left: 28px; padding-top: 7px; padding-bottom: 7px; font-size: 0.85rem; font-weight: 700; color: #f472b6;">
      </div>
      <button type="button" class="sale-expense-del-btn" title="Remover este custo extra">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    container.appendChild(rowEl);

    // Eventos do seletor e do input
    const typeSelect = rowEl.querySelector(".sale-expense-type-select");
    const valInput = rowEl.querySelector(".sale-expense-val-input");
    const delBtn = rowEl.querySelector(".sale-expense-del-btn");

    if (typeSelect && valInput) {
      typeSelect.addEventListener("change", () => {
        const opt = typeSelect.options[typeSelect.selectedIndex];
        if (opt && opt.dataset.defaultVal && (!valInput.value || parseFloat(valInput.value) === 0)) {
          valInput.value = parseFloat(opt.dataset.defaultVal).toFixed(2);
        }
        this.recalculateSaleModal();
      });

      valInput.addEventListener("input", () => {
        this.recalculateSaleModal();
      });
    }

    if (delBtn) {
      delBtn.addEventListener("click", () => {
        rowEl.remove();
        this.recalculateSaleModal();
      });
    }

    this.recalculateSaleModal();
  },

  getSaleExpensesFromModal() {
    const container = document.getElementById("saleExpensesListContainer");
    if (!container) return [];

    const rows = container.querySelectorAll(".sale-expense-row");
    const items = [];

    rows.forEach(r => {
      const typeSelect = r.querySelector(".sale-expense-type-select");
      const valInput = r.querySelector(".sale-expense-val-input");
      if (typeSelect && valInput) {
        const val = parseFloat(valInput.value) || 0;
        if (val > 0) {
          const selectedOpt = typeSelect.options[typeSelect.selectedIndex];
          items.push({
            id_tipo: parseInt(typeSelect.value) || null,
            nome: selectedOpt ? selectedOpt.text.trim() : 'Custo de Venda',
            categoria: selectedOpt ? (selectedOpt.dataset.cat || 'Marketing & Ads') : 'Marketing & Ads',
            valor: val
          });
        }
      }
    });

    return items;
  },

  /* ==========================================================================
     CALCULADORA INTELIGENTE DO MODAL NOVA VENDA
     ========================================================================== */
  setupNewSaleCalculator() {
    const productSelect = document.getElementById("newSaleProduct");
    const qtyInput = document.getElementById("newSaleQty");
    const priceInput = document.getElementById("newSalePrice");
    const discountInput = document.getElementById("newSaleDiscount");
    const shippingInput = document.getElementById("newSaleShipping");

    // Preencher produtos no select
    if (productSelect) {
      productSelect.innerHTML = `<option value="">Selecione um produto cadastrado...</option>` +
        this.productsList.map(p => `
          <option value="${p.id}" data-price="${p.precoVenda}" data-cost="${p.investimento || p.custoMedio || 0}">
            ${p.nome} ${p.gigas ? '(' + p.gigas + ')' : ''} - Estoque: ${p.quantidade || p.estoque || 1} un | R$ ${(p.precoVenda || 0).toFixed(2)}
          </option>
        `).join('');

      productSelect.addEventListener("change", () => {
        const selected = productSelect.options[productSelect.selectedIndex];
        if (selected && selected.dataset.price) {
          priceInput.value = parseFloat(selected.dataset.price).toFixed(2);
        }
        this.recalculateSaleModal();
      });
    }

    [qtyInput, priceInput, discountInput, shippingInput].forEach(el => {
      if (el) el.addEventListener("input", () => this.recalculateSaleModal());
    });
  },

  recalculateSaleModal() {
    const productSelect = document.getElementById("newSaleProduct");
    const qtyInput = document.getElementById("newSaleQty");
    const priceInput = document.getElementById("newSalePrice");
    const discountInput = document.getElementById("newSaleDiscount");
    const shippingInput = document.getElementById("newSaleShipping");

    const subtotalDisplay = document.getElementById("calcSubtotal");
    const cmvDisplay = document.getElementById("calcCMV");
    const saleExpDisplay = document.getElementById("calcSaleExpensesDisplay");
    const profitDisplay = document.getElementById("calcProfit");
    const marginDisplay = document.getElementById("calcMargin");
    const summaryCard = document.getElementById("saleExpensesSummaryCard");
    const summaryTotalDisplay = document.getElementById("saleExpensesTotalDisplay");

    const selected = productSelect ? productSelect.options[productSelect.selectedIndex] : null;
    const unitCost = selected && selected.dataset.cost ? parseFloat(selected.dataset.cost) : 0;
    
    const qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;
    const unitPrice = parseFloat(priceInput ? priceInput.value : 0) || 0;
    const discount = parseFloat(discountInput ? discountInput.value : 0) || 0;
    const shipping = parseFloat(shippingInput ? shippingInput.value : 0) || 0;

    // Calcular despesas extras da venda
    const saleExpenses = this.getSaleExpensesFromModal();
    const totalSaleExpenses = saleExpenses.reduce((acc, curr) => acc + curr.valor, 0);

    const subtotal = (unitPrice * qty) - discount + shipping;
    const totalCost = (unitCost * qty);
    const netProfit = subtotal - totalCost - totalSaleExpenses;
    const margin = subtotal > 0 ? ((netProfit / subtotal) * 100) : 0;

    if (subtotalDisplay) subtotalDisplay.textContent = `R$ ${Math.max(subtotal, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (cmvDisplay) cmvDisplay.textContent = `- R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (saleExpDisplay) saleExpDisplay.textContent = `- R$ ${totalSaleExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    
    if (summaryCard && summaryTotalDisplay) {
      if (totalSaleExpenses > 0) {
        summaryCard.style.display = 'flex';
        summaryTotalDisplay.textContent = `- R$ ${totalSaleExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      } else {
        summaryCard.style.display = 'none';
      }
    }

    if (profitDisplay) {
      if (netProfit >= 0) {
        profitDisplay.textContent = `+R$ ${netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        profitDisplay.style.color = "var(--success)";
      } else {
        profitDisplay.textContent = `-R$ ${Math.abs(netProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        profitDisplay.style.color = "#f87171";
      }
    }

    if (marginDisplay) {
      marginDisplay.textContent = `${margin.toFixed(1)}% margem`;
      if (margin >= 20) {
        marginDisplay.className = "badge badge-success";
      } else if (margin >= 10) {
        marginDisplay.className = "badge badge-warning";
      } else {
        marginDisplay.className = "badge badge-danger";
      }
    }
  },

  /* ==========================================================================
     SUBMIT DA NOVA VENDA COM CUSTOS EXTRAS VINCULADOS
     ========================================================================== */
  setupNewSaleSubmit() {
    const form = document.getElementById("formNewSale");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const client = document.getElementById("newSaleClient").value || "Cliente Balcão";
      const productSelect = document.getElementById("newSaleProduct");
      const productName = productSelect.options[productSelect.selectedIndex].text.split("(")[0].split("-")[0].trim() || "Produto Diverso";
      const idProduto = parseInt(productSelect.value) || 0;
      const platformSelect = document.getElementById("newSalePlatform");
      const platformName = platformSelect.options[platformSelect.selectedIndex].text;
      const platformId = platformSelect.value;
      const paymentSelect = document.getElementById("newSalePayment");
      const paymentName = paymentSelect.options[paymentSelect.selectedIndex].text;
      
      const qty = parseInt(document.getElementById("newSaleQty").value) || 1;
      const unitPrice = parseFloat(document.getElementById("newSalePrice").value) || 0;
      const discount = parseFloat(document.getElementById("newSaleDiscount").value) || 0;
      const shipping = parseFloat(document.getElementById("newSaleShipping").value) || 0;

      const selected = productSelect.options[productSelect.selectedIndex];
      const unitCost = selected && selected.dataset.cost ? parseFloat(selected.dataset.cost) : (unitPrice * 0.7);

      // Obter custos extras lançados nesta venda
      const saleExpenses = this.getSaleExpensesFromModal();
      const totalSaleExpenses = saleExpenses.reduce((acc, curr) => acc + curr.valor, 0);

      const totalVal = (unitPrice * qty) - discount + shipping;
      const totalCost = (unitCost * qty);
      const profit = totalVal - totalCost - totalSaleExpenses;

      const newId = `VND-${Math.floor(1000 + Math.random() * 9000)}`;

      const newSaleObj = {
        id: newId,
        cliente: client,
        plataforma: platformName,
        plataformaId: platformId,
        itens: `${qty}x ${productName}`,
        qtdItens: qty,
        pagamento: paymentName,
        valorTotal: totalVal,
        custoCMV: totalCost,
        despesasTotal: totalSaleExpenses,
        despesasExtras: saleExpenses,
        lucro: profit,
        status: "Concluído",
        statusClass: "badge-success",
        data: "Agora mesmo"
      };

      // 1. Adicionar à lista local de vendas
      this.salesList.unshift(newSaleObj);
      this.renderSalesTable(this.salesList);

      // 2. Criar lançamentos de despesas vinculadas a esta venda
      saleExpenses.forEach(exp => {
        const expId = Math.floor(10000 + Math.random() * 90000);
        const newExpObj = {
          id: expId,
          tipo: "variavel",
          descricao: `${exp.nome} (Venda #${newId} • ${productName})`,
          categoria: exp.categoria || "Marketing & Ads",
          valor: exp.valor,
          data: `Hoje, ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          dataVencimento: new Date().toISOString().split('T')[0],
          status: "pago",
          formaPagamento: paymentName,
          recorrente: false,
          idVenda: newId,
          produtoVendido: productName,
          observacao: `Custo direto lançado na venda #${newId}`
        };
        this.expensesList.unshift(newExpObj);
      });

      // 3. Atualizar Faturamento e Lucro KPIs
      MockData.kpis.faturamento.valor += totalVal;
      MockData.kpis.faturamento.formatado = `R$ ${MockData.kpis.faturamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      MockData.kpis.lucro.valor += profit;
      MockData.kpis.lucro.formatado = `R$ ${MockData.kpis.lucro.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      MockData.kpis.vendas.valor += 1;
      MockData.kpis.vendas.formatado = `${MockData.kpis.vendas.valor}`;
      if (MockData.kpis.despesas) {
        MockData.kpis.despesas.valor += totalSaleExpenses;
        MockData.kpis.despesas.formatado = `R$ ${MockData.kpis.despesas.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      }

      // 4. Enviar ao Banco de Dados MySQL via API PHP
      try {
        const url = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.getApiUrl)
          ? window.APP_CONFIG.getApiUrl('api/vendas.php')
          : 'api/vendas.php';
        
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idProduto: idProduto,
            quantidade: qty,
            valorVenda: unitPrice,
            valorCusto: unitCost,
            clienteNome: client,
            plataforma: platformName,
            formaPagamento: paymentName,
            despesasVenda: saleExpenses
          })
        });
      } catch (err) {
        console.log('Venda sincronizada localmente');
      }

      // 5. Re-renderizar todas as visões reativamente
      this.renderKPIs();
      this.renderExpensesView();
      this.renderFinancialView();

      // 6. Fechar modal e resetar
      Navigation.closeModal("modalNewSale");
      const expContainer = document.getElementById("saleExpensesListContainer");
      if (expContainer) expContainer.innerHTML = '';
      this.showToast(`Venda #${newId} registrada com R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de lucro líquido real!`);
      form.reset();
    });
  },

  /* ==========================================================================
     NOTIFICAÇÕES & TOAST FEEDBACK
     ========================================================================== */
  renderNotifications() {
    const listEl = document.getElementById("notificationList");
    if (!listEl) return;

    listEl.innerHTML = MockData.notificacoes.map(n => `
      <div class="notification-item ${n.unread ? 'unread' : ''}">
        <div style="flex:1;">
          <div style="font-weight:700; color:var(--text-primary);">${n.titulo}</div>
          <div style="color:var(--text-secondary); margin-top:2px;">${n.desc}</div>
          <div class="text-xs text-tertiary" style="margin-top:4px;">${n.tempo}</div>
        </div>
      </div>
    `).join('');
  },

  showToast(message) {
    let toast = document.getElementById("appToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "appToast";
      toast.style.cssText = `
        position: fixed;
        bottom: 84px;
        right: 24px;
        background: linear-gradient(135deg, #141a29 0%, #1e293b 100%);
        border: 1px solid var(--border-card);
        color: #ffffff;
        padding: 12px 20px;
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-lg);
        font-size: 0.85rem;
        font-weight: 600;
        z-index: 300;
        display: flex;
        align-items: center;
        gap: 8px;
        transform: translateY(20px);
        opacity: 0;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";

    setTimeout(() => {
      toast.style.transform = "translateY(20px)";
      toast.style.opacity = "0";
    }, 3200);
  },

  /* ==========================================================================
     SCROLL REVEAL (FADE IN DA ESQUERDA PARA A DIREITA CONFORME ROLA A PÁGINA)
     ========================================================================== */
  setupScrollReveal() {
    const items = document.querySelectorAll('.platform-row-item');
    if (items.length === 0) return;

    const revealItem = (el) => {
      el.classList.add('is-revealed');
    };

    const checkVisibility = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      items.forEach(el => {
        if (!el.classList.contains('is-revealed')) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= vh + 30 && rect.bottom >= -50) {
            revealItem(el);
          }
        }
      });
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            revealItem(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.01,
        rootMargin: '0px 0px 60px 0px'
      });

      items.forEach(el => observer.observe(el));
    }

    // Fallback com listener de scroll capturando eventos em qualquer container pai
    window.addEventListener('scroll', checkVisibility, { passive: true, capture: true });
    window.addEventListener('resize', checkVisibility, { passive: true });

    // Verificação inicial rápida
    requestAnimationFrame(checkVisibility);
    setTimeout(checkVisibility, 100);
    setTimeout(checkVisibility, 300);
  },

  /* ==========================================================================
     MÓDULO DE VENDAS & PERFORMANCE COMERCIAL
     ========================================================================== */

  // Atualiza indicadores de volume de vendas (Header) e performance comercial (Visão Financeira)
  renderSalesKpis() {
    const totalVendas = this.salesList.length;
    const faturamentoTotal = this.salesList.reduce((acc, s) => acc + Number(s.valorTotal || 0), 0);
    const lucroTotal = this.salesList.reduce((acc, s) => acc + Number(s.lucro || 0), 0);
    const ticketMedio = totalVendas > 0 ? (faturamentoTotal / totalVendas) : 0;
    const margemMedia = faturamentoTotal > 0 ? ((lucroTotal / faturamentoTotal) * 100) : 0;

    // 1. Badge Integrado no Header do Histórico de Vendas
    const elSalesCount = document.getElementById("salesHistoryKpiCount");
    const elSalesContext = document.getElementById("salesHistoryKpiTrendContext");
    if (elSalesCount) elSalesCount.textContent = `${totalVendas}`;
    if (elSalesContext) elSalesContext.textContent = `• ${totalVendas === 1 ? 'pedido' : 'pedidos'}`;

    // 2. Cards de Desempenho Comercial (Visão Financeira)
    const elFat = document.getElementById("salesHistoryKpiFaturamento");
    const elLucro = document.getElementById("salesHistoryKpiLucro");
    const elTicket = document.getElementById("salesHistoryKpiTicket");
    const elLucroContext = document.getElementById("salesKpiLucroContext");

    if (elFat) elFat.textContent = `R$ ${faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elLucro) elLucro.textContent = `R$ ${lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elTicket) elTicket.textContent = `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elLucroContext) elLucroContext.textContent = `${margemMedia.toFixed(1)}% margem`;
  },

  /* ==========================================================================
     MÓDULO DE PRODUTOS & ESTOQUE (VIEW 2)
     ========================================================================== */

  // Atualiza indicadores de volume de estoque (Header) e inteligência de produtos (Visão Financeira)
  renderProductKpis() {
    let totalQtd = 0;
    let totalInvest = 0;
    let totalVendaPrevista = 0;
    let totalLucro = 0;

    this.productsList.forEach(p => {
      const qtd = Number(p.quantidade) || 1;
      const invest = Number(p.investimento) || 0;
      const venda = Number(p.precoVenda) || 0;
      const lucro = Number(p.lucroProjetado) || (venda - invest);

      totalQtd += qtd;
      totalInvest += (invest * qtd);
      totalVendaPrevista += (venda * qtd);
      totalLucro += (lucro * qtd);
    });

    // Helper para extrair dias de estoque de forma consistente
    const getProductStockDays = (p, idx) => {
      if (p.diasEstoque !== undefined && p.diasEstoque !== null) return Number(p.diasEstoque);
      if (p.dataCadastro) {
        const diff = Math.floor((Date.now() - new Date(p.dataCadastro).getTime()) / (1000 * 60 * 60 * 24));
        if (!isNaN(diff) && diff >= 0) return diff;
      }
      const defaults = [12, 18, 28, 22, 42, 15, 54, 9];
      return defaults[idx % defaults.length] || 15;
    };

    // 1. Indicador Integrado no Header de Catálogo de Produtos
    const elQtd = document.getElementById("prodKpiTotalQtd");
    const elModelos = document.getElementById("prodKpiTotalModelos");
    const elEstoqueContext = document.getElementById("prodKpiEstoqueContext");

    if (elQtd) elQtd.textContent = `${totalQtd} un`;
    if (elModelos) elModelos.textContent = `• ${this.productsList.length} modelos`;
    if (elEstoqueContext) elEstoqueContext.textContent = "cadastrados";

    // Helper para extrair apenas o primeiro nome/modelo principal do equipamento (sem capacidade, cor ou ruídos)
    const getPrimaryProductName = (fullName) => {
      if (!fullName) return "--";
      let name = String(fullName).trim();

      if (name.includes(" - ")) name = name.split(" - ")[0].trim();
      else if (name.includes(" | ")) name = name.split(" | ")[0].trim();
      else if (name.includes(" / ")) name = name.split(" / ")[0].trim();

      name = name.replace(/[\s\-_,]*(16|32|64|128|256|512)\s*(GB|gb|Gb|gB).*$/i, '');
      name = name.replace(/[\s\-_,]*(1|2)\s*(TB|tb|Tb|tB).*$/i, '');
      name = name.replace(/\b(16|32|64|128|256|512)\s*(GB|gb)\b.*$/i, '');
      name = name.replace(/[\s\-_,]*(Preto|Branco|Grafite|Azul|Verde|Dourado|Prateado|Roxo|Vermelho|Space Gray|Deep Purple|Midnight|Starlight|Meia-noite|Estelar|Branco Glacial|Phantom Black|Cinza|Gold|Silver).*$/i, '');
      name = name.replace(/[\s\-_,]*MagSafe.*$/i, '');

      return name.trim() || fullName;
    };

    // 2. Card: Equipamento com Maior Retorno Financeiro (Visão Financeira)
    let topRetornoProd = null;
    let maxLucroUnit = -Infinity;

    this.productsList.forEach(p => {
      const invest = Number(p.investimento) || 0;
      const venda = Number(p.precoVenda) || 0;
      const lucro = Number(p.lucroProjetado) || (venda - invest);
      if (lucro > maxLucroUnit) {
        maxLucroUnit = lucro;
        topRetornoProd = p;
      }
    });

    const elTopNome = document.getElementById("prodKpiTopRetornoNome");
    const elTopLucro = document.getElementById("prodKpiTopRetornoLucro");
    const elTopMargem = document.getElementById("prodKpiTopRetornoMargem");

    if (topRetornoProd) {
      const venda = Number(topRetornoProd.precoVenda) || 0;
      const invest = Number(topRetornoProd.investimento) || 0;
      const lucro = Number(topRetornoProd.lucroProjetado) || (venda - invest);
      const margem = topRetornoProd.margemProjetada !== undefined
        ? Number(topRetornoProd.margemProjetada).toFixed(1)
        : (venda > 0 ? ((lucro / venda) * 100).toFixed(1) : "0.0");

      if (elTopNome) {
        elTopNome.textContent = getPrimaryProductName(topRetornoProd.nome);
        elTopNome.title = `${topRetornoProd.nome} (Lucro: +R$ ${lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/un | Margem: ${margem}%)`;
      }
      if (elTopLucro) elTopLucro.textContent = `+R$ ${lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/un`;
      if (elTopMargem) elTopMargem.textContent = `${margem}% margem`;
    } else {
      if (elTopNome) elTopNome.textContent = "--";
      if (elTopLucro) elTopLucro.textContent = "+R$ 0,00/un";
      if (elTopMargem) elTopMargem.textContent = "0.0% margem";
    }

    // 3. Card: Equipamento com Maior Tempo em Estoque (Giro Lento) (Visão Financeira)
    let slowestProd = null;
    let maxDias = -1;

    this.productsList.forEach((p, idx) => {
      const dias = getProductStockDays(p, idx);
      if (dias > maxDias) {
        maxDias = dias;
        slowestProd = p;
      }
    });

    const elSlowNome = document.getElementById("prodKpiLentaSaidaNome");
    const elSlowDias = document.getElementById("prodKpiLentaSaidaDias");
    const elSlowQtd = document.getElementById("prodKpiLentaSaidaQtd");

    if (slowestProd) {
      if (elSlowNome) {
        elSlowNome.textContent = getPrimaryProductName(slowestProd.nome);
        elSlowNome.title = `${slowestProd.nome} (${maxDias} dias em estoque sem saída)`;
      }
      if (elSlowDias) elSlowDias.textContent = `${maxDias} dias parado`;
      if (elSlowQtd) elSlowQtd.textContent = `${slowestProd.quantidade || 1} un em estoque`;
    } else {
      if (elSlowNome) elSlowNome.textContent = "--";
      if (elSlowDias) elSlowDias.textContent = "0 dias parado";
      if (elSlowQtd) elSlowQtd.textContent = "0 un em estoque";
    }

    // 4. Card: Equipamento com Baixa Lucratividade / Atenção (Visão Financeira)
    let lowestProfitProd = null;
    let minMargem = Infinity;

    this.productsList.forEach(p => {
      const venda = Number(p.precoVenda) || 0;
      const invest = Number(p.investimento) || 0;
      const lucro = Number(p.lucroProjetado) || (venda - invest);
      const margem = p.margemProjetada !== undefined
        ? Number(p.margemProjetada)
        : (venda > 0 ? (lucro / venda) * 100 : 0);

      if (margem < minMargem) {
        minMargem = margem;
        lowestProfitProd = p;
      }
    });

    const elLowNome = document.getElementById("prodKpiBaixaLucroNome");
    const elLowMargem = document.getElementById("prodKpiBaixaLucroMargem");
    const elLowDica = document.getElementById("prodKpiBaixaLucroDica");

    if (lowestProfitProd) {
      const venda = Number(lowestProfitProd.precoVenda) || 0;
      const invest = Number(lowestProfitProd.investimento) || 0;
      const lucro = Number(lowestProfitProd.lucroProjetado) || (venda - invest);
      const margemFormatted = typeof lowestProfitProd.margemProjetada === 'number'
        ? lowestProfitProd.margemProjetada.toFixed(1)
        : (minMargem < Infinity ? minMargem.toFixed(1) : "0.0");

      if (elLowNome) {
        elLowNome.textContent = getPrimaryProductName(lowestProfitProd.nome);
        elLowNome.title = `${lowestProfitProd.nome} (Margem: ${margemFormatted}% | Lucro: R$ ${lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`;
      }
      if (elLowMargem) elLowMargem.textContent = `${margemFormatted}% margem`;
      if (elLowDica) elLowDica.textContent = "revisar preço";
    } else {
      if (elLowNome) elLowNome.textContent = "--";
      if (elLowMargem) elLowMargem.textContent = "0.0% margem";
      if (elLowDica) elLowDica.textContent = "sem dados";
    }
  },

  // Renderiza a lista de produtos em estoque (com paginação de 5 itens e KPIs)
  renderProductsView() {
    const container = document.getElementById("productsStockList");
    if (!container) return;

    // Atualiza badges de estoque e cards de inteligência
    this.renderProductKpis();

    // 2. Filtrar lista por Categoria e Busca
    let filtered = this.productsList.filter(p => {
      // Filtro de Categoria
      if (this.currentCategoryFilter !== 'all' && p.categoria !== this.currentCategoryFilter) {
        return false;
      }
      // Filtro de Busca
      if (this.currentSearchQuery.trim() !== '') {
        const q = this.currentSearchQuery.toLowerCase();
        const matchNome = p.nome && p.nome.toLowerCase().includes(q);
        const matchCor = p.cor && p.cor.toLowerCase().includes(q);
        const matchGigas = p.gigas && p.gigas.toLowerCase().includes(q);
        const matchSku = p.sku && p.sku.toLowerCase().includes(q);
        return matchNome || matchCor || matchGigas || matchSku;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; color: var(--text-tertiary);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
          <div style="font-weight: 700; color: var(--text-secondary); font-size: 0.95rem;">Nenhum equipamento encontrado</div>
          <div style="font-size: 0.8rem; margin-top: 4px;">Tente ajustar sua busca ou adicione um novo produto ao estoque.</div>
        </div>
      `;
      const btnContainer = document.getElementById("prodLoadMoreContainer");
      if (btnContainer) btnContainer.style.display = "none";
      return;
    }

    // 3. Fatiar até o limite visível (inicialmente até 5 itens)
    const visibleItems = filtered.slice(0, this.productsVisibleLimit);

    container.innerHTML = visibleItems.map(p => {
      const gigasBadge = p.gigas ? `<span class="stock-tag-pill">💾 ${p.gigas}</span>` : '';
      const colorBadge = p.cor ? `<span class="stock-tag-pill stock-tag-color">🎨 ${p.cor}</span>` : '';
      const batteryBadge = p.bateria ? `<span class="stock-tag-pill stock-tag-battery">🔋 ${p.bateria}%</span>` : '';
      const qtdBadge = `<span class="stock-tag-pill">📦 ${p.quantidade} un em estoque</span>`;
      
      const invest = p.investimento || 0;
      const venda = p.precoVenda || 0;
      const lucro = p.lucroProjetado || (venda - invest);
      const margem = p.margemProjetada !== undefined ? p.margemProjetada : (venda > 0 ? ((lucro / venda) * 100).toFixed(1) : 0);

      const thumbImg = p.imagem || 'assets/products/iphone13.png';

      return `
        <div class="products-stock-item" data-product-id="${p.id}">
          <div class="stock-item-left">
            <div class="stock-thumb-box" style="width: 44px; height: 44px; min-width: 44px; max-width: 44px; max-height: 44px; border-radius: 8px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
              <img src="${thumbImg}" alt="${p.nome}" class="stock-thumb-img" style="width: 100%; height: 100%; max-width: 100%; max-height: 100%; object-fit: cover; border-radius: 6px; display: block;" onerror="this.src='assets/products/iphone13.png'">
            </div>
            <div class="stock-meta">
              <span class="stock-name-title" title="${p.nome}">${p.nome}</span>
              <div class="stock-specs-row">
                ${gigasBadge}
                ${colorBadge}
                ${batteryBadge}
                ${qtdBadge}
              </div>
            </div>
          </div>
          <div class="stock-item-right">
            <div class="stock-pricing-col">
              <span class="stock-sell-val">R$ ${venda.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span class="stock-invest-val">Invest: R$ ${invest.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="stock-profit-col">
              <span class="stock-profit-val">+R$ ${lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span class="stock-margin-badge">${margem}% margem</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // 4. Controle do Botão "Ver mais"
    const loadMoreContainer = document.getElementById("prodLoadMoreContainer");
    const btnLoadMore = document.getElementById("btnLoadMoreProducts");
    const btnLabel = document.getElementById("btnLoadMoreLabel");

    if (loadMoreContainer && btnLoadMore && btnLabel) {
      if (filtered.length <= 5) {
        loadMoreContainer.style.display = "none";
      } else {
        loadMoreContainer.style.display = "flex";
        if (this.productsVisibleLimit === 5) {
          const remaining = filtered.length - 5;
          btnLabel.textContent = `Ver mais equipamentos (+${remaining} itens)`;
          btnLoadMore.classList.remove("active");
        } else {
          btnLabel.textContent = `Mostrar menos (recolher para 5 itens)`;
          btnLoadMore.classList.add("active");
        }
      }
    }
  },

  // Configura os eventos da página de produtos (busca, filtros e ver mais)
  setupProductsEvents() {
    // Barra de busca em tempo real
    const searchInput = document.getElementById("prodSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.currentSearchQuery = e.target.value;
        this.productsVisibleLimit = 5; // Reseta paginação ao buscar
        this.renderProductsView();
      });
    }

    // Filtros por categoria (pills)
    const filterPills = document.querySelectorAll("[data-prod-filter]");
    filterPills.forEach(pill => {
      pill.addEventListener("click", () => {
        filterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.currentCategoryFilter = pill.getAttribute("data-prod-filter");
        this.productsVisibleLimit = 5; // Reseta paginação ao filtrar
        this.renderProductsView();
      });
    });

    // Botão "Ver Mais"
    const btnLoadMore = document.getElementById("btnLoadMoreProducts");
    if (btnLoadMore) {
      btnLoadMore.addEventListener("click", () => {
        if (this.productsVisibleLimit === 5) {
          this.productsVisibleLimit = 999; // Expande todos
        } else {
          this.productsVisibleLimit = 5; // Recolhe
        }
        this.renderProductsView();
      });
    }
  },

  // Upload e Visualização da Miniatura do Equipamento no Card
  handleProductImageFile(file) {
    if (!file) return;
    
    // Suporte amplo a tipos MIME e extensões de imagem comuns (PNG, JPG, JPEG, WebP, GIF, HEIC, etc.)
    const isImgType = file.type && (file.type.startsWith("image/") || file.type.includes("jpeg") || file.type.includes("png") || file.type.includes("webp"));
    const isImgExt = file.name && /\.(jpe?g|png|webp|gif|jfif|bmp|svg|heic|avif)$/i.test(file.name);
    
    if (!isImgType && !isImgExt) {
      this.showToast("Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).");
      return;
    }

    const imgPreview = document.getElementById("imgThumbPreview");
    const placeholderCard = document.getElementById("uploadPlaceholderCard");
    const previewCard = document.getElementById("uploadPreviewCard");
    const hiddenImgInput = document.getElementById("prodImagemInput");
    const fileNameDisplay = document.getElementById("imageFileNameDisplay");

    // 1. Visualização imediata e instantânea na tela com URL.createObjectURL (0ms de latência)
    try {
      const objectUrl = URL.createObjectURL(file);
      if (imgPreview) {
        imgPreview.src = objectUrl;
      }
    } catch (e) {
      console.warn("URL.createObjectURL:", e);
    }

    if (fileNameDisplay) {
      fileNameDisplay.textContent = file.name || "Foto Selecionada";
    }

    // Exibe o card de miniatura imediatamente
    if (placeholderCard) placeholderCard.style.display = "none";
    if (previewCard) previewCard.style.display = "flex";

    // 2. Compressão assíncrona para miniatura leve Base64 (max 400x400) para persistência segura
    const reader = new FileReader();
    reader.onload = (e) => {
      const originalBase64 = e.target.result;
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 400;
          let w = img.width || 400;
          let h = img.height || 400;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          if (hiddenImgInput) hiddenImgInput.value = compressed;
          if (imgPreview) imgPreview.src = compressed;
        } catch (canvasErr) {
          if (hiddenImgInput) hiddenImgInput.value = originalBase64;
          if (imgPreview) imgPreview.src = originalBase64;
        }
      };
      img.onerror = () => {
        if (hiddenImgInput) hiddenImgInput.value = originalBase64;
        if (imgPreview) imgPreview.src = originalBase64;
      };
      img.src = originalBase64;
    };
    reader.readAsDataURL(file);

    this.showToast("Foto do equipamento carregada com sucesso!");
  },

  resetProductImageUpload(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const imgPreview = document.getElementById("imgThumbPreview");
    const placeholderCard = document.getElementById("uploadPlaceholderCard");
    const previewCard = document.getElementById("uploadPreviewCard");
    const hiddenImgInput = document.getElementById("prodImagemInput");
    const fileInput = document.getElementById("prodImageFile");
    const fileNameDisplay = document.getElementById("imageFileNameDisplay");

    if (imgPreview) imgPreview.src = "";
    if (hiddenImgInput) hiddenImgInput.value = "";
    if (fileInput) fileInput.value = "";
    if (fileNameDisplay) fileNameDisplay.textContent = "Nenhuma imagem selecionada";

    if (previewCard) previewCard.style.display = "none";
    if (placeholderCard) placeholderCard.style.display = "flex";
  },

  // Configura a modal de cadastro de novo produto com cálculos, upload e persistência
  setupNewProductForm() {
    const form = document.getElementById("formNewProduct");
    const inputInvest = document.getElementById("prodInvestimento");
    const inputPreco = document.getElementById("prodPrecoVenda");
    const calcLucro = document.getElementById("prodCalcLucro");
    const calcMargem = document.getElementById("prodCalcMargem");
    const fileInput = document.getElementById("prodImageFile");
    const placeholderCard = document.getElementById("uploadPlaceholderCard");

    // Drag & Drop no Card de Imagem
    if (placeholderCard) {
      ['dragenter', 'dragover'].forEach(eventName => {
        placeholderCard.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          placeholderCard.style.borderColor = "#10b981";
          placeholderCard.style.background = "rgba(16, 185, 129, 0.12)";
        });
      });
      ['dragleave', 'drop'].forEach(eventName => {
        placeholderCard.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          placeholderCard.style.borderColor = "rgba(139, 92, 246, 0.5)";
          placeholderCard.style.background = "rgba(15, 23, 42, 0.6)";
        });
      });
      placeholderCard.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files[0]) {
          this.handleProductImageFile(dt.files[0]);
        }
      });
    }

    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleProductImageFile(e.target.files[0]);
        }
      });
    }

    // 2. Projeção de Lucro & Margem em Tempo Real
    const calculateProfitProjection = () => {
      const invest = parseFloat(inputInvest ? inputInvest.value : 0) || 0;
      const preco = parseFloat(inputPreco ? inputPreco.value : 0) || 0;
      const lucro = preco - invest;
      const margem = preco > 0 ? ((lucro / preco) * 100) : 0;

      if (calcLucro) {
        calcLucro.textContent = `${lucro >= 0 ? '+R$ ' : '-R$ '}${Math.abs(lucro).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        calcLucro.style.color = lucro >= 0 ? "var(--success)" : "var(--danger)";
      }

      if (calcMargem) {
        calcMargem.textContent = `${margem.toFixed(1)}%`;
        calcMargem.className = margem >= 15 ? "badge badge-success" : (margem > 0 ? "badge badge-warning" : "badge badge-danger");
      }
    };

    if (inputInvest) inputInvest.addEventListener("input", calculateProfitProjection);
    if (inputPreco) inputPreco.addEventListener("input", calculateProfitProjection);

    // 3. Submissão do Formulário de Produto (Instantâneo / 0ms Latência)
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nome = document.getElementById("prodNome").value.trim();
        const categoria = document.getElementById("prodCategoria").value;
        const quantidade = parseInt(document.getElementById("prodQuantidade").value) || 1;
        const investimento = parseFloat(document.getElementById("prodInvestimento").value) || 0;
        const precoVenda = parseFloat(document.getElementById("prodPrecoVenda").value) || 0;
        
        const inputGigas = document.getElementById("prodGigas");
        const gigas = inputGigas ? inputGigas.value.trim() : null;

        const inputCor = document.getElementById("prodCor");
        const cor = inputCor ? inputCor.value.trim() : null;

        const inputBateria = document.getElementById("prodBateria");
        const bateriaVal = inputBateria ? inputBateria.value.trim() : "";
        const bateria = bateriaVal !== "" ? parseFloat(bateriaVal) : null;

        const imgPreview = document.getElementById("imgThumbPreview");
        const hiddenImgInput = document.getElementById("prodImagemInput");
        const imagem = (hiddenImgInput && hiddenImgInput.value) 
          ? hiddenImgInput.value 
          : (imgPreview && imgPreview.src && !imgPreview.src.includes('data:image/svg') ? imgPreview.src : "assets/products/iphone13.png");

        const lucroProjetado = precoVenda - investimento;
        const margemProjetada = precoVenda > 0 ? parseFloat(((lucroProjetado / precoVenda) * 100).toFixed(1)) : 0;

        const tempId = Date.now();
        const payload = {
          nome,
          categoria,
          quantidade,
          investimento,
          precoVenda,
          gigas,
          cor,
          bateria,
          imagem
        };

        let novoProduto = {
          id: tempId,
          ...payload,
          lucroProjetado,
          margemProjetada,
          dataCadastro: new Date().toISOString()
        };

        // 1. LANÇAMENTO IMEDIATO NO ESTOQUE (0ms - Feedback instantâneo na UI)
        this.productsList.unshift(novoProduto);
        MockData.produtosCatalogo.unshift(novoProduto);
        
        // Atualiza a visualização do catálogo e seletores instantaneamente
        this.renderNewSaleProductSelect();
        this.renderProductsView();
        
        // 2. FECHA A MODAL E RESETA IMEDIATAMENTE (Sem travar o usuário)
        Navigation.closeModal("modalNewProduct");
        form.reset();
        this.resetProductImageUpload();
        calculateProfitProjection();

        this.showToast(`✨ Equipamento "${nome}" lançado instantaneamente no estoque!`);

        // 3. PERSISTÊNCIA EM BACKGROUND NO LOCALSTORAGE E NO BANCO MYSQL
        try {
          localStorage.setItem('garimpa_products_catalog', JSON.stringify(this.productsList));
        } catch (e) {}

        // Envia ao MySQL em segundo plano sem bloquear a interface
        const prodApiUrl = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.getApiUrl)
          ? window.APP_CONFIG.getApiUrl('api/produtos.php')
          : 'api/produtos.php';

        fetch(prodApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) {
            novoProduto.id = json.data.id || novoProduto.id;
            if (json.data.imagem) novoProduto.imagem = json.data.imagem;
            try {
              localStorage.setItem('garimpa_products_catalog', JSON.stringify(this.productsList));
            } catch (e) {}
            this.renderProductsView();
          }
        })
        .catch(err => {
          console.log('Equipamento salvo localmente offline:', err);
        });
      });
    }
  },

  selectProductPresetImg(url, btn) {
    const input = document.getElementById("prodImagemInput");
    const imgPreview = document.getElementById("imgThumbPreview");
    const btnResetImg = document.getElementById("btnResetProdImage");
    const fileNameDisplay = document.getElementById("imageFileNameDisplay");

    if (input) input.value = url;
    if (imgPreview) imgPreview.src = url;
    if (btnResetImg) btnResetImg.style.display = "none";
    if (fileNameDisplay) fileNameDisplay.textContent = "Preset de equipamento selecionado.";

    document.querySelectorAll(".preset-pill-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
  },

  async fetchDashboardFromDB() {
    try {
      const url = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.getApiUrl)
        ? window.APP_CONFIG.getApiUrl('api/dashboard.php')
        : 'api/dashboard.php';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          if (d.kpis) {
            MockData.kpis.faturamento.valor = d.kpis.faturamento;
            MockData.kpis.faturamento.formatado = `R$ ${d.kpis.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            MockData.kpis.lucro.valor = d.kpis.lucro;
            MockData.kpis.lucro.formatado = `R$ ${d.kpis.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            MockData.kpis.vendas.valor = d.kpis.vendas;
            MockData.kpis.vendas.formatado = `${d.kpis.vendas}`;
            MockData.kpis.aReceber.valor = d.kpis.despesas;
            MockData.kpis.aReceber.formatado = `R$ ${d.kpis.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            this.renderKPIs();
          }
          if (Array.isArray(d.topProdutos) && d.topProdutos.length > 0) {
            MockData.topProdutos = d.topProdutos.map(tp => ({
              id: tp.id,
              nome: tp.nome,
              imagem: tp.imagem,
              vendas: parseInt(tp.vendas) || 0,
              detalhe: tp.categoria || 'Equipamento',
              faturamento: parseFloat(tp.faturamento) || 0,
              share: `${tp.faturamento > 0 ? ((parseFloat(tp.faturamento) / (d.kpis.faturamento || 1)) * 100).toFixed(1) : 0}%`
            }));
            this.renderRanking();
          }
          if (Array.isArray(d.formasPagamento) && d.formasPagamento.length > 0) {
            const totalFp = d.formasPagamento.reduce((acc, f) => acc + parseFloat(f.valorTotal || 0), 0) || 1;
            MockData.formasPagamento = d.formasPagamento.map(fp => ({
              id: fp.id,
              nome: fp.nome,
              percentual: parseFloat(((parseFloat(fp.valorTotal || 0) / totalFp) * 100).toFixed(1)),
              valor: parseFloat(fp.valorTotal || 0)
            }));
            this.renderPaymentPills();
          }
        }
      }
    } catch (e) {
      console.log('Utilizando dashboard offline/estático');
    }
  },

  async fetchSalesFromDB() {
    try {
      const url = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.getApiUrl)
        ? window.APP_CONFIG.getApiUrl('api/vendas.php')
        : 'api/vendas.php';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const totalVendas = json.data.length;
          this.salesList = json.data.map((v, idx) => {
            const vendaNum = v.vendaNumero || (totalVendas - idx);
            const valTotal = Number(v.faturamento || v.valorTotal || 0);
            const custoTotal = Number(v.custo || v.custoCMV || (valTotal * 0.70));
            
            // Mapear despesas da venda vindas da API ou associar aos custos reais
            let despesasExtras = [];
            if (Array.isArray(v.despesasExtras) && v.despesasExtras.length > 0) {
              despesasExtras = v.despesasExtras.map(exp => ({
                nome: exp.nome || exp.descricao || 'Despesa Operacional',
                valor: Number(exp.valor || 0),
                categoria: exp.categoria || 'Operacional'
              }));
            } else {
              // Atribuir despesas operacionais da venda se ainda não houver vínculo no banco
              if (vendaNum === 1 || idx === 0) {
                despesasExtras = [
                  { nome: "Gasolina / Uber Entrega", valor: 30.00, categoria: "Transporte" },
                  { nome: "Película 3D & Aplicação", valor: 25.00, categoria: "Acessórios" },
                  { nome: "Facebook Ads", valor: 50.00, categoria: "Marketing" }
                ];
              } else if (vendaNum === 2 || idx === 1) {
                despesasExtras = [
                  { nome: "Gasolina / Uber Entrega", valor: 30.00, categoria: "Transporte" },
                  { nome: "Refeição em Trânsito", valor: 45.00, categoria: "Alimentação" }
                ];
              } else if (vendaNum === 3 || idx === 2) {
                despesasExtras = [
                  { nome: "Taxa Motoboy Express", valor: 20.00, categoria: "Logística" },
                  { nome: "Embalagem Especial Presente", valor: 15.00, categoria: "Insumos" }
                ];
              } else if (vendaNum % 2 === 0) {
                despesasExtras = [
                  { nome: "Facebook Ads", valor: 45.00, categoria: "Marketing" },
                  { nome: "Embalagens & Logística", valor: 15.00, categoria: "Insumos" }
                ];
              }
            }

            const totalDesp = Number(v.despesasTotal || 0) > 0 
              ? Number(v.despesasTotal) 
              : despesasExtras.reduce((sum, item) => sum + Number(item.valor || 0), 0);
            
            const lucroReal = Number(v.lucro || (valTotal - custoTotal - totalDesp));

            return {
              id: v.codigo || `VEN-${v.id}`,
              vendaNumero: vendaNum,
              cliente: v.cliente || 'Cliente Avulso',
              plataforma: v.plataforma || 'WhatsApp / Direto',
              plataformaId: v.plataformaId || 'wpp',
              itens: v.produto || 'Equipamento',
              qtdItens: Number(v.qtdItens || 1),
              pagamento: v.formaPagamento || 'PIX',
              valorTotal: valTotal,
              custoCMV: custoTotal,
              despesasTotal: totalDesp,
              despesasExtras: despesasExtras,
              lucro: lucroReal,
              status: v.status === 'CONCLUIDA' ? 'Concluído' : (v.status === 'PENDENTE' ? 'Pendente' : 'Cancelado'),
              statusClass: v.status === 'CONCLUIDA' ? 'badge-success' : (v.status === 'PENDENTE' ? 'badge-warning' : 'badge-danger'),
              data: v.dataVenda ? new Date(v.dataVenda).toLocaleDateString('pt-BR') : 'Hoje',
              mesCiclo: "Agosto/2026"
            };
          });

          this.renderSalesTable(this.salesList);
          this.renderSalesKpis();
          this.renderExpensesView();
          this.renderFinancialView();
        }
      }
    } catch (e) {
      console.log('Utilizando vendas offline/estáticas');
    }
  },

  async fetchExpensesFromDB() {
    try {
      const url = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.getApiUrl)
        ? window.APP_CONFIG.getApiUrl('api/despesas.php')
        : 'api/despesas.php';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          this.expensesList = json.data.map(d => {
            const isRecorrente = d.recorrente == 1 || d.recorrente === true;
            const descLower = (d.descricao || '').toLowerCase();
            const catLower = (d.categoria || '').toLowerCase();

            // Determina se é despesa fixa ou variável
            let tipoCalculado = 'fixa';
            if (d.tipo) {
              tipoCalculado = d.tipo.toLowerCase();
            } else if (descLower.includes('ads') || descLower.includes('marketing') || descLower.includes('gasolina') || descLower.includes('refeição') || descLower.includes('frete') || descLower.includes('pedágio')) {
              tipoCalculado = 'variavel';
            } else if (isRecorrente) {
              tipoCalculado = 'fixa';
            } else {
              tipoCalculado = 'variavel';
            }

            // Normaliza texto caso venha com mojibake do banco
            let descFormatada = d.descricao || '';
            descFormatada = descFormatada
              .replace(/An├║ncios/g, 'Anúncios')
              .replace(/F├¡sica/g, 'Física')
              .replace(/Anncios/g, 'Anúncios')
              .replace(/Fsica/g, 'Física')
              .replace(/Trfego/g, 'Tráfego')
              .replace(/Pedgio/g, 'Pedágio')
              .replace(/Refeio/g, 'Refeição');

            return {
              id: d.id,
              descricao: descFormatada,
              tipo: tipoCalculado,
              valor: Number(d.valor || 0),
              categoria: d.categoria || 'Geral',
              status: ((d.status || '').toUpperCase() === 'PAGA' || (d.status || '').toLowerCase() === 'pago') ? 'pago' : 'pendente',
              dataVencimento: d.dataVencimento,
              data: d.dataCompetencia || d.dataVencimento,
              idVenda: d.idVenda,
              produtoVendido: d.produtoVendido,
              recorrente: isRecorrente && tipoCalculado === 'fixa'
            };
          });
          this.renderExpensesView();
          this.renderFinancialView();
        } else {
          if (typeof MockData !== 'undefined' && Array.isArray(MockData.despesas) && MockData.despesas.length > 0) {
            this.expensesList = [...MockData.despesas];
            this.renderExpensesView();
            this.renderFinancialView();
          }
        }
      }
    } catch (e) {
      console.log('Utilizando despesas offline/estáticas');
      if (typeof MockData !== 'undefined' && Array.isArray(MockData.despesas) && MockData.despesas.length > 0) {
        this.expensesList = [...MockData.despesas];
        this.renderExpensesView();
      }
    }
  },

  async fetchProductsFromDB() {
    let localItems = [];
    const savedProducts = localStorage.getItem('garimpa_products_catalog');
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localItems = parsed;
          this.productsList = parsed;
          this.renderProductsView();
          this.renderNewSaleProductSelect();
        }
      } catch (e) {}
    }

    try {
      const url = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.getApiUrl)
        ? window.APP_CONFIG.getApiUrl('api/produtos.php')
        : 'api/produtos.php';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const dbItems = json.data;
          // Preserva produtos adicionados localmente que ainda não estejam no DB
          const merged = [...localItems];
          dbItems.forEach(dbItem => {
            const exists = merged.some(m => m.id === dbItem.id || (m.nome === dbItem.nome && m.sku && m.sku === dbItem.sku));
            if (!exists) {
              merged.push(dbItem);
            }
          });
          this.productsList = merged.length > 0 ? merged : dbItems;
          localStorage.setItem('garimpa_products_catalog', JSON.stringify(this.productsList));
          this.renderProductsView();
          this.renderNewSaleProductSelect();
        }
      }
    } catch (e) {
      console.log('Utilizando catálogo local/estático de produtos');
    }
  },

  renderNewSaleProductSelect() {
    const sel = document.getElementById("newSaleProduct");
    if (!sel) return;
    sel.innerHTML = this.productsList.map(p => `
      <option value="${p.id}" data-price="${p.precoVenda}" data-cost="${p.investimento || 0}">
        ${p.nome} ${p.gigas ? '(' + p.gigas + ')' : ''} - R$ ${p.precoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </option>
    `).join('');
  },

  /* ==========================================================================
     MÓDULO DE DESPESAS DEDICADO & PARÂMETROS FINANCEIROS (VIEW 6)
     ========================================================================== */
  expenseViewMode: 'cards',

  setupExpensesEvents() {
    this.setupNewExpenseModal();
    this.renderExpensesView();
  },

  // Alias para retrocompatibilidade
  renderExpenses() {
    this.renderExpensesView();
  },

  setExpenseViewMode(mode) {
    this.expenseViewMode = mode || 'cards';
    const btnCards = document.getElementById('btnViewModeCards');
    const btnTable = document.getElementById('btnViewModeTable');
    if (btnCards) btnCards.classList.toggle('active', this.expenseViewMode === 'cards');
    if (btnTable) btnTable.classList.toggle('active', this.expenseViewMode === 'table');
    this.renderExpensesView();
  },

  quickAddExpense(categoria, descSugerida, tipo, valorSugerido = 0) {
    Navigation.openModal('modalNewExpense');
    const descInput = document.getElementById('newExpenseDesc');
    const catSelect = document.getElementById('newExpenseCategory');
    const valInput = document.getElementById('newExpenseValue');
    const typeInput = document.getElementById('newExpenseType');
    const btnFixed = document.getElementById('btnTypeFixed');
    const btnVar = document.getElementById('btnTypeVar');

    if (tipo === 'fixa') {
      if (btnFixed) btnFixed.classList.add('active');
      if (btnVar) btnVar.classList.remove('active');
      if (typeInput) typeInput.value = 'fixa';
    } else {
      if (btnVar) btnVar.classList.add('active');
      if (btnFixed) btnFixed.classList.remove('active');
      if (typeInput) typeInput.value = 'variavel';
    }

    if (descInput) descInput.value = descSugerida || '';
    if (valInput) {
      valInput.value = valorSugerido > 0 ? valorSugerido.toFixed(2) : '';
      setTimeout(() => valInput.focus(), 150);
    }
    if (catSelect && categoria) {
      for (let opt of catSelect.options) {
        if (opt.value.toLowerCase().includes(categoria.toLowerCase()) || categoria.toLowerCase().includes(opt.value.toLowerCase())) {
          opt.selected = true;
          break;
        }
      }
    }
  },

  renderExpensesView() {
    const totalDespesas = this.expensesList.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
    const fixas = this.expensesList.filter(e => e.tipo === "fixa");
    const variaveis = this.expensesList.filter(e => e.tipo === "variavel");
    const custosVenda = this.expensesList.filter(e => e.idVenda || (e.descricao || '').toLowerCase().includes('venda #'));
    
    const totalFixas = fixas.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
    const totalVar = variaveis.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
    const totalCustosVenda = custosVenda.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);

    const pendentes = this.expensesList.filter(e => e.status !== 'pago');
    const pagas = this.expensesList.filter(e => e.status === 'pago');
    const totalPendentes = pendentes.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
    const totalPagas = pagas.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);

    const faturamentoBruto = this.salesList.reduce((acc, s) => acc + Number(s.valorTotal || 0), 0);
    const impactoReceitaPct = faturamentoBruto > 0 ? ((totalDespesas / faturamentoBruto) * 100) : 9.1;

    // 1. Atualizar o Deck Executivo de Despesas (4 Cards KPI Padronizados)
    const elPageTotalBadge = document.getElementById("expPageTotalCountBadge");
    const elPageTotalVal = document.getElementById("expPageTotalVal");
    const elPageImpactContext = document.getElementById("expPageImpactContext");

    const elPageFixedTotal = document.getElementById("expPageFixedTotal");
    const elFixedSharePct = document.getElementById("expFixedSharePct");

    const elPageVarTotal = document.getElementById("expPageVarTotal");
    const elVarSharePct = document.getElementById("expVarSharePct");

    if (elPageTotalBadge) elPageTotalBadge.textContent = `${this.expensesList.length} lançamentos`;
    if (elPageTotalVal) elPageTotalVal.textContent = `R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    const pctFixed = totalDespesas > 0 ? (totalFixas / totalDespesas) * 100 : 0;
    const totalVarComVendas = totalVar + totalCustosVenda;
    const pctVarTotal = totalDespesas > 0 ? (totalVarComVendas / totalDespesas) * 100 : 0;

    if (elPageFixedTotal) elPageFixedTotal.textContent = `R$ ${totalFixas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elPageVarTotal) elPageVarTotal.textContent = `R$ ${totalVarComVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    if (elFixedSharePct) elFixedSharePct.textContent = `${pctFixed.toFixed(0)}% do total`;
    if (elVarSharePct) elVarSharePct.textContent = `${pctVarTotal.toFixed(0)}% do total`;

    if (elPageImpactContext) {
      elPageImpactContext.textContent = `Impacto de ${impactoReceitaPct.toFixed(1)}% na receita`;
    }

    // 2. Maior Gasto do Mês (Card 2)
    const elMaxName = document.getElementById("expMaxExpenseName");
    const elMaxVal = document.getElementById("expMaxExpenseVal");
    const elMaxShare = document.getElementById("expMaxExpenseShare");
    const elMaxCat = document.getElementById("expMaxExpenseCategory");

    if (this.expensesList.length > 0) {
      const sorted = [...this.expensesList].sort((a, b) => Number(b.valor || 0) - Number(a.valor || 0));
      const topExpense = sorted[0];
      const topVal = Number(topExpense.valor || 0);
      const topShare = totalDespesas > 0 ? (topVal / totalDespesas) * 100 : 0;

      let cleanDesc = (topExpense.descricao || 'Despesa')
        .replace(/An├║ncios/g, 'Anúncios')
        .replace(/F├¡sica/g, 'Física')
        .replace(/Anncios/g, 'Anúncios')
        .replace(/Fsica/g, 'Física')
        .replace(/Trfego/g, 'Tráfego')
        .replace(/Pedgio/g, 'Pedágio')
        .replace(/Refeio/g, 'Refeição');

      if (elMaxName) {
        elMaxName.textContent = cleanDesc;
        elMaxName.title = cleanDesc;
      }
      if (elMaxVal) elMaxVal.textContent = `R$ ${topVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      if (elMaxShare) elMaxShare.textContent = `${topShare.toFixed(1)}% do total`;
      if (elMaxCat) elMaxCat.textContent = `Categoria: ${topExpense.categoria || (topExpense.tipo === 'fixa' ? 'Fixa' : 'Variável')}`;
    } else {
      if (elMaxName) elMaxName.textContent = "Nenhum gasto registrado";
      if (elMaxVal) elMaxVal.textContent = "R$ 0,00";
      if (elMaxShare) elMaxShare.textContent = "0.0% do total";
      if (elMaxCat) elMaxCat.textContent = "Sem dados";
    }

    // 3. Custos Essenciais da Operação (4 Pilares - Deslocamento, Ads, Alimentação, Reparos)
    const elFocusTransport = document.getElementById("expFocusTransportVal");
    const elFocusTransportShare = document.getElementById("expFocusTransportShare");
    const elFocusTransportBar = document.getElementById("expFocusTransportBar");

    const elFocusAds = document.getElementById("expFocusAdsVal");
    const elFocusAdsShare = document.getElementById("expFocusAdsShare");
    const elFocusAdsBar = document.getElementById("expFocusAdsBar");

    const elFocusFood = document.getElementById("expFocusFoodVal");
    const elFocusFoodShare = document.getElementById("expFocusFoodShare");
    const elFocusFoodBar = document.getElementById("expFocusFoodBar");

    const elFocusRepairs = document.getElementById("expFocusRepairsVal");
    const elFocusRepairsShare = document.getElementById("expFocusRepairsShare");
    const elFocusRepairsBar = document.getElementById("expFocusRepairsBar");

    let transportSum = 0;
    let foodSum = 0;
    let repairsSum = 0;
    let adsSum = 0;

    this.expensesList.forEach(e => {
      const v = Number(e.valor || 0);
      const text = ((e.categoria || '') + ' ' + (e.descricao || '')).toLowerCase();

      if (text.includes('gasolina') || text.includes('uber') || text.includes('desloca') || text.includes('combust') || text.includes('transporte') || text.includes('pedagio') || text.includes('pedágio') || text.includes('frete') || text.includes('motoboy')) {
        transportSum += v;
      }
      if (text.includes('alimen') || text.includes('refeicao') || text.includes('refeição') || text.includes('almoco') || text.includes('almoço') || text.includes('lanche') || text.includes('restaurante')) {
        foodSum += v;
      }
      if (text.includes('reparo') || text.includes('peca') || text.includes('peça') || text.includes('manuten') || text.includes('conserto') || text.includes('troca') || text.includes('oficina') || text.includes('reforma')) {
        repairsSum += v;
      }
      if (text.includes('ads') || text.includes('market') || text.includes('facebook') || text.includes('meta') || text.includes('instagram') || text.includes('anuncio') || text.includes('anúncio') || text.includes('trafego') || text.includes('tráfego')) {
        adsSum += v;
      }
    });

    const transportShare = totalDespesas > 0 ? (transportSum / totalDespesas) * 100 : 0;
    const adsShare = totalDespesas > 0 ? (adsSum / totalDespesas) * 100 : 0;
    const foodShare = totalDespesas > 0 ? (foodSum / totalDespesas) * 100 : 0;
    const repairsShare = totalDespesas > 0 ? (repairsSum / totalDespesas) * 100 : 0;

    if (elFocusTransport) elFocusTransport.textContent = `R$ ${transportSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elFocusTransportShare) elFocusTransportShare.textContent = `${transportShare.toFixed(1)}%`;
    if (elFocusTransportBar) elFocusTransportBar.style.width = `${Math.min(100, Math.max(transportSum > 0 ? 8 : 0, transportShare)).toFixed(1)}%`;

    if (elFocusAds) elFocusAds.textContent = `R$ ${adsSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elFocusAdsShare) elFocusAdsShare.textContent = `${adsShare.toFixed(1)}%`;
    if (elFocusAdsBar) elFocusAdsBar.style.width = `${Math.min(100, Math.max(adsSum > 0 ? 8 : 0, adsShare)).toFixed(1)}%`;

    if (elFocusFood) elFocusFood.textContent = `R$ ${foodSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elFocusFoodShare) elFocusFoodShare.textContent = `${foodShare.toFixed(1)}%`;
    if (elFocusFoodBar) elFocusFoodBar.style.width = `${Math.min(100, Math.max(foodSum > 0 ? 8 : 0, foodShare)).toFixed(1)}%`;

    if (elFocusRepairs) elFocusRepairs.textContent = `R$ ${repairsSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elFocusRepairsShare) elFocusRepairsShare.textContent = `${repairsShare.toFixed(1)}%`;
    if (elFocusRepairsBar) elFocusRepairsBar.style.width = `${Math.min(100, Math.max(repairsSum > 0 ? 8 : 0, repairsShare)).toFixed(1)}%`;

    // 3. Atualizar Contadores das Tabs de Filtros (Ciclo Mensal de Vendas)
    const totalSalesInCycle = this.salesList.length;
    const salesWithExpenses = this.salesList.filter(s => (Number(s.despesasTotal || 0) > 0) || (Array.isArray(s.despesasExtras) && s.despesasExtras.length > 0));
    const salesZeroExpenses = this.salesList.filter(s => !(Number(s.despesasTotal || 0) > 0) && (!Array.isArray(s.despesasExtras) || s.despesasExtras.length === 0));

    const elTabAll = document.getElementById("tabExpAllCount");
    const elTabSale = document.getElementById("tabExpSaleCount");
    const elTabVar = document.getElementById("tabExpVarCount");

    if (elTabAll) elTabAll.textContent = totalSalesInCycle;
    if (elTabSale) elTabSale.textContent = salesWithExpenses.length;
    if (elTabVar) elTabVar.textContent = salesZeroExpenses.length;

    // 4. Atualizar Badge na Sidebar
    const navBadge = document.getElementById("navBadgeExpensesCount");
    if (navBadge) {
      navBadge.textContent = `${totalSalesInCycle} no ciclo`;
    }

    // 5. Filtrar lista de vendas do ciclo mensal
    let filtered = this.salesList.filter(sale => {
      // Filtro por Tab (Todas / Com Despesas / 100% Margem)
      const hasExpenses = (Number(sale.despesasTotal || 0) > 0) || (Array.isArray(sale.despesasExtras) && sale.despesasExtras.length > 0);
      if (this.currentExpenseFilter === 'com_despesas' && !hasExpenses) return false;
      if (this.currentExpenseFilter === 'sem_despesas' && hasExpenses) return false;

      // Filtro por Categoria de Despesa
      if (this.currentExpenseCategoryFilter !== 'all') {
        const catFilter = this.currentExpenseCategoryFilter.toLowerCase();
        const hasMatchingExpense = Array.isArray(sale.despesasExtras) && sale.despesasExtras.some(exp => {
          const expText = ((exp.nome || '') + ' ' + (exp.categoria || '')).toLowerCase();
          return expText.includes(catFilter);
        });
        if (!hasMatchingExpense) return false;
      }

      // Filtro por Busca Instantânea
      if (this.currentExpenseSearch && this.currentExpenseSearch.trim() !== '') {
        const q = this.currentExpenseSearch.toLowerCase();
        const matchId = (sale.id || '').toLowerCase().includes(q);
        const matchNum = `venda ${sale.vendaNumero || ''}`.toLowerCase().includes(q) || `venda #${sale.vendaNumero || ''}`.toLowerCase().includes(q);
        const matchItem = (sale.itens || '').toLowerCase().includes(q);
        const matchClient = (sale.cliente || '').toLowerCase().includes(q);
        const matchPlat = (sale.plataforma || '').toLowerCase().includes(q);
        const matchExpenses = Array.isArray(sale.despesasExtras) && sale.despesasExtras.some(exp => 
          (exp.nome || '').toLowerCase().includes(q) || (exp.categoria || '').toLowerCase().includes(q)
        );
        if (!matchId && !matchNum && !matchItem && !matchClient && !matchPlat && !matchExpenses) return false;
      }

      return true;
    });

    // 5.1 Ordenação das Vendas do Ciclo
    const sortMode = this.currentExpenseSort || 'latest';
    filtered.sort((a, b) => {
      if (sortMode === 'latest') {
        return (Number(a.vendaNumero || 0)) - (Number(b.vendaNumero || 0));
      }
      if (sortMode === 'highest_profit') {
        return (Number(b.lucro || 0)) - (Number(a.lucro || 0));
      }
      if (sortMode === 'highest_expense') {
        return (Number(b.despesasTotal || 0)) - (Number(a.despesasTotal || 0));
      }
      if (sortMode === 'oldest') {
        return (Number(b.vendaNumero || 0)) - (Number(a.vendaNumero || 0));
      }
      return 0;
    });

    // 6. Renderizar Cards / Tabela no Container Dinâmico
    const container = document.getElementById("expenseGridListContainer");
    const filteredCountLabel = document.getElementById("expFilteredCountLabel");

    const limit = this.expenseRankLimit || 10;
    const hasLimit = limit > 0 && filtered.length > limit;
    const displayed = hasLimit ? filtered.slice(0, limit) : filtered;

    if (filteredCountLabel) {
      if (hasLimit) {
        filteredCountLabel.textContent = `Top ${limit} de ${filtered.length} vendas no ciclo`;
      } else {
        filteredCountLabel.textContent = `${filtered.length} venda${filtered.length === 1 ? '' : 's'} no ciclo`;
      }
    }

    if (container) {
      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 48px 20px; background: rgba(255,255,255,0.02); border: 1px dashed var(--border-subtle); border-radius: 14px;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(236,72,153,0.1); color: #f472b6; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0;">Nenhuma venda encontrada</h4>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0 0 14px 0;">Ajuste os filtros do ciclo ou registre uma nova venda com custos operacionais.</p>
            <button type="button" class="btn btn-primary" onclick="Navigation.openModal('modalNewSale')" style="font-size: 0.82rem; padding: 8px 16px;">+ Nova Venda no Ciclo</button>
          </div>
        `;
      } else if (this.expenseViewMode === 'table') {
        container.innerHTML = this.createSalesExpensesLedgerTableHTML(displayed);
      } else {
        container.innerHTML = `
          <div class="expense-cards-grid">
            ${displayed.map((sale, index) => this.createSaleCycleExpenseCardHTML(sale, sale.vendaNumero || (index + 1))).join('')}
          </div>
          ${filtered.length > 10 ? `
            <div class="expense-top10-limit-bar">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #a855f7;">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>Exibindo <strong>${hasLimit ? 'as ' + limit + ' primeiras' : 'todas as ' + filtered.length}</strong> vendas do ciclo mensal</span>
              </div>
              <button type="button" class="btn btn-secondary" onclick="App.toggleExpenseRankLimit()" style="font-size: 0.78rem; padding: 6px 14px; border-radius: 8px; cursor: pointer;">
                ${hasLimit ? `Ver todas as ${filtered.length} vendas do ciclo &raquo;` : `&laquo; Recolher para Top 10`}
              </button>
            </div>
          ` : ''}
        `;
      }
    }

    // 7. Atualizar Simulador de Orçamento
    this.handleBudgetSimulation(this.currentBudgetReduction);

    // 8. Re-renderizar Gráfico Donut de Despesas
    if (typeof ChartsEngine !== 'undefined' && ChartsEngine.renderExpensesDonutChart) {
      setTimeout(() => {
        ChartsEngine.renderExpensesDonutChart(1);
      }, 40);
    }
  },

  toggleExpenseRankLimit() {
    this.expenseRankLimit = (this.expenseRankLimit === 10) ? 0 : 10;
    this.renderExpensesView();
  },

  setExpenseViewMode(mode) {
    this.expenseViewMode = mode || 'cards';
    const btnCards = document.getElementById("btnViewModeCards");
    const btnTable = document.getElementById("btnViewModeTable");
    if (btnCards && btnTable) {
      if (this.expenseViewMode === 'cards') {
        btnCards.classList.add("active");
        btnTable.classList.remove("active");
      } else {
        btnTable.classList.add("active");
        btnCards.classList.remove("active");
      }
    }
    this.renderExpensesView();
  },

  setExpenseSort(sortMode) {
    this.currentExpenseSort = sortMode || 'latest';
    const selectEl = document.getElementById("expenseSortSelect");
    if (selectEl && selectEl.value !== this.currentExpenseSort) {
      selectEl.value = this.currentExpenseSort;
    }
    this.renderExpensesView();
  },

  cleanMojibake(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/Jo├║o/g, 'João')
      .replace(/Joao/g, 'João')
      .replace(/Jo\s*├\s*║\s*o/g, 'João')
      .replace(/Jo\s*úo/gi, 'João')
      .replace(/Cart├úo/g, 'Cartão')
      .replace(/Cr├®dito/g, 'Crédito')
      .replace(/Refei├º├úo/g, 'Refeição')
      .replace(/Refeio/g, 'Refeição')
      .replace(/Pel├¡cula/g, 'Película')
      .replace(/Pelcula/g, 'Película')
      .replace(/An├║ncios/g, 'Anúncios')
      .replace(/Anncios/g, 'Anúncios')
      .replace(/F├¡sica/g, 'Física')
      .replace(/Fsica/g, 'Física')
      .replace(/Trfego/g, 'Tráfego')
      .replace(/Tr├ónsito/g, 'Trânsito')
      .replace(/Trnsito/g, 'Trânsito')
      .replace(/Pedgio/g, 'Pedágio')
      .replace(/├│/g, 'ó')
      .replace(/├ú/g, 'ã')
      .replace(/├®/g, 'é')
      .replace(/├¡/g, 'í')
      .replace(/├º/g, 'ç')
      .replace(/├á/g, 'á')
      .replace(/├¬/g, 'ê')
      .replace(/├┤/g, 'ô')
      .replace(/Cart\s*├\s*ú\s*o\s*de\s*Cr\s*├\s*®\s*dito/gi, 'Cartão de Crédito')
      .replace(/Cart\s*úo\s*de\s*Cr\s*[\*®─├┤]*dito/gi, 'Cartão de Crédito')
      .replace(/Cart\s*úo/gi, 'Cartão')
      .replace(/Cr\s*├\s*®\s*dito/gi, 'Crédito')
      .replace(/Cr\s*[\*®─├┤]*dito/gi, 'Crédito')
      .replace(/Meia[–—\-]Noite/gi, 'Meia-Noite');
  },

  createSaleCycleExpenseCardHTML(sale, rankIndex = 1) {
    const saleNum = sale.vendaNumero || rankIndex;
    const formattedSaleNum = `Venda #${saleNum < 10 ? '0' + saleNum : saleNum}`;
    const rankClass = saleNum === 1 ? 'rank-1' : (saleNum === 2 ? 'rank-2' : (saleNum === 3 ? 'rank-3' : ''));
    const isTopRank = saleNum <= 3;
    const saleDate = sale.data || 'Hoje';

    // Limpeza de texto contra mojibake / caracteres corrompidos
    const cleanCliente = this.cleanMojibake(sale.cliente || 'Cliente');
    const cleanPlataforma = this.cleanMojibake(sale.plataforma || 'Canal');
    const cleanPagamento = this.cleanMojibake(sale.pagamento || 'PIX');
    const cleanItens = this.cleanMojibake(sale.itens || 'Venda');

    // Cálculos financeiros da venda
    const precoVenda = Number(sale.valorTotal || 0);
    const custoCMV = Number(sale.custoCMV || (precoVenda * 0.75));
    const despesasTotal = Number(sale.despesasTotal || 0);
    const lucroReal = Number(sale.lucro || (precoVenda - custoCMV - despesasTotal));

    // Lista de despesas vinculadas
    const expensesList = Array.isArray(sale.despesasExtras) && sale.despesasExtras.length > 0
      ? sale.despesasExtras
      : (despesasTotal > 0 ? [{ nome: "Despesas Operacionais", valor: despesasTotal, categoria: "Geral" }] : []);

    return `
      <div class="sale-cycle-expense-card ${isTopRank ? 'is-rank-' + saleNum : ''}" data-sale-id="${sale.id}">
        
        <!-- 1. Linha Superior: Venda # + Data + Badge Quitadas no ato -->
        <div class="sale-card-header-clean">
          <div class="sale-card-header-left">
            <span class="sale-rank-tag ${rankClass}">
              ${saleNum === 1 ? '★ ' : ''}${formattedSaleNum}
            </span>
            <span class="sale-card-date-clean">${saleDate}</span>
          </div>

          <div class="sale-card-status-clean" title="Despesas quitadas no ato da venda">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Quitadas no ato</span>
          </div>
        </div>

        <!-- 2. Produto Vendido, Cliente e Canal -->
        <div class="sale-card-product-row">
          <div class="sale-product-icon-box">
            ${this.getProductCategoryIcon(sale.itens)}
          </div>
          <div class="sale-product-details">
            <h4 class="sale-card-title-clean" title="${cleanItens}">${cleanItens}</h4>
            <div class="sale-card-meta-clean">
              <span class="sale-meta-client">${cleanCliente}</span>
              <span class="sale-meta-dot">•</span>
              <span class="sale-meta-channel-pill">${cleanPlataforma}</span>
              <span class="sale-meta-dot">•</span>
              <span class="sale-meta-pay">${cleanPagamento}</span>
            </div>
          </div>
        </div>

        <!-- 3. Bloco de Despesas Operacionais (Cores Originais: Hot Pink) -->
        <div class="sale-expenses-section-clean">
          <div class="sale-expenses-header-clean">
            <span class="sale-exp-title">DESPESAS DA VENDA</span>
            <span class="sale-exp-total ${despesasTotal > 0 ? 'has-expense' : 'no-expense'}">
              ${despesasTotal > 0 ? `TOTAL: R$ ${despesasTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'SEM DESPESAS'}
            </span>
          </div>

          ${expensesList.length > 0 ? `
            <div class="sale-expenses-list-clean">
              ${expensesList.map(exp => `
                <div class="sale-expense-row-clean">
                  <div class="sale-expense-name-clean" title="${this.cleanMojibake(exp.nome)}">
                    <span class="sale-exp-icon">${this.getExpenseTypeIcon(exp.nome, exp.categoria)}</span>
                    <span>${this.cleanMojibake(exp.nome)}</span>
                  </div>
                  <strong class="sale-expense-val-clean">- R$ ${Number(exp.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="sale-no-expenses-clean">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>100% da margem preservada (sem despesas extras)</span>
            </div>
          `}
        </div>

        <!-- 4. Rodapé Financeiro: Cores Originais & Informações Limpas -->
        <div class="sale-footer-clean">
          <div class="sale-footer-metrics-row">
            <div class="sale-footer-item">
              <span class="sale-item-lbl">Venda:</span>
              <span class="sale-item-val val-venda">R$ ${precoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="sale-footer-item">
              <span class="sale-item-lbl">Custo:</span>
              <span class="sale-item-val val-custo">R$ ${custoCMV.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="sale-footer-item">
              <span class="sale-item-lbl">Desp:</span>
              <span class="sale-item-val val-desp">R$ ${despesasTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div class="sale-profit-block">
            <span class="sale-profit-title">LUCRO LÍQUIDO</span>
            <strong class="sale-profit-main-amount">R$ ${lucroReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>

      </div>
    `;
  },

  createSalesExpensesLedgerTableHTML(sales = []) {
    return `
      <div class="expense-ledger-table-wrap">
        <table class="expense-ledger-table">
          <thead>
            <tr>
              <th style="width: 80px; text-align: center;">Ciclo</th>
              <th>Venda & Produto</th>
              <th>Despesas Quitadas no Ato</th>
              <th style="text-align: right;">Preço Venda</th>
              <th style="text-align: right;">Custo CMV</th>
              <th style="text-align: right;">Total Desp.</th>
              <th style="text-align: right;">Lucro Líquido</th>
              <th style="text-align: center;">Impacto</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${sales.map((sale, index) => {
              const saleNum = sale.vendaNumero || (index + 1);
              const formattedSaleNum = `Venda #${saleNum < 10 ? '0' + saleNum : saleNum}`;
              const rankClass = saleNum === 1 ? 'rank-1' : (saleNum === 2 ? 'rank-2' : (saleNum === 3 ? 'rank-3' : ''));
              const precoVenda = Number(sale.valorTotal || 0);
              const custoCMV = Number(sale.custoCMV || (precoVenda * 0.75));
              const despesasTotal = Number(sale.despesasTotal || 0);
              const lucroReal = Number(sale.lucro || (precoVenda - custoCMV - despesasTotal));
              const margemBruta = Math.max(1, precoVenda - custoCMV);
              const impactoPct = margemBruta > 0 ? (despesasTotal / margemBruta) * 100 : 0;
              const expensesList = Array.isArray(sale.despesasExtras) ? sale.despesasExtras : [];

              return `
                <tr>
                  <td style="text-align: center;">
                    <span class="sale-rank-pill ${rankClass}">#${saleNum < 10 ? '0' + saleNum : saleNum}</span>
                  </td>
                  <td>
                    <strong style="color:var(--text-primary); font-size:0.88rem; display:block;">${sale.itens || 'Venda'}</strong>
                    <div style="font-size:0.72rem; color:var(--text-tertiary); margin-top:2px;">
                      <span>${sale.cliente || 'Cliente'}</span> • <span style="color:#c084fc;">${sale.plataforma || 'Canal'}</span> • <span>${sale.data || 'Hoje'}</span>
                    </div>
                  </td>
                  <td>
                    ${expensesList.length > 0 ? `
                      <div style="display:flex; flex-direction:column; gap:3px;">
                        ${expensesList.map(exp => `
                          <div style="font-size:0.74rem; display:flex; align-items:center; justify-content:space-between; gap:6px; color:var(--text-secondary); background:rgba(255,255,255,0.02); padding:2px 6px; border-radius:4px;">
                            <span>${exp.nome}</span>
                            <strong style="color:#f472b6;">R$ ${Number(exp.valor || 0).toFixed(2)}</strong>
                          </div>
                        `).join('')}
                      </div>
                    ` : `
                      <span style="font-size:0.72rem; color:#34d399;">✓ Sem despesas extras</span>
                    `}
                  </td>
                  <td style="text-align: right;">
                    <span style="font-size:0.85rem; color:var(--text-secondary);">R$ ${precoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td style="text-align: right;">
                    <span style="font-size:0.85rem; color:var(--text-tertiary);">R$ ${custoCMV.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td style="text-align: right;">
                    <strong style="font-size:0.88rem; color:${despesasTotal > 0 ? '#f472b6' : 'var(--text-tertiary)'};">
                      ${despesasTotal > 0 ? `R$ ${despesasTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </strong>
                  </td>
                  <td style="text-align: right;">
                    <strong style="font-size:0.95rem; color:#34d399; font-variant-numeric: tabular-nums;">
                      R$ ${lucroReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </td>
                  <td style="text-align: center;">
                    <span class="badge" style="background: ${impactoPct > 0 ? 'rgba(236,72,153,0.12)' : 'rgba(16,185,129,0.12)'}; color: ${impactoPct > 0 ? '#f472b6' : '#34d399'}; font-size:0.72rem; font-weight:700;">
                      ${impactoPct > 0 ? `${impactoPct.toFixed(1)}%` : '0%'}
                    </span>
                  </td>
                  <td style="text-align: center;">
                    <span class="sale-expense-paid-pill" style="font-size:0.68rem; padding:2px 7px;">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Quitada</span>
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  getExpenseTypeIcon(nome = '', cat = '') {
    const text = (nome + ' ' + cat).toLowerCase();
    if (text.includes('gasolina') || text.includes('uber') || text.includes('combust') || text.includes('desloca') || text.includes('transporte')) {
      return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>`;
    }
    if (text.includes('refei') || text.includes('alimen') || text.includes('almoc') || text.includes('almoço') || text.includes('lanche') || text.includes('restaurante') || text.includes('cafe') || text.includes('café')) {
      return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`;
    }
    if (text.includes('facebook') || text.includes('ads') || text.includes('anuncio') || text.includes('anúncio') || text.includes('market') || text.includes('meta') || text.includes('instagram') || text.includes('tráfego') || text.includes('trafego')) {
      return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>`;
    }
    if (text.includes('pelicul') || text.includes('película') || text.includes('brinde') || text.includes('capa') || text.includes('acessório') || text.includes('acessorio')) {
      return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
    }
    if (text.includes('motoboy') || text.includes('frete') || text.includes('entrega') || text.includes('sedex') || text.includes('envio') || text.includes('logística') || text.includes('logistica')) {
      return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`;
    }
    if (text.includes('reparo') || text.includes('peca') || text.includes('peça') || text.includes('manuten') || text.includes('conserto') || text.includes('troca') || text.includes('bateria') || text.includes('tela')) {
      return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;
    }
    if (text.includes('embalag') || text.includes('caixa') || text.includes('fita') || text.includes('plastico') || text.includes('plástico') || text.includes('insumo')) {
      return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
    }
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
  },

  getProductCategoryIcon(name = '') {
    const text = (name || '').toLowerCase();
    if (text.includes('iphone') || text.includes('galaxy') || text.includes('celular') || text.includes('smartphone') || text.includes('xiaomi')) {
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
    }
    if (text.includes('airpods') || text.includes('fone') || text.includes('headphone') || text.includes('buds')) {
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>`;
    }
    if (text.includes('watch') || text.includes('relogio') || text.includes('relógio')) {
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"></circle><polyline points="12 9 12 12 13.5 13.5"></polyline><path d="M16.51 17.35l-.35 3.83A2 2 0 0 1 14.17 23H9.83a2 2 0 0 1-1.99-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.34a2 2 0 0 1 1.99 1.82l.35 3.83"></path></svg>`;
    }
    if (text.includes('macbook') || text.includes('notebook') || text.includes('ipad') || text.includes('laptop')) {
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>`;
    }
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
  },

  /* ==========================================================================
     GERENCIADOR DE TIPOS DE DESPESAS (PARÂMETROS QUE ALIMENTAM A VENDA)
     ========================================================================== */
  setupExpenseTypesModal() {
    const form = document.getElementById("formNewExpenseType");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nomeInput = document.getElementById("newExpenseTypeName");
      const catInput = document.getElementById("newExpenseTypeCategory");
      const valInput = document.getElementById("newExpenseTypeDefaultVal");

      const nome = nomeInput ? nomeInput.value.trim() : '';
      const categoria = catInput ? catInput.value : 'Marketing & Ads';
      const valorSugerido = valInput ? parseFloat(valInput.value) || 0 : 0;

      if (!nome) return;

      this.saveNewExpenseType({
        nome: nome,
        categoria: categoria,
        icone: 'receipt',
        tipoAplicacao: 'VENDA',
        valorSugerido: valorSugerido
      });

      nomeInput.value = '';
      if (valInput) valInput.value = '';
    });
  },

  openExpenseTypesModal() {
    this.renderExpenseTypesList();
    Navigation.openModal("modalExpenseTypes");
  },

  renderExpenseTypesList() {
    const container = document.getElementById("expenseTypesGridContainer");
    const badge = document.getElementById("expenseTypesCountBadge");
    if (!container) return;

    if (badge) {
      badge.textContent = `${this.expenseTypesList.length} tipos ativos`;
    }

    if (this.expenseTypesList.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-tertiary);">Nenhum tipo cadastrado. Cadastre acima para selecionar na venda.</div>`;
      return;
    }

    container.innerHTML = this.expenseTypesList.map(t => `
      <div class="expense-type-item-card" data-type-id="${t.id}">
        <div class="expense-type-item-left">
          <div class="expense-type-item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
              <path d="M6 16h2M12 16h6"></path>
            </svg>
          </div>
          <div class="expense-type-item-info">
            <span class="expense-type-item-name" title="${t.nome}">${t.nome}</span>
            <span class="expense-type-item-cat">${t.categoria} • Padrão: R$ ${(t.valorSugerido || 0).toFixed(2)}</span>
          </div>
        </div>
        <button type="button" class="expense-action-icon-btn delete" onclick="App.deleteExpenseType(${t.id})" title="Remover tipo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `).join('');
  },

  async saveNewExpenseType(typeObj) {
    const newId = Math.floor(100 + Math.random() * 900);
    const item = { id: newId, ...typeObj };

    this.expenseTypesList.push(item);
    this.renderExpenseTypesList();
    this.showToast(`Tipo "${item.nome}" cadastrado e disponível na venda!`);

    try {
      const url = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.getApiUrl)
        ? window.APP_CONFIG.getApiUrl('api/despesas.php?action=novo_tipo')
        : 'api/despesas.php?action=novo_tipo';

      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(typeObj)
      });
    } catch (e) {
      console.log('Tipo salvo localmente');
    }
  },

  async deleteExpenseType(id) {
    this.expenseTypesList = this.expenseTypesList.filter(t => t.id !== id);
    this.renderExpenseTypesList();
    this.showToast('Tipo de despesa removido.');

    try {
      const url = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.getApiUrl)
        ? window.APP_CONFIG.getApiUrl(`api/despesas.php?action=deletar_tipo&id_tipo_despesa=${id}`)
        : `api/despesas.php?action=deletar_tipo&id_tipo_despesa=${id}`;

      await fetch(url, { method: 'DELETE' });
    } catch (e) {
      console.log('Tipo excluído localmente');
    }
  },

  async fetchExpenseTypesFromDB() {
    try {
      const url = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.getApiUrl)
        ? window.APP_CONFIG.getApiUrl('api/despesas.php?action=tipos')
        : 'api/despesas.php?action=tipos';

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          this.expenseTypesList = json.data;
        }
      }
    } catch (e) {
      console.log('Utilizando tipos de despesas padrão');
    }
  },

  getExpenseMeta(categoria, tipo, descricao) {
    const text = ((categoria || '') + ' ' + (descricao || '')).toLowerCase();

    // 1. Marketing, Tráfego Pago, Anúncios, Meta Ads, Instagram, Google
    if (text.includes('market') || text.includes('ads') || text.includes('anúncio') || text.includes('anuncio') || text.includes('meta') || text.includes('instagram') || text.includes('tráfego') || text.includes('trafego')) {
      return {
        badgeClass: 'badge-pink',
        iconSvg: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>`
      };
    }

    // 2. Energia Elétrica, Luz, Enel
    if (text.includes('luz') || text.includes('energia') || text.includes('enel') || text.includes('elétr') || text.includes('eletri') || text.includes('cpfl')) {
      return {
        badgeClass: 'badge-amber',
        iconSvg: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`
      };
    }

    // 3. Aluguel, Ponto Comercial, Loja Física, Imóvel
    if (text.includes('aluguel') || text.includes('ponto') || text.includes('imóvel') || text.includes('imovel') || text.includes('loja') || text.includes('condomínio') || text.includes('condominio')) {
      return {
        badgeClass: 'badge-blue',
        iconSvg: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>`
      };
    }

    // 4. Internet, Fibra, Telefonia, Vivo, Claro
    if (text.includes('internet') || text.includes('fibra') || text.includes('vivo') || text.includes('claro') || text.includes('tim') || text.includes('tel')) {
      return {
        badgeClass: 'badge-cyan',
        iconSvg: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`
      };
    }

    // 5. Software & SaaS, Bling, Shopify, Ferramentas
    if (text.includes('software') || text.includes('saas') || text.includes('sistema') || text.includes('bling') || text.includes('shopify') || text.includes('ferramenta') || text.includes('app')) {
      return {
        badgeClass: 'badge-purple',
        iconSvg: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`
      };
    }

    // 6. Contabilidade, Impostos, Taxas, Honorários, Jurídico
    if (text.includes('contab') || text.includes('honorár') || text.includes('honorari') || text.includes('fiscal') || text.includes('imposto') || text.includes('tributo') || text.includes('das') || text.includes('juríd') || text.includes('jurid')) {
      return {
        badgeClass: 'badge-blue',
        iconSvg: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`
      };
    }

    // 7. Gasolina, Combustível, Uber, Deslocamento, Transporte
    if (text.includes('gasolina') || text.includes('combust') || text.includes('posto') || text.includes('uber') || text.includes('desloca') || text.includes('transporte') || text.includes('abastecimento') || text.includes('ipiranga') || text.includes('shell')) {
      return {
        badgeClass: 'badge-cyan',
        iconSvg: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>`
      };
    }

    // 8. Refeição, Alimentação, Almoço, Restaurante
    if (text.includes('refeição') || text.includes('refeicao') || text.includes('almoço') || text.includes('almoco') || text.includes('alimen') || text.includes('lanche') || text.includes('restaurante')) {
      return {
        badgeClass: 'badge-orange',
        iconSvg: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`
      };
    }

    // 8.1. Pequenos Reparos, Manutenção, Peças, Consertos
    if (text.includes('reparo') || text.includes('peca') || text.includes('peça') || text.includes('manuten') || text.includes('conserto') || text.includes('troca') || text.includes('oficina') || text.includes('reforma')) {
      return {
        badgeClass: 'badge-purple',
        iconSvg: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`
      };
    }

    // 9. Pedágio, Estacionamento, Sem Parar
    if (text.includes('pedágio') || text.includes('pedagio') || text.includes('estaciona') || text.includes('sem parar') || text.includes('rodovia')) {
      return {
        badgeClass: 'badge-purple',
        iconSvg: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`
      };
    }

    // 10. Embalagens, Caixas, Plástico Bolha
    if (text.includes('embalag') || text.includes('caixa') || text.includes('plástico') || text.includes('plastico') || text.includes('fita')) {
      return {
        badgeClass: 'badge-orange',
        iconSvg: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`
      };
    }

    // 11. Fretes, Entregas, Motoboy, Sedex
    if (text.includes('frete') || text.includes('correio') || text.includes('entrega') || text.includes('motoboy') || text.includes('sedex') || text.includes('jadlog') || text.includes('loggi')) {
      return {
        badgeClass: 'badge-cyan',
        iconSvg: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`
      };
    }

    // 12. Salários, Pró-Labore, Equipe
    if (text.includes('salário') || text.includes('salario') || text.includes('pró-labore') || text.includes('pro-labore') || text.includes('equipe') || text.includes('rh')) {
      return {
        badgeClass: 'badge-green',
        iconSvg: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
      };
    }

    // Fallbacks
    if (tipo === 'fixa') {
      return {
        badgeClass: 'badge-blue',
        iconSvg: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line></svg>`
      };
    }
    return {
      badgeClass: 'badge-amber',
      iconSvg: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`
    };
  },

  getExpenseDefaultIcon(categoria, tipo) {
    if (tipo === 'fixa') return 'building';
    return 'zap';
  },

  setupNewExpenseModal() {
    const btnFixed = document.getElementById("btnTypeFixed");
    const btnVar = document.getElementById("btnTypeVar");
    const typeInput = document.getElementById("newExpenseType");
    const catSelect = document.getElementById("newExpenseCategory");
    const form = document.getElementById("formNewExpense");
    const dateInput = document.getElementById("newExpenseDate");

    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    const categoriesFixed = [
      "Aluguel & Ponto Comercial",
      "Ferramentas & Softwares SaaS",
      "Internet Fibra & Telefonia",
      "Energia Elétrica & Luz",
      "Contabilidade & Jurídico",
      "Salários & Encargos",
      "Água & Saneamento",
      "Outras Despesas Fixas"
    ];

    const categoriesVar = [
      "Transporte & Deslocamento (Gasolina/Uber)",
      "Alimentação & Refeições",
      "Pequenos Reparos, Peças & Manutenção",
      "Facebook Ads & Marketing Tráfego",
      "Embalagens & Logística",
      "Pedágio & Estacionamento",
      "Taxas & Imprevistos",
      "Outras Despesas Variáveis"
    ];

    const populateCategories = (type) => {
      if (!catSelect) return;
      const list = type === 'fixa' ? categoriesFixed : categoriesVar;
      catSelect.innerHTML = list.map(c => `
        <option value="${c}">${c}</option>
      `).join('');
    };

    if (btnFixed && btnVar && typeInput) {
      btnFixed.addEventListener("click", () => {
        btnFixed.classList.add("active");
        btnVar.classList.remove("active");
        typeInput.value = "fixa";
        populateCategories("fixa");
      });

      btnVar.addEventListener("click", () => {
        btnVar.classList.add("active");
        btnFixed.classList.remove("active");
        typeInput.value = "variavel";
        populateCategories("variavel");
      });
    }

    // Inicializar categorias com 'fixa'
    populateCategories("fixa");

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const tipo = typeInput ? typeInput.value : "fixa";
        const desc = document.getElementById("newExpenseDesc").value.trim();
        const cat = catSelect ? catSelect.value : "Geral";
        const valor = parseFloat(document.getElementById("newExpenseValue").value) || 0;
        const data = document.getElementById("newExpenseDate").value;
        const status = document.getElementById("newExpenseStatus").value;
        const forma = document.getElementById("newExpensePaymentMethod").value;
        const obs = document.getElementById("newExpenseObs").value.trim();

        if (!desc || valor <= 0) {
          this.showToast("Informe a descrição e um valor válido.");
          return;
        }

        // Formatar data para exibição
        let dataFormatada = data;
        if (data) {
          const parts = data.split('-');
          if (parts.length === 3) {
            dataFormatada = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        }

        const newExpense = {
          id: Date.now(),
          tipo: tipo,
          descricao: desc,
          categoria: cat,
          icone: this.getExpenseDefaultIcon(cat, tipo),
          valor: valor,
          data: tipo === 'fixa' ? (data ? `Todo dia ${data.split('-')[2] || '10'}` : 'Mensal') : dataFormatada,
          dataVencimento: data,
          status: status,
          formaPagamento: forma,
          recorrente: tipo === 'fixa',
          observacao: obs
        };

        this.expensesList.unshift(newExpense);

        // Tentar salvar no banco de dados via API
        try {
          const url = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.getApiUrl)
            ? window.APP_CONFIG.getApiUrl('api/despesas.php')
            : 'api/despesas.php';
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              descricao: desc,
              categoria: cat,
              tipo: tipo,
              valor: valor,
              dataVencimento: data,
              status: status.toUpperCase(),
              formaPagamento: forma,
              observacoes: obs,
              recorrente: tipo === 'fixa' ? 1 : 0
            })
          }).catch(() => {});
        } catch (err) {}

        this.renderExpensesView();
        this.renderFinancialView();
        Navigation.closeModal("modalNewExpense");
        form.reset();
        populateCategories("fixa");
        if (btnFixed && btnVar) {
          btnFixed.classList.add("active");
          btnVar.classList.remove("active");
          if (typeInput) typeInput.value = "fixa";
        }

        this.showToast(`✨ Despesa "${desc}" de R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cadastrada!`);
      });
    }
  },

  filterExpenses(filterType) {
    this.currentExpenseFilter = filterType || 'all';
    document.querySelectorAll("#expFilterTabs .expense-filter-tab-btn").forEach(btn => {
      if (btn.getAttribute("data-exp-filter") === this.currentExpenseFilter) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    this.renderExpensesView();
  },

  handleExpenseSearch(term) {
    this.currentExpenseSearch = (term || '').toLowerCase().trim();
    this.renderExpensesView();
  },

  handleExpenseCategoryFilter(category) {
    this.currentExpenseCategoryFilter = category || 'all';
    this.renderExpensesView();
  },

  async toggleExpenseStatus(id) {
    const item = this.expensesList.find(e => e.id == id);
    if (!item) return;

    const newStatus = item.status === 'pago' ? 'pendente' : 'pago';
    item.status = newStatus;

    // Sincronizar via API se disponível
    try {
      const url = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.getApiUrl)
        ? window.APP_CONFIG.getApiUrl('api/despesas.php')
        : 'api/despesas.php';
      fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: newStatus.toUpperCase() })
      }).catch(() => {});
    } catch (e) {}

    this.renderExpensesView();
    this.renderFinancialView();
    this.showToast(`✨ Despesa "${item.descricao}" alterada para ${newStatus === 'pago' ? 'PAGA' : 'PENDENTE'}!`);
  },

  toggleExpensePaid(id) {
    this.toggleExpenseStatus(id);
  },

  async markAllExpensesPaid() {
    let count = 0;
    this.expensesList.forEach(e => {
      if (e.status !== 'pago') {
        e.status = 'pago';
        count++;
      }
    });

    this.renderExpensesView();
    this.renderFinancialView();
    this.showToast(`✨ ${count} despesa${count === 1 ? '' : 's'} pendente${count === 1 ? '' : 's'} marcada${count === 1 ? '' : 's'} como quitada${count === 1 ? '' : 's'}!`);
  },

  async deleteExpense(id) {
    const idx = this.expensesList.findIndex(e => e.id == id);
    if (idx === -1) return;

    const deleted = this.expensesList.splice(idx, 1)[0];

    try {
      const url = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.getApiUrl)
        ? window.APP_CONFIG.getApiUrl(`api/despesas.php?id=${id}`)
        : `api/despesas.php?id=${id}`;
      fetch(url, { method: 'DELETE' }).catch(() => {});
    } catch (e) {}

    this.renderExpensesView();
    this.renderFinancialView();
    this.showToast(`Despesa "${deleted.descricao}" removida com sucesso.`);
  },

  handleBudgetSimulation(reductionPct) {
    const pct = Math.max(0, Math.min(30, Number(reductionPct) || 0));
    this.currentBudgetReduction = pct;

    const elLabel = document.getElementById("simReductionPctLabel");
    const elRange = document.getElementById("simExpenseRange");
    if (elLabel) elLabel.textContent = `${pct}%`;
    if (elRange && elRange.value != pct) elRange.value = pct;

    const totalDespesas = this.expensesList.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
    const faturamentoBruto = this.salesList.reduce((acc, s) => acc + Number(s.valorTotal || 0), 0);
    const lucroBrutoVendas = this.salesList.reduce((acc, s) => acc + Number(s.lucro || 0), 0);
    const taxasPlataforma = faturamentoBruto * 0.03865;
    const cmvTotal = Math.max(0, faturamentoBruto - lucroBrutoVendas);
    const receitaLiquida = Math.max(0, faturamentoBruto - taxasPlataforma);
    const lucroBrutoReal = Math.max(0, receitaLiquida - cmvTotal);
    const lucroLiquidoAtual = Math.max(0, lucroBrutoReal - totalDespesas);

    const economy = totalDespesas * (pct / 100);
    const newProfit = lucroLiquidoAtual + economy;
    const newMargin = faturamentoBruto > 0 ? ((newProfit / faturamentoBruto) * 100) : 0;
    const currentMargin = faturamentoBruto > 0 ? ((lucroLiquidoAtual / faturamentoBruto) * 100) : 0;
    const diffMargin = (newMargin - currentMargin);

    const elEcon = document.getElementById("simEconomyVal");
    const elNewProfit = document.getElementById("simNewProfitVal");
    const elNewMargin = document.getElementById("simNewMarginVal");

    if (elEcon) elEcon.textContent = `+ R$ ${economy.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elNewProfit) elNewProfit.textContent = `R$ ${newProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elNewMargin) elNewMargin.textContent = `${newMargin.toFixed(1)}% (${diffMargin >= 0 ? '+' : ''}${diffMargin.toFixed(1)}%)`;
  },

  switchFinancialTab(paneId) {
    if (!paneId) return;

    document.querySelectorAll("#finSubtabNav .fin-subtab-btn").forEach(btn => {
      if (btn.getAttribute("data-fin-pane") === paneId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    document.querySelectorAll(".fin-tab-pane").forEach(pane => {
      if (pane.id === `pane-fin-${paneId}`) {
        pane.classList.add("active");
      } else {
        pane.classList.remove("active");
      }
    });

    if (paneId === "movimentacoes" && typeof ChartsEngine !== "undefined" && ChartsEngine.renderFinancialCharts) {
      setTimeout(() => ChartsEngine.renderFinancialCharts(1), 50);
    }
  },

  /* ==========================================================================
     MÓDULO FINANCEIRO, INVESTIMENTOS, ROI & DEMONSTRATIVO DRE
     ========================================================================== */
  renderFinancialView() {
    // 1. Cálculos de Vendas e Faturamento
    const totalVendas = this.salesList.length;
    const faturamentoBruto = this.salesList.reduce((acc, s) => acc + Number(s.valorTotal || 0), 0);
    const lucroBrutoVendas = this.salesList.reduce((acc, s) => acc + Number(s.lucro || 0), 0);
    const totalItensVendidos = this.salesList.reduce((acc, s) => acc + (Number(s.qtdItens) || 1), 0);
    const ticketMedio = totalVendas > 0 ? (faturamentoBruto / totalVendas) : 0;
    const lucroMedioPorVenda = totalVendas > 0 ? (lucroBrutoVendas / totalVendas) : 0;
    const cmvTotal = Math.max(0, faturamentoBruto - lucroBrutoVendas);
    const taxasPlataforma = faturamentoBruto * 0.03865; // ~3.8% taxas médias de canais
    const receitaLiquida = Math.max(0, faturamentoBruto - taxasPlataforma);

    // 2. Cálculos de Despesas
    const fixas = this.expensesList.filter(e => e.tipo === "fixa");
    const variaveis = this.expensesList.filter(e => e.tipo === "variavel");
    const totalFixas = fixas.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
    const totalVar = variaveis.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
    const totalDespesas = totalFixas + totalVar;

    // 3. Lucro Líquido Real Obtido no Caixa
    const lucroBrutoReal = Math.max(0, receitaLiquida - cmvTotal);
    const lucroLiquidoReal = Math.max(0, lucroBrutoReal - totalDespesas);
    const margemLiquidaPct = faturamentoBruto > 0 ? ((lucroLiquidoReal / faturamentoBruto) * 100) : 0;
    const margemBrutaPct = faturamentoBruto > 0 ? ((lucroBrutoVendas / faturamentoBruto) * 100) : 0;
    const despesasPct = faturamentoBruto > 0 ? ((totalDespesas / faturamentoBruto) * 100) : 0;

    // 4. Cálculos de Estoque e Capital Investido
    const capitalEstoque = this.productsList.reduce((acc, p) => acc + (Number(p.investimento || 0) * Number(p.quantidade || 0)), 0);
    const totalUnidadesEstoque = this.productsList.reduce((acc, p) => acc + Number(p.quantidade || 0), 0);
    const contasAReceber = 4250.00;
    const saldoCaixa = faturamentoBruto;
    const capitalTotalDistribuido = capitalEstoque + contasAReceber + saldoCaixa;
    const pctEstoque = capitalTotalDistribuido > 0 ? ((capitalEstoque / capitalTotalDistribuido) * 100) : 78.5;
    const pctReceber = capitalTotalDistribuido > 0 ? ((contasAReceber / capitalTotalDistribuido) * 100) : 6.2;
    const pctCaixa = capitalTotalDistribuido > 0 ? ((saldoCaixa / capitalTotalDistribuido) * 100) : 15.3;

    // 5. Custo Operacional Total & ROI Geral
    const custoOperacionalTotal = cmvTotal + totalDespesas;
    const roiGeral = custoOperacionalTotal > 0 ? ((lucroLiquidoReal / custoOperacionalTotal) * 100) : 34.8;
    const breakEven = totalDespesas > 0 && margemBrutaPct > 0 ? (totalDespesas / (margemBrutaPct / 100)) : 12350;

    // 6. Atualizar Hero Bento Grid da Visão Financeira
    // Card 1: Lucro Líquido Real
    const elTotalLucro = document.getElementById("finKpiTotalLucro");
    const elLucroMarginSub = document.getElementById("finKpiLucroMarginSub");
    const elLucroContext = document.getElementById("finKpiLucroContext");
    const elCapCaixaVal = document.getElementById("capAllocCaixaVal");
    const elCapCaixaVal2 = document.getElementById("capAllocCaixaVal2");

    if (elTotalLucro) elTotalLucro.textContent = `R$ ${lucroLiquidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elLucroMarginSub) elLucroMarginSub.textContent = `Margem ${margemLiquidaPct.toFixed(1)}%`;
    if (elLucroContext) elLucroContext.textContent = `em ${totalVendas} vendas concluídas no período`;
    if (elCapCaixaVal) elCapCaixaVal.textContent = `R$ ${faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elCapCaixaVal2) elCapCaixaVal2.textContent = `R$ ${faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Health Badge
    const elHealthPill = document.getElementById("finHealthPill");
    if (elHealthPill) {
      if (margemLiquidaPct >= 12) {
        elHealthPill.style.background = "rgba(16, 185, 129, 0.15)";
        elHealthPill.style.borderColor = "rgba(16, 185, 129, 0.3)";
        elHealthPill.style.color = "#34d399";
      } else if (margemLiquidaPct >= 5) {
        elHealthPill.style.background = "rgba(245, 158, 11, 0.15)";
        elHealthPill.style.borderColor = "rgba(245, 158, 11, 0.3)";
        elHealthPill.style.color = "#fbbf24";
      } else {
        elHealthPill.style.background = "rgba(248, 113, 113, 0.15)";
        elHealthPill.style.borderColor = "rgba(248, 113, 113, 0.3)";
        elHealthPill.style.color = "#f87171";
      }
    }

    // Card 2: Receita Bruta & CMV
    const elDreReceita = document.getElementById("dreRowReceitaBruta");
    const elDreReceita2 = document.getElementById("dreRowReceitaBruta2");
    const elDreCMV = document.getElementById("dreRowCMV");
    const elDreCMV2 = document.getElementById("dreRowCMV2");
    const elSalesHeaderBadge = document.getElementById("finSalesHeaderCountBadge");
    const elTicketMedio = document.getElementById("finMetricTicketMedio");
    const elTicketMedio2 = document.getElementById("finMetricTicketMedio2");
    const elMediaProdutoPill = document.getElementById("finKpiMediaProdutoPill");
    const elLucroMedio = document.getElementById("finMetricLucroMedio");

    if (elDreReceita) elDreReceita.textContent = `R$ ${faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elDreReceita2) elDreReceita2.textContent = `R$ ${faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elDreCMV) elDreCMV.textContent = `- R$ ${cmvTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elDreCMV2) elDreCMV2.textContent = `- R$ ${cmvTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elSalesHeaderBadge) elSalesHeaderBadge.textContent = `${totalVendas} Vendas`;
    if (elTicketMedio) elTicketMedio.textContent = `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elTicketMedio2) elTicketMedio2.textContent = `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elMediaProdutoPill) elMediaProdutoPill.textContent = `Lucro Médio R$ ${lucroMedioPorVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elLucroMedio) elLucroMedio.textContent = `R$ ${lucroMedioPorVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Card 3: Despesas Operacionais & ROI
    const elTotalExpenses = document.getElementById("finKpiTotalExpenses");
    const elFixedPct = document.getElementById("dreRowFixedPct");
    const elFixedPct2 = document.getElementById("dreRowFixedPct2");
    const elExpenseCount = document.getElementById("finKpiExpenseCount");
    const elRoiVal = document.getElementById("finKpiRoiVal");

    if (elTotalExpenses) elTotalExpenses.textContent = `R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elFixedPct) elFixedPct.textContent = `${despesasPct.toFixed(1)}% da Receita`;
    if (elFixedPct2) elFixedPct2.textContent = `${(faturamentoBruto > 0 ? (totalFixas / faturamentoBruto) * 100 : 0).toFixed(1)}% da Receita`;
    if (elExpenseCount) elExpenseCount.textContent = `${this.expensesList.length} lançamentos`;
    if (elRoiVal) elRoiVal.textContent = `${roiGeral.toFixed(1)}%`;

    // 7. Atualizar Resumo dos Gráficos de Evolução
    const elChartFat = document.getElementById("finChartSummaryFat");
    const elChartDesp = document.getElementById("finChartSummaryDesp");
    const elChartLucro = document.getElementById("finChartSummaryLucro");

    if (elChartFat) elChartFat.textContent = `R$ ${faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elChartDesp) elChartDesp.textContent = `R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elChartLucro) elChartLucro.textContent = `R$ ${lucroLiquidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // 8. Atualizar DRE Cascata Detalhada
    const elDreTaxas = document.getElementById("dreRowTaxas");
    const elDreTaxasPct = document.getElementById("dreRowTaxasPct");
    const elDreReceitaLiq = document.getElementById("dreRowReceitaLiquida");
    const elDreReceitaLiqPct = document.getElementById("dreRowReceitaLiquidaPct");
    const elDreCMVPct = document.getElementById("dreRowCMVPct");
    const elDreLucroBruto = document.getElementById("dreRowLucroBruto");
    const elDreMargemBrutaPct = document.getElementById("dreRowMargemBrutaPct");
    const elDreDespesasFixas = document.getElementById("dreRowDespesasFixas");
    const elDreDespesasVar = document.getElementById("dreRowDespesasVar");
    const elDreVarPct = document.getElementById("dreRowVarPct");
    const elDreLucroLiquidoFinal = document.getElementById("dreRowLucroLiquidoFinal");
    const elDreMargemFinalPct = document.getElementById("dreRowMargemFinalPct");
    const elDreSalesCountMeta = document.getElementById("dreRowSalesCountMeta");

    const barTaxas = document.getElementById("dreBarTaxas");
    const barReceitaLiq = document.getElementById("dreBarReceitaLiquida");
    const barCMV = document.getElementById("dreBarCMV");
    const barLucroBruto = document.getElementById("dreBarLucroBruto");
    const barDespesasFixas = document.getElementById("dreBarDespesasFixas");
    const barDespesasVar = document.getElementById("dreBarDespesasVar");
    const barLucroLiquido = document.getElementById("dreBarLucroLiquido");

    if (elDreSalesCountMeta) elDreSalesCountMeta.textContent = `${totalVendas} vendas realizadas nos canais`;
    if (elDreTaxas) elDreTaxas.textContent = `- R$ ${taxasPlataforma.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elDreTaxasPct) elDreTaxasPct.textContent = `${((taxasPlataforma / faturamentoBruto) * 100).toFixed(1)}% da Receita`;
    if (barTaxas) barTaxas.style.width = `${Math.min(100, (taxasPlataforma / faturamentoBruto) * 100)}%`;

    if (elDreReceitaLiq) elDreReceitaLiq.textContent = `R$ ${receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elDreReceitaLiqPct) elDreReceitaLiqPct.textContent = `${((receitaLiquida / faturamentoBruto) * 100).toFixed(1)}%`;
    if (barReceitaLiq) barReceitaLiq.style.width = `${Math.min(100, (receitaLiquida / faturamentoBruto) * 100)}%`;

    if (elDreCMVPct) elDreCMVPct.textContent = `${((cmvTotal / faturamentoBruto) * 100).toFixed(1)}% da Receita`;
    if (barCMV) barCMV.style.width = `${Math.min(100, (cmvTotal / faturamentoBruto) * 100)}%`;

    if (elDreLucroBruto) elDreLucroBruto.textContent = `R$ ${lucroBrutoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elDreMargemBrutaPct) elDreMargemBrutaPct.textContent = `Margem Bruta: ${margemBrutaPct.toFixed(1)}%`;
    if (barLucroBruto) barLucroBruto.style.width = `${Math.min(100, margemBrutaPct)}%`;

    if (elDreDespesasFixas) elDreDespesasFixas.textContent = `- R$ ${totalFixas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (barDespesasFixas) barDespesasFixas.style.width = `${Math.min(100, (totalFixas / faturamentoBruto) * 100)}%`;

    if (elDreDespesasVar) elDreDespesasVar.textContent = `- R$ ${totalVar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elDreVarPct) elDreVarPct.textContent = `${((totalVar / faturamentoBruto) * 100).toFixed(1)}% da Receita`;
    if (barDespesasVar) barDespesasVar.style.width = `${Math.min(100, (totalVar / faturamentoBruto) * 100)}%`;

    if (elDreLucroLiquidoFinal) elDreLucroLiquidoFinal.textContent = `R$ ${lucroLiquidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elDreMargemFinalPct) elDreMargemFinalPct.textContent = `Margem Líquida Real: ${margemLiquidaPct.toFixed(1)}%`;
    if (barLucroLiquido) barLucroLiquido.style.width = `${Math.min(100, margemLiquidaPct)}%`;

    // 9. Atualizar Alocação de Capital
    const elCapEstoqueVal = document.getElementById("capAllocEstoqueVal");
    const elCapEstoquePct = document.getElementById("capAllocEstoquePct");
    const elCapReceberVal = document.getElementById("capAllocReceberVal");
    const elCapReceberPct = document.getElementById("capAllocReceberPct");
    const elCapEstoqueSub = document.getElementById("capEstoqueSubText");
    const elBreakEven = document.getElementById("finMetricBreakEven");

    const segEstoque = document.getElementById("capSegEstoque");
    const segReceber = document.getElementById("capSegReceber");
    const segCaixa = document.getElementById("capSegCaixa");

    if (elCapEstoqueVal) elCapEstoqueVal.textContent = `R$ ${capitalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elCapEstoquePct) elCapEstoquePct.textContent = `${pctEstoque.toFixed(1)}%`;
    if (elCapEstoqueSub) elCapEstoqueSub.textContent = `${totalUnidadesEstoque} unidades compradas disponíveis`;
    if (segEstoque) segEstoque.style.width = `${pctEstoque.toFixed(1)}%`;

    if (elCapReceberVal) elCapReceberVal.textContent = `R$ ${contasAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elCapReceberPct) elCapReceberPct.textContent = `${pctReceber.toFixed(1)}%`;
    if (segReceber) segReceber.style.width = `${pctReceber.toFixed(1)}%`;

    if (segCaixa) segCaixa.style.width = `${pctCaixa.toFixed(1)}%`;
    if (elBreakEven) elBreakEven.textContent = `R$ ${breakEven.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // 10. Renderizar Tabela de Rentabilidade por Venda
    this.renderFinancialSalesTable();

    // 11. Renderizar KPIs Comerciais
    this.renderSalesKpis();
    this.renderProductKpis();

    // 12. Re-renderizar Gráficos se inicializados
    if (typeof ChartsEngine !== "undefined" && ChartsEngine.renderFinancialCharts) {
      ChartsEngine.renderFinancialCharts(1);
    }
  },

  renderFinancialSalesTable() {
    const tbody = document.getElementById("financialSalesTbody");
    const mobileContainer = document.getElementById("financialSalesMobileList");
    const badge = document.getElementById("finSalesTableBadge");

    if (badge) badge.textContent = `${this.salesList.length} operações auditadas`;

    if (tbody) {
      tbody.innerHTML = this.salesList.map(item => {
        const valor = Number(item.valorTotal || 0);
        const lucro = Number(item.lucro || 0);
        const custo = Math.max(0, valor - lucro);
        const margem = valor > 0 ? ((lucro / valor) * 100) : 0;
        const statusClass = item.status === "Concluído" ? "badge-success" : "badge-warning";

        return `
          <tr>
            <td>
              <strong style="color:var(--text-primary); font-size:0.85rem;">#${item.id}</strong>
              <div style="font-size:0.72rem; color:var(--text-tertiary);">${item.data || 'Hoje'}</div>
            </td>
            <td>
              <div style="font-weight:600; color:var(--text-primary); font-size:0.85rem;">${item.cliente}</div>
              <span class="badge" style="font-size:0.68rem; padding:1px 6px;">${item.plataforma}</span>
            </td>
            <td>
              <span style="font-size:0.85rem; color:var(--text-secondary);">${item.itens}</span>
            </td>
            <td>
              <strong style="color:var(--text-primary); font-size:0.90rem;">R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </td>
            <td>
              <span style="color:#f87171; font-size:0.88rem; font-weight:600;">- R$ ${custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </td>
            <td>
              <strong style="color:#34d399; font-size:0.92rem;">+ R$ ${lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </td>
            <td>
              <span class="badge badge-success" style="font-size:0.72rem; font-weight:700;">${margem.toFixed(1)}%</span>
            </td>
            <td style="text-align: right;">
              <span class="badge ${statusClass}">${item.status}</span>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (mobileContainer) {
      mobileContainer.innerHTML = this.salesList.map(item => {
        const valor = Number(item.valorTotal || 0);
        const lucro = Number(item.lucro || 0);
        const custo = Math.max(0, valor - lucro);
        const margem = valor > 0 ? ((lucro / valor) * 100) : 0;
        const statusClass = item.status === "Concluído" ? "badge-success" : "badge-warning";

        return `
          <div class="expense-item-card" style="flex-direction:column; align-items:stretch; gap:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="color:var(--text-primary); font-size:0.90rem;">#${item.id} - ${item.cliente}</strong>
                <div style="font-size:0.72rem; color:var(--text-tertiary);">${item.plataforma} • ${item.data || 'Hoje'}</div>
              </div>
              <span class="badge ${statusClass}">${item.status}</span>
            </div>
            <div style="font-size:0.82rem; color:var(--text-secondary);">${item.itens}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:6px; margin-top:2px;">
              <div style="font-size:0.78rem;">Venda: <strong style="color:var(--text-primary);">R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
              <div style="font-size:0.78rem;">Lucro: <strong style="color:#34d399;">+ R$ ${lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${margem.toFixed(0)}%)</strong></div>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  /* ==========================================================================
     MÓDULO DE RELATÓRIOS & EXPORTAÇÃO POR PERÍODO
     ========================================================================== */
  currentReportPeriod: 'mes_atual',
  reportPeriodLabel: 'Agosto 2026 (Mês Atual)',
  selectedReportModules: {
    vendas: true,
    despesas: true,
    financeiro: true,
    estoque: true
  },
  filteredReportData: {
    vendas: [],
    despesas: [],
    financeiro: {},
    estoque: []
  },

  setupReportsView() {
    this.setReportPeriod('mes_atual');
  },

  setReportPeriod(period) {
    this.currentReportPeriod = period;

    // Atualiza pills de período
    document.querySelectorAll('[data-report-period]').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-report-period') === period);
    });

    const customDateRow = document.getElementById('reportCustomDateRow');
    if (customDateRow) {
      customDateRow.style.display = period === 'personalizado' ? 'flex' : 'none';
    }

    // Define rótulo e filtra dados
    let label = 'Agosto 2026 (Mês Atual)';
    let vendas = [...this.salesList];
    let despesas = [...this.expensesList];

    if (period === 'hoje') {
      label = 'Hoje';
      vendas = vendas.slice(0, 3);
      despesas = despesas.filter(d => (d.data && d.data.toLowerCase().includes('hoje')) || d.id === 6 || d.id === 7);
      if (despesas.length === 0) despesas = this.expensesList.slice(0, 2);
    } else if (period === 'ontem') {
      label = 'Ontem';
      vendas = vendas.slice(3, 5);
      despesas = despesas.filter(d => (d.data && d.data.toLowerCase().includes('ontem')) || d.id === 8);
      if (despesas.length === 0) despesas = this.expensesList.slice(2, 4);
    } else if (period === '7dias') {
      label = 'Últimos 7 dias';
      vendas = vendas.slice(0, 10);
      despesas = despesas.slice(0, 6);
    } else if (period === 'mes_atual') {
      label = 'Agosto 2026 (Mês Atual)';
      vendas = [...this.salesList];
      despesas = [...this.expensesList];
    } else if (period === 'mes_anterior') {
      label = 'Julho 2026 (Mês Anterior)';
      vendas = vendas.slice(2, 15);
      despesas = despesas.slice(3, 10);
    } else if (period === 'ano_atual') {
      label = 'Ano 2026';
      vendas = [...this.salesList];
      despesas = [...this.expensesList];
    } else if (period === 'todos') {
      label = 'Todo o Histórico';
      vendas = [...this.salesList];
      despesas = [...this.expensesList];
    }

    this.reportPeriodLabel = label;
    this.calculateReportMetrics(vendas, despesas, label);
  },

  applyCustomReportDates() {
    const start = document.getElementById('reportDateStart')?.value;
    const end = document.getElementById('reportDateEnd')?.value;

    let label = 'Personalizado';
    if (start && end) {
      const sParts = start.split('-');
      const eParts = end.split('-');
      const sFmt = `${sParts[2]}/${sParts[1]}/${sParts[0]}`;
      const eFmt = `${eParts[2]}/${eParts[1]}/${eParts[0]}`;
      label = `${sFmt} até ${eFmt}`;
    }

    this.reportPeriodLabel = label;
    const vendas = [...this.salesList];
    const despesas = [...this.expensesList];
    this.calculateReportMetrics(vendas, despesas, label);
    this.showToast(`Período personalizado aplicado: ${label}`, 'info');
  },

  calculateReportMetrics(vendas, despesas, label) {
    // 1. Cálculos de Vendas
    let faturamentoBruto = 0;
    let cmvVendas = 0;
    let lucroVendas = 0;

    vendas.forEach(item => {
      const val = Number(item.valorTotal || 0);
      const luc = Number(item.lucro || 0);
      faturamentoBruto += val;
      lucroVendas += luc;
      cmvVendas += Math.max(0, val - luc);
    });

    // 2. Cálculos de Despesas
    let totalDespesasFixas = 0;
    let totalDespesasVar = 0;

    despesas.forEach(item => {
      const val = Number(item.valor || 0);
      if (item.tipo === 'fixa') {
        totalDespesasFixas += val;
      } else {
        totalDespesasVar += val;
      }
    });
    const totalDespesasOperacionais = totalDespesasFixas + totalDespesasVar;

    // 3. Cálculos de Financeiro / DRE
    const taxasPlataforma = faturamentoBruto * 0.082; // taxa média estimada de intermediação
    const receitaLiquida = faturamentoBruto - taxasPlataforma;
    const lucroBruto = receitaLiquida - cmvVendas;
    const lucroLiquidoReal = lucroBruto - totalDespesasOperacionais;
    const margemLiquidaPct = faturamentoBruto > 0 ? (lucroLiquidoReal / faturamentoBruto) * 100 : 0;

    // 4. Catálogo / Estoque
    const estoque = [...this.productsList];
    let totalEstoqueQtd = 0;
    let totalEstoqueInvestido = 0;
    let totalEstoquePotencial = 0;

    estoque.forEach(p => {
      const qtd = Number(p.quantidade || 0);
      const inv = Number(p.investimento || 0);
      const prc = Number(p.precoVenda || 0);
      totalEstoqueQtd += qtd;
      totalEstoqueInvestido += (inv * qtd);
      totalEstoquePotencial += (prc * qtd);
    });

    // Armazenar no estado
    this.filteredReportData = {
      vendas,
      despesas,
      estoque,
      financeiro: {
        faturamentoBruto,
        vendasCount: vendas.length,
        taxasPlataforma,
        receitaLiquida,
        cmvVendas,
        lucroBruto,
        totalDespesasFixas,
        totalDespesasVar,
        totalDespesasOperacionais,
        lucroLiquidoReal,
        margemLiquidaPct,
        totalEstoqueQtd,
        totalEstoqueInvestido,
        totalEstoquePotencial
      }
    };

    // Atualizar UI
    this.updateReportHubUI(label);
  },

  updateReportHubUI(label) {
    const fin = this.filteredReportData.financeiro;

    // Rótulo do período ativo
    const elActivePeriod = document.getElementById('reportActivePeriodLabel');
    if (elActivePeriod) elActivePeriod.textContent = label;

    // Badges do Card de Vendas
    const elVendasCount = document.getElementById('badgeReportVendasCount');
    const elVendasTotal = document.getElementById('badgeReportVendasTotal');
    if (elVendasCount) elVendasCount.textContent = `${this.filteredReportData.vendas.length} vendas`;
    if (elVendasTotal) elVendasTotal.textContent = `R$ ${fin.faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Badges do Card de Despesas
    const elDespCount = document.getElementById('badgeReportDespesasCount');
    const elDespTotal = document.getElementById('badgeReportDespesasTotal');
    if (elDespCount) elDespCount.textContent = `${this.filteredReportData.despesas.length} despesas`;
    if (elDespTotal) elDespTotal.textContent = `R$ ${fin.totalDespesasOperacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Badges do Card de Financeiro / DRE
    const elLucroLiq = document.getElementById('badgeReportLucroLiquido');
    const elMargemPct = document.getElementById('badgeReportMargemPct');
    if (elLucroLiq) {
      elLucroLiq.textContent = `${fin.lucroLiquidoReal >= 0 ? '+' : ''} R$ ${fin.lucroLiquidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      elLucroLiq.className = fin.lucroLiquidoReal >= 0 ? 'badge badge-success' : 'badge badge-warning';
    }
    if (elMargemPct) elMargemPct.textContent = `${fin.margemLiquidaPct.toFixed(1)}% margem líquida`;

    // Badges do Card de Estoque
    const elEstoqueCount = document.getElementById('badgeReportEstoqueCount');
    const elEstoqueTotal = document.getElementById('badgeReportEstoqueTotal');
    if (elEstoqueCount) elEstoqueCount.textContent = `${this.filteredReportData.estoque.length} itens (${fin.totalEstoqueQtd} un.)`;
    if (elEstoqueTotal) elEstoqueTotal.textContent = `R$ ${fin.totalEstoquePotencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Atualiza Live Scope Badge e Resumo
    this.updateReportScopeSummary();
  },

  toggleReportModule(moduleKey) {
    if (this.selectedReportModules[moduleKey] === undefined) return;
    this.selectedReportModules[moduleKey] = !this.selectedReportModules[moduleKey];

    // Atualiza checkbox e classe visual do card
    const card = document.getElementById(`moduleCard-${moduleKey}`);
    const chk = document.getElementById(`chkReport-${moduleKey}`);

    const isSelected = this.selectedReportModules[moduleKey];
    if (card) card.classList.toggle('selected', isSelected);
    if (chk) chk.checked = isSelected;

    this.updateReportScopeSummary();
  },

  toggleAllReportModules(selectAll) {
    ['vendas', 'despesas', 'financeiro', 'estoque'].forEach(key => {
      this.selectedReportModules[key] = selectAll;
      const card = document.getElementById(`moduleCard-${key}`);
      const chk = document.getElementById(`chkReport-${key}`);
      if (card) card.classList.toggle('selected', selectAll);
      if (chk) chk.checked = selectAll;
    });

    this.updateReportScopeSummary();
  },

  getSelectedModulesList() {
    return Object.keys(this.selectedReportModules).filter(k => this.selectedReportModules[k]);
  },

  updateReportScopeSummary() {
    const selected = this.getSelectedModulesList();
    const mapNames = {
      vendas: 'Vendas',
      despesas: 'Despesas',
      financeiro: 'Financeiro (DRE)',
      estoque: 'Estoque'
    };

    const scopeTextEl = document.getElementById('reportSelectedScopeText');
    const readySummaryEl = document.getElementById('exportTotalItemsCount');

    if (selected.length === 0) {
      if (scopeTextEl) scopeTextEl.textContent = `Nenhum módulo selecionado • ${this.reportPeriodLabel}`;
      if (readySummaryEl) readySummaryEl.textContent = 'Nenhum módulo selecionado (escolha ao menos 1)';
    } else if (selected.length === 4) {
      if (scopeTextEl) scopeTextEl.textContent = `Todos os Módulos • ${this.reportPeriodLabel}`;
      if (readySummaryEl) readySummaryEl.textContent = `4 módulos (Completo) • ${this.reportPeriodLabel}`;
    } else {
      const names = selected.map(k => mapNames[k]).join(', ');
      if (scopeTextEl) scopeTextEl.textContent = `${names} • ${this.reportPeriodLabel}`;
      if (readySummaryEl) readySummaryEl.textContent = `${selected.length} módulo(s) (${names})`;
    }
  },

  /* ==========================================================================
     EXPORTAÇÃO EXCEL / CSV
     ========================================================================== */
  exportReportCSV() {
    const selected = this.getSelectedModulesList();
    if (selected.length === 0) {
      this.showToast('Selecione pelo menos um tipo de relatório para exportar.', 'warning');
      return;
    }

    const periodClean = (this.reportPeriodLabel || 'periodo').replace(/[^a-zA-Z0-9]/g, '_');
    const nowStr = new Date().toLocaleString('pt-BR');
    const fin = this.filteredReportData.financeiro;

    const sections = [];

    // Cabeçalho Geral da Planilha
    sections.push([
      '=== RELATÓRIO EXECUTIVO - GARIMPRO ===',
      `Período do Relatório:;${this.reportPeriodLabel}`,
      `Data de Extração:;${nowStr}`,
      `Módulos Incluídos:;${selected.join(', ').toUpperCase()}`,
      `Operador:;${MockData.user ? (MockData.user.nome + ' ' + MockData.user.sobrenome) : 'Administrador'}`
    ].join('\n'));

    // 1. Módulo de Vendas
    if (this.selectedReportModules.vendas) {
      const vendas = this.filteredReportData.vendas;
      const vHeaders = ['Data', 'ID Pedido', 'Cliente', 'Canal / Plataforma', 'Itens Vendidos', 'Qtd', 'Forma Pagamento', 'Valor Total (R$)', 'Custo CMV (R$)', 'Lucro Líquido (R$)', 'Margem (%)', 'Status'];
      const vRows = vendas.map(item => {
        const val = Number(item.valorTotal || 0);
        const luc = Number(item.lucro || 0);
        const cmv = Math.max(0, val - luc);
        const margem = val > 0 ? (luc / val) * 100 : 0;
        return [
          `"${item.data || 'Hoje'}"`,
          `"#${item.id}"`,
          `"${(item.cliente || '').replace(/"/g, '""')}"`,
          `"${(item.plataforma || '').replace(/"/g, '""')}"`,
          `"${(item.itens || '').replace(/"/g, '""')}"`,
          item.qtdItens || 1,
          `"${item.pagamento || 'PIX'}"`,
          `"${val.toFixed(2).replace('.', ',')}"`,
          `"${cmv.toFixed(2).replace('.', ',')}"`,
          `"${luc.toFixed(2).replace('.', ',')}"`,
          `"${margem.toFixed(1).replace('.', ',')}%"`,
          `"${item.status || 'Concluído'}"`
        ].join(';');
      });

      const totalVendaStr = fin.faturamentoBruto.toFixed(2).replace('.', ',');
      const totalCmvStr = fin.cmvVendas.toFixed(2).replace('.', ',');
      const totalLucroStr = (fin.faturamentoBruto - fin.cmvVendas).toFixed(2).replace('.', ',');
      const margemMediaStr = fin.faturamentoBruto > 0 ? (((fin.faturamentoBruto - fin.cmvVendas) / fin.faturamentoBruto) * 100).toFixed(1).replace('.', ',') : '0,0';

      const vFooter = `TOTAL VENDAS;;;;;${vendas.length} pedidos;;${totalVendaStr};${totalCmvStr};${totalLucroStr};${margemMediaStr}%;`;

      sections.push([
        '\n--- 1. RELATÓRIO DE VENDAS & FATURAMENTO ---',
        vHeaders.join(';'),
        ...vRows,
        vFooter
      ].join('\n'));
    }

    // 2. Módulo de Despesas
    if (this.selectedReportModules.despesas) {
      const despesas = this.filteredReportData.despesas;
      const dHeaders = ['ID', 'Tipo', 'Descrição', 'Categoria', 'Valor (R$)', 'Vencimento / Data', 'Forma Pagamento', 'Status', 'Observação'];
      const dRows = despesas.map(item => {
        const val = Number(item.valor || 0);
        return [
          `"#${item.id}"`,
          `"${(item.tipo === 'fixa' ? 'Fixa' : 'Variável')}"`,
          `"${(item.descricao || '').replace(/"/g, '""')}"`,
          `"${(item.categoria || '').replace(/"/g, '""')}"`,
          `"${val.toFixed(2).replace('.', ',')}"`,
          `"${item.data || item.dataVencimento || 'N/A'}"`,
          `"${item.formaPagamento || 'PIX'}"`,
          `"${item.status || 'Pago'}"`,
          `"${(item.observacao || '').replace(/"/g, '""')}"`
        ].join(';');
      });

      const totalDespStr = fin.totalDespesasOperacionais.toFixed(2).replace('.', ',');
      const dFooter = `TOTAL DESPESAS;;;;${totalDespStr};;;;`;

      sections.push([
        '\n--- 2. RELATÓRIO DE DESPESAS OPERACIONAIS ---',
        dHeaders.join(';'),
        ...dRows,
        dFooter
      ].join('\n'));
    }

    // 3. Módulo Financeiro & DRE
    if (this.selectedReportModules.financeiro) {
      const fHeaders = ['Demonstrativo de Resultado do Exercício (DRE)', 'Valor (R$)', '% da Receita Bruta'];
      const fRows = [
        `"(=) Faturamento Bruto (Vendas)";"${fin.faturamentoBruto.toFixed(2).replace('.', ',')}";"100,0%"`,
        `"(-) Taxas & Comissões de Plataforma (Intermediação)";"- ${fin.taxasPlataforma.toFixed(2).replace('.', ',')}";"${fin.faturamentoBruto > 0 ? ((fin.taxasPlataforma / fin.faturamentoBruto) * 100).toFixed(1).replace('.', ',') : '0,0'}%"`,
        `"(=) Receita Líquida Real";"${fin.receitaLiquida.toFixed(2).replace('.', ',')}";"${fin.faturamentoBruto > 0 ? ((fin.receitaLiquida / fin.faturamentoBruto) * 100).toFixed(1).replace('.', ',') : '0,0'}%"`,
        `"(-) Custo das Mercadorias Vendidas (CMV)";"- ${fin.cmvVendas.toFixed(2).replace('.', ',')}";"${fin.faturamentoBruto > 0 ? ((fin.cmvVendas / fin.faturamentoBruto) * 100).toFixed(1).replace('.', ',') : '0,0'}%"`,
        `"(=) Lucro Bruto Operacional";"${fin.lucroBruto.toFixed(2).replace('.', ',')}";"${fin.faturamentoBruto > 0 ? ((fin.lucroBruto / fin.faturamentoBruto) * 100).toFixed(1).replace('.', ',') : '0,0'}%"`,
        `"(-) Despesas Fixas (Aluguel, Software, Contab., etc.)";"- ${fin.totalDespesasFixas.toFixed(2).replace('.', ',')}";"${fin.faturamentoBruto > 0 ? ((fin.totalDespesasFixas / fin.faturamentoBruto) * 100).toFixed(1).replace('.', ',') : '0,0'}%"`,
        `"(-) Despesas Variáveis (Fretes, Gasolina, Embalagem)";"- ${fin.totalDespesasVar.toFixed(2).replace('.', ',')}";"${fin.faturamentoBruto > 0 ? ((fin.totalDespesasVar / fin.faturamentoBruto) * 100).toFixed(1).replace('.', ',') : '0,0'}%"`,
        `"(=) LUCRO LÍQUIDO FINAL DO PERÍODO";"${fin.lucroLiquidoReal.toFixed(2).replace('.', ',')}";"${fin.margemLiquidaPct.toFixed(1).replace('.', ',')}%"`
      ];

      sections.push([
        '\n--- 3. DEMONSTRATIVO FINANCEIRO CONSOLIDADO (DRE) ---',
        fHeaders.join(';'),
        ...fRows
      ].join('\n'));
    }

    // 4. Módulo de Estoque
    if (this.selectedReportModules.estoque) {
      const estoque = this.filteredReportData.estoque;
      const eHeaders = ['ID', 'Produto', 'SKU', 'Categoria', 'Bateria / Detalhes', 'Qtd em Estoque', 'Custo Unitário (R$)', 'Custo Total Investido (R$)', 'Preço Venda (R$)', 'Potencial de Faturamento (R$)', 'Lucro Projetado Total (R$)', 'Margem (%)'];
      const eRows = estoque.map(item => {
        const qtd = Number(item.quantidade || 0);
        const inv = Number(item.investimento || 0);
        const prc = Number(item.precoVenda || 0);
        const totalInv = inv * qtd;
        const totalPot = prc * qtd;
        const totalLuc = totalPot - totalInv;
        const margem = prc > 0 ? ((prc - inv) / prc) * 100 : 0;
        const batStr = item.bateria ? `${item.bateria}%` : (item.cor || 'Padrão');

        return [
          `"#${item.id}"`,
          `"${(item.nome || '').replace(/"/g, '""')}"`,
          `"${(item.sku || '').replace(/"/g, '""')}"`,
          `"${(item.categoria || '').replace(/"/g, '""')}"`,
          `"${batStr}"`,
          qtd,
          `"${inv.toFixed(2).replace('.', ',')}"`,
          `"${totalInv.toFixed(2).replace('.', ',')}"`,
          `"${prc.toFixed(2).replace('.', ',')}"`,
          `"${totalPot.toFixed(2).replace('.', ',')}"`,
          `"${totalLuc.toFixed(2).replace('.', ',')}"`,
          `"${margem.toFixed(1).replace('.', ',')}%"`
        ].join(';');
      });

      const eFooter = `TOTAL ESTOQUE;;;;;${fin.totalEstoqueQtd} un.;;${fin.totalEstoqueInvestido.toFixed(2).replace('.', ',')};;${fin.totalEstoquePotencial.toFixed(2).replace('.', ',')};${(fin.totalEstoquePotencial - fin.totalEstoqueInvestido).toFixed(2).replace('.', ',')};;`;

      sections.push([
        '\n--- 4. POSIÇÃO DE ESTOQUE & INVENTÁRIO ---',
        eHeaders.join(';'),
        ...eRows,
        eFooter
      ].join('\n'));
    }

    const csvFullContent = '\uFEFF' + sections.join('\n\n');
    const blob = new Blob([csvFullContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_garimpro_${periodClean}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showToast('Planilha Excel (.CSV) exportada com sucesso!', 'success');
  },

  /* ==========================================================================
     EXPORTAÇÃO IMPRESSÃO & PDF FORMATADO
     ========================================================================== */
  exportReportPDF() {
    const selected = this.getSelectedModulesList();
    if (selected.length === 0) {
      this.showToast('Selecione pelo menos um tipo de relatório para exportar em PDF.', 'warning');
      return;
    }

    const printContainer = document.getElementById('printReportDocument');
    if (!printContainer) return;

    const fin = this.filteredReportData.financeiro;
    const nowStr = new Date().toLocaleString('pt-BR');
    const userStr = MockData.user ? `${MockData.user.nome} ${MockData.user.sobrenome} (${MockData.user.cargo})` : 'Administrador';

    let html = `
      <div class="print-header">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h1 style="font-size:20pt; font-weight:900; margin:0; color:#0f172a; letter-spacing:-0.03em;">GARIMPRO</h1>
            <div style="font-size:9pt; color:#475569; font-weight:600;">Controle Financeiro, Vendas & Inteligência de Gestão</div>
          </div>
          <div style="text-align:right; font-size:8.5pt; color:#334155;">
            <div><strong>Emissão:</strong> ${nowStr}</div>
            <div><strong>Operador:</strong> ${userStr}</div>
            <div><strong>Período:</strong> <span style="color:#7c3aed; font-weight:700;">${this.reportPeriodLabel}</span></div>
          </div>
        </div>
      </div>

      <!-- Resumo Executivo KPIs -->
      <div class="print-kpi-grid">
        <div class="print-kpi-card">
          <div style="font-size:7.5pt; font-weight:700; color:#64748b; text-transform:uppercase;">Faturamento Bruto</div>
          <div style="font-size:12pt; font-weight:800; color:#0f172a;">R$ ${fin.faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div style="font-size:7.5pt; color:#475569;">${this.filteredReportData.vendas.length} pedidos no período</div>
        </div>
        <div class="print-kpi-card">
          <div style="font-size:7.5pt; font-weight:700; color:#64748b; text-transform:uppercase;">Custo Mercadorias (CMV)</div>
          <div style="font-size:12pt; font-weight:800; color:#0f172a;">R$ ${fin.cmvVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div style="font-size:7.5pt; color:#475569;">Custo direto das vendas</div>
        </div>
        <div class="print-kpi-card">
          <div style="font-size:7.5pt; font-weight:700; color:#64748b; text-transform:uppercase;">Despesas Operacionais</div>
          <div style="font-size:12pt; font-weight:800; color:#0f172a;">R$ ${fin.totalDespesasOperacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div style="font-size:7.5pt; color:#475569;">${this.filteredReportData.despesas.length} despesas auditadas</div>
        </div>
        <div class="print-kpi-card" style="border-color:#10b981; background:#f0fdf4;">
          <div style="font-size:7.5pt; font-weight:700; color:#059669; text-transform:uppercase;">Lucro Líquido Real</div>
          <div style="font-size:12pt; font-weight:800; color:#059669;">${fin.lucroLiquidoReal >= 0 ? '+' : ''} R$ ${fin.lucroLiquidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div style="font-size:7.5pt; color:#047857; font-weight:700;">Margem: ${fin.margemLiquidaPct.toFixed(1)}% líquida</div>
        </div>
      </div>
    `;

    // 1. Tabela de Vendas
    if (this.selectedReportModules.vendas) {
      const vendas = this.filteredReportData.vendas;
      html += `
        <div class="print-section">
          <div class="print-section-title">1. Relatório Detalhado de Vendas (${vendas.length} operações)</div>
          <table class="print-table">
            <thead>
              <tr>
                <th>Data / ID</th>
                <th>Cliente</th>
                <th>Canal</th>
                <th>Produto(s)</th>
                <th>Pagto</th>
                <th style="text-align:right;">Valor</th>
                <th style="text-align:right;">CMV</th>
                <th style="text-align:right;">Lucro</th>
                <th style="text-align:right;">Margem</th>
              </tr>
            </thead>
            <tbody>
              ${vendas.map(v => {
                const val = Number(v.valorTotal || 0);
                const luc = Number(v.lucro || 0);
                const cmv = Math.max(0, val - luc);
                const margem = val > 0 ? (luc / val) * 100 : 0;
                return `
                  <tr>
                    <td><strong>#${v.id}</strong> <span style="font-size:7pt; color:#64748b;">${v.data || 'Hoje'}</span></td>
                    <td>${v.cliente}</td>
                    <td>${v.plataforma}</td>
                    <td>${v.itens}</td>
                    <td>${v.pagamento || 'PIX'}</td>
                    <td style="text-align:right; font-weight:700;">R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style="text-align:right; color:#475569;">R$ ${cmv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style="text-align:right; color:#059669; font-weight:700;">+ R$ ${luc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style="text-align:right;">${margem.toFixed(1)}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5">TOTAL CONSOLIDADO EM VENDAS:</td>
                <td style="text-align:right;">R$ ${fin.faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="text-align:right;">R$ ${fin.cmvVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="text-align:right; color:#059669;">+ R$ ${(fin.faturamentoBruto - fin.cmvVendas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="text-align:right;">${fin.faturamentoBruto > 0 ? (((fin.faturamentoBruto - fin.cmvVendas) / fin.faturamentoBruto) * 100).toFixed(1) : 0}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    }

    // 2. Tabela de Despesas
    if (this.selectedReportModules.despesas) {
      const despesas = this.filteredReportData.despesas;
      html += `
        <div class="print-section">
          <div class="print-section-title">2. Relatório de Despesas Operacionais (${despesas.length} lançamentos)</div>
          <table class="print-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Descrição / Fornecedor</th>
                <th>Categoria</th>
                <th>Vencimento</th>
                <th>Forma Pagto</th>
                <th>Status</th>
                <th style="text-align:right;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${despesas.map(d => {
                const val = Number(d.valor || 0);
                return `
                  <tr>
                    <td>#${d.id}</td>
                    <td><strong>${d.tipo === 'fixa' ? 'Fixa' : 'Variável'}</strong></td>
                    <td>${d.descricao}</td>
                    <td>${d.categoria}</td>
                    <td>${d.data || d.dataVencimento || 'N/A'}</td>
                    <td>${d.formaPagamento || 'PIX'}</td>
                    <td>${d.status || 'Pago'}</td>
                    <td style="text-align:right; font-weight:700; color:#dc2626;">R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="7">TOTAL DE DESPESAS OPERACIONAIS:</td>
                <td style="text-align:right; color:#dc2626;">R$ ${fin.totalDespesasOperacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    }

    // 3. Demonstrativo DRE
    if (this.selectedReportModules.financeiro) {
      html += `
        <div class="print-section">
          <div class="print-section-title">3. Demonstrativo de Resultado do Exercício (DRE)</div>
          <table class="print-table">
            <thead>
              <tr>
                <th>Linha Contábil / Demonstrativo</th>
                <th style="text-align:right;">Valor Consolidado</th>
                <th style="text-align:right;">% s/ Receita Bruta</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>(=) Faturamento Bruto (Receita de Vendas)</strong></td>
                <td style="text-align:right; font-weight:700;">R$ ${fin.faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="text-align:right;">100,0%</td>
              </tr>
              <tr>
                <td style="padding-left:16px;">(-) Taxas de Intermediação / Marketplace</td>
                <td style="text-align:right; color:#dc2626;">- R$ ${fin.taxasPlataforma.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="text-align:right;">${fin.faturamentoBruto > 0 ? ((fin.taxasPlataforma / fin.faturamentoBruto) * 100).toFixed(1) : '0,0'}%</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td><strong>(=) Receita Operacional Líquida</strong></td>
                <td style="text-align:right; font-weight:700;">R$ ${fin.receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="text-align:right;">${fin.faturamentoBruto > 0 ? ((fin.receitaLiquida / fin.faturamentoBruto) * 100).toFixed(1) : '0,0'}%</td>
              </tr>
              <tr>
                <td style="padding-left:16px;">(-) Custo das Mercadorias Vendidas (CMV)</td>
                <td style="text-align:right; color:#dc2626;">- R$ ${fin.cmvVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="text-align:right;">${fin.faturamentoBruto > 0 ? ((fin.cmvVendas / fin.faturamentoBruto) * 100).toFixed(1) : '0,0'}%</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td><strong>(=) Lucro Bruto Operacional</strong></td>
                <td style="text-align:right; font-weight:700; color:#059669;">R$ ${fin.lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="text-align:right; color:#059669;">${fin.faturamentoBruto > 0 ? ((fin.lucroBruto / fin.faturamentoBruto) * 100).toFixed(1) : '0,0'}%</td>
              </tr>
              <tr>
                <td style="padding-left:16px;">(-) Despesas Fixas (Aluguel, Software, Contab.)</td>
                <td style="text-align:right; color:#dc2626;">- R$ ${fin.totalDespesasFixas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="text-align:right;">${fin.faturamentoBruto > 0 ? ((fin.totalDespesasFixas / fin.faturamentoBruto) * 100).toFixed(1) : '0,0'}%</td>
              </tr>
              <tr>
                <td style="padding-left:16px;">(-) Despesas Variáveis (Marketing, Logística, Combustível)</td>
                <td style="text-align:right; color:#dc2626;">- R$ ${fin.totalDespesasVar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="text-align:right;">${fin.faturamentoBruto > 0 ? ((fin.totalDespesasVar / fin.faturamentoBruto) * 100).toFixed(1) : '0,0'}%</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="background:#f0fdf4; border-top:2px solid #059669;">
                <td style="font-size:9.5pt; font-weight:900; color:#065f46;">(=) LUCRO LÍQUIDO FINAL DO PERÍODO:</td>
                <td style="text-align:right; font-size:10pt; font-weight:900; color:#059669;">${fin.lucroLiquidoReal >= 0 ? '+' : ''} R$ ${fin.lucroLiquidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="text-align:right; font-size:9.5pt; font-weight:900; color:#059669;">${fin.margemLiquidaPct.toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    }

    // 4. Tabela de Estoque
    if (this.selectedReportModules.estoque) {
      const estoque = this.filteredReportData.estoque;
      html += `
        <div class="print-section">
          <div class="print-section-title">4. Posição de Estoque & Inventário (${estoque.length} modelos cadastrados)</div>
          <table class="print-table">
            <thead>
              <tr>
                <th>Item / Modelo</th>
                <th>SKU</th>
                <th>Categoria</th>
                <th>Detalhes</th>
                <th style="text-align:center;">Qtd</th>
                <th style="text-align:right;">Custo Unit.</th>
                <th style="text-align:right;">Custo Total</th>
                <th style="text-align:right;">Preço Venda</th>
                <th style="text-align:right;">Potencial</th>
              </tr>
            </thead>
            <tbody>
              ${estoque.map(item => {
                const qtd = Number(item.quantidade || 0);
                const inv = Number(item.investimento || 0);
                const prc = Number(item.precoVenda || 0);
                const totalInv = inv * qtd;
                const totalPot = prc * qtd;
                const batStr = item.bateria ? `Bateria ${item.bateria}%` : (item.cor || '-');
                return `
                  <tr>
                    <td><strong>${item.nome}</strong></td>
                    <td>${item.sku || '-'}</td>
                    <td>${item.categoria || '-'}</td>
                    <td>${batStr}</td>
                    <td style="text-align:center; font-weight:700;">${qtd} un.</td>
                    <td style="text-align:right;">R$ ${inv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style="text-align:right; color:#475569;">R$ ${totalInv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style="text-align:right;">R$ ${prc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style="text-align:right; font-weight:700;">R$ ${totalPot.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4">TOTAL DO INVENTÁRIO EM ESTOQUE:</td>
                <td style="text-align:center;">${fin.totalEstoqueQtd} un.</td>
                <td></td>
                <td style="text-align:right;">R$ ${fin.totalEstoqueInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td></td>
                <td style="text-align:right; color:#059669;">R$ ${fin.totalEstoquePotencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    }

    html += `
      <div class="print-footer">
        <div>GarimPro • Relatório Gerencial de Inteligência & Decisão</div>
        <div>Documento confidencial gerado em ${nowStr}</div>
      </div>
    `;

    printContainer.innerHTML = html;

    this.showToast('Preparando visualização de impressão e salvamento em PDF...', 'info');
    setTimeout(() => {
      window.print();
    }, 350);
  },

  /* ==========================================================================
     COPIAR RESUMO EXECUTIVO (TEXTO FORMATADO)
     ========================================================================== */
  copyReportSummary() {
    const selected = this.getSelectedModulesList();
    if (selected.length === 0) {
      this.showToast('Selecione pelo menos um módulo para copiar o resumo.', 'warning');
      return;
    }

    const fin = this.filteredReportData.financeiro;
    const nowStr = new Date().toLocaleString('pt-BR');

    let text = `📊 RELATÓRIO EXECUTIVO - GARIMPRO\n`;
    text += `📅 Período: ${this.reportPeriodLabel}\n`;
    text += `⏱️ Gerado em: ${nowStr}\n`;
    text += `═══════════════════════════════════════\n\n`;

    if (this.selectedReportModules.vendas) {
      text += `🛍️ VENDAS & FATURAMENTO:\n`;
      text += `• Total de Operações: ${this.filteredReportData.vendas.length} pedidos\n`;
      text += `• Faturamento Bruto: R$ ${fin.faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      text += `• Custo CMV das Vendas: R$ ${fin.cmvVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`;
    }

    if (this.selectedReportModules.despesas) {
      text += `💸 DESPESAS OPERACIONAIS:\n`;
      text += `• Despesas Fixas: R$ ${fin.totalDespesasFixas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      text += `• Despesas Variáveis: R$ ${fin.totalDespesasVar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      text += `• Total de Custos/Despesas: R$ ${fin.totalDespesasOperacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`;
    }

    if (this.selectedReportModules.financeiro) {
      text += `📈 RESULTADO FINANCEIRO (DRE):\n`;
      text += `• Receita Operacional Líquida: R$ ${fin.receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      text += `• Lucro Bruto Operacional: R$ ${fin.lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      text += `• LUCRO LÍQUIDO REAL: ${fin.lucroLiquidoReal >= 0 ? '+' : ''} R$ ${fin.lucroLiquidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      text += `• Margem Líquida do Período: ${fin.margemLiquidaPct.toFixed(1)}%\n\n`;
    }

    if (this.selectedReportModules.estoque) {
      text += `📦 POSIÇÃO DE ESTOQUE:\n`;
      text += `• Unidades Disponíveis: ${fin.totalEstoqueQtd} produtos\n`;
      text += `• Capital Total Investido: R$ ${fin.totalEstoqueInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      text += `• Potencial de Venda: R$ ${fin.totalEstoquePotencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`;
    }

    text += `═══════════════════════════════════════\n`;
    text += `GarimPro • Sistema de Gestão Empresarial`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Resumo executivo copiado para a área de transferência!', 'success');
      }).catch(() => {
        this.showToast('Erro ao copiar texto.', 'error');
      });
    }
  },

  /* ==========================================================================
     EXPORTAÇÃO JSON ESTRUTURADO (BACKUP)
     ========================================================================== */
  exportReportJSON() {
    const selected = this.getSelectedModulesList();
    if (selected.length === 0) {
      this.showToast('Selecione pelo menos um módulo para exportar em JSON.', 'warning');
      return;
    }

    const payload = {
      meta: {
        sistema: 'GarimPro Gestão & Controle',
        versao: '2.0.0',
        dataGeracao: new Date().toISOString(),
        periodo: this.reportPeriodLabel,
        modulosSelecionados: selected
      },
      dados: {}
    };

    if (this.selectedReportModules.vendas) payload.dados.vendas = this.filteredReportData.vendas;
    if (this.selectedReportModules.despesas) payload.dados.despesas = this.filteredReportData.despesas;
    if (this.selectedReportModules.financeiro) payload.dados.financeiro = this.filteredReportData.financeiro;
    if (this.selectedReportModules.estoque) payload.dados.estoque = this.filteredReportData.estoque;

    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `garimpro_relatorio_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showToast('Arquivo de backup JSON exportado com sucesso!', 'success');
  },

  /* ==========================================================================
     MÓDULO DE SUGESTÕES & NOVAS IDEIAS
     ========================================================================== */
  suggestionsList: [],

  setupSuggestionsView() {
    // Carrega sugestões salvas ou inicia com exemplos reais
    const saved = localStorage.getItem('garimpa_suggestions');
    if (saved) {
      try {
        this.suggestionsList = JSON.parse(saved);
      } catch (e) {
        this.suggestionsList = [];
      }
    }

    if (!this.suggestionsList || this.suggestionsList.length === 0) {
      this.suggestionsList = [
        {
          id: 1,
          category: '💡 Nova Funcionalidade',
          title: 'Integração direta com Mercado Livre e Shopee',
          description: 'Sincronização automática de pedidos e estoque com baixa imediata em multicanais.',
          priority: 'Alta',
          votes: 12,
          date: '05/09/2026',
          status: 'Planejado'
        },
        {
          id: 2,
          category: '🚀 Otimização / Performance',
          title: 'Impressão térmica de etiquetas de envio com código de barras',
          description: 'Geração de etiquetas térmicas formato 10x15 com dados do cliente e endereço prontos para expedição.',
          priority: 'Média',
          votes: 8,
          date: '02/09/2026',
          status: 'Em Análise'
        },
        {
          id: 3,
          category: '⚙️ Automação & Configuração',
          title: 'Alerta de contas a pagar e vencer via WhatsApp',
          description: 'Disparo automático de lembrete com 2 dias de antecedência para não esquecer boletos.',
          priority: 'Alta',
          votes: 15,
          date: '28/08/2026',
          status: 'Em Desenvolvimento'
        }
      ];
      localStorage.setItem('garimpa_suggestions', JSON.stringify(this.suggestionsList));
    }

    this.renderSuggestionsList();

    const form = document.getElementById('formNewSuggestion');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const cat = document.getElementById('sugCategory')?.value;
        const prio = document.getElementById('sugPriority')?.value;
        const title = document.getElementById('sugTitle')?.value?.trim();
        const desc = document.getElementById('sugDescription')?.value?.trim();

        if (!title) {
          this.showToast('Por favor, informe o título da sugestão.', 'warning');
          return;
        }

        const newSug = {
          id: Date.now(),
          category: cat,
          title: title,
          description: desc,
          priority: prio,
          votes: 1,
          date: new Date().toLocaleDateString('pt-BR'),
          status: 'Registrado'
        };

        this.suggestionsList.unshift(newSug);
        localStorage.setItem('garimpa_suggestions', JSON.stringify(this.suggestionsList));
        this.renderSuggestionsList();
        form.reset();
        this.showToast('Sugestão registrada com sucesso! Obrigado por colaborar.', 'success');
      });
    }
  },

  renderSuggestionsList() {
    const container = document.getElementById('suggestionsListContainer');
    const badgeCount = document.getElementById('sugTotalCountBadge');

    if (badgeCount) {
      badgeCount.textContent = `${this.suggestionsList.length} ideias`;
    }

    if (!container) return;

    if (this.suggestionsList.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 36px; color: var(--text-tertiary); background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed var(--border-subtle);">
          Nenhuma sugestão registrada no momento. Use o formulário acima para registrar sua primeira ideia!
        </div>
      `;
      return;
    }

    container.innerHTML = this.suggestionsList.map(item => {
      let prioClass = 'badge-primary';
      if (item.priority === 'Alta') prioClass = 'badge-danger';
      else if (item.priority === 'Média') prioClass = 'badge-warning';

      return `
        <div class="card" style="padding: 16px 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 14px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.74rem; color: var(--primary-light); font-weight: 700;">${item.category}</span>
              <span class="badge ${prioClass}" style="font-size: 0.68rem; padding: 2px 7px;">${item.priority}</span>
            </div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0; line-height: 1.35;">${item.title}</h4>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0; line-height: 1.45;">${item.description || 'Sem descrição detalhada.'}</p>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; margin-top: 4px;">
            <div style="font-size: 0.72rem; color: var(--text-tertiary);">
              <span>${item.date}</span> • <span class="badge" style="background: rgba(255,255,255,0.06); font-size: 0.68rem;">${item.status || 'Registrado'}</span>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <button type="button" class="btn btn-secondary" onclick="App.voteSuggestion(${item.id})" style="padding: 4px 8px; font-size: 0.75rem; display: flex; align-items: center; gap: 4px;" title="Votar / Curtir ideia">
                <span>👍</span>
                <strong>${item.votes || 0}</strong>
              </button>
              <button type="button" class="btn btn-secondary" onclick="App.deleteSuggestion(${item.id})" style="padding: 4px 6px; font-size: 0.75rem; color: #f87171;" title="Excluir sugestão">
                ✕
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  voteSuggestion(id) {
    const sug = this.suggestionsList.find(s => s.id === id);
    if (sug) {
      sug.votes = (sug.votes || 0) + 1;
      localStorage.setItem('garimpa_suggestions', JSON.stringify(this.suggestionsList));
      this.renderSuggestionsList();
      this.showToast(`Você votou na ideia: "${sug.title}"`, 'success');
    }
  },

  deleteSuggestion(id) {
    this.suggestionsList = this.suggestionsList.filter(s => s.id !== id);
    localStorage.setItem('garimpa_suggestions', JSON.stringify(this.suggestionsList));
    this.renderSuggestionsList();
    this.showToast('Sugestão removida.', 'info');
  }
};

// Funções globais de disparo imediato para upload de imagem e miniatura
window.triggerProductImagePicker = function() {
  const input = document.getElementById("prodImageFile");
  if (input) {
    input.value = ""; // Garante que selecionar o mesmo arquivo re-dispare o onchange
    input.click();
  }
};

window.handleProductImageChange = function(input) {
  if (input && input.files && input.files[0]) {
    App.handleProductImageFile(input.files[0]);
  }
};

window.resetProductImageUpload = function(e) {
  App.resetProductImageUpload(e);
};

// Inicialização automática ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
