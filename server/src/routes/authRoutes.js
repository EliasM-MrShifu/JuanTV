import { Router } from 'express'
import { signin, signinSchema, signup, signupSchema } from '../controllers/authController.js'
import { validate } from '../middlewares/validate.js'

const router = Router()
router.post('/signup', validate(signupSchema), signup)
router.post('/signin', validate(signinSchema), signin)
export default router
