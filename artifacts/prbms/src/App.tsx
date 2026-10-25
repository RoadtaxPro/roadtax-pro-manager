import { useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { CustomerManagement } from '@/components/customers/CustomerManagement';
import { DEMO_CUSTOMERS, type CustomerRecord } from '@/components/customers/customer-types';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, CalendarDays,
  CarFront, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp,
  ClipboardCheck, Download, FileBarChart2, FileText, Filter, LayoutDashboard,
  Menu, MoreHorizontal, Plus, Search, Settings2, ShieldCheck, SlidersHorizontal,
  Users, Wallet, X, CircleAlert, ReceiptText, BadgeCheck, ChartNoAxesCombined,
} from 'lucide-react';

type Row = { name: string; detail: string; status: string; amount?: string; date?: string; extra?: string };

const nav = [
  { title: 'Ruang kerja', links: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Pelanggan', path: '/pelanggan', icon: Users, count: '128' },
    { label: 'Kenderaan', path: '/kenderaan', icon: CarFront },
  ]},
  { title: 'Pengurusan', links: [
    { label: 'Sebutharga', path: '/sebut-harga', icon: FileText },
    { label: 'Pembaharuan', path: '/pembaharuan', icon: ClipboardCheck, count: '12' },
    { label: 'Invois', path: '/invois', icon: ReceiptText },
    { label: 'Kewangan', path: '/kewangan', icon: Wallet },
  ]},
  { title: 'Organisasi', links: [
    { label: 'Laporan', path: '/laporan', icon: FileBarChart2 },
    { label: 'Pengguna', path: '/pengguna', icon: Settings2 },
  ]},
];

const mockRows: Record<string, Row[]> = {
  '/pelanggan': [
    { name: 'Nur Aisyah binti Rahman', detail: 'Pelanggan sejak Mac 2023 · 2 kenderaan', status: 'Aktif', date: '12 Jun 2025', extra: '012-889 2314' },
    { name: 'Muhammad Firdaus Ismail', detail: 'Pelanggan sejak Jan 2024 · 1 kenderaan', status: 'Aktif', date: '10 Jun 2025', extra: '013-442 9081' },
    { name: 'Tan Mei Ling', detail: 'Pelanggan sejak Ogos 2022 · 3 kenderaan', status: 'Aktif', date: '08 Jun 2025', extra: '016-221 7650' },
    { name: 'Siti Hajar Mohd Noor', detail: 'Pelanggan sejak Apr 2024 · 1 kenderaan', status: 'Perlu tindakan', date: '05 Jun 2025', extra: '017-883 0421' },
    { name: 'Kumaravel a/l Muthu', detail: 'Pelanggan sejak Nov 2023 · 2 kenderaan', status: 'Aktif', date: '02 Jun 2025', extra: '019-334 5198' },
  ],
  '/kenderaan': [
    { name: 'Perodua Myvi 1.5 AV', detail: 'Nur Aisyah binti Rahman', status: 'Akan tamat', date: '18 Jun 2025', extra: 'VAB 4821' },
    { name: 'Honda City 1.5 V', detail: 'Muhammad Firdaus Ismail', status: 'Aktif', date: '02 Jul 2025', extra: 'BPU 9016' },
    { name: 'Toyota Vios 1.5 G', detail: 'Tan Mei Ling', status: 'Akan tamat', date: '07 Jul 2025', extra: 'WXY 6193' },
    { name: 'Proton X50 1.5 TGDi', detail: 'Siti Hajar Mohd Noor', status: 'Tamat tempoh', date: '11 Jun 2025', extra: 'JQK 7308' },
    { name: 'Perodua Bezza 1.3 X', detail: 'Kumaravel a/l Muthu', status: 'Aktif', date: '25 Ogos 2025', extra: 'PNA 2550' },
  ],
  '/sebut-harga': [
    { name: 'SQ-2025-0184', detail: 'Nur Aisyah binti Rahman · VAB 4821', status: 'Menunggu', date: 'Hari ini', amount: 'RM 1,248.60' },
    { name: 'SQ-2025-0183', detail: 'Tan Mei Ling · WXY 6193', status: 'Diluluskan', date: 'Semalam', amount: 'RM 1,092.40' },
    { name: 'SQ-2025-0182', detail: 'Kumaravel a/l Muthu · PNA 2550', status: 'Menunggu', date: '11 Jun 2025', amount: 'RM 876.20' },
    { name: 'SQ-2025-0181', detail: 'Siti Hajar Mohd Noor · JQK 7308', status: 'Ditolak', date: '10 Jun 2025', amount: 'RM 1,534.00' },
  ],
  '/pembaharuan': [
    { name: 'VAB 4821', detail: 'Nur Aisyah binti Rahman · Perodua Myvi', status: 'Menunggu bayaran', date: '18 Jun 2025', amount: 'RM 1,248.60' },
    { name: 'JQK 7308', detail: 'Siti Hajar Mohd Noor · Proton X50', status: 'Lewat', date: '11 Jun 2025', amount: 'RM 1,534.00' },
    { name: 'WXY 6193', detail: 'Tan Mei Ling · Toyota Vios', status: 'Dokumen diterima', date: '07 Jul 2025', amount: 'RM 1,092.40' },
    { name: 'BPU 9016', detail: 'Muhammad Firdaus Ismail · Honda City', status: 'Dalam proses', date: '02 Jul 2025', amount: 'RM 1,318.80' },
  ],
  '/invois': [
    { name: 'INV-2025-0321', detail: 'Nur Aisyah binti Rahman · VAB 4821', status: 'Belum dibayar', date: '12 Jun 2025', amount: 'RM 1,248.60' },
    { name: 'INV-2025-0320', detail: 'Tan Mei Ling · WXY 6193', status: 'Dibayar', date: '11 Jun 2025', amount: 'RM 1,092.40' },
    { name: 'INV-2025-0319', detail: 'Kumaravel a/l Muthu · PNA 2550', status: 'Dibayar', date: '10 Jun 2025', amount: 'RM 876.20' },
    { name: 'INV-2025-0318', detail: 'Siti Hajar Mohd Noor · JQK 7308', status: 'Lewat', date: '09 Jun 2025', amount: 'RM 1,534.00' },
  ],
  '/pengguna': [
    { name: 'Farah Nadia Zulkifli', detail: 'farah.nadia@roadtaxpro.demo', status: 'Pengurus Besar', date: 'Aktif', extra: 'FN' },
    { name: 'Azlan Hakim', detail: 'azlan.hakim@roadtaxpro.demo', status: 'Jualan & Pemasaran', date: 'Aktif', extra: 'AH' },
    { name: 'Liew Wei Jian', detail: 'liew.weijian@roadtaxpro.demo', status: 'Operasi & Khidmat Pelanggan', date: 'Aktif', extra: 'LW' },
    { name: 'Nadia Syafiqah', detail: 'nadia.syafiqah@roadtaxpro.demo', status: 'Kewangan & Pentadbiran', date: 'Aktif', extra: 'NS' },
  ],
};

const pageInfo: Record<string, { title: string; crumb: string; desc: string; action: string }> = {
  '/pelanggan': { title: 'Pelanggan', crumb: 'Rekod pelanggan', desc: 'Urus maklumat pelanggan dan sejarah perkhidmatan.', action: 'Tambah pelanggan' },
  '/kenderaan': { title: 'Kenderaan', crumb: 'Kenderaan & cukai jalan', desc: 'Pantau kenderaan dan tarikh luput perlindungan.', action: 'Tambah kenderaan' },
  '/sebut-harga': { title: 'Sebutharga', crumb: 'Insurans & takaful', desc: 'Sediakan dan jejak tawaran perlindungan pelanggan.', action: 'Buat sebutharga' },
  '/pembaharuan': { title: 'Pembaharuan', crumb: 'Polisi & cukai jalan', desc: 'Kekalkan setiap pembaharuan bergerak mengikut jadual.', action: 'Rekod pembaharuan' },
  '/invois': { title: 'Invois', crumb: 'Bayaran pelanggan', desc: 'Jejak invois, kutipan dan baki tertunggak.', action: 'Cipta invois' },
  '/kewangan': { title: 'Kewangan', crumb: 'Ringkasan kewangan', desc: 'Asingkan hasil perkhidmatan, komisen dan premium pelanggan.', action: 'Rekod transaksi' },
  '/laporan': { title: 'Laporan', crumb: 'Analitik perniagaan', desc: 'Lihat prestasi operasi Roadtax Pro dari satu tempat.', action: 'Muat turun laporan' },
  '/pengguna': { title: 'Pengguna', crumb: 'Pasukan & akses', desc: 'Urus pasukan dan peranan akses ruang kerja.', action: 'Tambah pengguna' },
};

function App() {
  const [path, setPath] = useLocation();
  const [customers, setCustomers] = useState<CustomerRecord[]>(DEMO_CUSTOMERS);
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [modal, setModal] = useState(false);
  const [notice, setNotice] = useState('');
  const [role, setRole] = useState('Pengurus Besar');
  const [period, setPeriod] = useState('30 hari');
  const [extraRows, setExtraRows] = useState<Record<string, Row[]>>({});
  const current = path === '/' ? '/dashboard' : path;
  const isDashboard = current === '/dashboard';
  const info = pageInfo[current] || pageInfo['/pelanggan'];
  const rows = useMemo(() => [...(extraRows[current] || []), ...(mockRows[current] || [])]
    .filter((r) => `${r.name} ${r.detail} ${r.extra || ''}`.toLowerCase().includes(query.toLowerCase()))
    .filter((r) => filter === 'Semua' || r.status === filter), [current, query, filter, extraRows]);
  const flash = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(''), 2800); };
  const handleAction = () => {
    if (current === '/laporan') { flash('Laporan demo sedia untuk dimuat turun.'); return; }
    setModal(true);
  };

  return (
    <div className="app-shell">
      {mobileNav && <button className="scrim" aria-label="Tutup menu" onClick={() => setMobileNav(false)} />}
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <Link href="/dashboard" className="brand" onClick={() => setMobileNav(false)}>
          <span className="brand-mark"><ShieldCheck size={21} strokeWidth={2.4} /></span>
          <span className="brand-text">roadtax<span>pro</span><small>WORKSPACE</small></span>
        </Link>
        <div className="workspace-switch">
          <div className="workspace-icon">RP</div><div className="workspace-name">Roadtax Pro<small>Pasukan Kuala Lumpur</small></div><ChevronDown size={15} />
        </div>
        <div className="sidebar-scroll">
          {nav.map((group) => <div className="nav-group" key={group.title}>
            <div className="nav-heading">{group.title}</div>
            {group.links.map(({ label, path: route, icon: Icon, count }) => (
              <Link href={route} key={route} className={`nav-link ${current === route ? 'active' : ''}`} onClick={() => setMobileNav(false)} data-testid={`link-${route.slice(1)}`}>
                <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{count && <span className="nav-count">{count}</span>}
              </Link>
            ))}
          </div>)}
        </div>
        <div className="sidebar-bottom">
          <div className="help-box"><CircleHelp size={17} /><div><b>Perlukan bantuan?</b><small>Hubungi pasukan sokongan</small></div><ArrowRight size={15} /></div>
          <div className="profile">
            <div className="avatar">FN</div><div className="profile-name">Farah Nadia<small>{role}</small></div><button className="icon-btn light" onClick={() => flash('Tetapan profil demo')} aria-label="Tetapan profil"><MoreHorizontal size={18} /></button>
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-btn" onClick={() => setMobileNav(true)} aria-label="Buka menu"><Menu size={20} /></button>
          <div className="crumb"><span>Roadtax Pro</span><ChevronRight size={14} /><b>{isDashboard ? 'Dashboard' : info.crumb}</b></div>
          <div className="top-actions">
            <div className="today"><CalendarDays size={15} /> Khamis, 12 Jun 2025</div>
            <button className="icon-btn notification" onClick={() => flash('Tiada pemberitahuan baharu')} aria-label="Pemberitahuan"><Bell size={18} /><i /></button>
            <div className="role-select"><select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Pilih peranan" data-testid="select-role"><option>Pengurus Besar</option><option>Jualan & Pemasaran</option><option>Operasi & Khidmat Pelanggan</option><option>Kewangan & Pentadbiran</option></select><ChevronDown size={13} /></div>
          </div>
        </header>
        <div className="content">
          {isDashboard ? <Dashboard period={period} setPeriod={setPeriod} onNavigate={setPath} flash={flash} /> :
            current === '/pelanggan' ?
              <CustomerManagement customers={customers} setCustomers={setCustomers} notify={flash} /> :
              <ModulePage path={current} info={info} rows={rows} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} onAction={handleAction} flash={flash} />}
          <footer className="footer"><span>© 2025 Roadtax Pro <b>·</b> Ruang kerja demo</span><span>Data contoh sahaja <span className="footer-dot" /> Semua tindakan tidak disimpan</span></footer>
        </div>
      </main>
      {modal && <AddModal path={current} title={info.action} onClose={() => setModal(false)} onSave={(row) => {
        setExtraRows((old) => ({ ...old, [current]: [row, ...(old[current] || [])] }));
        setModal(false); flash('Rekod demo ditambah dalam sesi ini sahaja.');
      }} />}
      {notice && <div className="toast"><span className="toast-check"><Check size={14} /></span>{notice}<button onClick={() => setNotice('')} aria-label="Tutup"><X size={15} /></button></div>}
    </div>
  );
}

function Dashboard({ period, setPeriod, onNavigate, flash }: { period: string; setPeriod: (v: string) => void; onNavigate: (v: string) => void; flash: (v: string) => void }) {
  const [tab, setTab] = useState('Semua');
  const reminders = [
    { plate: 'VAB 4821', name: 'Nur Aisyah binti Rahman', vehicle: 'Perodua Myvi 1.5 AV', date: '18 Jun', days: '6 hari lagi', state: 'urgent' },
    { plate: 'JQK 7308', name: 'Siti Hajar Mohd Noor', vehicle: 'Proton X50 1.5 TGDi', date: '11 Jun', days: 'Lewat 1 hari', state: 'late' },
    { plate: 'WXY 6193', name: 'Tan Mei Ling', vehicle: 'Toyota Vios 1.5 G', date: '07 Jul', days: '25 hari lagi', state: 'soon' },
  ];
  return <div className="dashboard-page">
    <div className="welcome-row">
      <div><div className="eyebrow"><span className="eyebrow-line" /> KHAMIS, 12 JUN 2025</div><h1>Selamat pagi, Farah<span className="wave">.</span></h1><p>Berikut ringkasan operasi Roadtax Pro hari ini.</p></div>
      <button className="primary-btn" onClick={() => onNavigate('/sebut-harga')}><Plus size={17} /> Sebutharga baharu</button>
    </div>
    <div className="demo-strip"><span className="demo-icon"><Activity size={15} /></span><b>Mod demonstrasi</b><span>Angka dan rekod yang dipaparkan ialah data contoh rekaan, bukan data pelanggan sebenar.</span><button onClick={() => flash('Semua data adalah contoh rekaan.')}>Ketahui lanjut <ArrowRight size={13} /></button></div>
    <div className="metrics-grid">
      <Metric icon={Users} label="Jumlah pelanggan" value="128" foot="+8 pelanggan bulan ini" trend="up" color="green" />
      <Metric icon={CarFront} label="Kenderaan berdaftar" value="164" foot="12 perlu diperbaharui" trend="flat" color="blue" />
      <Metric icon={Wallet} label="Hasil bulan ini" value="RM 18,420" foot="+12.8% berbanding bulan lalu" trend="up" color="amber" />
      <Metric icon={CircleAlert} label="Bayaran tertunggak" value="RM 4,812" foot="4 invois belum dijelaskan" trend="down" color="red" />
    </div>
    <div className="dashboard-grid">
      <section className="panel revenue-panel">
        <div className="panel-head"><div><div className="section-kicker">PRESTASI</div><h2>Ringkasan hasil</h2><p>Hasil terkumpul mengikut bulan</p></div><select className="period-select" value={period} onChange={(e) => setPeriod(e.target.value)}><option>30 hari</option><option>90 hari</option><option>Tahun ini</option></select></div>
        <div className="revenue-legend"><span><i className="legend-dot green-dot" /> Fi perkhidmatan</span><span><i className="legend-dot navy-dot" /> Komisen insurans</span><strong>RM 18,420 <small>+12.8%</small></strong></div>
        <RevenueChart />
      </section>
      <section className="panel breakdown-panel">
        <div className="panel-head"><div><div className="section-kicker">PECAHAN</div><h2>Sumber pendapatan</h2><p>Bulan Jun 2025</p></div><button className="icon-btn" onClick={() => onNavigate('/kewangan')} aria-label="Buka kewangan"><ArrowRight size={17} /></button></div>
        <div className="donut-wrap"><div className="donut"><div><b>RM 18.4k</b><small>Jumlah hasil</small></div></div></div>
        <div className="breakdown-list">
          <Breakdown color="green-dot" label="Fi perkhidmatan" value="RM 8,240" pct="44.7%" />
          <Breakdown color="navy-dot" label="Komisen insurans" value="RM 6,180" pct="33.6%" />
          <Breakdown color="gold-dot" label="Premium pelanggan" value="RM 4,000" pct="21.7%" />
        </div>
      </section>
      <section className="panel renewals-panel">
        <div className="panel-head renewal-head"><div><div className="section-kicker">TINDAKAN DIPERLUKAN</div><h2>Pembaharuan akan tiba</h2><p>Pastikan pelanggan dihubungi lebih awal.</p></div><button className="text-link" onClick={() => onNavigate('/pembaharuan')}>Lihat semua <ArrowRight size={14} /></button></div>
        <div className="tabs">{['Semua', 'Lewat', 'Akan tiba'].map((v) => <button className={tab === v ? 'tab active-tab' : 'tab'} onClick={() => setTab(v)} key={v}>{v}{v === 'Semua' && <span>12</span>}</button>)}</div>
        <div className="reminder-list">{reminders.filter((r) => tab === 'Semua' || (tab === 'Lewat' ? r.state === 'late' : r.state !== 'late')).map((r) => <div className="reminder-row" key={r.plate}>
          <div className={`reminder-date ${r.state}`}><b>{r.date.split(' ')[0]}</b><small>{r.date.split(' ')[1]}</small></div><div className="reminder-info"><b>{r.name}</b><span>{r.vehicle} <em>{r.plate}</em></span></div><div className={`reminder-state ${r.state}`}>{r.days}</div><button className="icon-btn row-more" onClick={() => flash(`Peringatan demo untuk ${r.plate}`)} aria-label="Tindakan pembaharuan"><MoreHorizontal size={17} /></button>
        </div>)}</div>
      </section>
      <section className="panel activity-panel">
        <div className="panel-head"><div><div className="section-kicker">TERKINI</div><h2>Aktiviti terkini</h2><p>Perkembangan pasukan hari ini</p></div><button className="icon-btn" onClick={() => flash('Paparan aktiviti demo')} aria-label="Lihat aktiviti"><MoreHorizontal size={17} /></button></div>
        <div className="activity-list">
          <ActivityRow initials="AH" color="lavender" title="Sebutharga diluluskan" description="Azlan meluluskan SQ-2025-0183 untuk Tan Mei Ling" time="10:42 pagi" />
          <ActivityRow initials="LW" color="mint" title="Bayaran diterima" description="Liew merekod bayaran RM 1,092.40 · WXY 6193" time="9:18 pagi" />
          <ActivityRow initials="NS" color="peach" title="Pelanggan baharu ditambah" description="Nadia menambah rekod pelanggan · Amirul Hakim" time="8:56 pagi" />
        </div>
        <button className="activity-all" onClick={() => flash('Aktiviti penuh tersedia dalam demo ini.')}>Lihat semua aktiviti <ArrowRight size={14} /></button>
      </section>
    </div>
  </div>;
}

function Metric({ icon: Icon, label, value, foot, trend, color }: { icon: typeof Users; label: string; value: string; foot: string; trend: string; color: string }) {
  return <div className="metric-card"><div className={`metric-icon ${color}`}><Icon size={18} strokeWidth={1.9} /></div><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className="metric-foot">{trend === 'up' ? <ArrowUpRight size={14} /> : trend === 'down' ? <ArrowDownRight size={14} /> : <span className="tiny-line" />}{foot}</span></div>;
}
function RevenueChart() {
  const values = [35, 47, 40, 57, 49, 67, 62, 53, 74, 68, 84, 72];
  return <div className="chart-wrap"><div className="chart-y"><span>RM 8k</span><span>RM 6k</span><span>RM 4k</span><span>RM 2k</span><span>RM 0</span></div><div className="chart-main"><div className="chart-gridlines"><i /><i /><i /><i /><i /></div><div className="chart-bars">{values.map((v, i) => <div className="bar-pair" key={i}><i className="bar service" style={{ height: `${v}%` }} /><i className="bar commission" style={{ height: `${Math.max(13, v * 0.57)}%` }} /></div>)}</div><div className="chart-x">{['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun'].map((v) => <span key={v}>{v}</span>)}</div></div></div>;
}
function Breakdown({ color, label, value, pct }: { color: string; label: string; value: string; pct: string }) {
  return <div className="breakdown-item"><i className={`legend-dot ${color}`} /><span>{label}</span><b>{value}</b><small>{pct}</small></div>;
}
function ActivityRow({ initials, color, title, description, time }: { initials: string; color: string; title: string; description: string; time: string }) {
  return <div className="activity-row"><div className={`activity-avatar ${color}`}>{initials}</div><div className="activity-copy"><b>{title}</b><span>{description}</span></div><time>{time}</time></div>;
}

function ModulePage({ path, info, rows, query, setQuery, filter, setFilter, onAction, flash }: {
  path: string; info: { title: string; crumb: string; desc: string; action: string }; rows: Row[]; query: string; setQuery: (v: string) => void; filter: string; setFilter: (v: string) => void; onAction: () => void; flash: (v: string) => void;
}) {
  const financial = path === '/kewangan';
  const reports = path === '/laporan';
  const users = path === '/pengguna';
  const filters = path === '/pembaharuan' ? ['Semua', 'Menunggu bayaran', 'Lewat', 'Dalam proses'] : path === '/invois' ? ['Semua', 'Belum dibayar', 'Dibayar', 'Lewat'] : path === '/kenderaan' ? ['Semua', 'Aktif', 'Akan tamat', 'Tamat tempoh'] : ['Semua', 'Aktif', 'Perlu tindakan'];
  return <div className="module-page">
    <div className="module-header"><div><div className="eyebrow"><span className="eyebrow-line" /> {info.crumb.toUpperCase()}</div><h1>{info.title}</h1><p>{info.desc}</p></div><button className={`primary-btn ${reports ? 'secondary-action' : ''}`} onClick={onAction}>{reports ? <Download size={16} /> : <Plus size={17} />}{info.action}</button></div>
    {financial ? <FinanceContent /> : reports ? <ReportsContent flash={flash} /> : users ? <UsersContent rows={rows} query={query} setQuery={setQuery} onAction={onAction} flash={flash} /> : <div className="module-body">
      <div className="list-summary">
        <div className="summary-count"><strong>{path === '/pelanggan' ? '128' : path === '/kenderaan' ? '164' : path === '/sebut-harga' ? '24' : path === '/invois' ? '31' : '12'}</strong><span>rekod keseluruhan</span><i /></div>
        {path === '/pembaharuan' && <div className="summary-count warning-count"><strong>4</strong><span>perlu tindakan segera</span><CircleAlert size={15} /></div>}
        {path === '/invois' && <div className="summary-count"><strong>RM 4,812</strong><span>baki belum dibayar</span><i /></div>}
        {path === '/kenderaan' && <div className="summary-count"><strong>12</strong><span>luput dalam 30 hari</span><CalendarDays size={15} /></div>}
        {path === '/sebut-harga' && <div className="summary-count"><strong>8</strong><span>menunggu maklum balas</span><i /></div>}
      </div>
      <div className="data-panel">
        <div className="table-toolbar"><div className="table-title"><h2>{path === '/pelanggan' ? 'Senarai pelanggan' : path === '/kenderaan' ? 'Senarai kenderaan' : path === '/pembaharuan' ? 'Senarai pembaharuan' : path === '/invois' ? 'Senarai invois' : 'Sebutharga terkini'}</h2><span className="live-tag"><i /> Data demo</span></div>
          <div className="table-tools"><label className="search-field"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari rekod..." data-testid="input-search" /><kbd>⌘ K</kbd></label><label className="filter-select"><Filter size={15} /><select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Tapis status">{filters.map((f) => <option key={f}>{f}</option>)}</select><ChevronDown size={13} /></label><button className="icon-btn filter-btn" onClick={() => { setFilter('Semua'); setQuery(''); }} aria-label="Kosongkan penapis"><SlidersHorizontal size={16} /></button></div>
        </div>
        <div className="table-overflow"><table><thead><tr><th>{path === '/pelanggan' ? 'NAMA PELANGGAN' : path === '/kenderaan' ? 'KENDERAAN' : path === '/sebut-harga' ? 'NO. SEBUTHARGA' : path === '/pembaharuan' ? 'KENDERAAN' : 'NO. INVOIS'}</th><th>{path === '/pelanggan' ? 'NO. TELEFON' : path === '/kenderaan' ? 'NO. PENDAFTARAN' : 'BUTIRAN PELANGGAN'}</th><th>{path === '/kenderaan' || path === '/pembaharuan' ? 'TARIKH TAMAT' : 'STATUS'}</th>{path !== '/pelanggan' && <th>{path === '/kenderaan' ? 'STATUS' : 'JUMLAH'}</th>}<th>TINDAKAN</th></tr></thead><tbody>
          {rows.map((r, i) => <tr key={`${r.name}-${i}`}><td><div className="record-name">{path === '/kenderaan' || path === '/pembaharuan' ? <span className="plate-mini">{r.name}</span> : <b>{r.name}</b>}<small>{r.detail}</small></div></td><td>{path === '/pelanggan' ? <span className="muted-value">{r.extra}</span> : path === '/kenderaan' ? <span className="plate">{r.extra}</span> : <span className="muted-value">{r.detail.split(' · ')[0]}</span>}</td><td>{path === '/kenderaan' || path === '/pembaharuan' ? <span className="date-cell"><CalendarDays size={14} />{r.date}</span> : <Status status={r.status} />}</td>{path !== '/pelanggan' && <td>{path === '/kenderaan' ? <Status status={r.status} /> : <b className="amount-cell">{r.amount}</b>}</td>}<td><button className="row-action" onClick={() => flash(`Paparan rekod ${r.name} (demo)`)} aria-label={`Lihat ${r.name}`}><MoreHorizontal size={18} /></button></td></tr>)}
          {rows.length === 0 && <tr><td colSpan={5}><div className="empty-state"><Search size={23} /><b>Tiada rekod ditemui</b><span>Cuba kata carian atau penapis yang lain.</span><button onClick={() => { setQuery(''); setFilter('Semua'); }}>Kosongkan carian</button></div></td></tr>}
        </tbody></table></div>
        <div className="table-footer"><span>Memaparkan <b>{rows.length ? '1–' + rows.length : '0'}</b> daripada <b>{path === '/pelanggan' ? '128' : path === '/kenderaan' ? '164' : path === '/sebut-harga' ? '24' : path === '/invois' ? '31' : '12'}</b> rekod demo</span><div className="pagination"><button aria-label="Halaman sebelumnya" onClick={() => flash('Halaman pertama')}><ChevronLeft size={16} /></button><button className="page-active">1</button><button onClick={() => flash('Halaman contoh seterusnya')}>2</button><button onClick={() => flash('Halaman contoh seterusnya')}>3</button><span>…</span><button onClick={() => flash('Halaman terakhir')}>12</button><button aria-label="Halaman seterusnya" onClick={() => flash('Halaman seterusnya')}><ChevronRight size={16} /></button></div></div>
      </div>
    </div>}
  </div>;
}

function Status({ status }: { status: string }) {
  const cls = status.includes('Lewat') || status.includes('Tamat') || status.includes('Ditolak') ? 'status-red' : status.includes('Menunggu') || status.includes('tindakan') ? 'status-amber' : status.includes('Diluluskan') || status.includes('Dibayar') || status === 'Aktif' ? 'status-green' : 'status-blue';
  return <span className={`status ${cls}`}><i />{status}</span>;
}

function FinanceContent() {
  return <div className="finance-grid"><div className="finance-kpis">
    <div className="finance-card featured-finance"><span>Jumlah hasil perkhidmatan</span><b>RM 18,420.00</b><small><ArrowUpRight size={14} /> 12.8% berbanding Mei</small><div className="mini-spark"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div>
    <div className="finance-card"><span>Fi perkhidmatan</span><b>RM 8,240.00</b><small className="finance-sub"><i className="legend-dot green-dot" /> Hasil operasi</small></div>
    <div className="finance-card"><span>Komisen insurans</span><b>RM 6,180.00</b><small className="finance-sub"><i className="legend-dot navy-dot" /> Pendapatan komisen</small></div>
    <div className="finance-card"><span>Premium pelanggan</span><b>RM 4,000.00</b><small className="finance-sub"><i className="legend-dot gold-dot" /> Kutipan bagi pihak insurer</small></div>
  </div><section className="panel finance-ledger"><div className="panel-head"><div><div className="section-kicker">PENJELASAN KATEGORI</div><h2>Aliran kewangan</h2><p>Rekod bulan Jun 2025 · data contoh</p></div><button className="outline-btn"><Download size={15} /> Eksport</button></div><div className="ledger-row ledger-head"><span>KATEGORI</span><span>JUMLAH</span><span>JENIS</span><span>STATUS</span></div><div className="ledger-row"><span><i className="legend-dot green-dot" /> Fi perkhidmatan</span><b>RM 8,240.00</b><span>Pendapatan</span><Status status="Diterima" /></div><div className="ledger-row"><span><i className="legend-dot navy-dot" /> Komisen insurans</span><b>RM 6,180.00</b><span>Pendapatan</span><Status status="Diterima" /></div><div className="ledger-row"><span><i className="legend-dot gold-dot" /> Premium insurans pelanggan</span><b>RM 4,000.00</b><span>Kutipan pelanggan</span><Status status="Diakaunkan" /></div><div className="ledger-note"><CircleHelp size={15} /> Premium pelanggan diasingkan daripada hasil perniagaan dan dipaparkan sebagai kutipan bagi pihak penyedia insurans.</div></section></div>;
}

function ReportsContent({ flash }: { flash: (v: string) => void }) {
  return <div className="reports-wrap"><div className="report-controls"><div className="report-date"><CalendarDays size={16} /> 1 Jun — 30 Jun 2025 <ChevronDown size={14} /></div><span className="live-tag"><i /> Data demo</span></div><div className="report-kpis"><Metric icon={ChartNoAxesCombined} label="Jumlah transaksi" value="86" foot="+14 transaksi berbanding Mei" trend="up" color="green" /><Metric icon={Wallet} label="Jumlah hasil" value="RM 18,420" foot="+12.8% bulan ke bulan" trend="up" color="blue" /><Metric icon={ClipboardCheck} label="Pembaharuan selesai" value="42" foot="Kadar berjaya 87.5%" trend="up" color="amber" /><Metric icon={Users} label="Pelanggan baharu" value="8" foot="6 pelanggan kembali" trend="flat" color="red" /></div><div className="report-charts"><section className="panel report-trend"><div className="panel-head"><div><div className="section-kicker">TREND HASIL</div><h2>Prestasi bulanan</h2><p>Perbandingan hasil mengikut kategori (RM)</p></div><button className="icon-btn" onClick={() => flash('Tetapan carta demo')}><MoreHorizontal size={17} /></button></div><RevenueChart /></section><section className="panel source-report"><div className="panel-head"><div><div className="section-kicker">OPERASI</div><h2>Ringkasan pembaharuan</h2><p>Status tugasan bulan ini</p></div></div><div className="progress-item"><div><span>Selesai</span><b>42 <small>87.5%</small></b></div><i><em style={{ width: '87.5%' }} /></i></div><div className="progress-item"><div><span>Dalam proses</span><b>4 <small>8.3%</small></b></div><i><em className="progress-blue" style={{ width: '34%' }} /></i></div><div className="progress-item"><div><span>Perlu tindakan</span><b>2 <small>4.2%</small></b></div><i><em className="progress-amber" style={{ width: '18%' }} /></i></div><div className="report-insight"><BadgeCheck size={17} /><span><b>Prestasi stabil.</b> Pembaharuan selesai meningkat 9.4% berbanding bulan lalu.</span></div></section></div><div className="report-footnote">Laporan ini menggunakan data contoh untuk tujuan demonstrasi sahaja.</div></div>;
}

function UsersContent({ rows, query, setQuery, onAction, flash }: { rows: Row[]; query: string; setQuery: (v: string) => void; onAction: () => void; flash: (v: string) => void }) {
  const roles = ['Pengurus Besar', 'Jualan & Pemasaran', 'Operasi & Khidmat Pelanggan', 'Kewangan & Pentadbiran'];
  const [activeRole, setActiveRole] = useState('Semua peranan');
  const roleRows = rows.filter((r) => activeRole === 'Semua peranan' || r.status === activeRole);
  return <div className="users-layout"><div className="role-cards">{roles.map((r, i) => <button key={r} className={`role-card ${activeRole === r ? 'role-selected' : ''}`} onClick={() => setActiveRole(activeRole === r ? 'Semua peranan' : r)}><span className={`role-number role-color-${i}`}>0{i + 1}</span><b>{r}</b><small>{[1, 2, 2, 1][i]} pengguna demo</small><ArrowRight size={15} /></button>)}</div><div className="data-panel users-panel"><div className="table-toolbar"><div className="table-title"><h2>Pasukan anda</h2><span className="live-tag"><i /> 4 pengguna</span></div><div className="table-tools"><label className="search-field"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari pengguna..." /></label><button className="primary-btn small-primary" onClick={onAction}><Plus size={15} /> Tambah pengguna</button></div></div><div className="team-list">{roleRows.map((r, i) => <div className="team-row" key={r.name}><div className={`avatar team-avatar avatar-${i}`}>{r.extra}</div><div className="team-person"><b>{r.name}</b><small>{r.detail}</small></div><Status status={r.status} /><span className="team-active"><i /> Aktif</span><button className="row-action" onClick={() => flash(`Edit pengguna ${r.name} (demo)`)} aria-label={`Edit pengguna ${r.name}`}><MoreHorizontal size={18} /></button></div>)}</div><div className="role-note"><ShieldCheck size={17} /><span>Peranan mengawal akses ciri dalam ruang kerja. Pemilihan peranan di penjuru kanan atas hanya untuk pratonton demo.</span></div></div><div className="permission-panel"><div className="permission-heading"><div><div className="section-kicker">PANDUAN AKSES</div><h2>Peranan & tanggungjawab</h2></div><button className="text-link" onClick={() => flash('Panduan akses demo')}>Lihat panduan <ArrowRight size={14} /></button></div><div className="permission-grid">{roles.map((r, i) => <div key={r}><span className={`permission-index role-color-${i}`}>0{i + 1}</span><b>{r}</b><p>{['Akses penuh untuk mengurus operasi dan tetapan pasukan.', 'Mengurus prospek, pelanggan dan sebutharga.', 'Mengendalikan pembaharuan, dokumen dan khidmat pelanggan.', 'Mengurus invois, rekod kutipan dan ringkasan kewangan.'][i]}</p></div>)}</div></div></div>;
}

function AddModal({ path, title, onClose, onSave }: { path: string; title: string; onClose: () => void; onSave: (r: Row) => void }) {
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');
  const [amount, setAmount] = useState('');
  const isVehicle = path === '/kenderaan';
  const isUser = path === '/pengguna';
  const label = path === '/pelanggan' ? 'Nama pelanggan' : isVehicle ? 'No. pendaftaran' : isUser ? 'Nama pengguna' : path === '/invois' ? 'Nama pelanggan / rujukan' : path === '/pembaharuan' ? 'No. pendaftaran' : 'Nama pelanggan / kenderaan';
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: isVehicle ? name.toUpperCase() : name, detail: detail || 'Rekod demo baharu', status: isUser ? 'Jualan & Pemasaran' : 'Menunggu', date: '12 Jun 2025', extra: isVehicle ? name.toUpperCase() : '012-000 0000', amount: amount ? `RM ${Number(amount).toLocaleString('ms-MY', { minimumFractionDigits: 2 })}` : 'RM 0.00' });
  };
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><form className="modal-card" onSubmit={submit}><div className="modal-top"><div><div className="section-kicker">REKOD DEMO</div><h2>{title}</h2></div><button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup dialog"><X size={18} /></button></div><p className="modal-description">Rekod ini hanya wujud dalam sesi demo semasa dan tidak akan disimpan.</p><label className="form-label">{label}<input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={isVehicle ? 'Contoh: VAB 4821' : 'Masukkan maklumat'} required /></label><label className="form-label">{isVehicle ? 'Pemilik / model kenderaan' : isUser ? 'E-mel kerja' : 'Butiran ringkas'}<input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={isVehicle ? 'Contoh: Perodua Myvi · Nur Aisyah' : 'Maklumat pilihan'} /></label>{(path === '/invois' || path === '/sebut-harga' || path === '/pembaharuan') && <label className="form-label">Jumlah (RM)<input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></label>}<div className="modal-foot"><button type="button" className="outline-btn" onClick={onClose}>Batal</button><button type="submit" className="primary-btn"><Check size={16} /> Tambah rekod demo</button></div></form></div>;
}

export default App;
