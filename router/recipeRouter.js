const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { createRecipe, getRecipes } = require('../controllers/RecipeController');

// 새로운 레시피 등록
router.post('/', async (req, res) => {
  const { title, ingredients, instructions, createdBy, chickenBreast } = req.body;
  const recipe = new Recipe({ title, ingredients, instructions, createdBy, chickenBreast });
  await recipe.save();
  res.json(recipe);
});

router.post('/create', createRecipe);
router.get('/', getRecipes);

// 모든 레시피 목록 가져오기
router.get('/', async (req, res) => {
  const recipes = await Recipe.find();
  res.json(recipes);
});

module.exports = router;
