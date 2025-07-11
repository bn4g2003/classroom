const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { verifyToken } = require('../middleware/auth');
router.use(verifyToken);

router.get('/myLessons', studentController.getMyLessons);
router.post('/markLessonDone', studentController.markLessonDone);
router.put('/editProfile', studentController.editProfile);
router.get('/instructor', studentController.getInstructor);
router.post('/saveMessage', studentController.saveMessage);
router.get('/getMessages', studentController.getMessages);

module.exports = router;