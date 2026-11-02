// Valida req.body con Joi y devuelve middleware que rechaza o reemplaza el cuerpo con datos saneados.
export function validate(schema) {
  // Ejecuta la validación completa, elimina campos desconocidos y continúa solo con datos válidos.
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true })
    if (error) {
      return res.status(400).json({ message: 'Revisa los datos enviados', errors: error.details.map((item) => item.message) })
    }
    req.body = value
    return next()
  }
}
