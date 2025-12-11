class ClickerGame {
    constructor() {
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.totalClicks = 0;
        this.gameStartTime = Date.now();
        this.lastClickTimes = [];
        
        this.initElements();
        this.initEventListeners();
        this.loadGameState();
        this.updateDisplay();
        this.startStatsUpdate();
    }
    
    initElements() {
        this.elements = {
            scoreDisplay: document.getElementById('scoreDisplay'),
            highScore: document.getElementById('highScore'),
            levelImage: document.getElementById('levelImage'),
            currentLevel: document.getElementById('currentLevel'),
            levelName: document.getElementById('levelName'),
            progressBar: document.getElementById('progressBar'),
            progressText: document.getElementById('progressText'),
            nextLevelThreshold: document.getElementById('nextLevelThreshold'),
            totalClicks: document.getElementById('totalClicks'),
            clicksPerSecond: document.getElementById('clicksPerSecond'),
            clickButton: document.getElementById('clickButton'),
            resetButton: document.getElementById('resetButton'),
            themeToggle: document.getElementById('themeToggle'),
            testApiButton: document.getElementById('testApiButton'),
            autoClickButton: document.getElementById('autoClickButton'),
            apiResponse: document.getElementById('apiResponse')
        };
    }
    
    initEventListeners() {
        // Клик по основной кнопке
        this.elements.clickButton.addEventListener('click', () => this.handleClick());
        
        // Сброс игры
        this.elements.resetButton.addEventListener('click', () => this.resetGame());
        
        // Переключение темы
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Тест API
        this.elements.testApiButton.addEventListener('click', () => this.testAllEndpoints());
        
        // Автоклик
        this.elements.autoClickButton.addEventListener('click', () => this.startAutoClick());
        
        // Тесты отдельных endpoint'ов
        document.querySelectorAll('.api-test-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const endpoint = e.target.dataset.endpoint;
                const method = e.target.dataset.method || 'GET';
                this.testEndpoint(endpoint, method);
            });
        });
        
        // Клик по кнопке через пробел
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.handleClick();
            }
        });
    }
    
    async handleClick() {
        try {
            const response = await fetch('/api/game/click', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.score = data.newScore;
                this.totalClicks++;
                this.lastClickTimes.push(Date.now());
                
                // Обновляем рекорд
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('highScore', this.highScore);
                }
                
                // Создаем эффект клика
                this.createClickEffect();
                
                // Обновляем отображение с новыми данными
                this.updateDisplayWithLevelData(data);
                
                // Логируем в консоль
                console.log('Клик обработан:', data);
            }
        } catch (error) {
            console.error('Ошибка при клике:', error);
            this.showApiResponse({ error: 'Ошибка соединения с сервером' });
        }
    }
    
    createClickEffect() {
        const button = this.elements.clickButton;
        const effect = document.createElement('div');
        effect.className = 'click-effect';
        effect.textContent = '+1';
        effect.style.left = `${Math.random() * 80 + 10}%`;
        button.appendChild(effect);
        
        setTimeout(() => effect.remove(), 500);
    }
    
    async updateDisplay() {
        try {
            const response = await fetch('/api/game/score');
            const data = await response.json();
            
            this.score = data.score;
            this.totalClicks = data.totalClicks;
            this.highScore = Math.max(this.highScore, data.highScore);
            
            // Получаем информацию об уровне
            const levelResponse = await fetch(`/api/game/level/${this.score}`);
            const levelData = await levelResponse.json();
            
            // Обновляем отображение
            this.updateDisplayWithLevelData(levelData);
            
        } catch (error) {
            console.error('Ошибка обновления:', error);
        }
    }
    
    updateDisplayWithLevelData(data) {
        // Обновляем счет
        this.elements.scoreDisplay.textContent = this.score;
        this.elements.highScore.textContent = this.highScore;
        this.elements.totalClicks.textContent = this.totalClicks;
        
        // Обновляем информацию об уровне
        if (data.currentLevel) {
            this.elements.levelImage.textContent = data.currentLevel.image;
            this.elements.currentLevel.textContent = data.levelNumber || 0;
            this.elements.levelName.textContent = data.currentLevel.name || data.currentLevel.image;
        }
        
        // Обновляем прогресс
        if (data.progress !== undefined) {
            const progress = data.progressPercentage || data.progress;
            this.elements.progressBar.style.width = `${progress}%`;
            this.elements.progressText.textContent = `${progress.toFixed(1)}%`;
        }
        
        // Обновляем следующий уровень
        if (data.nextLevel) {
            this.elements.nextLevelThreshold.textContent = data.nextLevel.threshold;
        } else if (data.nextLevelThreshold) {
            this.elements.nextLevelThreshold.textContent = data.nextLevelThreshold;
        } else if (data.remainingToNextLevel !== undefined) {
            const nextThreshold = this.score + data.remainingToNextLevel;
            this.elements.nextLevelThreshold.textContent = nextThreshold;
        }
        
        // Сохраняем состояние игры
        this.saveGameState();
    }
    
    async resetGame() {
        if (!confirm('Вы уверены, что хотите сбросить игру?')) return;
        
        try {
            const response = await fetch('/api/game/reset', {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.score = 0;
                this.totalClicks = 0;
                this.lastClickTimes = [];
                this.gameStartTime = Date.now();
                
                this.updateDisplay();
                this.showApiResponse(data, 'Игра сброшена!');
                
                console.log('Игра сброшена:', data);
            }
        } catch (error) {
            console.error('Ошибка сброса:', error);
            this.showApiResponse({ error: 'Ошибка сброса игры' });
        }
    }
    
    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        const icon = this.elements.themeToggle.querySelector('i');
        
        if (isDark) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            icon.className = 'fas fa-moon';
            this.elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i> Темная тема';
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            icon.className = 'fas fa-sun';
            this.elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i> Светлая тема';
        }
        
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    }
    
    async testAllEndpoints() {
        const endpoints = [
            { url: '/api/game/score', method: 'GET' },
            { url: '/api/game/level', method: 'GET' },
            { url: '/api/game/stats', method: 'GET' }
        ];
        
        this.showApiResponse({ message: 'Тестирование всех endpointов...' });
        
        for (const endpoint of endpoints) {
            await this.testEndpoint(endpoint.url, endpoint.method, false);
            await new Promise(resolve => setTimeout(resolve, 500)); // Задержка между запросами
        }
        
        this.showApiResponse({ 
            message: 'Все endpointы протестированы успешно!',
            timestamp: new Date().toISOString() 
        });
    }
    
    async testEndpoint(endpoint, method = 'GET', showAlert = true) {
        try {
            const options = {
                method: method,
                headers: { 'Content-Type': 'application/json' }
            };
            
            if (method === 'POST' || method === 'PUT') {
                options.body = JSON.stringify({ test: true });
            }
            
            // Подсвечиваем кнопку
            const button = document.querySelector(`[data-endpoint="${endpoint}"]`);
            if (button) {
                button.classList.add('api-call');
                setTimeout(() => button.classList.remove('api-call'), 1000);
            }
            
            const response = await fetch(endpoint, options);
            const data = await response.json();
            
            if (showAlert) {
                this.showApiResponse(data, `Endpoint: ${method} ${endpoint}`);
            }
            
            console.log(`Тест ${method} ${endpoint}:`, data);
            return data;
            
        } catch (error) {
            console.error(`Ошибка теста ${endpoint}:`, error);
            this.showApiResponse({ 
                error: `Ошибка запроса к ${endpoint}`,
                details: error.message 
            });
        }
    }
    
    async startAutoClick() {
        const duration = 10000; // 10 секунд
        const interval = 100; // Каждые 100 мс
        const clicks = duration / interval;
        
        this.elements.autoClickButton.disabled = true;
        this.elements.autoClickButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Автоклик...';
        
        this.showApiResponse({ 
            message: `Запуск автоклика на ${duration/1000} секунд...`,
            clicks: clicks,
            interval: interval 
        });
        
        for (let i = 0; i < clicks; i++) {
            await this.handleClick();
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        
        this.elements.autoClickButton.disabled = false;
        this.elements.autoClickButton.innerHTML = '<i class="fas fa-robot"></i> Автоклик (10 сек)';
        
        this.showApiResponse({ 
            message: 'Автоклик завершен!',
            totalClicks: clicks,
            finalScore: this.score 
        });
    }
    
    startStatsUpdate() {
        setInterval(() => {
            // Расчет кликов в секунду
            const now = Date.now();
            this.lastClickTimes = this.lastClickTimes.filter(time => now - time < 1000);
            const cps = this.lastClickTimes.length;
            
            this.elements.clicksPerSecond.textContent = cps.toFixed(2);
        }, 1000);
    }
    
    showApiResponse(data, title = 'Ответ сервера') {
        const formattedResponse = JSON.stringify(data, null, 2);
        this.elements.apiResponse.textContent = `// ${title}\n${formattedResponse}`;
        
        // Прокручиваем к началу
        this.elements.apiResponse.scrollTop = 0;
    }
    
    saveGameState() {
        const gameState = {
            score: this.score,
            highScore: this.highScore,
            totalClicks: this.totalClicks,
            savedAt: Date.now()
        };
        
        localStorage.setItem('clickerGameState', JSON.stringify(gameState));
    }
    
    loadGameState() {
        const saved = localStorage.getItem('clickerGameState');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.score = state.score || 0;
                this.highScore = state.highScore || 0;
                this.totalClicks = state.totalClicks || 0;
                
                // Загружаем тему
                const savedTheme = localStorage.getItem('theme') || 'light';
                if (savedTheme === 'dark') {
                    document.body.classList.add('dark-theme');
                    document.body.classList.remove('light-theme');
                    this.elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i> Светлая тема';
                }
            } catch (error) {
                console.error('Ошибка загрузки состояния:', error);
            }
        }
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.game = new ClickerGame();
    
    // Выводим информацию об API в консоль
    console.log('%c🎮 Кликер Игра - Express API', 'color: #4a90e2; font-size: 16px; font-weight: bold;');
    console.log('%cДоступные endpointы:', 'color: #8a2be2; font-weight: bold;');
    console.log('• GET  /api/game/score      - Получить текущий счет');
    console.log('• POST /api/game/click      - Увеличить счет на клик');
    console.log('• GET  /api/game/level      - Получить информацию об уровне');
    console.log('• GET  /api/game/stats      - Получить полную статистику');
    console.log('• POST /api/game/reset      - Сбросить игру');
    console.log('• PUT  /api/game/update     - Обновить счет (тестирование)');
    console.log('');
    console.log('%cИспользуйте game.testEndpoint() в консоли для тестирования', 'color: #4CAF50;');
});