/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { 
  FileText, 
  Download, 
  Sparkles, 
  Loader2, 
  BookOpen, 
  CheckCircle2,
  AlertCircle,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SYSTEM_PROMPT = `Anda adalah pakar kurikulum "Kurikulum Berbasis Cinta (KBC)" yang ahli dalam desain dokumen instruksional profesional. Tugas Anda adalah menghasilkan dokumen RPM/RPP dalam format HTML utuh (lengkap dengan Inline CSS) yang siap dikonversi ke Microsoft Word atau PDF dengan tata letak yang sangat rapi.

Struktur Dokumen (Wajib Diikuti):
1. Header Kop: Judul besar "RPM/RPP KURIKULUM BERBASIS CINTA (KBC)" di tengah, diikuti tabel identitas (Satuan Pendidikan, Mata Pelajaran, Kelas, Fase, Tahun Pelajaran, Topik, Alokasi Waktu).
2. Bagian I: IDENTIFIKASI: Identifikasi Murid, Identifikasi Materi (Faktual, Konseptual, Prosedural, Metakognitif), Dimensi Profil Lulusan, Topik Panca Cinta, dan Materi Insersi.
3. Bagian II: DESAIN CAPAIAN: Lintas Disiplin Ilmu, Tabel Tujuan Pembelajaran, Topik Pembelajaran, Praktik Pedagogis, Kemitraan, Lingkungan Belajar, dan Pemanfaatan Digital.
4. Bagian III: PENGALAMAN BELAJAR: Kegiatan Awal (15 menit), Kegiatan Inti (60 menit) dengan 3 Tahap: Tahap 1 (Memahami), Tahap 2 (Mengaplikasikan), Tahap 3 (Merefleksi), Kegiatan Penutup (5 menit).
5. Bagian IV: ASESMEN: Asesmen Awal (5 soal PG & kunci), Asesmen Proses (Rubrik Penilaian Diskusi), Asesmen Akhir (Kisi-kisi, 10 soal PG, 3 soal Esai).
6. Footer Pengesahan: Tabel tanda tangan Kepala Sekolah dan Guru.

Aturan Visual & Gaya Bahasa:
- Warna: Biru tua (#0D2A4A) untuk judul besar dan header tabel.
- Font: 'Segoe UI', Arial, sans-serif.
- Tabel: border-collapse: collapse; width: 100%; border: 1px solid black;. Header biru tua, teks putih.
- Gaya Bahasa: Istilah khas KBC seperti "Murid", "Berkesadaran", "Menggembirakan", integrasi nilai keagamaan (Cinta Allah dan Rasul-Nya).

Output: Berikan HANYA kode HTML saja tanpa markdown penutup (\`\`\`html). Kode harus valid untuk dibuka di MS Word sebagai dokumen doc.`;

export default function App() {
  const [topic, setTopic] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [schoolName, setSchoolName] = useState('');
  const [learningModel, setLearningModel] = useState('Problem Based Learning (PBL)');
  const [meetingCount, setMeetingCount] = useState('1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const learningModels = [
    'Problem Based Learning (PBL)',
    'Project Based Learning (PjBL)',
    'Discovery Learning',
    'Inquiry Learning',
    'Cooperative Learning',
    'Direct Instruction'
  ];

  const generateRPP = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedHtml(null);

    const detailedPrompt = `
Buatkan dokumen lengkap RPM/RPP KBC sesuai instruksi sistem dengan identitas spesifik berikut:
- Topik Pembelajaran: ${topic}
- Model Pembelajaran: ${learningModel}
- Jumlah Pertemuan: ${meetingCount} Pertemuan
- Nama Guru: ${teacherName || '(Nama Guru)'}
- Nama Kepala Sekolah: ${principalName || '(Nama Kepala Sekolah)'}
- Tahun Pelajaran: ${academicYear}
- Satuan Pendidikan/Sekolah: ${schoolName || '(Nama Sekolah)'}

INSTRUKSI KHUSUS INTEGRASI MODEL & PERTEMUAN:
1. Bagi Bagian III (Pengalaman Belajar) menjadi ${meetingCount} sesi pertemuan yang terpisah.
2. Untuk setiap pertemuan, integrasikan syntaks dari model "${learningModel}" ke dalam 3 Tahap KBC:
   - Tahap 1 (Memahami): Deskripsikan aktivitas awal/orientasi model.
   - Tahap 2 (Mengaplikasikan): Deskripsikan aktivitas inti/eksplorasi model.
   - Tahap 3 (Merefleksi): Deskripsikan aktivitas penutup/refleksi model.
3. Pastikan alur antar pertemuan berkesinambungan dan mencerminkan nilai-nilai Cinta (Kesadaran, Empati, Syukur).
4. Alokasi waktu total disesuaikan secara logis berdasarkan jumlah pertemuan yang dipilih.

Pastikan data di atas muncul dengan tepat di Tabel Identitas dan bagian Tanda Tangan/Footer Pengesahan.
`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: detailedPrompt,
          systemInstruction: SYSTEM_PROMPT
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menghubungi server');
      }

      const result = await response.json();
      const text = result.text || '';
      const cleaned = text.replace(/```html|```|```html\n|```\n/g, '').trim();
      
      if (cleaned) {
        setGeneratedHtml(cleaned);
      } else {
        setError('AI memberikan respon kosong. Silakan coba deskripsi topik yang berbeda.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menghasilkan RPP. Silakan coba lagi nanti atau periksa koneksi internet Anda.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedHtml) return;
    
    const blob = new Blob([generatedHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RPP_KBC_${topic.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-['Segoe_UI',_Arial,_sans-serif] text-slate-800">
      {/* Header Kop-inspired Header */}
      <header className="bg-white border-b border-[#cbd5e1] sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#0D2A4A] p-1.5 rounded-[4px]">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider text-[#0D2A4A] uppercase">RPP KBC Generator</h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">Professional Polish Edition</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <span className="text-[11px] font-bold text-[#0D2A4A] italic px-3 py-1 bg-[#e0f2fe] border border-[#bae6fd] rounded-[4px]">Berkesadaran & Penuh Cinta</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Intro Section */}
        <section className="text-center space-y-3 pb-4">
          <h2 className="text-3xl font-extrabold text-[#0D2A4A] uppercase tracking-tight">Perancang RPP Kurikulum Berbasis Cinta</h2>
          <div className="w-24 h-1 bg-[#0D2A4A] mx-auto rounded-full" />
          <p className="text-slate-600 max-w-xl mx-auto text-sm font-medium">Mewujudkan Murid Berkesadaran Tinggi dan Penuh Cinta melalui Desain Instruksional yang Terstruktur.</p>
        </section>

        {/* Input Area - document-canvas inspired */}
        <section className="bg-white border border-[#cbd5e1] rounded-[4px] shadow-[0_10px_25px_rgba(0,0,0,0.1)] p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#0D2A4A] uppercase tracking-[0.15em] flex items-center gap-2">
                <Layout className="w-3 h-3" /> Nama Satuan Pendidikan
              </label>
              <input
                type="text"
                placeholder="Contoh: SD Islam Al-Azhar"
                className="w-full px-4 py-3 rounded-[4px] border border-[#cbd5e1] focus:ring-1 focus:ring-[#0D2A4A] focus:border-[#0D2A4A] bg-[#f8fafc] transition-all text-sm outline-none font-medium text-slate-700"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#0D2A4A] uppercase tracking-[0.15em] flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Tahun Pelajaran
              </label>
              <input
                type="text"
                placeholder="2025-2026"
                className="w-full px-4 py-3 rounded-[4px] border border-[#cbd5e1] focus:ring-1 focus:ring-[#0D2A4A] focus:border-[#0D2A4A] bg-[#f8fafc] transition-all text-sm outline-none font-medium text-slate-700"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#0D2A4A] uppercase tracking-[0.15em] flex items-center gap-2">
                <BookOpen className="w-3 h-3" /> Nama Guru Pengampu
              </label>
              <input
                type="text"
                placeholder="Contoh: Budi Santoso, S.Pd"
                className="w-full px-4 py-3 rounded-[4px] border border-[#cbd5e1] focus:ring-1 focus:ring-[#0D2A4A] focus:border-[#0D2A4A] bg-[#f8fafc] transition-all text-sm outline-none font-medium text-slate-700"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#0D2A4A] uppercase tracking-[0.15em] flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" /> Nama Kepala Sekolah
              </label>
              <input
                type="text"
                placeholder="Contoh: Dr. Herman Wijaya"
                className="w-full px-4 py-3 rounded-[4px] border border-[#cbd5e1] focus:ring-1 focus:ring-[#0D2A4A] focus:border-[#0D2A4A] bg-[#f8fafc] transition-all text-sm outline-none font-medium text-slate-700"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#0D2A4A] uppercase tracking-[0.15em] flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Model Pembelajaran
              </label>
              <select
                className="w-full px-4 py-3 rounded-[4px] border border-[#cbd5e1] focus:ring-1 focus:ring-[#0D2A4A] focus:border-[#0D2A4A] bg-[#f8fafc] transition-all text-sm outline-none font-medium text-slate-700 appearance-none cursor-pointer"
                value={learningModel}
                onChange={(e) => setLearningModel(e.target.value)}
              >
                {learningModels.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#0D2A4A] uppercase tracking-[0.15em] flex items-center gap-2">
                <Layout className="w-3 h-3" /> Jumlah Pertemuan
              </label>
              <select
                className="w-full px-4 py-3 rounded-[4px] border border-[#cbd5e1] focus:ring-1 focus:ring-[#0D2A4A] focus:border-[#0D2A4A] bg-[#f8fafc] transition-all text-sm outline-none font-medium text-slate-700 appearance-none cursor-pointer"
                value={meetingCount}
                onChange={(e) => setMeetingCount(e.target.value)}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>{num} Pertemuan</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5 mb-6 text-center">
            <label className="text-[10px] font-bold text-[#0D2A4A] uppercase tracking-[0.2em]">Topik Utama Pembelajaran</label>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Masukkan Topik Pembelajaran (Contoh: Ekosistem & Harmoni Alam)"
                className="w-full pl-12 pr-4 py-3.5 rounded-[4px] border border-[#cbd5e1] focus:ring-1 focus:ring-[#0D2A4A] focus:border-[#0D2A4A] bg-[#f8fafc] transition-all text-base outline-none font-medium"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateRPP()}
              />
            </div>
            <button
              onClick={generateRPP}
              disabled={isGenerating || !topic.trim()}
              className={`
                px-10 py-3.5 rounded-[4px] font-bold text-white flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-sm
                ${isGenerating || !topic.trim() 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-[#0D2A4A] hover:bg-[#1e4b8a] active:scale-[0.98] shadow-[0_4px_10px_rgba(13,42,74,0.3)]'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Buat Dokumen
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-[4px] flex items-center gap-3 text-red-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </section>

        {/* Results with Document Canvas Aesthetic */}
        <AnimatePresence mode="wait">
          {generatedHtml ? (
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-6 bg-[#0D2A4A] rounded-full" />
                  <h3 className="text-lg font-bold text-[#0D2A4A] uppercase tracking-wide">Hasil Pratinjau Dokumen</h3>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0D2A4A] text-white rounded-full text-xs font-bold hover:bg-[#1e4b8a] transition-all shadow-[0_4px_10px_rgba(13,42,74,0.3)] uppercase tracking-wide"
                >
                  <Download className="w-4 h-4" />
                  Unduh RPP (.doc)
                </button>
              </div>

              {/* The "document-canvas" Container */}
              <div className="bg-white border border-[#cbd5e1] rounded-[4px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-10 max-h-[1000px] overflow-y-auto relative bg-[repeating-linear-gradient(#f8fafc_0px,#f8fafc_20px,#ffffff_20px,#ffffff_40px)] bg-fixed">
                <div className="bg-white min-h-full p-8 shadow-sm border border-slate-100 relative overflow-x-auto">
                  <div 
                    dangerouslySetInnerHTML={{ __html: generatedHtml }} 
                    className="max-w-none text-slate-800 document-content" 
                  />
                  
                  {/* Watermark/Footer inspired detail */}
                  <div className="mt-12 pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    <span>KBC Professional Polish</span>
                    <span>Halaman 1 dari 1</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#e0f2fe] border border-[#bae6fd] rounded-[4px] flex items-start gap-3">
                <div className="p-1.5 bg-white rounded-[4px] border border-[#bae6fd]">
                  <AlertCircle className="w-4 h-4 text-[#0D2A4A]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0D2A4A] text-xs uppercase tracking-wide">Instruksi Konversi</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 font-medium"> File .doc hasil unduhan dioptimalkan untuk Microsoft Word. Buka di Word dan simpan kembali ke format PDF untuk hasil cetak yang sempurna.</p>
                </div>
              </div>
            </motion.section>
          ) : isGenerating ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-5 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-[#0D2A4A]" />
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-[#0D2A4A] uppercase tracking-widest">Merancang dengan Kasih...</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold">Dokumen instruksional sedang dioptimasi</p>
              </div>
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-[#cbd5e1] bg-white/50 rounded-[4px]">
              <FileText className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-50">Menunggu Topik Pembelajaran</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-[#cbd5e1] py-10 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0D2A4A]" />
            <span className="text-[10px] font-bold text-[#0D2A4A] uppercase tracking-[0.4em]">Kurikulum Berbasis Cinta</span>
          </div>
          <div className="flex gap-4">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Profesional</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">•</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Berkesadaran</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">•</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Bernilai Tinggi</span>
          </div>
          <p className="text-[9px] text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} Yayasan Kurikulum Berbasis Cinta. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
