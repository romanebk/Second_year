fn main() {
    let mut crew = create_crew(10);
    
    join_crew(&mut crew, String::from("Rippley"));
    join_crew(&mut crew, String::from("Dallas"));
    join_crew(&mut crew, String::from("Brett"));
    
    println!("Current crew size: {}", survey_crew(&crew));
    
    println!("Removing Brett...");
    leave_crew(&mut crew, "Brett");
    
    println!("Removing Alien...");
    leave_crew(&mut crew, "Alien");
    
    println!("Final crew:");
    for member in crew {
        println!("- {}", member);
    }
}
