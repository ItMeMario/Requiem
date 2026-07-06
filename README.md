# Requiem

Requiem is a desktop application designed to be the ultimate companion for Game Masters and players managing tabletop RPG campaigns. Keep track of characters, locations, and your unfolding story in one simple, organized place.

## Installation

1. Download **`requiem.exe`**.
2. Run the executable and follow the on-screen installation instructions.

## Execution

Once installed, simply double-click the Requiem shortcut on your desktop or run it from your Start menu to launch the application.

## Features

* **Campaign Management:** Create and organize multiple RPG campaigns.
* **Campaign Collaboration & Sharing:** Invite other players/co-GMs via email to collaborate on campaigns in real-time.
* **Granular Privacy Controls:** Choose whether characters, locations, and journal entries are private (`shared: false`) or shared (`shared: true`) with collaborators.
* **Private Personal Notes:** Keep individual, private notes for characters that are visible only to you.
* **Bestiary (Monsters):** Browse and filter D&D 5e monsters from a dynamically loaded XML compendium, featuring themed stat blocks for Medieval, Cyberpunk, and Vampire modes.
* **Entity Tracking:** Keep detailed records of NPCs, player characters, and locations with support for multiple file attachments (PDFs, images, character sheets).
* **Dynamic Journals:** Write session summaries with rich text, smart linking to your characters/locations, and DOMPurify sanitization.
* **Auto-Archiving & Portrait Recovery:** Automatically saves old character and location portraits as backup attachments when updated.

## How to Use Key Features

### 👥 Campaign Collaboration
1. Open an active campaign (as the Campaign Owner/GM).
2. Click the **Share** button in the top navigation/header.
3. In the modal, enter the email address of the player you want to invite and click **Invite**.
4. Once invited, collaborators can see the campaign on their dashboard and join.

### 🔒 Item Privacy & Personal Notes
* **Sharing Items:** When editing or creating a character, location, or journal entry, toggle the **Shared** checkbox.
  * If **Checked**: Collaborators will see the item in their lists.
  * If **Unchecked**: The item is completely private to you.
* **Personal Notes:** Every character sheet contains a **Personal Notes** field. Regardless of who owns or created the character, any notes typed here are private and individual to your logged-in account.

### 💀 Accessing and Searching the Bestiary
1. Navigate to your active campaign.
2. Click the **Bestiary** tab (indicated by the **Skull** icon).
3. Search for monsters using the search bar (searches name, type, alignment).
4. Use the range sliders to filter monsters by **Armor Class (AC)** and **Challenge Rating (CR)**.
5. Click on any monster card to open a fully formatted stat block modal matching your active application theme.

### 📎 Managing Attachments
1. In the Character or Location details modal, view current attachments.
2. If you are the owner or author, you can upload new attachments (up to 1MB, with automatic image compression) or delete existing ones by clicking the delete (trash bin) icon.

## License

You are free to use, modify, and share this software for any non-commercial purpose. Commercial use or sale of this software is strictly prohibited without the express written authorization of the author.

See [Licence.txt](/Requiem/Licence.txt) for the full license text.
