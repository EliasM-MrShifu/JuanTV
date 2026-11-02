import mongoose from 'mongoose'
import Movie from '../models/Movie.js'

// Comprueba si una cadena representa un ObjectId válido de MongoDB.
function validMovieId(id) { return mongoose.isValidObjectId(id) }

// Carga la lista del usuario junto con los datos de categoría de cada película.
export async function getMyList(req, res, next) {
  try {
    const user = await req.user.populate({ path: 'myList', populate: { path: 'category' } })
    return res.json(user.myList)
  } catch (error) { return next(error) }
}
// Valida la película, evita duplicados y la agrega a la lista persistida del usuario.
export async function addToMyList(req, res, next) {
  try {
    if (!validMovieId(req.params.movieId)) return res.status(400).json({ message: 'ID de película inválido' })
    const movie = await Movie.findById(req.params.movieId)
    if (!movie) return res.status(404).json({ message: 'Película no encontrada' })
    if (!req.user.myList.some((id) => id.equals(movie._id))) req.user.myList.push(movie._id)
    await req.user.save()
    return res.status(200).json({ message: 'Película agregada a Mi Lista', movieId: movie.id })
  } catch (error) { return next(error) }
}
// Valida el ID, quita la película de la lista y persiste el usuario actualizado.
export async function removeFromMyList(req, res, next) {
  try {
    if (!validMovieId(req.params.movieId)) return res.status(400).json({ message: 'ID de película inválido' })
    req.user.myList = req.user.myList.filter((id) => !id.equals(req.params.movieId))
    await req.user.save()
    return res.json({ message: 'Película quitada de Mi Lista' })
  } catch (error) { return next(error) }
}
// Añade una reproducción al inicio del historial, evita duplicados y limita su tamaño a cien.
export async function addToHistory(req, res, next) {
  try {
    if (!validMovieId(req.params.movieId)) return res.status(400).json({ message: 'ID de película inválido' })
    const movie = await Movie.findById(req.params.movieId)
    if (!movie) return res.status(404).json({ message: 'Película no encontrada' })
    req.user.watchHistory = req.user.watchHistory.filter((entry) => !entry.movie.equals(movie._id))
    req.user.watchHistory.unshift({ movie: movie._id, watchedAt: new Date() })
    req.user.watchHistory = req.user.watchHistory.slice(0, 100)
    await req.user.save()
    return res.status(201).json({ message: 'Historial actualizado' })
  } catch (error) { return next(error) }
}
// Ordena el historial por fecha, completa cada película con su categoría y omite referencias borradas.
export async function getHistory(req, res, next) {
  try {
    const history = [...req.user.watchHistory].sort((a, b) => b.watchedAt - a.watchedAt)
    const populated = await Promise.all(history.map(async (entry) => ({
      watchedAt: entry.watchedAt,
      movie: await Movie.findById(entry.movie).populate('category'),
    })))
    return res.json(populated.filter((entry) => entry.movie))
  } catch (error) { return next(error) }
}
