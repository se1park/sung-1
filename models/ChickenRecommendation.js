// models/ChickenRecommendation.js
const mongoose = require('mongoose');

const chickenRecommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chickenList: [
    {
      name: String,
      price: Number
    }
  ]
});

module.exports = mongoose.model('ChickenRecommendation', chickenRecommendationSchema);
