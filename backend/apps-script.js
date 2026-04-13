// Google Apps Script - Backend para SAGE Planos
// Este arquivo deve ser implantado como Web App no Google Apps Script

function doPost(e) {
  try {
    const params = e.parameter;
    const entity = params.entity;
    const action = params.action;

    // Roteamento das requisições
    switch(entity) {
      case 'arquivos':
        return handleArquivos(action, params, e);
      default:
        return ContentService
          .createTextOutput(JSON.stringify({success: false, error: 'Entidade não encontrada'}))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleArquivos(action, params, e) {
  switch(action) {
    case 'upload':
      return uploadArquivo(e);
    case 'listar':
      return listarArquivos(params);
    case 'deletar':
      return deletarArquivo(params.id);
    default:
      return ContentService
        .createTextOutput(JSON.stringify({success: false, error: 'Ação não encontrada'}))
        .setMimeType(ContentService.MimeType.JSON);
  }
}

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

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        dados: {
          id: file.getId(),
          url: file.getUrl(),
          nome: fileName,
          tamanho: file.getSize()
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function listarArquivos(params) {
  try {
    const planoId = params.planoId;
    const sheet = getSheetByName('Arquivos');

    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({success: true, dados: []}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const arquivos = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[1] == planoId) { // coluna plano_id
        const arquivo = {};
        headers.forEach((header, index) => {
          arquivo[header] = row[index];
        });
        arquivos.push(arquivo);
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({success: true, dados: arquivos}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function deletarArquivo(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);

    // Remover da planilha também
    const sheet = getSheetByName('Arquivos');
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][6] === fileId) { // coluna drive_file_id
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function salvarMetadadosArquivo(dados) {
  const sheet = getOrCreateSheet('Arquivos');

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

function getOrCreateSheet(nome) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(nome);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(nome);
  }

  return sheet;
}

function getSheetByName(nome) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(nome);
}

function generateId() {
  return 'file_' + new Date().getTime() + '_' + Math.random().toString(36).substr(2, 9);
}