use std::collections::HashMap;
pub struct Stock {
    pub quantity : u32,
    pub total_value : u32,
}

pub fn consolidate_inventory(orders: &[(&str, u32, u32)]) -> HashMap<String, Stock>
{
    let mut inventory = HashMap::new();
    for (name, quantity, price_per_unit) in orders {
        if *quantity == 0 {
            continue;
        }
        let stock = inventory.entry(name.to_string()).or_insert(Stock {
            quantity: 0,
            total_value: 0,
        });
        stock.quantity += quantity;
        stock.total_value += quantity * price_per_unit;
    }
    inventory
}
