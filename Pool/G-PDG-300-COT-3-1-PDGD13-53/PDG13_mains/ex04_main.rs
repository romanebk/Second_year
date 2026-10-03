fn main() {
    let readings = vec![
        23.0,
        -300.0,
        20.5,
        -273.15
    ];

    match calculate_average_temperature(&readings) {
        Some(avg) => println!("Average Temp: {:.2}", avg),
        None => println!("No valid readings"),
    }
}
