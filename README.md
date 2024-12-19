Проверка корректности установки:

    docker --version
    docker run hello-world

Проверка запущенных контейнеров:

    docker ps -a

Соберать Docker-образ:

    docker build -t my-flask-app .

Запустите контейнер:

    docker run -p 5000:5000 my-flask-app

Остановите контейнер:

    docker ps
    docker stop <CONTAINER_ID>

Запуск приложения с Docker Compose:

    docker-compose up --build
