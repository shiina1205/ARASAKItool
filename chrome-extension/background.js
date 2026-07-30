const VRCHAT_USER_ID_PATTERN = /^usr_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeVrchatRequest(message) {
  const userId = String(message?.userId || '').trim();
  if (!VRCHAT_USER_ID_PATTERN.test(userId)) {
    throw new Error('VRChatプロフィールURLからユーザーIDを確認できませんでした。');
  }
  return userId;
}

function waitForTabComplete(tabId, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error('VRChatプロフィールの読み込みがタイムアウトしました。'));
    }, timeoutMs);
    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId !== tabId || changeInfo.status !== 'complete') return;
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function readVrchatDisplayName(message) {
  const userId = normalizeVrchatRequest(message);
  const tab = await chrome.tabs.create({
    url: `https://vrchat.com/home/user/${encodeURIComponent(userId)}`,
    active: false
  });
  if (!tab.id) throw new Error('VRChat確認用タブを開けませんでした。');

  try {
    if (tab.status !== 'complete') await waitForTabComplete(tab.id);
    const result = await chrome.tabs.sendMessage(tab.id, {
      type: 'ARASAKI_READ_VRCHAT_PROFILE',
      userId
    });
    if (!result?.ok) throw new Error(result?.error || 'VRChatの表示名を取得できませんでした。');
    return {
      ok: true,
      userId,
      displayName: String(result.displayName || '').trim()
    };
  } finally {
    await chrome.tabs.remove(tab.id).catch(() => {});
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'ARASAKI_LOOKUP_VRCHAT_PROFILE') return false;
  readVrchatDisplayName(message)
    .then(sendResponse)
    .catch(error => sendResponse({
      ok: false,
      error: error?.message || 'VRChatの表示名を取得できませんでした。'
    }));
  return true;
});
