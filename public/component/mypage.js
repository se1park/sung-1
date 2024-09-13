document.addEventListener('DOMContentLoaded', function() {
    // 페이지가 로드된 후 로그인 상태를 확인하고 사용자 정보를 가져옴
    fetch('/api/check-login')
        .then(response => {
            if (!response.ok) {
                throw new Error('로그인 상태 응답 오류: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.loggedIn) { // 사용자가 로그인되어 있으면
                document.getElementById('user-email').textContent = data.user.email;
                document.getElementById('user-nickname').textContent = data.user.username;
                document.getElementById('user-password').textContent = '******'; // 비밀번호는 숨김 처리
            } else {
                alert('로그인이 필요합니다.');
                window.location.href = 'login.html';
            }
        })
        .catch(err => {
            console.error('로그인 상태 확인 실패:', err);
            alert('로그인 상태를 확인하는 데 문제가 발생했습니다.');
        });

    // 비밀번호 변경 버튼 클릭 시 비밀번호 변경 페이지로 이동
    document.getElementById('change-password-btn').addEventListener('click', function() {
        window.location.href = 'change-password.html';
    });

    // 사용자 정보 저장 폼의 제출을 처리
    document.getElementById('user-info-form').addEventListener('submit', function(event) {
        event.preventDefault(); // 폼 제출의 기본 동작을 방지

        // 사용자 입력값을 가져옴
        const email = document.getElementById('email').value;
        const nickname = document.getElementById('nickname').value;
        const password = document.getElementById('password').value;

        // 서버로 전송할 데이터 객체를 준비
        const userInfo = {
            email: email,
            nickname: nickname
        };

        // 비밀번호가 입력되었을 때만 추가
        if (password) {
            userInfo.password = password;
        }

        // 사용자 정보를 서버에 저장하는 요청을 보냄
        fetch('/api/save-user-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userInfo)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('사용자 정보 저장 오류: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('사용자 정보가 저장되었습니다.');
            } else {
                alert('사용자 정보 저장에 실패했습니다.');
            }
        })
        .catch(err => {
            console.error('사용자 정보 저장 실패:', err);
            alert('사용자 정보를 저장하는 데 문제가 발생했습니다.');
        });
    });

    // 닭가슴살 추천 목록을 가져오는 버튼 클릭 이벤트 처리
    document.getElementById('load-recommendations-btn').addEventListener('click', function() {
        fetch('/api/my-chicken-list')
            .then(response => {
                if (!response.ok) {
                    throw new Error('닭가슴살 추천 응답 오류: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (data.products && data.products.length > 0) {
                    const recommendationList = document.getElementById('recommendation-list');
                    recommendationList.innerHTML = ''; // 기존 목록 초기화

                    // 추천된 각 제품을 목록에 추가
                    data.products.forEach(product => {
                        const listItem = document.createElement('li');
                        listItem.innerHTML = `
                            <img src="${product.image_url || 'default-image.png'}" alt="${product.name}" width="100">
                            <h3>${product.name}</h3>
                            <p>맛: ${product.flavor}</p>
                            <p>가격: ${product.price.toLocaleString()}원</p>
                            <p>평점: ${product.rating}</p>
                        `;
                        recommendationList.appendChild(listItem);
                    });
                } else {
                    alert('추천받은 닭가슴살 제품이 없습니다.');
                }
            })
            .catch(err => {
                console.error('닭가슴살 추천 가져오기 실패:', err);
                alert('닭가슴살 추천을 가져오는 데 문제가 발생했습니다.');
            });
    });
});
