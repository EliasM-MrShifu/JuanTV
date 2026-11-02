import { Router } from 'express'
import { addToHistory, addToMyList, getHistory, getMyList, removeFromMyList } from '../controllers/userController.js'
import { requireAuth } from '../middlewares/passport.js'

const router = Router()
router.use(requireAuth)
router.get('/mylist', getMyList)
router.post('/mylist/:movieId', addToMyList)
router.delete('/mylist/:movieId', removeFromMyList)
router.post('/history/:movieId', addToHistory)
router.get('/history', getHistory)
export default router
