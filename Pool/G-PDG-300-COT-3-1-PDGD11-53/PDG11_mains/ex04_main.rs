fn main() {
    let mut paul_tool: Item = Item {
        name: String::from("Space Hammer"), item_type: ItemType::Tool,
        price: 10.0, usage: 100,
    };
    let mut paul_weapon: Item = Item {
        name: String::from("Union Slasher"), item_type: ItemType::Weapon(125),
        price: 160.0, usage: 100,
    };
    let laura_tool: Item = Item {
        name: String::from("Sonic Screwdriver"), item_type: ItemType::Tool,
        price: 50.0, usage: 100,
    };
    let mut laura_weapon: Item = Item {
        name: String::from("Union Slicer"), item_type: ItemType::Weapon(212),
        price: 270.0, usage: 100,
    };
    println!(
        "Paul has a {} and it's {} new, he also has a {} doing a lot of damage : {} to be precise",
        paul_tool.name,
        paul_tool.usage,
        paul_weapon.name,
        get_damage(&paul_weapon)
    );
    println!(
        "Laura has a {} and it's {} new, she also has a big weapon {} doing a lot of damage : {}\n",
        laura_tool.name,
        laura_tool.usage,
        laura_weapon.name,
        get_damage(&laura_weapon)
    );
    let usage: u8 = 13;
    while !is_used(&paul_tool) {
        println!("Paul is using his tool and loses {}% of durability", usage);
        use_item(&mut paul_tool, usage);
        println!("Paul's tool has {} durability left and is worth {}", paul_tool.usage, paul_tool.price);
    }
    println!("\nIf we ever want to trade weapons with the locals once we're on Venus we better align our prices");
    harmonize_price(&mut paul_weapon, &mut laura_weapon);
    println!("Now the prices are : {} for Paul's weapon and {} for Laura's weapon", paul_weapon.price, laura_weapon.price);
}
