const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// GET /api/game/score - Получить текущий счет
router.get('/score', gameController.getScore);

// POST /api/game/click - Увеличить счет на клик
router.post('/click', gameController.handleClick);

// GET /api/game/level - Получить текущий уровень
router.get('/level/:score?', gameController.getLevelInfo);

// GET /api/game/progress - Получить прогресс до следующего уровня
router.get('/progress/:score', gameController.getProgress);

// POST /api/game/reset - Сбросить игру
router.post('/reset', gameController.resetGame);

// GET /api/game/stats - Получить статистику игры
router.get('/stats', gameController.getGameStats);

// PUT /api/game/update - Обновить счет (для тестирования)
router.put('/update', gameController.updateScore);

module.exports = router;