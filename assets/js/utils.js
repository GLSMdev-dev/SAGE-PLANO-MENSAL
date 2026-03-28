// utils.js - Funções utilitárias

const Utils = (() => {
    
    function mostrarLoading(mostrar) {
        let overlay = document.getElementById('loadingOverlay');
        
        if (mostrar) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'loadingOverlay';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255,255,255,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                `;
                overlay.innerHTML = '<div class="spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4CAF50; border-radius: 50%; animation: spin 1s linear infinite;"></div>';
                document.body.appendChild(overlay);
                
                // Adicionar keyframes se não existir
                if (!document.getElementById('spinnerKeyframes')) {
                    const style = document.createElement('style');
                    style.id = 'spinnerKeyframes';
                    style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
                    document.head.appendChild(style);
                }
            }
            overlay.style.display = 'flex';
        } else {
            if (overlay) {
                overlay.style.display = 'none';
            }
        }
    }
    
    function mostrarMensagem(mensagem, tipo = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.textContent = mensagem;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 5px;
            color: white;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#ff9800'};
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    function formatarData(dataStr) {
        if (!dataStr) return '';
        const data = new Date(dataStr);
        if (isNaN(data.getTime())) return dataStr;
        return data.toLocaleDateString('pt-BR');
    }
    
    function formatarDataHora(dataStr) {
        if (!dataStr) return '';
        const data = new Date(dataStr);
        if (isNaN(data.getTime())) return dataStr;
        return data.toLocaleString('pt-BR');
    }
    
    function escapeHtml(texto) {
        if (!texto) return '';
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }
    
    function confirmarAcao(mensagem, callback) {
        if (confirm(mensagem)) {
            callback(true);
        } else {
            callback(false);
        }
    }
    
    // Aplicar tema visual ao site
    function aplicarTema(configs) {
        if (!configs || !configs.length) return;
        
        // Converter array para objeto
        const tema = {};
        configs.forEach(item => {
            tema[item.chave] = item.valor;
        });
        
        // Criar ou atualizar estilo global
        let styleTag = document.getElementById('theme-styles');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'theme-styles';
            document.head.appendChild(styleTag);
        }
        
        // Gerar CSS com as variáveis
        let css = ':root {\n';
        if (tema.cor_primaria) css += `  --primary-color: ${tema.cor_primaria};\n`;
        if (tema.cor_secundaria) css += `  --secondary-color: ${tema.cor_secundaria};\n`;
        if (tema.cor_fundo) css += `  --bg-color: ${tema.cor_fundo};\n`;
        if (tema.cor_texto) css += `  --text-color: ${tema.cor_texto};\n`;
        if (tema.fonte_principal) css += `  --font-family: ${tema.fonte_principal};\n`;
        if (tema.tamanho_fonte_base) css += `  --font-size-base: ${tema.tamanho_fonte_base}px;\n`;
        if (tema.borda_arredondada) css += `  --button-radius: ${tema.borda_arredondada}px;\n`;
        if (tema.botao_padding) css += `  --button-padding: ${tema.botao_padding}px;\n`;
        if (tema.card_sombra) css += `  --card-shadow: ${tema.card_sombra};\n`;
        if (tema.card_radius) css += `  --card-radius: ${tema.card_radius}px;\n`;
        if (tema.espacamento_padrao) css += `  --spacing: ${tema.espacamento_padrao}px;\n`;
        if (tema.header_bg) css += `  --header-bg: ${tema.header_bg};\n`;
        if (tema.header_texto) css += `  --header-text: ${tema.header_texto};\n`;
        css += '}\n\n';
        
        // Aplicar estilos aos elementos
        css += `body {\n`;
        if (tema.cor_fundo) css += `  background-color: var(--bg-color);\n`;
        if (tema.cor_texto) css += `  color: var(--text-color);\n`;
        if (tema.fonte_principal) css += `  font-family: var(--font-family);\n`;
        if (tema.tamanho_fonte_base) css += `  font-size: var(--font-size-base);\n`;
        css += `}\n\n`;
        
        css += `.header {\n`;
        if (tema.header_bg) css += `  background-color: var(--header-bg);\n`;
        if (tema.header_texto) css += `  color: var(--header-text);\n`;
        css += `}\n\n`;
        
        css += `.btn-primary, .btn-login, button[class*="btn-primary"] {\n`;
        if (tema.cor_primaria) css += `  background-color: var(--primary-color) !important;\n`;
        if (tema.borda_arredondada) css += `  border-radius: var(--button-radius) !important;\n`;
        if (tema.botao_padding) css += `  padding: var(--button-padding) 24px !important;\n`;
        css += `}\n\n`;
        
        css += `.btn-secondary {\n`;
        if (tema.cor_secundaria) css += `  background-color: var(--secondary-color) !important;\n`;
        css += `}\n\n`;
        
        css += `.card, .menu-card, .plano-card, .config-sidebar, .config-content {\n`;
        if (tema.card_radius) css += `  border-radius: var(--card-radius) !important;\n`;
        if (tema.card_sombra) css += `  box-shadow: var(--card-shadow) !important;\n`;
        css += `}\n\n`;
        
        styleTag.textContent = css;
        
        // Aplicar diretamente ao header
        const header = document.querySelector('.header');
        if (header && tema.header_bg) {
            header.style.backgroundColor = tema.header_bg;
        }
        if (header && tema.header_texto) {
            header.style.color = tema.header_texto;
            const headerLinks = header.querySelectorAll('a, button');
            headerLinks.forEach(link => {
                link.style.color = tema.header_texto;
            });
        }
    }
    
    return {
        mostrarLoading,
        mostrarMensagem,
        formatarData,
        formatarDataHora,
        escapeHtml,
