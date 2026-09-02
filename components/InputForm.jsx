'use client';

import { useState, useEffect } from 'react';
import { getActiveSession } from '../lib/sessionCheck';
import * as XLSX from 'xlsx';

export default function InputForm({ userEmail, dropdowns = {}, onDataSubmit, initialData = null }) {
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