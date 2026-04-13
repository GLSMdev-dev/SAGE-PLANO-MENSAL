# 📚 SAGE Planos - Sistema de Gestão de Planos de Aula Mensais

[![Deploy to GitHub Pages](https://github.com/glsmdev-dev/SAGE-PLANO-MENSAL/actions/workflows/deploy.yml/badge.svg)](https://github.com/glsmdev-dev/SAGE-PLANO-MENSAL/actions/workflows/deploy.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)]()

## 📖 Sobre o Projeto

O **SAGE Planos** é um sistema completo para gestão de planos de aula mensais, desenvolvido com **Google Sheets** como banco de dados, **Google Apps Script** como API e **GitHub Pages** para hospedagem. A solução permite que professores criem planos de aula detalhados, gestores aprovem ou solicitem revisões, e administradores gerenciem todo o sistema.

### 🎯 Público-alvo
- Escolas e instituições de ensino
- Professores que precisam organizar planos de aula mensais
- Gestores escolares que acompanham e aprovam planos
- Administradores que gerenciam usuários, turmas e disciplinas

---

## ✨ Funcionalidades

### 👨‍💻 Para Professores
- ✅ Login seguro com perfil específico
- ✅ Visualização das próprias lotações (disciplinas e turmas)
- ✅ Criação de planos de aula mensais com:
  - Conteúdo programático do mês
  - Sub-conteúdo por aula
  - Metodologia por aula
  - Avaliação por aula
  - **Recursos didáticos (com upload real de arquivos para Google Drive)**
  - Referências bibliográficas
- ✅ Carga horária automática por disciplina/série
- ✅ Adicionar/remover semanas conforme necessidade
- ✅ Salvar como rascunho
- ✅ Enviar para aprovação do gestor
- ✅ Visualizar feedback do gestor
- ✅ Editar planos em revisão
- ✅ Imprimir planos de aula

### 👔 Para Gestores
- ✅ Login seguro com perfil específico
- ✅ Visualização de estatísticas (planos enviados, aprovados, revisar)
- ✅ Gerenciamento de lotação de professores (múltiplas disciplinas/turmas)
- ✅ Consulta de planos de aula com filtros avançados:
  - Por professor
  - Por disciplina
  - Por série
  - Por status
  - Por mês
- ✅ Visualização detalhada de planos (incluindo arquivos anexados)
- ✅ Aprovação de planos
- ✅ Solicitação de revisão com feedback
- ✅ Impressão de planos

### 👑 Para Administradores
- ✅ Login seguro com perfil específico
- ✅ Dashboard com estatísticas do sistema
- ✅ Gerenciamento completo de usuários (CRUD)
  - Admin, Gestor, Professor, DEV
  - Ativar/desativar usuários com toggle switch
- ✅ Gerenciamento completo de turmas (CRUD)
  - Suporte a turnos: Manhã, Tarde, Noite, Integral
  - Ano letivo dinâmico
- ✅ Gerenciamento completo de disciplinas (CRUD)
  - Áreas do conhecimento
  - Siglas para identificação
- ✅ Gerenciamento de cargas horárias por disciplina/série
  - Configuração de aulas por semana
  - Personalizado por série (1ª, 2ª, 3ª)

### 🔧 Para Desenvolvedores (Modo DEV)
- ✅ Login com perfil especial DEV
- ✅ Configuração visual do sistema:
  - Cores (primária, secundária, fundo, texto, cabeçalho)
  - Fontes (tipo e tamanho)
  - Estilo de botões (arredondamento, padding)
  - Estilo de cards (sombra, arredondamento)
  - Espaçamentos
- ✅ Preview em tempo real das alterações
- ✅ Persistência das configurações no banco de dados
- ✅ Informações técnicas do sistema (versão, API, planilha)

---

## 🚀 Configuração e Deploy

### 📋 Pré-requisitos
- Conta Google (para Google Sheets e Apps Script)
- Conta GitHub (para hospedagem)
- Navegador moderno com suporte a ES6+

### 🔧 Configuração do Backend (Google Apps Script)

1. **Criar novo projeto no Google Apps Script:**
   - Acesse [script.google.com](https://script.google.com)
   - Clique em "Novo Projeto"
   - Nomeie como "SAGE-Planos-API"

2. **Configurar a Planilha Google Sheets:**
   - Crie uma nova planilha em [sheets.google.com](https://sheets.google.com)
   - Copie o ID da planilha da URL (parte entre `/d/` e `/edit`)
   - Atualize a constante `SPREADSHEET_ID` no código Apps Script

3. **Deploy do Apps Script:**
   - Cole o código completo do arquivo `backend/apps-script.js`
   - Clique em "Salvar" (ícone de disquete)
   - Clique em "Deploy" > "New deployment"
   - Selecione tipo "Web app"
   - Configure:
     - **Execute as:** Me (seu email)
     - **Who has access:** Anyone
   - Clique em "Deploy"
   - **COPIE A URL GERADA** - você precisará dela!

4. **Configurar permissões:**
   - O Apps Script precisa de permissões para:
     - Ler/escrever na planilha
     - Criar arquivos no Google Drive
     - Compartilhar arquivos publicamente

### 🌐 Configuração do Frontend (GitHub Pages)

1. **Fork ou clone este repositório:**
   ```bash
   git clone https://github.com/SEU_USERNAME/SAGE-PLANO-MENSAL.git
   cd SAGE-PLANO-MENSAL
   ```

2. **Configurar variáveis de ambiente:**
   - No GitHub, vá para Settings > Secrets and variables > Actions
   - Adicione as seguintes secrets:
     - `API_URL`: URL do seu Apps Script (copiada no passo 3 acima)
     - `SPREADSHEET_ID`: ID da sua planilha Google Sheets

3. **Deploy automático:**
   - O GitHub Actions fará o deploy automático quando você fizer push
   - Ou clique em "Actions" > "Deploy to GitHub Pages" > "Run workflow"

4. **Configuração manual (desenvolvimento local):**
   - Edite `assets/js/config.js`:
   ```javascript
   window.APP_CONFIG = {
       API_URL: 'https://script.google.com/macros/s/SEU_SCRIPT_ID/exec',
       SPREADSHEET_ID: 'SUA_PLANILHA_ID',
       APP_NAME: 'SAGE Planos',
       APP_VERSION: '2.0.0'
   };
   ```

### 📁 Estrutura de Arquivos no Google Drive

O sistema cria automaticamente a seguinte estrutura:
```
📁 SAGE_Planos_Arquivos/
  📁 Plano_123/
    📄 aula_recursos_semana1.pdf
    📄 aula_avaliacao_semana2.docx
    ...
```

### 🧪 Teste do Sistema

1. **Teste básico:**
   - Acesse a URL do GitHub Pages
   - Tente fazer login com as credenciais padrão

2. **Teste de upload:**
   - Faça login como professor
   - Crie um novo plano de aula
   - Adicione um arquivo de recurso
   - Verifique se o arquivo aparece no Google Drive

3. **Credenciais padrão:**
   - **Admin:** admin@escola.com / admin123
   - **Gestor:** ana.paula@escola.com / 123456
   - **Professor:** joao.silva@escola.com / 123456

---

## 🏗️ Arquitetura do Sistema
