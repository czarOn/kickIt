# KickIt camera positioning companion (experimental)

Native iOS 16+ SwiftUI app using Nearby Interaction and encrypted Multipeer
Connectivity. Safari has no access to these UWB measurements. The web recorder
is unchanged; this companion is a separate **setup tool**, not a recorder.

## Build and install

On a Mac with Xcode and [XcodeGen](https://github.com/yonaskolb/XcodeGen):

```sh
cd ios/CameraPositioning
xcodegen generate
open KickItPositioning.xcodeproj
```

In Xcode, select the application target, choose your development team, and use
a unique bundle identifier. Install on each physical phone with your signing
profile. The simulator cannot validate UWB. Generated project files and
`Info.plist` are generated from `project.yml`, not maintained separately.

## Three-camera setup

1. Use phones that report precise distance support at runtime. Do not assume
   every iPhone or iPad supports UWB. Availability also depends on region and
   permissions.
2. Name the cameras (for example `Front`, `Side`, `Rear`), start discovery on each,
   and allow Local Network and Nearby Interactions permissions.
3. Connect each phone to the other two, one pair at a time; accept invitations
   only from your own devices. Names are user-provided, not verified identities.
4. Read the measured distances while positioning tripods. Direction, when
   available, is a unit vector relative to the measuring device, **not** a
   shared world coordinate or a camera optical-axis measurement. Maintain clear
   paths; a fixed tripod orientation may prevent reliable peer ranging.
5. After two seconds without updates, measurements are marked stale. Missing
   direction or distance is explicitly unavailable. If interrupted, retry
   ranging on both peers. Denied permissions must be restored in Settings.
6. Optionally export a local JSON snapshot with measurement receipt times,
   ages and stale flags. It is not a continuous motion log or calibration file.
7. Switch to the Safari analyzer and aim cameras at a common physical marker
   using its grid. Leaving this app stops discovery/ranging and clears samples;
   background ranging while Safari records is **not implemented**.

UWB distances alone cannot establish camera orientation or a shared coordinate
system. Three pairwise distances at best describe a triangle up to rigid motion
and reflection, and do not locate the athlete. This app does not infer a
calibrated triangle from asynchronous measurements. Use a visible calibration
target for actual multi-camera reconstruction. UWB does not synchronize camera
frames or remove the need for timing markers.

Discovery tokens and measurements are exchanged locally between accepted peers,
not sent to a PC server or cloud. Exported snapshots contain camera names and
relative location data; share deliberately and delete when no longer needed.

## Validation required before use

Source was authored in a Linux environment without Xcode or Apple's SDKs.
An iOS build and real-device validation are required. On the Mac, generate the
project and run:

```sh
xcodebuild -project KickItPositioning.xcodeproj -scheme KickItPositioning \
  -sdk iphoneos -configuration Debug CODE_SIGNING_ALLOWED=NO build
```

Then test three supported phones: accepted/rejected invitations, permission
denial, pairwise measurements against a tape measure, missing direction,
obstruction, disconnect/reconnect, stale data, JSON export, and switching to
Safari. Do not treat the companion as validated calibration equipment.

References: [Nearby Interaction](https://developer.apple.com/documentation/nearbyinteraction)
and [session requirements](https://developer.apple.com/documentation/nearbyinteraction/initiating-and-maintaining-a-session).
