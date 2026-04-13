// api.js - Comunicação com a API

const API = (() => {
    const getConfig = () => window.APP_CONFIG;
    
    async function request(entity, action, dados = null, id = null) {
        const config = getConfig();
        if (!config || !config.API_URL) throw new Error('Configuração não carregada');
        
        let url = `${config.API_URL}?entity=${entity}&action=${action}`;
        if (id) url += `&id=${id}`;
        if (dados) url += `&dados=${encodeURIComponent(JSON.stringify(dados))}`;
        
        const response = await fetch(url);
        const result = await response.json();
        if (!result.success) throw new Error(result.erro || result.error || 'Erro na requisição');
        return result;
    }
    
    // Usuários
    async function listarUsuarios() { return request('usuarios', 'listar'); }
    async function criarUsuario(dados) { return request('usuarios', 'criar', dados); }
    async function atualizarUsuario(id, dados) { return request('usuarios', 'atualizar', dados, id); }
    async function deletarUsuario(id) { return request('usuarios', 'deletar', null, id); }
    
    // Turmas
    async function listarTurmas() { return request('turmas', 'listar'); }
    async function criarTurma(dados) { return request('turmas', 'criar', dados); }
    async function atualizarTurma(id, dados) { return request('turmas', 'atualizar', dados, id); }
    async function deletarTurma(id) { return request('turmas', 'deletar', null, id); }
    
    // Disciplinas
    async function listarDisciplinas() { return request('disciplinas', 'listar'); }
    async function criarDisciplina(dados) { return request('disciplinas', 'criar', dados); }
    async function atualizarDisciplina(id, dados) { return request('disciplinas', 'atualizar', dados, id); }
    async function deletarDisciplina(id) { return request('disciplinas', 'deletar', null, id); }
    
    // Cargas Horárias
    async function getCargasHorarias() { return request('cargas_horarias', 'listar'); }
    async function criarCargaHoraria(dados) { return request('cargas_horarias', 'criar', dados); }
    async function atualizarCargaHoraria(id, dados) { return request('cargas_horarias', 'atualizar', dados, id); }
    async function deletarCargaHoraria(id) { return request('cargas_horarias', 'deletar', null, id); }
    
    // Lotações
    async function listarLotacoes() { return request('lotacoes', 'listar'); }
    async function criarLotacao(dados) { return request('lotacoes', 'criar', dados); }
    async function atualizarLotacao(id, dados) { return request('lotacoes', 'atualizar', dados, id); }
    async function deletarLotacao(id) { return request('lotacoes', 'deletar', null, id); }
    
    // Planos
    async function listarPlanos() { return request('planos_aula', 'listar'); }
    async function criarPlano(dados) { return request('planos_aula', 'criar', dados); }
    async function atualizarPlano(id, dados) { return request('planos_aula', 'atualizar', dados, id); }
    async function deletarPlano(id) { return request('planos_aula', 'deletar', null, id); }
    
    // Configuração Visual
    async function getConfigVisual() { return request('config_visual', 'listar'); }
    async function salvarConfigVisual(chave, valor) {
        const configs = await getConfigVisual();
        const config = configs.dados.find(c => c.chave === chave);
        if (config) return request('config_visual', 'atualizar', { valor }, config.id);
        return { success: false, error: 'Configuração não encontrada' };
    }

    // Arquivos
    async function uploadArquivo(file, fileName, planoId, semana, aula, tipo, usuarioId) {
        const config = getConfig();
        if (!config || !config.API_URL) throw new Error('Configuração não carregada');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', fileName);
        formData.append('planoId', planoId);
        formData.append('semana', semana);
        formData.append('aula', aula);
        formData.append('tipo', tipo);
        formData.append('usuarioId', usuarioId);

        // Usar a mesma URL base com parâmetros entity e action
        const url = `${config.API_URL}?entity=arquivos&action=upload&fileName=${encodeURIComponent(fileName)}&planoId=${planoId}&semana=${semana}&aula=${aula}&tipo=${tipo}&usuarioId=${usuarioId}`;

        const response = await fetch(url, {
            method: 'POST',
            body: file
        });

        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Erro no upload');
        return result;
    }

    async function listarArquivos(planoId) { return request('arquivos', 'listar', { planoId }); }
    async function deletarArquivo(id) { return request('arquivos', 'deletar', null, id); }

    return {
        listarUsuarios, criarUsuario, atualizarUsuario, deletarUsuario,
        listarTurmas, criarTurma, atualizarTurma, deletarTurma,
        listarDisciplinas, criarDisciplina, atualizarDisciplina, deletarDisciplina,
        getCargasHorarias, criarCargaHoraria, atualizarCargaHoraria, deletarCargaHoraria,
        listarLotacoes, criarLotacao, atualizarLotacao, deletarLotacao,
        listarPlanos, criarPlano, atualizarPlano, deletarPlano,
        getConfigVisual, salvarConfigVisual,
        uploadArquivo, listarArquivos, deletarArquivo
    };
})();
