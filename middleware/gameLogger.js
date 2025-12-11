const gameLogger = (req, res, next) => {
  const start = Date.now();
  
  // Логируем информацию о запросе
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  // Логируем тело запроса для POST/PUT запросов
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Тело запроса:', req.body);
  }
  
  // Логируем параметры запроса
  if (Object.keys(req.query).length > 0) {
    console.log('Query параметры:', req.query);
  }
  
  // Логируем параметры маршрута
  if (Object.keys(req.params).length > 0) {
    console.log('Параметры маршрута:', req.params);
  }
  
  // Перехватываем отправку ответа для логирования времени выполнения
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - start;
    console.log(`Время выполнения: ${duration}ms`);
    console.log(`Статус ответа: ${res.statusCode}`);
    originalSend.call(this, body);
  };
  
  next();
};

module.exports = gameLogger;