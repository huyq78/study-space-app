chrome.storage.sync.set({ userId: null });

chrome.storage.sync.set({ blockedWebsites: [] }, function () {
  // Update the UI with the new list of blocked websites
  chrome.runtime.sendMessage({ type: 'update-ui' });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request?.action === 'updateBlockedWebsites') {
    chrome.storage.sync.set({ blockedWebsites: request.blockedWebsites });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'popupConnected') {
    // Example: Notify the background script that the popup is connected
    console.log('Popup connected!');
  }
});

let userId;

chrome.runtime.onMessageExternal.addListener(function (
  request,
  sender,
  sendResponse
) {
  if (request?.type === 'save-user-id') {
    const root = request.localStorage['persist:root'];
    let parsedRoot, user;
    root && (parsedRoot = JSON.parse(root));
    parsedRoot && (user = JSON.parse(parsedRoot?.user));
    if (!root || !user?.currentUser?.id) {
      chrome.storage.sync.set({ userId: null, blockedWebsites: [] });
    } else {
      console.log('Logged in user: ', user?.currentUser?.id);
      userId = user?.currentUser?.id;
      chrome.storage.sync.set({ userId: userId });

      const blocker = JSON.parse(parsedRoot?.blocker);
      console.log('Blocker: ', blocker);
      const websites = blocker?.website;
      console.log('Blocked website: ', websites);
      const blockedWebsites = websites
        ?.filter((w) => w?.status === 'blocked')
        ?.map((w) => {
          return {
            name: w.name,
            url: w.url,
          };
        });
      chrome.storage.sync.set({ blockedWebsites: blockedWebsites });
      sendToPopup({ type: 'block-websites', websites: blockedWebsites });
      sendToContentScripts({
        type: 'block-websites',
        websites: blockedWebsites,
      });
    }
  } else if (request?.type === 'first-update-blockers') {
    const websites = request?.websites;
    console.log('first-update-blockers: ', websites);
    const blockedWebsites = websites
      ?.filter((w) => w?.status === 'blocked')
      ?.map((w) => {
        return {
          name: w.name,
          url: w.url,
        };
      });
    chrome.storage.sync.set({ blockedWebsites: blockedWebsites });
    sendToPopup({ type: 'block-websites', websites: blockedWebsites });
    sendToContentScripts({
      type: 'block-websites',
      websites: blockedWebsites,
    });
  }
});

// socket implementation
let socket;

// Connect WebSocket automatically
connectWebSocket();

function connectWebSocket() {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    socket = new WebSocket('ws://localhost:8888');

    socket.onopen = (event) => {
      console.log('WebSocket connected');
    };

    socket.onmessage = async (event) => {
      console.log('Received event:', event);
      const message = JSON.parse(await event.data);
      console.log('Received message:', message);

      // Handle the specific event you're interested in
      console.log(message.userId);
      console.log(userId);
      if (message.action === 'block-websites' && message.userId === userId) {
        sendToPopup({ type: 'block-websites', websites: message.websites });
        sendToContentScripts({
          type: 'block-websites',
          websites: message.websites,
        });
      }
    };

    socket.onclose = (event) => {
      console.log('WebSocket closed');
    };
  }
}

function sendToPopup(message) {
  // Send a message to the popup script
  console.log(message);
  chrome.runtime.sendMessage(message);
}

function sendToContentScripts(message) {
  // Send a message to all content scripts
  // chrome.tabs.query({}, (tabs) => {
  //   tabs.forEach((tab) => {
  //     chrome.tabs.sendMessage(tab.id, message);
  //   });
  // });
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    ensureSendMessage(tabs[0].id, message);
  });
}

function ensureSendMessage(tabId, message, callback) {
  chrome.tabs.sendMessage(tabId, { ping: true }, function (response) {
    if (response && response.pong) {
      // Content script ready
      chrome.tabs.sendMessage(tabId, message, callback);
    } else {
      // No listener on the other end
      chrome.tabs.executeScript(tabId, { file: 'content.js' }, function () {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          throw Error('Unable to inject script into tab ' + tabId);
        }
        // OK, now it's injected and ready
        chrome.tabs.sendMessage(tabId, message, callback);
      });
    }
  });
}

// {
//   "action": "block-websites",
//   "websites": [
//     {
//       "name": "Facebook",
//       "url": "https://www.facebook.com/"
//     }
//   ]
// }
