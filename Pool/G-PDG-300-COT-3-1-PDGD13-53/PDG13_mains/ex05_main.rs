fn main() {
    let temps = vec![
        "30.0",
        "garbage",
        "100.0",
        "50.0"
    ];
    
    let rpms = vec![
        1000,
        3000,
        5000,
    ];

    let report = fusion_processing(&temps, &rpms);
    
    println!("Fused {} pairs. Total Energy: {}", report.sample_count, report.total_energy);
}
