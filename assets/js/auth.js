// auth.js - Gerenciamento de autenticação

const Auth = (() => {
    const SESSION_KEY = 'sage_usuario_logado';
    
    async function login(email, senha) {
        try {
            const config = window.APP_CONFIG;
            if (!config || !config.API_URL) throw new Error('Configuração não carregada');
            
            const url = `${config.API_URL}?action=login&dados=${encodeURIComponent(JSON.stringify({ email, senha }))}`;
            const response = await fetch(url);
            const result = await response.json();
            
            if (result.success && result.usuario) {
                const sessao = {
                    id: result.usuario.id,
                    nome: result.usuario.nome,
                    email: result.usuario.email,
                    perfil: result.usuario.perfil,
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
                return { success: true, perfil: sessao.perfil, usuario: sessao };
            }
            return { success: false, error: result.error || 'Email ou senha inválidos' };
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: 'Erro ao conectar com o servidor' };
        }
    }
    
    function logout() {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = '/SAGE-PLANO-MENSAL/';
    }
    
    function getUsuarioLogado() {
        const sessaoStr = localStorage.getItem(SESSION_KEY);
        if (!sessaoStr) return null;
        try {
            const sessao = JSON.parse(sessaoStr);
            const loginTime = new Date(sessao.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            if (hoursDiff > 8) { logout(); return null; }
            return sessao;
        } catch (e) { return null; }
    }
    
    function redirecionarPorPerfil() {
        const usuario = getUsuarioLogado();
        if (!usuario) { window.location.href = '/SAGE-PLANO-MENSAL/'; return; }
        const basePath = '/SAGE-PLANO-MENSAL/pages/';
        switch (usuario.perfil) {
            case 'admin': window.location.href = `${basePath}admin/dashboard.html`; break;
            case 'gestor': window.location.href = `${basePath}gestores/dashboard.html`; break;
            case 'professor': window.location.href = `${basePath}professores/dashboard.html`; break;
            case 'dev': window.location.href = `${basePath}dev/dashboard.html`; break;
            default: window.location.href = '/SAGE-PLANO-MENSAL/';
        }
    }
    
    function verificarAcesso() {
        const usuario = getUsuarioLogado();
        if (!usuario) { window.location.href = '/SAGE-PLANO-MENSAL/'; return false; }
        return true;
    }
    
    return { login, logout, getUsuarioLogado, redirecionarPorPerfil, verificarAcesso };
})();
