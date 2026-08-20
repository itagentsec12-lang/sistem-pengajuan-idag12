'use client';

import { useState } from 'react';

export default function Dashboard({ submissions = [], userEmail = '' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSheet, setSelectedSheet] = useState('ALL');
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Daftar Email Admin / Super User yang BISA melihat semua data
  const adminEmails = [
    'helmiardifebriansyah26@gmail.com',
    'christian.bigbanten@gmail.com',
    'intantrisnawatiii@gmail.com',
    'dbidagent12@gmail.com',
    'alfin.rama@raharja.info',
    'jet.sigit@gmail.com'
  ];

  // Mengecek apakah pengguna yang login adalah Admin
  const isAdmin = adminEmails.includes(userEmail?.toLowerCase().trim());

  // 1. Filter Akses Data (Admin melihat semua, User biasa hanya data miliknya sendiri)
  const accessibleSubmissions = submissions.filter((item) => {
    if (isAdmin) return true; // Super User bisa lihat SEMUA
    return (item.email || '').toLowerCase().trim() === userEmail?.toLowerCase().trim(); // User biasa hanya data sendiri
  });

  // 2. Filter Pencarian dan Tanggal Sheet dari data yang memiliki akses
  const filteredData = accessibleSubmissions.filter((item) => {
    const matchesSearch =
      (item.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nama_dp || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.no_ktp || '').includes(searchTerm);

    const matchesSheet = selectedSheet === 'ALL' || item.sheet_date === selectedSheet;

    return matchesSearch && matchesSheet;
  });

  const availableSheets = Array.from(new Set(accessibleSubmissions.map(s => s.sheet_date || 'Utama')));
  const totalPengajuan = filteredData.length;

  return (
    <div className="space-y-6">
      {/* Banner Hak Akses Dashboard */}
      <div className={`p-4 rounded-xl border shadow-sm flex items-center justify-between ${isAdmin ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
        <div>
          <h4 className="font-bold text-sm">
            {isAdmin ? '👑 Mode Super Admin / Manager' : '👤 Mode User / Inputor'}
          </h4>
          <p className="text-xs text-gray-600 mt-0.5">
            {isAdmin 
              ? `Menampilkan seluruh data dari semua pengguna (Logged as: ${userEmail})` 
              : `Menampilkan hanya data pengajuan dari email Anda (${userEmail})`}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase ${isAdmin ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
          {isAdmin ? 'Akses Penuh' : 'Akses Terbatas'}
        </span>
      </div>

      {/* Ringkasan & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="bg-white p-4 rounded-xl border shadow-sm w-full md:w-64">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Data Ditampilkan</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalPengajuan} Data</h3>
        </div>

        <div className="bg-white p-3 rounded-xl border shadow-sm flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Cari Nama, DP, NIK..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 p-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Sheet / Tanggal:</label>
            <select
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
              className="w-full sm:w-auto p-2 border rounded-lg text-xs outline-none bg-white"
            >
              <option value="ALL">Semua Tanggal</option>
              {availableSheets.map((sheet, index) => (
                <option key={index} value={sheet}>{sheet}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Dashboard */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3">Tanggal Pengajuan</th>
                <th className="p-3">RM</th>
                <th className="p-3">DP</th>
                <th className="p-3">Nama Lengkap</th>
                <th className="p-3">Posisi</th>
                <th className="p-3 text-center">Check HR</th>
                <th className="p-3 text-center">Check IT</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-400">
                    Tidak ada data pengajuan yang ditemukan untuk email ini.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/80 transition">
                    <td className="p-3 font-semibold text-blue-600 whitespace-nowrap">
                      {item.sheet_date || '-'}
                    </td>
                    <td className="p-3 font-medium text-gray-700">{item.rm || '-'}</td>
                    <td className="p-3 text-gray-700">{item.nama_dp || '-'}</td>
                    <td className="p-3 font-bold text-gray-800">{item.nama_lengkap || '-'}</td>
                    <td className="p-3 text-gray-600">{item.posisi || '-'}</td>
                    
                    {/* Status Check HR */}
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        (item.check_hr || '').toUpperCase() === 'APPROVED' || (item.check_hr || '').toUpperCase() === 'OK'
                          ? 'bg-emerald-100 text-emerald-700'
                          : (item.check_hr || '').toUpperCase() === 'REJECTED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.check_hr || 'PENDING'}
                      </span>
                    </td>

                    {/* Status Check IT */}
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        (item.check_it || '').toUpperCase() === 'APPROVED' || (item.check_it || '').toUpperCase() === 'OK'
                          ? 'bg-emerald-100 text-emerald-700'
                          : (item.check_it || '').toUpperCase() === 'REJECTED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.check_it || 'PENDING'}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedDetail(item)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg font-semibold text-[11px] hover:bg-blue-100"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Lengkap */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Detail Lengkap Pengajuan</h3>
                <p className="text-xs text-gray-500">Email Pemohon: {selectedDetail.email}</p>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-gray-400">Tanggal Sheet:</span> <p className="font-semibold text-blue-600">{selectedDetail.sheet_date}</p></div>
              <div><span className="text-gray-400">RM:</span> <p className="font-medium">{selectedDetail.rm}</p></div>
              <div><span className="text-gray-400">Nama DP/DC:</span> <p className="font-medium">{selectedDetail.nama_dp}</p></div>
              <div><span className="text-gray-400">TLC:</span> <p className="font-medium">{selectedDetail.tlc}</p></div>
              <div><span className="text-gray-400">Kode ke 3:</span> <p className="font-medium">{selectedDetail.kode_ke3}</p></div>
              <div><span className="text-gray-400">DP Ownerless:</span> <p className="font-medium">{selectedDetail.dp_ownerless}</p></div>
              <div><span className="text-gray-400">DP Mitra:</span> <p className="font-medium">{selectedDetail.dp_mitra}</p></div>
              <div><span className="text-gray-400">No Rekening:</span> <p className="font-medium">{selectedDetail.no_rekening}</p></div>
              <div><span className="text-gray-400">POD NPWP:</span> <p className="font-medium">{selectedDetail.pod_npwp || '-'}</p></div>
              <div><span className="text-gray-400">Posisi:</span> <p className="font-medium">{selectedDetail.posisi}</p></div>
              <div><span className="text-gray-400">Paket Besar:</span> <p className="font-medium">{selectedDetail.paket_besar || '-'}</p></div>
              <div><span className="text-gray-400">Nama Lengkap:</span> <p className="font-medium">{selectedDetail.nama_lengkap}</p></div>
              <div><span className="text-gray-400">No KTP:</span> <p className="font-medium">{selectedDetail.no_ktp}</p></div>
              <div><span className="text-gray-400">No HP:</span> <p className="font-medium">{selectedDetail.nohp}</p></div>
              <div><span className="text-gray-400">Check HR:</span> <p className="font-semibold text-emerald-600">{selectedDetail.check_hr || 'PENDING'}</p></div>
              <div><span className="text-gray-400">Check IT:</span> <p className="font-semibold text-emerald-600">{selectedDetail.check_it || 'PENDING'}</p></div>
              <div className="col-span-2"><span className="text-gray-400">Link KTP:</span> <p className="font-medium break-all text-blue-600">{selectedDetail.link_ktp}</p></div>
              <div><span className="text-gray-400">Alamat:</span> <p className="font-medium">{selectedDetail.alamat}</p></div>
              <div><span className="text-gray-400">Keterangan:</span> <p className="font-medium">{selectedDetail.keterangan || '-'}</p></div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button onClick={() => setSelectedDetail(null)} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}