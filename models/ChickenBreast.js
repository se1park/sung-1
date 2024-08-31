// models/ChickenBreast.js

const mongoose = require('mongoose');

const ChickenBreastSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 이름
  flavor: { type: [String] }, // 맛 (배열로 변경)
  price: { type: Number, required: true }, // 가격
  image_url: { type: String }, // 이미지 URL
  rating: { type: Number, min: 0, max: 5 }, // 평점 (0에서 5 사이)
  recommendedBy: { type: [String], default: [] }  // 추천한 유저들
  // 기타 속성들
});


const ChickenBreast = mongoose.model('ChickenBreast', ChickenBreastSchema, 'chickenbreasts');

module.exports = ChickenBreast;
