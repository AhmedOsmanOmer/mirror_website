# الخطوة 1: نبدأ من صورة فيها PHP 8.2 جاهزة
FROM php:8.2-fpm as php

# الخطوة 2: نثبت الأدوات اللي محتاجينها + نثبت Node.js (عشان نبني React)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# الخطوة 3: نفعّل إضافات PHP اللي Laravel محتاجها
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip

# الخطوة 4: ننسخ أداة Composer (لتثبيت مكتبات PHP)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# الخطوة 5: نحدد مجلد العمل جوا الحاوية
WORKDIR /var/www

# الخطوة 6: ننسخ كل ملفات مشروعك جوا الحاوية
COPY . .

# الخطوة 7: نثبت مكتبات PHP (Laravel)
RUN composer install --optimize-autoloader --no-dev

# الخطوة 8: نثبت مكتبات Node ونبني React
RUN npm install && npm run build

# الخطوة 9: نعطي صلاحيات كتابة لمجلدات Laravel المهمة
RUN chmod -R 775 storage bootstrap/cache

# الخطوة 10: نفتح المنفذ 8000
EXPOSE 8000

# الخطوة 11: أمر التشغيل النهائي
CMD php artisan serve --host=0.0.0.0 --port=8000