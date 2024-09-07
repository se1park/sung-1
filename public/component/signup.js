document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');

    // 회원가입 폼 처리
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        // 폼 필드에서 값을 가져옴
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
    
        try {
            const response = await fetch('http://localhost:8000/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert('회원가입이 성공적으로 완료되었습니다.');
                window.location.href = 'http://localhost:8000/'; // 홈으로 리다이렉트
                // 성공 시 추가 작업 (예: 로그인 페이지로 리다이렉션)
            } else {
                alert(data.message || '회원가입에 실패했습니다. 다시 시도하세요.');
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            alert('서버 오류가 발생했습니다. 나중에 다시 시도하세요.');
        }
    });
})