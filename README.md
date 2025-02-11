# Ad Blocker & Popup Remover Chrome Extension

## Overview
This Chrome extension replaces advertisements with inspirational quotes and blocks unwanted pop-up windows. It enhances the browsing experience by preventing distractions while promoting motivation.

## Features
- **Ad Replacement**: Detects advertisements and replaces them with inspirational quotes.
- **Popup Blocker**: Automatically closes pop-up windows to prevent unwanted interruptions.
- **Activity Tracking**: Logs the number of ads replaced and sites modified.
- **Customizable Content**: Allows users to choose between motivational quotes or activity reminders.

## Installation
1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer Mode** (toggle in the top right corner).
4. Click **Load Unpacked** and select the extension folder.
5. The extension will now be added to Chrome.

## How It Works
### **Ad Replacement**
- Detects ad elements using predefined selectors.
- Fetches a random quote or user activity.
- Replaces ads with an inspirational message.

### **Popup Blocking**
- Listens for new browser windows.
- If the window type is `popup`, it automatically closes it.

## File Structure
- **manifest.json**: Defines permissions and background scripts.
- **background.js**: Manages pop-up blocking and message passing.
- **content.js**: Replaces ads with motivational content.
- **App.jsx**: (Optional) User interface for customization.



## Future Enhancements
- Add user-defined blacklist for specific ad networks.
- Allow users to customize replacement messages.
- Implement advanced tracking for better statistics.

## License
This project is open-source and free to use under the MIT License.

