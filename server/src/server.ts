import dotenv from 'dotenv'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { PORT } from './config/constants'
import { isDev } from './utils'
import {
  randomMixtapeRoute,
} from './routes'

dotenv.config()

const app = express()

const allowList = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://192.168.178.170:8080',
  'http://192.168.178.170:5000',
  'http://192.168.178.22:8080',
  'http://192.168.178.22:5000',
  'https://bigbuttonmix-client.vercel.app/'
]


// make a simple middleware to log requests
app.use((req,res,next) => {
  console.log(`Request coming from: ${req.get('host')}`)
  return next()
}  
)



app.use(
  cors({
    origin: allowList,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(randomMixtapeRoute)

if (isDev) {
  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
  })
}
