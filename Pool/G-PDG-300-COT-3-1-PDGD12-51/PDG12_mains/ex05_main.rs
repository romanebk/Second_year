fn main() {
    let orders = [
        ("Sapphire", 10, 500),
        ("Iron", 100, 5),
        ("Sapphire", 5, 600),
        ("Iron", 50, 5),
        ("Space Dust", 0, 1),
    ];

    let inventory = consolidate_inventory(&orders);

    println!("--- Global Inventory ---");
    
    for (name, stock) in &inventory {
        println!("{}: Qty {}, Value {}", name, stock.quantity, stock.total_value);
    }
    
    if let Some(stock) = inventory.get("Sapphire") {
        if stock.quantity == 15 && stock.total_value == 8000 {
            println!("Sapphire stock is correct.");
        } else {
            println!("Sapphire stock is WRONG.");
        }
    }
    
    if inventory.contains_key("Space Dust") {
         println!("Error: Space Dust should not be in the inventory.");
    }
}
