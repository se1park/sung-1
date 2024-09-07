const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const NaverStrategy = require('passport-naver').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// 로컬 전략 설정
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'No user with that email' });

      // 비밀번호 비교
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// 카카오 전략 설정
passport.use(new KakaoStrategy({
  clientID: process.env.KAKAO_CLIENT_ID,
  callbackURL: "http://localhost:8000/auth/kakao/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile._json.kakao_account && profile._json.kakao_account.email
      ? profile._json.kakao_account.email
      : `${profile.id}@kakao.com`;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: profile.displayName || "Kakao User",
        email,
        provider: 'kakao',
        password: null
      });
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

// 구글 전략 설정
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:8000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = await User.create({
        username: profile.displayName,
        email: profile.emails[0].value,
        provider: 'google',
        password: null
      });
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

// 네이버 전략 설정
passport.use(new NaverStrategy({
  clientID: process.env.NAVER_CLIENT_ID,
  clientSecret: process.env.NAVER_CLIENT_SECRET,
  callbackURL: "http://localhost:8000/auth/naver/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: profile.displayName || "Naver User",
        email,
        provider: 'naver',
        password: null
      });
    }
    done(null, user);
  } catch (err) {
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

module.exports = passport;
