const express = require('express');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');
const gameLogger = require('./middleware/gameLogger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(gameLogger); // Наш кастомный middleware

// Раздача статических файлов
app.use(express.static('public'));

// Маршруты API
app.use('/api/game', gameRoutes);

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Обработка 404 ошибок
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработка ошибок сервера
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Игра доступна по адресу: http://localhost:${PORT}`);
});