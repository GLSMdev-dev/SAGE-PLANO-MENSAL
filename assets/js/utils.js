// utils.js - Funções utilitárias

const Utils = (() => {
    
    function mostrarLoading(mostrar) {
        let overlay = document.getElementById('loadingOverlay');
        if (mostrar) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'loadingOverlay';
                overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;';
                overlay.innerHTML = '<div style="width:40px;height:40px;border:4px solid #f3f3f3;border-top:4px solid #4CAF50;border-radius:50%;animation:spin 1s linear infinite;"></div>';
                document.body.appendChild(overlay);
                if (!document.getElementById('spinnerKeyframes')) { const style = document.createElement('style'); style.id = 'spinnerKeyframes'; style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }'; document.head.appendChild(style); }
            }
            overlay.style.display = 'flex';
        } else if (overlay) overlay.style.display = 'none';
    }
    
    function mostrarMensagem(mensagem, tipo = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.textContent = mensagem;
        toast.style.cssText = `position:fixed;bottom:20px;right:20px;padding:12px 20px;border-radius:5px;color:white;z-index:10000;animation:slideIn 0.3s ease;background:${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#ff9800'};`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    function formatarData(dataStr) { if (!dataStr) return ''; const d = new Date(dataStr); if (isNaN(d.getTime())) return dataStr; return d.toLocaleDateString('pt-BR'); }
    function formatarDataHora(dataStr) { if (!dataStr) return ''; const d = new Date(dataStr); if (isNaN(d.getTime())) return dataStr; return d.toLocaleString('pt-BR'); }
    function escapeHtml(texto) { if (!texto) return ''; const div = document.createElement('div'); div.textContent = texto; return div.innerHTML; }
    function confirmarAcao(mensagem, callback) { if (confirm(mensagem)) callback(true); else callback(false); }
    
    function aplicarTema(configs) {
        if (!configs || !configs.length) return;
        const tema = {};
        configs.forEach(item => { tema[item.chave] = item.valor; });
        let styleTag = document.getElementById('theme-styles');
        if (!styleTag) { styleTag = document.createElement('style'); styleTag.id = 'theme-styles'; document.head.appendChild(styleTag); }
        let css = ':root{\n';
        if (tema.cor_primaria) css += `--primary-color:${tema.cor_primaria};\n`;
        if (tema.cor_secundaria) css += `--secondary-color:${tema.cor_secundaria};\n`;
        if (tema.cor_fundo) css += `--bg-color:${tema.cor_fundo};\n`;
        if (tema.cor_texto) css += `--text-color:${tema.cor_texto};\n`;
        if (tema.fonte_principal) css += `--font-family:${tema.fonte_principal};\n`;
        if (tema.tamanho_fonte_base) css += `--font-size-base:${tema.tamanho_fonte_base}px;\n`;
        if (tema.borda_arredondada) css += `--button-radius:${tema.borda_arredondada}px;\n`;
        if (tema.botao_padding) css += `--button-padding:${tema.botao_padding}px;\n`;
        if (tema.card_sombra) css += `--card-shadow:${tema.card_sombra};\n`;
        if (tema.card_radius) css += `--card-radius:${tema.card_radius}px;\n`;
        if (tema.espacamento_padrao) css += `--spacing:${tema.espacamento_padrao}px;\n`;
        if (tema.header_bg) css += `--header-bg:${tema.header_bg};\n`;
        if (tema.header_texto) css += `--header-text:${tema.header_texto};\n`;
        css += '}\n';
        css += `body{background-color:var(--bg-color,#f5f5f5);color:var(--text-color,#333);font-family:var(--font-family);font-size:var(--font-size-base,16px);}\n`;
        css += `.header{background-color:var(--header-bg,#4CAF50);color:var(--header-text,#fff);}\n`;
        css += `.btn-primary,.btn-login{background-color:var(--primary-color,#4CAF50) !important;border-radius:var(--button-radius,8px) !important;padding:var(--button-padding,12px) 24px !important;}\n`;
        css += `.btn-secondary{background-color:var(--secondary-color,#2196F3) !important;}\n`;
        css += `.card,.menu-card,.plano-card,.config-sidebar,.config-content{border-radius:var(--card-radius,8px) !important;box-shadow:var(--card-shadow,0 2px 4px rgba(0,0,0,0.1)) !important;}\n`;
        styleTag.textContent = css;
        const header = document.querySelector('.header'); if (header && tema.header_bg) header.style.backgroundColor = tema.header_bg;
        if (header && tema.header_texto) { header.style.color = tema.header_texto; header.querySelectorAll('a, button').forEach(link => link.style.color = tema.header_texto); }
    }
    
    return { mostrarLoading, mostrarMensagem, formatarData, formatarDataHora, escapeHtml, confirmarAcao, aplicarTema };
})();
