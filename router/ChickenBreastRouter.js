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
    res.status(500).json({ error: 'Failed to fetch chicken breasts' });
  }
});

// 질문 목록 엔드포인트
router.get('/questions', ChickenBreastController.getQuestions); // 수정된 부분

// 닭가슴살 추천 질문 처리 (POST 요청)
router.post('/question', ChickenBreastController.recommendChickenBreasts);

// 닭가슴살 추천하기 (POST 요청)
router.post('/recommend', async (req, res) => {
  try {
    const { userId, chickenBreastId } = req.body;
    const chickenBreast = await ChickenBreast.findById(chickenBreastId);

    if (!chickenBreast) {
      return res.status(404).json({ error: 'Chicken breast not found' });
    }

    if (!chickenBreast.recommendedBy.includes(userId)) {
      chickenBreast.recommendedBy.push(userId);
      await chickenBreast.save();
    }

    res.json(chickenBreast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to recommend chicken breast' });
  }
});

module.exports = router;
