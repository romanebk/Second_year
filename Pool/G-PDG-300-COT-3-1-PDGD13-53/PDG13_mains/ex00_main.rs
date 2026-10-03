fn main() {
    let mut booster = RocketBooster::new();
    let mut tank = FuelTank::new();
    let mut science = SciencePayload::new();
    let mut cabin = CrewCabin::new();

    println!("\n- {}\n- {}\n- {}\n- {}", booster.info(), tank.info(), science.info(), cabin.info());

    println!("Is the booster safe on day 4: {}", booster.is_safe(4));
    println!("Check the booster on day 6: {}", booster.check_component(6));
    println!("Is the booster safe on day 18: {}", booster.is_safe(18));
    println!("Is the booster safe on day 19: {}", booster.is_safe(19));

    tank.load(10.0);
    tank.check_component(9);
    println!("Is fuel tank safe: {}, is fuel tank full: {}.", tank.is_safe(10), tank.is_full());
    println!("Check tank on day 1: {}", tank.check_component(1));
    println!("Is tank safe on day 8: {}", tank.is_safe(8));

    science.load(140.0);
    println!("Science quantity: {:.02}", science.science());
    science.load(250.0);
    science.load(250.0);
    println!("Science quantity: {:.02}", science.science());

    println!("Is the cabin safe on day 5: {}", cabin.is_safe(5));
    println!("Check the cabin on day 6: {}", cabin.check_component(6));
    println!("Is the cabin safe on day 22: {}", cabin.is_safe(22));

    println!("\n- {}\n- {}\n- {}\n- {}", booster.info(), tank.info(), science.info(), cabin.info());
}
