import mongoose from 'mongoose'

// Normaliza y valida la URI de MongoDB antes de abrir la conexión con un tiempo límite.
export async function connectDatabase() {
  const uri = process.env.URI_LINK?.trim()
    .replace(/[?&]+$/, '')
    .replace(/([?&])=majority(?=&|$)/, '$1w=majority')
  if (!uri) throw new Error('Falta URI_LINK en server/.env. Configura la conexión a MongoDB Atlas.')
  if (/<[^>]+>/.test(uri)) throw new Error('URI_LINK todavía contiene marcadores como <cluster>, <user> o <password>. Pega la URI real de Atlas en server/.env.')
  if (!/^mongodb(?:\+srv)?:\/\//.test(uri)) throw new Error('URI_LINK debe comenzar con mongodb:// o mongodb+srv://.')
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  console.info('MongoDB conectado')
}
