const express = require('express');
const router = express.Router();
const ChickenBreast = require('../models/chickenBreast'); // 경로의 대소문자 일치
const { recommendChickenBreasts } = require('../controllers/chickenBreastController');

// 모든 닭가슴살 목록 가져오기
router.get('/', async (req, res) => {
  try {
    const chickenBreasts = await ChickenBreast.find();
    res.json(chickenBreasts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chicken breasts' });
  }
});

router.get('/recommend', recommendChickenBreasts);

// 닭가슴살 추천
router.post('/recommend', async (req, res) => {
  try {
    const { userId, chickenBreastId } = req.body;
    const chickenBreast = await ChickenBreast.findById(chickenBreastId);

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
