import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getUserByEmailService } from '../service/userService.js';
import pool from './dbInit.js';
import envInit from './envInit.js';

envInit();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.HOSTED_SERVICE_URL}/user/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    
    let user = await getUserByEmailService(profile.emails[0].value);
    
    if (user) {
      if (!user.google_id) {
        const result = await pool.query(
          "UPDATE users SET google_id = $1, avatar = $2 WHERE id = $3 RETURNING *",
          [profile.id, profile.photos[0].value, user.id]
        );
        user = result.rows[0];
      }
      return done(null, user);
    } else {
      const googleUserData = {
        isNewUser: true,
        googleProfile: {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value
        }
      };
      return done(null, googleUserData);
    }
  } catch (error) {
    console.error('Google OAuth Error:', error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user);
  if (user.isNewUser) {
    done(null, { isNewUser: true, googleProfile: user.googleProfile });
  } else {
    done(null, user.id);
  }
});

passport.deserializeUser(async (data, done) => {
  try {
    console.log('Deserializing data:', data);
    if (typeof data === 'object' && data.isNewUser) {
      return done(null, data);
    }
    
    const result = await pool.query(
      "SELECT id, name, email, role, google_id, avatar FROM users WHERE id = $1",
      [data]
    );
    const user = result.rows[0];
    if (!user) {
      console.log('User not found for id:', data);
      done(null, false);
    } else {
      console.log('User found:', user);
      done(null, user);
    }
  } catch (error) {
    console.error('Deserialize error:', error);
    done(error, null);
  }
});

export default passport;