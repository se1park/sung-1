document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const loginLink = document.querySelector('.human-icon-dropdown .human-icon-button[href="login.html"]');
    const signupLink = document.querySelector('.human-icon-dropdown .human-icon-button[href="signup.html"]');
    const mypageLink = document.querySelector('.human-icon-dropdown .human-icon-button[href="mypage.html"]');
    const logoutButton = document.getElementById('logout-btn'); // 로그아웃 버튼

    // 로그인 상태를 확인하는 함수
    async function checkLoginStatus() {
        const token = localStorage.getItem('accessToken'); // 토큰을 localStorage에서 가져옴

        if (!token) {
            console.log('로그인되지 않은 상태');
            welcomeMessage.textContent = '';
            welcomeMessage.classList.remove('visible');
            if (loginLink) loginLink.classList.remove('disabled');
            if (signupLink) signupLink.classList.remove('disabled');
            if (mypageLink) mypageLink.classList.add('disabled');
            return; // 토큰이 없으면 로그인되지 않은 상태
        }

        try {
            const response = await fetch('http://localhost:8000/auth/user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                if (data.username) {
                    welcomeMessage.textContent = `${data.username}님 환영합니다.`;
                    welcomeMessage.classList.add('visible');
                    if (loginLink) loginLink.classList.add('disabled');
                    if (signupLink) signupLink.classList.add('disabled');
                    if (mypageLink) mypageLink.classList.remove('disabled');
                } else {
                    localStorage.removeItem('accessToken'); // 유효하지 않은 경우 토큰 삭제
                    resetLoginStatus(); // 로그인 상태 초기화
                }
            } else {
                throw new Error('응답 실패');
            }
        } catch (error) {
            console.error('로그인 상태 확인 오류:', error);
            resetLoginStatus(); // 로그인 상태 초기화
        }
    }

    // 로그인 상태 초기화 함수
    function resetLoginStatus() {
        welcomeMessage.textContent = '';
        welcomeMessage.classList.remove('visible');
        if (loginLink) loginLink.classList.remove('disabled');
        if (signupLink) signupLink.classList.remove('disabled');
        if (mypageLink) mypageLink.classList.add('disabled');
        localStorage.removeItem('accessToken'); // 토큰 삭제
    }

    // 로그아웃 처리 함수
    function handleLogout() {
        console.log('로그아웃');
        resetLoginStatus();
        window.location.href = 'login.html'; // 로그아웃 후 로그인 페이지로 이동
    }

    // 로그아웃 버튼이 있으면 클릭 이벤트 추가
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    // 페이지가 로드될 때 로그인 상태 확인
    checkLoginStatus();
});
