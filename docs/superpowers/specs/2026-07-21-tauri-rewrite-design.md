# Утилита СКУД — редизайн и перенос на Tauri (Windows)

## Context

Текущее приложение — Electron-утилита для ParsecNET (СКУД). Оператор выбирает
«группу приборов» (ГП), приложение копирует соответствующий `parsec.ini` в каталог
ParsecNET, запускает `MDO.Parsec.Win.exe`, а при закрытии удаляет применённый конфиг.
Проблемы текущей версии: тяжёлый Electron-рантайм, жёстко зашитый список из 6 кнопок,
настройки только правкой `Settings/settings.json` вручную, устаревший минимальный UI.

Цель: переписать на **Tauri v2** (лёгкий нативный бинарь под Windows), сделать
обновлённый светлый iOS-like дизайн и добавить полноценный экран настроек.

## Требования

1. Сохранить рабочий сценарий: выбор ГП → применить конфиг → «Пуск» → «Закрыть» (с очисткой).
2. Список ГП настраивается пользователем (добавление/удаление/переименование), а не зашит.
3. Настраиваются пути: программа, целевой `parsec.ini`, папка GP-профилей.
4. Экран настроек с выбором темы (светлая/тёмная/системная).
5. Offline-safe: без внешних CDN/шрифтов (CSP Tauri).

## Архитектура

### Rust-бэкенд (`src-tauri/`)
Команды `#[tauri::command]`:
- `load_settings() -> Settings` — читает `settings.json` из app config dir; при отсутствии сидирует дефолтами.
- `save_settings(settings)` — атомарно пишет `settings.json`.
- `apply_profile(folder) -> String` — копирует `<gpFolder>/<folder>/parsec.ini` в `destFilePath`; возвращает применённый путь.
- `run_program()` — запускает `programPath` через `std::process::Command` (spawn, не блокирует).
- `close_and_cleanup()` — удаляет `destFilePath` (если есть) и завершает приложение (`app.exit(0)`).

Модель `Settings` (serde):
```
{ gpFolder: String, programPath: String, destFilePath: String,
  theme: "light"|"dark"|"system",
  profiles: [ { id: String, label: String, folder: String } ] }
```
Дефолты берутся из старого `Settings/settings.json` (пути ParsecNET) и списка ГП
(ГП1, ГП5, ГП6, ГП7, ГП9, ГП10 → папки GP1…GP10). Хранение: `%APPDATA%/skud_utility/settings.json`
через `app.path().app_config_dir()`. Ошибки команд возвращаются как `Result<_, String>`
и показываются в UI статус-строкой.

### Фронтенд (`src/`, React + Vite + TS)
- Переключение вида состоянием `view: 'main' | 'settings'` (без роутера).
- `api.ts` — тонкая обёртка над `invoke` с типами из `types.ts`.
- **Главный экран** (`MainView`): заголовок + шестерёнка настроек; адаптивная сетка
  профилей (`ProfileGrid`/`ProfileCard`) с явным applied-состоянием; статус-строка
  (что применено, запущена ли программа, ошибки); нижний ряд действий «Закрыть» / «Пуск».
- **Экран настроек** (`SettingsView`): редактор профилей (список строк label+folder,
  add/remove), поля путей, сегмент-контрол темы, «Сохранить» / «Назад».

### Дизайн-токены (`styles.css`)
CSS-переменные + `data-theme` на `<html>`. Палитра: фон `#F2F4F8`, карточка `#FFF`,
текст `#1C1C1E`/`#6E6E73`, applied `#34C759`/тинт `#E7F9EA`, primary `#007AFF`,
destructive `#FF3B30`. Скругления 12px. Шрифт: `system-ui, "Segoe UI", Inter, sans-serif`.
Motion скромный (press-scale, fade-in чекмарка), `prefers-reduced-motion` уважается.
Тёмная тема — набор переменных под `[data-theme="dark"]`; `system` слушает
`prefers-color-scheme`.

## Структура файлов
```
package.json, vite.config.ts, tsconfig*.json, index.html
src/ main.tsx App.tsx api.ts types.ts styles.css
    components/ MainView.tsx SettingsView.tsx ProfileGrid.tsx ProfileCard.tsx
               StatusBar.tsx SettingsRow.tsx SegmentedControl.tsx Icon.tsx
src-tauri/ Cargo.toml build.rs tauri.conf.json capabilities/default.json
          icons/  src/ main.rs lib.rs settings.rs commands.rs
```
Старые Electron-файлы (`main.js`, `preload.js`, `script.js`, корневой `index.html`,
`css/`, Electron-`package.json`) удаляются.

## Верификация
- `npm install && npm run build` — фронтенд собирается (Vite).
- `cargo check` в `src-tauri` (если Rust доступен локально; иначе — на Windows-машине).
- На Windows: `npm run tauri build` → `.exe`/MSI; ручной прогон сценария
  выбор ГП → Пуск → Закрыть и проверка, что `parsec.ini` копируется и удаляется.
- Экран настроек: изменить профиль/путь/тему, сохранить, перезапустить — значения сохраняются.
