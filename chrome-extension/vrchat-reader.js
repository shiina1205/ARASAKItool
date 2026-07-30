const VRCHAT_USER_ID_PATTERN = /^usr_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'ARASAKI_READ_VRCHAT_PROFILE') return false;

  const userId = String(message.userId || '').trim();
  if (!VRCHAT_USER_ID_PATTERN.test(userId)) {
    sendResponse({ok: false, error: 'VRChatユーザーIDが正しくありません。'});
    return false;
  }

  fetch(`/api/1/users/${encodeURIComponent(userId)}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: {'Accept': 'application/json'}
  }).then(async response => {
    if (response.status === 401) {
      throw new Error('ChromeでVRChatへログインしてから、もう一度お試しください。');
    }
    if (!response.ok) throw new Error(`VRChatプロフィールを取得できませんでした（${response.status}）。`);
    const profile = await response.json();
    const displayName = String(profile?.displayName || '').trim();
    if (!displayName) throw new Error('VRChatプロフィールに表示名がありません。');
    sendResponse({ok: true, displayName});
  }).catch(error => {
    sendResponse({ok: false, error: error?.message || 'VRChatプロフィールを取得できませんでした。'});
  });
  return true;
});
