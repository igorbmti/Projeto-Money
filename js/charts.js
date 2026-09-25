/**
 * Garimpa - Charts Engine (Pure HTML5 Canvas / Ultra-Performance)
 * Renderiza gráfico de barras com gradientes e gráficos donut totalmente responsivos
 * Protegido contra distorções e overflow de DPI em telas retina (iPhone/Android)
 */

const ChartsEngine = {
  activeBarTab: "faturamento",
  activeFinMetric: "faturamento",
  barCanvas: null,
  platformCanvas: null,
  paymentCanvas: null,
  finEvolutionCanvas: null,
  expensesDonutCanvas: null,

  init() {
    this.barCanvas = document.getElementById("canvasEvolution");
    this.platformCanvas = document.getElementById("canvasPlatformDonut");
    this.paymentCanvas = document.getElementById("canvasPaymentDonut");
    this.finPaymentCanvas = document.getElementById("canvasFinPaymentDonut");
    this.finEvolutionCanvas = document.getElementById("canvasFinancialEvolution");
    this.expensesDonutCanvas = document.getElementById("canvasExpensesDonut");

    this.setupResizeListener();
    this.setupTabListeners();
    this.setupFinTabListeners();
    this.animateCharts();
  },

  setupResizeListener() {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.renderBarChart(1);
        this.renderDonuts(1);
        this.renderFinancialCharts(1);
      }, 30);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", () => setTimeout(handleResize, 100));

    // ResizeObserver nos containers dos gráficos para adaptação instantânea a qualquer monitor
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => handleResize());
      document.querySelectorAll(".chart-canvas-container, .donut-canvas-wrapper, .donut-canvas-container").forEach(el => {
        observer.observe(el);
      });
    }
  },

  setupTabListeners() {
    const tabs = document.querySelectorAll(".chart-header-tabs .chart-tab-btn, .chart-tab-group:not(#finChartTabs) .chart-tab-btn");
    tabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const parent = tab.parentElement;
        if (parent) {
          parent.querySelectorAll(".chart-tab-btn").forEach(t => t.classList.remove("active"));
        } else {
          tabs.forEach(t => t.classList.remove("active"));
        }
        tab.classList.add("active");
        this.activeBarTab = tab.getAttribute("data-metric") || "faturamento";
        this.updateBottomMetrics(this.activeBarTab);
        this.animateSingleChart("bar");
      });
    });
  },

  updateBottomMetrics(metric = "faturamento") {
    const dataValues = (MockData && MockData.graficoEvolucao && MockData.graficoEvolucao[metric]) 
      ? MockData.graficoEvolucao[metric] 
      : (MockData && MockData.graficoEvolucao ? MockData.graficoEvolucao.faturamento : []);
    const dias = (MockData && MockData.graficoEvolucao && MockData.graficoEvolucao.dias) 
      ? MockData.graficoEvolucao.dias 
      : [];

    if (!dataValues || dataValues.length === 0) return;

    let maxVal = -Infinity;
    let maxIdx = 0;
    let sum = 0;
    dataValues.forEach((val, idx) => {
      sum += val;
      if (val > maxVal) {
        maxVal = val;
        maxIdx = idx;
      }
    });

    const avgVal = sum / dataValues.length;
    const maxDia = dias[maxIdx] ? `${dias[maxIdx]}/2026` : "20/08/2026";

    const elMaxDay = document.getElementById("dashboardChartMaxDay");
    const elMaxDayDate = document.getElementById("dashboardChartMaxDayDate");
    const elAvgDay = document.getElementById("dashboardChartAvgDay");
    const elGrowth = document.getElementById("dashboardChartGrowth");

    if (elMaxDay) elMaxDay.textContent = `R$ ${maxVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elMaxDayDate) elMaxDayDate.textContent = maxDia;
    if (elAvgDay) elAvgDay.textContent = `R$ ${avgVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    
    if (elGrowth) {
      if (metric === "despesas") {
        elGrowth.textContent = "-12,4%";
        elGrowth.style.color = "var(--danger, #f87171)";
      } else if (metric === "lucro") {
        elGrowth.textContent = "+28,4%";
        elGrowth.style.color = "var(--success, #34d399)";
      } else if (metric === "investimento") {
        elGrowth.textContent = "+15,2%";
        elGrowth.style.color = "var(--primary, #60a5fa)";
      } else {
        elGrowth.textContent = "+21,6%";
        elGrowth.style.color = "var(--success, #34d399)";
      }
    }
  },

  animateSingleChart(chartType) {
    const startTime = performance.now();
    const duration = 400;

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      if (chartType === "bar") {
        this.renderBarChart(eased);
      } else if (chartType === "fin") {
        this.renderFinancialEvolutionChart(eased);
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  },

  setupFinTabListeners() {
    const finTabs = document.querySelectorAll("#finChartTabs .fin-chart-tab");
    finTabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        finTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        this.activeFinMetric = tab.getAttribute("data-fin-metric") || "faturamento";
        this.animateSingleChart("fin");
      });
    });
  },

  animateCharts() {
    const startTime = performance.now();
    const duration = 500;

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      this.renderBarChart(eased);
      this.renderDonuts(eased);
      this.renderFinancialCharts(eased);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  },

  /* ==========================================================================
     GRÁFICO DE BARRAS PRINCIPAL (DASHBOARD - EVOLUÇÃO GERAL)
     ========================================================================== */
  renderBarChart(progress = 1) {
    if (!this.barCanvas) this.barCanvas = document.getElementById("canvasEvolution");
    if (!this.barCanvas) return;
    const canvas = this.barCanvas;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const width = rect.width;
    const height = rect.height;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    const ctx = canvas.getContext("2d");
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const isMobile = width < 480;
    const dias = MockData.graficoEvolucao.dias;
    const dataValues = MockData.graficoEvolucao[this.activeBarTab] || MockData.graficoEvolucao.faturamento;
    const maxVal = Math.max(...dataValues) * 1.15;

    const padLeft = isMobile ? 30 : 42;
    const padRight = isMobile ? 8 : 14;
    const padTop = 16;
    const padBottom = 26;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    if (chartW <= 0 || chartH <= 0) return;

    let gradientColors = {
      top: "#c084fc",
      bottom: "#7c3aed",
      glow: "rgba(124, 58, 237, 0.45)"
    };

    if (this.activeBarTab === "faturamento") {
      gradientColors = { top: "#c084fc", bottom: "#7c3aed", glow: "rgba(124, 58, 237, 0.45)" };
    } else if (this.activeBarTab === "lucro") {
      gradientColors = { top: "#34d399", bottom: "#059669", glow: "rgba(16, 185, 129, 0.45)" };
    } else if (this.activeBarTab === "investimento") {
      gradientColors = { top: "#60a5fa", bottom: "#2563eb", glow: "rgba(37, 99, 235, 0.45)" };
    } else if (this.activeBarTab === "despesas") {
      gradientColors = { top: "#f472b6", bottom: "#db2777", glow: "rgba(236, 72, 153, 0.45)" };
    }

    const steps = 4;
    ctx.font = "500 9px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "right";

    for (let i = 0; i <= steps; i++) {
      const yVal = (maxVal / steps) * i;
      const yPos = padTop + chartH - (i / steps) * chartH;

      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      ctx.moveTo(padLeft, yPos);
      ctx.lineTo(width - padRight, yPos);
      ctx.stroke();

      let labelY = "0";
      if (yVal >= 1000) {
        labelY = (yVal / 1000).toFixed(1) + "k";
      } else if (yVal > 0) {
        labelY = Math.round(yVal);
      }
      ctx.fillText(labelY, padLeft - 6, yPos + 3);
    }

    const numBars = dias.length;
    const barSpacing = chartW / numBars;
    const barWidth = Math.max(Math.min(barSpacing * 0.52, 28), 7);

    dias.forEach((dia, idx) => {
      const val = dataValues[idx];
      const barHeight = (val / maxVal) * chartH * progress;
      const x = padLeft + (idx * barSpacing) + (barSpacing - barWidth) / 2;
      const y = padTop + chartH - barHeight;

      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, gradientColors.top);
      gradient.addColorStop(1, gradientColors.bottom);

      ctx.save();
      ctx.beginPath();
      const r = Math.min(barWidth / 2, 5);
      ctx.moveTo(x, y + barHeight);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.lineTo(x + barWidth - r, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
      ctx.lineTo(x + barWidth, y + barHeight);
      ctx.closePath();

      ctx.shadowColor = gradientColors.glow;
      ctx.shadowBlur = 6;
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 9px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";

      if (isMobile) {
        if (idx === 0 || idx === 3 || idx === 7 || idx === numBars - 1) {
          ctx.fillText(dia, x + barWidth / 2, height - 6);
        }
      } else {
        ctx.fillText(dia, x + barWidth / 2, height - 8);
      }
    });
  },

  /* ==========================================================================
     GRÁFICOS DONUT (DASHBOARD)
     ========================================================================== */
  renderDonuts(progress = 1) {
    if (!this.platformCanvas) this.platformCanvas = document.getElementById("canvasPlatformDonut");
    if (!this.paymentCanvas) this.paymentCanvas = document.getElementById("canvasPaymentDonut");
    if (!this.finPaymentCanvas) this.finPaymentCanvas = document.getElementById("canvasFinPaymentDonut");

    this.drawDonutChart(this.platformCanvas, MockData.plataformas, progress);
    this.drawDonutChart(this.paymentCanvas, MockData.formasPagamento, progress);
    this.drawDonutChart(this.finPaymentCanvas, MockData.formasPagamento, progress);
  },

  drawDonutChart(canvas, dataList, progress = 1) {
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const width = rect.width;
    const height = rect.height;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    const ctx = canvas.getContext("2d");
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const size = Math.min(width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = (size / 2) - 3;
    const innerRadius = radius * 0.68;
    const sliceGap = 0.04;

    let startAngle = -Math.PI / 2;
    const total = dataList.reduce((acc, item) => acc + (Number(item.percentual) || Number(item.valor) || 0), 0);
    if (total === 0) return;

    dataList.forEach(item => {
      const itemVal = Number(item.percentual) || Number(item.valor) || 0;
      const fullSliceAngle = (itemVal / total) * (Math.PI * 2);
      const sliceAngle = fullSliceAngle * progress;
      const actualSlice = Math.max(sliceAngle - (sliceGap * progress), 0.02);
      const endAngle = startAngle + actualSlice;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.shadowColor = (item.cor || "#3b82f6") + "35";
      ctx.shadowBlur = 4;
      ctx.fillStyle = item.cor || "#3b82f6";
      ctx.fill();

      ctx.strokeStyle = "rgba(15, 20, 34, 0.8)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      startAngle += fullSliceAngle * progress;
    });
  },

  /* ==========================================================================
     GRÁFICOS EXECUTIVOS DA VISÃO FINANCEIRA (MOVIMENTAÇÃO & DESPESAS)
     ========================================================================== */
  renderFinancialCharts(progress = 1) {
    this.renderFinancialEvolutionChart(progress);
    this.renderExpensesDonutChart(progress);
  },

  renderFinancialEvolutionChart(progress = 1) {
    if (!this.finEvolutionCanvas) this.finEvolutionCanvas = document.getElementById("canvasFinancialEvolution");
    if (!this.finEvolutionCanvas) return;
    const canvas = this.finEvolutionCanvas;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const width = rect.width;
    const height = rect.height;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    const ctx = canvas.getContext("2d");
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const isMobile = width < 480;
    const dias = (MockData && MockData.graficoEvolucao && MockData.graficoEvolucao.dias) ? MockData.graficoEvolucao.dias : ["01/08", "04/08", "08/08", "12/08", "15/08", "18/08", "21/08", "24/08", "27/08", "30/08"];
    
    // Conjuntos de dados por métrica
    const datasets = {
      faturamento: [1200, 1850, 950, 2400, 1600, 3100, 2200, 1900, 2800, 2180],
      lucro: [380, 560, 240, 720, 480, 890, 560, 510, 780, 620],
      despesas: [140, 210, 120, 280, 180, 310, 190, 150, 240, 120],
      cmv: [680, 1080, 590, 1400, 940, 1900, 1450, 1240, 1780, 1440]
    };

    const metric = this.activeFinMetric || "faturamento";
    const values = datasets[metric] || datasets.faturamento;
    const maxVal = Math.max(...values, 100) * 1.18;

    const padLeft = isMobile ? 32 : 46;
    const padRight = isMobile ? 10 : 16;
    const padTop = 18;
    const padBottom = 28;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    if (chartW <= 0 || chartH <= 0) return;

    let colors = { top: "#60a5fa", bottom: "#2563eb", glow: "rgba(59, 130, 246, 0.45)" };
    if (metric === "faturamento") {
      colors = { top: "#c084fc", bottom: "#7c3aed", glow: "rgba(168, 85, 247, 0.45)" };
    } else if (metric === "lucro") {
      colors = { top: "#34d399", bottom: "#059669", glow: "rgba(16, 185, 129, 0.45)" };
    } else if (metric === "despesas") {
      colors = { top: "#f472b6", bottom: "#db2777", glow: "rgba(236, 72, 153, 0.45)" };
    } else if (metric === "cmv") {
      colors = { top: "#fb923c", bottom: "#d97706", glow: "rgba(245, 158, 11, 0.45)" };
    }

    // Linhas de Grade e Eixo Y
    const steps = 4;
    ctx.font = "500 9px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "right";

    for (let i = 0; i <= steps; i++) {
      const yVal = (maxVal / steps) * i;
      const yPos = padTop + chartH - (i / steps) * chartH;

      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      ctx.moveTo(padLeft, yPos);
      ctx.lineTo(width - padRight, yPos);
      ctx.stroke();

      let labelY = "0";
      if (yVal >= 1000) {
        labelY = (yVal / 1000).toFixed(1) + "k";
      } else if (yVal > 0) {
        labelY = Math.round(yVal);
      }
      ctx.fillText("R$ " + labelY, padLeft - 6, yPos + 3);
    }

    // Renderização das Barras Modernas com Cantos Arredondados
    const numBars = dias.length;
    const barSpacing = chartW / numBars;
    const barWidth = Math.max(Math.min(barSpacing * 0.54, 22), 6);

    dias.forEach((dia, idx) => {
      const val = values[idx] || 0;
      const barHeight = (val / maxVal) * chartH * progress;
      const x = padLeft + (idx * barSpacing) + (barSpacing - barWidth) / 2;
      const y = padTop + chartH - barHeight;

      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, colors.top);
      gradient.addColorStop(1, colors.bottom);

      ctx.save();
      ctx.beginPath();
      const r = Math.min(barWidth / 2, 5);
      ctx.moveTo(x, y + barHeight);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.lineTo(x + barWidth - r, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
      ctx.lineTo(x + barWidth, y + barHeight);
      ctx.closePath();

      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = 8;
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 9px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";

      if (isMobile) {
        if (idx === 0 || idx === 3 || idx === 7 || idx === numBars - 1) {
          ctx.fillText(dia, x + barWidth / 2, height - 8);
        }
      } else {
        ctx.fillText(dia, x + barWidth / 2, height - 8);
      }
    });
  },

  renderExpensesDonutChart(progress = 1) {
    if (!this.expensesDonutCanvas) this.expensesDonutCanvas = document.getElementById("canvasExpensesDonut");
    if (!this.expensesDonutCanvas) return;

    const expenses = (typeof App !== "undefined" && Array.isArray(App.expensesList) && App.expensesList.length > 0) 
      ? App.expensesList 
      : (typeof MockData !== "undefined" && Array.isArray(MockData.despesas) ? MockData.despesas : []);
    
    const getColorForCategory = (catName) => {
      const lower = (catName || "").toLowerCase();
      if (lower.includes("market") || lower.includes("ads") || lower.includes("anúncio") || lower.includes("anuncio") || lower.includes("tráfego") || lower.includes("trafego") || lower.includes("facebook") || lower.includes("meta")) return "#8b5cf6";
      if (lower.includes("aluguel") || lower.includes("ponto") || lower.includes("instalaç") || lower.includes("instalac") || lower.includes("imóvel")) return "#3b82f6";
      if (lower.includes("software") || lower.includes("saas") || lower.includes("ferramenta") || lower.includes("sistema")) return "#6366f1";
      if (lower.includes("gasolina") || lower.includes("combust") || lower.includes("uber") || lower.includes("transporte") || lower.includes("desloca")) return "#06b6d4";
      if (lower.includes("refeição") || lower.includes("refeicao") || lower.includes("alimenta") || lower.includes("almoço") || lower.includes("almoco") || lower.includes("lanche") || lower.includes("restaurante")) return "#f59e0b";
      if (lower.includes("reparo") || lower.includes("peça") || lower.includes("peca") || lower.includes("manuten") || lower.includes("conserto") || lower.includes("troca")) return "#c084fc";
      if (lower.includes("internet") || lower.includes("telefone") || lower.includes("fibra")) return "#10b981";
      if (lower.includes("contab") || lower.includes("juríd") || lower.includes("jurid") || lower.includes("fiscal")) return "#38bdf8";
      if (lower.includes("energia") || lower.includes("luz") || lower.includes("enel")) return "#eab308";
      if (lower.includes("embalag") || lower.includes("caixa") || lower.includes("sacola")) return "#f97316";
      if (lower.includes("frete") || lower.includes("motoboy") || lower.includes("entrega") || lower.includes("sedex")) return "#14b8a6";
      if (lower.includes("salário") || lower.includes("salario") || lower.includes("pró-labore")) return "#22c55e";
      return "#94a3b8";
    };

    const catTotals = {};
    let totalAll = 0;

    expenses.forEach(e => {
      const cat = e.categoria || "Outros Custos";
      const val = Number(e.valor || 0);
      catTotals[cat] = (catTotals[cat] || 0) + val;
      totalAll += val;
    });

    let chartData = [];
    if (totalAll === 0) {
      chartData = [
        { nome: "Aluguel & Ponto", valor: 1200, percentual: 45.8, cor: "#3b82f6" },
        { nome: "Marketing / Ads", valor: 450, percentual: 17.2, cor: "#8b5cf6" },
        { nome: "Contabilidade", valor: 350, percentual: 13.4, cor: "#38bdf8" },
        { nome: "SaaS / Softwares", valor: 190, percentual: 7.3, cor: "#6366f1" },
        { nome: "Gasolina / Uber", valor: 160, percentual: 6.1, cor: "#06b6d4" },
        { nome: "Internet & Luz", valor: 270, percentual: 10.2, cor: "#10b981" }
      ];
      totalAll = 2620;
    } else {
      chartData = Object.entries(catTotals).map(([cat, val]) => {
        return {
          nome: cat,
          valor: val,
          percentual: (val / totalAll) * 100,
          cor: getColorForCategory(cat)
        };
      }).sort((a, b) => b.valor - a.valor);
    }

    this.drawDonutChart(this.expensesDonutCanvas, chartData, progress);

    // Atualizar centro do Donut com formato conciso
    const centerTotalEl = document.getElementById("expDonutCenterTotal");
    if (centerTotalEl) {
      if (totalAll >= 1000) {
        centerTotalEl.textContent = `R$ ${(totalAll / 1000).toFixed(1)}k`;
      } else {
        centerTotalEl.textContent = `R$ ${totalAll.toFixed(0)}`;
      }
    }

    // Renderizar legenda dinâmica
    const legendContainer = document.getElementById("expenseDonutLegendList");
    if (legendContainer) {
      const topCategories = chartData.slice(0, 5);
      legendContainer.innerHTML = topCategories.map(c => `
        <div class="expense-legend-item">
          <div class="expense-legend-left">
            <span class="expense-legend-dot" style="background: ${c.cor}; box-shadow: 0 0 5px ${c.cor}66;"></span>
            <span class="expense-legend-name" title="${c.nome}">${c.nome}</span>
          </div>
          <div class="expense-legend-right">
            <span class="expense-legend-val">R$ ${c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            <span class="expense-legend-pct" style="color: ${c.cor}; font-weight: 700;">${c.percentual.toFixed(0)}%</span>
          </div>
        </div>
      `).join('');
    }
  }
};
