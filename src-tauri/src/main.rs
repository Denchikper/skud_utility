// Кордон — утилита СКУД для ParsecNET
// by Benovich · https://github.com/Denchikper/kordon-skud

// Prevents an extra console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    kordon_lib::run()
}
