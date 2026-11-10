import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import aipRouters from './routes/index.js'
import notFound from './middleware/not-found.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()
app.set('trust proxy', 1)

// Sites allowed to call the dashboard API (comma-separated in env)
const allowedOrigins = (process.env.CLIENT_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())

// Paths that customers' websites call from any domain (the widget).
// Your own allowed-domains check still protects the chat endpoint.
const openPaths = ['/widget', '/api/chat', '/api/feedback', '/api/health']

const strictCors = cors({ origin: allowedOrigins, credentials: true })
const openCors = cors()

app.use((req, res, next) => {
  const isOpen = openPaths.some((p) => req.path.startsWith(p))
  return (isOpen ? openCors : strictCors)(req, res, next)
})

app.use(express.json())

// Widget bundle: committed into server/public/widget so it deploys with the server
const widgetDir =
  process.env.WIDGET_DIR ?? path.resolve(process.cwd(), 'public/widget')
app.use('/widget', express.static(widgetDir))

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Working...' })
})

app.use('/api', aipRouters)
app.use(notFound)
app.use(errorHandler)

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`server is running on port ${PORT}`)
})