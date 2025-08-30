# CORS Configuration Guide

## Overview
This server is configured with CORS (Cross-Origin Resource Sharing) to allow requests from specific frontend domains.

## Current Allowed Origins
- `https://ai-finance-website-sage.vercel.app` (Original production domain)
- `https://ai-finance-website-git-main-satyams-projects-f93b7ccf.vercel.app` (New production domain)
- `http://localhost:3000` (Local development)

## How to Add New Origins

### Method 1: Update the code directly
Edit `src/server.js` and add new origins to the `allowedOrigins` array:

```javascript
const allowedOrigins = [
  'https://ai-finance-website-sage.vercel.app',
  'https://ai-finance-website-git-main-satyams-projects-f93b7ccf.vercel.app',
  'http://localhost:3000',
  'https://your-new-domain.com' // Add new domain here
];
```

### Method 2: Use environment variables
Set the `ADDITIONAL_ORIGINS` environment variable with comma-separated domains:

```bash
ADDITIONAL_ORIGINS=https://domain1.com,https://domain2.com
```

## Testing CORS Configuration

1. Install dependencies:
```bash
npm install
```

2. Run the CORS test:
```bash
node test-cors.js
```

3. Test from your frontend:
```javascript
fetch('https://ai-finance-backend-swart.vercel.app/api/cors-test', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('CORS test:', data))
.catch(error => console.error('CORS error:', error));
```

## CORS Endpoints

- `/api/cors-test` - Test endpoint to verify CORS is working
- All other API endpoints inherit the CORS configuration

## Troubleshooting

### Common CORS Errors
1. **"Origin not allowed"** - Add the origin to `allowedOrigins` array
2. **"Preflight request failed"** - Check that OPTIONS requests are handled
3. **"Credentials not allowed"** - Verify `credentials: true` is set

### Debugging
The server logs all CORS decisions:
- ✅ Allowed requests show the origin
- ❌ Blocked requests show the origin and allowed origins list

### Deployment
After updating CORS configuration:
1. Commit and push your changes
2. Redeploy to Vercel
3. Test the new configuration

## Security Notes
- Only add domains you trust
- Consider using environment variables for sensitive configurations
- Monitor logs for unexpected origin attempts 