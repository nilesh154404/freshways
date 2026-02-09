# Deep Linking Implementation Guide

## Overview
This implementation adds deep linking functionality to FreshWays, allowing users to share posts via links that can be opened in the app or on the web.

## Features Implemented

### 1. **Share with Deep Link**
When users click the Share button on a post, the system:
- Generates a shareable URL: `https://your-domain.com/post/{postId}`
- Copies the link to the clipboard automatically
- Increments the share count in the backend
- Shows a success toast notification

### 2. **Open in App Banner**
When a user opens a shared link in a browser, they see:
- A sticky banner at the top with the FreshWays branding
- An "Open in App" button to launch the mobile app
- A dismiss button (X) to close the banner
- Responsive design that works on mobile and desktop

### 3. **Public Post Detail Page**
- Accessible without authentication: `/post/:id`
- Displays full post content including:
  - Author information
  - Post description
  - Media (images)
  - Engagement stats (likes, comments, shares, saves)
  - Comments section
- Call-to-action button to open the app

## File Changes

### 1. **App.tsx**
- Added import for `PostDetail` component
- Added new public route: `/post/:id`

### 2. **pages/PostDetail.tsx** (NEW)
- Complete post detail page component
- "Open in App" banner with dismiss functionality
- Deep link handling for mobile apps
- Responsive design for all devices

### 3. **pages/Feed.tsx**
- Updated `handleShare` function to:
  - Generate shareable deep link
  - Copy link to clipboard
  - Show appropriate toast message

### 4. **pages/Marketing.tsx**
- Updated `handleShare` function to:
  - Generate shareable deep link using `/post/` route
  - Copy link to clipboard

## Deep Link URL Format

### Web URL (Universal Link)
```
https://your-domain.com/post/123
```
- Works in any browser
- Shows "Open in App" banner
- Falls back to web experience if app not installed

### App Deep Link (Custom URL Scheme)
```
freshways://post/123
```
- Opens directly in the mobile app (if installed)
- Used when "Open in App" button is clicked

## Mobile App Integration

### iOS (Required Setup)
To enable deep linking on iOS, add this to your app's Info.plist:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>freshways</string>
    </array>
    <key>CFBundleURLName</key>
    <string>com.freshways.app</string>
  </dict>
</array>
```

For universal links (HTTPS), add Associated Domains:
```xml
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:your-domain.com</string>
</array>
```

### Android (Required Setup)
Add this to your AndroidManifest.xml:

```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  
  <!-- Custom URL Scheme -->
  <data android:scheme="freshways" android:host="post" />
  
  <!-- Universal Links -->
  <data android:scheme="https" android:host="your-domain.com" android:pathPrefix="/post" />
</intent-filter>
```

### React Native Implementation
If using React Native, handle deep links in your App.js:

```javascript
import { Linking } from 'react-native';

useEffect(() => {
  // Handle deep link when app is opened from a link
  const handleDeepLink = (event) => {
    const url = event.url;
    // Parse URL: freshways://post/123 or https://domain.com/post/123
    const postId = url.match(/post\/(\d+)/)?.[1];
    if (postId) {
      // Navigate to post detail in your app
      navigation.navigate('PostDetail', { id: postId });
    }
  };

  // Listen for deep links
  Linking.addEventListener('url', handleDeepLink);

  // Check if app was opened via deep link
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink({ url });
    }
  });

  return () => {
    Linking.removeEventListener('url', handleDeepLink);
  };
}, []);
```

## Testing

### Test on Desktop Browser
1. Go to Feed page
2. Click Share button on any post
3. Link is copied to clipboard
4. Paste the link in a new browser tab
5. Verify "Open in App" banner appears
6. Verify post content displays correctly

### Test on Mobile Browser
1. Share a post from the app
2. Send the link via messaging app
3. Open the link in a mobile browser
4. Tap "Open in App" button
5. Verify app opens with the correct post

### Test Clipboard Copy
1. Click Share button
2. Check that toast notification appears
3. Paste the clipboard content
4. Verify the URL format is correct

## User Flow

### Sharing Flow
```
User clicks Share → Link copied to clipboard → Toast notification → 
User pastes link anywhere → Recipients receive shareable link
```

### Receiving Flow (App Installed)
```
User clicks link → Browser opens → "Open in App" banner shown → 
User clicks "Open in App" → App launches → Post detail displayed
```

### Receiving Flow (App Not Installed)
```
User clicks link → Browser opens → "Open in App" banner shown → 
User views post in browser → Call-to-action to download app
```

## Customization Options

### Change Deep Link Scheme
In `PostDetail.tsx`, update the deep link scheme:
```typescript
const deepLink = `yourappname://post/${id}`;
```

### Customize Banner Appearance
Edit the banner section in `PostDetail.tsx`:
```tsx
<div className="bg-gradient-to-r from-blue-600 to-blue-700">
  {/* Customize colors, text, and layout */}
</div>
```

### Add Analytics
Track sharing events by adding analytics in `handleShare`:
```typescript
// In Feed.tsx or Marketing.tsx
analytics.track('post_shared', {
  postId: postId,
  userId: userId,
  platform: 'web'
});
```

## Security Considerations

1. **URL Validation**: Post IDs are validated by the backend
2. **Public Access**: `/post/:id` route is public by design
3. **Authentication**: Other routes remain protected
4. **Rate Limiting**: Consider adding rate limits on the share endpoint

## Future Enhancements

1. **Dynamic Meta Tags**: Add OpenGraph tags for better social media previews
2. **QR Code Sharing**: Generate QR codes for posts
3. **Share Analytics**: Track which posts are shared most
4. **Rich Previews**: Show post preview when link is pasted in messaging apps
5. **Share to Social Media**: Direct share buttons for WhatsApp, Facebook, etc.

## Troubleshooting

### Link doesn't copy to clipboard
- Ensure HTTPS is enabled (required for clipboard API)
- Check browser permissions for clipboard access

### "Open in App" doesn't work
- Verify mobile app deep link configuration
- Check that custom URL scheme matches
- Test universal links are properly configured

### Post not loading
- Check network requests in browser console
- Verify backend API is accessible
- Ensure post ID is valid

## Support
For issues or questions, contact the development team.
