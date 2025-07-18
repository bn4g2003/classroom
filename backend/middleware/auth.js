const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

const verifyInstructor = (req, res, next) => {
    if (req.user.role !== 'instructor') {
        return res.status(403).json({ error: 'Instructor access required' });
    }
    next();
};

const verifyStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Student access required' });
    }
    next();
};

module.exports = { verifyToken, verifyInstructor, verifyStudent };
