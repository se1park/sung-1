document.addEventListener('DOMContentLoaded', function() {
    // 페이지가 로드된 후 로그인 상태를 확인하고 사용자 정보를 가져옴
    fetch('/api/check-login')
        .then(response => {
            console.log('로그인 상태 응답:', response);
            // 응답이 성공적이지 않으면 로그인 상태가 아님으로 간주
            if (!response.ok) {
                console.error('로그인 상태 응답 오류:', response.statusText);
                return { loggedIn: false }; // 로그인 상태 데이터 구조 수정
            }
            // JSON 형식으로 응답 데이터 반환
            return response.json();
        })
        .then(data => {
            console.log('로그인 상태 데이터:', data);
            if (data.loggedIn) { // 사용자가 로그인되어 있으면
                // 사용자 이메일, 닉네임, 해시된 비밀번호를 페이지에 표시
                document.getElementById('user-email').textContent = data.user.email;
                document.getElementById('user-nickname').textContent = data.user.username;
                document.getElementById('user-password').textContent = '******'; // 해시된 비밀번호 표시
            } else {
                // 로그인이 필요한 경우 로그인 페이지로 리다이렉트
                alert('로그인이 필요합니다.');
                window.location.href = 'login.html';
            }
        })
        .catch(err => {
            console.error('사용자 정보 가져오기 실패:', err);
        });

    // 비밀번호 변경 버튼 클릭 시 비밀번호 변경 페이지로 이동
    document.getElementById('change-password-btn').addEventListener('click', function() {
        window.location.href = 'change-password.html'; // 비밀번호 변경 페이지로 이동
    });

    // 사용자 정보 저장 폼의 제출을 처리
    document.getElementById('user-info-form').addEventListener('submit', function(event) {
        event.preventDefault(); // 폼 제출의 기본 동작을 방지

        // 사용자 입력값을 가져옴
        const email = document.getElementById('email').value;
        const nickname = document.getElementById('nickname').value;
        const password = document.getElementById('password').value;

        console.log('사용자 입력값:', { email, nickname, password });

        // 서버로 전송할 데이터 객체를 준비
        const userInfo = {
            email: email,
            nickname: nickname,
            password: password
        };

        // 사용자 정보를 서버에 저장하는 요청을 보냄
        fetch('/api/save-user-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userInfo)
        })
        .then(response => {
            console.log('사용자 정보 저장 응답:', response);
            if (!response.ok) {
                console.error('사용자 정보 저장 응답 오류:', response.statusText);
                return { success: false };
            }
            return response.json();
        })
        .then(data => {
            console.log('사용자 정보 저장 데이터:', data);
            if (data.success) {
                // 저장 성공 시 사용자에게 알림
                alert('사용자 정보가 저장되었습니다.');
            } else {
                // 저장 실패 시 사용자에게 알림
                alert('사용자 정보 저장에 실패했습니다.');
            }
        })
        .catch(err => {
            console.error('사용자 정보 저장 실패:', err);
        });
    });

    // 닭가슴살 추천 목록을 가져오는 버튼 클릭 이벤트 처리
    document.getElementById('load-recommendations-btn').addEventListener('click', function() {
        fetch('/api/my-chicken-list')
            .then(response => {
                console.log('닭가슴살 추천 응답:', response);
                if (!response.ok) {
                    console.error('닭가슴살 추천 응답 오류:', response.statusText);
                    return { success: false, chickenList: [] };
                }
                return response.json();
            })
            .then(data => {
                console.log('닭가슴살 추천 데이터:', data);
                const chickenList = document.getElementById('my-chicken-list');
                if (data.success && data.chickenList && data.chickenList.length > 0) {
                    // 추천 목록을 HTML 리스트로 표시
                    chickenList.innerHTML = data.chickenList.map(chicken => `
                        <li>
                            <h3>${chicken.name}</h3>
                            <p>Flavor: ${chicken.flavor || '정보 없음'}</p>
                            <p>Price: ${chicken.price}</p>
                            <p>Rating: ${chicken.rating || '정보 없음'}</p>
                            <img src="${chicken.image}" alt="${chicken.name}" width="100">
                        </li>
                    `).join('');
                } else {
                    // 추천받은 닭가슴살이 없는 경우 메시지 표시
                    chickenList.innerHTML = '<p>추천받은 닭가슴살이 없습니다.</p>';
                }
            })
            .catch(err => {
                console.error('닭가슴살 목록 가져오기 실패:', err);
            });
    });
});
