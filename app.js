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
    params: async (req, file) => {
        console.log("Cloudinary config check:");
        console.log(cloudinary.config());

        return {
            folder: "postit",
            allowed_formats: ["jpg", "jpeg", "png", "webp"]
        };
    }
});



app.use((req, res, next) => {
    multer({ storage }).single("image")(req, res, err => {
        if (err) {
            console.error("MULTER ERROR:");
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
        next();
    });
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes)

app.use((err, req, res, next) => {
    console.error("========== FULL ERROR ==========");
    console.error(err);
    console.error(err.stack);
    next(err);
});

User.hasMany(Post)
Post.belongsTo(User)

sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch(err => console.log(err))
