pub fn flying_sequence(mut countdown: u32, ignition: u32, secondary_activation: u32, thrust_duration: u32)
{
    if ignition > countdown {
        println!("Wrong flying sequence, go back to the lab !");
        return;
    }
    while countdown > 0 {
        println!("Liftoff in {}...", countdown);
        if countdown == ignition {
            println!("Main engine ignition");
        }
        countdown -= 1;
    }
    println!("Liftoff ! We have liftoff !");
    let mut t = 1;
    while t <= (secondary_activation + thrust_duration) {
        if t == secondary_activation {
            println!("T+{} : Secondary engines ignition", t);
        }
        if t == secondary_activation - 9 {
            println!("T+{} : Main engine decoupling", t);
        }
        if t % 10 == 0 {
            println!("T+{} : Everything is fine", t);
        }
        if t == secondary_activation - 10 {
            println!("T+{} : Main engine cutoff", t);
        }
        if t == secondary_activation + thrust_duration {
            println!("T+{} : Secondary engines cutoff. We're in orbit !", t);
        }
        t += 1;
    }
}
