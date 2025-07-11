const { db, admin } = require('../config/firebase');
const transporter = require('../config/nodemailer');
const { v4: uuidv4 } = require('uuid');

exports.addStudent = async (req, res) => {
    const { name, phone, email } = req.body;
    if (!name || !phone || !email) {
        return res.status(400).send({ error: 'Name, phone, and email are required.' });
    }

    try {
        const userRef = db.collection('users').doc(phone);
        const doc = await userRef.get();
        if (doc.exists) {
            return res.status(409).send({ error: 'A student with this phone number already exists.' });
        }

        const newStudent = {
            name,
            phone,
            email,
            role: 'student',
            lessons: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await userRef.set(newStudent);
        await transporter.sendMail({
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Classroom App!',
            text: `Hello ${name},\n\nAn instructor has added you to the Classroom App. You can log in using your email address to receive an access code.\n\nBest regards,\nThe Classroom App Team`
        });

        res.status(201).send({ message: 'Student added successfully.', student: newStudent });
    } catch (error) {
        res.status(500).send({ error: 'Failed to add student.' });
    }
};
exports.assignLesson = async (req, res) => {
    const { studentPhone, title, description } = req.body;
    if (!studentPhone || !title || !description) {
        return res.status(400).send({ error: 'Student phone, title, and description are required.' });
    }

    try {
        const studentRef = db.collection('users').doc(studentPhone);
        const newLesson = {
            id: uuidv4(),
            title,
            description,
            status: 'assigned',
            assignedAt: new Date().toISOString()
        };

        await studentRef.update({
            lessons: admin.firestore.FieldValue.arrayUnion(newLesson)
        });

        res.status(200).send({ message: 'Lesson assigned successfully.', lesson: newLesson });
    } catch (error) {
        res.status(500).send({ error: 'Failed to assign lesson.' });
    }
};
exports.getStudents = async (req, res) => {
    try {
        const snapshot = await db.collection('users').where('role', '==', 'student').get();
        const students = snapshot.docs.map(doc => {
            const { name, phone, email, role } = doc.data();
            return { name, phone, email, role };
        });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).send({ error: 'Failed to retrieve students.' });
    }
};
exports.getStudentByPhone = async (req, res) => {
    try {
        const { phone } = req.params;
        const studentRef = db.collection('users').doc(phone);
        const doc = await studentRef.get();

        if (!doc.exists || doc.data().role !== 'student') {
            return res.status(404).send({ error: 'Student not found.' });
        }
        res.status(200).json(doc.data());
    } catch (error) {
        res.status(500).send({ error: 'Failed to retrieve student details.' });
    }
};
exports.editStudent = async (req, res) => {
    try {
        const { phone } = req.params;
        const { name, email } = req.body;
        const studentRef = db.collection('users').doc(phone);
        await studentRef.update({ name, email });
        res.status(200).send({ message: 'Student updated successfully.' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to update student.' });
    }
};
exports.deleteStudent = async (req, res) => {
    try {
        const { phone } = req.params;
        await db.collection('users').doc(phone).delete();
        res.status(200).send({ message: 'Student deleted successfully.' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to delete student.' });
    }
};
exports.addInstructor = async (req, res) => {
    console.log('Received addInstructor request:', req.body);
    const { name, phone, email } = req.body;
    if (!name || !phone || !email) {
        console.log('Missing required fields');
        return res.status(400).send({ error: 'Name, phone, and email are required.' });
    }

    try {
        console.log('Checking if user exists with phone:', phone);
        const userRef = db.collection('users').doc(phone);
        const doc = await userRef.get();
        if (doc.exists) {
            console.log('User already exists');
            return res.status(409).send({ error: 'A user with this phone number already exists.' });
        }

        const newInstructor = {
            name,
            phone,
            email,
            role: 'instructor',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        console.log('Creating instructor in Firebase:', newInstructor);
        await userRef.set(newInstructor);
        console.log(' Instructor created successfully');
        
        res.status(201).send({ 
            message: 'Instructor registered successfully.', 
            instructor: newInstructor 
        });
    } catch (error) {
        console.error('Error registering instructor:', error);
        res.status(500).send({ error: 'Failed to register instructor.' });
    }
};
exports.saveMessage = async (req, res) => {
    const { from, to, message } = req.body;
    
    if (!from || !to || !message) {
        return res.status(400).send({ error: 'Missing required fields.' });
    }
    
    try {
        const messageData = {
            from,
            to,
            message,
            timestamp: new Date(),
            read: false
        };
        
        await db.collection('messages').add(messageData);
        res.status(200).json({ success: true, message: 'Message saved' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to save message.' });
    }
};

exports.getMessages = async (req, res) => {
    const { phone } = req.user;
    const { contactPhone } = req.query;
    
    console.log('Instructor getMessages called with:', { userPhone: phone, contactPhone });
    
    if (!contactPhone) {
        return res.status(400).send({ error: 'Contact phone is required.' });
    }
    
    try {
        const messagesRef = db.collection('messages');
        const query1 = messagesRef.where('from', '==', phone).where('to', '==', contactPhone);
        const query2 = messagesRef.where('from', '==', contactPhone).where('to', '==', phone);
        
        const [snapshot1, snapshot2] = await Promise.all([
            query1.get(),
            query2.get()
        ]);
            
        const messages = [];
        snapshot1.forEach(doc => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                from: data.from,
                to: data.to,
                message: data.message,
                timestamp: data.timestamp.toDate(),
                read: data.read
            });
        });
        
        snapshot2.forEach(doc => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                from: data.from,
                to: data.to,
                message: data.message,
                timestamp: data.timestamp.toDate(),
                read: data.read
            });
        });
        
        messages.sort((a, b) => a.timestamp - b.timestamp);
        
        console.log(`Found ${messages.length} messages between ${phone} and ${contactPhone}`);
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error retrieving messages:', error);
        res.status(500).send({ error: 'Failed to retrieve messages.' });
    }
};