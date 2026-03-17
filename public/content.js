// This script runs in the context of the web page but has access to chrome.runtime
console.log('BagFi Content Script Loaded');

// Inject the provider script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('provider.js');
script.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Handle messages from the page
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'BAGFI_REQUEST') {
    chrome.runtime.sendMessage(event.data.payload, (response) => {
      window.postMessage({
        type: 'BAGFI_RESPONSE',
        id: event.data.payload.method,
        result: response?.result,
        error: response?.error
      }, '*');
    });
  }
});
