document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');

    if (!loginForm) {
        console.error('로그인 폼을 찾을 수 없습니다. HTML에서 올바른 클래스 이름을 확인하세요.');
        return;
    }

    // 로그인 상태 확인
    const checkLoginStatus = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            let response;

            // 토큰이 존재할 경우, Authorization 헤더를 포함한 요청
            if (token) {
                response = await fetch('http://localhost:8000/auth/user', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // 토큰이 없을 경우, 쿠키 포함 요청
                response = await fetch('http://localhost:8000/auth/user', {
                    method: 'GET',
                    credentials: 'include' // 쿠키 포함
                });
            }

            // 응답 처리
            if (response.ok) {
                const data = await response.json();
                const welcomeMessageElement = document.getElementById('welcome-message');
                if (welcomeMessageElement) {
                    welcomeMessageElement.textContent = `환영합니다, ${data.username}!`;
                    welcomeMessageElement.classList.add('visible');
                }
            } else {
                localStorage.removeItem('accessToken');
                console.log('Access Token:', data.token); 
            }
        } catch (error) {
            console.error('로그인 상태 확인 실패:', error);
        }
    };

    // 로그인 폼 제출 처리
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('accessToken', data.token);
                alert('로그인이 성공적으로 되었습니다.');
                window.location.href = 'index.html'; // 메인 페이지로 이동
            } else {
                alert(data.message || '로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            alert('서버 오류가 발생했습니다. 나중에 다시 시도하세요.');
        }
    });

    checkLoginStatus();

    // 카카오, 구글, 네이버 로그인 버튼 설정
    document.getElementById('kakao-login-btn')?.addEventListener('click', () => {
        openCenteredPopup('http://localhost:8000/auth/kakao', 'kakao-login');
    });

    document.getElementById('google-login-btn')?.addEventListener('click', () => {
        openCenteredPopup('http://localhost:8000/auth/google', 'google-login');
    });

    document.getElementById('naver-login-btn')?.addEventListener('click', () => {
        openCenteredPopup('http://localhost:8000/auth/naver', 'naver-login');
    });
});
