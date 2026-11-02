import { Router } from 'express'
import { createCategory, categorySchema, deleteCategory, listCategories, updateCategory } from '../controllers/categoryController.js'
import { requireAuth } from '../middlewares/passport.js'
import { validate } from '../middlewares/validate.js'

const router = Router()
router.get('/', listCategories)
router.post('/', requireAuth, validate(categorySchema), createCategory)
router.put('/:id', requireAuth, validate(categorySchema), updateCategory)
router.delete('/:id', requireAuth, deleteCategory)
export default router
