/* 신화미트 주문방 — 백그라운드 푸시 수신기 (firebase-messaging-sw.js) v1.1
   v1.1: 알림마다 고유 태그 → 밀린 수만큼 쌓임(이전 알림을 덮어쓰지 않음),
         설치 앱 아이콘에 숫자 배지(알림 개수), 알림 클릭 시 해당 방으로 열기·배지 정리 */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const q = new URLSearchParams(self.location.search);
firebase.initializeApp({
  apiKey: q.get('key') || '',
  projectId: q.get('pid') || 'shinwha-note',
  messagingSenderId: q.get('sid') || '',
  appId: q.get('aid') || ''
});
const messaging = firebase.messaging();

async function updateBadge() {
  try {
    const list = await self.registration.getNotifications();
    if ('setAppBadge' in self.navigator) {
      if (list.length) await self.navigator.setAppBadge(list.length);
      else await self.navigator.clearAppBadge();
    }
  } catch (e) {}
}

messaging.onBackgroundMessage(function (payload) {
  const d = (payload && payload.data) || {};
  const title = d.title || '신화미트 주문방';
  return self.registration.showNotification(title, {
    body: d.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [170, 80, 170],
    tag: 'shinwha-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),   // 고유 태그 → 쌓임
    timestamp: Date.now(),
    data: { url: d.url || './chat.html' }
  }).then(updateBadge);
});

self.addEventListener('notificationclick', function (ev) {
  ev.notification.close();
  const url = (ev.notification.data && ev.notification.data.url) || './chat.html';
  ev.waitUntil((async () => {
    await updateBadge();
    const list = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) {
      if (c.url.indexOf('chat.html') >= 0 && 'focus' in c) {
        try { await c.focus(); } catch (e) {}
        try { c.navigate && (url.indexOf('room=') >= 0) && c.navigate(url); } catch (e) {}
        return;
      }
    }
    return clients.openWindow(url);
  })());
});

self.addEventListener('notificationclose', function () { updateBadge(); });
