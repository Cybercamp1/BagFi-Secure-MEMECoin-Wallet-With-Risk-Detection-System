// This script is injected into the web page to provide window.ethereum
(function() {
  const provider = {
    isBagFi: true,
    isMetaMask: false, // Sometimes useful for compatibility
    request: async (args) => {
      console.log('BagFi Provider Request:', args);
      return new Promise((resolve, reject) => {
        // Post message to content script
        window.postMessage({
          type: 'BAGFI_REQUEST',
          payload: args
        }, '*');

        // Listen for response
        const listener = (event) => {
          if (event.data && event.data.type === 'BAGFI_RESPONSE' && event.data.id === args.method) {
            window.removeEventListener('message', listener);
            if (event.data.error) reject(event.data.error);
            else resolve(event.data.result);
          }
        };
        window.addEventListener('message', listener);
      });
    },
    on: (event, callback) => {
      console.log('BagFi Provider On:', event);
    }
  };

  window.ethereum = provider;
  window.dispatchEvent(new Event('ethereum#initialized'));
})();
