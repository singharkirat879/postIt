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
const cloudinary = require('./util/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const PORT = process.env.PORT || 8000


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next();
})

app.use(bodyParser.json())

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "postit",
        allowed_formats: ["jpg", "jpeg", "png"]
    }
});

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

app.use(multer({ storage, fileFilter }).single('image'))

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
