chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'block-websites') {
    addWebsiteSocket(message.websites);
  }
  if(message.ping) { sendResponse({pong: true}); return; }
  return true
});

function addWebsiteSocket(websites) {
  if (websites.length > 0) {
    const blockedWebsites = [];
    const websiteUrls = websites.map((website) => website.url);
    blockedWebsites.push(...websiteUrls);
    chrome.storage.sync.set({ blockedWebsites }, function () {
      // Update the UI with the new list of blocked websites
      chrome.runtime.sendMessage({ type: 'update-ui' });
    });
  }
}

chrome.storage.sync.get(['blockedWebsites'], function (result) {
  const blockedWebsites = result.blockedWebsites || [];

  if (
    blockedWebsites.some((website) => window.location.href.includes(website))
  ) {
    // Redirect or block the website
    window.location.href = 'https://docs.nestjs.com/';
  }
});
