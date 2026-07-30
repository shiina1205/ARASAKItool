const REQUEST_TYPE = 'ARASAKI_VRCHAT_PROFILE_REQUEST';
const RESPONSE_TYPE = 'ARASAKI_VRCHAT_PROFILE_RESPONSE';

window.addEventListener('message', event => {
  if (event.source !== window || event.origin !== window.location.origin) return;
  if (event.data?.type !== REQUEST_TYPE || !event.data.requestId) return;

  const requestId = String(event.data.requestId);
  chrome.runtime.sendMessage({
    type: 'ARASAKI_LOOKUP_VRCHAT_PROFILE',
    userId: event.data.userId
  }).then(result => {
    window.postMessage({type: RESPONSE_TYPE, requestId, ...result}, window.location.origin);
  }).catch(error => {
    window.postMessage({
      type: RESPONSE_TYPE,
      requestId,
      ok: false,
      error: error?.message || 'Chrome拡張機能と通信できませんでした。'
    }, window.location.origin);
  });
});

window.postMessage({type: 'ARASAKI_VRCHAT_EXTENSION_READY'}, window.location.origin);
