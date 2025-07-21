import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getUserByEmailService, createUserDetailsService } from '../service/userService.js';
import pool from './dbInit.js';
import envInit from './envInit.js';

envInit();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
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
      
      const result = await pool.query(
        "INSERT INTO users (name, email, google_id, avatar, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [profile.displayName, profile.emails[0].value, profile.id, profile.photos[0].value, true]
      );
      const newUser = result.rows[0];
      
      
      await createUserDetailsService({ user_id: newUser.id });
      
      return done(null, newUser);
    }
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, google_id, avatar FROM users WHERE id = $1",
      [id]
    );
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

export default passport;