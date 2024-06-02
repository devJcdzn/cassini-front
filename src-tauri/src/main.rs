// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::{
    App, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItemHandle,
};
use tauri_plugin_positioner::{Position, WindowExt};

struct ProgressPayload {
    progress: i32,
}

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit").accelerator("Ctrl+Q");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide").accelerator("Ctrl+shift+Q");

    let system_tray_menu = SystemTrayMenu::new().add_item(quit).add_item(hide);

    tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .system_tray(SystemTray::new().with_menu(system_tray_menu))
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let handle = app.handle();

            app.listen_global("quit", |_| {
                std::process::exit(0);
            });

            // app.listen_global("progress", |event| {
            //     if let Some(payload) = event.payload() {
            //         let data: Result<ProgressPayload, _> = serde_json::from_str(payload);

            //         match data {
            //             Ok(data) => match data.progress {
            //                 10 => handle
            //                     .tray_handle()
            //                     .set_icon(tauri::icon::Raw(include_bytes!("../icons/32x32.png"))),
            //                 _ => println!("it is something else"),
            //             },
            //             Err(e) => {
            //                 println!("Failed to deserialize payload: {}", e);
            //             }
            //         }
            //     }
            // });

            let window = app.get_window("main").unwrap();

            Ok(())
        })
        .on_system_tray_event(|app, event| {
            tauri_plugin_positioner::on_tray_event(app, &event);
            match event {
                SystemTrayEvent::LeftClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    let window = app.get_window("main").unwrap();

                    let _ = window.move_window(Position::TrayCenter);

                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                    } else {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                SystemTrayEvent::MenuItemClick { id, .. } => {
                    let item_handle = app.tray_handle().get_item(&id);

                    match id.as_str() {
                        "quit" => {
                            std::process::exit(0);
                        }
                        "hide" => {
                            let window = app.get_window("main").unwrap();

                            #[cfg(target_os = "macOs")]
                            let _ = window.move_window(Position::TrayCenter).unwrap();

                            #[cfg(target_os = "windows")]
                            let _ = window.move_window(Position::BottomRight).unwrap();

                            if window.is_visible().unwrap() {
                                let _ = item_handle.set_title("Show");
                                window.hide().unwrap();
                            } else {
                                let _ = item_handle.set_title("Hide");
                                window.show().unwrap();
                                window.set_focus().unwrap();
                            }
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
