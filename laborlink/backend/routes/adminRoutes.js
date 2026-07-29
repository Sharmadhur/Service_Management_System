const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const ctrl = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/users', ctrl.getUsers);
router.delete('/user/:id', ctrl.deleteUser);
router.put('/blockUser/:id', ctrl.toggleBlockUser);

router.get('/workers', ctrl.getWorkers);
router.put('/approveWorker/:id', ctrl.approveWorker);

router.get('/requests', ctrl.getRequests);
router.put('/assignWorker/:id', ctrl.assignWorker);

router.get('/categories', ctrl.getCategories);
router.post('/categories', ctrl.createCategory);
router.put('/categories/:id', ctrl.updateCategory);
router.delete('/categories/:id', ctrl.deleteCategory);

router.get('/reviews', ctrl.getReviews);
router.delete('/reviews/:id', ctrl.deleteReview);

router.get('/analytics', ctrl.getAnalytics);

module.exports = router;
