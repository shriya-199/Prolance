// IMPORTANT: Load environment variables FIRST before anything else
require('dotenv').config();

const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const AuthRouter = require('./Routes/AuthRouter')
const UserRouter = require('./Routes/UserRouter')
const ProjectRouter = require('./Routes/ProjectRouter')
const SettingsRouter = require('./Routes/SettingsRouter')
const UploadRouter = require('./Routes/UploadRouter')
const CaptchaRouter = require('./Routes/CaptchaRouter')
require('./Models/db')
const PORT = process.env.PORT || 8080;

app.get('/ping', (req, res) => {
    res.send('PONG');
})

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

app.use('/auth', AuthRouter)
app.use('/api/users', UserRouter)
app.use('/api/projects', ProjectRouter)
app.use('/api/settings', SettingsRouter)
app.use('/api/upload', UploadRouter)
app.use('/api/captcha', CaptchaRouter)

// Start server for Render/Railway/Heroku (or local dev)
// Don't start server on Vercel (serverless)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

// Export for Vercel serverless
module.exports = app;