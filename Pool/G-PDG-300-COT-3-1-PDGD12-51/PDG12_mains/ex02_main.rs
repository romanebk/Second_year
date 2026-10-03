fn main() {
    println!("--- Order 1: Space Omelette ---");
    match cook_meal("Space Omelette") {
        Ok(msg) => println!("Success: {}", msg),
        Err(e) => println!("Error: {}", e),
    }

    println!("\n--- Order 2: Corpse Reviver ---");
    match cook_meal("Corpse Reviver") {
        Ok(msg) => println!("Success: {}", msg),
        Err(e) => println!("Error: {}", e),
    }

    println!("\n--- Order 3: Quantum Brownie (Experimental) ---");
    // This part should technically never print the Result because the program will crash before.
    match cook_meal("Quantum Brownie") {
        Ok(msg) => println!("Success: {}", msg),
        Err(e) => println!("Error: {}", e),
    }
    
    println!("This line will never be printed if the kitchen explodes.");
}
