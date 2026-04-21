# iOS Packaging Notes

This project is prepared for a Capacitor-based iOS app shell.

Current app defaults:
- App name: `Sports Rehab App`
- Bundle ID: `com.sunshiqi.sportsrehab`

The web app is already connected to Capacitor and an `ios/` project has been generated.

Before opening in Xcode, this Mac still needs:
1. Full Xcode installed from the App Store
2. `xcode-select` pointed at Xcode
3. CocoaPods installed

After those are ready, run:

```bash
cd /Users/sunshiqi/工作/workout
npm install
npm run ios:sync
npx cap open ios
```

If `pod install` is still needed manually:

```bash
cd /Users/sunshiqi/工作/workout/ios/App
pod install
```

Then in Xcode:
1. Open the `App.xcworkspace`
2. Set your Apple Developer team under Signing & Capabilities
3. Choose an iPhone simulator or connected device
4. Build and run
5. Archive for TestFlight when ready
