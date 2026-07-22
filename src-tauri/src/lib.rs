// Кордон — утилита СКУД для ParsecNET
// by Benovich · https://github.com/Denchikper/kordon-skud

mod commands;
mod settings;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::load_settings,
            commands::save_settings,
            commands::apply_profile,
            commands::run_program,
            commands::close_and_cleanup,
        ])
        .run(tauri::generate_context!())
        .expect("ошибка при запуске приложения Tauri");
}
