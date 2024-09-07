document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const loginLink = document.querySelector('.human-icon-dropdown .human-icon-button[href="login.html"]');
    const signupLink = document.querySelector('.human-icon-dropdown .human-icon-button[href="signup.html"]');
    const mypageLink = document.querySelector('.human-icon-dropdown .human-icon-button[href="mypage.html"]');

    // 로그인 상태를 확인하는 함수
    async function checkLoginStatus() {
        try {
            const response = await fetch('/auth/user', {
                credentials: 'include' // 세션 쿠키를 포함하도록 설정
            });
            const data = await response.json();

            if (response.ok && data.username) {
                // 로그인된 상태
                welcomeMessage.textContent = `${data.username}님 환영합니다.`;
                welcomeMessage.classList.add('visible');

                // 로그인 비활성화
                if (loginLink) loginLink.classList.add('disabled');
                // 회원가입 비활성화
                if (signupLink) signupLink.classList.add('disabled');
                // 마이페이지 링크 활성화
                if (mypageLink) mypageLink.classList.remove('disabled');
            } else {
                // 로그인되지 않은 상태
                welcomeMessage.textContent = '';
                welcomeMessage.classList.remove('visible');

                // 로그인, 회원가입 링크 활성화
                if (loginLink) loginLink.classList.remove('disabled');
                if (signupLink) signupLink.classList.remove('disabled');
                // 마이페이지 링크 비활성화
                if (mypageLink) mypageLink.classList.add('disabled');
            }
        } catch (error) {
            console.error('로그인 상태 확인 오류:', error);
        }
    }

    // 페이지가 로드될 때 로그인 상태 확인
    checkLoginStatus();
});
