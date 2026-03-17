// Basic background service worker for Manifest V3
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received:', request);

  if (request.method === 'eth_requestAccounts') {
    // In a real app, this would open a popup
    // For now, return a dummy account for demo
    sendResponse({ result: ['0x1234567890123456789012345678901234567890'] });
  } else if (request.method === 'eth_accounts') {
    sendResponse({ result: [] });
  } else {
    sendResponse({ error: 'Method not implemented' });
  }

  return true; // Keep channel open
});
