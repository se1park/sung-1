document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const findUsernameForm = document.getElementById('find-username-form');
    const findPasswordForm = document.getElementById('find-password-form');

    console.log('DOM fully loaded and parsed');

    // 초기화
    let questions = [];
    let currentQuestionIndex = 0;

    // API 호출 함수
    async function apiRequest(url, method, body) {
        console.log(`API Request: ${method} ${url}`, body);
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (response.ok) {
                console.log('API Response:', data);
                return data;
            } else {
                console.error('API Error Response:', data);
                throw new Error(data.message || '서버 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error(`${method} 요청 오류:`, error);
            alert(error.message);
            throw error;
        }
    }

    // 회원가입 폼 처리
    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            console.log('Signup Form Submitted:', { username, email, password });

            try {
                await apiRequest('http://localhost:8000/auth/signup', 'POST', { username, email, password });
                alert('회원가입이 성공적으로 완료되었습니다.');
                window.location.href = 'http://localhost:8000/'; // 홈으로 리다이렉트
            } catch {
                // 에러 메시지는 apiRequest에서 처리
            }
        });
    } else {
        console.error('Signup form not found.');
    }

    // 아이디 찾기 폼 처리
    if (findUsernameForm) {
        findUsernameForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('find-email').value;

            console.log('Find Username Form Submitted:', { email });

            try {
                const data = await apiRequest('http://localhost:8000/auth/find-username', 'POST', { email });
                alert(`아이디: ${data.username}\n이메일: ${email}`);
            } catch {
                // 에러 메시지는 apiRequest에서 처리
            }
        });
    } else {
        console.error('Find Username form not found.');
    }

    // 비밀번호 찾기 폼 처리
    if (findPasswordForm) {
        findPasswordForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('find-username').value;
            const email = document.getElementById('find-password-email').value;

            console.log('Find Password Form Submitted:', { username, email });

            try {
                await apiRequest('http://localhost:8000/auth/reset-password-request', 'POST', { username, email });
                alert('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
            } catch {
                // 에러 메시지는 apiRequest에서 처리
            }
        });
    } else {
        console.error('Find Password form not found.');
    }

    // 질문 목록을 가져오는 함수
    async function fetchQuestions() {
        console.log('Fetching questions...');
        try {
            questions = await apiRequest('http://localhost:8000/api/chicken-breast/questions', 'GET');
            console.log('Questions fetched:', questions);
            if (questions.length > 0) {
                displayQuestion(questions[currentQuestionIndex]);
                document.getElementById('question-container').style.display = 'block';
            } else {
                document.getElementById('question-container').innerText = '질문이 없습니다.';
            }
        } catch {
            // 에러 메시지는 apiRequest에서 처리
        }
    }

    function displayQuestion(question) {
        console.log('Displaying question:', question);
        const questionElement = document.getElementById('question');
        const answerInput = document.getElementById('answer');
        const yesBtn = document.getElementById('yes-btn');
        const noBtn = document.getElementById('no-btn');
        const submitBtn = document.getElementById('submit-answer');
        const answerContainer = document.getElementById('answer-container');

        if (questionElement) {
            questionElement.innerText = question;
        } else {
            console.error('Question element not found.');
        }

        if (answerInput && yesBtn && noBtn && submitBtn && answerContainer) {
            answerInput.style.display = currentQuestionIndex === 0 ? 'none' : 'inline-block';
            yesBtn.style.display = currentQuestionIndex === 0 ? 'inline-block' : 'none';
            noBtn.style.display = currentQuestionIndex === 0 ? 'inline-block' : 'none';
            submitBtn.style.display = currentQuestionIndex === 0 ? 'none' : 'inline-block';
            answerContainer.style.display = 'flex';
        } else {
            console.error('Some elements for displaying the question are missing.');
        }
    }

    async function processAnswer(answer) {
        console.log('Processing answer:', answer);
        try {
            const data = await apiRequest('http://localhost:8000/api/chicken-breast/question', 'POST', { answer });
            console.log('Answer processed, moving to next question:', data);
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                displayQuestion(questions[currentQuestionIndex]);
            } else {
                displayRecommendations(data.products);
                resetUI();
            }
        } catch {
            // 에러 메시지는 apiRequest에서 처리
        }
    }

    function displayRecommendations(products) {
        console.log('Displaying recommendations:', products);
        const resultsElement = document.getElementById('recommendation-results');
        if (resultsElement) {
            if (products.length > 0) {
                resultsElement.innerHTML = '<ul>' + products.map(product => `
                    <li>
                        <h3>${product.name}</h3>
                        <p>Flavor: ${product.flavor}</p>
                        <p>Price: ${product.price}</p>
                        <p>Rating: ${product.rating}</p>
                        <img src="${product.image_url}" alt="${product.name}" width="100">
                    </li>
                `).join('') + '</ul>';
    
                // 추천받은 제품을 서버에 저장
                saveRecommendations(products);
    
            } else {
                resultsElement.innerText = '추천할 제품이 없습니다.';
            }
        } else {
            console.error('Recommendation results element not found.');
        }
    }
    
    // 추천받은 제품을 저장하는 함수
    async function saveRecommendations(products) {
        try {
            const userId = '사용자_아이디_여기_삽입'; // 실제로 로그인한 사용자의 ID를 가져와야 함
            await apiRequest('http://localhost:8000/api/save-recommendation', 'POST', { userId, products });
            console.log('추천 제품이 저장되었습니다.');
        } catch (error) {
            console.error('추천 제품 저장 오류:', error);
        }
    }
    

    function resetUI() {
        console.log('Resetting UI...');
        document.getElementById('answer-container').style.display = 'none';
        document.getElementById('question-container').style.display = 'none';
    }

    // 초기화 및 질문 가져오기
    fetchQuestions();

    // 소셜 로그인 버튼 이벤트 추가
    const kakaoLoginBtn = document.getElementById('kakao-login-btn');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const naverLoginBtn = document.getElementById('naver-login-btn');

    if (kakaoLoginBtn) {
        kakaoLoginBtn.addEventListener('click', () => {
            window.location.href = 'http://localhost:8000/auth/kakao';
        });
    } else {
        console.error('Kakao login button not found.');
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            window.location.href = 'http://localhost:8000/auth/google';
        });
    } else {
        console.error('Google login button not found.');
    }

    if (naverLoginBtn) {
        naverLoginBtn.addEventListener('click', () => {
            window.location.href = 'http://localhost:8000/auth/naver';
        });
    } else {
        console.error('Naver login button not found.');
    }

    document.getElementById('submit-answer').addEventListener('click', async () => {
        const answer = document.getElementById('answer').value;
        if (answer.trim()) {
            await processAnswer(answer);
        }
    });

    document.getElementById('yes-btn').addEventListener('click', async () => {
        await processAnswer('Yes');
    });

    document.getElementById('no-btn').addEventListener('click', async () => {
        await processAnswer('No');
    });
});
