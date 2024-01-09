document.addEventListener('DOMContentLoaded', function () {
  // Load the current list of blocked websites on popup open
  updateUI();

  // Add event listener for the "Add Website" button
  document.getElementById('add-btn').addEventListener('click', function () {
    addWebsite();
  });

  // Add event listener for the "Update Blocked Websites" button
  document.getElementById('update-btn').addEventListener('click', function () {
    updateBlockedWebsites();
  });

  document.getElementById('storage').addEventListener('click', function () {
    chrome.storage.sync.get(['blockedWebsites'], function (result) {
      chrome.extension.getBackgroundPage().console.log(result);
    });
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'update-ui') {
    updateUI();
  }
});

function handleEventName() {
  // Add your logic to handle the "eventName" from the server
  console.log("Handling 'eventName' from the server");
}

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

      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', function () {
        removeWebsite(website);
      });

      listItem.appendChild(removeButton);
      blockedList.appendChild(listItem);
    });
  });
}

function addWebsite() {
  // Get the new website from the input field
  const newWebsiteInput = document.getElementById('blocked-websites-input');
  const newWebsite = newWebsiteInput.value.trim();

  if (newWebsite) {
    // Add the new website to the list in Chrome storage
    chrome.storage.sync.get(['blockedWebsites'], function (result) {
      const blockedWebsites = result.blockedWebsites || [];
      blockedWebsites.push(newWebsite);

      chrome.storage.sync.set({ blockedWebsites }, function () {
        // Update the UI with the new list of blocked websites
        updateUI();
      });

      // Clear the input field
      newWebsiteInput.value = '';
    });
  }
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
