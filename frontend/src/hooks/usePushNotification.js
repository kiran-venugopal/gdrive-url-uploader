import { useEffect } from "react";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const usePushNotification = () => {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    const subscribeToPush = async () => {
      try {
        // Request notification permission
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          alert("Notification permission denied");
          return;
        }

        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;

        // Get VAPID public key from server
        const response = await fetch(`/vapid-public-key`);
        const { publicKey } = await response.json();

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        // Send subscription to server
        await fetch("/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        });

        console.log("Subscribed to push notifications");
      } catch (error) {
        console.error("Error subscribing to push:", error);
      }
    };

    subscribeToPush();
  }, []);
};

export default usePushNotification;
