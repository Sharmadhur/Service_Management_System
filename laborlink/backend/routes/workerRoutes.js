const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const ctrl = require('../controllers/workerController');

router.use(protect, authorize('worker'));

router.get('/assignedJobs', ctrl.getAssignedJobs);
router.put('/acceptJob/:id', ctrl.acceptJob);
router.put('/rejectJob/:id', ctrl.rejectJob);
router.put('/updateStatus/:id', ctrl.updateStatus);
router.put('/availability', ctrl.setAvailability);
router.put('/profile', upload.single('profileImage'), ctrl.updateWorkerProfile);
router.get('/earnings', ctrl.getEarnings);
router.get('/reviews', ctrl.getReviews);

module.exports = router;
