fn main() {
    let nb_crew : u32 = 3;
    let needs = ShipAssessment {
        water_quantity: 600.0,
        water_cycles: 25,
        food_quantity: 3020.0,
    };
    let ship1 = ShipAssessment {
        water_quantity: 16.0,
        water_cycles: 270,
        food_quantity: 230.0,
    };
    let ship2 = ShipAssessment {
        water_quantity: 100.0,
        water_cycles: 50,
        food_quantity: 250.0,
    };
    let ship3 = ShipAssessment {
        water_quantity: 600.0,
        water_cycles: 25,
        food_quantity: 3020.0,
    };
    let ships = [
        ship1,
        ship3,
        ship2,
    ];
    let days = compute_survivable_days(&needs, nb_crew);
    println!("Days: {}", days);

    let rocks_to_visit = [(String::from("Venus"), 137), (String::from("Mars"), 154), (String::from("Europa"), 2007)];
    let to_visit = String::from("YEET");
    let mut study: StudyResult = study_ships(&ships, &rocks_to_visit, to_visit, nb_crew);
    println!("Rock: {}, Reachable: {}, Index: {}", study.rock_name, study.reachable, study.ship_index);
    let to_visit = String::from("Europa");
    study = study_ships(&ships, &rocks_to_visit, to_visit, nb_crew);
    println!("Rock: {}, Reachable: {}, Index: {}", study.rock_name, study.reachable, study.ship_index);
    let to_visit = String::from("Venus");
    study = study_ships(&ships, &rocks_to_visit, to_visit, nb_crew);
    println!("Rock: {}, Reachable: {}, Index: {}", study.rock_name, study.reachable, study.ship_index);
}
