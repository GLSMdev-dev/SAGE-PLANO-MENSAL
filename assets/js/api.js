// api.js - Comunicação com a API
// A API_KEY permanece apenas no backend (Apps Script)

const API = (() => {
    const getConfig = () => window.APP_CONFIG;
    
    async function request(entity, action, dados = null, id = null) {
        const config = getConfig();
        if (!config || !config.API_URL) {
            throw new Error('Configuração não carregada');
        }
        
        let url = `${config.API_URL}?entity=${entity}&action=${action}`;
        
        if (id) {
            url += `&id=${id}`;
        }
        
        if (dados) {
            url += `&dados=${encodeURIComponent(JSON.stringify(dados))}`;
        }
        
        try {
            const response = await fetch(url);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.erro || result.error || 'Erro na requisição');
            }
            
            return result;
        } catch (error) {
            console.error('[API] Erro:', error);
            throw error;
        }
    }
    
    // Usuários
    async function listarUsuarios() {
        return request('usuarios', 'listar');
    }
    
    async function criarUsuario(dados) {
        return request('usuarios', 'criar', dados);
    }
    
    async function atualizarUsuario(id, dados) {
        return request('usuarios', 'atualizar', dados, id);
    }
    
    async function deletarUsuario(id) {
        return request('usuarios', 'deletar', null, id);
    }
    
    // Turmas
    async function listarTurmas() {
        return request('turmas', 'listar');
    }
    
    async function criarTurma(dados) {
        return request('turmas', 'criar', dados);
    }
    
    async function atualizarTurma(id, dados) {
        return request('turmas', 'atualizar', dados, id);
    }
    
    async function deletarTurma(id) {
        return request('turmas', 'deletar', null, id);
    }
    
    // Disciplinas
    async function listarDisciplinas() {
        return request('disciplinas', 'listar');
    }
    
    async function criarDisciplina(dados) {
        return request('disciplinas', 'criar', dados);
    }
    
    async function atualizarDisciplina(id, dados) {
        return request('disciplinas', 'atualizar', dados, id);
    }
    
    async function deletarDisciplina(id) {
        return request('disciplinas', 'deletar', null, id);
    }
    
    // Planos
    async function listarPlanos() {
        return request('planos_aula', 'listar');
    }
    
    async function criarPlano(dados) {
        return request('planos_aula', 'criar', dados);
    }
    
    async function atualizarPlano(id, dados) {
        return request('planos_aula', 'atualizar', dados, id);
    }
    
    async function deletarPlano(id) {
        return request('planos_aula', 'deletar', null, id);
    }
    
    return {
        listarUsuarios,
        criarUsuario,
        atualizarUsuario,
        deletarUsuario,
        listarTurmas,
        criarTurma,
        atualizarTurma,
        deletarTurma,
        listarDisciplinas,
        criarDisciplina,
        atualizarDisciplina,
        deletarDisciplina,
        listarPlanos,
        criarPlano,
        atualizarPlano,
        deletarPlano
    };
})();
