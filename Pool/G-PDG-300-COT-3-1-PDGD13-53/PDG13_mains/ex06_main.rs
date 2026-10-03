fn main() {
    let mut c: Board = Board::new(10, 10);
    let pos: [(i64, i64); 6] = [(2, 6), (1, 7), (3, 6), (3, 7), (3, 8), (3, 10)];
    let mut i: i32 = 0;

    for (x, y) in pos {
        match c.add_life(x, y) {
            Ok(()) => (),
            Err(x) => println!("{x}"),
        };
    }
    while i < 3 {
        println!("{c}\n");
        c.next();
        i += 1;
    }
}
