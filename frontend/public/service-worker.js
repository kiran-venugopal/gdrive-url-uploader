// Service Worker - handles push notifications
self.addEventListener("push", (event) => {
  console.log("Push received:", event);

  const data = event.data
    ? event.data.json()
    : {
        title: "New Notification",
        body: "You have a new message",
      };

  const options = {
    body: data.body,
    icon: data.icon || "/favicon.svg",
    data: {
      url: data.url || "/",
    },
    vibrate: [200, 100, 200],
    actions: [
      { action: "open", title: "Open" },
      { action: "close", title: "Close" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open") {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
