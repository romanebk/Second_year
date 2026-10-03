fn main() {
    let number_box = Storage::new(42);
    let number = number_box.extract();
    println!("Extracted number: {}", number);

    let string_box = Storage::new(String::from("Nano-Material"));
    let material = string_box.extract();
    println!("Extracted material: {}", material);
}
