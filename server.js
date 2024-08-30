const path = require('path');
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb://localhost:27017/yourhr')


const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    qualifications: String,
    resume: String,
});

const User = mongoose.model('User', userSchema);

app.post('/signup', upload.single('resume'), async (req, res) => {
    let { name, email, phone, qualifications } = req.body;
    let resume = req.file ? req.file.filename : null;

    console.log('Data to be saved:', { name, email, phone, qualifications, resume });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).send('User already registered with this email.');
    }

    const user = new User({
        name,
        email,
        phone,
        qualifications,
        resume
    });

    try {
        await user.save();
        return res.redirect('/success.html')
        
    } catch (error) {
        res.status(500).send('Error registering user. Please try again.');
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
