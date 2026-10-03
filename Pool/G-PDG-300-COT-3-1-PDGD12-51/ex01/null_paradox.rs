#[warn(unused)]

pub struct Coordinates {
    pub x: i32,
    pub y: i32,
    pub z: i32,
}

pub fn get_place(name: &str) -> Option<Coordinates>
{
    match name {
        "Earth" => Some(Coordinates { 
            x: 0, 
            y: 0, 
            z: 0 
        }),
        "Mars" => Some(Coordinates { 
            x: 15, 
            y: 22, 
            z: 110 
        }),
        "Jupiter" => Some(Coordinates { 
            x: 88, 
            y: 12, 
            z: -4
        }),
        _ => None,
    }
}

pub fn analyze_transport_method(option: Option<Coordinates>) -> String
{
    match option {
        Some(coords) => format!("Teleporting to {},{},{}", coords.x, coords.y, coords.z),
        None => String::from("No destination available"),
    }
}

pub fn risky_teleport(option: Option<Coordinates>) -> String
{
    let coords = option.unwrap();
    format!("Teleporting to {},{},{}", coords.x, coords.y, coords.z)
}
