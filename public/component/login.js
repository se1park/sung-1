document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');

    if (!loginForm) {
        console.error('로그인 폼을 찾을 수 없습니다. HTML에서 올바른 클래스 이름을 확인하세요.');
        return;
    }

    // 페이지 로드 시 로그인 상태 확인
    const checkLoginStatus = async () => {
        const token = localStorage.getItem('accessToken');

        if (token) {
            try {
                console.log('토큰:', token);
                const response = await fetch('http://localhost:8000/auth/user', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    console.error('응답 상태 코드:', response.status);
                    throw new Error('응답 실패');
                }

                const data = await response.json();
                console.log('사용자 데이터:', data);

                const welcomeMessageElement = document.getElementById('welcome-message');
                if (welcomeMessageElement) {
                    welcomeMessageElement.textContent = `환영합니다, ${data.username}!`;
                    welcomeMessageElement.classList.add('visible');
                } else {
                    console.error('환영 메시지 요소가 없습니다.');
                }
            } catch (error) {
                console.error('사용자 정보 로드 실패:', error.message);
            }
        } else {
            console.log('토큰이 없습니다.');
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
                // 로그인 성공 -> JWT를 localStorage에 저장
                localStorage.setItem('accessToken', data.token);
                alert('로그인이 성공적으로 되었습니다.');
                window.location.href = 'index.html';
            } else {
                alert(data.message || '로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            alert('서버 오류가 발생했습니다. 나중에 다시 시도하세요.');
        }
    });
    
    // 로그인 상태 확인 및 환영 메시지 표시
    checkLoginStatus();

    // 카카오 
    document.getElementById('kakao-login-btn')?.addEventListener('click', () => {
        openCenteredPopup('http://localhost:8000/auth/kakao', 'kakao-login');
    });

    // 구글
    document.getElementById('google-login-btn')?.addEventListener('click', () => {
        openCenteredPopup('http://localhost:8000/auth/google', 'google-login');
    });

    // 네이버
    document.getElementById('naver-login-btn')?.addEventListener('click', () => {
        openCenteredPopup('http://localhost:8000/auth/naver', 'naver-login');
    });
});
