require('dotenv').config();
const express = require('express')
const cors = require('cors');
const app = express()
const bodyParser = require('body-parser')
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth')
const sequelize = require('./util/db')
const Post = require('./models/post')
const User = require('./models/user')
const multer = require('multer')
const cloudinary = require('./util/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const PORT = process.env.PORT || 8000


const ALLOWED_ORIGINS = (
    process.env.CLIENT_ORIGINS ||
    "https://post-it-beta.vercel.app,http://localhost:8000")
    .split(',').map(origin => origin.trim())

app.use(cors({
    origin: (origin, callback) => {

        if (!origin) {
            return callback(null, true);
        }
        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(bodyParser.json())

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "postit",
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
    }
});


app.use(multer({ storage }).single('image'))

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes)

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500
    const message = error.message
    const data = error.data
    res.status(status).json({
        message: message,
        data: data
    })
})
User.hasMany(Post)
Post.belongsTo(User)

sequelize.sync({ force: true })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch(err => console.log(err))
