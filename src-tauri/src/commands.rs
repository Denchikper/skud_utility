use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use tauri::AppHandle;

use crate::settings::{self, Settings};

/// Resolves the GP profiles base directory. Absolute paths are used as-is;
/// relative paths (e.g. the default "GP") are resolved next to the executable,
/// which keeps a portable layout working.
fn resolve_gp_base(gp_folder: &str) -> PathBuf {
    let p = Path::new(gp_folder);
    if p.is_absolute() {
        return p.to_path_buf();
    }
    let exe_dir = std::env::current_exe()
        .ok()
        .and_then(|e| e.parent().map(Path::to_path_buf));
    match exe_dir {
        Some(dir) => dir.join(p),
        None => p.to_path_buf(),
    }
}

#[tauri::command]
pub fn load_settings(app: AppHandle) -> Result<Settings, String> {
    settings::load(&app)
}

#[tauri::command]
pub fn save_settings(app: AppHandle, settings: Settings) -> Result<(), String> {
    settings::save(&app, &settings)
}

/// Copies `<gpFolder>/<folder>/parsec.ini` into the configured destination.
#[tauri::command]
pub fn apply_profile(app: AppHandle, folder: String) -> Result<String, String> {
    let cfg = settings::load(&app)?;
    let source = resolve_gp_base(&cfg.gp_folder)
        .join(&folder)
        .join("parsec.ini");

    if !source.exists() {
        return Err(format!("файл профиля не найден: {}", source.display()));
    }

    let dest = PathBuf::from(&cfg.dest_file_path);
    if let Some(parent) = dest.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("не удалось создать каталог назначения: {e}"))?;
    }
    fs::copy(&source, &dest)
        .map_err(|e| format!("не удалось скопировать конфиг: {e}"))?;

    Ok(dest.display().to_string())
}

/// Launches the configured ParsecNET executable without blocking the UI.
#[tauri::command]
pub fn run_program(app: AppHandle) -> Result<(), String> {
    let cfg = settings::load(&app)?;
    let program = cfg.program_path.trim();
    if program.is_empty() {
        return Err("путь к программе не задан".to_string());
    }
    Command::new(program)
        .spawn()
        .map_err(|e| format!("не удалось запустить программу: {e}"))?;
    Ok(())
}

/// Removes the applied config file (if present) and quits the app.
#[tauri::command]
pub fn close_and_cleanup(app: AppHandle) -> Result<(), String> {
    let cfg = settings::load(&app)?;
    let dest = PathBuf::from(&cfg.dest_file_path);
    if dest.exists() {
        fs::remove_file(&dest)
            .map_err(|e| format!("не удалось удалить конфиг: {e}"))?;
    }
    app.exit(0);
    Ok(())
}
