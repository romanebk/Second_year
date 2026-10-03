count_elem :: [a] -> b -> c
count_elem [] n = 0
count_elem (x:xs) n = if (x == n) c + 1

countOps :: [String] -> [(String, Int)]
countOps [] = []
countOps (x:xs) = ([xs, count_elem xs x])