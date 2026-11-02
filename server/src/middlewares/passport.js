import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import User from '../models/User.js'

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  // Busca al usuario indicado por el token y entrega el resultado a Passport o propaga el error.
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub)
    return done(null, user || false)
  } catch (error) {
    return done(error, false)
  }
}))

export const requireAuth = passport.authenticate('jwt', { session: false })
export default passport
