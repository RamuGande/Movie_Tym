const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('../Middleware/Database');
const app = express();
const PORT = process.env.PORT || 5000;
const Auth = require('../Middleware/Authentication')
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const Seats = require("./Seats")
app.use("/seats", Seats)

const vendorRouter = require('./Vendors');
app.use('/Vendors', vendorRouter);

const Theater = require("./Theater_Generation");
const { Navigate } = require('react-router-dom');

app.use("/Theater_generation", Theater)

const execute_query = async(query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

app.post('/signup_user', async (req, res) => {
    const { username, password, email, phone } = req.body;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!passwordRegex.test(password)) {
        return res.status(400).send("Password must be at least 8 characters long, include one uppercase letter, one number, and one special character.");
    }

    const existingUser = await execute_query("SELECT username FROM user WHERE username = ?", [username]);
    if (existingUser.length > 0) return res.status(409).send("Username already exists");

    const existingEmail = await execute_query("SELECT email FROM user WHERE email = ?", [email]);
    if (existingEmail.length > 0) return res.status(409).send("Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = "INSERT INTO user (username, password, user_type, email, phone) VALUES (?, ?, ?, ?, ?)";
    await execute_query(insertQuery, [username, hashedPassword, "Customer", email, phone]);
    res.status(201).send("User registered successfully");
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT username, password, user_type FROM user WHERE username = ?";

    try {
        const results = await execute_query(query, [username]);
        if (results.length === 0) return res.status(401).send("Check your username or password");

        const hashedPassword = results[0].password;
        const role = results[0].user_type;
        const isMatch = await bcrypt.compare(password, hashedPassword);

        if (!isMatch) return res.status(401).send("Check your username or password");
        const token = Auth.createToken(username, password, role);
        res.status(200).send(token);

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('send-otp/sms',(req,res)=>{
    const {phone}=req.body;
    const otp= Math.floor(Math.random()*900)+1000;
    twilioClient.messages.create({
        'body': `Your OTP is ${otp}`,
        'from': process.env.TWILIO_PHONE_NUMBER,
        to: phone,
    })
    .then(message => {
        res.json({ success: true, message: 'OTP sent via SMS', otp });
    })
    .catch(err => {
        res.status(500).json({ success: false, message: 'Failed to send OTP', error: err });
    });
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Send OTP via Email
app.post('/send-otp/email', (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(Math.random()*900)+1000;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Failed to send OTP', error });
        }
        res.json({ success: true, message: 'OTP sent via Email', otp });
    });
});


app.post('/forgot-password', async (req, res) => {    
    const { email, phone } = req.body;    
    try{
        const query = 'select * from user where email = ? or phone = ?';
        const result = await execute_query(query, [email, phone]);
        if(result.length>0){
            return res.status(200).send("user exists");
        }
    }
    catch(err){
        console.error(err);
    }
        
}); 

app.post('/update-password', async (req, res) => {    
    const { password, email, phone } = req.body;    
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;    
    if (!passwordRegex.test(password)) return res.status(400).send("Password must be at least 8 characters long, include one uppercase letter, one number, and one special character.");    
    const updateQuery = "UPDATE user SET password = ? WHERE email = ? OR phone = ?";    
    const hashedPassword = await bcrypt.hash(password, 10);    
    await execute_query(updateQuery, [hashedPassword, email, phone]);    
    res.status(200).send("Password updated successfully!");    
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
