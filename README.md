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
  - Recursos didáticos (com upload de arquivos)
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

## 🏗️ Arquitetura do Sistema
