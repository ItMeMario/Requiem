
# Requiem

Requiem is a desktop application designed to be the ultimate companion for Game Masters managing tabletop RPG campaigns. Built with modern web technologies, it offers a seamless and organized way to track your world's characters, locations, and unfolding story.

##  Features

*   **Campaign Management:** Create and organize multiple campaigns, each with its own genre and system (e.g., D&D 5e, Pathfinder).
*   **Character Tracking:** Keep detailed records of NPCs and player characters, including their race, faction, lore, bonds, and personal notes. Add image URLs for quick visual reference.
*   **Location Database:** Document the world's geography, from vast regions to specific points of interest. Describe the atmosphere, present NPCs, and underlying lore.
*   **Dynamic Journal entries:** Write down session summaries or your campaign's unfolding epic.
    *   **Entity Linking:** Mention characters or locations in your journal using {Character Name} syntax. The text automatically becomes an interactive link.
    *   **Quick Reference:** Clicking a linked entity instantly opens its details panel for rapid consultation or editing. Upon closing, you are returned seamlessly to your journal entry.
    *   **Rich Text Editing:** Use a clean, embedded rich-text editor to format your notes exactly as you want them.

##  Technology Stack

*   **Frontend:** React, Tailwind CSS, Lucide Icons, React Quill (for rich text).
*   **Framework:** Vite for fast, modern web development bundling.
*   **Backend/Desktop Wrapper:** Electron (IPC communication ensures secure and robust data handling).
*   **Database:** SQLite (etter-sqlite3) managed in the Electron Main process for fast, local data storage without requiring an internet connection.

##  Getting Started

### Prerequisites

*   Node.js (v16 or higher recommended)
*   npm (comes with Node.js)

### Installation

1.  Clone the repository:
    \\\ash
    git clone https://github.com/yourusername/requiem.git
    cd requiem
    \\\

2.  Install dependencies:
    \\\ash
    npm install
    \\\

3.  Run the application in development mode:
    \\\ash
    npm run dev
    \\\
    *(This will start both the Vite frontend server and the Electron desktop app concurrently).*

##  Building for Production

To package the application for distribution:

\\\bash
npm run build
\\\
*(Check your package.json for specific packaging scripts depending on your target OS).*



