/* 신화미트 주문방 — 백그라운드 푸시 수신기 (firebase-messaging-sw.js) v1.0
   브라우저가 완전히 꺼져 있어도 폰 운영체제가 이 워커를 깨워 알림을 띄웁니다.
   chat.html이 등록할 때 주소 뒤에 ?sid=...&aid=... 로 설정을 넘겨줍니다. */
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

/* 데이터 메시지를 받아 직접 알림 표시 (진동 포함) */
messaging.onBackgroundMessage(function (payload) {
  const d = (payload && payload.data) || {};
  const title = d.title || '신화미트 주문방';
  return self.registration.showNotification(title, {
    body: d.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [170, 80, 170],
    tag: 'shinwha-chat',
    renotify: true,
    data: { url: d.url || './chat.html' }
  });
});

/* 알림을 누르면 주문방 열기 (이미 열려 있으면 그 탭으로) */
self.addEventListener('notificationclick', function (ev) {
  ev.notification.close();
  const url = (ev.notification.data && ev.notification.data.url) || './chat.html';
  ev.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (const c of list) {
        if (c.url.indexOf('chat.html') >= 0 && 'focus' in c) return c.focus();
      }
      return clients.openWindow(url);
    })
  );
});
