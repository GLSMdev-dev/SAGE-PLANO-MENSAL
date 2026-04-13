# 🚀 Guia de Deploy - SAGE Planos v2.0

## ✅ Sistema Integrado: CRUD + Upload de Arquivos

Este guia mostra como fazer o deploy completo do sistema SAGE Planos com todas as funcionalidades integradas.

---

## 📋 Checklist de Deploy

### ✅ Backend (Google Apps Script)
- [ ] Criar projeto no Apps Script
- [ ] Configurar planilha Google Sheets
- [ ] Fazer deploy da Web App
- [ ] Copiar URL da API

### ✅ Frontend (GitHub Pages)
- [ ] Configurar secrets no GitHub
- [ ] Executar workflow de deploy
- [ ] Testar acesso ao sistema

### ✅ Upload de Arquivos
- [ ] Verificar permissões do Apps Script
- [ ] Testar upload de arquivo
- [ ] Verificar estrutura de pastas no Drive

---

## 🔧 Passo a Passo Detalhado

### 1. Backend - Google Apps Script

#### 1.1 Criar Projeto
1. Acesse [script.google.com](https://script.google.com)
2. Clique em **"Novo Projeto"**
3. Nomeie como **"SAGE-Planos-API-v2"**

#### 1.2 Configurar Planilha
1. Crie nova planilha em [sheets.google.com](https://sheets.google.com)
2. Copie o ID da URL: `https://docs.google.com/spreadsheets/d/[ID_AQUI]/edit`
3. No Apps Script, localize a linha:
   ```javascript
   const SPREADSHEET_ID = 'COLE_O_ID_AQUI';
   ```

#### 1.3 Colar Código
1. Abra o arquivo `backend/apps-script.js` deste repositório
2. Copie TODO o conteúdo
3. Cole no editor do Apps Script
4. Clique em **"Salvar"** (ícone de disquete)

#### 1.4 Deploy da Web App
1. Clique em **"Deploy"** > **"New deployment"**
2. Selecione tipo **"Web app"**
3. Configure:
   - **Execute as:** Seu email
   - **Who has access:** Anyone
4. Clique em **"Authorize access"**
5. Autorize todas as permissões solicitadas
6. Clique em **"Deploy"**
7. **COPIE A URL GERADA** - guarde para o próximo passo!

### 2. Frontend - GitHub Pages

#### 2.1 Configurar Secrets
1. No seu repositório GitHub, vá para **Settings** > **Secrets and variables** > **Actions**
2. Clique em **"New repository secret"**
3. Adicione:
   - **Nome:** `API_URL`
   - **Valor:** URL copiada do Apps Script
4. Adicione outro secret:
   - **Nome:** `SPREADSHEET_ID`
   - **Valor:** ID da planilha Google Sheets

#### 2.2 Executar Deploy
1. Vá para a aba **"Actions"** no GitHub
2. Clique no workflow **"Deploy to GitHub Pages"**
3. Clique em **"Run workflow"**
4. Aguarde a conclusão (cerca de 2-3 minutos)

#### 2.3 Verificar Deploy
1. Vá para **Settings** > **Pages**
2. A URL do seu site estará disponível
3. Teste o acesso

### 3. Teste Completo do Sistema

#### 3.1 Login e Navegação
- Acesse a URL do GitHub Pages
- Teste login com credenciais padrão:
  - **Admin:** admin@escola.com / admin123
  - **Professor:** joao.silva@escola.com / 123456

#### 3.2 Teste de Upload
1. Faça login como professor
2. Vá para "Criar Plano de Aula"
3. Preencha os dados básicos
4. Na seção "Recursos", clique em "Escolher arquivo"
5. Selecione um arquivo pequeno (PDF, DOC, etc.)
6. Clique em "Adicionar Recurso"
7. Salve o plano
8. Verifique se o arquivo foi criado no Google Drive

#### 3.3 Verificar Estrutura
- No Google Drive, procure a pasta **"SAGE_Planos_Arquivos"**
- Dentro dela deve haver uma pasta com o ID do plano
- O arquivo deve estar lá e ser acessível publicamente

---

## 🔍 Troubleshooting

### Erro: "Configuração não carregada"
- Verifique se o `config.js` foi criado corretamente
- Confirme se a URL da API está correta nos secrets do GitHub

### Erro: "Aba X não encontrada"
- Execute a função `atualizarPlanilhaCompleta()` no Apps Script
- Isso criará todas as abas necessárias automaticamente

### Upload não funciona
- Verifique permissões do Apps Script para Google Drive
- Confirme se o projeto tem acesso à API do Drive
- Teste se consegue criar arquivos manualmente no Drive via Apps Script

### Arquivos não aparecem
- Verifique se a aba "arquivos" foi criada na planilha
- Confirme se o upload retornou sucesso
- Verifique logs do navegador (F12 > Console)

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do navegador (F12)
2. Teste a API diretamente: `SUA_API_URL?entity=usuarios&action=listar`
3. Verifique os logs de execução no Apps Script
4. Abra uma issue no repositório

---

## 🎉 Pronto!

Seu sistema SAGE Planos está totalmente funcional com:
- ✅ CRUD completo de usuários, turmas, disciplinas
- ✅ Gestão de planos de aula mensais
- ✅ Upload real de arquivos para Google Drive
- ✅ Interface responsiva e moderna
- ✅ Controle de permissões por perfil

**URL do sistema:** [Será mostrada após o deploy]