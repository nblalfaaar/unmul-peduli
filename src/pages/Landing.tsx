import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Gift, HandHeart, HeartHandshake, Search, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { listPengajuanPublik, listPenawaran } from '../lib/api'
import { useData, useTitle } from '../lib/hooks'
import { useAuth } from '../lib/auth'
import { KATEGORI } from '../lib/constants'
import type { Penawaran, Pengajuan } from '../lib/firebase'
import HeroArt from '../components/HeroArt'
import { NeedCard, OfferCard } from '../components/Cards'
import { AnimatedNumber, CardSkeletons, EmptyState, Reveal, stagger } from '../components/ui'

const CHIP_STYLES = ['dark', 'peach', '', 'dark', 'peach', '', 'dark', '', 'peach', '', 'dark']

export default function Landing() {
  useTitle('Berbagi Bantuan di Universitas Mulawarman')
  const nav = useNavigate()
  const { hash } = useLocation()
  const { user } = useAuth()

  const { data, loading } = useData(
    async () => {
      const [req, off] = await Promise.all([listPengajuanPublik().catch(() => []), listPenawaran().catch(() => [])])
      return { req, off }
    },
    [],
    { req: [] as Pengajuan[], off: [] as Penawaran[] },
  )

  const tersedia = data.off.filter((o) => o.status === 'Tersedia')
  const terbuka = data.req.filter((r) => r.status === 'Terverifikasi')
  const selesai = data.req.filter((r) => r.status === 'Selesai')

  const [kat, setKat] = useState('Semua')
  const tampil = (kat === 'Semua' ? terbuka : terbuka.filter((r) => r.kategori === kat)).slice(0, 3)

  const [quiz, setQuiz] = useState({ peran: 'bantu', kategori: '', urgensi: '', q: '' })

  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 120)
  }, [hash])

  function jalankanQuiz() {
    const p = new URLSearchParams()
    if (quiz.kategori) p.set('kategori', quiz.kategori)
    if (quiz.urgensi && quiz.peran === 'bantu') p.set('urgensi', quiz.urgensi)
    if (quiz.q.trim()) p.set('q', quiz.q.trim())
    nav(`${quiz.peran === 'bantu' ? '/bantuan' : '/penawaran'}${p.toString() ? `?${p}` : ''}`)
  }

  const chips = [...KATEGORI.map((k) => ({ label: k === 'Lainnya' ? 'Bantuan lainnya' : k, to: `/bantuan?kategori=${encodeURIComponent(k)}` })), { label: 'Verifikasi pengajuan', to: '/#cara-kerja' }, { label: 'Pelacakan status', to: '/#cara-kerja' }, { label: 'Mahasiswa, dosen & staf', to: '/register' }, { label: 'Pencocokan kebutuhan', to: '/bantuan' }, { label: 'Riwayat tercatat', to: '/#cara-kerja' }, { label: 'Gratis', to: '/register' }]

  return (
    <>
      {/* HERO */}
      <section className="hero" id="home">
        <HeroArt />
        <div className="hero-inner">
          <motion.h1 className="hero-word" initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            unmul peduli
          </motion.h1>
          <motion.p className="hero-sub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }}>
            Platform bantuan yang mempertemukan yang membutuhkan dan yang ingin membantu, di lingkungan Universitas Mulawarman. Terorganisasi, transparan, tepat sasaran.
          </motion.p>
          <motion.div className="row row-wrap" style={{ justifyContent: 'center' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}>
            <button className="btn btn-primary btn-lg" style={{ background: 'var(--c-deep)', color: '#fff' }} onClick={() => nav(user ? '/ajukan' : '/register')}>
              {user ? 'Ajukan bantuan' : 'Mulai berbagi sekarang'} <ArrowRight size={17} />
            </button>
            <Link to="/bantuan" className="btn btn-lg btn-light" style={{ boxShadow: 'var(--shadow-sm)' }}>Lihat daftar bantuan</Link>
          </motion.div>
        </div>
        <motion.div className="hero-title" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.9 }}>
          Satu <span className="hl">kampus.</span>
          <br />
          Satu <span className="hl2">kepedulian.</span>
        </motion.div>
      </section>

      <div className="band-dark">
        <div className="container" style={{ paddingBottom: 90 }}>
          {/* SHEET */}
          <Reveal className="sheet">
            <div>
              <h2>Bantuan untuk setiap kebutuhan sivitas akademika</h2>
              <div className="chips">
                {chips.map((c, i) => (
                  <Link key={c.label} to={c.to} className={`chip ${CHIP_STYLES[i % CHIP_STYLES.length]}`}>{c.label}</Link>
                ))}
              </div>
            </div>
            <div className="sheet-aside">
              <div>
                <h3>UNMUL Peduli lebih dari sekadar grup chat</h3>
                <p style={{ marginTop: 12 }}>Tidak ada lagi info bantuan yang tenggelam di grup WhatsApp. Semua pengajuan <b>diverifikasi</b>, <b>dicocokkan</b>, dan <b>dilacak</b> sampai selesai.</p>
              </div>
              <p><b>Siapa pun</b> di UNMUL bisa mengajukan maupun menawarkan bantuan.</p>
            </div>
          </Reveal>

          {/* CARA KERJA */}
          <div id="cara-kerja" style={{ paddingTop: 96 }}>
            <div className="how-grid">
              <Reveal className="how-intro">
                <span className="badge badge-dark" style={{ background: 'rgba(255,255,255,.12)' }}><Sparkles size={13} /> Cara kerja</span>
                <h2 style={{ fontSize: 'clamp(30px,3.6vw,44px)', fontWeight: 600, marginTop: 14 }}>Tiga langkah sederhana</h2>
                <p>Alur dirancang singkat supaya bantuan cepat sampai. Setiap langkah tercatat dan dapat dipantau kedua belah pihak.</p>
              </Reveal>
              {[
                { c: 'c1', no: '01', icon: HandHeart, t: 'Ajukan kebutuhan', d: 'Ceritakan kebutuhanmu: jenis, jumlah, kondisi, urgensi, dan batas waktu. Verifikator memeriksa kelengkapan datanya.', to: user ? '/ajukan' : '/register', cta: 'Ajukan bantuan' },
                { c: 'c2', no: '02', icon: Gift, t: 'Tawarkan bantuan', d: 'Punya buku, makanan, pakaian, atau dana lebih? Tawarkan, atau langsung pilih pengajuan yang ingin kamu bantu.', to: user ? '/tawarkan' : '/register', cta: 'Tawarkan bantuan' },
                { c: 'c3', no: '03', icon: ShieldCheck, t: 'Pantau sampai selesai', d: 'Status berjalan dari Pengajuan, Verifikasi, Pencocokan, Penyaluran, hingga Selesai, lengkap dengan riwayat dan notifikasi.', to: '/bantuan', cta: 'Lihat daftar bantuan' },
              ].map((s, i) => (
                <Reveal key={s.c} delay={0.1 * (i + 1)} className={`how-card ${s.c}`}>
                  <s.icon size={190} className="ill" strokeWidth={1} />
                  <div style={{ position: 'relative' }}>
                    <span className="no">{s.no}</span>
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </div>
                  <Link to={s.to} className="btn btn-light" style={{ position: 'relative', justifySelf: 'start' }}>{s.cta} <ArrowRight size={15} /></Link>
                </Reveal>
              ))}
            </div>
          </div>

          {/* QUIZ */}
          <Reveal className="quiz" id="temukan">
            <h3>Bantuan apa yang cocok untukmu?</h3>
            <div className="quiz-grid">
              <div className="field"><label htmlFor="q-peran">Saya ingin</label>
                <select id="q-peran" className="select" value={quiz.peran} onChange={(e) => setQuiz({ ...quiz, peran: e.target.value })}>
                  <option value="bantu">Membantu orang lain</option>
                  <option value="butuh">Mencari bantuan</option>
                </select>
              </div>
              <div className="field"><label htmlFor="q-kat">Jenis bantuan</label>
                <select id="q-kat" className="select" value={quiz.kategori} onChange={(e) => setQuiz({ ...quiz, kategori: e.target.value })}>
                  <option value="">Semua jenis</option>
                  {KATEGORI.map((k) => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div className="field"><label htmlFor="q-urg">Tingkat urgensi</label>
                <select id="q-urg" className="select" value={quiz.urgensi} disabled={quiz.peran !== 'bantu'} onChange={(e) => setQuiz({ ...quiz, urgensi: e.target.value })}>
                  <option value="">Semua tingkat</option>
                  <option value="tinggi">Mendesak</option>
                  <option value="sedang">Sedang</option>
                  <option value="rendah">Rendah</option>
                </select>
              </div>
              <div className="field"><label htmlFor="q-kata">Kata kunci</label>
                <input id="q-kata" className="input" style={{ background: 'var(--c-surface)', border: 0 }} placeholder="Contoh: buku, beras" value={quiz.q} onChange={(e) => setQuiz({ ...quiz, q: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && jalankanQuiz()} />
              </div>
            </div>
            <button className="btn btn-primary btn-lg" style={{ background: 'var(--c-deep)', color: '#fff' }} onClick={jalankanQuiz}><Search size={17} /> Tampilkan bantuan yang cocok</button>
          </Reveal>
        </div>
      </div>

      {/* DATA TERBARU */}
      <section className="section band-light">
        <div className="container">
          <Reveal>
            <div className="stats" style={{ marginBottom: 72 }}>
              {[
                { n: terbuka.length, l: 'Pengajuan menunggu dibantu', icon: HandHeart },
                { n: selesai.length, l: 'Bantuan berhasil tersalurkan', icon: HeartHandshake },
                { n: tersedia.length, l: 'Penawaran tersedia', icon: Gift },
                { n: data.req.length + data.off.length, l: 'Total aktivitas bantuan', icon: Users },
              ].map((s) => (
                <div className="stat-big" key={s.l}>
                  <s.icon size={22} style={{ color: 'var(--c-primary)', marginBottom: 12 }} />
                  <b><AnimatedNumber value={s.n} /></b>
                  <span>{s.l}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="sec-head">
            <Reveal><h2>Pengajuan yang butuh uluran tanganmu</h2></Reveal>
            <Link to="/bantuan" className="btn btn-outline">Lihat semua <ArrowRight size={15} /></Link>
          </div>
          <div className="filter-row" style={{ marginTop: 0 }}>
            {['Semua', ...KATEGORI].map((c) => (
              <button key={c} className={`pill-filter ${kat === c ? 'on' : ''}`} onClick={() => setKat(c)}>{c}</button>
            ))}
          </div>
          {loading ? <CardSkeletons n={3} /> : tampil.length === 0 ? (
            <EmptyState icon={HandHeart} title="Belum ada pengajuan terbuka" desc="Jadilah yang pertama mengajukan atau tawarkan bantuanmu." action={<Link to="/ajukan" className="btn btn-primary">Ajukan bantuan</Link>} />
          ) : (
            <motion.div className="cards-grid" variants={stagger} initial="hidden" animate="show" key={kat}>
              {tampil.map((p) => <NeedCard key={p.id} p={p} />)}
            </motion.div>
          )}

          <div className="sec-head" style={{ marginTop: 80 }}>
            <Reveal><h2>Penawaran bantuan terbaru</h2></Reveal>
            <Link to="/penawaran" className="btn btn-outline">Lihat semua <ArrowRight size={15} /></Link>
          </div>
          {loading ? <CardSkeletons n={3} /> : tersedia.length === 0 ? (
            <EmptyState icon={Gift} title="Belum ada penawaran tersedia" desc="Punya sesuatu yang bisa dibagi? Tawarkan sekarang." action={<Link to="/tawarkan" className="btn btn-primary">Tawarkan bantuan</Link>} />
          ) : (
            <motion.div className="cards-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {tersedia.slice(0, 3).map((p) => <OfferCard key={p.id} p={p} />)}
            </motion.div>
          )}

          <Reveal style={{ marginTop: 90 }}>
            <div className="sheet-aside" style={{ padding: '44px 40px', borderRadius: 32, gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 'clamp(24px,3vw,34px)' }}>Siap berbagi kepedulian?</h3>
                <p style={{ marginTop: 10, maxWidth: 520 }}>Buat akun dengan email kampusmu dalam satu menit, lalu ajukan atau tawarkan bantuan.</p>
              </div>
              <Link to={user ? '/dashboard' : '/register'} className="btn btn-light btn-lg">{user ? 'Buka dashboard' : 'Daftar gratis'} <ArrowRight size={17} /></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
