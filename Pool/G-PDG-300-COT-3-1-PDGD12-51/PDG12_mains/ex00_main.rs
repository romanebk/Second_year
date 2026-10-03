fn main() {
    println!("Is \"42.42\" a number ? {}", is_number("42.42"));
    println!("Is \"42.24.42\" a number ? {}", is_number("42.24.42"));
    println!("Is \"yeet\" a number ? {}", is_number("yeet"));
    println!("Is \"   \t123.456   \" a number ? {}", is_number("   \t123.456   "));
    println!("Is \"123   .456\" a number ? {}", is_number("123   .456"));
    println!("Is \"-0.4\" a number ? {}", is_number("-0.4"));
    println!("Is \"-.8\" a number ? {}", is_number("-.8"));
    println!("Is \"8.-6\" a number ? {}", is_number("8.-6"));
    println!("Is \"-8-.6\" a number ? {}", is_number("-8-.6"));
}
