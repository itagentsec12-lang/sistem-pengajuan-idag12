export function getActiveSession() {
  const now = new Date();
  
  // Konversi ke Waktu Indonesia Barat (WIB)
  const options = { timeZone: 'Asia/Jakarta', hour12: false };
  const formatter = new Intl.DateTimeFormat('en-US', {
    ...options,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  });
  
  const formatted = formatter.format(now);
  const [hourStr, minuteStr] = formatted.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const totalMinutes = hour * 60 + minute;

  // Konversi Batas Waktu Menjadi Menit
  const time0900 = 9 * 60;   // 09:00 WIB
  const time1100 = 11 * 60;  // 11:00 WIB
  const time1300 = 13 * 60;  // 13:00 WIB
  const time1500 = 15 * 60;  // 15:00 WIB

  // Sesi 1: 15:00 H-1 s/d 09:00 Hari H
  if (totalMinutes >= time1500 || totalMinutes <= time0900) {
    return { isActive: true, sessionName: "Sesi 1", message: "Sesi 1 Berlangsung (15:00 H-1 s/d 09:00 Hari H)" };
  }
  
  // Sesi 2: 11:00 s/d 13:00 WIB
  if (totalMinutes >= time1100 && totalMinutes <= time1300) {
    return { isActive: true, sessionName: "Sesi 2", message: "Sesi 2 Berlangsung (11:00 s/d 13:00 WIB)" };
  }

  // Luar Jam Operasional
  return { 
    isActive: false, 
    sessionName: "Tutup", 
    message: "Sistem Input Ditutup. Buka kembali di Sesi berikutnya (11:00 / 15:00 WIB)." 
  };
}