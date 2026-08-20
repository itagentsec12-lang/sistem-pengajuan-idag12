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
      fetchSheetsData(true); // Fetch awal saat halaman pertama kali dibuka
    }

    const timerId = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          // Jika hitungan mencapai 0, trigger refresh data dan reset detik ke 120
          if (localStorage.getItem('user_app_email')) {
            fetchSheetsData(false);
          }
          return 120; // Reset ke 2 menit lagi
        }
        return prevCount - 1;
      });
    }, 1000); // Jalan setiap 1 detik

    return () => clearInterval(timerId);
  }, []);

  const fetchInitialConfig = async () => {
    try {
      if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('PASTE_URL')) return;
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getInitData`);
      const data = await res.json();
      if (data.status === 'success') {
        setAllowedEmails(data.allowedEmails || []);
        setDropdowns(data.dropdowns || { dp: [], ownerless: [], mitra: [], rm: [] });
      }
    } catch (err) {
      console.error("Gagal memuat konfigurasi awal:", err);
    }
  };

  const fetchSheetsData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      const rawData = await response.json();

      if (rawData.submissions) {
        setSubmissions(rawData.submissions);
        if (rawData.dropdowns && setDropdowns) {
          setDropdowns(rawData.dropdowns);
        }
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
    if (inputEmail.trim()) {
      localStorage.setItem('user_app_email', inputEmail.trim());
      setUserEmail(inputEmail.trim());
      fetchSheetsData();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_app_email');
    setUserEmail('');
    setSubmissions([]);
  };

  // Fungsi untuk menangani submission dari Form Input
  const handleDataSubmit = async (formData) => {
    setLoading(true);
    try {
      // BAGIAN FETCH DENGAN REDIRECT: 'FOLLOW'
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(formData),
        redirect: 'follow', // <-- TAMBAHKAN BARIS INI
      });

      const result = await response.json();

      if (result.status === 'success') {
        alert('Data berhasil disimpan!');
        fetchSheetsData(); // Refresh data tabel
      } else {
        alert('Gagal menyimpan data: ' + result.error);
      }
    } catch (error) {
      console.error('Error submit:', error);
      alert('Terjadi kesalahan koneksi saat mengirim data.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Download Template CSV Sesuai Kolom Baru
const handleDownloadTemplate = () => {
  const headers = [
    "rm", "nama_dp", "tlc", "kode_ke3", "dp_ownerless", "dp_mitra",
    "no_rekening", "pod_npwp", "posisi", "paket_besar", "nama_lengkap",
    "no_ktp", "nohp", "email", "link_ktp", "alamat", "nama_merekomendasikan",
    "nik_merekomendasikan", "nama_pic", "koordinator", "posisi_merekomendasikan", "keterangan"
  ];
  
  const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "template_pengajuan_id.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 2. Fungsi Upload & Parse File CSV
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    const text = event.target.result;
    const lines = text.split("\n").filter(line => line.trim() !== "");
    if (lines.length <= 1) {
      alert("File CSV kosong atau hanya berisi header.");
      return;
    }

    // Ambil data tanpa header
    const rows = lines.slice(1);
    const parsedData = rows.map(row => {
      const cols = row.split(",").map(col => col.trim().replace(/^"(.*)"$/, '$1'));
      return {
        rm: cols[0] || '',
        nama_dp: cols[1] || '',
        tlc: cols[2] || '',
        kode_ke3: cols[3] || '',
        dp_ownerless: cols[4] || '',
        dp_mitra: cols[5] || '',
        no_rekening: cols[6] || '',
        pod_npwp: cols[7] || '',
        posisi: cols[8] || '',
        paket_besar: cols[9] || '',
        nama_lengkap: cols[10] || '',
        no_ktp: cols[11] || '',
        nohp: cols[12] || '',
        email: cols[13] || '',
        link_ktp: cols[14] || '',
        alamat: cols[15] || '',
        nama_merekomendasikan: cols[16] || '',
        nik_merekomendasikan: cols[17] || '',
        nama_pic: cols[18] || '',
        koordinator: cols[19] || '',
        posisi_merekomendasikan: cols[20] || '',
        keterangan: cols[21] || ''
      };
    });

    // Kirim data per baris atau masukan ke state pengiriman
    if (confirm(`Apakah Anda yakin ingin mengunggah ${parsedData.length} data pengajuan?`)) {
      setLoading(true);
      try {
        for (const item of parsedData) {
          await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(item),
            redirect: 'follow',
          });
        }
        alert("Semua data CSV berhasil diimport!");
        fetchSheetsData();
      } catch (err) {
        alert("Gagal mengunggah beberapa atau seluruh data CSV.");
      } finally {
        setLoading(false);
      }
    }
  };
  reader.readAsText(file);
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
          {/* INDIKATOR COUNTDOWN & SYNC DATA */}
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

          {/* TAB NAVIGASI */}
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

          {/* TOMBOL LOGOUT */}
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
            <p className="text-sm text-gray-600 font-medium">Memuat data...</p>
          </div>
        ) : activeTab === 'input' ? (
          <InputForm userEmail={userEmail} dropdowns={dropdowns} onDataSubmit={handleDataSubmit} />
        ) : (
          <Dashboard 
            submissions={submissions}
            userEmail={userEmail} />
        )}
      </div>
    </main>
  );
}