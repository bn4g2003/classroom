const { db } = require('../config/firebase');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const transporter = require('../config/nodemailer');
require('dotenv').config();

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
exports.createAccessCode = async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
        return res.status(400).send({ error: 'Phone number is required.' });
    }

    try {
        const userRef = db.collection('users').doc(phoneNumber);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).send({ error: 'User not found.' });
        }

        const accessCode = generateCode();
        const expires = Date.now() + 10 * 60 * 1000; // 10 phút

        await userRef.update({ accessCode, codeExpires: expires });

        await twilioClient.messages.create({
            body: `Your Classroom App access code is: ${accessCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        res.status(200).send({ success: true, message: 'Access code sent.' });
    } catch (error) {
        console.error("Error sending SMS:", error);
        res.status(500).send({ error: 'Failed to send access code.' });
    }
};
exports.validateAccessCode = async (req, res) => {
    const { phoneNumber, accessCode } = req.body;
    if (!phoneNumber || !accessCode) {
        return res.status(400).send({ error: 'Phone number and access code are required.' });
    }

    try {
        const userRef = db.collection('users').doc(phoneNumber);
        const userDoc = await userRef.get();

        if (!userDoc.exists || userDoc.data().accessCode !== accessCode || userDoc.data().codeExpires < Date.now()) {
            return res.status(401).send({ error: 'Invalid or expired access code.' });
        }

        await userRef.update({ accessCode: null, codeExpires: null });
        
        const userData = userDoc.data();
        const token = jwt.sign(
            { phone: userData.phone, role: userData.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).send({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                role: userData.role
            }
        });
    } catch (error) {
        res.status(500).send({ error: 'Server error during validation.' });
    }
};
exports.loginEmail = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).send({ error: 'Email is required.' });
    }

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).limit(1).get();

        if (snapshot.empty) {
            return res.status(404).send({ error: 'Student with this email not found.' });
        }

        const userDoc = snapshot.docs[0];
        const accessCode = generateCode();
        const expires = Date.now() + 10 * 60 * 1000; // 10 phút

        await userDoc.ref.update({ accessCode, codeExpires: expires });

        await transporter.sendMail({
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Login Code for Classroom App',
            text: `Your one-time login code is: ${accessCode}. It is valid for 10 minutes.`,
            html: `<b>Your one-time login code is: ${accessCode}</b>. It is valid for 10 minutes.`
        });
        res.status(200).send({ success: true, message: 'Access code sent to your email.' });
    } catch (error) {
        console.error("Error sending email code:", error);
        res.status(500).send({ error: 'Failed to send access code.' });
    }
};
exports.validateEmailCode = async (req, res) => {
    const { email, accessCode } = req.body;
     if (!email || !accessCode) {
        return res.status(400).send({ error: 'Email and access code are required.' });
    }
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).limit(1).get();
        if (snapshot.empty) {
            return res.status(404).send({ error: 'User not found.' });
        }
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        if (userData.accessCode !== accessCode || userData.codeExpires < Date.now()) {
            return res.status(401).send({ error: 'Invalid or expired access code.' });
        }   
        await userDoc.ref.update({ accessCode: null, codeExpires: null });

        const token = jwt.sign(
            { phone: userData.phone, role: userData.role, email: userData.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.status(200).send({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                role: userData.role
            }
        });
    } catch (error) {
        res.status(500).send({ error: 'Server error during validation.' });
    }
};