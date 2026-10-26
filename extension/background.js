chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.id === chrome.runtime.id && message?.type === 'mongbo-open-studio') {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  }
});
