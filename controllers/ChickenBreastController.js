// controllers/chickenBreastController.js
const ChickenBreast = require('../models/ChickenBreast');
const Recipe = require('../models/Recipe');

exports.recommendChickenBreasts = async (req, res) => {
    try {
        const { brand, flavor, minProtein } = req.query; // 클라이언트에서 전달되는 쿼리 매개변수로 필터링
        const query = {};

        if (brand) query.brand = brand;
        if (flavor) query.flavor = flavor;
        if (minProtein) query.protein = { $gte: parseInt(minProtein, 10) };

        const products = await ChickenBreast.find(query).limit(5); // 필터링된 제품 조회, 최대 5개
        const recipes = await Recipe.find({ chickenBreast: { $in: products.map(p => p._id) } }).populate('chickenBreast');

        res.json({ products, recipes });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: '추천을 가져오는데 실패했습니다.' });
    }
};
