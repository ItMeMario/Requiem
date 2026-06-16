📌 Patch Notes - Version 1.0.4

✨ New Features

- Integrated Firebase Authentication and Firestore to support cloud database mode alongside the local SQLite/IndexedDB modes.
- Implemented cross-platform native authentication, utilizing Capawesome Google Sign-In for mobile (Android) and a loopback HTTP server in Electron for desktop OAuth redirects.
- Added support for full SQLite database import and export in Cloud Mode, compiling Firestore collections into local SQLite binaries and merging SQLite backups (with parent ID remapping) into the cloud.
- Developed a hybrid auto-updater system supporting Git-based updates in development and automatic production updates via `electron-updater` and GitHub releases.
- Created an interactive local SQLite-to-Cloud migration flow that prompts users to upload local databases into Firestore upon first login.
- Built a custom-themed `UpdaterControls` React modal (Medieval, Cyberpunk, and Vampire) using React Portals to avoid layout conflicts, showing real-time download progress and logs.

🛠️ Improvements

- Implemented an HTML5 Canvas-based `imageCompressor` utility to compress and resize character and location base64 images before upload/import, preventing Firestore size limit issues.
- Integrated a theme-customized AuthControls toolbar component for easy user sign-in, sign-out, and profile viewing.

🐛 Bug Fixes

- Resolved state and theme persistence issues on mobile by migrating WebView localStorage to native `@capacitor/preferences` (supporting SharedPreferences/UserDefaults).
- Fixed campaign deletion to permanently remove all campaign data and nested subcollections (entries, characters, locations) from both Firestore and local databases.
- Resolved Android Google Sign-In issues by adding plugin initialization, fixing `idToken` retrieval from the sign-in result, and renaming the Android package to `com.mario.requiemapp` to prevent SHA-1 credential conflicts.
- Fixed environment variable loading on Vite configurations by aligning the root paths in `vite.config.ts` and `vite.config.web.ts`.

📅 Release Date: 06/15/2026

---

📌 Patch Notes - Version 1.0.3

✨ New Features

- Added support for editing campaign names, including an edit button on campaign cards and dynamic state handling in the creation modal.
- Implemented character and location read-only detail view modals featuring a responsive two-column layout.
- Integrated quick edit shortcuts inside the new detail view modals and set them as the default action for journal mention links.
- Updated locations image logic to allow uploading custom images from local storage.
- Added theme-specific dynamic dashboard back-link labels (Chronicles, Mainframe, Bloodlines) replacing the generic "Dashboard" text.

🛠️ Improvements

- Unified theme layouts (Medieval, Cyberpunk, and Vampire) into a single generic ThemeLayout component and moved theme-specific styles to respective CSS files.
- Improved mobile user experience with horizontal scroll support for tabs, condensed headers, and reduced padding on small screens.
- Updated Android application icons and splash screens to match the desktop version.

🐛 Bug Fixes

- Resolved data loss issues on application close for both Desktop (graceful SQLite shutdown to flush WAL files) and Mobile (lifecycles listeners to force-flush IndexedDB, debounced auto-saves, and connection reuse).
- Fixed database export and backups on Android using Capacitor Filesystem and Share APIs.
- Resolved database import failures on Android by introducing FileReader fallbacks, MIME type alternatives, and strict SQLite magic header validation.
- Fixed layout overlaps on mobile screens and the medieval theme by rendering the medieval spine behind content text.
- Resolved block and file locks during app update by killing all related processes and recreating the installation directory.

📅 Release Date: 06/08/2026

---

📌 Patch Notes - Version 1.0.2

✨ New Features

- Implemented cross-platform data layer with SQLite WASM support.
- Implemented PWA (Progressive Web App) support.
- Enhanced mobile responsiveness and touch UX.

🛠️ Improvements

- Refactored npm scripts for desktop and mobile builds.
- Optimized global mobile UX and input behaviors.
- Finalized mobile theme optimizations.
- Added Android configurations and Capacitor integration.

🐛 Bug Fixes

- Fixed database parameter bindings and Android build configuration.
- Fixed manual WASM loading for Android Capacitor compatibility.

📅 Release Date: 05/24/2026

---

📌 Patch Notes - Version 1.0.1

✨ New Features

- Added support for images.

🛠️ Improvements

- Added shortcut for reference links.

🐛 Bug Fixes

- No bug fixes in this release.

📅 Release Date: 05/06/2026
