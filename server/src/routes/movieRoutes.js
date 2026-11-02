import { Router } from 'express'
import Joi from 'joi'
import { createMovie, deleteMovie, getFeatured, getMovie, getRecommendations, getSimilar, listMovies, movieSchema, movieUpdateSchema, rateMovie, updateMovie } from '../controllers/movieController.js'
import { requireAuth } from '../middlewares/passport.js'
import { validate } from '../middlewares/validate.js'

const router = Router()
router.get('/', listMovies)
router.get('/featured', getFeatured)
router.get('/recommendations', requireAuth, getRecommendations)
router.get('/:id/similar', getSimilar)
router.get('/:id', getMovie)
router.post('/', requireAuth, validate(movieSchema), createMovie)
router.put('/:id', requireAuth, validate(movieUpdateSchema), updateMovie)
router.delete('/:id', requireAuth, deleteMovie)
router.post('/:id/ratings', requireAuth, validate(Joi.object({ score: Joi.number().integer().min(1).max(5).required() })), rateMovie)
export default router
