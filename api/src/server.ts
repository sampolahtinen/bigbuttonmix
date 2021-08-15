import { PORT } from './constants';
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import {
  randomSoundcloudTrackRoute,
} from './routes'

dotenv.config()

const app = express()

const allowList = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://bigbutton-mix.herokuapp.com'
]


app.use(
  cors({
    origin: '*',
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(randomSoundcloudTrackRoute)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})