📌 Patch Notes - Version 1.0.8

✨ New Features

- **Real-Time Database Synchronization**:
  - Implemented Firestore `onSnapshot` subscriptions in `FirebaseDataService` to sync campaigns, characters (with personal notes mapping), locations, and entries in real time.
  - Implemented a Pub/Sub event dispatcher in `ElectronDataService` and `WebDataService` to trigger subscription callbacks on local database mutations, maintaining reactive parity across local, offline, and cloud modes.
  - Refactored `useCampaigns` and `useEntities` hooks to utilize subscription observers reactively within React `useEffect` loops, ensuring automatic cleanup.
- **Swipe Gestures for Tab Navigation**:
  - Added horizontal touch swipe gestures (`onTouchStart` and `onTouchEnd`) on the campaign container in `ActiveCampaignView` to cycle through Characters, Locations, Journal, and Bestiary tabs.
  - Implemented a 60px swipe threshold and restricted detection to horizontal movement, excluding inputs, textareas, and editable fields to prevent interference with typing.
- **Unified Settings Panel**:
  - Consolidated theme switcher, database controls, and authentication into a floating, theme-responsive `SettingsPanel` in the bottom-right corner.
  - Decluttered screen space by removing separate floating elements from `App.tsx`.
- **Themed Campaign List Paging & 3D Transitions**:
  - **Medieval Theme**: Added campaign pagination (2 cards on desktop, 1 on mobile) with 3D book page-turning transitions, sweeping shadows, and a 3D page-flip card transition for mobile.
  - **Cyberpunk Theme**: Added campaign pagination with custom monospaced console pagination controls and zero-padded page numbers (`SEC_01 // SEC_03`). Added 3D digital glitch card animations (scale, skew, RGB hue-shift) and a terminal code-stream decryption transition overlay.
  - **Vampire Theme**: Added campaign pagination and implemented a synchronized gothic gate/tomb doors overlay with ornate SVG details and a pulsing central Vampire Ankh crest medallion, replacing the previous bat swarm transition.
- **Android WebView Cache Purging & PWA Controls**:
  - Implemented automatic clearing of WebView disk and memory cache on app startup when a new version code is detected in `SharedPreferences`.
  - Added a startup script in `main.tsx` to clear PWA cache storage and unregister service workers when running inside a native Capacitor container.
  - Configured VitePWA to be conditionally disabled during Capacitor compilation using the `CAPACITOR_BUILD` environment variable.

🛠️ Improvements

- **Dashboard Layout Modularization**:
  - Refactored `DashboardView.tsx` by extracting components into a new `dashboardModules` directory, reducing file size from ~930 lines to 216 lines.
  - Created `CampaignCard` to isolate card rendering and themes (Default, Medieval, Cyberpunk, Vampire).
  - Created `DashboardDivider` to handle theme-specific dividers (fleurons, lasers, gothic ankhs).
  - Split theme-specific layout containers into `MedievalView`, `CyberpunkView`, `VampireView`, and `DefaultView`.
- **Mobile UX Enhancements**:
  - Fixed mobile pagination overlaps by changing arrow padding from `px-4` to `px-16` on Cyberpunk and Vampire themes, avoiding the floating settings button while keeping arrows symmetrically aligned.
  - Added bottom padding (`pb-20` on mobile, `md:pb-0` on desktop) to scroll containers to clear the settings button.
  - Upgraded pagination controls to use large 44x44px chevron touch targets for mobile accessibility.
- **Android Build & Credentials Customization**:
  - Configured project-specific `debug-dev.keystore` for Android debug builds to prevent global debug SHA-1 signing conflicts.
  - Configured Android release signing configs (`signingConfigs.release`) in `build.gradle` to generate signed APKs, with a fallback to debug keystore if release credentials are not configured.
  - Updated build scripts to run a `gradle clean` task before compilation to ensure stale assets are cleared.
  - Configured Capacitor to load `.env` files based on the `CAPACITOR_ENV` environment variable, supporting dev and prod environments.

🐛 Bug Fixes

- **SQL Database Exporter Column Mismatch**:
  - Fixed a placeholder mismatch in the sqlite exporter (`sqliteParser.ts`) that caused a "11 values for 10 columns" error when exporting database tables on mobile.
- **Visual Campaign Flashing**:
  - Staggered dashboard page state updates to execute exactly at the half-way point of transitions (300ms mobile / 400ms desktop) to prevent flickering of cards during page turns.
- **Mobile Invite Modal Layout Overflow**:
  - Refactored the `CampaignCollaboratorsModal` invite form to stack vertically on mobile (`flex-col sm:flex-row`).
  - Added `shrink-0` to the invite button to prevent text truncation on narrow mobile screens.

📅 Release Date: 07/09/2026

---

📌 Patch Notes - Version 1.0.7

✨ New Features

- **Campaign Collaboration & Sharing**:
  - Implemented Firebase campaign collaboration, allowing Game Masters to invite other players to their campaigns via email.
  - Added a `CampaignCollaboratorsModal` with dynamic styling for Medieval, Cyberpunk, Vampire, and Default themes, and a "Share" button for GMs on active campaigns.
  - Updated SQLite, Web SQL, and IPC handlers to support new schema columns (`ownerId`, `collaborators`, `shared`, `authorId`, `authorName`) to keep local and cloud databases synchronized.
  - Configured automatic user profile saving to `/users/{uid}` on login to enable email-to-UID resolution.
  - Refactored `FirebaseDataService` to store collections globally under `/campaigns/{campaignId}` and filter entries, characters, and locations based on owner/collaborator visibility rules.
- **Privacy by Default for Campaign Items**:
  - Changed default initialization of new characters, locations, and journal entries to private (`shared: false`).
  - Added `resetCampaignItemsSharing` to automatically mark all existing items as private when the first collaborator is added to a campaign.
- **Private & Individual Character Personal Notes**:
  - Created Firestore rules for a new private subcollection `/users/{userId}/personal_notes/{characterId}`, allowing players and GMs to have individual, private personal notes.
  - Refactored `FirebaseDataService` to load, save, and delete personal notes in this private subcollection instead of the shared character document.
- **Bestiary (Monsters) Tab & XML Compendium**:
  - Added a "Bestiary (Monsters)" tab to the active campaign view (using the Lucide `Skull` icon).
  - Migrated Bestiary data to a pure XML compendium-driven architecture with glob loading (`import.meta.glob`), dynamically parsing D&D 5e monster XML files on-the-fly using the browser's native `DOMParser`.
  - Implemented automatic calculation of standard ability modifiers, CR-to-XP mapping, meta info synthesis, and formatting of nested XML structures (traits, actions, reactions, legendary actions) into HTML paragraphs.
  - Created `MonsterDetailModal` displaying full themed stat blocks customized for Medieval (parchment/wax-red accents), Cyberpunk (HUD terminal/neon alerts), and Vampire (charcoal/crimson font) modes, including combat stats rendering (resistances, vulnerabilities, immunities).
- **Environment & Build Automation Reorganization**:
  - Separated Firebase credentials and configurations into environment-specific local files (`.env.development.local` and `.env.production.local`).
  - Configured `capacitor.config.ts` to scan environment configurations in order of preference to resolve the Google Client ID.
  - Configured `android/app/build.gradle` to support build-type specific configs (checking `src/debug` and `src/release` directories for `google-services.json`).
  - Refactored `scripts/build.js` to dynamically parse arguments for building development or production packages for desktop/mobile.
  - Reorganized `package.json` scripts with new commands for development and production modes (e.g. `npm run apk:dev`, `npm run dist dev`).
- **Attachment Deletion**:
  - Added the ability to delete attachments directly from the character details view, prompting the user with a confirmation dialog.

🛠️ Improvements

- **Themed UI Input Controls**:
  - Created a custom themed Checkbox component supporting Medieval, Cyberpunk, and Vampire modes.
  - Relocated basic inputs (Checkbox, InputField, TextAreaField) into `src/renderer/components/ui/` for better code structure and updated imports across all modals.
- **Mobile UX & UI Enhancements**:
  - Made edit and delete campaign buttons always visible on small screens (`sm` and below) in `DashboardView` to support mobile/touch devices.
  - Added `pointer-events-none` (with group-hover overrides) to hidden image overlays in Character, Location, and Monster modals, enabling mobile touch events to trigger the lightbox zoom and download actions.
  - Propagated `selectedCampaign` down to list and modal components to ensure proper context consistency.
  - Conditionally hide Edit and Delete triggers or disable inputs based on campaign owner and item author permissions.
  - Disabled core character form inputs in `CharacterModal` for non-author/non-owner users while keeping the personal notes field enabled.
- **Database Rules & Exporter**:
  - Configured local `firestore.rules` and `firebase.json` for easy deployment, adding `firebase-tools` to devDependencies.
  - Upgraded desktop cloud exporter schema to prevent column mismatch errors and support the new collaboration metadata.

🐛 Bug Fixes

- **Firestore Permission & Composite Index Fix**:
  - Bypassed `collectionGroup` queries by implementing in-memory lookup maps (`characterCampaignMap`, `locationCampaignMap`, `entryCampaignMap`) in `FirebaseDataService`, avoiding Firestore rules blocks and missing index errors when updating or saving characters.
- **Mobile ID Lookup Bug**:
  - Cast document IDs to `Number` during lookups in cache maps to resolve a runtime bug where string IDs from the UI bypassed the cache and triggered unauthorized queries on mobile devices.
- **TypeScript Compilation Errors**:
  - Resolved compiler warning TS4023 in `database.ts` by using modern ES6 imports for `better-sqlite3` and casting database instance references.
  - Added typecasts to SQLite `.get(id)` outputs in main process IPC handlers to avoid compiler errors regarding property access on `unknown` types.
- **Security Policy Update**:
  - Added `'unsafe-eval'` to the Content-Security-Policy meta tag in `index.html` under `script-src` to permit WebAssembly-based SQLite execution in web environments.
- **Attachment Deletion Security & Modal Crash**:
  - Restricted the attachment deletion action in `CharacterViewModal` to author and owner users.
  - Fixed a potential null pointer crash in modals by refactoring permission checks to occur after character existence validation.

📅 Release Date: 07/06/2026

---

📌 Patch Notes - Version 1.0.6

✨ New Features

- Added support for attaching multiple files (such as images, PDFs, and character sheets) to registered characters. Files are stored as Base64 strings in the local SQLite database and Firestore, featuring automatic image compression and a 1MB limit check.
- Integrated multiple attachments UI in `CharacterModal` for easy uploading, listing, compressing, and removing, and updated `CharacterViewModal` to display attachments by file type, including an HD lightbox overlay for images.
- Implemented a cross-platform file download system supporting Capacitor plugins on mobile and HTML5 anchor tags on desktop/web.
- Added character and location portrait recovery and auto-archiving logic: when a character's portrait is updated or removed, the previous portrait is automatically saved as an attachment named "Retrato Antigo - [Date-Time].png".

🛠️ Improvements

- Added interactive hover actions (View and Download) to character and location portraits inside their respective detail modals.
- Integrated full-screen Lightbox support for location images, including a quick download button inside the lightbox preview modal for easy image export.
- Display a 48x48px preview thumbnail with quick View, Download, and Remove buttons in the Edit modal for characters and locations before replacing or removing images.
- Implemented automated database migrations: updates local Electron and Web/WASM database structures to include the `attachments` column, ensuring smooth backwards compatibility.
- Synchronized multiple attachment support with Firebase Firestore, including full integration with local backup imports and exports.

🐛 Bug Fixes

- Cast attachments state to `any[]` in `useCharacterManager` to resolve TypeScript compilation warnings.

📅 Release Date: 06/24/2026

---

📌 Patch Notes - Version 1.0.5

✨ New Features

- No new features in this release.

🛠️ Improvements

- Modularized the React frontend by extracting domain state logic into dedicated custom hooks (`useCampaignManager`, `useCharacterManager`, `useLocationManager`, `useEntryManager`, and `useAppNavigation`) and splitting UI rendering from `App.tsx` into modular view components (`DashboardView`, `DashboardHeader`, and `ActiveCampaignView`).
- Refactored the Electron main process by grouping and isolating IPC handlers into dedicated modules under `src/main/ipc/` (`campaign`, `entry`, `character`, `location`, `backup`, `auth`, and `ipcRegistry`), keeping `index.ts` focused only on app lifecycle and window management.
- Modularized application stylesheets by splitting the large `vampire.css` and `cyberpunk.css` files into structured CSS sub-modules (variables, animations, layout, responsive, etc.), which also resolved PostCSS import ordering build warnings.
- Simplified the main updater system by removing redundant development-mode git update commands, child process spawns, and dev log consoles from both `updater.ts` and `UpdaterControls.tsx`.

🐛 Bug Fixes

- Fixed a critical security vulnerability by sanitizing all rendered journal entry HTML with DOMPurify to prevent potential Stored XSS (Cross-Site Scripting) attacks.
- Enforced native OS-level process sandboxing on Electron renderers by explicitly setting `sandbox: true` under `webPreferences` when creating the main browser window.
- Hardened authentication security by adding strict validation for the `state` query parameter in the Google OAuth loopback redirect flow to prevent CSRF (Cross-Site Request Forgery) attacks.
- Prevented unauthorized navigation and new window popups in Electron by implementing `will-navigate` and `setWindowOpenHandler` overrides in the main process, routing allowed external links directly to the OS default browser.
- Added a restrictive Content Security Policy (CSP) meta tag to the application shell (`index.html`) to control allowed script execution, style sources, and connection endpoints.
- Resolved a critical Windows installation and update lock error (where the installer failed to rename or move files to the Temp directory due to exceeding the 260-character MAX_PATH limit) by optimization of production dependencies in `package.json` (moving build-time packages like Capacitor and Firebase to devDependencies) and restricting `asarUnpack` to target only the native `better_sqlite3.node` binary.

📅 Release Date: 06/16/2026

---

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