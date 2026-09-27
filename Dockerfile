# A self-contained image for demoing the portal on a machine with nothing but
# Docker Desktop installed. See docs/deployment.md#quick-demo-with-docker.
#
# It is not a production image: it runs `php artisan serve` and seeds the demo
# school on first start. It is only started through the `demo` profile in
# compose.yaml, so `docker compose up -d` on its own still starts just MySQL.

# --- Stage 1: compile the React frontend into public/build ---------------------
FROM node:22-bookworm-slim AS assets

WORKDIR /app
ENV VITE_APP_NAME="DCSA Portal"

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: PHP with the extensions the portal needs -------------------------
FROM php:8.4-cli-bookworm

COPY --from=mlocati/php-extension-installer:2 /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions pdo_mysql intl zip bcmath opcache

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/html

# Dependencies first, so a code change does not re-download every package.
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY . .
COPY --from=assets /app/public/build ./public/build
RUN composer dump-autoload --no-dev --optimize --no-interaction \
    && sed -i 's/\r$//' docker/entrypoint.sh \
    && mkdir -p /data \
    && chown -R www-data:www-data storage bootstrap/cache /data

USER www-data

EXPOSE 8000
ENTRYPOINT ["sh", "docker/entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
