const notFound = (req, res) => {
  if (req.accepts('html')) {
    res.status(404).send('<h1>route does not exist</h1>')
  } else if (req.accepts('json')) {
    res.status(404).json({ success: false, message: 'route does not exists' })
  } else {
    res.status(404).type('text').send('Route does not exist')
  }
}

export default notFound
