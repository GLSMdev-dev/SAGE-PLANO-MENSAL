// auth.js - Gerenciamento de autenticação e sessão

const Auth = (() => {
    const SESSION_KEY = 'sage_usuario_logado';
    
    /**
     * Realiza login do usuário
     * @param {string} email - Email do usuário
     * @param {string} senha - Senha do usuário
     * @returns {Promise<object>} Resultado do login
     */
    async function login(email, senha) {
        try {
            const config = window.APP_CONFIG;
            if (!config || !config.API_URL) {
                throw new Error('Configuração não carregada');
            }
            
            const url = `${config.API_URL}?action=login&dados=${encodeURIComponent(JSON.stringify({ email, senha }))}`;
            
            const response = await fetch(url);
            const result = await response.json();
            
            if (result.success && result.usuario) {
                const sessao = {
                    id: result.usuario.id,
                    nome: result.usuario.nome,
                    email: result.usuario.email,
                    perfil: result.usuario.perfil,
                    disciplina_id: result.usuario.disciplina_id,
                    turma_id: result.usuario.turma_id,
                    loginTime: new Date().toISOString()
                };
                
                localStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
                
                return {
                    success: true,
                    perfil: sessao.perfil,
                    usuario: sessao
                };
            }
            
            return {
                success: false,
                error: result.error || 'Email ou senha inválidos'
            };
            
        } catch (error) {
            console.error('Erro no login:', error);
            return {
                success: false,
                error: 'Erro ao conectar com o servidor'
            };
        }
    }
    
    /**
     * Realiza logout do usuário
     */
    function logout() {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = '/SAGE-PLANO-MENSAL/';
    }
    
    /**
     * Obtém dados do usuário logado
     * @returns {object|null} Dados do usuário ou null se não logado
     */
    function getUsuarioLogado() {
        const sessaoStr = localStorage.getItem(SESSION_KEY);
        if (!sessaoStr) return null;
        
        try {
            const sessao = JSON.parse(sessaoStr);
            const loginTime = new Date(sessao.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            // Sessão expira após 8 horas
            if (hoursDiff > 8) {
                logout();
                return null;
            }
            
            return sessao;
        } catch (e) {
            return null;
        }
    }
    
    /**
     * Redireciona o usuário conforme seu perfil
     */
    function redirecionarPorPerfil() {
        const usuario = getUsuarioLogado();
        if (!usuario) {
            window.location.href = '/SAGE-PLANO-MENSAL/';
            return;
        }
        
        const basePath = '/SAGE-PLANO-MENSAL/pages/';
        
        switch (usuario.perfil) {
            case 'admin':
                window.location.href = `${basePath}admin/dashboard.html`;
                break;
            case 'gestor':
                window.location.href = `${basePath}gestores/dashboard.html`;
                break;
            case 'professor':
                window.location.href = `${basePath}professores/dashboard.html`;
                break;
            case 'dev':
                window.location.href = `${basePath}dev/dashboard.html`;
                break;
            default:
                window.location.href = '/SAGE-PLANO-MENSAL/';
        }
    }
    
    /**
     * Verifica se o usuário tem acesso à página atual
     * @param {string|string[]} perfisPermitidos - Perfil ou array de perfis permitidos
     * @returns {boolean} True se tem acesso
     */
    function verificarPermissao(perfisPermitidos) {
        const usuario = getUsuarioLogado();
        if (!usuario) return false;
        
        if (!Array.isArray(perfisPermitidos)) {
            perfisPermitidos = [perfisPermitidos];
        }
        
        return perfisPermitidos.includes(usuario.perfil);
    }
    
    /**
     * Verifica acesso e redireciona se não tiver permissão
     * @param {string|string[]} perfisPermitidos - Perfil ou array de perfis permitidos
     * @returns {boolean} True se tem acesso
     */
    function verificarAcesso(perfisPermitidos = null) {
        const usuario = getUsuarioLogado();
        
        if (!usuario) {
            window.location.href = '/SAGE-PLANO-MENSAL/';
            return false;
        }
        
        if (perfisPermitidos) {
            const permitidos = Array.isArray(perfisPermitidos) ? perfisPermitidos : [perfisPermitidos];
            if (!permitidos.includes(usuario.perfil)) {
                // Redirecionar para o dashboard correto
                redirecionarPorPerfil();
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Atualiza dados do usuário na sessão
     * @param {object} novosDados - Dados a serem atualizados
     */
    function atualizarSessao(novosDados) {
        const usuario = getUsuarioLogado();
        if (usuario) {
            const sessaoAtualizada = { ...usuario, ...novosDados };
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessaoAtualizada));
        }
    }
    
    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean}
     */
    function isAutenticado() {
        return getUsuarioLogado() !== null;
    }
    
    // API pública
    return {
        login,
        logout,
        getUsuarioLogado,
        redirecionarPorPerfil,
        verificarPermissao,
        verificarAcesso,
        atualizarSessao,
        isAutenticado
    };
})();
