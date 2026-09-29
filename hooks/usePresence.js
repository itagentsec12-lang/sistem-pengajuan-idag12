// hooks/usePresence.js
'use client';

import { useEffect, useState } from 'react';
import { database } from '../lib/firebase';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';

export function usePresence(userEmail, activeTab) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!userEmail) return;

    // Bersihkan email dari karakter khusus untuk dijadikan ID unik di Firebase
    const sanitizedEmailKey = userEmail.replace(/[.#$/[\]]/g, '_');
    const userStatusRef = ref(database, `status/${sanitizedEmailKey}`);
    const connectedRef = ref(database, '.info/connected');

    // Listener Koneksi User
    const unsubscribeConnect = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        // Ketika koneksi terputus (browser ditutup/offline), hapus data user ini
        onDisconnect(userStatusRef).remove();

        // Daftarkan user sebagai online saat terhubung
        set(userStatusRef, {
          email: userEmail,
          currentTab: activeTab || 'dashboard',
          lastSeen: serverTimestamp()
        });
      }
    });

    // Perbarui tab aktif yang sedang dibuka oleh user saat ini
    set(ref(database, `status/${sanitizedEmailKey}/currentTab`), activeTab || 'dashboard');

    return () => {
      unsubscribeConnect();
    };
  }, [userEmail, activeTab]);

  // Read Listener untuk Mengambil Semua User yang Sedang Online
  useEffect(() => {
    const allStatusRef = ref(database, 'status');
    const unsubscribeAll = onValue(allStatusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersList = Object.values(data);
        setOnlineUsers(usersList);
      } else {
        setOnlineUsers([]);
      }
    });

    return () => unsubscribeAll();
  }, []);

  return onlineUsers;
}