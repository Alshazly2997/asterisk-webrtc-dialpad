# Asterisk WebRTC DialPad

A lightweight, browser-based softphone built with JavaScript, HTML/CSS, and [SIP.js](https://sipjs.com/). This dial pad is designed to connect to an Asterisk server via Secure WebSockets (WSS), allowing you to make and receive real-time audio calls directly from your web browser.

## Features
* **Registration:** Dynamically log in with your extension and password.
* **Two-Way Audio:** Fully functional WebRTC media handling for making and answering calls.
* **Real-time Status:** Visual feedback for call states (Registered, Ringing, In Call, Disconnected).

## Prerequisites
To run this project, you will need:
1. An **Asterisk Server** configured for WebRTC (PJSIP endpoints configured with `webrtc=yes`).
2. **Secure WebSockets (WSS)** enabled on your Asterisk server (usually port 8089).
3. A web server serving these files over **HTTPS** (WebRTC requires a secure context to access the microphone).
4. The [SIP.js library](https://sipjs.com/download/) (`sip.min.js`) is placed in the same directory as the project files.

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Alshazly2997/asterisk-webrtc-dialpad.git
   cd asterisk-webrtc-dialpad
   
2. **Download SIP.js (v0.21.2)**
   ```bask
   sudo wget https://github.com/onsip/SIP.js/releases/download/0.21.2/sip-0.21.2.js -O sip.min.js

3. **Configure your Server IP**
   Open app.js and update the ASTERISK_IP at the top:
   ```JavaScript
   const ASTERISK_IP = "192.168.x.x"; // Your Asterisk IP

4. **deploy**
   
   Upload index.html, app.js, and sip.min.js to your web server or Asterisk's static-http directory.


## Usage
  1. Open the app in a browser via HTTPS.
  2. Log in using your Asterisk extension and password.
  3. Grant microphone permissions when prompted.
  4. Enter a destination number and click Call.
