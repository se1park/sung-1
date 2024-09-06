document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const findUsernameForm = document.getElementById('find-username-form');
    const findPasswordForm = document.getElementById('find-password-form');
    
    // 초기화
    let questions = [];
    let currentQuestionIndex = 0;

    // 회원가입 폼 처리
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // 폼 필드에서 값을 가져옴
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:8000/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            const messageElement = document.getElementById('signup-message');

            if (response.ok) {
                messageElement.innerText = '회원가입이 성공적으로 완료되었습니다.';
                // 성공 시 추가 작업 (예: 로그인 페이지로 리다이렉션)
            } else {
                messageElement.innerText = data.message || '회원가입에 실패했습니다. 다시 시도하세요.';
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            alert('서버 오류가 발생했습니다. 나중에 다시 시도하세요.');
        }
    });
    // 아이디 찾기 폼 처리
    findUsernameForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('find-email').value;

        try {
            const response = await fetch('http://localhost:8000/auth/find-username', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            const messageElement = document.getElementById('find-username-message');
            if (response.ok) {
                messageElement.innerText = `아이디: ${data.username}`;
            } else {
                messageElement.innerText = data.message || '이메일이 존재하지 않습니다. 다시 시도하세요.';
            }
        } catch (error) {
            console.error('아이디 찾기 오류:', error);
            alert('서버 오류가 발생했습니다. 나중에 다시 시도하세요.');
        }
    });

    // 비밀번호 찾기 폼 처리
    findPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('find-username').value;
        const email = document.getElementById('find-password-email').value;

        try {
            const response = await fetch('http://localhost:8000/auth/reset-password-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email })
            });

            const data = await response.json();
            const messageElement = document.getElementById('find-password-message');
            if (response.ok) {
                messageElement.innerText = '비밀번호 재설정 링크가 이메일로 전송되었습니다.';
            } else {
                messageElement.innerText = data.message || '이메일 또는 사용자 이름이 일치하지 않습니다. 다시 시도하세요.';
            }
        } catch (error) {
            console.error('비밀번호 찾기 오류:', error);
            alert('서버 오류가 발생했습니다. 나중에 다시 시도하세요.');
        }
    });

    // 질문 목록을 가져오는 함수
    async function fetchQuestions() {
        try {
            const response = await fetch('http://localhost:8000/api/chicken-breast/questions');
            if (response.ok) {
                questions = await response.json();
                if (questions.length > 0) {
                    displayQuestion(questions[currentQuestionIndex]);
                    document.getElementById('question-container').style.display = 'block';
                } else {
                    document.getElementById('question-container').innerText = '질문이 없습니다.';
                }
            } else {
                console.error('질문 목록을 가져오는 데 실패했습니다:', response.statusText);
            }
        } catch (error) {
            console.error('질문 목록을 가져오는 데 실패했습니다:', error);
        }
    }

    function displayQuestion(question) {
        const questionElement = document.getElementById('question');
        const answerInput = document.getElementById('answer');
        const yesBtn = document.getElementById('yes-btn');
        const noBtn = document.getElementById('no-btn');
        const submitBtn = document.getElementById('submit-answer');
        const answerContainer = document.getElementById('answer-container');

        questionElement.innerText = question;
        answerInput.style.display = 'none';
        yesBtn.style.display = 'none';
        noBtn.style.display = 'none';
        submitBtn.style.display = 'none';
        answerContainer.style.display = 'flex';

        if (currentQuestionIndex === 0) {
            yesBtn.style.display = 'inline-block';
            noBtn.style.display = 'inline-block';
        } else {
            answerInput.style.display = 'inline-block';
            submitBtn.style.display = 'inline-block';
        }
    }

    async function processAnswer(answer) {
        try {
            const response = await fetch('http://localhost:8000/api/chicken-breast/question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer })
            });
            const data = await response.json();

            if (response.ok) {
                currentQuestionIndex++;
                if (currentQuestionIndex < questions.length) {
                    displayQuestion(questions[currentQuestionIndex]);
                } else {
                    displayRecommendations(data.products);
                    resetUI();
                }
            } else {
                console.error('질문 처리 오류:', data.message);
                alert('질문 처리 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('질문 처리 오류:', error);
            alert('서버 오류가 발생했습니다. 나중에 다시 시도하세요.');
        }
    }

    function displayRecommendations(products) {
        const resultsElement = document.getElementById('recommendation-results');
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
        } else {
            resultsElement.innerText = '추천할 제품이 없습니다.';
        }
    }

    function resetUI() {
        document.getElementById('answer-container').style.display = 'none';
        document.getElementById('question-container').style.display = 'none';
    }

    // 초기화 및 질문 가져오기
    fetchQuestions();

    // 소셜 로그인 버튼 이벤트 추가
    document.getElementById('kakao-login-btn').addEventListener('click', () => {
        window.location.href = 'http://localhost:8000/auth/kakao';
    });

    document.getElementById('google-login-btn').addEventListener('click', () => {
        window.location.href = 'http://localhost:8000/auth/google';
    });

    document.getElementById('naver-login-btn').addEventListener('click', () => {
        window.location.href = 'http://localhost:8000/auth/naver';
    });

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
