// controllers/recipeController.js
const Recipe = require('../models/Recipe');

exports.createRecipe = async (req, res) => {
    try {
        const { title, ingredients, product, instructions } = req.body;
        const recipe = new Recipe({
            title,
            ingredients,
            product,
            instructions,
            createdBy: req.user._id,
        });
        await recipe.save();
        res.status(201).json(recipe);
    } catch (error) {
        res.status(400).json({ error: '레시피 생성에 실패했습니다.' });
    }
};

exports.getRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find().populate('product').populate('createdBy');
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: '레시피를 가져오는데 실패했습니다.' });
    }
};
