document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');
    const welcomeMessage = document.getElementById('welcome-message'); // 요소 참조(추가)

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // 폼 필드에서 값을 가져옴
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // 비밀번호와 이메일이 빈 값인지 확인
        if (!email || !password) {
            alert('이메일과 비밀번호를 입력하세요.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include' // 세션 쿠키를 포함하도록 설정
            });

            const data = await response.json();

            if (response.ok) {
                // 로그인 성공 후 사용자 상태 확인 요청
                const userResponse = await fetch('http://localhost:8000/auth/user', {
                    credentials: 'include' // 세션 쿠키를 포함하도록 설정
                });
                const userData = await userResponse.json();
                if (userResponse.ok && userData.username) {
                    // 로그인 후 환영 메시지 업데이트
                    if (welcomeMessage) { // 요소가 존재하는지 확인
                        welcomeMessage.textContent = `${userData.username}님 환영합니다.`;
                        welcomeMessage.classList.add('visible');
                    } else {
                        console.error('welcome-message 요소를 찾을 수 없습니다.');
                    }
                }
                alert('로그인이 되었습니다.');
                window.location.href = 'http://localhost:8000/'; // 홈으로 리다이렉트
            } else {
                alert(data.message || '로그인에 실패했습니다. 다시 시도하세요.');
            }
        } catch (error) {
            console.error('로그인 오류:', error.message);
            console.error('로그인 오류 스택:', error.stack);
            alert('서버 오류가 발생했습니다. 나중에 다시 시도하세요.');
        }
    });

    // 팝업을 중앙에 열도록 수정
    const openCenteredPopup = (url, name) => {
        const width = 500;
        const height = 600;
        const left = (window.innerWidth - width) / 2 + window.screenX;
        const top = (window.innerHeight - height) / 2 + window.screenY;

        window.open(
            url,
            name,
            `width=${width},height=${height},top=${top},left=${left}`
        );
    };

    document.getElementById('kakao-login-btn').addEventListener('click', () => {
        openCenteredPopup('http://localhost:8000/auth/kakao', 'kakao-login');
    });
    document.getElementById('google-login-btn').addEventListener('click', () => {
        openCenteredPopup('http://localhost:8000/auth/google', 'google-login');
    });
    document.getElementById('naver-login-btn').addEventListener('click', () => {
        openCenteredPopup('http://localhost:8000/auth/naver', 'naver-login');
    });
});
