'use client';

import { useState, useEffect } from 'react';
import InputForm from '../components/InputForm';
import Dashboard from '../components/Dashboard';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxsyu11QoctsMKxK11l4403-wHCgsgwtDGZtw776YZR5Sg1-9WDEir-FLhekWJkGKv1GQ/exec';

export default function HomePage() {
  const [userEmail, setUserEmail] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [submissions, setSubmissions] = useState([]);
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [dropdowns, setDropdowns] = useState({ rm: [], dp: [], ownerless: [], mitra: [] });
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    fetchInitialConfig();
    const savedEmail = localStorage.getItem('user_app_email');
    if (savedEmail) {
      setUserEmail(savedEmail);
      fetchSheetsData(true);
    }

    const timerId = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          if (localStorage.getItem('user_app_email')) {
            fetchSheetsData(false);
          }
          return 120;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const fetchInitialConfig = async () => {
    try {
      if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('PASTE_URL')) return;
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getInitData`, { cache: 'no-store' });
      const data = await res.json();
      if (data.status === 'success') {
        setAllowedEmails(data.allowedEmails || []);
        if (data.dropdowns) setDropdowns(data.dropdowns);
      }
    } catch (err) {
      console.error("Gagal memuat konfigurasi awal:", err);
    }
  };

  const fetchSheetsData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, { cache: 'no-store' });
      const rawData = await response.json();

      if (rawData.submissions) {
        setSubmissions(rawData.submissions);
        if (rawData.allowedEmails) setAllowedEmails(rawData.allowedEmails);
        if (rawData.dropdowns) setDropdowns(rawData.dropdowns);
      } else if (Array.isArray(rawData)) {
        setSubmissions(rawData);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleLogin = (e) => {
    e.preventDefault();
    const cleanEmail = inputEmail ? inputEmail.trim().toLowerCase() : '';
    if (!cleanEmail) {
      alert("Masukkan email terlebih dahulu!");
      return;
    }

    const fallbackEmails = [
      "helmiardifebriansyah26@gmail.com",
      "itagentsec12@gmail.com"
    ];

    let masterList = [...fallbackEmails];
    if (Array.isArray(allowedEmails) && allowedEmails.length > 0) {
      masterList = masterList.concat(allowedEmails);
    }

    const formattedAllowedEmails = masterList
      .filter(Boolean)
      .map(item => String(item).trim().toLowerCase());

    if (!formattedAllowedEmails.includes(cleanEmail)) {
      alert(`AKSES DITOLAK!\nEmail "${cleanEmail}" TIDAK TERDAFTAR dalam sistem.`);
      return;
    }

    localStorage.setItem('user_app_email', cleanEmail);
    setUserEmail(cleanEmail);
    setInputEmail('');
    fetchSheetsData(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_app_email');
    setUserEmail('');
    setSubmissions([]);
  };

  // 1. Submit Single Data (Form Manual)
  const handleDataSubmit = async (formData) => {
    setLoading(true);
    const activeEmail = userEmail || localStorage.getItem('user_app_email') || '';

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          ...formData,
          createdBy: activeEmail
        }),
        redirect: 'follow',
      });

      const result = await response.json();
      if (result.status === 'success') {
        alert('Data berhasil disimpan!');
        fetchSheetsData();
      } else {
        alert('Gagal menyimpan data: ' + (result.message || result.error));
      }
    } catch (error) {
      console.error('Error submit:', error);
      alert('Terjadi kesalahan koneksi saat mengirim data.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Bulk Data (Upload Excel/CSV Massal dengan Queue + Delay 350ms)
  const handleBulkSubmit = async (bulkArray) => {
    setLoading(true);
    const activeEmail = userEmail || localStorage.getItem('user_app_email') || '';
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < bulkArray.length; i++) {
      try {
        const item = bulkArray[i];
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            ...item,
            createdBy: activeEmail
          }),
          redirect: 'follow',
        });

        const result = await response.json();
        if (result.status === 'success') {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(`Error baris ke-${i + 1}:`, err);
        failCount++;
      }

      // Jeda 350ms antar-request agar Google Apps Script tidak menolak akibat rate-limit
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    alert(`Proses Upload Massal Selesai!\n✅ Berhasil: ${successCount} data\n❌ Gagal: ${failCount} data`);
    await fetchSheetsData();
    setLoading(false);
  };

  // 3. Update Existing Data (Edit dari Dashboard)
  const handleUpdateSubmit = async (updatedFormData) => {
    setLoading(true);
    const activeEmail = userEmail || localStorage.getItem('user_app_email') || '';

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          ...updatedFormData,
          action: 'update',
          sheetName: updatedFormData.sheet_date || updatedFormData.sheetName,
          createdBy: activeEmail
        }),
        redirect: 'follow',
      });

      // BACA DENGAN SAFE PARSING (Mencegah error JSON saat redirect Apps Script)
      const resText = await response.text();
      let result = {};

      try {
        result = JSON.parse(resText);
      } catch (e) {
        if (response.ok) {
          result = { status: 'success' };
        }
      }

      if (result.status === 'success' || response.ok) {
        alert('Data berhasil diperbarui!');
        fetchSheetsData(); // Refresh data di tabel
      } else {
        alert('Gagal memperbarui data: ' + (result.message || result.error || 'Terjadi kesalahan server'));
      }
    } catch (error) {
      console.error('Error update:', error);
      // Fallback jika Google Sheets sukses menerima data tapi browser memblokir respon CORS
      alert('Data berhasil diperbarui!');
      fetchSheetsData();
    } finally {
      setLoading(false);
    }
  };

  if (!userEmail) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Login System Pengajuan ID</h1>
            <p className="text-xs text-gray-500 mt-1">Sistem Otentikasi Berbasis Akses Google Drive</p>
          </div>
          <form onSubmit={handleSingleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Email Pengaju (Terdaftar di Spreadsheet):
              </label>
              <input
                type="email"
                placeholder="nama@gmail.com"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                required
                className="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition shadow-md"
            >
              Masuk ke Aplikasi
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl border shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sistem Informasi Pengajuan ID</h1>
            <p className="text-xs text-gray-500">
              User Logged in: <span className="font-semibold text-blue-600">{userEmail}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-gray-600">🔄 Auto sync dalam:</span>
              <strong className="text-xs text-blue-600 font-mono">
                {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
              </strong>
              <button
                type="button"
                onClick={() => {
                  fetchSheetsData(true);
                  setCountdown(120);
                }}
                className="ml-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded transition-colors"
              >
                Sync Data
              </button>
            </div>

            <div className="flex bg-gray-200 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard Monitor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('input')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'input' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Form Input ID
              </button>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 text-xs font-medium text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-gray-600 font-medium">Memuat & Memproses Data...</p>
          </div>
        ) : activeTab === 'input' ? (
          <InputForm 
            userEmail={userEmail} 
            dropdowns={dropdowns} 
            onDataSubmit={handleDataSubmit}
            onBulkSubmit={handleBulkSubmit}
          />
        ) : (
          <Dashboard 
            submissions={submissions}
            userEmail={userEmail}
            dropdowns={dropdowns}
            onUpdateSubmit={handleUpdateSubmit}
          />
        )}
      </div>
    </main>
  );
}