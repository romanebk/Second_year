{-
-- EPITECH PROJECT, 2026
-- Paradigms Seminar Rush2
-- File description:
-- Push_Swap
-}

module Main where

import System.Environment (getArgs)
import System.Exit (exitWith, ExitCode(..))
import System.IO (hPutStrLn, stderr)
import Data.List (sort, intercalate)

data State = State
  { stackA :: [Int]
  , stackB :: [Int]
  } deriving (Show, Eq)

swap :: [Int] -> [Int]
swap [] = []
swap [x] = [x]
swap (x:y:xs) = (y:x:xs)

rotate :: [Int] -> [Int]
rotate [] = []
rotate (x:xs) = xs ++ [x]

reverseRotate :: [Int] -> [Int]
reverseRotate [] = []
reverseRotate xs = [last xs] ++ init xs

push :: [Int] -> [Int] -> ([Int], [Int])
push [] target = ([], target)
push (x:xs) target = (xs, x:target)

opSa :: State -> State
opSa new_stackA = new_stackA { stackA = swap (stackA new_stackA) }

opSb :: State -> State
opSb new_stackB = new_stackB { stackB = swap (stackB new_stackB) }

opSc :: State -> State
opSc new_stackC = opSb (opSa new_stackC)

opPa :: State -> State
opPa new_stackPa =
  let (newB, newA) = push (stackB new_stackPa) (stackA new_stackPa)
  in new_stackPa { stackA = newA, stackB = newB }

opPb :: State -> State
opPb new_stackPb =
  let (newA, newB) = push (stackA new_stackPb) (stackB new_stackPb)
  in new_stackPb { stackA = newA, stackB = newB }

opRa :: State -> State
opRa new_stackRa = new_stackRa { stackA = rotate (stackA new_stackRa) }

opRb :: State -> State
opRb new_stackRb = new_stackRb { stackB = rotate (stackB new_stackRb) }

opRr :: State -> State
opRr new_stackRr = opRb (opRa new_stackRr)

opRra :: State -> State
opRra new_stackRra = new_stackRra
    { stackA = reverseRotate (stackA new_stackRra) }

opRrb :: State -> State
opRrb new_stackRrb = new_stackRrb
    { stackB = reverseRotate (stackB new_stackRrb) }

opRrr :: State -> State
opRrr new_stackRrr = opRrb (opRra new_stackRrr)

applyOp :: State -> String -> Either String State
applyOp state "sa"  = Right (opSa state)
applyOp state "sb"  = Right (opSb state)
applyOp state "sc"  = Right (opSc state)
applyOp state "pa"  = Right (opPa state)
applyOp state "pb"  = Right (opPb state)
applyOp state "ra"  = Right (opRa state)
applyOp state "rb"  = Right (opRb state)
applyOp state "rr"  = Right (opRr state)
applyOp state "rra" = Right (opRra state)
applyOp state "rrb" = Right (opRrb state)
applyOp state "rrr" = Right (opRrr state)
applyOp _ op        = Left ("Invalid operation: " ++ op)

applyOps :: State -> [String] -> Either String State
applyOps initialState ops = foldl applyOpa (Right initialState) ops
  where
    applyOpa (Left err) _   = Left err
    applyOpa (Right st) op  = applyOp st op

isSorted :: [Int] -> Bool
isSorted xs = xs == sort xs

isValidResult :: State -> Bool
isValidResult state = isSorted (stackA state) && null (stackB state)

parseNumber :: String -> Maybe Int
parseNumber s
  | all (\c -> c `elem` "-0123456789") s && not (null s) && s /= "-" =
      Just (read s)
  | otherwise = Nothing

parseNumbers :: [String] -> Either String [Int]
parseNumbers args =
  case mapM parseNumber args of
    Nothing -> Left "Invalid number format"
    Just nums -> if null nums then Left "No numbers provided" else Right nums

parseOps :: String -> [String]
parseOps = words

formatStack :: [Int] -> String
formatStack xs = "[" ++ intercalate "," (map show xs) ++ "]"

printOK :: IO ()
printOK = putStrLn "OK"

printKO :: State -> IO ()
printKO state =
  putStrLn ("KO: (" ++ formatStack (stackA state) ++ ","
          ++ formatStack (stackB state) ++ ")")

processOps :: [Int] -> IO ()
processOps numbers = do
  operationsLine <- getLine
  let operations = parseOps operationsLine
  let initialState = State numbers []
  case applyOps initialState operations of
    Left err -> hPutStrLn stderr ("Error: " ++ err) >>
      exitWith (ExitFailure 84)
    Right finalState -> if isValidResult finalState
      then printOK >> exitWith ExitSuccess
      else printKO finalState >> exitWith ExitSuccess

main :: IO ()
main = do
  args <- getArgs
  case parseNumbers args of
    Left err -> hPutStrLn stderr ("Error: " ++ err) >>
      exitWith (ExitFailure 84)
    Right numbers -> processOps numbers
