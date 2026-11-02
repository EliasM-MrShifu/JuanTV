// Responde con un error 404 que incluye el método HTTP y la ruta que no se encontró.
export function notFound(req, res) {
  return res.status(404).json({ message: `No existe la ruta ${req.method} ${req.originalUrl}` })
}

// Convierte errores de ruta en respuestas HTTP consistentes y registra los errores internos.
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)
  const status = error.status || (error.name === 'CastError' ? 400 : 500)
  const message = status === 500 ? 'Ocurrió un error interno' : error.message
  if (status === 500) console.error(error)
  return res.status(status).json({ message })
}
