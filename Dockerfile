# Используем базовый образ Python
FROM python:3.9-slim

# Устанавливаем зависимости
WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Копируем исходный код приложения
COPY . .

# Указываем порт, который будет открыт в контейнере
EXPOSE 5000

# Команда для запуска приложения
CMD ["python", "app.py"]
