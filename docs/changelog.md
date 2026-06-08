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
