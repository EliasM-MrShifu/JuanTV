import mongoose from 'mongoose'

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  coverImg: { type: String, required: true, trim: true },
  bannerImg: { type: String, required: true, trim: true },
  videoUrl: { type: String, required: true, trim: true },
  duration: { type: Number, required: true, min: 1 },
  releaseYear: { type: Number, required: true, min: 1888, max: 2100 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  cast: { type: [String], default: [] },
  director: { type: String, default: '' },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  ratingsCount: { type: Number, default: 0, min: 0 },
}, { timestamps: true })

movieSchema.index({ title: 'text', description: 'text' })
movieSchema.index({ category: 1, averageRating: -1 })

export default mongoose.model('Movie', movieSchema)
