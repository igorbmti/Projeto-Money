/**
 * GarimPro - Authentication & Session Gatekeeper
 * Gestão de Login, Conexão com API / MySQL, Fallback Instantâneo,
 * Proteção de Rotas (Gatekeeper), Caps Lock, Perfis Rápidos e Transições Suaves
 */

const Auth = {
  // Configuração global de autenticação
  CONFIG: {
    get API_URL() {
      return (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.getApiUrl)
        ? window.APP_CONFIG.getApiUrl('api/auth.php')
        : 'api/auth.php';
    },
    STORAGE_KEY: 'garimpa_auth_session',
    REMEMBER_KEY: 'garimpa_remember_login',
    WELCOME_KEY: 'garimpa_welcome_flash'
  },

  state: {
    isAuthenticated: false,
    currentUser: null,
    isSubmitting: false,
    isLoginPage: false
  },

  /**
   * Perfis rápidos de demonstração / fallback
   */
  PROFILES: {
    admin: {
      user: 'admin',
      pass: 'admin',
      name: 'Igor Silva (Admin)',
      role: 'Administrador',
      avatar: 'IS'
    },
    gerente: {
      user: 'gerente',
      pass: 'admin',
      name: 'Juliana Gerente',
      role: 'Gerente de Vendas',
      avatar: 'JG'
    },
    vendedor: {
      user: 'carlos',
      pass: 'admin',
      name: 'Carlos Vendedor',
      role: 'Vendedor Especialista',
      avatar: 'CV'
    }
  },

  /**
   * Inicializa o módulo de autenticação
   */
  init() {
    this.detectCurrentPage();
    const hasSession = this.checkSession();

    if (this.state.isLoginPage) {
      // Se já estiver logado e estiver na página login.html, redireciona ao index
      if (hasSession) {
        this.redirectToApp(false);
        return;
      }
      this.bindLoginEvents();
      this.checkRememberedUser();
    } else {
      // Se estiver no index.html e não estiver logado, redireciona para login.html
      if (!hasSession) {
        this.redirectToLogin();
        return;
      }
      this.setupAppUserInterface();
      this.bindGlobalLogoutEvents();
      this.checkWelcomeToast();
    }
  },

  /**
   * Identifica se a página atual é a de login ou a principal
   */
  detectCurrentPage() {
    const path = window.location.pathname.toLowerCase();
    this.state.isLoginPage = path.includes('login.html') || (!document.querySelector('.app-layout') && !!document.getElementById('authLoginForm'));
  },

  /**
   * Verifica se o usuário já possui sessão ativa válida
   */
  checkSession() {
    const sessionData = localStorage.getItem(this.CONFIG.STORAGE_KEY) || sessionStorage.getItem(this.CONFIG.STORAGE_KEY);
    const authScreen = document.getElementById('authScreen');
    const appLayout = document.querySelector('.app-layout');

    if (sessionData) {
      try {
        const user = JSON.parse(sessionData);
        if (user && user.authenticated) {
          this.state.isAuthenticated = true;
          this.state.currentUser = user;

          if (authScreen) {
            authScreen.classList.add('auth-hidden');
          }
          if (appLayout) {
            appLayout.style.display = '';
          }
          return true;
        }
      } catch (e) {
        console.error('Erro ao ler dados de sessão:', e);
      }
    }

    // Não autenticado
    this.state.isAuthenticated = false;
    this.state.currentUser = null;
    return false;
  },

  /**
   * Carrega o usuário salvo caso tenha marcado "Lembrar de mim"
   */
  checkRememberedUser() {
    const remembered = localStorage.getItem(this.CONFIG.REMEMBER_KEY);
    if (remembered) {
      const usernameInput = document.getElementById('authUsername');
      const rememberCheckbox = document.getElementById('authRemember');
      if (usernameInput) usernameInput.value = remembered;
      if (rememberCheckbox) rememberCheckbox.checked = true;
    }
  },

  /**
   * Vincula ouvintes de eventos da tela de login
   */
  bindLoginEvents() {
    const loginForm = document.getElementById('authLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    const togglePwdBtn = document.getElementById('authTogglePwd');
    if (togglePwdBtn) {
      togglePwdBtn.addEventListener('click', () => this.togglePassword());
    }

    // Caps Lock Detector
    const passwordInput = document.getElementById('authPassword');
    if (passwordInput) {
      const handleCaps = (e) => {
        const capsWarning = document.getElementById('authCapsWarning');
        if (capsWarning) {
          const isCaps = e.getModifierState && e.getModifierState('CapsLock');
          capsWarning.classList.toggle('show', !!isCaps);
        }
      };
      passwordInput.addEventListener('keyup', handleCaps);
      passwordInput.addEventListener('keydown', handleCaps);
    }

    // Seletor de Perfis Rápidos
    document.querySelectorAll('.auth-profile-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const role = chip.getAttribute('data-role');
        this.selectProfile(role);
      });
    });

    // Modal de ajuda / Esqueceu a senha
    const forgotLink = document.getElementById('authForgotLink');
    if (forgotLink) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showForgotModal();
      });
    }
  },

  /**
   * Preenchimento rápido ao clicar em um chip de perfil
   */
  selectProfile(roleKey) {
    const profile = this.PROFILES[roleKey] || this.PROFILES.admin;
    const usernameInput = document.getElementById('authUsername');
    const passwordInput = document.getElementById('authPassword');
    const alertBox = document.getElementById('authAlertBox');

    if (usernameInput) usernameInput.value = profile.user;
    if (passwordInput) passwordInput.value = profile.pass;

    if (alertBox) {
      alertBox.classList.remove('show');
    }
  },

  /**
   * Executa processo de autenticação
   */
  async handleLogin(e) {
    if (e) e.preventDefault();
    if (this.state.isSubmitting) return;

    const usernameInput = document.getElementById('authUsername');
    const passwordInput = document.getElementById('authPassword');
    const rememberCheckbox = document.getElementById('authRemember');
    const submitBtn = document.getElementById('authSubmitBtn');
    const alertBox = document.getElementById('authAlertBox');
    const alertText = document.getElementById('authAlertText');
    const card = document.querySelector('.auth-card');
    const progressBarContainer = document.getElementById('authProgressBarContainer');
    const progressBar = document.getElementById('authProgressBar');

    const username = (usernameInput?.value || '').trim();
    const password = (passwordInput?.value || '').trim();

    // Reset visual
    if (alertBox) alertBox.classList.remove('show', 'auth-success', 'auth-info');
    if (card) card.classList.remove('auth-shake');

    if (!username || !password) {
      this.showError('Por favor, informe seu usuário ou e-mail e a senha.');
      return;
    }

    // Ativa loading state
    this.state.isSubmitting = true;
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    }

    let authSuccess = false;
    let userPayload = null;
    let responseMessage = '';

    // 1. Tenta autenticar via API RESTful com MySQL
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('remember', rememberCheckbox?.checked ? '1' : '0');

      const response = await fetch(this.CONFIG.API_URL + '?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      const data = await response.json();

      if (data && data.success && data.data) {
        authSuccess = true;
        userPayload = data.data;
        responseMessage = data.message || 'Acesso autorizado!';
      } else if (data && !data.success) {
        responseMessage = data.message;
      }
    } catch (networkErr) {
      console.warn('API de autenticação indisponível, avaliando modo offline:', networkErr);
    }

    // 2. Fallback de contingência / offline inteligente caso API falhe
    if (!authSuccess && (!responseMessage || responseMessage.includes('offline'))) {
      const uLower = username.toLowerCase();
      const matchedProfile = Object.values(this.PROFILES).find(
        p => p.user.toLowerCase() === uLower || p.name.toLowerCase().includes(uLower) || uLower === 'admin'
      );

      const isValidPass = ['admin', 'admin123', '123456', 'garimpro'].includes(password);

      if (matchedProfile && isValidPass) {
        authSuccess = true;
        userPayload = {
          id: 1,
          name: matchedProfile.name,
          username: username,
          email: `${matchedProfile.user}@garimpa.com.br`,
          role: matchedProfile.role,
          avatar: matchedProfile.avatar,
          token: 'offline_token_' + Date.now(),
          authenticated: true,
          loginAt: new Date().toISOString()
        };
      }
    }

    // 3. Processamento do Resultado
    if (authSuccess && userPayload) {
      const remember = rememberCheckbox?.checked;
      if (remember) {
        localStorage.setItem(this.CONFIG.STORAGE_KEY, JSON.stringify(userPayload));
        localStorage.setItem(this.CONFIG.REMEMBER_KEY, username);
      } else {
        sessionStorage.setItem(this.CONFIG.STORAGE_KEY, JSON.stringify(userPayload));
        localStorage.removeItem(this.CONFIG.REMEMBER_KEY);
      }

      // Sinalizador para disparar Toast de Boas-Vindas no index.html
      sessionStorage.setItem(this.CONFIG.WELCOME_KEY, userPayload.name);

      this.state.isAuthenticated = true;
      this.state.currentUser = userPayload;

      // Feedback visual premium de sucesso
      if (submitBtn) {
        submitBtn.classList.remove('loading');
        submitBtn.classList.add('auth-btn-success');
        submitBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Acesso Autorizado!</span>
        `;
      }

      if (alertBox && alertText) {
        alertText.textContent = responseMessage || 'Acesso autorizado! Entrando no sistema...';
        alertBox.classList.remove('auth-info');
        alertBox.classList.add('auth-success', 'show');
      }

      // Animação de Barra de Progresso
      if (progressBarContainer && progressBar) {
        progressBarContainer.classList.add('show');
        setTimeout(() => { progressBar.style.width = '100%'; }, 50);
      }

      // Transição fluida para o index.html
      setTimeout(() => {
        const authScreen = document.getElementById('authScreen');
        if (authScreen) {
          authScreen.classList.add('auth-exit');
        }
        setTimeout(() => {
          this.redirectToApp(true);
        }, 350);
      }, 500);

    } else {
      // Falha na autenticação
      this.state.isSubmitting = false;
      if (submitBtn) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }

      this.showError(responseMessage || 'Usuário ou senha incorretos. Utilize as credenciais admin / admin.');
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
      }
    }
  },

  /**
   * Redireciona para o aplicativo principal (index.html)
   */
  redirectToApp(smooth = true) {
    if (smooth) {
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 200);
    } else {
      window.location.href = 'index.html';
    }
  },

  /**
   * Redireciona para a página de login (login.html)
   */
  redirectToLogin() {
    window.location.href = 'login.html';
  },

  /**
   * Exibe mensagem de erro com animação de shake no card
   */
  showError(msg) {
    const alertBox = document.getElementById('authAlertBox');
    const alertText = document.getElementById('authAlertText');
    const card = document.querySelector('.auth-card');

    if (alertBox && alertText) {
      alertText.textContent = msg;
      alertBox.classList.remove('auth-success', 'auth-info');
      alertBox.classList.add('show');
    }

    if (card) {
      card.classList.remove('auth-shake');
      void card.offsetWidth; // Força reflow para reiniciar animação CSS
      card.classList.add('auth-shake');
    }
  },

  /**
   * Exibe mensagem informativa temporária
   */
  showInfo(msg) {
    const alertBox = document.getElementById('authAlertBox');
    const alertText = document.getElementById('authAlertText');

    if (alertBox && alertText) {
      alertText.textContent = msg;
      alertBox.classList.remove('auth-success');
      alertBox.classList.add('auth-info', 'show');
    }
  },

  /**
   * Alterna visibilidade da senha (mostrar/ocultar)
   */
  togglePassword() {
    const passwordInput = document.getElementById('authPassword');
    const eyeIcon = document.getElementById('authEyeIcon');
    if (!passwordInput) return;

    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    if (eyeIcon) {
      if (isPassword) {
        // Olho aberto
        eyeIcon.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        `;
      } else {
        // Olho com risco (oculto)
        eyeIcon.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
      }
    }
  },

  /**
   * Exibe o modal auxiliar de recuperação de senha
   */
  showForgotModal() {
    let modal = document.getElementById('authForgotModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'authForgotModal';
      modal.className = 'auth-helper-modal show';
      modal.innerHTML = `
        <div class="auth-helper-card">
          <div class="auth-helper-header">
            <div class="auth-helper-title">
              <span>🔐 Recuperação de Acesso</span>
            </div>
            <button class="auth-helper-close" id="btnCloseForgotModal" aria-label="Fechar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="auth-helper-body">
            <p>Para o ambiente de desenvolvimento e demonstração, você pode utilizar as seguintes credenciais pré-configuradas:</p>
            <div style="background: rgba(255,255,255,0.06); padding: 12px; border-radius: 10px; margin-top: 10px; font-size: 0.82rem; font-family: monospace;">
              <div>• <strong>Administrador:</strong> admin / admin</div>
              <div>• <strong>Gerente:</strong> gerente / admin</div>
              <div>• <strong>Vendedor:</strong> carlos / admin</div>
            </div>
          </div>
          <button type="button" class="btn btn-primary" id="btnApplyAdminDemo" style="width:100%; justify-content:center; font-weight:700;">
            Preencher como Administrador
          </button>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#btnCloseForgotModal').addEventListener('click', () => {
        modal.classList.remove('show');
      });

      modal.querySelector('#btnApplyAdminDemo').addEventListener('click', () => {
        this.selectProfile('admin');
        modal.classList.remove('show');
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
      });
    } else {
      modal.classList.add('show');
    }
  },

  /**
   * Atualiza a interface do app com dados do usuário logado
   */
  setupAppUserInterface() {
    const user = this.state.currentUser;
    if (!user) return;

    // Atualiza saudações no Header
    const greetingEl = document.querySelector('.header-greeting');
    if (greetingEl) {
      const firstName = user.name.split(' ')[0] || 'Usuário';
      greetingEl.innerHTML = `Olá, ${firstName}! 👋`;
    }

    // Atualiza nome e cargo na Sidebar e Topbar
    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = user.name;
    });

    document.querySelectorAll('.user-role').forEach(el => {
      el.textContent = user.role || 'Administrador';
    });

    // Atualiza Avatar
    document.querySelectorAll('.user-avatar').forEach(el => {
      // Mantém o status-dot se existir
      const dot = el.querySelector('.user-status-dot');
      el.textContent = user.avatar || 'IS';
      if (dot) el.appendChild(dot);
    });
  },

  /**
   * Vincula ouvintes globais de logout
   */
  bindGlobalLogoutEvents() {
    document.querySelectorAll('.btn-logout, [data-action="logout"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.logout();
      });
    });
  },

  /**
   * Verifica se há sinalizador de boas-vindas para exibir toast
   */
  checkWelcomeToast() {
    const welcomeUser = sessionStorage.getItem(this.CONFIG.WELCOME_KEY);
    if (welcomeUser) {
      sessionStorage.removeItem(this.CONFIG.WELCOME_KEY);
      setTimeout(() => {
        if (window.App && typeof window.App.showToast === 'function') {
          window.App.showToast(`Bem-vindo ao GarimPro, ${welcomeUser}!`, 'success');
        }
      }, 400);
    }
  },

  /**
   * Encerra a sessão e redireciona para a tela de login
   */
  logout() {
    const user = this.state.currentUser;

    // Notifica backend (fire-and-forget)
    if (user && user.id) {
      try {
        fetch(`${this.CONFIG.API_URL}?action=logout&id_usuario=${user.id}`, { method: 'POST' }).catch(() => {});
      } catch (e) {}
    }

    // Limpa sessão local
    localStorage.removeItem(this.CONFIG.STORAGE_KEY);
    sessionStorage.removeItem(this.CONFIG.STORAGE_KEY);
    this.state.isAuthenticated = false;
    this.state.currentUser = null;

    // Redireciona com transição
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.25s ease';
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 200);
  }
};

// Inicialização automática ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});
