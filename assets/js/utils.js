// utils.js - Funções utilitárias

const Utils = (() => {
    
    function mostrarLoading(mostrar) {
        let overlay = document.getElementById('loadingOverlay');
        
        if (mostrar) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'loadingOverlay';
                overlay.className = 'loading-overlay';
                overlay.innerHTML = '<div class="spinner"></div>';
                document.body.appendChild(overlay);
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
    
    return {
        mostrarLoading,
        mostrarMensagem,
        formatarData,
        formatarDataHora,
        escapeHtml,
        confirmarAcao
    };
})();
