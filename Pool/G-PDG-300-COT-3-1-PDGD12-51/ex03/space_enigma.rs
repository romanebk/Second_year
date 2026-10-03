#[derive(PartialEq, Debug)]
pub enum Message {
    ClearString(String),
    DigitalCode(u32),
    Encrypted(String, u32),
}

#[derive(PartialEq, Debug)]
pub enum SecurityClass {
    Civilian,
    Diplomatic,
    Military,
}

#[derive(Debug)]
pub struct Transmission {
    pub message: Message,
    pub security: SecurityClass,
    pub signal_strength: u8,
}

pub fn solve_enigma(transmission: Transmission, daily_key: u32) -> Result<String, String>
{
    if transmission.signal_strength == 0 {
        return Err(format!("Signal lost"));
    }
    if transmission.signal_strength < 20 {
        return Err(format!("Signal too weak"));
    }
    if transmission.security == SecurityClass::Military && daily_key != 4242 {
        return Err(format!("Security Breach: Invalid Key"));
    }
    let temp_decoded = match transmission.message {
        Message::ClearString(s) => {
            if s == "Bomb" {
                return Err(format!("Panic: Bomb detected"));
            } else {
                s
            }
        }
        Message::DigitalCode(code) => match code {
            404 => format!("Not Found"),
            200 => format!("OK"),
            n => format!("Code: {}", n),
        },
        Message::Encrypted(content, key_id) => {
            if key_id == daily_key {
                content
            } else {
                return Err(format!("Encryption Error: Wrong Key"));
            }
        }
    };
    let mut complexity_score = 0;
    for c in temp_decoded.chars() {
        if c.is_alphabetic() {
            complexity_score += 1;
        } else if c.is_digit(10) {
            complexity_score -= 1;
        }
    }
    if complexity_score < 0 {
        return Err(format!("Artificial Noise"));
    } else {
        Ok(temp_decoded)
    }
}

