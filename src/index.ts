import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import { buildSchema } from 'graphql'
import { graphqlHTTP } from 'express-graphql'
import authRoutes from './routes/auth.routes'
import spacesRoutes from './routes/spaces.routes'
import reservationsRoutes from './routes/reservations.routes'
import membershipsRoutes from './routes/memberships.routes'
import { rootValue } from './graphql/resolvers'

const typeDefs = fs.readFileSync(path.join(__dirname, 'graphql', 'schema.graphql'), 'utf8')
const schema = buildSchema(typeDefs)

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'SpaceHub API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/spaces', spacesRoutes)
app.use('/api/reservations', reservationsRoutes)
app.use('/api/memberships', membershipsRoutes)

app.use('/api/graphql', graphqlHTTP((req) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  const user = token ? jwt.decode(token) : null
  return {
    schema,
    rootValue,
    graphiql: { headerEditorEnabled: true },
    context: { user }
  }
}))

app.listen(PORT, () => {
  console.log(`SpaceHub API running on port ${PORT}`)
  console.log(`GraphQL playground: http://localhost:${PORT}/api/graphql`)
})

export default app
