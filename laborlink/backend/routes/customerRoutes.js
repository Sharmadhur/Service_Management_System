const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const ctrl = require('../controllers/customerController');

router.use(protect, authorize('customer'));

router.post('/request', ctrl.createRequest);
router.post('/selectWorker', ctrl.selectWorker);
router.get('/myRequests', ctrl.getMyRequests);
router.get('/myPayments', ctrl.getMyPayments);
router.put('/cancelRequest/:id', ctrl.cancelRequest);
router.post('/pay/:id', ctrl.payForRequest);
router.post('/verifyPayment', ctrl.verifyPayment);
router.post('/payment/webhook', ctrl.handlePaymentWebhook);
router.post('/review', ctrl.submitReview);
router.get('/myReviews', ctrl.getMyReviews);
router.get('/searchWorkers', ctrl.searchWorkers);
router.get('/searchNearbyWorkers', ctrl.searchNearbyWorkers);
router.get('/worker/:workerId', ctrl.getWorkerPublicProfile);
router.put('/favorite/:workerId', ctrl.toggleFavorite);
router.put('/profile', ctrl.updateProfile);

module.exports = router;
