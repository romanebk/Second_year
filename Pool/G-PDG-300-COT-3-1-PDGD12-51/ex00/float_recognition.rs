#[allow(dead_code)]
#[allow(unused_variables)]
#[allow(unused_mut)]

pub fn compter_caractere(chaine: &str, caractere_cible: char) -> usize
{
    chaine.chars().filter(|&c| c == caractere_cible).count()
}

pub fn is_number(number: &str) -> bool
{
    let chaine_nettoyee = number.trim();
    if chaine_nettoyee.is_empty() {
        return false;
    }
    if compter_caractere(chaine_nettoyee, '.') != 1 && compter_caractere(chaine_nettoyee, '.') != 0 {
        return false;
    }
    let v_str: Vec<char> = chaine_nettoyee.chars().collect();
    let mut i = 0;
    let mut c;
    let mut has_digit = false;
    if (v_str[i] == '+' && i == 0) || (v_str[i] == '-' && i == 0) {
        i += 1;
    }
    while i < v_str.len() {
        c = v_str[i];
        if c.is_digit(10) {
            has_digit = true;
        } else if c == '.' {
            if i == 0 || i + 1 >= v_str.len() || v_str[i - 1].is_digit(10) != true || v_str[i + 1].is_digit(10) != true {
                return false;
            }
        } else {
            return false;
        }
        i += 1;
    }
    has_digit
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_float() {
        assert_eq!(is_number("42.42"), true);
    }

    #[test]
    fn test_multiple_dots() {
        assert_eq!(is_number("42.24.42"), false);
    }

    #[test]
    fn test_non_numeric() {
        assert_eq!(is_number("yeet"), false);
    }

    #[test]
    fn test_with_whitespace_around() {
        assert_eq!(is_number("\t123.456"), true);
    }

    #[test]
    fn test_whitespace_in_middle() {
        assert_eq!(is_number("123 .456"), false);
    }

    #[test]
    fn test_negative_float() {
        assert_eq!(is_number("-0.4"), true);
    }

    #[test]
    fn test_dot_without_leading_digit() {
        assert_eq!(is_number("-.8"), false);
    }

    #[test]
    fn test_invalid_format_1() {
        assert_eq!(is_number("8.-6"), false);
    }

    #[test]
    fn test_invalid_format_2() {
        assert_eq!(is_number("-8-.6"), false);
    }

    #[test]
    fn test_integer_positive() {
        assert_eq!(is_number("42"), true);
    }

    #[test]
    fn test_integer_negative() {
        assert_eq!(is_number("-42"), true);
    }

    #[test]
    fn test_empty_string() {
        assert_eq!(is_number(""), false);
    }

    #[test]
    fn test_only_whitespace() {
        assert_eq!(is_number("   "), false);
    }

    #[test]
    fn test_only_dot() {
        assert_eq!(is_number("."), false);
    }

    #[test]
    fn test_only_sign() {
        assert_eq!(is_number("-"), false);
    }

    #[test]
    fn test_dot_at_end() {
        assert_eq!(is_number("42."), false);
    }

    #[test]
    fn test_plus_sign() {
        assert_eq!(is_number("+42.42"), true);
    }
}

fn main() {
    println!("Is \"42.42\" a number ? {}", is_number("42.42"));
    println!("Is \"42.24.42\" a number ? {}", is_number("42.24.42"));
    println!("Is \"yeet\" a number ? {}", is_number("yeet"));
    println!("Is \"   \t123.456   \" a number ? {}", is_number("   \t123.456   "));
    println!("Is \"123   .456\" a number ? {}", is_number("123   .456"));
    println!("Is \"-0.4\" a number ? {}", is_number("-0.4"));
    println!("Is \"-.8\" a number ? {}", is_number("-.8"));
    println!("Is \"8.-6\" a number ? {}", is_number("8.-6"));
    println!("Is \"-8-.6\" a number ? {}", is_number("-8-.6"));
}
