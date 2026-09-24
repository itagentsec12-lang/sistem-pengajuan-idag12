'use client';

import { useState, useMemo } from 'react';
import InputForm from './InputForm';

export default function Dashboard({ submissions = [], userEmail = '', isMonitor = false, onUpdateSubmit, dropdowns }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSheet, setSelectedSheet] = useState('ALL');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedEdit, setSelectedEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Daftar Email Admin / Super User yang BISA melihat semua data
  const adminEmails = [
    'helmiardifebriansyah26@gmail.com',
    'christian.bigbanten@gmail.com',
    'intantrisnawatiii@gmail.com',
    'dbidagent12@gmail.com',
    'alfin.rama@raharja.info',
    'reginachristals@gmail.com',
    'jet.sigit@gmail.com'
  ];

  // Mengecek apakah pengguna yang login adalah Admin
  const isAdmin = adminEmails.includes(userEmail?.toLowerCase().trim());
  const isMonitorUser = isAdmin || isMonitor;

  // 1. Filter Akses Data
  const accessibleSubmissions = submissions.filter((item) => {
    if (isMonitorUser) return true;
    const pembuatData = (item.created_by || item.email || '').toLowerCase().trim();
    const emailLogin = (userEmail || '').toLowerCase().trim();
    return pembuatData === emailLogin; 
  });

  // 2. Filter Pencarian dan Tanggal Sheet
  const filteredData = accessibleSubmissions.filter((item) => {
    const term = (searchTerm || '').toLowerCase().trim();

    const matchesSearch = !term ||
      (item.nama_lengkap || '').toLowerCase().includes(term) ||
      (item.nama_dp || '').toLowerCase().includes(term) ||
      (item.no_ktp || '').includes(term);

    const matchesSheet = selectedSheet === 'ALL' || item.sheet_date === selectedSheet;

    return matchesSearch && matchesSheet;
  });

  // Hitung total halaman
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  // Potong data sesuai halaman aktif
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
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
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-400">
                    Tidak ada data pengajuan yang ditemukan untuk email ini.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
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

                    <td className="p-3 text-center flex justify-center gap-1.5">
                      {(item.check_hr || '').toUpperCase() === 'PENDING' && (item.check_it || '').toUpperCase() === 'PENDING' ? (
                        <button
                          onClick={() => setSelectedEdit(item)}
                          className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg font-semibold hover:bg-amber-100 transition"
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          disabled
                          title="Data sudah diproses, tidak dapat diubah"
                          className="px-3 py-1 bg-gray-100 text-gray-400 border border-gray-200 rounded-lg font-semibold cursor-not-allowed"
                        >
                          Edit
                        </button>
                      )}
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

        {/* --- MODERN PAGINATION FOOTER --- */}
        <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          
          {/* Info Jumlah Data */}
          <div className="font-medium">
            Menampilkan <span className="font-semibold text-slate-800">{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - <span className="font-semibold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="font-semibold text-slate-800">{filteredData.length}</span> data
          </div>

          {/* Control Tombol Halaman */}
          <div className="flex items-center gap-2">
            {/* Tombol Sebelumnya */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:hover:border-slate-200/80 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              <span>Sebelumnya</span>
            </button>

            {/* Indikator Halaman */}
            <div className="px-3 py-1.5 bg-slate-100/80 border border-slate-200/60 rounded-xl font-semibold text-slate-700">
              <span className="text-indigo-600">{currentPage}</span> / <span className="text-slate-500">{totalPages}</span>
            </div>

            {/* Tombol Selanjutnya */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:hover:border-slate-200/80 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
            >
              <span>Selanjutnya</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

        </div>
      </div>

      {/* --- MODAL DETAIL --- */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 text-slate-800">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Detail Lengkap Pengajuan</h3>
                <p className="text-xs text-slate-500">
                  Email Pemohon: <span className="font-semibold text-slate-700">
                    {selectedDetail.email_pemohon || selectedDetail.email || selectedDetail.created_by || selectedDetail.Email || selectedDetail['Email Pemohon'] || '-'}
                  </span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Grid Informasi Detail */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tanggal Sheet</p>
                <p className="font-bold text-indigo-600 mt-0.5">{selectedDetail.sheet_date || '-'}</p>
              </div>
              
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">RM</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedDetail.rm || '-'}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nama DP/DC</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedDetail.nama_dp || '-'}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">TLC</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedDetail.tlc || '-'}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nama Lengkap</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedDetail.nama_lengkap || '-'}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Posisi</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedDetail.posisi || '-'}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">No KTP</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedDetail.no_ktp || '-'}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">No HP</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedDetail.nohp || '-'}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Check HR</p>
                <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                  selectedDetail.check_hr === 'APPROVE' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                }`}>
                  {selectedDetail.check_hr || 'PENDING'}
                </span>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Check IT</p>
                <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                  selectedDetail.check_it === 'APPROVE' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                }`}>
                  {selectedDetail.check_it || 'PENDING'}
                </span>
              </div>

              <div className="col-span-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Link KTP</p>
                {selectedDetail.link_ktp ? (
                  <a 
                    href={selectedDetail.link_ktp} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline break-all font-medium mt-0.5 inline-block"
                  >
                    {selectedDetail.link_ktp}
                  </a>
                ) : '-'}
              </div>

              <div className="col-span-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Alamat</p>
                <p className="font-medium text-slate-800 mt-0.5">{selectedDetail.alamat || '-'}</p>
              </div>

              <div className="col-span-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Keterangan</p>
                <p className="font-medium text-slate-800 mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">{selectedDetail.keterangan || '-'}</p>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Form Edit */}
      {selectedEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Edit Data Pengajuan ID</h3>
                <p className="text-xs text-gray-500">Perbarui informasi pengajuan sebelum diproses HR/IT</p>
              </div>
              <button 
                onClick={() => setSelectedEdit(null)} 
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <InputForm 
              userEmail={userEmail}
              dropdowns={dropdowns}
              initialData={selectedEdit} 
              onDataSubmit={(updatedFormData) => {
                onUpdateSubmit({ 
                  ...updatedFormData, 
                  action: 'update',
                  rowIndex: selectedEdit.rowIndex || selectedEdit.row,
                  sheetName: selectedEdit.sheet_date || selectedEdit.sheetName 
                });
                setSelectedEdit(null);
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}