fn main() {
    let scores = vec![75, 92, 88, 100, 42];
    match winning_candidate(&scores) {
        Some(v) => println!("Highest Score: {}", v),
        None => println!("No scores provided"),
    }

    let precision = vec![0.12, 5.9, 0.01, 3.14];
    match winning_candidate(&precision) {
        Some(v) => println!("Highest Precision: {}", v),
        None => println!("No precision data"),
    }

    let candidates = vec![
        String::from("Amelia"),
        String::from("Yuri"),
        String::from("Neil"),
        String::from("Buzz"),
    ];
    match winning_candidate(&candidates) {
        Some(v) => println!("Last Alphabetical Name: {}", v),
        None => println!("No candidates"),
    }

    let empty_list: Vec<i32> = vec![];
    match winning_candidate(&empty_list) {
        Some(_) => println!("This should not print"),
        None => println!("Correctly handled empty list"),
    }
}
