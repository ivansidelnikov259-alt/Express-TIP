let gameState = {
  score: 0,
  highScore: 0,
  totalClicks: 0,
  gameStartedAt: new Date().toISOString()
};

const levelGoals = [
  { threshold: 0, image: '🎮 Начало пути!', name: 'Начальный' },
  { threshold: 100, image: '🚀 Пфф это уровень абитуриента', name: 'Абитуриент' },
  { threshold: 250, image: '⭐ Стандартный первак!', name: 'Первак' },
  { threshold: 500, image: '🔥 Прошёл первую сессию', name: 'Студент 1 курса' },
  { threshold: 700, image: '💎 Мог и лучше!', name: 'Уверенный студент' },
  { threshold: 1000, image: '🏆 Неплохо! Уже второкурсник!', name: 'Второкурсник' },
  { threshold: 1500, image: '👑 Впереди еще долгий путь!', name: 'Опытный студент' },
  { threshold: 2000, image: '⚡ Вот и третий курс!', name: 'Третьекурсник' },
  { threshold: 2500, image: '🌟 Ты уже хочешь отчислиться?', name: 'Уставший студент' },
  { threshold: 3000, image: '💫 Наконец четвертый курс! скоро выпуск(', name: 'Выпускник' },
  { threshold: 3500, image: '🎯 Диплом is coming...', name: 'Дипломник' },
  { threshold: 4000, image: '🚀 Время магов, аспирантов и других колдунов', name: 'Аспирант' },
  { threshold: 4500, image: '🏅 Вы получили силы президента ИТУ!', name: 'Президент ИТУ' },
  { threshold: 5000, image: '👑 Вы стали сильнее президента ИКБ!', name: 'Повелитель ИКБ' },
  { threshold: 5500, image: '💎 Вы сравнялись с президентом ИРИ!', name: 'Мастер ИРИ' },
  { threshold: 6000, image: '🔥 Вы превзошли президента ИТХТ!', name: 'Победитель ИТХТ' },
  { threshold: 6500, image: '⭐ Это уже уровень президента ИИИ!', name: 'Властелин ИИИ' },
  { threshold: 7000, image: '🚀 Вы победили президента ИИТ!', name: 'Завоеватель ИИТ' },
  { threshold: 7500, image: '💫 Президент ИПТИП дышит Вам в спину!', name: 'Соперник ИПТИП' },
  { threshold: 8000, image: '🎮 Абсолютная мощь! Но сможешь ли ты дойти до конца?', name: 'Абсолютный' },
  { threshold: 8500, image: '🌟 Король А-9!', name: 'Король А-9' },
  { threshold: 9000, image: "🔥 Повелитель Unifood'а!", name: 'Повелитель Unifood' },
  { threshold: 9500, image: '💎 Тут сдался даже ректор РТУ МИРЭА!', name: 'Победитель ректора' },
  { threshold: 10000, image: '👽 БОГ РТУ МИРЭА!', name: 'БОГ РТУ МИРЭА' }
];

// Получить текущий счет
exports.getScore = (req, res) => {
  res.json({
    score: gameState.score,
    highScore: gameState.highScore,
    totalClicks: gameState.totalClicks,
    gameDuration: Math.floor((Date.now() - new Date(gameState.gameStartedAt)) / 1000)
  });
};

// Обработать клик
exports.handleClick = (req, res) => {
  gameState.score += 1;
  gameState.totalClicks += 1;
  
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
  }
  
  const currentLevel = getCurrentLevel(gameState.score);
  const nextLevel = levelGoals[currentLevel + 1];
  const progress = calculateProgress(gameState.score, currentLevel);
  
  res.json({
    success: true,
    newScore: gameState.score,
    currentLevel: levelGoals[currentLevel],
    nextLevelThreshold: nextLevel ? nextLevel.threshold : null,
    progress: progress
  });
};

// Получить информацию об уровне
exports.getLevelInfo = (req, res) => {
  const score = req.params.score ? parseInt(req.params.score) : gameState.score;
  
  if (isNaN(score)) {
    return res.status(400).json({ error: 'Некорректный счет' });
  }
  
  const currentLevel = getCurrentLevel(score);
  const nextLevel = levelGoals[currentLevel + 1];
  
  res.json({
    score: score,
    currentLevel: levelGoals[currentLevel],
    levelNumber: currentLevel,
    nextLevel: nextLevel || null,
    remainingToNextLevel: nextLevel ? nextLevel.threshold - score : 0,
    totalLevels: levelGoals.length
  });
};

// Получить прогресс до следующего уровня
exports.getProgress = (req, res) => {
  const score = parseInt(req.params.score);
  
  if (isNaN(score)) {
    return res.status(400).json({ error: 'Некорректный счет' });
  }
  
  const currentLevel = getCurrentLevel(score);
  const progress = calculateProgress(score, currentLevel);
  
  res.json({
    score: score,
    currentLevel: currentLevel,
    progressPercentage: progress,
    progressBar: generateProgressBar(progress)
  });
};

// Сбросить игру
exports.resetGame = (req, res) => {
  const oldScore = gameState.score;
  gameState.score = 0;
  gameState.totalClicks = 0;
  gameState.gameStartedAt = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'Игра сброшена',
    previousScore: oldScore,
    highScore: gameState.highScore,
    newScore: gameState.score
  });
};

// Получить статистику игры
exports.getGameStats = (req, res) => {
  const currentLevel = getCurrentLevel(gameState.score);
  const clicksPerSecond = calculateCPS();
  
  res.json({
    gameState: gameState,
    currentLevelInfo: levelGoals[currentLevel],
    levelProgress: {
      current: currentLevel,
      total: levelGoals.length - 1,
      percentage: Math.floor((currentLevel / (levelGoals.length - 1)) * 100)
    },
    performance: {
      clicksPerSecond: clicksPerSecond,
      timePlayed: Math.floor((Date.now() - new Date(gameState.gameStartedAt)) / 1000),
      efficiency: (gameState.score / gameState.totalClicks).toFixed(2)
    }
  });
};

// Обновить счет (для тестирования)
exports.updateScore = (req, res) => {
  const { score } = req.body;
  
  if (typeof score !== 'number' || score < 0) {
    return res.status(400).json({ error: 'Некорректный счет' });
  }
  
  gameState.score = score;
  gameState.totalClicks += Math.max(0, score - gameState.score);
  
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
  }
  
  res.json({
    success: true,
    message: 'Счет обновлен',
    newScore: gameState.score
  });
};

// Вспомогательные функции
function getCurrentLevel(score) {
  for (let i = levelGoals.length - 1; i >= 0; i--) {
    if (score >= levelGoals[i].threshold) {
      return i;
    }
  }
  return 0;
}

function calculateProgress(score, currentLevel) {
  const currentThreshold = levelGoals[currentLevel].threshold;
  const nextThreshold = currentLevel < levelGoals.length - 1 
    ? levelGoals[currentLevel + 1].threshold 
    : levelGoals[currentLevel].threshold;
  
  if (currentLevel >= levelGoals.length - 1) {
    return 100;
  }
  
  return ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
}

function calculateCPS() {
  const secondsPlayed = (Date.now() - new Date(gameState.gameStartedAt)) / 1000;
  return secondsPlayed > 0 ? (gameState.totalClicks / secondsPlayed).toFixed(2) : 0;
}

function generateProgressBar(percentage) {
  const width = 20;
  const filled = Math.floor((percentage / 100) * width);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage.toFixed(1)}%`;
}