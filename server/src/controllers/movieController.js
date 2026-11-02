import Joi from 'joi'
import mongoose from 'mongoose'
import Category from '../models/Category.js'
import Movie from '../models/Movie.js'
import User from '../models/User.js'

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
export const movieSchema = Joi.object({
  title: Joi.string().trim().min(1).max(160).required(),
  description: Joi.string().trim().min(1).max(3000).required(),
  coverImg: Joi.string().uri().required(),
  bannerImg: Joi.string().uri().required(),
  videoUrl: Joi.string().uri().required(),
  duration: Joi.number().integer().min(1).required(),
  releaseYear: Joi.number().integer().min(1888).max(2100).required(),
  category: objectId.required(),
  cast: Joi.array().items(Joi.string().trim().max(100)).default([]),
  director: Joi.string().trim().max(120).allow('').default(''),
})
// Crea una variante del esquema de película donde cada campo es opcional para las actualizaciones parciales.
export const movieUpdateSchema = movieSchema.fork(Object.keys(movieSchema.describe().keys), (field) => field.optional())

// Filtra el catálogo por título y categoría, aplica límites de paginación y devuelve resultados y total.
export async function listMovies(req, res, next) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20))
    const query = {}
    if (req.query.title?.trim()) query.title = { $regex: req.query.title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
    if (req.query.category) {
      const category = mongoose.isValidObjectId(req.query.category)
        ? { _id: req.query.category }
        : { slug: req.query.category.toLowerCase() }
      const found = await Category.findOne(category).select('_id')
      if (!found) return res.json({ movies: [], total: 0, page, totalPages: 0 })
      query.category = found._id
    }
    const [movies, total] = await Promise.all([
      Movie.find(query).populate('category').sort({ releaseYear: -1, averageRating: -1 }).skip((page - 1) * limit).limit(limit),
      Movie.countDocuments(query),
    ])
    return res.json({ movies, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) { return next(error) }
}

// Selecciona la película mejor valorada y más reciente para el banner principal.
export async function getFeatured(req, res, next) {
  try {
    const movie = await Movie.findOne().populate('category').sort({ averageRating: -1, releaseYear: -1 })
    if (!movie) return res.status(404).json({ message: 'Todavía no hay películas cargadas' })
    return res.json(movie)
  } catch (error) { return next(error) }
}

// Valida el ID solicitado y devuelve el documento de película con su categoría.
export async function getMovie(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'ID de película inválido' })
    const movie = await Movie.findById(req.params.id).populate('category')
    if (!movie) return res.status(404).json({ message: 'Película no encontrada' })
    return res.json(movie)
  } catch (error) { return next(error) }
}

// Busca películas de la misma categoría, excluye la original y limita la lista a doce títulos.
export async function getSimilar(req, res, next) {
  try {
    const movie = await Movie.findById(req.params.id).select('category')
    if (!movie) return res.status(404).json({ message: 'Película no encontrada' })
    const movies = await Movie.find({ category: movie.category, _id: { $ne: movie._id } })
      .populate('category').sort({ averageRating: -1, releaseYear: -1 }).limit(12)
    return res.json(movies)
  } catch (error) { return next(error) }
}

// Verifica que la categoría exista y crea una película, incluyendo su categoría en la respuesta.
export async function createMovie(req, res, next) {
  try {
    if (!(await Category.exists({ _id: req.body.category }))) return res.status(400).json({ message: 'La categoría no existe' })
    const movie = await Movie.create(req.body)
    return res.status(201).json(await movie.populate('category'))
  } catch (error) { return next(error) }
}

// Actualiza los campos proporcionados y devuelve la película actualizada con su categoría.
export async function updateMovie(req, res, next) {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('category')
    if (!movie) return res.status(404).json({ message: 'Película no encontrada' })
    return res.json(movie)
  } catch (error) { return next(error) }
}

// Borra la película y elimina sus referencias de listas, calificaciones e historiales de usuarios.
export async function deleteMovie(req, res, next) {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id)
    if (!movie) return res.status(404).json({ message: 'Película no encontrada' })
    await User.updateMany({}, { $pull: { myList: movie._id, ratings: { movie: movie._id }, watchHistory: { movie: movie._id } } })
    return res.status(200).json({ message: 'Película eliminada' })
  } catch (error) { return next(error) }
}

// Guarda o reemplaza la puntuación del usuario y recalcula el promedio global de la película.
export async function rateMovie(req, res, next) {
  try {
    const movie = await Movie.findById(req.params.id)
    if (!movie) return res.status(404).json({ message: 'Película no encontrada' })
    const index = req.user.ratings.findIndex((rating) => rating.movie.equals(movie._id))
    if (index >= 0) req.user.ratings[index].score = req.body.score
    else req.user.ratings.push({ movie: movie._id, score: req.body.score })
    await req.user.save()
    const [ratingStats] = await User.aggregate([
      { $unwind: '$ratings' }, { $match: { 'ratings.movie': movie._id } },
      { $group: { _id: null, averageRating: { $avg: '$ratings.score' }, ratingsCount: { $sum: 1 } } },
    ])
    movie.averageRating = ratingStats?.averageRating ?? 0
    movie.ratingsCount = ratingStats?.ratingsCount ?? 0
    await movie.save()
    return res.json({ averageRating: movie.averageRating, ratingsCount: movie.ratingsCount, userScore: req.body.score })
  } catch (error) { return next(error) }
}

// Puntúa categorías a partir de calificaciones, lista e historial y recomienda títulos no vistos.
export async function getRecommendations(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('myList ratings watchHistory')
    const weightedCategories = new Map()
    const excluded = new Set()
    for (const rating of user.ratings) {
      excluded.add(String(rating.movie))
      if (rating.score >= 4) {
        const movie = await Movie.findById(rating.movie).select('category')
        if (movie) weightedCategories.set(String(movie.category), (weightedCategories.get(String(movie.category)) || 0) + 3 * rating.score)
      }
    }
    for (const movieId of user.myList) {
      excluded.add(String(movieId))
      const movie = await Movie.findById(movieId).select('category')
      if (movie) weightedCategories.set(String(movie.category), (weightedCategories.get(String(movie.category)) || 0) + 2)
    }
    for (const entry of user.watchHistory) {
      excluded.add(String(entry.movie))
      const movie = await Movie.findById(entry.movie).select('category')
      if (movie) weightedCategories.set(String(movie.category), (weightedCategories.get(String(movie.category)) || 0) + 1)
    }
    const categoryIds = [...weightedCategories.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id)
    if (!categoryIds.length) {
      const movies = await Movie.find().populate('category').sort({ averageRating: -1, releaseYear: -1 }).limit(16)
      return res.json(movies)
    }
    const movies = await Movie.find({ category: { $in: categoryIds }, _id: { $nin: [...excluded] } })
      .populate('category').sort({ averageRating: -1, releaseYear: -1 }).limit(16)
    return res.json(movies)
  } catch (error) { return next(error) }
}
