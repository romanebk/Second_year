mySucc :: Int -> Int
mySucc n = n + 1

myIsNeg :: Int -> Bool
myIsNeg n = if n < 0
        then True
        else False

myAbs :: Int -> Int
myAbs n = if n < 0
        then (-n)
        else n

myMin :: Int -> Int -> Int
myMin a b = if a > b
        then b
        else a

myMax :: Int -> Int -> Int
myMax a b = if a < b
        then b
        else a

myTuple :: a -> b -> (a, b)
myTuple x y = (x, y)

myTruple :: a -> b -> c -> (a, b, c)
myTruple x y z = (x, y, z)

myFst :: (a, b) -> a
myFst (x, y) = x

mySnd :: (a, b) -> b
mySnd (x, y) = y

mySwap :: (a, b) -> (b, a)
mySwap (x, y) = (y, x)

myHead :: [a] -> a
myHead [] = error "This list is an empty list"
myHead (b : boko) = b

myTail :: [a] -> [a]
myTail [] = error "This list is an empty list"
myTail (b : boko) = boko

myLength :: [a] -> Int
myLength [] = 0
myLength (b : bce) = 1 + myLength bce

myNth :: [a] -> Int -> a
myNth [] _ = error "This list is an empty liste"
myNth (x : xs) 0 = x
myNth (_ : xs) n = myNth xs (n - 1)

myTake :: Int -> [a] -> [a]
myTake n _
    | n <= 0 = []
myTake n [] = []
myTake n (x : xs) = x : myTake (n - 1) xs

myDrop :: Int -> [a] -> [a]
myDrop n xs | n <= 0 = xs
myDrop _ [] = []
myDrop n (x : xs) = myDrop (n - 1) xs

myAppend :: [a] -> [a] -> [a]
myAppend [] cd = cd
myAppend (e:ef) cd = e : myAppend ef cd

myReverse :: [a] -> [a]
myReverse [] = []
myReverse (x:xs) = myAppend (myReverse xs) [x]
