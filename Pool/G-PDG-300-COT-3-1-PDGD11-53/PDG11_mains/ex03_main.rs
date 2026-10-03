fn main() {
    let to_take: u32 = 2;
    let mut equipment_chest: Chest = Chest { helmet: 10, suit: 23 };
    let name1 = "Paul".to_string();
    let name2 = "Laura".to_string();
    let astronaut_1 = add_title(&name1);
    let astronaut_2 = add_title(&name2);

    println!("- Here is the contract of {}:\n{}", name1, sign_contract(&astronaut_1));
    println!("- And here is the declaration of {}, ready to send to the press:\n{}\n", astronaut_1, sign_press_declaration(&astronaut_1));
    take_helmet(&mut equipment_chest, to_take);
    take_suit(&mut equipment_chest, to_take);
    println!("Number of Helmets: {} - Number of Suits: {}\n", equipment_chest.helmet, equipment_chest.suit);

    println!("- Here is the contract of {}:\n{}", name2, sign_contract(&astronaut_2));
    println!("- And here is the declaration of {}, ready to send to the press:\n{}\n", astronaut_2, sign_press_declaration(&astronaut_2));
    take_helmet(&mut equipment_chest, to_take);
    take_suit(&mut equipment_chest, to_take);
    println!("Number of Helmets: {} - Number of Suits: {}", equipment_chest.helmet, equipment_chest.suit);
}
