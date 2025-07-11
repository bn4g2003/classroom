const { db } = require('../config/firebase');
exports.getMyLessons = async (req, res) => {
    const { phone } = req.user;

    try {
        const userRef = db.collection('users').doc(phone);
        const doc = await userRef.get();
        if (!doc.exists) {
            return res.status(404).send({ error: 'User not found.' });
        }
        res.status(200).json(doc.data().lessons || []);
    } catch (error) {
        res.status(500).send({ error: 'Failed to retrieve lessons.' });
    }
};
exports.markLessonDone = async (req, res) => {
    const { phone } = req.user;
    const { lessonId } = req.body;
    
    if (!lessonId) {
        return res.status(400).send({ error: 'Lesson ID is required.' });
    }
    
    try {
        const userRef = db.collection('users').doc(phone);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).send({ error: 'User not found.' });
        }
        const lessons = doc.data().lessons || [];
        const lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId);

        if (lessonIndex === -1) {
            return res.status(404).send({ error: 'Lesson not found.' });
        }
        lessons[lessonIndex].status = 'done';
        await userRef.update({ lessons });
        res.status(200).send({ message: 'Lesson marked as done.', lessons });
    } catch (error) {
        res.status(500).send({ error: 'Failed to update lesson status.' });
    }
};
exports.editProfile = async (req, res) => {
    const { phone } = req.user;
    const { name, email } = req.body;
    
    try {
        const userRef = db.collection('users').doc(phone);
        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;

        if (Object.keys(updates).length === 0) {
            return res.status(400).send({ error: 'No fields to update.' });
        }
        await userRef.update(updates);
        res.status(200).send({ message: 'Profile updated successfully.' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to update profile.' });
    }
};
exports.getInstructor = async (req, res) => {
    try {
        const snapshot = await db.collection('users').where('role', '==', 'instructor').limit(1).get();
        
        if (snapshot.empty) {
            return res.status(404).send({ error: 'No instructor found.' });
        }

        const instructorDoc = snapshot.docs[0];
        const { name, phone, email, role } = instructorDoc.data();
        
        res.status(200).json({ name, phone, email, role });
    } catch (error) {
        res.status(500).send({ error: 'Failed to retrieve instructor.' });
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
    
    console.log('getMessages called with:', { userPhone: phone, contactPhone });
    
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