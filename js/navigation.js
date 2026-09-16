/**
 * Garimpa - Navigation & UI Manager
 * Gerencia Drawer, Sidebar, Navegação SPA por Abas/Páginas, Modais e Temas
 */

const Navigation = {
  currentView: "dashboard",

  init() {
    this.setupSidebarAndDrawer();
    this.setupViewNavigation();
    this.setupDropdowns();
    this.setupThemeToggle();
    this.setupModals();
  },

  /* ==========================================================================
     DRAWER & SIDEBAR
     ========================================================================== */
  setupSidebarAndDrawer() {
    const btnMenuToggle = document.getElementById("btnMenuToggle");
    const btnSidebarClose = document.getElementById("btnSidebarClose");
    const btnBottomNavMenu = document.getElementById("btnBottomNavMenu");
    const sidebar = document.getElementById("appSidebar");
    const backdrop = document.getElementById("drawerBackdrop");

    const openDrawer = () => {
      if (sidebar) sidebar.classList.add("open");
      if (backdrop) backdrop.classList.add("active");
      document.body.style.overflow = "hidden";
    };

    const closeDrawer = () => {
      if (sidebar) sidebar.classList.remove("open");
      if (backdrop) backdrop.classList.remove("active");
      document.body.style.overflow = "";
    };

    const toggleDrawer = () => {
      if (sidebar && sidebar.classList.contains("open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    };

    if (btnMenuToggle) {
      btnMenuToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDrawer();
      });
    }

    if (btnSidebarClose) {
      btnSidebarClose.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeDrawer();
      });
    }

    if (btnBottomNavMenu) {
      btnBottomNavMenu.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDrawer();
      });
    }

    // Suporte a qualquer outro gatilho de abertura do drawer
    document.querySelectorAll('[data-action="toggle-sidebar"]').forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDrawer();
      });
    });

    if (backdrop) {
      backdrop.addEventListener("click", () => {
        closeDrawer();
      });
    }

    // Fechar ao pressionar a tecla ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar && sidebar.classList.contains("open")) {
        closeDrawer();
      }
    });

    this.openDrawer = openDrawer;
    this.closeDrawer = closeDrawer;
    this.toggleDrawer = toggleDrawer;
  },

  /* ==========================================================================
     ROTEADOR DE VIEWS / TELAS (SPA FLUIDA)
     ========================================================================== */
  setupViewNavigation() {
    const navLinks = document.querySelectorAll("[data-nav-view]");
    const bottomNavItems = document.querySelectorAll(".bottom-nav-item");

    const switchView = (targetView) => {
      if (!targetView) return;
      this.currentView = targetView;

      // Atualizar links na Sidebar
      document.querySelectorAll(".nav-item").forEach(item => {
        const link = item.querySelector("[data-nav-view]");
        if (link && link.getAttribute("data-nav-view") === targetView) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });

      // Atualizar Bottom Nav
      const primaryBottomViews = ["dashboard", "vendas", "relatorios"];
      bottomNavItems.forEach(item => {
        const view = item.getAttribute("data-nav-view");
        if (view && view === targetView) {
          item.classList.add("active");
        } else if (!item.hasAttribute("data-action")) {
          item.classList.remove("active");
        }
      });

      // Se for uma tela do menu (produtos, estoque, financeiro, despesas, configuracoes), ativa o indicador no Menu
      const btnBottomNavMenu = document.getElementById("btnBottomNavMenu");
      if (btnBottomNavMenu) {
        if (!primaryBottomViews.includes(targetView)) {
          btnBottomNavMenu.classList.add("active");
        } else {
          btnBottomNavMenu.classList.remove("active");
        }
      }

      // Alternar visualizações no DOM
      document.querySelectorAll(".page-view").forEach(view => {
        if (view.id === `view-${targetView}`) {
          view.style.display = "flex";
        } else {
          view.style.display = "none";
        }
      });

      // Fechar Drawer em mobile se estiver aberto
      if (typeof this.closeDrawer === "function") {
        this.closeDrawer();
      } else {
        const sidebar = document.getElementById("appSidebar");
        const backdrop = document.getElementById("drawerBackdrop");
        if (sidebar) sidebar.classList.remove("open");
        if (backdrop) backdrop.classList.remove("active");
        document.body.style.overflow = "";
      }

      // Re-renderizar gráficos se for para a view do dashboard
      if (targetView === "dashboard" && typeof ChartsEngine !== "undefined") {
        setTimeout(() => {
          if (ChartsEngine.renderBarChart) ChartsEngine.renderBarChart(1);
          if (ChartsEngine.renderDonuts) ChartsEngine.renderDonuts(1);
        }, 50);
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        link.blur();
        if (window.getSelection) {
          window.getSelection().removeAllRanges();
        }
        const targetView = link.getAttribute("data-nav-view");
        if (targetView) switchView(targetView);
      });
    });

    bottomNavItems.forEach(item => {
      item.addEventListener("click", (e) => {
        const targetView = item.getAttribute("data-nav-view");
        if (targetView) {
          e.preventDefault();
          switchView(targetView);
        }
      });
    });

    this.switchView = switchView;
  },

  /* ==========================================================================
     DROPDOWNS & NOTIFICAÇÕES
     ========================================================================== */
  setupDropdowns() {
    // Seletor de Período
    const btnPeriod = document.getElementById("btnPeriodDropdown");
    const menuPeriod = document.getElementById("periodDropdownMenu");
    const periodLabel = document.getElementById("currentPeriodLabel");

    if (btnPeriod && menuPeriod) {
      btnPeriod.addEventListener("click", (e) => {
        e.stopPropagation();
        menuPeriod.classList.toggle("show");
        // Fechar notificações se abertas
        const notifPanel = document.getElementById("notificationPanel");
        if (notifPanel) notifPanel.classList.remove("show");
      });

      menuPeriod.querySelectorAll(".period-option").forEach(opt => {
        opt.addEventListener("click", () => {
          menuPeriod.querySelectorAll(".period-option").forEach(o => o.classList.remove("active"));
          opt.classList.add("active");
          if (periodLabel) periodLabel.textContent = opt.textContent.trim();
          menuPeriod.classList.remove("show");
          App.showToast(`Período alterado para: ${opt.textContent.trim()}`);
        });
      });
    }

    // Painel de Notificações
    const btnNotif = document.getElementById("btnNotifications");
    const panelNotif = document.getElementById("notificationPanel");

    if (btnNotif && panelNotif) {
      btnNotif.addEventListener("click", (e) => {
        e.stopPropagation();
        panelNotif.classList.toggle("show");
        if (menuPeriod) menuPeriod.classList.remove("show");
      });
    }

    // Fechar dropdowns ao clicar fora
    document.addEventListener("click", () => {
      if (menuPeriod) menuPeriod.classList.remove("show");
      if (panelNotif) panelNotif.classList.remove("show");
    });
  },

  /* ==========================================================================
     TEMA DARK / LIGHT
     ========================================================================== */
  setupThemeToggle() {
    const btnTheme = document.getElementById("btnThemeToggle");
    const themeIcon = document.getElementById("themeIcon");

    const savedTheme = localStorage.getItem("garimpa_theme");
    if (savedTheme === "light") {
      document.body.classList.add("light-theme");
      if (themeIcon) themeIcon.textContent = "☀️";
    }

    if (btnTheme) {
      btnTheme.addEventListener("click", () => {
        const isLight = document.body.classList.toggle("light-theme");
        localStorage.setItem("garimpa_theme", isLight ? "light" : "dark");
        if (themeIcon) themeIcon.textContent = isLight ? "☀️" : "🌙";
        // Re-desenhar gráficos para contraste
        setTimeout(() => {
          ChartsEngine.renderBarChart(1);
          ChartsEngine.renderDonuts(1);
        }, 50);
      });
    }
  },

  /* ==========================================================================
     MODAIS (NOVA VENDA, DETALHES, NOVA DESPESA)
     ========================================================================== */
  setupModals() {
    // Abertura de Nova Venda
    const btnNewSaleTriggers = document.querySelectorAll(".btn-trigger-new-sale");
    btnNewSaleTriggers.forEach(btn => {
      btn.addEventListener("click", () => {
        this.openModal("modalNewSale");
      });
    });

    // Abertura de Novo Produto
    const btnNewProdTriggers = document.querySelectorAll(".btn-trigger-new-product");
    btnNewProdTriggers.forEach(btn => {
      btn.addEventListener("click", () => {
        this.openModal("modalNewProduct");
      });
    });

    // Abertura de Nova Despesa
    const btnNewExpenseTriggers = document.querySelectorAll(".btn-trigger-new-expense");
    btnNewExpenseTriggers.forEach(btn => {
      btn.addEventListener("click", () => {
        this.openModal("modalNewExpense");
      });
    });

    // Fechar modais
    document.querySelectorAll("[data-close-modal]").forEach(btn => {
      btn.addEventListener("click", () => {
        const modalId = btn.getAttribute("data-close-modal");
        this.closeModal(modalId);
      });
    });

    // Fechar modal ao clicar fora
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          this.closeModal(overlay.id);
        }
      });
    });

    // Tecla ESC fecha modais
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.active").forEach(m => {
          this.closeModal(m.id);
        });
      }
    });
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }
};
