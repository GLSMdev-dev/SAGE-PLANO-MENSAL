# 📁 Backend - Google Apps Script

Este diretório contém o código do backend que deve ser implantado no **Google Apps Script**.

## 🚀 Como Configurar

### 1. **Criar Projeto no Google Apps Script**
1. Acesse [script.google.com](https://script.google.com)
2. Clique em **"Novo Projeto"**
3. Nomeie como **"SAGE Planos Backend"**

### 2. **Adicionar o Código**
1. Substitua todo o código padrão pelo conteúdo do arquivo `apps-script.js`
2. Salve o projeto (Ctrl+S)

### 3. **Configurar Bibliotecas**
- O código usa apenas APIs nativas do Google Apps Script
- Não são necessárias bibliotecas externas

### 4. **Implantar como Web App**
1. Clique em **"Implantar"** > **"Nova implantação"**
2. Selecione tipo **"Aplicativo da Web"**
3. Configure:
   - **Executar como:** Você (seu email)
   - **Quem pode acessar:** Qualquer pessoa
4. Clique em **"Implantar"**
5. **COPIE A URL GERADA** - você precisará dela no frontend

### 5. **Conceder Permissões**
Na primeira execução, o Apps Script pedirá permissões para:
- ✅ Ler/gravar na planilha
- ✅ Criar arquivos no Google Drive
- ✅ Gerenciar compartilhamento de arquivos

## 📊 Estrutura da Planilha

O backend criará automaticamente uma nova aba chamada **"Arquivos"** com as seguintes colunas:

| Coluna | Descrição |
|--------|-----------|
| id | ID único do arquivo |
| plano_id | ID do plano de aula |
| semana | Número da semana |
| aula | Número da aula |
| tipo | `recursos` ou `avaliacao` |
| nome_original | Nome original do arquivo |
| drive_file_id | ID do arquivo no Drive |
| drive_url | URL para download |
| tamanho | Tamanho em bytes |
| mime_type | Tipo MIME do arquivo |
| uploaded_by | ID do usuário que fez upload |
| uploaded_at | Data/hora do upload |

## 🔗 Integração com Frontend

### URL da API
Configure a `API_URL` no arquivo `config-template.js` com a URL gerada na implantação.

### Endpoints Disponíveis

#### **Upload de Arquivo**
```
POST /upload
Content-Type: multipart/form-data

Parâmetros:
- file: Arquivo a ser enviado
- fileName: Nome do arquivo
- planoId: ID do plano
- semana: Número da semana
- aula: Número da aula
- tipo: 'recursos' ou 'avaliacao'
- usuarioId: ID do usuário
```

#### **Listar Arquivos**
```
GET /?entity=arquivos&action=listar&planoId=123
```

#### **Deletar Arquivo**
```
GET /?entity=arquivos&action=deletar&id=file_123
```

## 🗂️ Estrutura no Google Drive

```
📁 SAGE_Planos_Arquivos/
  📁 Plano_123/
    📄 atividade.pdf
    📄 avaliacao.docx
  📁 Plano_456/
    📄 material.jpg
```

## ⚠️ Considerações de Segurança

- Arquivos são compartilhados com **"Qualquer pessoa com o link"**
- Apenas usuários logados podem fazer upload
- Controle de permissões deve ser feito no frontend
- Considere implementar autenticação adicional se necessário

## 🐛 Troubleshooting

### Erro: "Script não autorizado"
- Execute o script manualmente primeiro para conceder permissões

### Erro: "Quota exceeded"
- Google Apps Script tem limites diários de execução
- Considere upgrade para plano pago se necessário

### Arquivos não aparecem
- Verifique se a pasta foi criada corretamente
- Confirme permissões de compartilhamento