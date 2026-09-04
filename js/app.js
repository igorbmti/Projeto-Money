/**
 * Garimpa - Main Application Engine
 * Renderiza os dados dinâmicos, cálculos em tempo real e reatividade
 */

const App = {
  salesList: [...MockData.vendasRecentes],

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
                <div class="platform-progress-fill" style="width: ${p.percentual}%; background: ${p.cor}; box-shadow: 0 0 6px ${p.cor}80;"></div>
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
    const mobileList = document.getElementById("salesMobileCardList");
    const countLabel = document.getElementById("salesTotalCount");

    if (countLabel) {
      countLabel.textContent = `Mostrando ${list.length} de ${this.salesList.length} vendas`;
    }

    if (desktopTbody) {
      if (list.length === 0) {
        desktopTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--text-tertiary);">Nenhuma venda encontrada com os filtros aplicados.</td></tr>`;
      } else {
        desktopTbody.innerHTML = list.map(s => `
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
      }
    }

    if (mobileList) {
      if (list.length === 0) {
        mobileList.innerHTML = `<div style="text-align:center; padding:24px; color:var(--text-tertiary);">Nenhuma venda encontrada.</div>`;
      } else {
        mobileList.innerHTML = list.map(s => `
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
      }
    }
  },

  /* ==========================================================================
     FILTROS EM TEMPO REAL DA TABELA
     ========================================================================== */
  setupSalesFilters() {
    const searchInput = document.getElementById("salesSearchInput");
    const platformSelect = document.getElementById("salesPlatformFilter");
    const statusSelect = document.getElementById("salesStatusFilter");

    const applyFilters = () => {
      const search = (searchInput ? searchInput.value : "").toLowerCase().trim();
      const platform = platformSelect ? platformSelect.value : "all";
      const status = statusSelect ? statusSelect.value : "all";

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

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (platformSelect) platformSelect.addEventListener("change", applyFilters);
    if (statusSelect) statusSelect.addEventListener("change", applyFilters);
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
  }
};

// Inicialização automática ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
