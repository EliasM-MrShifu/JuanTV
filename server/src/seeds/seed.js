import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDatabase } from '../config/db.js'
import Category from '../models/Category.js'
import Movie from '../models/Movie.js'
import { catalog } from './catalog.js'

const categoryDefinitions = [
  { name: 'Acción', slug: 'accion' },
  { name: 'Comedia', slug: 'comedia' },
  { name: 'Drama', slug: 'drama' },
  { name: 'Terror', slug: 'terror' },
  { name: 'Ciencia ficción', slug: 'ciencia-ficcion' },
  { name: 'Documentales', slug: 'documentales' },
  { name: 'Animación', slug: 'animacion' },
  { name: 'Romance', slug: 'romance' },
]

try {
  await connectDatabase()
  await Promise.all([Category.deleteMany({}), Movie.deleteMany({})])
  const categories = await Category.insertMany(categoryDefinitions)
  // Indexa IDs de categoría por slug para resolver las referencias del catálogo de demostración.
  const categoryIds = new Map(categories.map((category) => [category.slug, category._id]))
  // Adapta cada registro del catálogo al formato de MongoDB y enlaza sus imágenes, tráiler y categoría.
  const documents = catalog.map((film) => ({
    title: film.title,
    description: film.description,
    coverImg: film.poster,
    bannerImg: `https://i.ytimg.com/vi/${film.trailerId}/maxresdefault.jpg`,
    videoUrl: `https://www.youtube.com/embed/${film.trailerId}`,
    duration: film.duration,
    releaseYear: film.releaseYear,
    category: categoryIds.get(film.category),
    cast: film.cast,
    director: film.director,
    averageRating: 0,
    ratingsCount: 0,
  }))
  await Movie.insertMany(documents)
  console.info(`Seed completado: ${categories.length} categorías y ${documents.length} películas reales con posters y trailers asociados`)
} catch (error) {
  console.error(`Falló el seed: ${error.message}`)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
