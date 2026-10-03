pub fn compute_survivable_days(water_quantity: f32, water_cycles: u32, food_quantity: f32, nb_crew: u32) -> u32
{
    if nb_crew == 0 {
        return 0;
    }
    let total_water_quantity = water_quantity * water_cycles as f32;
    let total_water_quantity_drink_by_crew_for_one_day = 2.0 * (nb_crew as f32);
    let water_days_can_do = (total_water_quantity / total_water_quantity_drink_by_crew_for_one_day) as u32;
    let total_food_quantity_eat_by_crew_for_one_day = 0.5 * (nb_crew as f32);
    let food_days_can_do = (food_quantity / total_food_quantity_eat_by_crew_for_one_day) as u32;
    
    if water_days_can_do < food_days_can_do {
        water_days_can_do
    } else {
        food_days_can_do
    }
}

