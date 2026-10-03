pub struct Recipe {
    pub name: String,
    pub ingredients: Vec<String>,
}

pub fn get_ingredient_quantity(ingredient: &str) -> Result<usize, String>
{
    match ingredient {
        "Space Bacon" => Ok(42),
        "Dehydrated Eggs" => Ok(120),
        "Soy Milk" => Ok(5),
        "Antimatter" => panic!("BOOM! The kitchen exploded!"),
        "Recycled Water" => Err(format!("Machine broken")),
        _ => Err(format!("Food not found")),
    }
}

pub fn resolve_recipe(name: &str) -> Result<Recipe, String>
{
    match name {
        "Space Omelette" => Ok(Recipe {
            name: "Space Omelette".to_string(),
            ingredients: vec!["Space Bacon".to_string(), "Dehydrated Eggs".to_string()],
        }),
        "Corpse Reviver" => Ok(Recipe {
            name: "Corpse Reviver".to_string(),
            ingredients: vec!["Soy Milk".to_string(), "Recycled Water".to_string()],
        }),
        "Quantum Brownie" => Ok(Recipe {
            name: "Quantum Brownie".to_string(),
            ingredients: vec!["Space Bacon".to_string(), "Antimatter".to_string()],
        }),
        _ => Err(format!("Meal not on menu")),
    }
}

pub fn check_availability(recipe: &Recipe) -> Result<String, String>
{
    for un_ingredient in &recipe.ingredients {
        get_ingredient_quantity(un_ingredient.as_str())?;
    }
    Ok(format!("All ingredients available"))
}

pub fn cook_meal(order: &str) -> Result<String, String>
{
    let recipe = resolve_recipe(order)?;
    check_availability(&recipe)?;
    Ok(format!("The {} is ready!", order))
}

