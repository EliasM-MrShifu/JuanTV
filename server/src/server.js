import 'dotenv/config'
import app from './app.js'
import { connectDatabase } from './config/db.js'

const port = Number(process.env.PORT) || 4000

try {
  await connectDatabase()
  // Abre el puerto solo cuando la conexión con la base de datos ya fue establecida.
  app.listen(port, () => console.info(`JuanTV API disponible en http://localhost:${port}`))
} catch (error) {
  console.error(`No se pudo iniciar la API: ${error.message}`)
  process.exitCode = 1
}
