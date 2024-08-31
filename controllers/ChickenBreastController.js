// 협업 기반
const fs = require('fs');
const mongoose = require('mongoose');
const ChickenBreast = require('../models/ChickenBreast');
const UserResponse = require('../models/UserResponse');
const path = require('path');

// 닭가슴살 데이터 JSON 파일 읽기
const chickenBreastDataPath = path.join(__dirname, '../sources/ChickenBreast_data.json');
const chickenBreastData = JSON.parse(fs.readFileSync(chickenBreastDataPath, 'utf-8'));

// 사용자에게 제시할 질문 목록
const questions = [
    "오리지널 맛 말고 다른 맛을 원하시나요?",
    "선호하는 최소 및 최대 가격대를 입력해주세요 (예: 10000 30000).",
    "최소 평점을 입력해주세요 (예: 4)."
];

// 질문 목록을 클라이언트에게 전달하는 함수
const getQuestions = (req, res) => {
    res.json(questions);
};

// 사용자의 응답을 기반으로 쿼리를 수정하는 함수
const processAnswer = (questionIndex, answer, query) => {
    switch (questionIndex) {
        case 0: // 첫 번째 질문: 오리지널 맛 제외 여부
            if (answer.toLowerCase() === 'yes') {
                query.flavor = { $ne: '오리지널' }; // 오리지널 맛이 아닌 제품을 선택
            }
            break;
        case 1: // 두 번째 질문: 가격대
            const [minPrice, maxPrice] = answer.split(' ').map(price => parseInt(price.replace(/[^\d]/g, '')));
            if (!isNaN(minPrice)) query.price = { ...query.price, $gte: minPrice }; // 최소 가격 설정
            if (!isNaN(maxPrice)) query.price = { ...query.price, $lte: maxPrice }; // 최대 가격 설정
            break;
        case 2: // 세 번째 질문: 최소 평점
            const minRating = parseFloat(answer);
            if (!isNaN(minRating)) query.rating = { $gte: minRating }; // 최소 평점 설정
            break;
        default:
            break;
    }
    return query;
};

// 제품 데이터를 클린업(정리)하는 함수
const cleanData = (product) => {
    const price = product.price; // 가격을 가져옴
    const rating = product.rating; // 평점을 가져옴

    return {
        name: product.name,
        flavor: product.flavor.join(', '), // 맛 배열을 문자열로 결합
        price,
        image_url: product.image_url !== 'N/A' ? product.image_url : null, // 이미지 URL이 유효하지 않은 경우 null로 설정
        rating,
    };
};

// 사용자의 응답 간 유사도를 계산하는 함수
// 사용자의 응답 간 유사도를 계산하는 함수
const calculateSimilarity = (answers1, answers2) => {
    let score = 0;
    const length = Math.min(answers1.length, answers2.length); // 두 배열의 최소 길이

    // 각 질문에 대한 답변을 비교하여 동일한 답변의 개수를 세서 유사도를 계산
    for (let i = 0; i < length; i++) {
        const answer1 = answers1[i];
        const answer2 = answers2[i];
        if (answer1 && answer2 && answer1.answer === answer2.answer) {
            score += 1;
        }
    }

    return score;
};

// 닭가슴살 제품을 추천하는 메인 함수
const recommendChickenBreasts = async (req, res) => {
    try {
        const { answer, userId } = req.body;
        let { questionIndex = 0, query = {}, answers = [] } = req.session;

        // 사용자가 답변을 했을 때 처리
        if (answer !== undefined) {
            answers.push({ question: questions[questionIndex], answer });
            query = processAnswer(questionIndex, answer, query);

            // 사용자 응답을 MongoDB에 저장
            const userResponseData = {
                userId: new mongoose.Types.ObjectId(userId),
                answers,
                productIds: [] // 추천된 제품 ID를 저장할 곳
            };

            try {
                const newUserResponse = await UserResponse.create(userResponseData);
                console.log(`Stored user response in MongoDB:`, newUserResponse);
            } catch (dbError) {
                console.error('MongoDB 저장에 실패했습니다:', dbError);
                return res.status(500).json({ error: 'MongoDB 저장에 실패했습니다.' });
            }

            questionIndex++;
            req.session.questionIndex = questionIndex;
            req.session.query = query;
            req.session.answers = answers;
        }

        // 아직 모든 질문에 답하지 않은 경우 다음 질문을 전달
        if (questionIndex < questions.length) {
            res.json({ question: questions[questionIndex], answers });
        } else {
            // 협업 필터링 로직 시작
            
            // 다른 사용자 응답을 가져와 유사도를 계산
            const allUserResponses = await UserResponse.find({ userId: { $ne: userId } }).exec();
            let mostSimilarUser = null;
            let highestSimilarityScore = -1;

            // 모든 사용자 응답과 비교하여 가장 유사한 사용자를 찾음
            allUserResponses.forEach(userResponse => {
                const similarityScore = calculateSimilarity(answers, userResponse.answers || []);
                if (similarityScore > highestSimilarityScore) {
                    highestSimilarityScore = similarityScore;
                    mostSimilarUser = userResponse;
                }
            });

            let recommendedProducts = [];

            // 유사한 사용자가 있는 경우 그 사용자가 선호한 제품을 추천
            if (mostSimilarUser && Array.isArray(mostSimilarUser.productIds)) {
                const similarUserProducts = mostSimilarUser.productIds;

                // 유사한 사용자가 선호한 제품을 필터링
                recommendedProducts = chickenBreastData.filter(product => 
                    similarUserProducts.includes(product._id.toString())
                );
            } else {
                // 유사한 사용자가 없거나 유효한 productIds가 없는 경우
                recommendedProducts = [];
            }

            // 유사한 사용자가 없거나 추천할 제품이 없으면 기본 필터링 방식으로 추천
            if (recommendedProducts.length === 0) {
                recommendedProducts = chickenBreastData.filter(product => {
                    let isValid = true;

                    // 기본값 설정 및 검증
                    const productFlavors = Array.isArray(product.flavor) ? product.flavor : [];
                    const queryFlavor = query.flavor || '';

                    if (queryFlavor && productFlavors.includes(queryFlavor)) {
                        isValid = false;
                    }

                    if (query.price) {
                        const { $gte, $lte } = query.price;
                        if (product.price < $gte || product.price > $lte) {
                            isValid = false;
                        }
                    }

                    if (query.rating && product.rating < query.rating.$gte) {
                        isValid = false;
                    }

                    return isValid;
                });
            }

            // 배열에서 무작위로 n개의 요소를 선택하는 함수
            const getRandomItems = (array, n) => {
                const shuffled = array.sort(() => 0.5 - Math.random());
                return shuffled.slice(0, n);
            };

            // 최대 5개의 추천 제품을 무작위로 클린업하여 전달
            const cleanedProducts = getRandomItems(recommendedProducts, 5).map(cleanData);

            // 세션 초기화
            req.session.questionIndex = 0;
            req.session.query = {};
            req.session.answers = [];

            if (cleanedProducts.length > 0) {
                res.json({
                    message: '추천된 닭가슴살 제품입니다.',
                    answers,
                    products: cleanedProducts
                });
            } else {
                res.json({ message: '조건에 맞는 추천 제품이 없습니다.', answers });
            }
        }
    } catch (error) {
        console.error('추천을 가져오는데 실패했습니다:', error);
        res.status(500).json({ error: '추천을 가져오는데 실패했습니다.' });
    }
};

module.exports = { getQuestions, recommendChickenBreasts };
