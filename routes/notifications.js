const express = require('express');
const router = express.Router();
const OneSignalService = require('../services/oneSignalService');

// Send notification to user via external user ID
router.post('/send', async (req, res) => {
    try {
        const { externalUserId, title, message, data, platforms } = req.body;

        // Validation
        if (!externalUserId || !title || !message) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['externalUserId', 'title', 'message']
            });
        }

        const result = await OneSignalService.sendNotificationToUser({
            externalUserId,
            title,
            message,
            data: data || {},
            platforms: platforms || ['web', 'mobile'] // Send to both by default
        });

        res.json({
            success: true,
            data: result,
            message: 'Notification sent successfully'
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({
            error: 'Failed to send notification',
            details: error.message
        });
    }
});

// Send notification to multiple users
router.post('/send-bulk', async (req, res) => {
    try {
        const { externalUserIds, title, message, data, platforms } = req.body;

        if (!externalUserIds || !Array.isArray(externalUserIds) || !title || !message) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['externalUserIds (array)', 'title', 'message']
            });
        }

        const results = await Promise.allSettled(
            externalUserIds.map(userId =>
                OneSignalService.sendNotificationToUser({
                    externalUserId: userId,
                    title,
                    message,
                    data: data || {},
                    platforms: platforms || ['web', 'mobile']
                })
            )
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        res.json({
            success: true,
            summary: {
                total: externalUserIds.length,
                successful,
                failed
            },
            results: results.map((result, index) => ({
                externalUserId: externalUserIds[index],
                status: result.status,
                data: result.status === 'fulfilled' ? result.value : null,
                error: result.status === 'rejected' ? result.reason.message : null
            }))
        });
    } catch (error) {
        console.error('Error sending bulk notifications:', error);
        res.status(500).json({
            error: 'Failed to send bulk notifications',
            details: error.message
        });
    }
});

// Get user devices (for debugging)
router.get('/user/:externalUserId/devices', async (req, res) => {
    try {
        const { externalUserId } = req.params;
        const devices = await OneSignalService.getUserDevices(externalUserId);

        res.json({
            success: true,
            externalUserId,
            devices
        });
    } catch (error) {
        console.error('Error getting user devices:', error);
        res.status(500).json({
            error: 'Failed to get user devices',
            details: error.message
        });
    }
});

// Test notification endpoint
router.post('/test', async (req, res) => {
    try {
        const { externalUserId } = req.body;

        if (!externalUserId) {
            return res.status(400).json({
                error: 'Missing externalUserId'
            });
        }

        const result = await OneSignalService.sendNotificationToUser({
            externalUserId,
            title: '🧪 Test Notification',
            message: `Hello! This is a test notification sent at ${new Date().toLocaleTimeString()}`,
            data: {
                type: 'test',
                timestamp: Date.now()
            }
        });

        res.json({
            success: true,
            message: 'Test notification sent',
            data: result
        });
    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({
            error: 'Failed to send test notification',
            details: error.message
        });
    }
});

module.exports = router;
