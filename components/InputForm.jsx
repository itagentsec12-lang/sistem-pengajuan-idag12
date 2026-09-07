'use client';

import { useState, useEffect } from 'react';
import { getActiveSession } from '../lib/sessionCheck';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

export default function InputForm({ userEmail, dropdowns = {}, onDataSubmit, onBulkSubmit, initialData = null  }) {
  const [session, setSession] = useState({ isActive: false, sessionName: '', message: '' });

  const initialForm = {
    rm: '',
    nama_dp: '',
    tlc: '',
    kode_ke3: '',
    dp_ownerless: '',
    dp_mitra: '',
    no_rekening: '',
    pod_npwp: '',
    posisi: 'ADMIN BACKOFFICE',
    paket_besar: '',
    nama_lengkap: '',
    no_ktp: '',
    nohp: '',
    email: userEmail || '',
    link_ktp: '',
    alamat: '',
    nama_merekomendasikan: '',
    nik_merekomendasikan: '',
    nama_pic: '',
    koordinator: '',
    posisi_merekomendasikan: '',
    keterangan: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const posisiOptions = [
    "ADMIN BACKOFFICE", "PROCESSING BACKOFFICE", "COORDINATOR BACKOFFICE",
    "SPV", "TRANSPORTER", "SPRINTER PICKUP", "IMPLAN PROCESSING",
    "SPRINTER DELIVERY", "MONITORING/OWNER", "SALES/MARKETING",
    "ED", "MDP", "DP CC", "OTHER ISI DI KETERANGAN"
  ];

  const rmList = dropdowns?.rm || dropdowns?.RM || [];
  const dpList = dropdowns?.nama_dp || dropdowns?.dp || [];
  const ownerlessList = dropdowns?.dp_ownerless || dropdowns?.ownerless || [];
  const mitraList = dropdowns?.dp_mitra || dropdowns?.mitra || [];

  // 1. HANDLER UPLOAD FILE (Ditutup sampai selesai)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!session.isActive) {
      alert("Upload gagal: Sesi pengajuan sedang TUTUP.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'array' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawJson = XLSX.utils.sheet_to_json(ws, { raw: false, defval: '' });

        if (rawJson.length === 0) {
          alert("File kosong atau format salah.");
          return;
        }

        const parsedData = rawJson.map((row) => ({
          rm: row['RM'] || row['rm'] || '',
          nama_dp: row['NAMA DP / DC'] || row['nama_dp'] || '',
          tlc: String(row['KODE TLC (Kapital)'] || row['tlc'] || '').toUpperCase(),
          kode_ke3: row['KODE KE 3'] || row['kode_ke3'] || '',
          dp_ownerless: row['DP OWNERLESS VENDOR'] || row['dp_ownerless'] || '',
          dp_mitra: row['DP MITRA VENDOR'] || row['dp_mitra'] || '',
          no_rekening: String(row['NO REKENING'] || row['no_rekening'] || ''),
          pod_npwp: String(row['POD NPWP'] || row['pod_npwp'] || ''),
          posisi: row['POSISI'] || row['posisi'] || 'ADMIN BACKOFFICE',
          paket_besar: row['ISI JIKA PAKET BESAR'] || row['paket_besar'] || '',
          nama_lengkap: String(row['NAMA LENGKAP (Kapital)'] || row['nama_lengkap'] || '').toUpperCase(),
          no_ktp: String(row['NO KTP (16 Angka)'] || row['no_ktp'] || '').trim(),
          nohp: String(row['NO HP'] || row['nohp'] || ''),
          email: row['EMAIL'] || row['email'] || userEmail || '',
          link_ktp: row['LINK FOTO KTP (DRIVE)'] || row['link_ktp'] || '',
          alamat: row['ALAMAT'] || row['alamat'] || '',
          nama_merekomendasikan: row['NAMA YANG MEREKOMENDASIKAN'] || row['nama_merekomendasikan'] || '',
          nik_merekomendasikan: row['NIK KTP YANG MEREKOMENDASIKAN'] || row['nik_merekomendasikan'] || '',
          nama_pic: row['NAMA PIC'] || row['nama_pic'] || '',
          koordinator: row['KOORDINATOR'] || row['koordinator'] || '',
          posisi_merekomendasikan: row['POSISI YANG MEREKOMENDASIKAN'] || row['posisi_merekomendasikan'] || '',
          keterangan: row['KETERANGAN'] || row['keterangan'] || '',
        }));

        if (onBulkSubmit) {
          onBulkSubmit(parsedData);
        }
      } catch (err) {
        console.error(err);
        alert("Gagal membaca file Excel/CSV.");
      }
    };
    reader.readAsArrayBuffer(file);
  }; // <--- SANGAT PENTING: Penutup fungsi handleFileUpload

  // 2. HANDLER DOWNLOAD TEMPLATE EXCEL DENGAN DROPDOWN POSISI TERBARU
  const handleDownloadTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Template_Pengajuan');

      // Ambil opsi RM dan DP dari props/state
      const rawRm = Array.isArray(dropdowns?.rm) ? dropdowns.rm : ['RAHMAN', 'ARMAN'];
      const rawDp = Array.isArray(dropdowns?.nama_dp) ? dropdowns.nama_dp : ['GADING_SERPONG', 'CIMONE_RAYA', 'CIBODAS_BARU'];
      
      const rmList = rawRm.map(item => String(item).replace(/"/g, '""'));
      const dpList = rawDp.map(item => String(item).replace(/"/g, '""'));
      const ownerlessList = ['YES', 'NO'];
      const mitraList = ['YES', 'NO', 'MITRA', 'SML'];
      
      // Opsi POSISI sesuai gambar Spreadsheet
      const posisiList = [
        'ADMIN_BACKOFFICE',
        'PROCESSING_BACKOFFICE',
        'COORDINATOR_BACKOFFICE',
        'SPV',
        'TRANSPORTER',
        'SPRINTER PICKUP',
        'IMPLAN PROCESSING',
        'SPRINTER DELIVERY',
        'MONITORING/OWNER',
        'SALES/MARKETING',
        'OTHER. ISI DIKETERANGAN',
        'ED',
        'MDP',
        'DP CC',
        'POSISI',
        'ADMIN RETUR'
      ].map(item => String(item).replace(/"/g, '""'));

      // Header Kolom
      worksheet.columns = [
        { header: 'RM', key: 'rm', width: 20 },
        { header: 'NAMA DP / DC', key: 'nama_dp', width: 25 },
        { header: 'KODE TLC (Kapital)', key: 'tlc', width: 20 },
        { header: 'KODE KE 3', key: 'kode_ke3', width: 15 },
        { header: 'DP OWNERLESS VENDOR', key: 'dp_ownerless', width: 22 },
        { header: 'DP MITRA VENDOR', key: 'dp_mitra', width: 20 },
        { header: 'NO REKENING', key: 'no_rekening', width: 20 },
        { header: 'POD NPWP', key: 'pod_npwp', width: 20 },
        { header: 'POSISI', key: 'posisi', width: 25 },
        { header: 'ISI JIKA PAKET BESAR', key: 'paket_besar', width: 22 },
        { header: 'NAMA LENGKAP (Kapital)', key: 'nama_lengkap', width: 30 },
        { header: 'NO KTP (16 Angka)', key: 'no_ktp', width: 22 },
        { header: 'NO HP', key: 'nohp', width: 18 },
        { header: 'EMAIL', key: 'email', width: 25 },
        { header: 'LINK FOTO KTP (DRIVE)', key: 'link_ktp', width: 35 },
        { header: 'ALAMAT', key: 'alamat', width: 35 },
        { header: 'NAMA YANG MEREKOMENDASIKAN', key: 'nama_merekomendasikan', width: 30 },
        { header: 'NIK KTP YANG MEREKOMENDASIKAN', key: 'nik_merekomendasikan', width: 30 },
        { header: 'NAMA PIC', key: 'nama_pic', width: 20 },
        { header: 'KOORDINATOR', key: 'koordinator', width: 20 },
        { header: 'POSISI YANG MEREKOMENDASIKAN', key: 'posisi_merekomendasikan', width: 30 },
        { header: 'KETERANGAN', key: 'keterangan', width: 25 },
      ];

      // Contoh 1 Baris Isian
      worksheet.addRow({
        rm: rawRm[0] || 'RAHMAN',
        nama_dp: rawDp[0] || 'GADING_SERPONG',
        tlc: 'BAL01E',
        kode_ke3: '99',
        dp_ownerless: 'NO',
        dp_mitra: 'MITRA',
        no_rekening: '1234567890',
        pod_npwp: '456789012',
        posisi: 'SPRINTER DELIVERY',
        paket_besar: '',
        nama_lengkap: 'ABDUL RIZAL MUSLIM',
        no_ktp: '3671012345670001',
        nohp: '081234567890',
        email: userEmail || 'user@gmail.com',
        link_ktp: 'https://drive.google.com/file/d/xxx/view',
        alamat: 'GRAHA EMERALD 2 M05/06 JL BOULEVARD',
        nama_merekomendasikan: 'BUDI',
        nik_merekomendasikan: '3671012345670002',
        nama_pic: 'ANDI',
        koordinator: 'EKO',
        posisi_merekomendasikan: 'SPV',
        keterangan: 'Pengajuan Baru'
      });

      // Menerapkan Dropdown Validation (Baris 2 s/d 100)
      for (let i = 2; i <= 100; i++) {
        if (rmList.length > 0) {
          worksheet.getCell(`A${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`"${rmList.join(',')}"`]
          };
        }
        if (dpList.length > 0) {
          worksheet.getCell(`B${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`"${dpList.join(',')}"`]
          };
        }
        worksheet.getCell(`E${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${ownerlessList.join(',')}"`]
        };
        worksheet.getCell(`F${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${mitraList.join(',')}"`]
        };
        worksheet.getCell(`I${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${posisiList.join(',')}"`]
        };
      }

      // Generate & Trigger Download File Excel
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'Template_Pengajuan_ID_Massal.xlsx';
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal mendownload template:", err);
      alert("Gagal mendownload template Excel: " + err.message);
    }
  };

  useEffect(() => {
    const checkSession = () => setSession(getActiveSession());
    checkSession();
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

  const matchOptionValue = (rawValue, optionsList = []) => {
    if (!rawValue) return '';
    const cleanVal = String(rawValue).trim().toLowerCase();
    const matched = optionsList.find(opt => String(opt).trim().toLowerCase() === cleanVal);
    return matched ? String(matched).trim() : String(rawValue).trim();
  };

  useEffect(() => {
    if (initialData) {
      const getVal = (keys) => {
        for (const key of keys) {
          if (initialData[key] !== undefined && initialData[key] !== null && String(initialData[key]).trim() !== '') {
            return String(initialData[key]).trim();
          }
        }
        return '';
      };

      const rawRm = getVal(['rm', 'RM']);
      const rawDp = getVal(['nama_dp', 'NAMA DP / DC', 'dp']);
      const rawOwnerless = getVal(['dp_ownerless', 'DP OWNERLESS VENDOR', 'ownerless']);
      const rawMitra = getVal(['dp_mitra', 'DP MITRA VENDOR', 'mitra']);
      const rawPosisi = getVal(['posisi', 'POSISI']);
      const rawPaket = getVal(['paket_besar', 'ISI JIKA PAKET BESAR']);

      setFormData({
        rm: matchOptionValue(rawRm, rmList),
        nama_dp: matchOptionValue(rawDp, dpList),
        tlc: getVal(['tlc', 'KODE TLC (Kapital)']),
        kode_ke3: getVal(['kode_ke3', 'KODE KE 3']),
        dp_ownerless: matchOptionValue(rawOwnerless, ownerlessList),
        dp_mitra: matchOptionValue(rawMitra, mitraList),
        no_rekening: getVal(['no_rekening', 'NO REKENING']),
        pod_npwp: getVal(['pod_npwp', 'POD NPWP']),
        posisi: matchOptionValue(rawPosisi, posisiOptions) || 'ADMIN BACKOFFICE',
        paket_besar: matchOptionValue(rawPaket, ['TR', 'MTR']),
        nama_lengkap: getVal(['nama_lengkap', 'NAMA LENGKAP (Kapital)']),
        no_ktp: getVal(['no_ktp', 'NO KTP (16 Angka)']),
        nohp: getVal(['nohp', 'NO HP']),
        email: getVal(['email', 'EMAIL']) || userEmail || '',
        link_ktp: getVal(['link_ktp', 'LINK FOTO KTP (DRIVE)']),
        alamat: getVal(['alamat', 'ALAMAT']),
        nama_merekomendasikan: getVal(['nama_merekomendasikan', 'NAMA YANG MEREKOMENDASIKAN']),
        nik_merekomendasikan: getVal(['nik_merekomendasikan', 'NIK KTP YANG MEREKOMENDASIKAN']),
        nama_pic: getVal(['nama_pic', 'NAMA PIC']),
        koordinator: getVal(['koordinator', 'KOORDINATOR']),
        posisi_merekomendasikan: getVal(['posisi_merekomendasikan', 'POSISI YANG MEREKOMENDASIKAN']),
        keterangan: getVal(['keterangan', 'KETERANGAN']),
      });
    } else {
      setFormData(initialForm);
    }
  }, [initialData, userEmail, dropdowns]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'tlc' || name === 'nama_lengkap') {
      value = value.toUpperCase();
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNikBlur = () => {
    const nikLength = formData.no_ktp.trim().length;
    if (nikLength > 0 && nikLength !== 16) {
      alert(`Jumlah Angka NIK Tidak Berjumlah 16, yang terisi berjumlah (${nikLength})`);
    }
  };

  const handleSubmitManual = (e) => {
    e.preventDefault();
    if (!session.isActive) {
      alert("Pengajuan gagal: Sistem sedang dalam jam Cut-Off.");
      return;
    }
    const nikClean = formData.no_ktp.trim();
    if (nikClean.length !== 16) {
      alert(`Jumlah Angka NIK Tidak Berjumlah 16, yang terisi berjumlah (${nikClean.length})`);
      return;
    }
    onDataSubmit(formData);
  };

  return (
    <div className="space-y-8 mb-12">
      <div className={`p-4 rounded-xl flex items-center justify-between border shadow-sm ${session.isActive ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${session.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide">Status Sesi Input</h4>
            <p className="text-xs mt-0.5">{session.message}</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-white rounded-md shadow-sm border">{session.sessionName}</span>
      </div>

      {/* Card Upload Massal */}
      {/* Card Upload Massal & Download Template */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h3 className="font-bold text-gray-800 text-base">📂 Upload Data Massal (Excel / CSV)</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Unggah file .xlsx atau .csv untuk memasukkan banyak data sekaligus.
            </p>
          </div>
          
          {/* Tombol Download Template */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition shadow-sm w-fit"
          >
            📥 Download Template Excel
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Pilih File Excel / CSV:
          </label>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            disabled={!session.isActive}
            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border rounded-lg p-1 bg-gray-50/50"
          />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">✍️ Form Pengajuan Manual</h2>
            <p className="text-xs text-gray-500">Isi 22 kolom informasi di bawah ini.</p>
          </div>
        </div>

        <form onSubmit={handleSubmitManual} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. RM */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">1. RM (Regional Manager)</label>
            <select name="rm" value={formData.rm} onChange={handleChange} disabled={!session.isActive} required className="w-full p-2.5 border rounded-lg text-sm bg-white">
              <option value="">-- Pilih RM --</option>
              {rmList.map((opt, i) => (
                <option key={i} value={String(opt).trim()}>{opt}</option>
              ))}
            </select>
          </div>

          {/* 2. NAMA DP / DC */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">2. NAMA DP / DC</label>
            <select name="nama_dp" value={formData.nama_dp} onChange={handleChange} disabled={!session.isActive} required className="w-full p-2.5 border rounded-lg text-sm bg-white">
              <option value="">-- Pilih DP / DC --</option>
              {dpList.map((opt, i) => (
                <option key={i} value={String(opt).trim()}>{opt}</option>
              ))}
            </select>
          </div>

          {/* 3. KODE TLC */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">3. KODE TLC (Kapital)</label>
            <input type="text" name="tlc" placeholder="TGR12E" value={formData.tlc} onChange={handleChange} disabled={!session.isActive} required className="w-full p-2.5 border rounded-lg text-sm uppercase" />
          </div>

          {/* 4. KODE KE 3 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">4. KODE KE 3</label>
            <input type="text" name="kode_ke3" placeholder="Free Text" value={formData.kode_ke3} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          {/* 5. DP OWNERLESS VENDOR */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">5. DP OWNERLESS VENDOR</label>
            <select name="dp_ownerless" value={formData.dp_ownerless} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm bg-white">
              <option value="">-- Pilih Ownerless --</option>
              {ownerlessList.map((opt, idx) => (
                <option key={idx} value={String(opt).trim()}>{opt}</option>
              ))}
            </select>
          </div>

          {/* 6. DP MITRA VENDOR */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">6. DP MITRA VENDOR</label>
            <select name="dp_mitra" value={formData.dp_mitra} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm bg-white">
              <option value="">-- Pilih Mitra --</option>
              {mitraList.map((opt, idx) => (
                <option key={idx} value={String(opt).trim()}>{opt}</option>
              ))}
            </select>
          </div>

          {/* 7. NO REKENING */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">7. NO REKENING</label>
            <input type="text" name="no_rekening" placeholder="Nomor Rekening" value={formData.no_rekening} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          {/* 8. POD NPWP */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">8. POD NPWP</label>
            <input type="text" name="pod_npwp" placeholder="Nomor POD NPWP" value={formData.pod_npwp} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          {/* 9. POSISI */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">9. POSISI</label>
            <select name="posisi" value={formData.posisi} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm bg-white">
              {posisiOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* 10. PAKET BESAR */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">10. ISI JIKA PAKET BESAR</label>
            <select name="paket_besar" value={formData.paket_besar} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm bg-white">
              <option value="">-- Tanpa Paket Besar --</option>
              <option value="TR">TR</option>
              <option value="MTR">MTR</option>
            </select>
          </div>

          {/* 11. NAMA LENGKAP */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">11. NAMA LENGKAP (Kapital)</label>
            <input type="text" name="nama_lengkap" placeholder="Sesuai KTP" value={formData.nama_lengkap} onChange={handleChange} disabled={!session.isActive} required className="w-full p-2.5 border rounded-lg text-sm uppercase" />
          </div>

          {/* 12. NO KTP */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">12. NO KTP (16 Angka)</label>
            <input type="text" name="no_ktp" maxLength={16} placeholder="16 Digit NIK" value={formData.no_ktp} onChange={handleChange} onBlur={handleNikBlur} disabled={!session.isActive} required className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          {/* 13. NO HP */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">13. NO HP</label>
            <input type="text" name="nohp" placeholder="08xxxxxxxxxx" value={formData.nohp} onChange={handleChange} disabled={!session.isActive} required className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          {/* 14. EMAIL */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">14. EMAIL</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          {/* 15. LINK FOTO KTP */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">15. LINK FOTO KTP (DRIVE)</label>
            <input type="url" name="link_ktp" placeholder="https://drive.google.com/..." value={formData.link_ktp} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          {/* 16. ALAMAT */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">16. ALAMAT</label>
            <input type="text" name="alamat" placeholder="Alamat Domisili" value={formData.alamat} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          {/* 17. NAMA MEREKOMENDASIKAN */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">17. NAMA YANG MEREKOMENDASIKAN</label>
            <input type="text" name="nama_merekomendasikan" placeholder="Nama Perekomendasi" value={formData.nama_merekomendasikan} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          {/* 18. NIK MEREKOMENDASIKAN */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">18. NIK KTP YANG MEREKOMENDASIKAN</label>
            <input type="text" name="nik_merekomendasikan" placeholder="NIK Perekomendasi" value={formData.nik_merekomendasikan} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          {/* 19. NAMA PIC */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">19. NAMA PIC</label>
            <input type="text" name="nama_pic" placeholder="Nama PIC" value={formData.nama_pic} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          {/* 20. KOORDINATOR */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">20. KOORDINATOR</label>
            <input type="text" name="koordinator" placeholder="Nama Koordinator" value={formData.koordinator} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          {/* 21. POSISI MEREKOMENDASIKAN */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">21. POSISI YANG MEREKOMENDASIKAN</label>
            <input type="text" name="posisi_merekomendasikan" placeholder="Posisi Perekomendasi" value={formData.posisi_merekomendasikan} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          {/* 22. KETERANGAN */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">22. KETERANGAN</label>
            <input type="text" name="keterangan" placeholder="Catatan" value={formData.keterangan} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-4">
            <button
              type="submit"
              disabled={!session.isActive}
              className={`px-8 py-3 rounded-lg text-white font-semibold text-sm transition shadow-md ${session.isActive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              {session.isActive 
                ? (initialData ? '🚀 Kirim Perubahan' : '🚀 Kirim Pengajuan Manual') 
                : '🔒 Form Input Terkunci'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}