document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.sync.get(['userId'], function (result) {
    chrome.extension.getBackgroundPage().console.log(result);
    const userId = result.userId;

    // Check if the user is logged in
    if (userId) {
      document.getElementById(
        'login-message'
      ).textContent = `Logged in as User ID: ${userId}`;

      // Load the current list of blocked websites on popup open
      updateUI();
    } else {
      document.getElementById('login-message').textContent =
        'Please log in to Study Space App.';
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'update-ui') {
    updateUI();
  }
});

function updateUI() {
  // Get the current list of blocked websites from Chrome storage
  chrome.storage.sync.get(['blockedWebsites'], function (result) {
    const blockedWebsites = result.blockedWebsites || [];
    chrome.extension.getBackgroundPage().console.log(result.blockedWebsites);

    // Display the list in the popup UI
    const blockedList = document.getElementById('blocked-list');
    blockedList.innerHTML = '';

    blockedWebsites.forEach((website) => {
      const listItem = document.createElement('li');
      listItem.textContent = website;

      blockedList.appendChild(listItem);
    });
  });
}

function removeWebsite(websiteToRemove) {
  // Remove the specified website from the list in Chrome storage
  chrome.storage.sync.get(['blockedWebsites'], function (result) {
    const blockedWebsites = result.blockedWebsites || [];
    const updatedBlockedWebsites = blockedWebsites.filter(
      (website) => website !== websiteToRemove
    );

    chrome.storage.sync.set(
      { blockedWebsites: updatedBlockedWebsites },
      function () {
        // Update the UI with the updated list of blocked websites
        updateUI();
      }
    );
  });
}

function updateBlockedWebsites() {
  // Get the current list of blocked websites from the UI and send it to the background script
  chrome.storage.sync.get(['blockedWebsites'], function (result) {
    const blockedWebsites = result.blockedWebsites || [];
    chrome.runtime.sendMessage({
      action: 'updateBlockedWebsites',
      blockedWebsites,
    });
  });
}
