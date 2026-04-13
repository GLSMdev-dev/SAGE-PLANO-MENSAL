// ============================================================
// API CRUD UNIVERSAL - SAGE Planos
// Versão Completa - CORS Funcionando + Upload de Arquivos
// ============================================================

const SPREADSHEET_ID = '1iqjaaaKdRKYk9k5A46WPl3TWb0KO-l3IaWro2RlD8O0';

function doGet(e) {
  var resultado = handleRequest(e);
  return ContentService.createTextOutput(JSON.stringify(resultado))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var resultado = handleRequest(e);
  return ContentService.createTextOutput(JSON.stringify(resultado))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPut(e) {
  return doPost(e);
}

function doDelete(e) {
  return doPost(e);
}

function handleRequest(e) {
  var params = e.parameter || {};

  try {
    var dados = {};
    if (params.dados) {
      try {
        dados = JSON.parse(params.dados);
      } catch(erro) {
        dados = params.dados;
      }
    }

    var action = params.action || params.method;
    var entity = params.entity;
    var id = params.id;

    // Login
    if (action === 'login' || action === 'autenticar') {
      return autenticarUsuario(dados.email, dados.senha);
    }

    // Upload de Arquivos
    if (entity === 'arquivos' && action === 'upload') {
      return uploadArquivo(e);
    }

    // CRUD
    if (action === 'listar' || action === 'GET') {
      return listar(entity);
    }

    if (action === 'criar' || action === 'POST') {
      return criar(entity, dados);
    }

    if (action === 'atualizar' || action === 'PUT') {
      return atualizar(entity, id, dados);
    }

    if (action === 'deletar' || action === 'DELETE') {
      return deletar(entity, id);
    }

    return { success: false, erro: 'Ação não reconhecida: ' + action };

  } catch(erro) {
    return { success: false, erro: erro.toString() };
  }
}

// ============================================================
// FUNÇÕES DE UPLOAD DE ARQUIVOS
// ============================================================

function uploadArquivo(e) {
  try {
    const blob = e.postData.contents;
    const mimeType = e.postData.type;
    const fileName = e.parameter.fileName;
    const planoId = e.parameter.planoId;
    const semana = e.parameter.semana;
    const aula = e.parameter.aula;
    const tipo = e.parameter.tipo; // 'recursos' ou 'avaliacao'
    const usuarioId = e.parameter.usuarioId;

    if (!blob || !fileName || !planoId) {
      throw new Error('Parâmetros obrigatórios faltando');
    }

    // Criar pasta para arquivos se não existir
    const pastaPrincipal = getOrCreatePasta('SAGE_Planos_Arquivos');
    const pastaPlano = getOrCreatePasta(`Plano_${planoId}`, pastaPrincipal);

    // Criar arquivo no Drive
    const file = pastaPlano.createFile(blob);
    file.setName(fileName);
    file.setDescription(`Arquivo do plano ${planoId} - Semana ${semana}, Aula ${aula} (${tipo})`);

    // Tornar arquivo compartilhável
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Salvar metadados na planilha
    salvarMetadadosArquivo({
      id: generateId(),
      plano_id: planoId,
      semana: semana,
      aula: aula,
      tipo: tipo,
      nome_original: fileName,
      drive_file_id: file.getId(),
      drive_url: file.getUrl(),
      tamanho: file.getSize(),
      mime_type: mimeType,
      uploaded_by: usuarioId,
      uploaded_at: new Date().toISOString()
    });

    return {
      success: true,
      dados: {
        id: file.getId(),
        url: file.getUrl(),
        nome: fileName,
        tamanho: file.getSize()
      }
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

function listarArquivos(entity, params) {
  try {
    const planoId = params ? params.planoId : null;
    const sheet = getSheetByName('arquivos');

    if (!sheet) {
      return { success: true, dados: [] };
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const arquivos = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!planoId || row[1] == planoId) { // coluna plano_id
        const arquivo = {};
        headers.forEach((header, index) => {
          arquivo[header] = row[index];
        });
        arquivos.push(arquivo);
      }
    }

    return { success: true, dados: arquivos };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

function deletarArquivo(entity, id) {
  try {
    // Primeiro tenta deletar do Drive
    try {
      const file = DriveApp.getFileById(id);
      file.setTrashed(true);
    } catch (driveError) {
      console.warn('Arquivo não encontrado no Drive:', driveError.message);
    }

    // Remove da planilha
    const sheet = getSheetByName('arquivos');
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][6] === id) { // coluna drive_file_id
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }

    return { success: true };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

function salvarMetadadosArquivo(dados) {
  const sheet = getOrCreateSheet('arquivos');

  // Verificar se cabeçalho existe
  if (sheet.getLastRow() === 0) {
    const headers = ['id', 'plano_id', 'semana', 'aula', 'tipo', 'nome_original',
                     'drive_file_id', 'drive_url', 'tamanho', 'mime_type',
                     'uploaded_by', 'uploaded_at'];
    sheet.appendRow(headers);
  }

  // Adicionar dados
  sheet.appendRow([
    dados.id,
    dados.plano_id,
    dados.semana,
    dados.aula,
    dados.tipo,
    dados.nome_original,
    dados.drive_file_id,
    dados.drive_url,
    dados.tamanho,
    dados.mime_type,
    dados.uploaded_by,
    dados.uploaded_at
  ]);
}

function getOrCreatePasta(nome, pastaPai) {
  const pastas = pastaPai ? pastaPai.getFoldersByName(nome) : DriveApp.getFoldersByName(nome);

  if (pastas.hasNext()) {
    return pastas.next();
  } else {
    return pastaPai ? pastaPai.createFolder(nome) : DriveApp.createFolder(nome);
  }
}

function generateId() {
  return 'file_' + new Date().getTime() + '_' + Math.random().toString(36).substr(2, 9);
}

function getSheetByName(nome) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(nome);
}

function getOrCreateSheet(nome) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(nome);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(nome);
  }

  return sheet;
}

// ============================================================
// FUNÇÕES CRUD EXISTENTES (mantidas)
// ============================================================

function listar(entity) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(entity);
    if (!sheet) return { success: false, erro: 'Aba "' + entity + '" não encontrada' };

    var valores = sheet.getDataRange().getValues();
    if (valores.length === 0) return { success: true, dados: [], total: 0 };

    var cabecalhos = valores[0];
    var registros = [];

    for (var i = 1; i < valores.length; i++) {
      var registro = {};
      for (var j = 0; j < cabecalhos.length; j++) {
        registro[cabecalhos[j]] = valores[i][j] || '';
      }
      registros.push(registro);
    }

    return { success: true, dados: registros, total: registros.length };
  } catch(erro) {
    return { success: false, erro: erro.toString() };
  }
}

function criar(entity, dados) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(entity);
    if (!sheet) return { success: false, erro: 'Aba "' + entity + '" não encontrada' };

    var ultimaLinha = sheet.getLastRow();
    var cabecalhos = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    var novoId = 1;
    if (ultimaLinha > 1) {
      var ids = sheet.getRange(2, 1, ultimaLinha - 1, 1).getValues();
      var maxId = 0;
      for (var i = 0; i < ids.length; i++) {
        if (ids[i][0] > maxId) maxId = ids[i][0];
      }
      novoId = maxId + 1;
    }

    var novaLinha = [];
    var agora = new Date().toISOString();

    for (var j = 0; j < cabecalhos.length; j++) {
      var campo = cabecalhos[j];
      if (campo === 'id') novaLinha.push(novoId);
      else if (campo === 'created_at') novaLinha.push(agora);
      else if (campo === 'updated_at') novaLinha.push(agora);
      else novaLinha.push(dados[campo] || '');
    }

    sheet.appendRow(novaLinha);
    return { success: true, id: novoId, message: 'Criado com sucesso' };
  } catch(erro) {
    return { success: false, erro: erro.toString() };
  }
}

function atualizar(entity, id, dados) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(entity);
    if (!sheet) return { success: false, erro: 'Aba "' + entity + '" não encontrada' };

    var valores = sheet.getDataRange().getValues();
    var cabecalhos = valores[0];

    var linhaEncontrada = -1;
    for (var i = 1; i < valores.length; i++) {
      if (valores[i][0] == id) {
        linhaEncontrada = i + 1;
        break;
      }
    }
    if (linhaEncontrada === -1) return { success: false, erro: 'Registro não encontrado' };

    var agora = new Date().toISOString();
    for (var j = 0; j < cabecalhos.length; j++) {
      var campo = cabecalhos[j];
      if (campo === 'updated_at') {
        sheet.getRange(linhaEncontrada, j + 1).setValue(agora);
      } else if (dados[campo] !== undefined) {
        sheet.getRange(linhaEncontrada, j + 1).setValue(dados[campo]);
      }
    }

    return { success: true, message: 'Atualizado com sucesso' };
  } catch(erro) {
    return { success: false, erro: erro.toString() };
  }
}

function deletar(entity, id) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(entity);
    if (!sheet) return { success: false, erro: 'Aba "' + entity + '" não encontrada' };

    var valores = sheet.getDataRange().getValues();
    var linhaEncontrada = -1;
    for (var i = 1; i < valores.length; i++) {
      if (valores[i][0] == id) {
        linhaEncontrada = i + 1;
        break;
      }
    }
    if (linhaEncontrada === -1) return { success: false, erro: 'Registro não encontrado' };

    sheet.deleteRow(linhaEncontrada);
    return { success: true, message: 'Deletado com sucesso' };
  } catch(erro) {
    return { success: false, erro: erro.toString() };
  }
}

function autenticarUsuario(email, senha) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('usuarios');
    if (!sheet) return { success: false, error: 'Erro ao acessar dados' };

    var valores = sheet.getDataRange().getValues();
    var cabecalhos = valores[0];

    for (var i = 1; i < valores.length; i++) {
      var usuario = {};
      for (var j = 0; j < cabecalhos.length; j++) {
        usuario[cabecalhos[j]] = valores[i][j] || '';
      }

      if (usuario.email === email) {
        if (usuario.ativo !== 'TRUE' && usuario.ativo !== true) {
          return { success: false, error: 'Usuário desativado' };
        }
        if (usuario.senha !== senha) {
          return { success: false, error: 'Senha incorreta' };
        }
        delete usuario.senha;
        return { success: true, usuario: usuario };
      }
    }

    return { success: false, error: 'Usuário não encontrado' };
  } catch(erro) {
    return { success: false, error: erro.toString() };
  }
}

// ============================================================
// FUNÇÕES PARA ATUALIZAR A PLANILHA
// ============================================================

function atualizarPlanilhaCompleta() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ui = SpreadsheetApp.getUi();

  var resposta = ui.alert('⚠️ ATENÇÃO!', 'Isso irá recriar todas as abas. Deseja continuar?', ui.ButtonSet.YES_NO);
  if (resposta !== ui.Button.YES) return;

  var abas = ss.getSheets();

  // ✅ CORREÇÃO AQUI
  if (abas.length > 1) {
    for (var i = abas.length - 1; i >= 0; i--) {
      var nome = abas[i].getName();
      if (abas.length > 1 && nome !== 'Sheet1') {
        ss.deleteSheet(abas[i]);
      }
    }
  }

  criarAbaUsuarios(ss);
  criarAbaTurmas(ss);
  criarAbaDisciplinas(ss);
  criarAbaCargasHorarias(ss);
  criarAbaLotacoes(ss);
  criarAbaPlanosAula(ss);
  criarAbaArquivos(ss);
  criarAbaConfigVisual(ss);

  ui.alert('✅ Configuração concluída!');
}

function criarAbaUsuarios(ss) {
  var sheet = ss.insertSheet('usuarios');
  var cabecalhos = ['id', 'nome', 'email', 'perfil', 'ativo', 'senha', 'created_at', 'updated_at'];
  sheet.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);

  var dados = [
    [1, 'Admin Sistema', 'admin@escola.com', 'admin', 'TRUE', 'admin123', new Date().toISOString(), new Date().toISOString()],
    [2, 'Gestora Ana Paula', 'ana.paula@escola.com', 'gestor', 'TRUE', '123456', new Date().toISOString(), new Date().toISOString()],
    [3, 'Desenvolvedor', 'dev@escola.com', 'dev', 'TRUE', 'dev123', new Date().toISOString(), new Date().toISOString()],
    [4, 'Professor João Silva', 'joao.silva@escola.com', 'professor', 'TRUE', '123456', new Date().toISOString(), new Date().toISOString()],
    [5, 'Professora Amanda Gusmão', 'amanda.gusmao@escola.com', 'professor', 'TRUE', '123456', new Date().toISOString(), new Date().toISOString()]
  ];

  for (var i = 0; i < dados.length; i++) {
    sheet.getRange(i + 2, 1, 1, dados[i].length).setValues([dados[i]]);
  }

  formatarAba(sheet, cabecalhos);
}

function criarAbaTurmas(ss) {
  var sheet = ss.insertSheet('turmas');
  var cabecalhos = ['id', 'nome', 'serie', 'turno', 'ano_letivo', 'ativo'];
  sheet.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);

  var series = ['1ª Série', '2ª Série', '3ª Série'];
  var turnos = ['Manhã', 'Tarde'];
  var id = 1;
  var dados = [];

  for (var s = 0; s < series.length; s++) {
    for (var t = 0; t < turnos.length; t++) {
      dados.push([id++, series[s] + ' A', series[s], turnos[t], 2026, 'TRUE']);
      dados.push([id++, series[s] + ' B', series[s], turnos[t], 2026, 'TRUE']);
      dados.push([id++, series[s] + ' C', series[s], turnos[t], 2026, 'TRUE']);
    }
  }

  for (var i = 0; i < dados.length; i++) {
    sheet.getRange(i + 2, 1, 1, dados[i].length).setValues([dados[i]]);
  }

  formatarAba(sheet, cabecalhos);
}

function criarAbaDisciplinas(ss) {
  var sheet = ss.insertSheet('disciplinas');
  var cabecalhos = ['id', 'nome', 'area_conhecimento', 'sigla', 'ativo'];
  sheet.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);

  var dados = [
    [101, 'Matemática', 'Matemática', 'MAT', 'TRUE'],
    [102, 'Língua Portuguesa', 'Linguagens', 'LP', 'TRUE'],
    [103, 'Física', 'Ciências da Natureza', 'FIS', 'TRUE'],
    [104, 'Química', 'Ciências da Natureza', 'QUI', 'TRUE'],
    [105, 'Biologia', 'Ciências da Natureza', 'BIO', 'TRUE'],
    [106, 'História', 'Ciências Humanas', 'HIS', 'TRUE'],
    [107, 'Geografia', 'Ciências Humanas', 'GEO', 'TRUE'],
    [108, 'Inglês', 'Linguagens', 'ING', 'TRUE'],
    [109, 'Educação Física', 'Linguagens', 'EDF', 'TRUE'],
    [110, 'Artes', 'Linguagens', 'ART', 'TRUE'],
    [111, 'Filosofia', 'Ciências Humanas', 'FIL', 'TRUE'],
    [112, 'Sociologia', 'Ciências Humanas', 'SOC', 'TRUE'],
    [113, 'Redação', 'Linguagens', 'RED', 'TRUE'],
    [114, 'Espanhol', 'Linguagens', 'ESP', 'TRUE'],
    [115, 'Cultura Digital', 'Ensino Integral', 'CD', 'TRUE']
  ];

  for (var i = 0; i < dados.length; i++) {
    sheet.getRange(i + 2, 1, 1, dados[i].length).setValues([dados[i]]);
  }

  formatarAba(sheet, cabecalhos);
}

function criarAbaCargasHorarias(ss) {
  var sheet = ss.insertSheet('cargas_horarias');
  var cabecalhos = ['id', 'disciplina_id', 'disciplina_nome', 'serie', 'aulas_semana', 'ano_letivo', 'ativo'];
  sheet.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);
  formatarAba(sheet, cabecalhos);
}

function criarAbaLotacoes(ss) {
  var sheet = ss.insertSheet('lotacoes');
  var cabecalhos = ['id', 'professor_id', 'professor_nome', 'disciplina_id', 'disciplina_nome', 'turma_id', 'turma_nome', 'serie', 'carga_horaria_id', 'aulas_semana', 'ano_letivo', 'ativo', 'created_at', 'updated_at'];
  sheet.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);
  formatarAba(sheet, cabecalhos);
}

function criarAbaPlanosAula(ss) {
  var sheet = ss.insertSheet('planos_aula');
  var cabecalhos = [
    'id', 'professor_id', 'disciplina_id', 'serie', 'mes_referencia', 'ano_referencia',
    'status', 'feedback_gestor', 'conteudo_mensal', 'referencias', 'aulas_semana',
    'total_aulas_mes', 'semanas_planejadas', 'created_at', 'updated_at'
  ];

  for (var aula = 1; aula <= 40; aula++) {
    cabecalhos.push('aula_' + aula + '_subconteudo');
    cabecalhos.push('aula_' + aula + '_metodologia');
    cabecalhos.push('aula_' + aula + '_avaliacao');
    cabecalhos.push('aula_' + aula + '_recursos');
    cabecalhos.push('aula_' + aula + '_recursos_url');
  }

  sheet.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);
  formatarAba(sheet, cabecalhos);
}

function criarAbaArquivos(ss) {
  var sheet = ss.insertSheet('arquivos');
  var cabecalhos = ['id', 'plano_id', 'semana', 'aula', 'tipo', 'nome_original', 'drive_file_id', 'drive_url', 'tamanho', 'mime_type', 'uploaded_by', 'uploaded_at'];
  sheet.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);
  formatarAba(sheet, cabecalhos);
}

function criarAbaConfigVisual(ss) {
  var sheet = ss.insertSheet('config_visual');
  var cabecalhos = ['id', 'chave', 'valor', 'tipo', 'categoria', 'descricao'];
  sheet.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);

  var dados = [
    [1, 'cor_primaria', '#4CAF50', 'cor', 'cores', 'Cor principal'],
    [2, 'cor_secundaria', '#2196F3', 'cor', 'cores', 'Cor secundária'],
    [3, 'cor_fundo', '#f5f5f5', 'cor', 'cores', 'Cor de fundo'],
    [4, 'cor_texto', '#333333', 'cor', 'cores', 'Cor do texto'],
    [5, 'fonte_principal', "'Segoe UI', sans-serif", 'fonte', 'fontes', 'Fonte principal'],
    [6, 'tamanho_fonte_base', '16', 'tamanho', 'fontes', 'Tamanho da fonte'],
    [7, 'borda_arredondada', '8', 'tamanho', 'botoes', 'Arredondamento'],
    [8, 'botao_padding', '12', 'tamanho', 'botoes', 'Padding dos botões'],
    [9, 'card_sombra', '0 2px 4px rgba(0,0,0,0.1)', 'estilo', 'cards', 'Sombra'],
    [10, 'card_radius', '8', 'tamanho', 'cards', 'Arredondamento'],
    [11, 'espacamento_padrao', '20', 'tamanho', 'espacamentos', 'Espaçamento'],
    [12, 'header_bg', '#4CAF50', 'cor', 'cores', 'Cor do cabeçalho'],
    [13, 'header_texto', '#FFFFFF', 'cor', 'cores', 'Texto do cabeçalho']
  ];

  for (var i = 0; i < dados.length; i++) {
    sheet.getRange(i + 2, 1, 1, dados[i].length).setValues([dados[i]]);
  }

  formatarAba(sheet, cabecalhos);
}

function formatarAba(sheet, cabecalhos) {
  sheet.getRange(1, 1, 1, cabecalhos.length)
    .setBackground('#4CAF50').setFontColor('#FFFFFF').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.autoResizeColumns(1, cabecalhos.length);
  sheet.setFrozenRows(1);
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📚 SAGE Planos')
    .addItem('🔄 Configurar Planilha Completa', 'atualizarPlanilhaCompleta')
    .addSeparator()
    .addItem('📊 Relatório de Cargas', 'gerarRelatorioCargas')
    .addItem('👥 Relatório de Lotações', 'gerarRelatorioLotacoes')
    .addToUi();
}

function gerarRelatorioCargas() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('cargas_horarias');
  if (!sheet) return;
  var dados = sheet.getDataRange().getValues();
  var relatorio = ss.insertSheet('relatorio_cargas');
  relatorio.getRange(1, 1, 1, 4).setValues([['Série', 'Disciplina', 'Aulas/Semana', 'Status']]);
  for (var i = 1; i < dados.length; i++) {
    relatorio.getRange(i + 1, 1, 1, 4).setValues([[dados[i][3], dados[i][2], dados[i][4], dados[i][6]]]);
  }
  formatarAba(relatorio, ['Série', 'Disciplina', 'Aulas/Semana', 'Status']);
}

function gerarRelatorioLotacoes() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('lotacoes');
  if (!sheet) return;
  var dados = sheet.getDataRange().getValues();
  var relatorio = ss.insertSheet('relatorio_lotacoes');
  relatorio.getRange(1, 1, 1, 5).setValues([['Professor', 'Disciplina', 'Turma', 'Aulas/Semana', 'Status']]);
  for (var i = 1; i < dados.length; i++) {
    relatorio.getRange(i + 1, 1, 1, 5).setValues([[dados[i][2], dados[i][4], dados[i][6], dados[i][9], dados[i][11]]]);
  }
  formatarAba(relatorio, ['Professor', 'Disciplina', 'Turma', 'Aulas/Semana', 'Status']);
}
function importarLotacoesCSV_Atualizado() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Abas necessárias
  var sheetCsv = ss.getSheetByName('import_csv');
  if (!sheetCsv) {
    SpreadsheetApp.getUi().alert('Erro: Aba "import_csv" não encontrada!');
    return;
  }

  var csv = sheetCsv.getDataRange().getValues();
  var usuarios = ss.getSheetByName('usuarios');
  var disciplinas = ss.getSheetByName('disciplinas');
  var turmas = ss.getSheetByName('turmas');
  var lotacoes = ss.getSheetByName('lotacoes');

  var dadosUsuarios = usuarios.getDataRange().getValues();
  var dadosDisciplinas = disciplinas.getDataRange().getValues();
  var dadosTurmas = turmas.getDataRange().getValues();

  function normalizar(txt) {
    return txt ? txt.toString().toUpperCase().trim() : "";
  }

  // Função auxiliar para evitar duplicados e retornar ID
  function buscarOuCriar(sheet, dadosAtuais, nome, colNomeNaTabela, estrutura) {
    var nomeNorm = normalizar(nome);
    if (!nomeNorm || nomeNorm === "-") return "";

    for (var i = 1; i < dadosAtuais.length; i++) {
      if (normalizar(dadosAtuais[i][colNomeNaTabela]) === nomeNorm) {
        return dadosAtuais[i][0];
      }
    }

    var novoId = sheet.getLastRow() + 1;
    var novaLinha = estrutura(novoId, nome);
    sheet.appendRow(novaLinha);
    // Atualiza a memória local para não criar o mesmo item duas vezes no mesmo loop
    dadosAtuais.push(novaLinha);
    return novoId;
  }

  var novasLotacoes = [];
  var dataAtual = new Date().toISOString();

  // Começa do 1 para pular o cabeçalho
  for (var i = 1; i < csv.length; i++) {
    var linha = csv[i];

    var profNome = linha[1];      // Coluna PROFESSOR
    var area = linha[3];          // Coluna ÁREA
    var discNome = linha[4];      // Coluna LOTAÇÃO/DISCIPLINA
    var cargaH = linha[5];        // Coluna CH
    var turmaNome = linha[6];     // Coluna TURMA

    if (!profNome || profNome === "") continue;

    // 1. Resolve Professor
    var professorId = buscarOuCriar(usuarios, dadosUsuarios, profNome, 1, function(id, nome) {
      return [id, nome, nome.toLowerCase().replace(/ /g, '.') + "@escola.com", 'professor', 'TRUE', '123456', dataAtual, dataAtual];
    });

    // 2. Resolve Disciplina
    var disciplinaId = buscarOuCriar(disciplinas, dadosDisciplinas, discNome, 1, function(id, nome) {
      return [id, nome, area, nome.substring(0,3).toUpperCase(), 'TRUE'];
    });

    // 3. Resolve Turma
    var turmaId = buscarOuCriar(turmas, dadosTurmas, turmaNome, 1, function(id, nome) {
      var serie = nome.includes("SÉRIE") ? nome.split("SÉRIE")[0] + "SÉRIE" : "Outros";
      return [id, nome, serie, 'Manhã', 2026, 'TRUE'];
    });

    // 4. Monta a linha de Lotação
    // ['id', 'professor_id', 'professor_nome', 'disciplina_id', 'disciplina_nome', 'turma_id', 'turma_nome', 'serie', 'carga_horaria_id', 'aulas_semana', 'ano_letivo', 'ativo', 'created_at', 'updated_at']
    novasLotacoes.push([
      lotacoes.getLastRow() + novasLotacoes.length + 1,
      professorId,
      profNome,
      disciplinaId,
      discNome,
      turmaId,
      turmaNome,
      turmaNome.split(' ')[0], // Tenta pegar a série pelo primeiro nome
      "", // carga_horaria_id (opcional)
      cargaH,
      2026,
      'TRUE',
      dataAtual,
      dataAtual
    ]);
  }

  // Insere tudo de uma vez para performance
  if (novasLotacoes.length > 0) {
    lotacoes.getRange(lotacoes.getLastRow() + 1, 1, novasLotacoes.length, novasLotacoes[0].length).setValues(novasLotacoes);
    SpreadsheetApp.getUi().alert('Sucesso! ' + novasLotacoes.length + ' registros importados.');
  }
}

/////

/**
 * SISTEMA SAGE - Importação de Lotação 2026.1
 * Objetivo: Popular as abas 'usuarios', 'disciplinas', 'turmas' e 'lotacoes'
 * a partir de uma aba temporária 'import_csv'.
 */
function executarImportacaoSAGE() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataRef = new Date().toISOString();

  // 1. Verificação de Aba de Origem
  const sheetCsv = ss.getSheetByName('import_csv');
  if (!sheetCsv) {
    Browser.msgBox("Erro: Crie a aba 'import_csv' e cole os dados do seu arquivo nela.");
    return;
  }

  const dados = sheetCsv.getDataRange().getValues();
  const sUsuarios = ss.getSheetByName('usuarios');
  const sDisciplinas = ss.getSheetByName('disciplinas');
  const sTurmas = ss.getSheetByName('turmas');
  const sLotacoes = ss.getSheetByName('lotacoes');

  // Mapeamento das colunas do seu arquivo específico
  // ORD[0], PROFESSOR[1], VÍNCULO[2], ÁREA[3], LOTAÇÃO/DISCIPLINA[4], CH[5], TURMA[6]
  const COL_PROF = 1, COL_AREA = 3, COL_DISC = 4, COL_CH = 5, COL_TURMA = 6;

  // Carregar caches para evitar duplicidade (Regra de Otimização do Manual)
  const cacheUser = carregarMapa(sUsuarios, 1); // Nome como chave
  const cacheDisc = carregarMapa(sDisciplinas, 1); // Nome como chave
  const cacheTurma = carregarMapa(sTurmas, 1); // Nome como chave

  let registrosLotacao = [];

  // Iniciar processamento (pula linha 1 de cabeçalho)
  for (let i = 1; i < dados.length; i++) {
    let linha = dados[i];
    let nomeProfessor = linha[COL_PROF];
    let nomeDisciplina = linha[COL_DISC];
    let nomeTurma = linha[COL_TURMA];
    let cargaHoraria = linha[COL_CH];
    let areaConhecimento = linha[COL_AREA];

    if (!nomeProfessor || nomeProfessor === "" || nomeProfessor === "-") continue;

    // A. Gerenciar Professor (Tabela: usuarios)
    let profId = cacheUser[nomeProfessor.toUpperCase()];
    if (!profId) {
      profId = sUsuarios.getLastRow() + 1;
      let emailPadrao = nomeProfessor.toLowerCase().split(" ")[0] + profId + "@escola.com";
      sUsuarios.appendRow([profId, nomeProfessor, emailPadrao, 'professor', 'TRUE', '123456', dataRef, dataRef]);
      cacheUser[nomeProfessor.toUpperCase()] = profId;
    }

    // B. Gerenciar Disciplina (Tabela: disciplinas)
    let discId = cacheDisc[nomeDisciplina.toUpperCase()];
    if (!discId) {
      discId = 100 + sDisciplinas.getLastRow();
      sDisciplinas.appendRow([discId, nomeDisciplina, areaConhecimento, nomeDisciplina.substring(0,3).toUpperCase(), 'TRUE']);
      cacheDisc[nomeDisciplina.toUpperCase()] = discId;
    }

    // C. Gerenciar Turma (Tabela: turmas)
    let turmaId = cacheTurma[nomeTurma.toUpperCase()];
    if (!turmaId) {
      turmaId = sTurmas.getLastRow() + 1;
      let serie = nomeTurma.includes("SÉRIE") ? nomeTurma.split("SÉRIE")[0] + "SÉRIE" : "Geral";
      sTurmas.appendRow([turmaId, nomeTurma, serie, 'Manhã', 2026, 'TRUE']);
      cacheTurma[nomeTurma.toUpperCase()] = turmaId;
    }

    // D. Criar Lotação (Tabela: lotacoes)
    // Conforme o cabeçalho: [id, prof_id, prof_nome, disc_id, disc_nome, turma_id, turma_nome, serie, carga_id, aulas_sem, ano, ativo, created, updated]
    registrosLotacao.push([
      sLotacoes.getLastRow() + registrosLotacao.length + 1,
      profId, nomeProfessor,
      discId, nomeDisciplina,
      turmaId, nomeTurma,
      nomeTurma.split(' ')[0],
      "", // carga_horaria_id (vazio se não houver referência direta)
      cargaHoraria,
      2026,
      'TRUE',
      dataRef,
      dataRef
    ]);
  }

  // Gravação em lote (Bulk Insert) para evitar timeout do Apps Script
  if (registrosLotacao.length > 0) {
    sLotacoes.getRange(sLotacoes.getLastRow() + 1, 1, registrosLotacao.length, registrosLotacao[0].length).setValues(registrosLotacao);
  }

  Browser.msgBox("Sucesso! O sistema SAGE foi populado com a lotação 2026.1.");
}

// Função utilitária para mapear dados existentes e evitar duplicados
function carregarMapa(aba, colunaBusca) {
  let valores = aba.getDataRange().getValues();
  let mapa = {};
  for (let i = 1; i < valores.length; i++) {
    if (valores[i][colunaBusca]) {
      mapa[valores[i][colunaBusca].toString().toUpperCase()] = valores[i][0];
    }
  }
  return mapa;
}
/**
 * Sincroniza a aba 'cargas_horarias' com base nos dados reais da aba 'lotacoes'.
 * Isso garante que disciplinas como 'CNT ENEM' apareçam na tabela de referência.
 */
function sincronizarCargasHorarias() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sLotacoes = ss.getSheetByName('lotacoes');
  const sCargas = ss.getSheetByName('cargas_horarias');

  if (!sLotacoes || !sCargas) {
    Browser.msgBox("Erro: Certifique-se que as abas 'lotacoes' e 'cargas_horarias' existem.");
    return;
  }

  const dadosLotacoes = sLotacoes.getDataRange().getValues();
  const dadosCargasAtuais = sCargas.getDataRange().getValues();

  // Criar um set para evitar duplicados na aba de cargas
  // Chave: DisciplinaID + Serie
  let chExistentes = new Set();
  for (let i = 1; i < dadosCargasAtuais.length; i++) {
    chExistentes.add(dadosCargasAtuais[i][1] + "|" + dadosCargasAtuais[i][3]);
  }

  let novasCargas = [];
  let ultimoId = 0;

  // Achar o último ID da aba cargas_horarias
  if (dadosCargasAtuais.length > 1) {
    ultimoId = Math.max(...dadosCargasAtuais.slice(1).map(r => r[0] || 0));
  }

  // Percorrer lotações para encontrar o que falta
  for (let j = 1; j < dadosLotacoes.length; j++) {
    let linha = dadosLotacoes[j];
    let discId = linha[3];
    let discNome = linha[4];
    let serie = linha[7];
    let aulasSemana = linha[9];
    let ano = linha[10];

    let chave = discId + "|" + serie;

    if (!chExistentes.has(chave)) {
      ultimoId++;
      novasCargas.push([
        ultimoId,
        discId,
        discNome,
        serie,
        aulasSemana,
        ano,
        'TRUE'
      ]);
      chExistentes.add(chave); // Evita adicionar a mesma disciplina/série duas vezes no loop
    }
  }

  if (novasCargas.length > 0) {
    sCargas.getRange(sCargas.getLastRow() + 1, 1, novasCargas.length, novasCargas[0].length).setValues(novasCargas);
    Browser.msgBox("Sucesso! " + novasCargas.length + " novas definições de carga horária foram adicionadas (incluindo CNT ENEM).");
  } else {
    Browser.msgBox("Todas as disciplinas já possuem carga horária registrada.");
  }
}

/**
 * Sincroniza a aba 'cargas_horarias' com o padrão correto de nomes de série.
 * Exemplo: Transforma "3ª" em "3ª Série".
 */
/**
 * Sincroniza a aba 'cargas_horarias' com o padrão correto de nomes de série.
 * Exemplo: Transforma "3ª" em "3ª Série".
 */
function sincronizarCargasHorariasSAGE() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sLotacoes = ss.getSheetByName('lotacoes');
  const sCargas = ss.getSheetByName('cargas_horarias');

  if (!sLotacoes || !sCargas) {
    Browser.msgBox("Erro: Abas não encontradas.");
    return;
  }

  // 1. CORREÇÃO DE DADOS EXISTENTES na Coluna D (Série)
  const rangeCargas = sCargas.getDataRange();
  let dadosCargasAtuais = rangeCargas.getValues();
  let houveAlteracao = false;

  for (let i = 1; i < dadosCargasAtuais.length; i++) {
    let serieAtual = dadosCargasAtuais[i][3].toString().trim();
    // Se tiver apenas "1ª", "2ª" ou "3ª", adiciona " Série"
    if (/^[1-3]ª$/.test(serieAtual)) {
      dadosCargasAtuais[i][3] = serieAtual + " Série";
      houveAlteracao = true;
    }
  }

  if (houveAlteracao) {
    sCargas.getDataRange().setValues(dadosCargasAtuais);
  }

  // 2. ADIÇÃO DE NOVOS REGISTROS (como CNT ENEM)
  const dadosLotacoes = sLotacoes.getDataRange().getValues();
  let chExistentes = new Set();

  // Recarrega o cache com os nomes já corrigidos
  for (let i = 1; i < dadosCargasAtuais.length; i++) {
    chExistentes.add(dadosCargasAtuais[i][1] + "|" + dadosCargasAtuais[i][3]);
  }

  let novasCargas = [];
  let ultimoId = dadosCargasAtuais.length > 1 ?
                 Math.max(...dadosCargasAtuais.slice(1).map(r => r[0] || 0)) : 0;

  for (let j = 1; j < dadosLotacoes.length; j++) {
    let discId = dadosLotacoes[j][3];
    let discNome = dadosLotacoes[j][4];
    let serieOriginal = dadosLotacoes[j][7].toString().trim();

    // Normaliza a série da lotação para o padrão "Xª Série"
    let serieNormalizada = serieOriginal;
    if (/^[1-3]ª$/.test(serieOriginal)) {
      serieNormalizada = serieOriginal + " Série";
    } else if (serieOriginal.includes("ª") && !serieOriginal.includes("Série")) {
      serieNormalizada = serieOriginal.split(" ")[0] + " Série";
    }

    let aulasSemana = dadosLotacoes[j][9];
    let ano = dadosLotacoes[j][10];
    let chave = discId + "|" + serieNormalizada;

    if (!chExistentes.has(chave) && discId) {
      ultimoId++;
      novasCargas.push([
        ultimoId,
        discId,
        discNome,
        serieNormalizada,
        aulasSemana,
        ano,
        'TRUE'
      ]);
      chExistentes.add(chave);
    }
  }

  if (novasCargas.length > 0) {
    sCargas.getRange(sCargas.getLastRow() + 1, 1, novasCargas.length, novasCargas[0].length).setValues(novasCargas);
  }

  Browser.msgBox("Aba 'cargas_horarias' atualizada e corrigida para o padrão 'Xª Série'!");
}