import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import User from '../models/User.js'

export const signupSchema = Joi.object({
  name: Joi.string().trim().min(1).max(80).required(),
  lastName: Joi.string().trim().min(1).max(80).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).max(128).required(),
  avatarUrl: Joi.string().uri().allow('').default(''),
})
export const signinSchema = Joi.object({ email: Joi.string().trim().email().required(), password: Joi.string().min(1).required() })

// Firma un JWT de siete días que identifica al usuario mediante su ID.
function createToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}
// Expone únicamente los campos de perfil que pueden enviarse al cliente.
function publicUser(user) {
  return { id: user.id, name: user.name, lastName: user.lastName, email: user.email, avatarUrl: user.avatarUrl }
}

// Comprueba que el correo no exista, cifra la contraseña, crea al usuario y devuelve su sesión.
export async function signup(req, res, next) {
  try {
    const email = req.body.email.toLowerCase()
    if (await User.exists({ email })) return res.status(409).json({ message: 'Ese correo ya está registrado' })
    const password = await bcrypt.hash(req.body.password, 12)
    const user = await User.create({ ...req.body, email, password })
    return res.status(201).json({ token: createToken(user), user: publicUser(user) })
  } catch (error) { return next(error) }
}

// Busca al usuario por correo, verifica la contraseña cifrada y emite su token de acceso.
export async function signin(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password')
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' })
    }
    return res.json({ token: createToken(user), user: publicUser(user) })
  } catch (error) { return next(error) }
}
