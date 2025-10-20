# ✅ PWA Installation Checklist

## Before Testing

- [ ] Start dev server: `npm run dev`
- [ ] Server running on `http://localhost:3000`
- [ ] Open DevTools (`F12`) to monitor console

## Testing Desktop Installation

- [ ] Navigate to `http://localhost:3000`
- [ ] Login with your account
- [ ] Wait 5 seconds for install prompt to appear
- [ ] See install prompt in bottom-right corner
- [ ] Click "Install Now" button
- [ ] App opens in standalone window (no browser UI)
- [ ] Check desktop for app icon/shortcut

**Alternative Method:**
- [ ] Look for install icon (⊕) in address bar
- [ ] Click and select "Install"

## Verify Installation

- [ ] Open DevTools → Application tab → Service Workers
- [ ] See: `activated and is running` status
- [ ] Go to Application → Manifest
- [ ] Verify all fields are populated correctly
- [ ] See 6 icon sizes listed

## Test Offline Mode

- [ ] App is installed and open
- [ ] DevTools → Network tab
- [ ] Check "Offline" checkbox
- [ ] Refresh the page (`F5`)
- [ ] App still loads (from cache)

## Mobile Testing (Android)

- [ ] Connect phone to same WiFi network
- [ ] Open Chrome on phone
- [ ] Navigate to `http://192.168.0.158:3000`
- [ ] Login
- [ ] Wait for install prompt OR
- [ ] Tap menu (⋮) → "Add to Home screen"
- [ ] Confirm installation
- [ ] Find app icon on home screen
- [ ] Open from home screen
- [ ] Verify standalone mode (no browser UI)

## iOS Testing (Safari)

- [ ] Open Safari on iPhone
- [ ] Navigate to your app URL
- [ ] Tap Share button (square with arrow)
- [ ] Scroll and tap "Add to Home Screen"
- [ ] Edit name if desired
- [ ] Tap "Add"
- [ ] Find icon on home screen

## Console Messages to Look For

✅ Good messages:
```
[PWA] Service Worker registered: <registration>
[SW] Installing service worker...
[SW] Caching app shell
[SW] Activating service worker...
```

❌ If you see errors:
```
Service Worker registration failed
Failed to register service worker
```
→ Check troubleshooting section in PWA_INSTALLATION_GUIDE.md

## Common Issues & Quick Fixes

### Issue: No install prompt appears
**Fix:**
1. Hard refresh: `Ctrl + Shift + R`
2. Clear browser cache
3. Check if already installed
4. Verify service worker is running (DevTools → Application)

### Issue: Service worker not registering
**Fix:**
```powershell
# Stop server
# Clear cache
Remove-Item -Path .next -Recurse -Force
# Restart
npm run dev
```

### Issue: App doesn't work offline
**Fix:**
1. DevTools → Application → Service Workers
2. Click "Update" or "Unregister"
3. Refresh page to re-register

## Files Changed

✅ `public/manifest.json` - Updated with proper configuration
✅ `public/sw.js` - Enhanced service worker (v3)
✅ `src/components/PWAInstaller.tsx` - New install prompt UI
✅ `src/app/globals.css` - Added slide-up animation

## Success Criteria

When everything works:
- ✅ Install prompt appears after 5 seconds
- ✅ App installs with one click
- ✅ Icon appears on desktop/home screen
- ✅ App opens in standalone mode (no browser chrome)
- ✅ App works offline
- ✅ Fast subsequent loads
- ✅ Service worker active and running

---

**Full documentation**: See `PWA_INSTALLATION_GUIDE.md`
