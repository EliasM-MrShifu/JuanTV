import mongoose from 'mongoose'

const ratingSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  score: { type: Number, required: true, min: 1, max: 5 },
}, { _id: false })
const historySchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  watchedAt: { type: Date, default: Date.now },
}, { _id: false })

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  lastName: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, select: false },
  avatarUrl: { type: String, default: '' },
  myList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  ratings: { type: [ratingSchema], default: [] },
  watchHistory: { type: [historySchema], default: [] },
}, { timestamps: true })

export default mongoose.model('User', userSchema)
