const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ingredients: { type: [String], required: true },
  instructions: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chickenBreast: { type: mongoose.Schema.Types.ObjectId, ref: 'ChickenBreast', required: true }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
