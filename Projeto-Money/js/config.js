/**
 * GarimPro - Configurações Gerais & Conectividade
 * Centraliza a resolução de endpoints da API e detecção de ambiente (Local / Vercel Estático)
 */

const APP_CONFIG = {
  // Nome e versão da aplicação
  APP_NAME: 'GarimPro',
  VERSION: '2.0.0',

  // URL base da API PHP (quando hospedada separadamente)
  // Pode ser sobrescrita via window.GARIMPA_API_URL ou localStorage.getItem('garimpa_api_base_url')
  API_BASE_URL: (typeof window !== 'undefined' && (window.GARIMPA_API_URL || localStorage.getItem('garimpa_api_base_url'))) || '',

  /**
   * Retorna a URL completa para um endpoint da API.
   * - No XAMPP local: retorna 'api/nome_endpoint.php'
   * - Em servidor externo: retorna 'https://api.dominio.com/api/nome_endpoint.php'
   * @param {string} endpoint - Caminho relativo do endpoint (ex: 'api/vendas.php')
   * @returns {string} URL formatada
   */
  getApiUrl(endpoint) {
    const cleanEndpoint = (endpoint || '').replace(/^\/+/, '');
    if (!this.API_BASE_URL) {
      return cleanEndpoint;
    }
    const base = this.API_BASE_URL.replace(/\/+$/, '');
    return `${base}/${cleanEndpoint}`;
  },

  /**
   * Define uma nova URL base da API e persiste no localStorage
   * @param {string} url - URL do backend PHP (ex: 'https://api.meusite.com')
   */
  setApiBaseUrl(url) {
    this.API_BASE_URL = (url || '').trim();
    if (this.API_BASE_URL) {
      localStorage.setItem('garimpa_api_base_url', this.API_BASE_URL);
    } else {
      localStorage.removeItem('garimpa_api_base_url');
    }
  }
};

// Disponibiliza globalmente
if (typeof window !== 'undefined') {
  window.APP_CONFIG = APP_CONFIG;
}
