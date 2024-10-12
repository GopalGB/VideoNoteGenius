
# **Video Note Taker Chrome Extension**

### **Version 1.0**

**Video Note Taker** is a Chrome extension designed to assist users in taking detailed notes from any video with the help of Groq AI. It provides a user-friendly interface for summarizing and extracting key points from videos directly within your browser.

---

## **Features**
- Take notes while watching any video on the web.
- AI-assisted note generation with Groq AI.
- User-friendly popup interface for managing notes.
- Automatic saving of notes for easy access later.

---

## **File Structure**

```plaintext
Video-Note-Taker/
│
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── background.js
├── content.js
├── images/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### **File Descriptions:**

- **manifest.json**  
  This file contains the metadata and configuration for the extension, specifying the permissions, background script, content scripts, and action details for the extension.

- **popup.html**  
  The HTML structure for the popup window that appears when the user clicks on the extension icon. This is where users interact with the extension.

- **popup.css**  
  The CSS file that styles the popup interface, making it visually appealing and user-friendly.

- **popup.js**  
  The JavaScript file that handles the logic for the popup. It interacts with the user interface, processes user inputs, and sends commands to background scripts.

- **background.js**  
  The background script that runs in the background and manages tasks such as note-taking logic, communication between different parts of the extension, and storing notes.

- **content.js**  
  A content script that runs in the context of the web pages the user visits. This script can extract data from videos, pass it to the background script, and perform other tasks related to interaction with web pages.

- **images/**  
  This directory contains the icons for the extension, which are displayed in the Chrome toolbar, extensions page, and other places.

---

## **Installation Instructions**

### **Installing from Source**
1. Download or clone this repository:
   ```bash
   git clone https://github.com/your-repo/video-note-taker.git
   ```
2. Open the Chrome browser.
3. Navigate to `chrome://extensions/`.
4. Enable **Developer mode** in the top right corner.
5. Click **Load unpacked** and select the folder where this repository is located.

### **Installing from Chrome Web Store**
To install the extension from the Chrome Web Store:
1. Go to the Chrome Web Store link: [Video Note Taker Extension](#)
2. Click **Add to Chrome**.
3. The extension will be added to your browser, and the icon will appear in the toolbar.

---

## **How to Use**

1. After installation, click on the **Video Note Taker** icon in your Chrome toolbar.
2. A popup will appear where you can start taking notes while watching any video.
3. The Groq AI will assist in summarizing and structuring the notes for you.
4. Notes will be automatically saved and can be accessed any time by reopening the extension.

---

## **Manifest File Overview**
Here’s a breakdown of the important parts of the `manifest.json` file:

```json
{
  "manifest_version": 3,
  "name": "Video Note Taker",
  "version": "1.0",
  "description": "Take detailed notes from any video with Groq AI assistance",
  "permissions": [
    "activeTab",
    "storage",
    "scripting",
    "tabs"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "images/icon16.png",
      "48": "images/icon48.png",
      "128": "images/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }]
}
```

### Key Permissions:
- **activeTab**: Grants the extension temporary access to the currently active tab when the extension's action is invoked.
- **storage**: Allows the extension to store and retrieve data, like notes.
- **scripting**: Lets the extension inject scripts into web pages.
- **tabs**: Provides access to browser tab management features.

---

## **Extension Components**

### **Popup UI (popup.html, popup.css, popup.js)**
The popup interface allows users to interact with the extension:
- **popup.html**: Defines the structure of the popup window.
- **popup.css**: Styles the popup for a clean and intuitive user interface.
- **popup.js**: Handles user actions such as note-taking, AI processing, and storage.

### **Background Script (background.js)**
- This script runs in the background, managing long-term processes such as storing notes, retrieving video information, and interacting with the content script.

### **Content Script (content.js)**
- Injects JavaScript into web pages to interact with video elements and capture relevant data to assist in note-taking.

---

## **Contributing**

Contributions are welcome! If you'd like to contribute, please fork the repository and make your changes. Once done, submit a pull request.

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.

---

## **License**

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## **Contact**

For any questions or issues, please contact:

- **Name**: Gopal Bagaswar
- **Email**: gopalbagaswar19@gmail.com

---

This **README** file is designed to help users and developers understand the **Video Note Taker** Chrome extension, its structure, and how to install and use it.

