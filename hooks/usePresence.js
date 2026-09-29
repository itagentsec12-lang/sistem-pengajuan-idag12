// hooks/usePresence.js
import { useEffect, useState } from 'react';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { database } from '@/lib/firebase';

export function usePresence(currentUserEmail, currentTab = 'dashboard') {
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    if (!currentUserEmail || !database) return;

    // Bersihkan email untuk Key Firebase
    const cleanKey = currentUserEmail.replace(/[.#$[\]]/g, '_');
    
    // Ganti 'presence' menjadi 'status' sesuai dengan Firebase kamu
    const userRef = ref(database, `status/${cleanKey}`);
    const connectedRef = ref(database, '.info/connected');

    const unsubscribeConnected = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        // Hapus data saat disconnected/logout
        onDisconnect(userRef).remove();

        // Update status online
        set(userRef, {
          email: currentUserEmail,
          currentTab: currentTab,
          lastSeen: serverTimestamp(),
          isOnline: true
        });
      }
    });

    // Listening ke node 'status'
    const statusRef = ref(database, 'status');
    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      const data = snapshot.val() || {};
      setOnlineUsers(data);
    });

    return () => {
      unsubscribeConnected();
      unsubscribeStatus();
    };
  }, [currentUserEmail, currentTab]);

  return onlineUsers;
}