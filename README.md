# Проект голосование

# Установка

Для запуска на ПК должны быть установлены:
[Node.js](https://nodejs.org/);
[Yarn](https://yarnpkg.com/);
[Python 3](https://www.python.org/downloads/);
[Git](https://git-scm.com/);

Склонируйте репозиторий

```sh
git clone https://github.com/Phoenix-Education-Project/team9repo
```

### 1) Настройка Django

В корне проекта создайте виртуальное окружение и активируйте его

```sh
python -m venv “venv”
```

```sh
.\venv\Scripts\activate (для Linux: source ./venv/bin/activate)
```

#### Все последующие действия с Django производить внутри виртуального окружения

Установите все необходимые зависимости для работы Django

```sh
pip install -r requirements.txt
```

#### В папке app создайте файл .env и скопируйте в него данные из .env.example

Установите все необходимые миграции, убедитесь, что был создан файл db.sqlite3

```sh
python manage.py makemigrations
python manage.py migrate
```

Создайте суперпользователя для работы с админкой

```sh
python manage.py createsuperuser
```

Запустите проект

```sh
python manage.py runserver
```

После запуска будут доступны:

[Swagger (описание доступного API)](http://127.0.0.1:8000/swagger/)

[Админ панель](http://127.0.0.1:8000/admin/)

[Само приложение (после сборки фронтенд части)](http://127.0.0.1:8000/)

### 2) Настройка фронтенд части

Из корня проекта перейдите в папку client и сделайте установку необходимых зависимостей

```sh
cd ./client/
yarn install
```

Убедитесь, что в редакторе (если у вас VS Code) установлены:
[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode);
[ESlint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

Запустите проект

```sh
yarn start
```

(Django и фронтенд часть нужно запускать в отдельных терминалах)

Сборка фронтенд части для запуска внутри Django

```sh
yarn build
```

#### Перед загрузкой на github

Если вы устанавливали новые зависимости в Django, то сохраните их в requirenments.txt

```sh
pip freeze > requirements.txt
```
