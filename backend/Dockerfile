FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libpq-dev \
    nginx \
    unzip \
    curl \
    && docker-php-ext-install pdo pdo_pgsql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN APP_KEY=base64:I7R8NAxLGUkkN0KqBs34obbLqKAN83Or4aOqIVNvcp0= \
    REVERB_APP_ID=dummy REVERB_APP_KEY=dummy REVERB_APP_SECRET=dummy \
    DB_CONNECTION=pgsql DB_HOST=dummy DB_PORT=5432 DB_DATABASE=postgres DB_USERNAME=dummy DB_PASSWORD=dummy \
    composer install --no-dev --optimize-autoloader --no-interaction

COPY .docker/nginx.conf /etc/nginx/sites-enabled/default
COPY .docker/start.sh /start.sh

RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
