document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const findUsernameForm = document.getElementById('find-username-form');
    const findPasswordForm = document.getElementById('find-password-form');

    console.log('DOM이 완전히 로드되고 구문 분석되었습니다.');

    // 초기화
    let questions = [];
    let currentQuestionIndex = 0;

    // API 호출 함수
    async function apiRequest(url, method, body) {
        console.log(`API 요청: ${method} ${url}`, body);
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (response.ok) {
                console.log('API 응답:', data);
                return data;
            } else {
                console.error('API 오류 응답:', data);
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

            console.log('회원가입 폼 제출됨:', { username, email, password });

            try {
                await apiRequest('http://localhost:8000/auth/signup', 'POST', { username, email, password });
                alert('회원가입이 성공적으로 완료되었습니다.');
                window.location.href = '/'; // 홈으로 리다이렉트
            } catch {
                // 에러 메시지는 apiRequest에서 처리
            }
        });
    } else {
        console.error('회원가입 폼을 찾을 수 없습니다.');
    }

    // 아이디 찾기 폼 처리
    if (findUsernameForm) {
        findUsernameForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('find-email').value;

            console.log('아이디 찾기 폼 제출됨:', { email });

            try {
                const data = await apiRequest('http://localhost:8000/auth/find-username', 'POST', { email });
                alert(`아이디: ${data.username}\n이메일: ${email}`);
            } catch {
                // 에러 메시지는 apiRequest에서 처리
            }
        });
    } else {
        console.error('아이디 찾기 폼을 찾을 수 없습니다.');
    }

    // 비밀번호 찾기 폼 처리
    if (findPasswordForm) {
        findPasswordForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('find-username').value;
            const email = document.getElementById('find-password-email').value;

            console.log('비밀번호 찾기 폼 제출됨:', { username, email });

            try {
                await apiRequest('http://localhost:8000/auth/reset-password-request', 'POST', { username, email });
                alert('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
            } catch {
                // 에러 메시지는 apiRequest에서 처리
            }
        });
    } else {
        console.error('비밀번호 찾기 폼을 찾을 수 없습니다.');
    }

    // 질문 목록을 가져오는 함수
    async function fetchQuestions() {
        console.log('질문을 가져오는 중...');
        try {
            questions = await apiRequest('http://localhost:8000/api/chicken-breast/questions', 'GET');
            console.log('질문이 가져와졌습니다:', questions);
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
        console.log('질문을 표시합니다:', question);
        const questionElement = document.getElementById('question');
        const answerInput = document.getElementById('answer');
        const yesBtn = document.getElementById('yes-btn');
        const noBtn = document.getElementById('no-btn');
        const submitBtn = document.getElementById('submit-answer');
        const answerContainer = document.getElementById('answer-container');

        if (questionElement) {
            questionElement.innerText = question;
        } else {
            console.error('질문 요소를 찾을 수 없습니다.');
        }

        if (answerInput && yesBtn && noBtn && submitBtn && answerContainer) {
            answerInput.style.display = currentQuestionIndex === 0 ? 'none' : 'inline-block';
            yesBtn.style.display = currentQuestionIndex === 0 ? 'inline-block' : 'none';
            noBtn.style.display = currentQuestionIndex === 0 ? 'inline-block' : 'none';
            submitBtn.style.display = currentQuestionIndex === 0 ? 'none' : 'inline-block';
            answerContainer.style.display = 'flex';
        } else {
            console.error('질문을 표시하기 위한 일부 요소를 찾을 수 없습니다.');
        }
    }

    async function processAnswer(answer) {
        console.log('답변 처리 중:', answer);
        try {
            const data = await apiRequest('http://localhost:8000/api/chicken-breast/question', 'POST', { answer });
            console.log('답변 처리 완료, 다음 질문으로 이동:', data);
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
        console.log('추천 제품을 표시합니다:', products);
        const resultsElement = document.getElementById('recommendation-results');
        if (resultsElement) {
            if (products.length > 0) {
                resultsElement.innerHTML = '<ul>' + products.map(product => `
                    <li>
                        <h3>${product.name}</h3>
                        <p>맛: ${product.flavor}</p>
                        <p>가격: ${product.price}</p>
                        <p>평점: ${product.rating}</p>
                        <img src="${product.image_url}" alt="${product.name}" width="100">
                    </li>
                `).join('') + '</ul>';
    
                // 추천받은 제품을 서버에 저장
                saveRecommendations(products);
    
            } else {
                resultsElement.innerText = '추천할 제품이 없습니다.';
            }
        } else {
            console.error('추천 결과 요소를 찾을 수 없습니다.');
        }
    }
    
    async function saveRecommendations(products) {
        try {
            const response = await fetch('http://localhost:8000/api/recommendations/save', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ products }), 
                credentials: 'include' 
            });
    
            console.log('응답 상태 코드:', response.status);
            console.log('응답 헤더:', response.headers);
    
            const text = await response.text();
            console.log('응답 본문:', text);
    
            try {
                const data = JSON.parse(text);
                console.log('응답 데이터:', data);
            } catch (e) {
                console.error('응답을 JSON으로 파싱할 수 없습니다:', e.message);
            }
        } catch (error) {
            console.error('추천 제품 저장 오류:', error.message);
        }
    }
    
    function resetUI() {
        console.log('UI를 초기화합니다...');
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
        console.error('카카오 로그인 버튼을 찾을 수 없습니다.');
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            window.location.href = 'http://localhost:8000/auth/google';
        });
    } else {
        console.error('구글 로그인 버튼을 찾을 수 없습니다.');
    }

    if (naverLoginBtn) {
        naverLoginBtn.addEventListener('click', () => {
            window.location.href = 'http://localhost:8000/auth/naver';
        });
    } else {
        console.error('네이버 로그인 버튼을 찾을 수 없습니다.');
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
