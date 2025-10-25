import { useEffect } from "react";
import { setPublicKey } from "../notification";

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

        // Get VAPID public key from server
        const response = await fetch(`/vapid-public-key`);
        const { publicKey } = await response.json();
        setPublicKey(publicKey);
      } catch (error) {
        console.error("Error subscribing to push:", error);
      }
    };

    subscribeToPush();
  }, []);
};

export default usePushNotification;
