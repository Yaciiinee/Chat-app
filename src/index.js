const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require("./utils/messages")
const { addUser, getUser, removeUser, getUsersInRoom } = require("./utils/users")

const port = process.env.PORT || 3000
const publicPath = path.join(__dirname, '../public')
const app = express()
const server = http.createServer(app)

const io = socketio(server)
const User = require("./utils/users")

app.use(express.static(publicPath))

io.on('connection', (socket) => {

    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit("message", generateMessage(user.username, msg))
        callback()
    })

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit("message", generateMessage(user.username, "Welcome " + user.username + "!"))
        socket.broadcast.to(user.room).emit("message", generateMessage(username, user.username + " has joind the chat."))

        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on("sendLocation", ({ lat, lon }, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit("getLocation", generateLocationMessage(user.username, lat, lon))
        callback()
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit("message", generateMessage(".", user.username + " has left the room."))
        }
    })
})

server.listen(port, () => {
    console.log('الحمد لله')
    console.log("Server is running on port " + port)
})