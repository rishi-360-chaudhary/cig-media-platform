const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const authRouter = require('./src/routes/auth.routes');
const eventRouter = require('./src/routes/event.routes');
const mediaRouter = require('./src/routes/media.routes');
const {initializeFaceCollection} = require('./src/utils/face.matcher');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}))

app.use(express.json())

app.use(express.urlencoded({extended: true}))

app.use(cookieParser())

app.use('/api/v1/auth', authRouter)

app.use('/api/v1/events', eventRouter)

app.use('/api/v1/media', mediaRouter);

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CIG Events API',
            version: '1.0.0',
            description: 'Core backend API for the Event & Media Management Platform',
        },
        servers: [
            {
                url: 'http://localhost:8000',
                description: 'Local Development Server'
            },
        ],
    },
    apis: ['./src/routes/*.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req, res) => {
    res.status(200).json({message : "Event & Media Platform API is running!"})
})

initializeFaceCollection();

module.exports = app;