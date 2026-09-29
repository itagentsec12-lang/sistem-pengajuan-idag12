'use client';

import { useState, useMemo } from 'react';
import InputForm from './InputForm';
import { usePresence } from '../hooks/usePresence';

export default function Dashboard({ submissions = [], userEmail = '', isMonitor = false, onUpdateSubmit, dropdowns }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSheet, setSelectedSheet] = useState('ALL');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedEdit, setSelectedEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'hr_approval', 'it_approval'
  const [updatingId, setUpdatingId] = useState(null);
  
  const itemsPerPage = 10;

  // 1. Daftar Akses Role Email
  const adminEmails = [
    'helmiardifebriansyah26@gmail.com',
    'christian.bigbanten@gmail.com',
    'intantrisnawatiii@gmail.com',
    'dbidagent12@gmail.com',
    'alfin.rama@raharja.info',
    'reginachristals@gmail.com',
    'jet.sigit@gmail.com'
  ];

  const hrEmails = [
    'hr.banten@express.com',
    'intantrisnawatiii@gmail.com'
  ];

  const itEmails = [
    'jet.sigit@gmail.com',
    'itagentsec12@gmail.com'
  ];

  const userEmailClean = String(userEmail || '').toLowerCase().trim();
  const isAdmin = adminEmails.map(e => e.toLowerCase()).includes(userEmailClean);
  const isHR = isAdmin || hrEmails.map(e => e.toLowerCase()).includes(userEmailClean);
  const isIT = isAdmin || itEmails.map(e => e.toLowerCase()).includes(userEmailClean);
  const isMonitorUser = isAdmin || isMonitor;

  // Realtime Presence Hook (Hanya aktif memantau)
  const onlineUsers = usePresence(userEmailClean, activeTab);

  // 2. Filter Data Akses Utama
  const accessibleSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      if (isMonitorUser || isHR || isIT) return true; 
      const pembuatData = (item.created_by || item.email || '').toLowerCase().trim();
      return pembuatData === userEmailClean; 
    });
  }, [submissions, isMonitorUser, isHR, isIT, userEmailClean]);

  // 3. Filter Berdasarkan Tab & Pencarian
  const filteredData = useMemo(() => {
    return accessibleSubmissions.filter((item) => {
      const term = (searchTerm || '').toLowerCase().trim();

      const matchesSearch = !term ||
        (item.nama_lengkap || '').toLowerCase().includes(term) ||
        (item.nama_dp || '').toLowerCase().includes(term) ||
        (item.no_ktp || '').includes(term);

      const matchesSheet = selectedSheet === 'ALL' || item.sheet_date === selectedSheet;

      return matchesSearch && matchesSheet;
    });
  }, [accessibleSubmissions, searchTerm, selectedSheet]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const availableSheets = Array.from(new Set(accessibleSubmissions.map(s => s.sheet_date || 'Utama')));
  const totalPengajuan = filteredData.length;

  // Handler Update Status Approval (HR / IT)
  const handleStatusChange = async (item, targetField, newStatus) => {
    const confirmMsg = `Ubah status ${targetField === 'check_hr' ? 'HR' : 'IT'} untuk ${item.nama_lengkap} menjadi ${newStatus}?`;
    if (!window.confirm(confirmMsg)) return;

    setUpdatingId(`${item.rowIndex}-${targetField}`);

    try {
      await onUpdateSubmit({
        action: 'update_status',
        rowIndex: item.rowIndex || item.row,
        sheetName: item.sheet_date || item.sheetName,
        targetField: targetField,
        statusValue: newStatus,
        updatedBy: userEmail
      });
    } catch (err) {
      alert('Gagal memperbarui status. Silakan coba lagi.');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeUsersList = Object.values(onlineUsers || {}).filter(
    (u) => u && typeof u === 'object' && u.email
  );

  return (
    <div className="space-y-6">

      {/* WIDGET USER ONLINE (HANYA MUNCUL DI LAYAR ADMINISTRATOR) */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl shadow-lg border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <div>
                <h4 className="font-bold text-sm tracking-wide flex items-center gap-2">
                  <span>🟢 Monitoring Real-Time User Aktif</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold">
                    {activeUsersList.length} Online
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Fitur Khusus Administrator untuk memantau siapa saja yang sedang membuka aplikasi.
                </p>
              </div>
            </div>

            {/* List Bubble User Online */}
            <div className="flex items-center gap-2 flex-wrap">
              {activeUsersList.map((u, i) => (
                <div
                  key={u.email || i}
                  title={`Email: ${u.email}\nPosisi Tab: ${u.currentTab || '-'}`}
                  className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 rounded-lg"
                >
                  <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-[10px]">
                    {u.email ? u.email.substring(0, 2).toUpperCase() : 'US'}
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-semibold text-slate-200 leading-none truncate max-w-[110px]">
                      {u.email ? u.email.split('@')[0] : 'User'}
                    </p>
                    <p className="text-[9px] text-indigo-400 font-mono leading-none mt-0.5">
                      {u.currentTab || 'Dashboard'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Banner Hak Akses Dashboard */}
      <div className={`p-4 rounded-xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isAdmin ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
        <div>
          <h4 className="font-bold text-sm flex items-center gap-2">
            {isAdmin ? '👑 Mode Super Admin / Manager' : isHR ? '📋 Mode Verifikator HR' : isIT ? '💻 Mode Verifikator IT' : '👤 Mode User / Inputor'}
          </h4>
          <p className="text-xs text-gray-600 mt-0.5">
            Logged as: <span className="font-semibold">{userEmail}</span>
          </p>
        </div>

        {/* Tab Switcher untuk Akses HR / IT */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-inner w-full md:w-auto overflow-x-auto text-xs">
          <button
            onClick={() => { setActiveTab('dashboard'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            📊 Dashboard Utama
          </button>
          
          {isHR && (
            <button
              onClick={() => { setActiveTab('hr_approval'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${activeTab === 'hr_approval' ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <span>📋 Verifikasi HR</span>
              {accessibleSubmissions.filter(i => (i.check_hr || 'PENDING').toUpperCase() === 'PENDING').length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {accessibleSubmissions.filter(i => (i.check_hr || 'PENDING').toUpperCase() === 'PENDING').length}
                </span>
              )}
            </button>
          )}

          {isIT && (
            <button
              onClick={() => { setActiveTab('it_approval'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${activeTab === 'it_approval' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <span>💻 Verifikasi IT</span>
              {accessibleSubmissions.filter(i => (i.check_it || 'PENDING').toUpperCase() === 'PENDING').length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {accessibleSubmissions.filter(i => (i.check_it || 'PENDING').toUpperCase() === 'PENDING').length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Ringkasan & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="bg-white p-4 rounded-xl border shadow-sm w-full md:w-64">
          <p className="text-xs font-semibold text-gray-500 uppercase">
            {activeTab === 'hr_approval' ? 'Data Verifikasi HR' : activeTab === 'it_approval' ? 'Data Verifikasi IT' : 'Total Data Ditampilkan'}
          </p>
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

      {/* Tabel Utama / HR / IT */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          
          {/* TABEL 1: DASHBOARD UTAMA */}
          {activeTab === 'dashboard' && (
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
                      Tidak ada data pengajuan yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/80 transition">
                      <td className="p-3 font-semibold text-blue-600 whitespace-nowrap">{item.sheet_date || '-'}</td>
                      <td className="p-3 font-medium text-gray-700">{item.rm || '-'}</td>
                      <td className="p-3 text-gray-700">{item.nama_dp || '-'}</td>
                      <td className="p-3 font-bold text-gray-800">{item.nama_lengkap || '-'}</td>
                      <td className="p-3 text-gray-600">{item.posisi || '-'}</td>
                      <td className="p-3 text-center"><StatusBadge status={item.check_hr} /></td>
                      <td className="p-3 text-center"><StatusBadge status={item.check_it} /></td>
                      <td className="p-3 text-center flex justify-center gap-1.5">
                        {(item.check_hr || '').toUpperCase() === 'PENDING' && (item.check_it || '').toUpperCase() === 'PENDING' ? (
                          <button onClick={() => setSelectedEdit(item)} className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg font-semibold hover:bg-amber-100">
                            Edit
                          </button>
                        ) : (
                          <button disabled className="px-3 py-1 bg-gray-100 text-gray-400 border border-gray-200 rounded-lg font-semibold cursor-not-allowed">
                            Edit
                          </button>
                        )}
                        <button onClick={() => setSelectedDetail(item)} className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg font-semibold text-[11px] hover:bg-blue-100">
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TABEL 2: VERIFIKASI HR */}
          {activeTab === 'hr_approval' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50/80 text-emerald-900 border-b uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3">Area (RM)</th>
                  <th className="p-3">Nama DP/DC</th>
                  <th className="p-3">TLC</th>
                  <th className="p-3">Status DP</th>
                  <th className="p-3">Nama Lengkap</th>
                  <th className="p-3">No KTP</th>
                  <th className="p-3">KTP & Alamat</th>
                  <th className="p-3 text-center">Status HR</th>
                  <th className="p-3 text-center">Aksi HR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-10 text-gray-400">Tidak ada data verifikasi HR.</td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr key={index} className="hover:bg-emerald-50/30 transition">
                      <td className="p-3 font-semibold text-emerald-700">{item.rm || '-'}</td>
                      <td className="p-3 font-medium text-gray-800">{item.nama_dp || '-'}</td>
                      <td className="p-3 text-gray-600">{item.tlc || '-'}</td>
                      <td className="p-3 text-gray-600 font-medium">
                        {item.dp_ownerless ? `Ownerless (${item.dp_ownerless})` : item.dp_mitra ? `Mitra (${item.dp_mitra})` : '-'}
                      </td>
                      <td className="p-3 font-bold text-gray-900">{item.nama_lengkap || '-'}</td>
                      <td className="p-3 font-mono text-gray-700">{item.no_ktp || '-'}</td>
                      <td className="p-3">
                        {item.link_ktp ? (
                          <a href={item.link_ktp} target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold mr-2">Lihat KTP</a>
                        ) : '-'}
                        <span className="text-gray-400 block text-[10px] truncate max-w-[120px]" title={item.alamat}>{item.alamat || '-'}</span>
                      </td>
                      <td className="p-3 text-center"><StatusBadge status={item.check_hr} /></td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* HANYA MUNCULKAN TOMBOL APPROVE & REJECT JIKA STATUS HR 'PENDING' */}
                          {(item.check_hr || 'PENDING').toUpperCase() === 'PENDING' ? (
                            <>
                              <button disabled={updatingId === `${item.rowIndex}-check_hr`} onClick={() => handleStatusChange(item, 'check_hr', 'APPROVED')} className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition disabled:opacity-50">Approve</button>
                              <button disabled={updatingId === `${item.rowIndex}-check_hr`} onClick={() => handleStatusChange(item, 'check_hr', 'REJECTED')} className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition disabled:opacity-50">Reject</button>
                            </>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-400 italic px-2 py-0.5">Selesai</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TABEL 3: VERIFIKASI IT */}
          {activeTab === 'it_approval' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-blue-50/80 text-blue-900 border-b uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3">Sheet/Tgl</th>
                  <th className="p-3">RM / DP</th>
                  <th className="p-3">Nama Lengkap</th>
                  <th className="p-3">Posisi</th>
                  <th className="p-3">NIK & HP</th>
                  <th className="p-3 text-center">Check HR</th>
                  <th className="p-3 text-center">Check IT</th>
                  <th className="p-3 text-center">Aksi IT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-gray-400">Tidak ada data verifikasi IT.</td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr key={index} className="hover:bg-blue-50/30 transition">
                      <td className="p-3 font-semibold text-blue-600 whitespace-nowrap">{item.sheet_date || '-'}</td>
                      <td className="p-3">
                        <div className="font-bold text-gray-800">{item.nama_dp || '-'}</div>
                        <div className="text-[10px] text-gray-500">RM: {item.rm || '-'}</div>
                      </td>
                      <td className="p-3 font-bold text-gray-900">{item.nama_lengkap || '-'}</td>
                      <td className="p-3 text-gray-600">{item.posisi || '-'}</td>
                      <td className="p-3">
                        <div className="font-mono">{item.no_ktp || '-'}</div>
                        <div className="text-[10px] text-gray-500">{item.no_hp || '-'}</div>
                      </td>
                      <td className="p-3 text-center"><StatusBadge status={item.check_hr} /></td>
                      <td className="p-3 text-center"><StatusBadge status={item.check_it} /></td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* HANYA MUNCULKAN TOMBOL APPROVE & REJECT JIKA STATUS IT 'PENDING' */}
                          {(item.check_it || 'PENDING').toUpperCase() === 'PENDING' ? (
                            <>
                              <button disabled={updatingId === `${item.rowIndex}-check_it`} onClick={() => handleStatusChange(item, 'check_it', 'DONE')} className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50">Approve</button>
                              <button disabled={updatingId === `${item.rowIndex}-check_it`} onClick={() => handleStatusChange(item, 'check_it', 'REJECT')} className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition disabled:opacity-50">Reject</button>
                            </>
                          ) : null}
                          <button onClick={() => setSelectedDetail(item)} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 text-[10px]">Detail</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

        </div>

        {/* PAGINATION FOOTER */}
        <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="font-medium">
            Menampilkan <span className="font-semibold text-slate-800">{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - <span className="font-semibold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="font-semibold text-slate-800">{filteredData.length}</span> data
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3.5 py-1.5 bg-white border rounded-xl font-medium text-slate-700 disabled:opacity-40">Sebelumnya</button>
            <div className="px-3 py-1.5 bg-slate-100 rounded-xl font-semibold text-slate-700"><span className="text-indigo-600">{currentPage}</span> / {totalPages}</div>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3.5 py-1.5 bg-white border rounded-xl font-medium text-slate-700 disabled:opacity-40">Selanjutnya</button>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Detail Lengkap Pengajuan</h3>
                <p className="text-xs text-slate-500">Email Pemohon: <span className="font-semibold text-slate-700">{selectedDetail.email_pemohon || selectedDetail.email || selectedDetail.created_by || '-'}</span></p>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><p className="text-[11px] font-semibold text-slate-400 uppercase">Tanggal Sheet</p><p className="font-bold text-indigo-600 mt-0.5">{selectedDetail.sheet_date || '-'}</p></div>
              <div><p className="text-[11px] font-semibold text-slate-400 uppercase">RM</p><p className="font-bold text-slate-900 mt-0.5">{selectedDetail.rm || '-'}</p></div>
              <div><p className="text-[11px] font-semibold text-slate-400 uppercase">Nama DP/DC</p><p className="font-bold text-slate-900 mt-0.5">{selectedDetail.nama_dp || '-'}</p></div>
              <div><p className="text-[11px] font-semibold text-slate-400 uppercase">TLC</p><p className="font-bold text-slate-900 mt-0.5">{selectedDetail.tlc || '-'}</p></div>
              <div><p className="text-[11px] font-semibold text-slate-400 uppercase">Nama Lengkap</p><p className="font-bold text-slate-900 mt-0.5">{selectedDetail.nama_lengkap || '-'}</p></div>
              <div><p className="text-[11px] font-semibold text-slate-400 uppercase">Posisi</p><p className="font-bold text-slate-900 mt-0.5">{selectedDetail.posisi || '-'}</p></div>
              <div><p className="text-[11px] font-semibold text-slate-400 uppercase">Check HR</p><StatusBadge status={selectedDetail.check_hr} /></div>
              <div><p className="text-[11px] font-semibold text-slate-400 uppercase">Check IT</p><StatusBadge status={selectedDetail.check_it} /></div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setSelectedDetail(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {selectedEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-lg text-gray-800">Edit Data Pengajuan</h3>
              <button onClick={() => setSelectedEdit(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
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

// KOMPONEN STATUS BADGE DIPERBARUI
function StatusBadge({ status }) {
  const st = (status || 'PENDING').toUpperCase().trim();
  
  // Membaca DONE, APPROVED, APPROVE, atau OK sebagai APPROVED (Badge Hijau)
  if (st === 'APPROVED' || st === 'OK' || st === 'APPROVE' || st === 'DONE') {
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">APPROVED</span>;
  }
  
  // Membaca REJECTED atau REJECT sebagai REJECTED (Badge Merah)
  if (st === 'REJECTED' || st === 'REJECT') {
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">REJECTED</span>;
  }
  
  // Default status PENDING (Badge Kuning)
  return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">PENDING</span>;
}