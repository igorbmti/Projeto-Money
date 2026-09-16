/**
 * Garimpa - Main Application Engine
 * Renderiza os dados dinâmicos, cálculos em tempo real e reatividade
 */

const App = {
  salesList: [...MockData.vendasRecentes],
  productsList: [...MockData.produtosCatalogo],
  expensesList: [...(MockData.despesas || [])],
  productsVisibleLimit: 5,
  currentCategoryFilter: 'all',
  currentSearchQuery: '',

  init() {
    this.renderKPIs();
    this.renderRanking();
    this.renderSalesTable(this.salesList);
    this.renderPaymentPills();
    this.renderPlatformLegends();
    this.renderNotifications();
    this.setupSalesFilters();
    this.setupNewSaleCalculator();
    this.setupNewSaleSubmit();
    this.setupScrollReveal();

    // Sincronização em tempo real com o Banco de Dados MySQL
    this.fetchDashboardFromDB();
    this.fetchSalesFromDB();
    this.fetchExpensesFromDB();

    // Módulo de Produtos & Estoque
    this.setupProductsEvents();
    this.setupNewProductForm();
    this.fetchProductsFromDB();

    // Módulo de Despesas (Fixas e Variáveis)
    this.setupExpensesEvents();

    // Módulo Financeiro, Investimentos & DRE
    this.renderFinancialView();

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
      : list.map(s => `
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
            <td class="col-items" title="${s.itens}">${s.itens}</td>
            <td><span class="badge badge-primary">${s.pagamento}</span></td>
            <td class="col-value">R$ ${s.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td class="col-profit">+R$ ${s.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td class="col-actions">
              <span class="badge ${s.statusClass}">${s.status}</span>
            </td>
          </tr>
        `).join('');

    if (desktopTbody) desktopTbody.innerHTML = tableHtml;
    if (historyDesktopTbody) historyDesktopTbody.innerHTML = tableHtml;

    const mobileHtml = list.length === 0
      ? `<div style="text-align:center; padding:24px; color:var(--text-tertiary);">Nenhuma venda encontrada.</div>`
      : list.map(s => `
          <div class="adaptive-data-card">
            <div class="adaptive-card-header">
              <span class="adaptive-card-id">#${s.id}</span>
              <span class="badge ${s.statusClass}">${s.status}</span>
            </div>
            <div class="adaptive-card-body">
              <div class="adaptive-client-info">
                <span class="adaptive-client-name">${s.cliente}</span>
                <span class="adaptive-order-items">${s.itens}</span>
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
        `).join('');

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
     CALCULADORA INTELIGENTE DO MODAL NOVA VENDA
     ========================================================================== */
  setupNewSaleCalculator() {
    const productSelect = document.getElementById("newSaleProduct");
    const qtyInput = document.getElementById("newSaleQty");
    const priceInput = document.getElementById("newSalePrice");
    const discountInput = document.getElementById("newSaleDiscount");
    const shippingInput = document.getElementById("newSaleShipping");

    const subtotalDisplay = document.getElementById("calcSubtotal");
    const profitDisplay = document.getElementById("calcProfit");
    const marginDisplay = document.getElementById("calcMargin");

    // Preencher produtos no select
    if (productSelect) {
      productSelect.innerHTML = `<option value="">Selecione um produto cadastrado...</option>` +
        MockData.produtosCatalogo.map(p => `
          <option value="${p.id}" data-price="${p.precoVenda}" data-cost="${p.custoMedio}">
            ${p.nome} (Estoque: ${p.estoque} un | R$ ${p.precoVenda.toFixed(2)})
          </option>
        `).join('');

      productSelect.addEventListener("change", () => {
        const selected = productSelect.options[productSelect.selectedIndex];
        if (selected && selected.dataset.price) {
          priceInput.value = parseFloat(selected.dataset.price).toFixed(2);
          recalc();
        }
      });
    }

    const recalc = () => {
      const selected = productSelect ? productSelect.options[productSelect.selectedIndex] : null;
      const unitCost = selected && selected.dataset.cost ? parseFloat(selected.dataset.cost) : 0;
      
      const qty = parseInt(qtyInput.value) || 1;
      const unitPrice = parseFloat(priceInput.value) || 0;
      const discount = parseFloat(discountInput.value) || 0;
      const shipping = parseFloat(shippingInput.value) || 0;

      const subtotal = (unitPrice * qty) - discount + shipping;
      const totalCost = (unitCost * qty);
      const netProfit = subtotal - totalCost;
      const margin = subtotal > 0 ? ((netProfit / subtotal) * 100) : 0;

      if (subtotalDisplay) subtotalDisplay.textContent = `R$ ${Math.max(subtotal, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      if (profitDisplay) profitDisplay.textContent = `+R$ ${Math.max(netProfit, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      if (marginDisplay) marginDisplay.textContent = `${margin.toFixed(1)}%`;
    };

    [qtyInput, priceInput, discountInput, shippingInput].forEach(el => {
      if (el) el.addEventListener("input", recalc);
    });
  },

  /* ==========================================================================
     SUBMIT DA NOVA VENDA
     ========================================================================== */
  setupNewSaleSubmit() {
    const form = document.getElementById("formNewSale");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const client = document.getElementById("newSaleClient").value || "Cliente Balcão";
      const productSelect = document.getElementById("newSaleProduct");
      const productName = productSelect.options[productSelect.selectedIndex].text.split("(")[0].trim() || "Produto Diverso";
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

      const totalVal = (unitPrice * qty) - discount + shipping;
      const profit = totalVal - (unitCost * qty);

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
        lucro: profit,
        status: "Concluído",
        statusClass: "badge-success",
        data: "Agora mesmo"
      };

      this.salesList.unshift(newSaleObj);
      this.renderSalesTable(this.salesList);

      // Atualizar Faturamento KPI
      MockData.kpis.faturamento.valor += totalVal;
      MockData.kpis.faturamento.formatado = `R$ ${MockData.kpis.faturamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      MockData.kpis.lucro.valor += profit;
      MockData.kpis.lucro.formatado = `R$ ${MockData.kpis.lucro.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      MockData.kpis.vendas.valor += 1;
      MockData.kpis.vendas.formatado = `${MockData.kpis.vendas.valor}`;
      this.renderKPIs();
      this.renderFinancialView();

      Navigation.closeModal("modalNewSale");
      this.showToast(`Venda #${newId} registrada com sucesso!`);
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
     MÓDULO DE PRODUTOS & ESTOQUE (VIEW 2)
     ========================================================================== */

  // Renderiza a lista de produtos em estoque (com paginação de 5 itens e KPIs)
  renderProductsView() {
    const container = document.getElementById("productsStockList");
    if (!container) return;

    // 1. Atualizar KPIs de Estoque
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

    // Card 1: Quantidade em Estoque
    const elQtd = document.getElementById("prodKpiTotalQtd");
    const elModelos = document.getElementById("prodKpiTotalModelos");
    const elEstoqueContext = document.getElementById("prodKpiEstoqueContext");

    if (elQtd) elQtd.textContent = `${totalQtd} un`;
    if (elModelos) elModelos.textContent = `${this.productsList.length} modelos`;
    if (elEstoqueContext) elEstoqueContext.textContent = "cadastrados";

    // Helper para extrair apenas o primeiro nome/modelo principal do equipamento (sem capacidade, cor ou ruídos)
    const getPrimaryProductName = (fullName) => {
      if (!fullName) return "--";
      let name = String(fullName).trim();

      // 1. Remove delimitadores com traço, barra ou pipe
      if (name.includes(" - ")) name = name.split(" - ")[0].trim();
      else if (name.includes(" | ")) name = name.split(" | ")[0].trim();
      else if (name.includes(" / ")) name = name.split(" / ")[0].trim();

      // 2. Remove indicação de capacidade e tudo que vem após (ex: "256GB", "128gb", "64 GB", "512 GB", "1TB", "2TB")
      name = name.replace(/[\s\-_,]*(16|32|64|128|256|512)\s*(GB|gb|Gb|gB).*$/i, '');
      name = name.replace(/[\s\-_,]*(1|2)\s*(TB|tb|Tb|tB).*$/i, '');
      name = name.replace(/\b(16|32|64|128|256|512)\s*(GB|gb)\b.*$/i, '');

      // 3. Remove cores comuns e sufixos extras
      name = name.replace(/[\s\-_,]*(Preto|Branco|Grafite|Azul|Verde|Dourado|Prateado|Roxo|Vermelho|Space Gray|Deep Purple|Midnight|Starlight|Meia-noite|Estelar|Branco Glacial|Phantom Black|Cinza|Gold|Silver).*$/i, '');
      name = name.replace(/[\s\-_,]*MagSafe.*$/i, '');

      return name.trim() || fullName;
    };

    // Card 2: Equipamento com Maior Retorno Financeiro
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
      if (elTopLucro) elTopLucro.textContent = "+R$ 0,00";
      if (elTopMargem) elTopMargem.textContent = "0% margem";
    }

    // Card 3: Equipamento Demorando Mais para Saída (Maior Tempo em Estoque)
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
      if (elSlowDias) elSlowDias.textContent = "0 dias";
      if (elSlowQtd) elSlowQtd.textContent = "0 un";
    }

    // Card 4: Equipamento com Baixa Lucratividade (Menor Margem Projetada)
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
      if (elLowMargem) elLowMargem.textContent = "0% margem";
      if (elLowDica) elLowDica.textContent = "sem dados";
    }

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
          this.salesList = json.data.map(v => ({
            id: v.codigo || `VEN-${v.id}`,
            cliente: v.cliente,
            plataforma: v.plataforma,
            itens: v.produto || 'Equipamento',
            qtdItens: 1,
            pagamento: v.formaPagamento || 'PIX',
            valorTotal: v.faturamento,
            lucro: v.lucro,
            status: v.status === 'CONCLUIDA' ? 'Concluído' : (v.status === 'PENDENTE' ? 'Pendente' : 'Cancelado'),
            statusClass: v.status === 'CONCLUIDA' ? 'badge-success' : (v.status === 'PENDENTE' ? 'badge-warning' : 'badge-danger'),
            data: v.dataVenda ? new Date(v.dataVenda).toLocaleDateString('pt-BR') : 'Hoje'
          }));
          this.renderSalesTable(this.salesList);
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
          this.expensesList = json.data.map(d => ({
            id: d.id,
            descricao: d.descricao,
            tipo: d.tipo ? d.tipo.toLowerCase() : 'fixa',
            valor: d.valor,
            categoria: d.categoria,
            status: d.status === 'PAGA' ? 'PAGO' : 'PENDENTE',
            dataVencimento: d.dataVencimento,
            data: d.dataCompetencia || d.dataVencimento,
            recorrente: d.recorrente == 1
          }));
          this.renderExpenses();
        }
      }
    } catch (e) {
      console.log('Utilizando despesas offline/estáticas');
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
     MÓDULO DE DESPESAS (FIXAS E VARIÁVEIS)
     ========================================================================== */
  setupExpensesEvents() {
    this.setupNewExpenseModal();
    this.setupExpenseSegmentTabs();
    this.renderExpenses();
  },

  setupExpenseSegmentTabs() {
    const tabs = document.querySelectorAll("[data-expense-tab]");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        this.currentExpenseTab = tab.getAttribute("data-expense-tab") || "all";
        this.applyExpenseTabFilter();
      });
    });
  },

  applyExpenseTabFilter() {
    const colFixed = document.getElementById("colFixedExpensesCard");
    const colVar = document.getElementById("colVariableExpensesCard");
    const currentTab = this.currentExpenseTab || "all";

    if (colFixed && colVar) {
      if (currentTab === "all") {
        colFixed.style.display = "flex";
        colVar.style.display = "flex";
      } else if (currentTab === "fixa") {
        colFixed.style.display = "flex";
        colVar.style.display = "none";
      } else if (currentTab === "variavel") {
        colFixed.style.display = "none";
        colVar.style.display = "flex";
      }
    }
  },

  renderExpenses() {
    const listFixedEl = document.getElementById("listFixedExpenses");
    const listVarEl = document.getElementById("listVariableExpenses");
    const badgeFixedCount = document.getElementById("badgeFixedCount");
    const badgeVarCount = document.getElementById("badgeVarCount");
    const colFixedTotal = document.getElementById("colFixedTotal");
    const colVarTotal = document.getElementById("colVarTotal");

    const kpiExpenseTotal = document.getElementById("kpiExpenseTotal");
    const kpiExpenseCount = document.getElementById("kpiExpenseCount");
    const kpiExpenseFixedTotal = document.getElementById("kpiExpenseFixedTotal");
    const kpiExpenseFixedCount = document.getElementById("kpiExpenseFixedCount");
    const kpiExpenseVarTotal = document.getElementById("kpiExpenseVarTotal");
    const kpiExpenseVarCount = document.getElementById("kpiExpenseVarCount");

    const tabExpenseTotalCount = document.getElementById("tabExpenseTotalCount");
    const tabExpenseFixedCount = document.getElementById("tabExpenseFixedCount");
    const tabExpenseVarCount = document.getElementById("tabExpenseVarCount");

    const fixas = this.expensesList.filter(e => e.tipo === "fixa");
    const variaveis = this.expensesList.filter(e => e.tipo === "variavel");

    const totalFixas = fixas.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
    const totalVar = variaveis.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
    const totalGeral = totalFixas + totalVar;

    // Atualizar Indicadores KPIs
    if (kpiExpenseTotal) kpiExpenseTotal.textContent = `R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (kpiExpenseCount) kpiExpenseCount.textContent = `${this.expensesList.length} despesas cadastradas`;
    if (kpiExpenseFixedTotal) kpiExpenseFixedTotal.textContent = `R$ ${totalFixas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (kpiExpenseFixedCount) kpiExpenseFixedCount.textContent = `${fixas.length} contas fixas`;
    if (kpiExpenseVarTotal) kpiExpenseVarTotal.textContent = `R$ ${totalVar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (kpiExpenseVarCount) kpiExpenseVarCount.textContent = `${variaveis.length} gastos variáveis`;

    if (badgeFixedCount) badgeFixedCount.textContent = fixas.length;
    if (badgeVarCount) badgeVarCount.textContent = variaveis.length;
    if (colFixedTotal) colFixedTotal.textContent = `R$ ${totalFixas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (colVarTotal) colVarTotal.textContent = `R$ ${totalVar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Atualizar Contadores das Abas de Segmentação
    if (tabExpenseTotalCount) tabExpenseTotalCount.textContent = this.expensesList.length;
    if (tabExpenseFixedCount) tabExpenseFixedCount.textContent = fixas.length;
    if (tabExpenseVarCount) tabExpenseVarCount.textContent = variaveis.length;

    // Sincronizar com o Painel Financeiro / DRE
    const dreDespesasVal = document.getElementById("dreDespesasVal");
    const dreLucroVal = document.getElementById("dreLucroVal");
    const kpiLucroVal = document.getElementById("kpiLucroVal");
    if (dreDespesasVal) dreDespesasVal.textContent = `R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    
    // Lucro Líquido = Receita (R$ 20.180,00) - Custos (R$ 15.460,50) - Despesas
    const receitaBruta = 20180.00;
    const custosCMV = 15460.50;
    const lucroLiquidoReal = Math.max(0, receitaBruta - custosCMV - totalGeral);
    if (dreLucroVal) dreLucroVal.textContent = `R$ ${lucroLiquidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (kpiLucroVal) kpiLucroVal.textContent = `R$ ${lucroLiquidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Renderizar Despesas Fixas
    if (listFixedEl) {
      if (fixas.length === 0) {
        listFixedEl.innerHTML = `
          <div class="expense-empty-state">
            <span>🏢 Nenhuma despesa fixa cadastrada.</span>
            <button type="button" class="btn btn-secondary btn-trigger-new-expense" style="font-size: 0.8rem; padding: 6px 14px;">+ Adicionar Despesa Fixa</button>
          </div>
        `;
      } else {
        listFixedEl.innerHTML = fixas.map(item => this.createExpenseItemHTML(item)).join('');
      }
    }

    // Renderizar Despesas Variáveis
    if (listVarEl) {
      if (variaveis.length === 0) {
        listVarEl.innerHTML = `
          <div class="expense-empty-state">
            <span>⚡ Nenhuma despesa variável cadastrada.</span>
            <button type="button" class="btn btn-secondary btn-trigger-new-expense" style="font-size: 0.8rem; padding: 6px 14px;">+ Adicionar Despesa Variável</button>
          </div>
        `;
      } else {
        listVarEl.innerHTML = variaveis.map(item => this.createExpenseItemHTML(item)).join('');
      }
    }

    this.applyExpenseTabFilter();
    this.renderFinancialView();
  },

  createExpenseItemHTML(item) {
    const isPago = item.status === 'pago';
    const isAVencer = item.status === 'avencer';
    const statusLabel = isPago ? 'Pago' : isAVencer ? 'A Vencer' : 'Pendente';
    const statusBadgeClass = isPago ? 'badge-success' : isAVencer ? 'badge-warning' : 'badge-danger';
    const isFixa = item.tipo === 'fixa';
    const iconBoxClass = isFixa ? 'fixed-badge' : 'var-badge';
    const icon = item.icone || this.getExpenseDefaultIcon(item.categoria, item.tipo);

    return `
      <div class="expense-item-card" data-expense-id="${item.id}" data-type="${item.tipo}">
        <div class="expense-item-main">
          <div class="expense-icon-box ${iconBoxClass}">
            ${icon}
          </div>
          <div class="expense-info">
            <div class="expense-name-row">
              <span class="expense-title" title="${item.descricao}">${item.descricao}</span>
              ${item.recorrente ? '<span class="expense-recur-tag">Recorrente</span>' : '<span class="expense-routine-tag">Variável</span>'}
            </div>
            <div class="expense-meta-row">
              <span class="expense-cat-pill">${item.categoria || (isFixa ? 'Geral' : 'Variável')}</span>
              <span class="expense-meta-bullet">•</span>
              <span class="expense-date-tag">${item.data || item.dataVencimento || 'Agosto/2026'}</span>
              ${item.formaPagamento ? `<span class="expense-meta-bullet">•</span><span class="expense-pay-pill">${item.formaPagamento}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="expense-item-right">
          <div class="expense-amount-box">
            <span class="expense-val">- R$ ${Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span class="badge ${statusBadgeClass} expense-status-pill">${statusLabel}</span>
          </div>
          <div class="expense-actions-menu">
            ${!isPago ? `
              <button type="button" class="expense-btn-action btn-pay-action" title="Marcar como Pago" onclick="App.toggleExpensePaid(${item.id})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            ` : ''}
            <button type="button" class="expense-btn-action btn-del-action" title="Excluir despesa" onclick="App.deleteExpense(${item.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  getExpenseDefaultIcon(categoria, tipo) {
    if (!categoria) return tipo === 'fixa' ? '🏢' : '⚡';
    const cat = categoria.toLowerCase();
    if (cat.includes('aluguel') || cat.includes('ponto')) return '🏢';
    if (cat.includes('internet') || cat.includes('tel')) return '🌐';
    if (cat.includes('software') || cat.includes('saas') || cat.includes('sistema')) return '💻';
    if (cat.includes('luz') || cat.includes('energia')) return '⚡';
    if (cat.includes('água') || cat.includes('saneamento')) return '💧';
    if (cat.includes('conta') || cat.includes('juríd')) return '📑';
    if (cat.includes('salário') || cat.includes('pró-labore')) return '👥';
    if (cat.includes('gasolina') || cat.includes('combust')) return '⛽';
    if (cat.includes('refeição') || cat.includes('almoço') || cat.includes('alimen')) return '🍽️';
    if (cat.includes('pedágio') || cat.includes('estaciona')) return '🛣️';
    if (cat.includes('embalag') || cat.includes('caixa')) return '📦';
    if (cat.includes('frete') || cat.includes('correio') || cat.includes('entrega')) return '🚚';
    if (cat.includes('manuten') || cat.includes('peça')) return '🔧';
    if (cat.includes('market') || cat.includes('ads') || cat.includes('anúncio')) return '📢';
    return tipo === 'fixa' ? '🏢' : '⚡';
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
      { label: "Aluguel & Ponto Comercial", icon: "🏢" },
      { label: "Internet Fibra & Telefonia", icon: "🌐" },
      { label: "Ferramentas & Softwares SaaS", icon: "💻" },
      { label: "Energia Elétrica", icon: "⚡" },
      { label: "Água & Saneamento", icon: "💧" },
      { label: "Contabilidade & Jurídico", icon: "📑" },
      { label: "Salários & Encargos", icon: "👥" },
      { label: "Segurança & Monitoramento", icon: "🛡️" },
      { label: "Outras Despesas Fixas", icon: "📌" }
    ];

    const categoriesVar = [
      { label: "Gasolina & Combustível", icon: "⛽" },
      { label: "Refeição & Alimentação", icon: "🍽️" },
      { label: "Pedágio & Estacionamento", icon: "🛣️" },
      { label: "Embalagens & Logística", icon: "📦" },
      { label: "Fretes & Entregas Expressas", icon: "🚚" },
      { label: "Marketing, Tráfego & Ads", icon: "📢" },
      { label: "Manutenção & Consertos", icon: "🔧" },
      { label: "Taxas & Imprevistos", icon: "⚠️" },
      { label: "Outras Despesas Variáveis", icon: "🏷️" }
    ];

    const populateCategories = (type) => {
      if (!catSelect) return;
      const list = type === 'fixa' ? categoriesFixed : categoriesVar;
      catSelect.innerHTML = list.map(c => `
        <option value="${c.label}">${c.icon} ${c.label}</option>
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
        this.renderExpenses();
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

  deleteExpense(id) {
    const idx = this.expensesList.findIndex(e => e.id == id);
    if (idx !== -1) {
      const deleted = this.expensesList.splice(idx, 1)[0];
      this.renderExpenses();
      this.showToast(`Despesa "${deleted.descricao}" removida.`);
    }
  },

  toggleExpensePaid(id) {
    const item = this.expensesList.find(e => e.id == id);
    if (item) {
      item.status = "pago";
      this.renderExpenses();
      this.showToast(`✨ Despesa "${item.descricao}" marcada como paga!`);
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
    const cmvTotal = Math.max(0, faturamentoBruto - lucroBrutoVendas);
    const taxasPlataforma = faturamentoBruto * 0.03865; // ~3.8% taxas médias
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

    // 4. Cálculos de Estoque e Capital Investido
    const capitalEstoque = this.productsList.reduce((acc, p) => acc + (Number(p.investimento || 0) * Number(p.quantidade || 0)), 0);
    const potencialVendaEstoque = this.productsList.reduce((acc, p) => acc + (Number(p.precoVenda || 0) * Number(p.quantidade || 0)), 0);
    const totalUnidadesEstoque = this.productsList.reduce((acc, p) => acc + Number(p.quantidade || 0), 0);
    const lucroProjetadoEstoque = Math.max(0, potencialVendaEstoque - capitalEstoque);
    
    // Capital Total Investido = Capital em Estoque + CMV Realizado + Despesas
    const capitalTotalInvestido = capitalEstoque + cmvTotal + totalDespesas;
    const custoOperacionalTotal = cmvTotal + totalDespesas;
    
    // ROI Geral (%) = Retorno sobre o investimento
    const roiGeral = custoOperacionalTotal > 0 ? ((lucroLiquidoReal / custoOperacionalTotal) * 100) : 34.8;
    const markupMedio = cmvTotal > 0 ? (faturamentoBruto / cmvTotal) : 1.35;

    // 5. Contas a Receber e Caixa
    const contasAReceber = 4250.00;
    const saldoCaixa = faturamentoBruto;
    const capitalTotalDistribuido = capitalEstoque + contasAReceber + saldoCaixa;
    const pctEstoque = capitalTotalDistribuido > 0 ? ((capitalEstoque / capitalTotalDistribuido) * 100) : 78.5;
    const pctReceber = capitalTotalDistribuido > 0 ? ((contasAReceber / capitalTotalDistribuido) * 100) : 6.2;
    const pctCaixa = capitalTotalDistribuido > 0 ? ((saldoCaixa / capitalTotalDistribuido) * 100) : 15.3;

    // 6. Atualizar Top KPIs
    const elTotalInvested = document.getElementById("finKpiTotalInvested");
    const elInvestedSub = document.getElementById("finKpiInvestedSub");
    const elNetProfit = document.getElementById("finKpiNetProfit");
    const elMarginSub = document.getElementById("finKpiMarginSub");
    const elRoiVal = document.getElementById("finKpiRoiVal");
    const elProjectedProfit = document.getElementById("finKpiProjectedProfit");
    const elStockPotentialSub = document.getElementById("finKpiStockPotentialSub");

    if (elTotalInvested) elTotalInvested.textContent = `R$ ${capitalTotalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elInvestedSub) elInvestedSub.textContent = `Estoque R$ ${Math.round(capitalEstoque).toLocaleString('pt-BR')} + Op. R$ ${Math.round(custoOperacionalTotal).toLocaleString('pt-BR')}`;
    if (elNetProfit) elNetProfit.textContent = `R$ ${lucroLiquidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elMarginSub) elMarginSub.textContent = `Margem Líquida Real: ${margemLiquidaPct.toFixed(1)}%`;
    if (elRoiVal) elRoiVal.textContent = `${roiGeral.toFixed(1)}%`;
    if (elProjectedProfit) elProjectedProfit.textContent = `R$ ${lucroProjetadoEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elStockPotentialSub) elStockPotentialSub.textContent = `Potencial: R$ ${potencialVendaEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // 7. Atualizar Linhas da DRE
    const elDreReceita = document.getElementById("dreRowReceitaBruta");
    const elDreTaxas = document.getElementById("dreRowTaxas");
    const elDreTaxasPct = document.getElementById("dreRowTaxasPct");
    const elDreReceitaLiq = document.getElementById("dreRowReceitaLiquida");
    const elDreReceitaLiqPct = document.getElementById("dreRowReceitaLiquidaPct");
    const elDreCMV = document.getElementById("dreRowCMV");
    const elDreCMVPct = document.getElementById("dreRowCMVPct");
    const elDreLucroBruto = document.getElementById("dreRowLucroBruto");
    const elDreMargemBrutaPct = document.getElementById("dreRowMargemBrutaPct");
    const elDreDespesasFixas = document.getElementById("dreRowDespesasFixas");
    const elDreFixedPct = document.getElementById("dreRowFixedPct");
    const elDreDespesasVar = document.getElementById("dreRowDespesasVar");
    const elDreVarPct = document.getElementById("dreRowVarPct");
    const elDreLucroLiquidoFinal = document.getElementById("dreRowLucroLiquidoFinal");
    const elDreMargemFinalPct = document.getElementById("dreRowMargemFinalPct");
    const elDreSalesCountMeta = document.getElementById("dreRowSalesCountMeta");

    // Barras DRE
    const barTaxas = document.getElementById("dreBarTaxas");
    const barReceitaLiq = document.getElementById("dreBarReceitaLiquida");
    const barCMV = document.getElementById("dreBarCMV");
    const barLucroBruto = document.getElementById("dreBarLucroBruto");
    const barDespesasFixas = document.getElementById("dreBarDespesasFixas");
    const barDespesasVar = document.getElementById("dreBarDespesasVar");
    const barLucroLiquido = document.getElementById("dreBarLucroLiquido");

    if (elDreReceita) elDreReceita.textContent = `R$ ${faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elDreSalesCountMeta) elDreSalesCountMeta.textContent = `${totalVendas} vendas realizadas nos canais`;
    if (elDreTaxas) elDreTaxas.textContent = `- R$ ${taxasPlataforma.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elDreTaxasPct) elDreTaxasPct.textContent = `${((taxasPlataforma / faturamentoBruto) * 100).toFixed(1)}% da Receita`;
    if (barTaxas) barTaxas.style.width = `${Math.min(100, (taxasPlataforma / faturamentoBruto) * 100)}%`;

    if (elDreReceitaLiq) elDreReceitaLiq.textContent = `R$ ${receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elDreReceitaLiqPct) elDreReceitaLiqPct.textContent = `${((receitaLiquida / faturamentoBruto) * 100).toFixed(1)}%`;
    if (barReceitaLiq) barReceitaLiq.style.width = `${Math.min(100, (receitaLiquida / faturamentoBruto) * 100)}%`;

    if (elDreCMV) elDreCMV.textContent = `- R$ ${cmvTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elDreCMVPct) elDreCMVPct.textContent = `${((cmvTotal / faturamentoBruto) * 100).toFixed(1)}% da Receita`;
    if (barCMV) barCMV.style.width = `${Math.min(100, (cmvTotal / faturamentoBruto) * 100)}%`;

    if (elDreLucroBruto) elDreLucroBruto.textContent = `R$ ${lucroBrutoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elDreMargemBrutaPct) elDreMargemBrutaPct.textContent = `Margem Bruta: ${margemBrutaPct.toFixed(1)}%`;
    if (barLucroBruto) barLucroBruto.style.width = `${Math.min(100, margemBrutaPct)}%`;

    if (elDreDespesasFixas) elDreDespesasFixas.textContent = `- R$ ${totalFixas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elDreFixedPct) elDreFixedPct.textContent = `${((totalFixas / faturamentoBruto) * 100).toFixed(1)}% da Receita`;
    if (barDespesasFixas) barDespesasFixas.style.width = `${Math.min(100, (totalFixas / faturamentoBruto) * 100)}%`;

    if (elDreDespesasVar) elDreDespesasVar.textContent = `- R$ ${totalVar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elDreVarPct) elDreVarPct.textContent = `${((totalVar / faturamentoBruto) * 100).toFixed(1)}% da Receita`;
    if (barDespesasVar) barDespesasVar.style.width = `${Math.min(100, (totalVar / faturamentoBruto) * 100)}%`;

    if (elDreLucroLiquidoFinal) elDreLucroLiquidoFinal.textContent = `R$ ${lucroLiquidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elDreMargemFinalPct) elDreMargemFinalPct.textContent = `Margem Líquida Real: ${margemLiquidaPct.toFixed(1)}%`;
    if (barLucroLiquido) barLucroLiquido.style.width = `${Math.min(100, margemLiquidaPct)}%`;

    // 8. Atualizar Alocação de Capital
    const elCapEstoqueVal = document.getElementById("capAllocEstoqueVal");
    const elCapEstoquePct = document.getElementById("capAllocEstoquePct");
    const elCapReceberVal = document.getElementById("capAllocReceberVal");
    const elCapReceberPct = document.getElementById("capAllocReceberPct");
    const elCapCaixaVal = document.getElementById("capAllocCaixaVal");
    const elCapCaixaPct = document.getElementById("capAllocCaixaPct");
    const elCapEstoqueSub = document.getElementById("capEstoqueSubText");

    const segEstoque = document.getElementById("capSegEstoque");
    const segReceber = document.getElementById("capSegReceber");
    const segCaixa = document.getElementById("capSegCaixa");

    if (elCapEstoqueVal) elCapEstoqueVal.textContent = `R$ ${capitalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elCapEstoquePct) elCapEstoquePct.textContent = `${pctEstoque.toFixed(1)}%`;
    if (elCapEstoqueSub) elCapEstoqueSub.textContent = `${totalUnidadesEstoque} unidades compradas disponíveis`;
    if (segEstoque) {
      segEstoque.style.width = `${pctEstoque.toFixed(1)}%`;
      segEstoque.title = `Estoque: ${pctEstoque.toFixed(1)}%`;
    }

    if (elCapReceberVal) elCapReceberVal.textContent = `R$ ${contasAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elCapReceberPct) elCapReceberPct.textContent = `${pctReceber.toFixed(1)}%`;
    if (segReceber) {
      segReceber.style.width = `${pctReceber.toFixed(1)}%`;
      segReceber.title = `A Receber: ${pctReceber.toFixed(1)}%`;
    }

    if (elCapCaixaVal) elCapCaixaVal.textContent = `R$ ${saldoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elCapCaixaPct) elCapCaixaPct.textContent = `${pctCaixa.toFixed(1)}%`;
    if (segCaixa) {
      segCaixa.style.width = `${pctCaixa.toFixed(1)}%`;
      segCaixa.title = `Caixa: ${pctCaixa.toFixed(1)}%`;
    }

    // 9. Atualizar Indicadores de Eficiência
    const elTicketMedio = document.getElementById("finMetricTicketMedio");
    const elLucroMedio = document.getElementById("finMetricLucroMedio");
    if (elTicketMedio && totalVendas > 0) elTicketMedio.textContent = `R$ ${(faturamentoBruto / totalVendas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elLucroMedio && totalVendas > 0) elLucroMedio.textContent = `R$ ${(lucroBrutoVendas / totalVendas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // 10. Renderizar Tabela de Rentabilidade por Venda
    this.renderFinancialSalesTable();
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
