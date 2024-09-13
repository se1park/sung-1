// 추천 제품 저장 API
const saveRecommendedProducts = async (req, res) => {
    try {
        const { userId, productIds } = req.body;
        const userResponse = await UserResponse.findOne({ userId: new mongoose.Types.ObjectId(userId) });

        if (userResponse) {
            // 기존 문서 업데이트
            await UserResponse.updateOne(
                { userId: new mongoose.Types.ObjectId(userId) },
                { $set: { productIds } }
            );
        } else {
            // 새로운 문서 생성
            const newUserResponse = new UserResponse({ userId: new mongoose.Types.ObjectId(userId), productIds });
            await newUserResponse.save();
        }

        res.json({ success: true, message: '추천 제품이 저장되었습니다.' });
    } catch (error) {
        res.status(500).json({ error: '추천 제품 저장에 실패했습니다.' });
    }
};


// 추천 제품 로딩 API
const getUserRecommendations = async (req, res) => {
    try {
        const { userId } = req.body;
        const userResponse = await UserResponse.findOne({ userId: new mongoose.Types.ObjectId(userId) });

        if (!userResponse || !userResponse.productIds || userResponse.productIds.length === 0) {
            return res.status(404).json({ message: '추천된 제품이 없습니다.' });
        }

        const recommendedProducts = chickenBreastData.filter(product =>
            userResponse.productIds.includes(product._id.toString())
        ).map(cleanData);

        res.json({ products: recommendedProducts });
    } catch (error) {
        res.status(500).json({ error: '추천된 제품을 가져오는데 실패했습니다.' });
    }
};
