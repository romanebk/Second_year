pub struct ShipAssessment {
    pub water_quantity: f32,
    pub water_cycles: u32,
    pub food_quantity: f32,
}

pub struct StudyResult {
    pub rock_name: String,
    pub reachable: bool,
    pub ship_index: u32,
}

pub fn compute_survivable_days(needs: &ShipAssessment, nb_crew: u32) -> u32 
{
    if nb_crew == 0 {
        return 0;
    }
    let total_water_quantity = needs.water_quantity * needs.water_cycles as f32;
    let total_water_quantity_drink_by_crew_for_one_day = 3.0 * (nb_crew as f32);
    let water_days_can_do = (total_water_quantity / total_water_quantity_drink_by_crew_for_one_day) as u32;
    
    let total_food_quantity_eat_by_crew_for_one_day = 0.5 * (nb_crew as f32);
    let food_days_can_do = (needs.food_quantity / total_food_quantity_eat_by_crew_for_one_day) as u32;
    
    if water_days_can_do < food_days_can_do {
        water_days_can_do
    } else {
        food_days_can_do
    }
}

pub fn study_ships(ships: &[ShipAssessment], rocks_to_visit: &[(String, u32)], rock: String, nb_crew: u32) -> StudyResult
{
    let mut distance = 0;
    let mut a = false;
    for (name, dist) in rocks_to_visit {
        if *name == rock {
            distance = *dist;
            a = true;
            break;
        }
    }
    if !a {
        return StudyResult {
            rock_name: String::from("Error"),
            reachable: false,
            ship_index: 0,
        };
    }

    let mut best_ship_index = 0;
    let mut max_days = 0;

    for (i, ship) in ships.iter().enumerate() {
        let days = compute_survivable_days(ship, nb_crew);
        if days >= distance {
            return StudyResult {
                rock_name: rock,
                reachable: true,
                ship_index: i as u32,
            };
        }
        if days > max_days {
            max_days = days;
            best_ship_index = i;
        }
    }
    StudyResult {
        rock_name: rock,
        reachable: false,
        ship_index: best_ship_index as u32,
    }
}
