require('dotenv').config()
const http = require('http');
const app = require('./app');
const {Server} = require('socket.io');
const connectDB = require('./src/config/db')

const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        methods: ["GET","POST"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on("joinUserRoom", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their personal notification room.`);
    })

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    })
})

app.set('socketio', io)

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed !!! ", err);
    });