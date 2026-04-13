@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "OUTPUT_FILE=project_structure.txt"
set "PROJECT_DIR=%CD%"
set "IGNORE_DIRS=node_modules .git .next dist build out .cache .vscode .idea coverage"

echo Сбор информации о проекте: %PROJECT_DIR%
echo.

(
    echo ==========================================
    echo ПРОЕКТ: REACT/AVITO-LIKE (НОВОСИБИРСК)
    echo Дата сбора: %DATE% %TIME%
    echo Корень проекта: %PROJECT_DIR%
    echo ==========================================
    echo.
    echo ### 1. СТРУКТУРА ПАПОК И ФАЙЛОВ ###
    echo.
) > "%OUTPUT_FILE%"

echo Сканирую структуру папок...
REM Используем tree с отсечением мусорных папок
set "TREE_CMD=tree /F /A"
for %%i in (%IGNORE_DIRS%) do (
    set "TREE_CMD=!TREE_CMD! | findstr /V /C:"%%i""
)
cmd /c "tree /F /A "%PROJECT_DIR%" | findstr /V /C:"node_modules" | findstr /V /C:".git" | findstr /V /C:".next" | findstr /V /C:"dist" | findstr /V /C:"build" >> "%OUTPUT_FILE%""

(
    echo.
    echo ==========================================
    echo ### 2. СОДЕРЖИМОЕ КЛЮЧЕВЫХ ФАЙЛОВ ###
    echo ==========================================
    echo.
) >> "%OUTPUT_FILE%"

REM Список важных файлов для анализа
set FILES_TO_READ=package.json package-lock.json yarn.lock tsconfig.json jsconfig.json next.config.js vite.config.js webpack.config.js .eslintrc .prettierrc README.md .env.example docker-compose.yml tailwind.config.js postcss.config.js

echo Читаю содержимое конфигурационных файлов...

for %%F in (%FILES_TO_READ%) do (
    if exist "%PROJECT_DIR%\%%F" (
        echo.
        echo ===== ФАЙЛ: %%F =====
        echo.
        type "%PROJECT_DIR%\%%F"
        echo.
    ) >> "%OUTPUT_FILE%" 2>nul
)

REM Сборка содержимого папки src, pages, app, components
(
    echo.
    echo ==========================================
    echo ### 3. ИСХОДНЫЙ КОД (ТОЛЬКО СТРУКТУРА, ДЛЯ АНАЛИЗА) ###
    echo ==========================================
    echo.
) >> "%OUTPUT_FILE%"

echo Собираю список исходных файлов (без кода, чтобы не перегружать)...

REM Если есть папка src
if exist "%PROJECT_DIR%\src" (
    echo.
    echo ===== ПАПКА SRC (дерево файлов) =====
    echo.
    cmd /c "tree /F /A "%PROJECT_DIR%\src" | findstr /V /C:"node_modules"" >> "%OUTPUT_FILE%"
)

REM Если есть папка pages (Next.js)
if exist "%PROJECT_DIR%\pages" (
    echo.
    echo ===== ПАПКА PAGES (дерево файлов) =====
    echo.
    cmd /c "tree /F /A "%PROJECT_DIR%\pages" | findstr /V /C:"node_modules"" >> "%OUTPUT_FILE%"
)

REM Если есть папка app (Next.js App Router)
if exist "%PROJECT_DIR%\app" (
    echo.
    echo ===== ПАПКА APP (дерево файлов) =====
    echo.
    cmd /c "tree /F /A "%PROJECT_DIR%\app" | findstr /V /C:"node_modules"" >> "%OUTPUT_FILE%"
)

REM Если есть папка components
if exist "%PROJECT_DIR%\components" (
    echo.
    echo ===== ПАПКА COMPONENTS (дерево файлов) =====
    echo.
    cmd /c "tree /F /A "%PROJECT_DIR%\components" | findstr /V /C:"node_modules"" >> "%OUTPUT_FILE%"
)

(
    echo.
    echo ==========================================
    echo СБОР ЗАВЕРШЕН. Файл сохранен как: %OUTPUT_FILE%
    echo ТЕПЕРЬ ОТПРАВЬ ЭТОТ ФАЙЛ В ЧАТ.
    echo ==========================================
) >> "%OUTPUT_FILE%"

echo.
echo Готово! Файл %OUTPUT_FILE% создан.
echo Отправь его мне в чат (загрузи как файл или скопируй текст).
echo.
pause