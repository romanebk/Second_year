fn main() {
    let r1 = Rover { name: "Spirit".to_string(), fuel_level: 0, map_sectors: vec![] };
    let r2 = Rover { name: "Opportunity".to_string(), fuel_level: 50, map_sectors: vec![1, 2] };
    let r3 = Rover { name: "Curiosity".to_string(), fuel_level: 100, map_sectors: vec![1, 2, 3, 4] };
    let m1 = Mission { mission_name: "Alpha".to_string(), rover: r1.clone(), state: MissionState::Failed };
    let m2 = Mission { mission_name: "Alpha".to_string(), rover: r2.clone(), state: MissionState::InProgress };
    let m3 = Mission { mission_name: "Beta".to_string(),  rover: r3.clone(), state: MissionState::Completed };
    println!("--- Report ---");
    println!("{}", m1);
    println!("\n--- Deduplication ---");
    if m1 == m2 {
        println!("Mission '{}' is a duplicate of Mission '{}'.", m1.mission_name, m2.mission_name);
    } else {
        println!("Missions are different.");
    }
    println!("\n--- Priority Sorting ---");
    let mut states = vec![
        MissionState::Planned,
        MissionState::Failed,
        MissionState::Completed,
        MissionState::InProgress,
    ];
    states.sort_by(|a, b| b.cmp(a)); 
    for s in states {
        println!("{:?}", s);
    }
}
