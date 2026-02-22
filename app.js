// Asterisk server configuration
const ASTERISK_IP = "0.0.0.0"; // Change this to your Asterisk server's IP address

// SIP.js variables
let userAgent;
let currentSession;

// Login logic
function login() {
    const user = document.getElementById('extension').value; // Make sure your HTML input ID matches this!
    const pass = document.getElementById('password').value;

    if (!user || !pass) {
        alert("Please enter both extension and password!");
        return;
    }

    document.getElementById('login-container').style.display = 'none';
    document.getElementById('phone-container').style.display = 'block';

    initializeSIP(user, pass);
}

//Dial pad logic
const display = document.getElementById('display');
const statusText = document.getElementById('status');

function appendNumber(num) {
    display.value += num;
}

//SIP.js setup and registration
async function initializeSIP(username, password) {
    
    const userAgentOptions = {
        uri: SIP.UserAgent.makeURI(`sip:${username}@${ASTERISK_IP}`),
        authorizationUsername: username,
        authorizationPassword: password,
        transportOptions: {
            server: `wss://${ASTERISK_IP}:8089/ws`
        },
        
        delegate: {
            onConnect: () => {
                statusText.innerText = "Status: Connected to server";
                statusText.style.color = "blue";
            },
            onInvite: (invitation) => {
                console.log("Incoming call from:", invitation.remoteIdentity.uri.user);

                const confirmed = confirm(`Incoming call from ${invitation.remoteIdentity.uri.user}. Answer?`);

                if (confirmed) {
                    currentSession = invitation;

                    currentSession.stateChange.addListener((newState) => {
                        const statusText = document.getElementById('status');
         	            const display = document.getElementById('display');

	                    switch (newState) {
            		        case SIP.SessionState.Established:
                   		        statusText.innerText = "Status: In Call";
                   		        statusText.style.color = "blue";
               		            setupRemoteAudio();
                  		    break;
               		        case SIP.SessionState.Terminated:
                  		        statusText.innerText = "Status: Registered";
                  	 	        statusText.style.color = "green";
                  		        display.value = ""; // Clear the dialer
	               	            currentSession = null;
                	   	        break;
           		        }
                    });

                    currentSession.accept({
                        sessionDescriptionHandlerOptions: {
                            constraints: {audio: true, video: false} // Fixed typo here
                        }
                    });

                } else {
                    invitation.reject();
                }
            }
        }
    }; 

    userAgent = new SIP.UserAgent(userAgentOptions);
    const registerer = new SIP.Registerer(userAgent);
    
    try {
        await userAgent.start();
        await registerer.register();
        statusText.innerText = `Status: Registered as ${username}`; 
        statusText.style.color = "green";
    } catch (error) {
        console.error("Failed to connect or register:", error);
        statusText.innerText = "Status: Failed";
        statusText.style.color = "red";
    }
}

//Call logic
async function makeCall() {
    const targetNumber = display.value;
    if (!targetNumber) {
        alert("Please enter a number to call.");
        return;
    }

    const targetURI = SIP.UserAgent.makeURI(`sip:${targetNumber}@${ASTERISK_IP}`);

    currentSession = new SIP.Inviter(userAgent, targetURI, {
        sessionDescriptionHandlerOptions: {
            constraints: { audio: true, video: false }
        }
    });

    currentSession.stateChange.addListener((newState) => {
        switch (newState) {
            case SIP.SessionState.Establishing:
                statusText.innerText = "Status: Ringing...";
                statusText.style.color = "orange";
                break;
            case SIP.SessionState.Established:
                statusText.innerText = "Status: In Call";
                statusText.style.color = "blue";
                setupRemoteAudio();
                break;
            case SIP.SessionState.Terminated:
                statusText.innerText = "Status: Registered";
                statusText.style.color = "green";
                display.value = "";
                currentSession = null;
                break;
        }
    });

    try {
        await currentSession.invite();
    } catch (error) {
        console.error("Failed to make call:", error);
    }
}

//Hanging up the call
function hangupCall() {
    if (!currentSession) {
        display.value = "";
        return;
    }

    if (currentSession.state === SIP.SessionState.Established) {
        currentSession.bye();
    } else {
        currentSession.cancel();
    }
}

//Backspace logic
function backspace() {
    display.value = display.value.slice(0, -1);
}

//Audio handling
function setupRemoteAudio() {
    const remoteAudioElement = document.getElementById('remoteAudio');
    const remoteStream = new MediaStream();

    const receivers = currentSession.sessionDescriptionHandler.peerConnection.getReceivers();
    receivers.forEach((receiver) => {
        if (receiver.track) {
            remoteStream.addTrack(receiver.track);
        }
    });

    remoteAudioElement.srcObject = remoteStream;
    remoteAudioElement.play();
}
