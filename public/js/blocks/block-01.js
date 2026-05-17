/*
 * Extracted from public/index.html
 * Original script block: 1
 * Original HTML lines: 9-16
 */

window.onerror = function(message, source, lineno, colno, error) {
            console.error("Критическая ошибка:", message, lineno);
            let loader = document.getElementById('global-loader');
            if(loader) loader.classList.remove('show');
            return true; 
        };
