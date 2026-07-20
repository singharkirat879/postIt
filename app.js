const express = require('express')
require('dotenv').config();
const app = express()
const bodyParser = require('body-parser')
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth')
const sequelize = require('./util/db')
const Post = require('./models/post')
const User = require('./models/user')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs')

const PORT = process.env.PORT || 8000

const imagesDir = path.join(__dirname, 'images');

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next();
})

app.use(bodyParser.json())

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagesDir)
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use(multer({ storage: diskStorage, fileFilter: fileFilter }).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')))

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

sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch(err => console.log(err))
