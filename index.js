const express = require('express')
const dotenv = require('dotenv')
const app = express()
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')
const TelegramBot = require('node-telegram-bot-api')

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` })

const { addUser, getUser, getUsers, removeUser } = require('./src/users')

const token = process.env.VITE_TELEGRAM_BOT_TOKEN
const chatId = process.env.VITE_TELEGRAM_CHAT_ID

console.log('Telegram Bot Token provided:', !!token)
console.log('Telegram Chat ID:', chatId)

const bot = new TelegramBot(token, { polling: true })

bot.on('polling_error', (error) => {
  console.error('Telegram Polling Error:', error)
})

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []
console.log('Allowed Origins:', allowedOrigins)

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}))

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

bot.on('message', (msg) => {
  const messageText = msg.text
  if (messageText && String(msg.chat.id) === String(chatId)) {
    const chatMsg = {
      id: 'telegram',
      username: 'TelegramBot',
      message: messageText
    }
    io.in('main').emit('updateConversation', chatMsg)
  }
})

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    addUser(socket.id, username, room)
    socket.join(room)
    io.in(room).emit('updateUsers', getUsers())
  })

  socket.on('sendMessage', ({ username, message, room }) => {
    console.log({ username, message })
    const msg = {
      id: socket.id,
      username,
      message
    }
    io.in(room).emit('updateConversation', msg)

    if (username !== 'TelegramBot') {
      bot.sendMessage(chatId, `${username}: ${message}`)
    }
  })

  socket.on('disconnect', () => {
    removeUser(socket.id)
    io.emit('updateUsers', getUsers())
  })
})

const port = process.env.PORT || 3006

server.listen(port, () => {
  console.log(`Server running in port ${port}`)
})
