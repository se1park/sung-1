// models/ChickenBreast.js
const mongoose = require('mongoose');

const chickenBreastSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true }, // 브랜드 필드 추가
  flavor: { type: String, required: true }, // 맛 필드 추가
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  fat: { type: Number, required: true },
  recommendedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }]
});

const ChickenBreast = mongoose.models.ChickenBreast || mongoose.model('ChickenBreast', chickenBreastSchema);

module.exports = ChickenBreast;
