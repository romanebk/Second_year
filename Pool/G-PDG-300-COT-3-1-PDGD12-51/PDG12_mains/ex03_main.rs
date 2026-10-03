fn main() {
    let key = 4242;

    let t1 = Transmission {
        message: Message::ClearString(String::from("Hello World")),
        security: SecurityClass::Civilian,
        signal_strength: 100,
    };

    let t2 = Transmission {
        message: Message::Encrypted(String::from("Target 89898989"), 4242),
        security: SecurityClass::Military,
        signal_strength: 80,
    };

    println!("--- Transmission 1 ---");
    println!("{:?}", solve_enigma(t1, key));
    
    println!("--- Transmission 2 (Sanity Check Fail) ---");
    println!("{:?}", solve_enigma(t2, key));
}
