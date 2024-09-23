document.addEventListener('DOMContentLoaded', () => {
    // 각 요소 가져오기
    const welcomeMessage = document.getElementById('welcome-message');
    const loginLink = document.querySelector('.human-icon-dropdown .human-icon-button[href="login.html"]');
    const signupLink = document.querySelector('.human-icon-dropdown .human-icon-button[href="signup.html"]');
    const mypageLink = document.querySelector('.human-icon-dropdown .human-icon-button[href="mypage.html"]');
    const logoutButton = document.getElementById('logout-btn');

    // 로그인 상태 확인 함수
    async function checkLoginStatus() {
        try {
            // 서버에서 소셜 로그인 상태 확인 (쿠키 포함)
            const response = await fetch('http://localhost:8000/auth/user', {
                method: 'GET',
                credentials: 'include' // 소셜 로그인 시 쿠키를 확인
            });

            if (response.ok) {
                const data = await response.json(); // 사용자 데이터 추출
                // 환영 메시지 표시
                welcomeMessage.textContent = `${data.username}님 환영합니다.`;
                welcomeMessage.classList.add('visible'); // 메시지 표시
                // 로그인 및 회원가입 링크 비활성화, 마이페이지 링크 활성화
                loginLink.classList.add('disabled');
                signupLink.classList.add('disabled');
                mypageLink.classList.remove('disabled');
            } else {
                // 로컬 로그인을 확인하기 위해 JWT 토큰을 로컬스토리지에서 가져옴
                const token = localStorage.getItem('accessToken');
                if (token) {
                    // 토큰을 사용하여 서버에서 로그인 상태 확인
                    const response = await fetch('http://localhost:8000/auth/user', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}` // JWT 토큰을 헤더에 포함
                        }
                    });

                    if (response.ok) {
                        const data = await response.json(); // 사용자 데이터 추출
                        // 환영 메시지 표시
                        welcomeMessage.textContent = `${data.username}님 환영합니다.`;
                        welcomeMessage.classList.add('visible'); // 메시지 표시
                        // 로그인 및 회원가입 링크 비활성화, 마이페이지 링크 활성화
                        loginLink.classList.add('disabled');
                        signupLink.classList.add('disabled');
                        mypageLink.classList.remove('disabled');
                    } else {
                        // 토큰이 유효하지 않은 경우 토큰 삭제 및 로그인 상태 초기화
                        localStorage.removeItem('accessToken');
                        resetLoginStatus(); // 로그인 상태 초기화 함수 호출
                    }
                } else {
                    // 토큰이 없는 경우 로그인 상태 초기화
                    resetLoginStatus();
                }
            }
        } catch (error) {
            // 로그인 상태 확인 중 에러가 발생한 경우
            console.error('로그인 상태 확인 실패:', error);
            resetLoginStatus(); // 로그인 상태 초기화 함수 호출
        }
    }

    // 로그인 상태를 초기화하는 함수
    function resetLoginStatus() {
        welcomeMessage.textContent = ''; // 환영 메시지 초기화
        welcomeMessage.classList.remove('visible'); // 환영 메시지 숨김
        // 로그인 및 회원가입 링크 활성화, 마이페이지 링크 비활성화
        loginLink.classList.remove('disabled');
        signupLink.classList.remove('disabled');
        mypageLink.classList.add('disabled');
        // 로컬스토리지에서 토큰 삭제
        localStorage.removeItem('accessToken');
    }

    // 로그아웃 버튼이 있을 경우 로그아웃 버튼 클릭 이벤트 등록
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            await fetch('http://localhost:8000/auth/logout', { method: 'POST' });
            resetLoginStatus(); // 로그인 상태 초기화 함수 호출
            window.location.href = 'login.html'; // 로그인 페이지로 이동
        });
    }

    // 페이지가 로드될 때 로그인 상태 확인
    checkLoginStatus(); // 로그인 상태 확인 함수 호출
});
