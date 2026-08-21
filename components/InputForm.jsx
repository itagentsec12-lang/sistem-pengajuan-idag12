'use client';

import { useState, useEffect } from 'react';
import { getActiveSession } from '../lib/sessionCheck';
import * as XLSX from 'xlsx';

export default function InputForm({ userEmail, dropdowns, onDataSubmit }) {
  const [session, setSession] = useState({ isActive: false, sessionName: '', message: '' });

  const initialForm = {
    rm: '',
    nama_dp: '',
    tlc: '',
    kode_ke3: '',
    dp_ownerless: '',
    dp_mitra: '',
    no_rekening: '',
    pod_npwp: '', // Field Baru
    posisi: 'ADMIN_BACKOFFICE',
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

  useEffect(() => {
    const checkSession = () => setSession(getActiveSession());
    checkSession();
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'tlc' || name === 'nama_lengkap') {
      value = value.toUpperCase();
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleNikBlur = () => {
    const nikLength = formData.no_ktp.trim().length;
    if (nikLength > 0 && nikLength !== 16) {
      alert(`Jumlah Angka NIK Tidak Berjumlah 16, yang terisi berjumlah (${nikLength})`);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "RM", "NAMA_DP", "TLC", "KODE_KE3", "DP_OWNERLESS", "DP_MITRA",
      "NO_REKENING", "POD_NPWP", "POSISI", "PAKET_BESAR", "NAMA_LENGKAP", "NO_KTP",
      "NO_HP", "EMAIL", "LINK_FOTO_KTP", "ALAMAT", "NAMA_MEREKOMENDASIKAN",
      "NIK_MEREKOMENDASIKAN", "NAMA_PIC", "KOORDINATOR", "POSISI_MEREKOMENDASIKAN", "KETERANGAN"
    ];

    const sampleRow = [
      dropdowns?.rm?.[0] || "JAYA", dropdowns?.dp?.[0] || "SEPATAN", "TGR12E", "KODE01",
      dropdowns?.ownerless?.[0] || "-", dropdowns?.mitra?.[0] || "-", "1234567890", "123456789000000",
      "SPRINTER_DELIVERY", "TR", "FULAN BIN FULAN", "3603160301990000",
      "081234567890", userEmail, "https://drive.google.com/...", "TANGERANG",
      "REKOMENDER", "3603160301990001", "PIC A", "KOORD B", "SPV", "PENGAJUAN MASSAL"
    ];

    //const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), sampleRow.join(",")].join("\n");
    //const link = document.createElement("a");
    //link.setAttribute("href", encodeURI(csvContent));
    //link.setAttribute("download", "Template_Pengajuan_ID.csv");
    //document.body.appendChild(link);
    //link.click();
    //document.body.removeChild(link);

    // Buat worksheet dari data header dan contoh baris
      const worksheetData = [headers, sampleRow];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    // Unduh langsung sebagai file Excel (.xlsx)
      XLSX.writeFile(workbook, "Template_Pengajuan_ID.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!session.isActive) {
      alert("Pengajuan gagal: Sistem sedang dalam jam Cut-Off.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Ambil sheet pertama
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Konversi isi sheet Excel ke array 2 dimensi (tanpa mengubah angka NIK/NoHP ke scientific notation)
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: "" });

        // Minimal harus ada 2 baris (1 baris header + minimal 1 baris data)
        if (rows.length <= 1) {
          alert("File Excel kosong atau hanya berisi header!");
          return;
        }

        const importedData = [];

        // Loop mulai dari index 1 (melewati baris header)
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].map(val => String(val).trim());

          // Abaikan jika seluruh kolom dalam baris ini kosong
          if (values.every(v => v === "")) continue;

          // Index NIK ada di baris ke-11
          const ktpVal = values[11] ? String(values[11]).trim() : '';

          if (ktpVal.length !== 16) {
            alert(`Baris ke-${i + 1} Gagal: Jumlah Angka NIK Tidak Berjumlah 16, yang terisi berjumlah (${ktpVal.length})`);
            return;
          }

          importedData.push({
            rm: values[0] || '',
            nama_dp: values[1] || '',
            tlc: (values[2] || '').toUpperCase(),
            kode_ke3: values[3] || '',
            dp_ownerless: values[4] || '',
            dp_mitra: values[5] || '',
            no_rekening: values[6] || '',
            pod_npwp: values[7] || '',
            posisi: values[8] || 'ADMIN_BACKOFFICE',
            paket_besar: values[9] || '',
            nama_lengkap: (values[10] || '').toUpperCase(),
            no_ktp: ktpVal,
            nohp: values[12] || '',
            email: values[13] || userEmail,
            link_ktp: values[14] || '',
            alamat: values[15] || '',
            nama_merekomendasikan: values[16] || '',
            nik_merekomendasikan: values[17] || '',
            nama_pic: values[18] || '',
            koordinator: values[19] || '',
            posisi_merekomendasikan: values[20] || '',
            keterangan: values[21] || ''
          });
        }

        if (importedData.length === 0) {
          alert("Tidak ada data valid yang bisa diimpor.");
          return;
        }

        importedData.forEach(item => onDataSubmit(item));
        alert(`Berhasil mengimpor ${importedData.length} data pengajuan!`);

      } catch (err) {
        console.error("Gagal membaca file Excel:", err);
        alert("Gagal membaca file Excel. Pastikan format file .xlsx / .xls valid.");
      }
    };

    // Menggunakan ArrayBuffer untuk kompatibilitas membaca Excel yang stabil
    reader.readAsArrayBuffer(file);
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

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-blue-900">📊 Upload Pengajuan Massal (&gt; 5 Data)</h3>
            <p className="text-xs text-blue-700 mt-1">Gunakan template Excel</p>
          </div>
          <button onClick={downloadTemplate} type="button" className="px-4 py-2 bg-white text-blue-700 border border-blue-300 rounded-lg text-xs font-semibold shadow-sm hover:bg-blue-50">
            📥 Download Template Excel
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <input type="file" accept=".csv" onChange={handleFileUpload} disabled={!session.isActive} className="text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
          <span className="text-[11px] text-gray-500 italic">*Format Excel (.xlsx / .xls) harus sesuai template</span>
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
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">1. RM (Regional Manager)</label>
            <select name="rm" value={formData.rm} onChange={handleChange} disabled={!session.isActive} required className="w-full p-2.5 border rounded-lg text-sm">
              <option value="">-- Pilih RM --</option>
              {dropdowns?.rm?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">2. NAMA DP / DC</label>
            <select name="nama_dp" value={formData.nama_dp} onChange={handleChange} disabled={!session.isActive} required className="w-full p-2.5 border rounded-lg text-sm">
              <option value="">-- Pilih DP / DC --</option>
              {dropdowns?.dp?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">3. KODE TLC (Kapital)</label>
            <input type="text" name="tlc" placeholder="TGR12E" value={formData.tlc} onChange={handleChange} disabled={!session.isActive} required className="w-full p-2.5 border rounded-lg text-sm uppercase" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">4. KODE KE 3</label>
            <input type="text" name="kode_ke3" placeholder="Free Text" value={formData.kode_ke3} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

                {/* 5. DP OWNERLESS VENDOR */}
        <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">5. DP OWNERLESS VENDOR</label>
        <select
            name="dp_ownerless"
            value={formData.dp_ownerless}
            onChange={handleChange}
            disabled={!session.isActive}
            className="border rounded p-2 text-sm"
        >
            <option value="">-- Pilih Ownerless --</option>
            {dropdowns?.ownerless?.map((opt, idx) => (
            <option key={idx} value={opt}>
                {opt}
            </option>
            ))}
        </select>
        </div>

        {/* 6. DP MITRA VENDOR */}
        <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">6. DP MITRA VENDOR</label>
        <select
            name="dp_mitra"
            value={formData.dp_mitra}
            onChange={handleChange}
            disabled={!session.isActive}
            className="border rounded p-2 text-sm"
        >
            <option value="">-- Pilih Mitra --</option>
            {dropdowns?.mitra?.map((opt, idx) => (
            <option key={idx} value={opt}>
                {opt}
            </option>
            ))}
        </select>
        </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">7. NO REKENING</label>
            <input type="text" name="no_rekening" placeholder="Nomor Rekening" value={formData.no_rekening} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          {/* FIELD POD NPWP BARU */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">8. POD NPWP</label>
            <input type="text" name="pod_npwp" placeholder="Nomor POD NPWP" value={formData.pod_npwp} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">9. POSISI</label>
            <select name="posisi" value={formData.posisi} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm">
              {posisiOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">10. ISI JIKA PAKET BESAR</label>
            <select name="paket_besar" value={formData.paket_besar} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm">
              <option value="">-- Tanpa Paket Besar --</option>
              <option value="TR">TR</option>
              <option value="MTR">MTR</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">11. NAMA LENGKAP (Kapital)</label>
            <input type="text" name="nama_lengkap" placeholder="Sesuai KTP" value={formData.nama_lengkap} onChange={handleChange} disabled={!session.isActive} required className="w-full p-2.5 border rounded-lg text-sm uppercase" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">12. NO KTP (16 Angka)</label>
            <input
              type="text"
              name="no_ktp"
              maxLength={16}
              placeholder="16 Digit NIK"
              value={formData.no_ktp}
              onChange={handleChange}
              onBlur={handleNikBlur}
              disabled={!session.isActive}
              required
              className="w-full p-2.5 border rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">13. NO HP</label>
            <input type="text" name="nohp" placeholder="08xxxxxxxxxx" value={formData.nohp} onChange={handleChange} disabled={!session.isActive} required className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">14. EMAIL</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">15. LINK FOTO KTP (DRIVE)</label>
            <input type="url" name="link_ktp" placeholder="https://drive.google.com/..." value={formData.link_ktp} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">16. ALAMAT</label>
            <input type="text" name="alamat" placeholder="Alamat Domisili" value={formData.alamat} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">17. NAMA YANG MEREKOMENDASIKAN</label>
            <input type="text" name="nama_merekomendasikan" placeholder="Nama Perekomendasi" value={formData.nama_merekomendasikan} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">18. NIK KTP YANG MEREKOMENDASIKAN</label>
            <input type="text" name="nik_merekomendasikan" placeholder="NIK Perekomendasi" value={formData.nik_merekomendasikan} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">19. NAMA PIC</label>
            <input type="text" name="nama_pic" placeholder="Nama PIC" value={formData.nama_pic} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">20. KOORDINATOR</label>
            <input type="text" name="koordinator" placeholder="Nama Koordinator" value={formData.koordinator} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">21. POSISI YANG MEREKOMENDASIKAN</label>
            <input type="text" name="posisi_merekomendasikan" placeholder="Posisi Perekomendasi" value={formData.posisi_merekomendasikan} onChange={handleChange} disabled={!session.isActive} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>

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
              {session.isActive ? '🚀 Kirim Pengajuan Manual' : '🔒 Form Input Terkunci'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}