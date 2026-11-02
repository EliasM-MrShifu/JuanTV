import Joi from 'joi'
import Category from '../models/Category.js'

export const categorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).required(),
})

// Devuelve las categorías ordenadas por nombre para poblar el catálogo y sus filtros.
export async function listCategories(req, res, next) {
  try { return res.json(await Category.find().sort({ name: 1 })) } catch (error) { return next(error) }
}
// Crea una categoría con los datos previamente validados y responde con el documento creado.
export async function createCategory(req, res, next) {
  try { return res.status(201).json(await Category.create(req.body)) } catch (error) { return next(error) }
}
// Actualiza una categoría por ID y devuelve 404 si no existe.
export async function updateCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' })
    return res.json(category)
  } catch (error) { return next(error) }
}
// Elimina una categoría por ID y confirma el resultado o informa que no fue encontrada.
export async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' })
    return res.status(200).json({ message: 'Categoría eliminada' })
  } catch (error) { return next(error) }
}
