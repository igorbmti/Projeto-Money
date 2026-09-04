/**
 * Garimpa - Charts Engine (Pure HTML5 Canvas / Ultra-Performance)
 * Renderiza gráfico de barras com gradientes e gráficos donut totalmente responsivos
 * Protegido contra distorções e overflow de DPI em telas retina (iPhone/Android)
 */

const ChartsEngine = {
  activeBarTab: "faturamento",
  barCanvas: null,
  platformCanvas: null,
  paymentCanvas: null,

  init() {
    this.barCanvas = document.getElementById("canvasEvolution");
    this.platformCanvas = document.getElementById("canvasPlatformDonut");
    this.paymentCanvas = document.getElementById("canvasPaymentDonut");

    this.setupResizeListener();
    this.setupTabListeners();
    this.animateCharts();
  },

  setupResizeListener() {
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.renderBarChart(1);
        this.renderDonuts(1);
      }, 50);
    });

    // Evento de orientação do celular
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.renderBarChart(1);
        this.renderDonuts(1);
      }, 150);
    });
  },

  setupTabListeners() {
    const tabs = document.querySelectorAll(".chart-tab-btn");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        this.activeBarTab = tab.getAttribute("data-metric");
        this.animateCharts();
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

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  },

  /* ==========================================================================
     GRÁFICO DE BARRAS PRINCIPAL (EVOLUÇÃO FINANCEIRA)
     ========================================================================== */
  renderBarChart(progress = 1) {
    if (!this.barCanvas) return;
    const canvas = this.barCanvas;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const width = rect.width;
    const height = rect.height;

    // Ajuste da resolução interna do canvas multiplicada pelo DPR
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    // Ajuste estrito do estilo CSS do canvas para ocupar exatamente o container
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

    // Cores conforme a métrica ativa
    let gradientColors = {
      top: "#a855f7",
      bottom: "#6d28d9",
      glow: "rgba(168, 85, 247, 0.4)"
    };

    if (this.activeBarTab === "faturamento") {
      gradientColors = { top: "#c084fc", bottom: "#7c3aed", glow: "rgba(124, 58, 237, 0.45)" };
    } else if (this.activeBarTab === "investimento") {
      gradientColors = { top: "#60a5fa", bottom: "#2563eb", glow: "rgba(37, 99, 235, 0.45)" };
    } else if (this.activeBarTab === "despesas") {
      gradientColors = { top: "#f87171", bottom: "#dc2626", glow: "rgba(220, 38, 38, 0.45)" };
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
      ctx.fillText(labelY, padLeft - 6, yPos + 3);
    }

    // Renderização das Barras
    const numBars = dias.length;
    const barSpacing = chartW / numBars;
    const barWidth = Math.max(Math.min(barSpacing * 0.52, 20), 6);

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

      // Rótulos do Eixo X (Datas)
      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 9px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";

      if (isMobile) {
        // No celular, exibir a cada 3 dias para legibilidade perfeita sem encavalar
        if (idx === 0 || idx === 3 || idx === 7 || idx === numBars - 1) {
          ctx.fillText(dia, x + barWidth / 2, height - 6);
        }
      } else {
        ctx.fillText(dia, x + barWidth / 2, height - 8);
      }
    });
  },

  /* ==========================================================================
     GRÁFICOS DONUT (PLATAFORMAS & FORMAS DE PAGAMENTO)
     ========================================================================== */
  renderDonuts(progress = 1) {
    this.drawDonutChart(this.platformCanvas, MockData.plataformas, progress);
    this.drawDonutChart(this.paymentCanvas, MockData.formasPagamento, progress);
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
    const total = dataList.reduce((acc, item) => acc + item.percentual, 0);

    dataList.forEach(item => {
      const fullSliceAngle = (item.percentual / total) * (Math.PI * 2);
      const sliceAngle = fullSliceAngle * progress;
      const actualSlice = Math.max(sliceAngle - (sliceGap * progress), 0.02);
      const endAngle = startAngle + actualSlice;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.shadowColor = item.cor + "35";
      ctx.shadowBlur = 4;
      ctx.fillStyle = item.cor;
      ctx.fill();

      ctx.strokeStyle = "rgba(15, 20, 34, 0.8)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      startAngle += fullSliceAngle * progress;
    });
  }
};
