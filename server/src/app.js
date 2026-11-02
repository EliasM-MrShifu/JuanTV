import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import passport from './middlewares/passport.js'
import authRoutes from './routes/authRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import movieRoutes from './routes/movieRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { errorHandler, notFound } from './middlewares/errorHandler.js'

const app = express()
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173'
app.use(cors({ origin: allowedOrigin, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

// Responde al chequeo de disponibilidad sin consultar la base de datos.
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'JuanTV API' }))
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/movies', movieRoutes)
app.use('/api/users', userRoutes)
app.use(notFound)
app.use(errorHandler)

export default app
