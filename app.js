require('dotenv').config();

// ── Startup env-var sanity check (visible in Render logs) ──
const REQUIRED_ENV = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'JWT_SECRET',
    'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT'
];
REQUIRED_ENV.forEach(key => {
    if (!process.env[key]) {
        console.error(`❌ MISSING ENV VAR: ${key}`);
    } else {
        console.log(`✅ ${key} is set (length: ${process.env[key].length})`);
    }
});

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth')
const sequelize = require('./util/db')
const Post = require('./models/post')
const User = require('./models/user')
const multer = require('multer')
const cloudinary = require('./util/cloudinary');
const CloudinaryStorage = require('./util/cloudinary-storage');


const PORT = process.env.PORT || 8000

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next();
})

app.use(bodyParser.json())

const storage = new CloudinaryStorage({
    folder: 'postit',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
});


app.use((req, res, next) => {
    multer({ storage }).single("image")(req, res, err => {
        if (err) {
            console.error("========== MULTER ERROR ==========");
            console.error(err);
            console.error("Name:", err.name);
            console.error("Message:", err.message);
            console.error("Stack:", err.stack);
            return res.status(500).json(err);
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
