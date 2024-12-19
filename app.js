const express = require('express');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const app = express();
app.use(express.json());

// Возможные уровни логирования и варианты вывода
const LOG_LEVELS = ['debug', 'info', 'warn', 'error'];
const LOG_OUTPUTS = ['console', 'file', 'both'];

// Папка для хранения логов
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Переменная для хранения настроек логирования
let logConfig = {
    level: 'debug', // Значение по умолчанию
    output: 'console', // Значение по умолчанию
};

// Функция для формирования имени файла на основе даты
const getLogFilePath = () => {
    const date = new Date().toISOString().split('T')[0];
    return path.join(logsDir, `${date}.log`);
};

// Функция для записи логов
const logMessage = (level, message) => {
    if (!LOG_LEVELS.includes(level)) return;

    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    // Проверяем, должен ли уровень лога быть записан
    if (LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(logConfig.level)) {
        // Вывод в консоль
        if (logConfig.output === 'console' || logConfig.output === 'both') {
            console.log(formattedMessage);
        }

        // Запись в файл
        if (logConfig.output === 'file' || logConfig.output === 'both') {
            const logFilePath = getLogFilePath();
            try {
                fs.appendFileSync(logFilePath, formattedMessage + '\n');
            } catch (err) {
                console.error('Ошибка записи в файл:', err);
            }
        }
    }
};

// Функция для настройки логирования через пользовательский ввод
const setupLoggingConfig = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const askQuestion = (question) =>
        new Promise((resolve) => rl.question(question, resolve));

    console.log('Выберите уровень логирования:');
    LOG_LEVELS.forEach((level, index) => console.log(`${index + 1}. ${level}`));
    const levelInput = await askQuestion('Введите номер уровня логирования (по умолчанию 1): ');
    const level = LOG_LEVELS[parseInt(levelInput, 10) - 1] || 'debug';

    console.log('\nВыберите место для логов:');
    LOG_OUTPUTS.forEach((output, index) => console.log(`${index + 1}. ${output}`));
    const outputInput = await askQuestion('Введите номер места для логов (по умолчанию 1): ');
    const output = LOG_OUTPUTS[parseInt(outputInput, 10) - 1] || 'console';

    rl.close();
    return { level, output };
};

// Middleware для логирования запросов и ответов
app.use((req, res, next) => {
    const start = new Date();

    // Логируем входящий запрос
    logMessage(
        'debug',
        `Incoming Request:
        - Method: ${req.method}
        - URL: ${req.originalUrl}
        - Headers: ${JSON.stringify(req.headers)}
        - Params: ${JSON.stringify(req.params)}
        - Query: ${JSON.stringify(req.query)}
        - Body: ${JSON.stringify(req.body)}`
    );

    const originalSend = res.send;
    res.send = function (body) {
        const end = new Date();
        const duration = end - start;

        logMessage(
            'debug',
            `Response:
            - Duration: ${duration}ms
            - Status: ${res.statusCode}
            - Body: ${JSON.stringify(body)}`
        );

        originalSend.call(this, body);
    };

    next();
});

// Пример маршрутов
app.get('/api/example', (req, res) => {
    logMessage('info', 'Handling GET /api/example');
    res.json({ message: 'Hello, World!' });
});

app.post('/api/example', (req, res) => {
    logMessage('info', 'Handling POST /api/example');
    res.json({ message: 'Data received', data: req.body });
});

// Запуск сервера с запросом настроек логирования
(async () => {
    logConfig = await setupLoggingConfig(); // Устанавливаем конфигурацию логирования

    logMessage('info', `Конфигурация логов: уровень - ${logConfig.level}, вывод - ${logConfig.output}`);

    const PORT = 3000;
    app.listen(PORT, () => {
        logMessage('info', `Server is running on port ${PORT}`);
    });
})();
