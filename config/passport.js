const KakaoStrategy = require('passport-kakao').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const NaverStrategy = require('passport-naver').Strategy;
const User = require('../models/User');
// 로그인

module.exports = (passport) => {
  // Kakao 전략 설정
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_CLIENT_ID,
    callbackURL: "http://localhost:8000/auth/kakao/callback"  // 카카오 인증 후 콜백 URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // 이메일 정보가 없는 경우 처리
      const email = profile._json.kakao_account && profile._json.kakao_account.email
        ? profile._json.kakao_account.email
        : `${profile.id}@kakao.com`; // 이메일이 없을 경우 카카오 ID를 사용하여 임시 이메일 생성

      // 카카오 이메일을 이용해 유저를 찾거나 새로 생성
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          username: profile.displayName || "Kakao User",
          email,
          provider:'kakao',
          password: null  // 소셜 로그인의 경우 비밀번호를 저장하지 않음
        });
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  // Google 전략 설정
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/callback"  // 구글 인증 후 콜백 URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // 구글 이메일을 이용해 유저를 찾거나 새로 생성
      let user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = await User.create({
          username: profile.displayName,
          email: profile.emails[0].value,
          provider: 'google',
          password: null  // 소셜 로그인의 경우 비밀번호를 저장하지 않음
        });
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  passport.use(new NaverStrategy({
    clientID: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/naver/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // 프로필에서 이메일 정보 추출
      const email = profile.emails[0].value;

      // 이메일을 이용해 유처를 찾거나 새로 생성
      let user = await User.findOne({email});
      if(!user){
        user = await User.create({
          username: profile.displayName || "Naver User",
          email,
          password: null,
          provider: 'naver'
        });
      }
      done(null, user);
    } catch (err){
      done(err);
    }
  }));
  // 유저 직렬화 (세션에 저장)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // 유저 정보 복원 (세션에서 유저 정보 로드)
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
