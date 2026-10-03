#[derive(Debug)]

pub enum ItemType {
    Tool,
    Weapon(u32),
}

pub struct Item {
    pub name: String,
    pub item_type: ItemType,
    pub price: f64,
    pub usage: u8,
}

pub fn get_damage(item: &Item) -> u32
{
    match item.item_type {
        ItemType::Tool => 0,
        ItemType::Weapon(damage) => damage,
    }
}

pub fn is_used(item: &Item) -> bool
{
    if item.usage < 25 {
        return true;
    }
    return false;
}

pub fn use_item(item: &mut Item, usage: u8)
{
    let was_above_25 = item.usage >= 25;
    if item.usage > usage {
        item.usage -= usage;
    } else {
        item.usage = 0;
    }
    if was_above_25 && item.usage < 25 {
        item.price *= 0.25;
    }
}

pub fn harmonize_price(item1: &mut Item, item2: &mut Item)
{
    item1.price = item2.price;
}

