pub fn create_crew(size : i32) -> Vec<String>
{
    if size < 0 || size == 0 {
        return Vec::new();
    }
    let crew_created = Vec::with_capacity(size as usize);
    crew_created
}

pub fn join_crew(crew: &mut Vec<String>, name: String)
{
    crew.push(name);
}

pub fn leave_crew(crew: &mut Vec<String>, name: &str)
{
    if let Some(index) = crew.iter().position(|r| r == name) {
        crew.remove(index);
    }
}

pub fn survey_crew ( crew : & Vec < String >) -> usize
{
    crew.len()
}
