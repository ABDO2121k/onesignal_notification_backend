const axios = require('axios');

class OneSignalService {
    constructor() {
        this.apiUrl = 'https://onesignal.com/api/v1';
        this.restApiKey = process.env.ONESIGNAL_REST_API_KEY;
        this.webAppId = process.env.ONESIGNAL_WEB_APP_ID;
        this.mobileAppId = process.env.ONESIGNAL_MOBILE_APP_ID;

        if (!this.restApiKey || !this.webAppId || !this.mobileAppId) {
            console.warn('OneSignal credentials not configured properly');
        }
    }

    async sendNotificationToUser({ externalUserId, title, message, data = {} }) {
        const results = [];

        // Send to web
        try {
            const webResult = await this.sendWebNotification({
                externalUserId,
                title,
                message,
                data
            });
            results.push({ platform: 'web', success: true, data: webResult });
        } catch (error) {
            console.error('Web notification failed:', error.message);
            results.push({ platform: 'web', success: false, error: error.message });
        }

        // Send to mobile
        try {
            const mobileResult = await this.sendMobileNotification({
                externalUserId,
                title,
                message,
                data
            });
            results.push({ platform: 'mobile', success: true, data: mobileResult });
        } catch (error) {
            console.error('Mobile notification failed:', error.message);
            results.push({ platform: 'mobile', success: false, error: error.message });
        }

        return {
            externalUserId,
            results,
            summary: {
                total: results.length,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length
            }
        };
    }

    async sendWebNotification({ externalUserId, title, message, data }) {
        const payload = {
            app_id: this.webAppId,
            include_external_user_ids: [externalUserId],
            headings: { en: title },
            contents: { en: message },
            data: { ...data, platform: 'web' }
        };
        return this.makeRequest('/notifications', 'POST', payload);
    }

    async sendMobileNotification({ externalUserId, title, message, data }) {
        const payload = {
            app_id: this.mobileAppId,
            include_external_user_ids: [externalUserId],
            headings: { en: title },
            contents: { en: message },
            data: { ...data, platform: 'mobile' }
        };
        return this.makeRequest('/notifications', 'POST', payload);
    }

    async makeRequest(endpoint, method = 'GET', data = null) {
        try {
            const config = {
                method,
                url: `${this.apiUrl}${endpoint}`,
                headers: {
                    'Authorization': `Basic ${this.restApiKey}`,
                    'Content-Type': 'application/json'
                }
            };

            if (data) {
                config.data = data;
            }

            const response = await axios(config);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(`OneSignal API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(`Request Error: ${error.message}`);
        }
    }

    isConfigured() {
        return !!(this.restApiKey && this.webAppId && this.mobileAppId);
    }
}

module.exports = new OneSignalService();
