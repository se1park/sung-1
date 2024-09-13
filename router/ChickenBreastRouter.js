// router/ChickenBreastRouter.js
const express = require('express');
const router = express.Router();
const ChickenBreast = require('../models/ChickenBreast');
const ChickenBreastController = require('../controllers/ChickenBreastController'); // 수정된 부분

// 모든 닭가슴살 목록 가져오기
router.get('/', async (req, res) => {
  try {
    const chickenBreasts = await ChickenBreast.find();
    res.json(chickenBreasts);
  } catch (error) {
    res.status(500).json({ error: '닭가슴살 목록을 가져오는 데 실패했습니다.' });
  }
});

// 질문 목록 엔드포인트
router.get('/questions', ChickenBreastController.getQuestions); 

// 닭가슴살 추천 질문 처리 (POST 요청)
router.post('/question', ChickenBreastController.recommendChickenBreasts);

// 닭가슴살 추천하기 (POST 요청)
router.post('/recommend', async (req, res) => {
  try {
    const { userId, chickenBreastId } = req.body;
    const chickenBreast = await ChickenBreast.findById(chickenBreastId);

    if (!chickenBreast) {
      return res.status(404).json({ error: '해당 닭가슴살을 찾을 수 없습니다.' });
    }

    if (!chickenBreast.recommendedBy.includes(userId)) {
      chickenBreast.recommendedBy.push(userId);
      await chickenBreast.save();
    }

    res.json(chickenBreast);
  } catch (error) {
    res.status(500).json({ error: '닭가슴살 추천에 실패했습니다.' });
  }
});

// 추천받은 제품 저장
router.post('/recommendations/save', async (req, res) => {
  const { userId, products } = req.body; // 사용자 ID와 추천받은 제품
  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }
      // 추천받은 제품을 사용자 모델에 저장
      user.recommendations = products;
      await user.save();
      res.status(200).json({ message: '추천 제품이 저장되었습니다.' });
  } catch (error) {
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;