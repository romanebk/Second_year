fn main() {
    let earth_coords = get_place("Earth");
    let mars_coords = get_place("Mars");
    let void_coords = get_place("Black Hole");

    println!("--- Safe Analysis ---");
    println!("Earth: {}", analyze_transport_method(earth_coords));
    println!("Void:  {}", analyze_transport_method(void_coords));
    println!("\n--- Risky Teleport ---");
    println!("Mars:  {}", risky_teleport(get_place("Mars")));
    println!("Now trying to teleport to the Void...");
    println!("Void:  {}", risky_teleport(get_place("Black Hole")));
}
