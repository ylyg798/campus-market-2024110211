import { createApp } from 'json-server/lib/app.js'
import { fileURLToPath, URL } from 'node:url'

const app = createApp(new URL('./db.json', import.meta.url))

app.use('/api', app.router)

app.listen(3000, () => {
  console.log('JSON Server is running on http://localhost:3000')
})
