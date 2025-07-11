const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructor.controller');
const { verifyToken, verifyInstructor } = require('../middleware/auth');

router.post('/addInstructor', instructorController.addInstructor);

router.use(verifyToken);
router.use(verifyInstructor);

router.post('/addStudent', instructorController.addStudent);
router.post('/assignLesson', instructorController.assignLesson);
router.get('/students', instructorController.getStudents);
router.get('/student/:phone', instructorController.getStudentByPhone);
router.put('/editStudent/:phone', instructorController.editStudent);
router.delete('/student/:phone', instructorController.deleteStudent);
router.post('/saveMessage', instructorController.saveMessage);
router.get('/getMessages', instructorController.getMessages);

module.exports = router;