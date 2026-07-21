use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    pub id: String,
    pub label: String,
    pub folder: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub gp_folder: String,
    pub program_path: String,
    pub dest_file_path: String,
    pub theme: String,
    pub profiles: Vec<Profile>,
}

impl Default for Settings {
    fn default() -> Self {
        let profiles = ["1", "5", "6", "7", "9", "10"]
            .iter()
            .map(|n| Profile {
                id: format!("gp{n}"),
                label: format!("ГП{n}"),
                folder: format!("GP{n}"),
            })
            .collect();

        Settings {
            gp_folder: "GP".to_string(),
            program_path: "C:\\Program Files\\MDO\\ParsecNET 3\\MDO.Parsec.Win.exe"
                .to_string(),
            dest_file_path: "C:\\ProgramData\\MDO\\ParsecNET 3\\parsec.ini".to_string(),
            theme: "light".to_string(),
            profiles,
        }
    }
}

/// Path to the persisted settings file inside the per-user app config directory.
pub fn settings_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("не удалось определить каталог конфигурации: {e}"))?;
    Ok(dir.join("settings.json"))
}

/// Loads settings, seeding the file with defaults on first run.
pub fn load(app: &AppHandle) -> Result<Settings, String> {
    let path = settings_path(app)?;
    if !path.exists() {
        let defaults = Settings::default();
        save(app, &defaults)?;
        return Ok(defaults);
    }
    let raw = fs::read_to_string(&path)
        .map_err(|e| format!("не удалось прочитать {}: {e}", path.display()))?;
    serde_json::from_str(&raw)
        .map_err(|e| format!("некорректный settings.json: {e}"))
}

/// Persists settings, creating the config directory if needed.
pub fn save(app: &AppHandle, settings: &Settings) -> Result<(), String> {
    let path = settings_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("не удалось создать каталог конфигурации: {e}"))?;
    }
    let json = serde_json::to_string_pretty(settings)
        .map_err(|e| format!("не удалось сериализовать настройки: {e}"))?;
    fs::write(&path, json)
        .map_err(|e| format!("не удалось записать {}: {e}", path.display()))?;
    Ok(())
}
