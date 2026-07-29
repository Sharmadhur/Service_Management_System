const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const ctrl = require('../controllers/customerController');

router.use(protect, authorize('customer'));

router.post('/request', ctrl.createRequest);
router.get('/myRequests', ctrl.getMyRequests);
router.put('/cancelRequest/:id', ctrl.cancelRequest);
router.post('/pay/:id', ctrl.payForRequest);
router.post('/review', ctrl.submitReview);
router.get('/myReviews', ctrl.getMyReviews);
router.get('/searchWorkers', ctrl.searchWorkers);
router.put('/favorite/:workerId', ctrl.toggleFavorite);
router.put('/profile', ctrl.updateProfile);

module.exports = router;
