# OneSignal Notification Service

Node.js microservice for sending push notifications via OneSignal REST API.

## Features

- Send notifications to users via external user ID
- Support for both web and mobile platforms
- Bulk notification sending
- Automatic device management
- RESTful API endpoints

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your OneSignal credentials:

   ```env
   ONESIGNAL_WEB_APP_ID=your_web_app_id
   ONESIGNAL_MOBILE_APP_ID=your_mobile_app_id
   ONESIGNAL_REST_API_KEY=your_rest_api_key
   PORT=3001
   ```

3. **Start the service:**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Health Check

```
GET /health
```

### Send Notification to User

```
POST /api/notifications/send
Content-Type: application/json

{
  "externalUserId": "user123",
  "title": "Hello!",
  "message": "This is a test notification",
  "data": {
    "url": "https://example.com",
    "customData": "value"
  },
  "platforms": ["web", "mobile"]
}
```

### Send Bulk Notifications

```
POST /api/notifications/send-bulk
Content-Type: application/json

{
  "externalUserIds": ["user1", "user2", "user3"],
  "title": "Bulk Notification",
  "message": "This goes to multiple users",
  "platforms": ["web", "mobile"]
}
```

### Test Notification

```
POST /api/notifications/test
Content-Type: application/json

{
  "externalUserId": "user123"
}
```

### Get User Devices (Debug)

```
GET /api/notifications/user/:externalUserId/devices
```

## Usage Examples

### Send a Simple Notification

```javascript
fetch("http://localhost:3001/api/notifications/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    externalUserId: "user123",
    title: "New Message",
    message: "You have a new message!",
    data: {
      type: "message",
      messageId: "456",
    },
  }),
});
```

### Send to Specific Platform

```javascript
// Only to web
{
  "externalUserId": "user123",
  "title": "Web Only",
  "message": "This goes only to web browsers",
  "platforms": ["web"]
}

// Only to mobile
{
  "externalUserId": "user123",
  "title": "Mobile Only",
  "message": "This goes only to mobile apps",
  "platforms": ["mobile"]
}
```

## External User ID Strategy

This service uses OneSignal's External User ID feature, which allows you to:

1. **Associate multiple devices with one user**
2. **Send notifications to all user's devices at once**
3. **Automatically handle device lifecycle management**
4. **Simplify your notification logic**

When a user logs in on any device (web or mobile), set their external user ID. OneSignal will automatically:

- Track all devices for that user
- Remove inactive devices
- Deliver notifications to active devices
- Handle cross-platform scenarios

## Error Handling

The service includes comprehensive error handling:

- Validation of required fields
- OneSignal API error responses
- Platform-specific failures
- Bulk operation summaries

## Development

- Uses `nodemon` for development auto-restart
- Includes request logging with `morgan`
- CORS enabled for cross-origin requests
- Helmet for security headers
