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

const TEAM_ROLES = [
  'General Manager',
  'Manager, Sales & Marketing',
  'Manager, Operations & Customer Service',
  'Manager, Finance & Administration',
] as const;

const nav = [
  { title: 'Workspace', links: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Customers', path: '/pelanggan', icon: Users, count: '128' },
    { label: 'Vehicles', path: '/kenderaan', icon: CarFront },
  ]},
  { title: 'Management', links: [
    { label: 'Quotations', path: '/sebut-harga', icon: FileText },
    { label: 'Renewals', path: '/pembaharuan', icon: ClipboardCheck, count: '12' },
    { label: 'Invoices', path: '/invois', icon: ReceiptText },
    { label: 'Finance', path: '/kewangan', icon: Wallet },
  ]},
  { title: 'Organization', links: [
    { label: 'Reports & Analytics', path: '/laporan', icon: FileBarChart2 },
    { label: 'Team & Access', path: '/pengguna', icon: Settings2 },
  ]},
];

const mockRows: Record<string, Row[]> = {
  '/pelanggan': [
    { name: 'Nur Aisyah binti Rahman', detail: 'Customer since March 2023 · 2 vehicles', status: 'Active', date: '12 June 2025', extra: '012-889 2314' },
    { name: 'Muhammad Firdaus Ismail', detail: 'Customer since January 2024 · 1 vehicle', status: 'Active', date: '10 June 2025', extra: '013-442 9081' },
    { name: 'Tan Mei Ling', detail: 'Customer since August 2022 · 3 vehicles', status: 'Active', date: '08 June 2025', extra: '016-221 7650' },
    { name: 'Siti Hajar Mohd Noor', detail: 'Customer since April 2024 · 1 vehicle', status: 'Action required', date: '05 June 2025', extra: '017-883 0421' },
    { name: 'Kumaravel a/l Muthu', detail: 'Customer since November 2023 · 2 vehicles', status: 'Active', date: '02 June 2025', extra: '019-334 5198' },
  ],
  '/kenderaan': [
    { name: 'Perodua Myvi 1.5 AV', detail: 'Nur Aisyah binti Rahman', status: 'Expiring soon', date: '18 June 2025', extra: 'VAB 4821' },
    { name: 'Honda City 1.5 V', detail: 'Muhammad Firdaus Ismail', status: 'Active', date: '02 July 2025', extra: 'BPU 9016' },
    { name: 'Toyota Vios 1.5 G', detail: 'Tan Mei Ling', status: 'Expiring soon', date: '07 July 2025', extra: 'WXY 6193' },
    { name: 'Proton X50 1.5 TGDi', detail: 'Siti Hajar Mohd Noor', status: 'Expired', date: '11 June 2025', extra: 'JQK 7308' },
    { name: 'Perodua Bezza 1.3 X', detail: 'Kumaravel a/l Muthu', status: 'Active', date: '25 August 2025', extra: 'PNA 2550' },
  ],
  '/sebut-harga': [
    { name: 'SQ-2025-0184', detail: 'Nur Aisyah binti Rahman · VAB 4821', status: 'Pending', date: 'Today', amount: 'RM 1,248.60' },
    { name: 'SQ-2025-0183', detail: 'Tan Mei Ling · WXY 6193', status: 'Approved', date: 'Yesterday', amount: 'RM 1,092.40' },
    { name: 'SQ-2025-0182', detail: 'Kumaravel a/l Muthu · PNA 2550', status: 'Pending', date: '11 June 2025', amount: 'RM 876.20' },
    { name: 'SQ-2025-0181', detail: 'Siti Hajar Mohd Noor · JQK 7308', status: 'Rejected', date: '10 June 2025', amount: 'RM 1,534.00' },
  ],
  '/pembaharuan': [
    { name: 'VAB 4821', detail: 'Nur Aisyah binti Rahman · Perodua Myvi', status: 'Pending payment', date: '18 June 2025', amount: 'RM 1,248.60' },
    { name: 'JQK 7308', detail: 'Siti Hajar Mohd Noor · Proton X50', status: 'Overdue', date: '11 June 2025', amount: 'RM 1,534.00' },
    { name: 'WXY 6193', detail: 'Tan Mei Ling · Toyota Vios', status: 'Documents received', date: '07 July 2025', amount: 'RM 1,092.40' },
    { name: 'BPU 9016', detail: 'Muhammad Firdaus Ismail · Honda City', status: 'In progress', date: '02 July 2025', amount: 'RM 1,318.80' },
  ],
  '/invois': [
    { name: 'INV-2025-0321', detail: 'Nur Aisyah binti Rahman · VAB 4821', status: 'Unpaid', date: '12 June 2025', amount: 'RM 1,248.60' },
    { name: 'INV-2025-0320', detail: 'Tan Mei Ling · WXY 6193', status: 'Paid', date: '11 June 2025', amount: 'RM 1,092.40' },
    { name: 'INV-2025-0319', detail: 'Kumaravel a/l Muthu · PNA 2550', status: 'Paid', date: '10 June 2025', amount: 'RM 876.20' },
    { name: 'INV-2025-0318', detail: 'Siti Hajar Mohd Noor · JQK 7308', status: 'Overdue', date: '09 June 2025', amount: 'RM 1,534.00' },
  ],
  '/pengguna': [
    { name: 'Syukri', detail: 'Demo member · No account', status: TEAM_ROLES[0], date: 'Active', extra: 'SY' },
    { name: 'Intan', detail: 'Demo member · No account', status: TEAM_ROLES[1], date: 'Active', extra: 'IN' },
    { name: 'Saufi', detail: 'Demo member · No account', status: TEAM_ROLES[2], date: 'Active', extra: 'SA' },
    { name: 'Adham', detail: 'Demo member · No account', status: TEAM_ROLES[3], date: 'Active', extra: 'AD' },
  ],
};

const pageInfo: Record<string, { title: string; crumb: string; desc: string; action: string }> = {
  '/pelanggan': { title: 'Customers', crumb: 'Customer records', desc: 'Manage Roadtax Pro customer information and service history.', action: 'Add Customer' },
  '/kenderaan': { title: 'Vehicles', crumb: 'Vehicles & road tax', desc: 'Track vehicles and insurance expiry dates.', action: 'Add Vehicle' },
  '/sebut-harga': { title: 'Quotations', crumb: 'Insurance & takaful', desc: 'Prepare and track customer coverage offers.', action: 'Create Quotation' },
  '/pembaharuan': { title: 'Renewals', crumb: 'Policies & road tax', desc: 'Keep every renewal moving on schedule.', action: 'Record Renewal' },
  '/invois': { title: 'Invoices', crumb: 'Customer payments', desc: 'Track invoices, collections, and outstanding balances.', action: 'Create Invoice' },
  '/kewangan': { title: 'Finance', crumb: 'Financial overview', desc: 'Separate service revenue, commissions, and customer premiums.', action: 'Record Transaction' },
  '/laporan': { title: 'Reports & Analytics', crumb: 'Business analytics', desc: 'Review Roadtax Pro operational performance in one place.', action: 'Download Report' },
  '/pengguna': { title: 'Team & Access', crumb: 'Team & Access', desc: 'Review prototype team roles and responsibilities.', action: 'Add User' },
};

function App() {
  const [path, setPath] = useLocation();
  const [customers, setCustomers] = useState<CustomerRecord[]>(DEMO_CUSTOMERS);
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(false);
  const [notice, setNotice] = useState('');
  const [role, setRole] = useState('General Manager');
  const [period, setPeriod] = useState('30 days');
  const [extraRows, setExtraRows] = useState<Record<string, Row[]>>({});
  const current = path === '/' ? '/dashboard' : path;
  const isDashboard = current === '/dashboard';
  const info = pageInfo[current] || pageInfo['/pelanggan'];
  const rows = useMemo(() => [...(extraRows[current] || []), ...(mockRows[current] || [])]
    .filter((r) => `${r.name} ${r.detail} ${r.extra || ''}`.toLowerCase().includes(query.toLowerCase()))
    .filter((r) => filter === 'All' || r.status === filter), [current, query, filter, extraRows]);
  const hasRelatedCustomerRecords = (customer: CustomerRecord) => {
    const customerName = customer.fullName.trim().toLocaleLowerCase('en-MY');
    const relatedModules = ['/kenderaan', '/sebut-harga', '/pembaharuan', '/invois'];
    return relatedModules.some((modulePath) => {
      const records = [...(extraRows[modulePath] || []), ...(mockRows[modulePath] || [])];
      return records.some((record) => `${record.name} ${record.detail}`.toLocaleLowerCase('en-MY').includes(customerName));
    });
  };
  const flash = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(''), 2800); };
  const handleAction = () => {
    if (current === '/laporan') { flash('The demo report is ready to download.'); return; }
    setModal(true);
  };

  return (
    <div className="app-shell">
      {mobileNav && <button className="scrim" aria-label="Close menu" onClick={() => setMobileNav(false)} />}
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <Link href="/dashboard" className="brand" onClick={() => setMobileNav(false)}>
          <span className="brand-mark"><ShieldCheck size={21} strokeWidth={2.4} /></span>
          <span className="brand-text">roadtax<span>pro</span><small>RPMS · WORKSPACE</small></span>
        </Link>
        <div className="workspace-switch">
          <div className="workspace-icon">RP</div><div className="workspace-name">Roadtax Pro<small>Kuala Lumpur Team</small></div><ChevronDown size={15} />
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
          <div className="help-box"><CircleHelp size={17} /><div><b>Need help?</b><small>Contact the support team</small></div><ArrowRight size={15} /></div>
          <div className="profile">
            <div className="avatar">SY</div><div className="profile-name">Syukri<small>{role}</small></div><button className="icon-btn light" onClick={() => flash('Profile settings (demo)')} aria-label="Profile settings"><MoreHorizontal size={18} /></button>
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-btn" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="crumb"><span>Roadtax Pro</span><ChevronRight size={14} /><b>{isDashboard ? 'Dashboard' : info.crumb}</b></div>
          <div className="top-actions">
          <div className="today"><CalendarDays size={15} /> Thursday, June 12, 2025</div>
          <button className="icon-btn notification" onClick={() => flash('No new notifications')} aria-label="Notifications"><Bell size={18} /><i /></button>
          <div className="role-select">
            <span className="role-preview-tag">DEMO</span>
            <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Demo role preview; access restrictions are not enforced" title="Demo role preview only; access restrictions are not enforced" data-testid="select-role">
              {TEAM_ROLES.map((teamRole) => <option key={teamRole}>{teamRole}</option>)}
            </select>
            <ChevronDown size={13} />
          </div>
          </div>
        </header>
        <div className="content">
          {isDashboard ? <Dashboard period={period} setPeriod={setPeriod} onNavigate={setPath} flash={flash} /> :
            current === '/pelanggan' ?
              <CustomerManagement customers={customers} setCustomers={setCustomers} notify={flash} hasExternalRelatedRecords={hasRelatedCustomerRecords} /> :
              <ModulePage path={current} info={info} rows={rows} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} onAction={handleAction} flash={flash} />}
          <footer className="footer"><span>© 2025 RPMS <b>·</b> Roadtax Pro demo workspace</span><span>Fictional sample data only <span className="footer-dot" /> Changes are not saved</span></footer>
        </div>
      </main>
      {modal && <AddModal path={current} title={info.action} onClose={() => setModal(false)} onSave={(row) => {
        setExtraRows((old) => ({ ...old, [current]: [row, ...(old[current] || [])] }));
        setModal(false); flash('Demo record added to this session only.');
      }} />}
      {notice && <div className="toast"><span className="toast-check"><Check size={14} /></span>{notice}<button onClick={() => setNotice('')} aria-label="Close notification"><X size={15} /></button></div>}
    </div>
  );
}

function Dashboard({ period, setPeriod, onNavigate, flash }: { period: string; setPeriod: (v: string) => void; onNavigate: (v: string) => void; flash: (v: string) => void }) {
  const [tab, setTab] = useState('All');
  const reminders = [
    { plate: 'VAB 4821', name: 'Nur Aisyah binti Rahman', vehicle: 'Perodua Myvi 1.5 AV', date: '18 June', days: '6 days left', state: 'urgent' },
    { plate: 'JQK 7308', name: 'Siti Hajar Mohd Noor', vehicle: 'Proton X50 1.5 TGDi', date: '11 June', days: '1 day overdue', state: 'late' },
    { plate: 'WXY 6193', name: 'Tan Mei Ling', vehicle: 'Toyota Vios 1.5 G', date: '07 July', days: '25 days left', state: 'soon' },
  ];
  return <div className="dashboard-page">
    <div className="welcome-row">
      <div><div className="eyebrow"><span className="eyebrow-line" /> THURSDAY, JUNE 12, 2025</div><h1>Good morning, Syukri<span className="wave">.</span></h1><p>Here is today’s Roadtax Pro operations summary.</p></div>
      <button className="primary-btn" onClick={() => onNavigate('/sebut-harga')}><Plus size={17} /> New Quotation</button>
    </div>
    <div className="demo-strip"><span className="demo-icon"><Activity size={15} /></span><b>Demo mode</b><span>All figures and records are fictional examples, not real customer data.</span><button onClick={() => flash('All displayed information is fictional sample data.')}>Learn more <ArrowRight size={13} /></button></div>
    <div className="metrics-grid">
      <Metric icon={Users} label="Total customers" value="128" foot="+8 customers this month" trend="up" color="green" />
      <Metric icon={CarFront} label="Registered vehicles" value="164" foot="12 due for renewal" trend="flat" color="blue" />
      <Metric icon={Wallet} label="Revenue this month" value="RM 18,420" foot="+12.8% from last month" trend="up" color="amber" />
      <Metric icon={CircleAlert} label="Outstanding payments" value="RM 4,812" foot="4 unpaid invoices" trend="down" color="red" />
    </div>
    <div className="dashboard-grid">
      <section className="panel revenue-panel">
        <div className="panel-head"><div><div className="section-kicker">PERFORMANCE</div><h2>Revenue Overview</h2><p>Revenue collected by month</p></div><select className="period-select" value={period} onChange={(e) => setPeriod(e.target.value)}><option>30 days</option><option>90 days</option><option>This year</option></select></div>
        <div className="revenue-legend"><span><i className="legend-dot green-dot" /> Service fees</span><span><i className="legend-dot navy-dot" /> Insurance commissions</span><strong>RM 18,420 <small>+12.8%</small></strong></div>
        <RevenueChart />
      </section>
      <section className="panel breakdown-panel">
        <div className="panel-head"><div><div className="section-kicker">BREAKDOWN</div><h2>Revenue Sources</h2><p>June 2025</p></div><button className="icon-btn" onClick={() => onNavigate('/kewangan')} aria-label="Open finance"><ArrowRight size={17} /></button></div>
        <div className="donut-wrap"><div className="donut"><div><b>RM 18.4k</b><small>Total revenue</small></div></div></div>
        <div className="breakdown-list">
          <Breakdown color="green-dot" label="Service fees" value="RM 8,240" pct="44.7%" />
          <Breakdown color="navy-dot" label="Insurance commissions" value="RM 6,180" pct="33.6%" />
          <Breakdown color="gold-dot" label="Customer premiums" value="RM 4,000" pct="21.7%" />
        </div>
      </section>
      <section className="panel renewals-panel">
        <div className="panel-head renewal-head"><div><div className="section-kicker">ACTION REQUIRED</div><h2>Upcoming Renewals</h2><p>Contact customers before their coverage expires.</p></div><button className="text-link" onClick={() => onNavigate('/pembaharuan')}>View all <ArrowRight size={14} /></button></div>
        <div className="tabs">{['All', 'Overdue', 'Due soon'].map((v) => <button className={tab === v ? 'tab active-tab' : 'tab'} onClick={() => setTab(v)} key={v}>{v}{v === 'All' && <span>12</span>}</button>)}</div>
        <div className="reminder-list">{reminders.filter((r) => tab === 'All' || (tab === 'Overdue' ? r.state === 'late' : r.state !== 'late')).map((r) => <div className="reminder-row" key={r.plate}>
          <div className={`reminder-date ${r.state}`}><b>{r.date.split(' ')[0]}</b><small>{r.date.split(' ')[1]}</small></div><div className="reminder-info"><b>{r.name}</b><span>{r.vehicle} <em>{r.plate}</em></span></div><div className={`reminder-state ${r.state}`}>{r.days}</div><button className="icon-btn row-more" onClick={() => flash(`Demo reminder for ${r.plate}`)} aria-label="Renewal action"><MoreHorizontal size={17} /></button>
        </div>)}</div>
      </section>
      <section className="panel activity-panel">
        <div className="panel-head"><div><div className="section-kicker">RECENT</div><h2>Recent Activity</h2><p>Team updates for today</p></div><button className="icon-btn" onClick={() => flash('Demo activity view')} aria-label="View activity"><MoreHorizontal size={17} /></button></div>
        <div className="activity-list">
          <ActivityRow initials="IN" color="lavender" title="Quotation approved" description="Intan approved SQ-2025-0183 for Tan Mei Ling" time="10:42 AM" />
          <ActivityRow initials="AD" color="mint" title="Payment received" description="Adham recorded RM 1,092.40 · WXY 6193" time="9:18 AM" />
          <ActivityRow initials="IN" color="peach" title="New customer added" description="Intan added a customer record · Amirul Hakim" time="8:56 AM" />
        </div>
        <button className="activity-all" onClick={() => flash('The full activity view is available in this demo.')}>View all activity <ArrowRight size={14} /></button>
      </section>
    </div>
  </div>;
}

function Metric({ icon: Icon, label, value, foot, trend, color }: { icon: typeof Users; label: string; value: string; foot: string; trend: string; color: string }) {
  return <div className="metric-card"><div className={`metric-icon ${color}`}><Icon size={18} strokeWidth={1.9} /></div><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className="metric-foot">{trend === 'up' ? <ArrowUpRight size={14} /> : trend === 'down' ? <ArrowDownRight size={14} /> : <span className="tiny-line" />}{foot}</span></div>;
}
function RevenueChart() {
  const values = [35, 47, 40, 57, 49, 67, 62, 53, 74, 68, 84, 72];
  return <div className="chart-wrap"><div className="chart-y"><span>RM 8k</span><span>RM 6k</span><span>RM 4k</span><span>RM 2k</span><span>RM 0</span></div><div className="chart-main"><div className="chart-gridlines"><i /><i /><i /><i /><i /></div><div className="chart-bars">{values.map((v, i) => <div className="bar-pair" key={i}><i className="bar service" style={{ height: `${v}%` }} /><i className="bar commission" style={{ height: `${Math.max(13, v * 0.57)}%` }} /></div>)}</div><div className="chart-x">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((v) => <span key={v}>{v}</span>)}</div></div></div>;
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
  const filters = path === '/pembaharuan' ? ['All', 'Pending payment', 'Overdue', 'In progress'] : path === '/invois' ? ['All', 'Unpaid', 'Paid', 'Overdue'] : path === '/kenderaan' ? ['All', 'Active', 'Expiring soon', 'Expired'] : path === '/sebut-harga' ? ['All', 'Pending', 'Approved', 'Rejected'] : path === '/pengguna' ? ['All', ...TEAM_ROLES] : ['All', 'Active', 'Action required'];
  return <div className="module-page">
    <div className="module-header"><div><div className="eyebrow"><span className="eyebrow-line" /> {info.crumb.toUpperCase()}</div><h1>{info.title}</h1><p>{info.desc}</p></div><button className={`primary-btn ${reports ? 'secondary-action' : ''}`} onClick={onAction}>{reports ? <Download size={16} /> : <Plus size={17} />}{info.action}</button></div>
    {financial ? <FinanceContent /> : reports ? <ReportsContent flash={flash} /> : users ? <UsersContent rows={rows} query={query} setQuery={setQuery} onAction={onAction} flash={flash} /> : <div className="module-body">
      <div className="list-summary">
        <div className="summary-count"><strong>{path === '/pelanggan' ? '128' : path === '/kenderaan' ? '164' : path === '/sebut-harga' ? '24' : path === '/invois' ? '31' : '12'}</strong><span>total records</span><i /></div>
        {path === '/pembaharuan' && <div className="summary-count warning-count"><strong>4</strong><span>require urgent action</span><CircleAlert size={15} /></div>}
        {path === '/invois' && <div className="summary-count"><strong>RM 4,812</strong><span>unpaid balance</span><i /></div>}
        {path === '/kenderaan' && <div className="summary-count"><strong>12</strong><span>expiring within 30 days</span><CalendarDays size={15} /></div>}
        {path === '/sebut-harga' && <div className="summary-count"><strong>8</strong><span>awaiting a response</span><i /></div>}
      </div>
      <div className="data-panel">
        <div className="table-toolbar"><div className="table-title"><h2>{path === '/pelanggan' ? 'Customer List' : path === '/kenderaan' ? 'Vehicle List' : path === '/pembaharuan' ? 'Renewal List' : path === '/invois' ? 'Invoice List' : 'Recent Quotations'}</h2><span className="live-tag"><i /> Demo data</span></div>
          <div className="table-tools"><label className="search-field"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search records..." data-testid="input-search" /><kbd>⌘ K</kbd></label><label className="filter-select"><Filter size={15} /><select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">{filters.map((f) => <option key={f}>{f}</option>)}</select><ChevronDown size={13} /></label><button className="icon-btn filter-btn" onClick={() => { setFilter('All'); setQuery(''); }} aria-label="Clear filters"><SlidersHorizontal size={16} /></button></div>
        </div>
        <div className="table-overflow"><table><thead><tr><th>{path === '/pelanggan' ? 'CUSTOMER NAME' : path === '/kenderaan' ? 'VEHICLE' : path === '/sebut-harga' ? 'QUOTATION NO.' : path === '/pembaharuan' ? 'VEHICLE' : 'INVOICE NO.'}</th><th>{path === '/pelanggan' ? 'PHONE NUMBER' : path === '/kenderaan' ? 'REGISTRATION NO.' : 'CUSTOMER DETAILS'}</th><th>{path === '/kenderaan' || path === '/pembaharuan' ? 'EXPIRY DATE' : 'STATUS'}</th>{path !== '/pelanggan' && <th>{path === '/kenderaan' ? 'STATUS' : 'AMOUNT'}</th>}<th>ACTIONS</th></tr></thead><tbody>
          {rows.map((r, i) => <tr key={`${r.name}-${i}`}><td><div className="record-name">{path === '/kenderaan' || path === '/pembaharuan' ? <span className="plate-mini">{r.name}</span> : <b>{r.name}</b>}<small>{r.detail}</small></div></td><td>{path === '/pelanggan' ? <span className="muted-value">{r.extra}</span> : path === '/kenderaan' ? <span className="plate">{r.extra}</span> : <span className="muted-value">{r.detail.split(' · ')[0]}</span>}</td><td>{path === '/kenderaan' || path === '/pembaharuan' ? <span className="date-cell"><CalendarDays size={14} />{r.date}</span> : <Status status={r.status} />}</td>{path !== '/pelanggan' && <td>{path === '/kenderaan' ? <Status status={r.status} /> : <b className="amount-cell">{r.amount}</b>}</td>}<td><button className="row-action" onClick={() => flash(`Record view for ${r.name} (demo)`)} aria-label={`View ${r.name}`}><MoreHorizontal size={18} /></button></td></tr>)}
          {rows.length === 0 && <tr><td colSpan={5}><div className="empty-state"><Search size={23} /><b>No records found</b><span>Try another search term or filter.</span><button onClick={() => { setQuery(''); setFilter('All'); }}>Clear search</button></div></td></tr>}
        </tbody></table></div>
        <div className="table-footer"><span>Showing <b>{rows.length ? '1–' + rows.length : '0'}</b> of <b>{path === '/pelanggan' ? '128' : path === '/kenderaan' ? '164' : path === '/sebut-harga' ? '24' : path === '/invois' ? '31' : '12'}</b> demo records</span><div className="pagination"><button aria-label="Previous page" onClick={() => flash('First page')}><ChevronLeft size={16} /></button><button className="page-active">1</button><button onClick={() => flash('Next sample page')}>2</button><button onClick={() => flash('Next sample page')}>3</button><span>…</span><button onClick={() => flash('Last page')}>12</button><button aria-label="Next page" onClick={() => flash('Next page')}><ChevronRight size={16} /></button></div></div>
      </div>
    </div>}
  </div>;
}

function Status({ status }: { status: string }) {
  const cls = status.includes('Overdue') || status.includes('Expired') || status.includes('Rejected') ? 'status-red' : status.includes('Pending') || status.includes('Action required') || status.includes('Expiring') || status === 'Unpaid' ? 'status-amber' : status.includes('Approved') || status === 'Paid' || status === 'Active' ? 'status-green' : 'status-blue';
  return <span className={`status ${cls}`}><i />{status}</span>;
}

function FinanceContent() {
  return <div className="finance-grid"><div className="finance-kpis">
    <div className="finance-card featured-finance"><span>Total service revenue</span><b>RM 18,420.00</b><small><ArrowUpRight size={14} /> 12.8% from May</small><div className="mini-spark"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div>
    <div className="finance-card"><span>Service fees</span><b>RM 8,240.00</b><small className="finance-sub"><i className="legend-dot green-dot" /> Operating revenue</small></div>
    <div className="finance-card"><span>Insurance commissions</span><b>RM 6,180.00</b><small className="finance-sub"><i className="legend-dot navy-dot" /> Commission income</small></div>
    <div className="finance-card"><span>Customer premiums</span><b>RM 4,000.00</b><small className="finance-sub"><i className="legend-dot gold-dot" /> Collected on behalf of insurer</small></div>
  </div><section className="panel finance-ledger"><div className="panel-head"><div><div className="section-kicker">CATEGORY BREAKDOWN</div><h2>Financial Activity</h2><p>June 2025 records · sample data</p></div><button className="outline-btn"><Download size={15} /> Export</button></div><div className="ledger-row ledger-head"><span>CATEGORY</span><span>AMOUNT</span><span>TYPE</span><span>STATUS</span></div><div className="ledger-row"><span><i className="legend-dot green-dot" /> Service fees</span><b>RM 8,240.00</b><span>Revenue</span><Status status="Received" /></div><div className="ledger-row"><span><i className="legend-dot navy-dot" /> Insurance commissions</span><b>RM 6,180.00</b><span>Revenue</span><Status status="Received" /></div><div className="ledger-row"><span><i className="legend-dot gold-dot" /> Customer insurance premiums</span><b>RM 4,000.00</b><span>Customer collection</span><Status status="Accounted" /></div><div className="ledger-note"><CircleHelp size={15} /> Customer premiums are kept separate from business revenue and shown as collections on behalf of the insurance provider.</div></section></div>;
}

function ReportsContent({ flash }: { flash: (v: string) => void }) {
  return <div className="reports-wrap"><div className="report-controls"><div className="report-date"><CalendarDays size={16} /> June 1 — June 30, 2025 <ChevronDown size={14} /></div><span className="live-tag"><i /> Demo data</span></div><div className="report-kpis"><Metric icon={ChartNoAxesCombined} label="Total transactions" value="86" foot="+14 transactions from May" trend="up" color="green" /><Metric icon={Wallet} label="Total revenue" value="RM 18,420" foot="+12.8% month over month" trend="up" color="blue" /><Metric icon={ClipboardCheck} label="Renewals completed" value="42" foot="87.5% completion rate" trend="up" color="amber" /><Metric icon={Users} label="New customers" value="8" foot="6 returning customers" trend="flat" color="red" /></div><div className="report-charts"><section className="panel report-trend"><div className="panel-head"><div><div className="section-kicker">REVENUE TREND</div><h2>Monthly Performance</h2><p>Revenue by category (RM)</p></div><button className="icon-btn" onClick={() => flash('Chart settings (demo)')} aria-label="Chart settings"><MoreHorizontal size={17} /></button></div><RevenueChart /></section><section className="panel source-report"><div className="panel-head"><div><div className="section-kicker">OPERATIONS</div><h2>Renewal Summary</h2><p>Task status this month</p></div></div><div className="progress-item"><div><span>Completed</span><b>42 <small>87.5%</small></b></div><i><em style={{ width: '87.5%' }} /></i></div><div className="progress-item"><div><span>In progress</span><b>4 <small>8.3%</small></b></div><i><em className="progress-blue" style={{ width: '34%' }} /></i></div><div className="progress-item"><div><span>Action required</span><b>2 <small>4.2%</small></b></div><i><em className="progress-amber" style={{ width: '18%' }} /></i></div><div className="report-insight"><BadgeCheck size={17} /><span><b>Performance is steady.</b> Completed renewals increased by 9.4% from last month.</span></div></section></div><div className="report-footnote">This report uses fictional sample data for demonstration only.</div></div>;
}

function UsersContent({ rows, query, setQuery, onAction, flash }: { rows: Row[]; query: string; setQuery: (v: string) => void; onAction: () => void; flash: (v: string) => void }) {
  const roles = TEAM_ROLES;
  const [activeRole, setActiveRole] = useState('All roles');
  const roleRows = rows.filter((r) => activeRole === 'All roles' || r.status === activeRole);
  const roleCounts = roles.map((teamRole) => rows.filter((row) => row.status === teamRole).length);
  const responsibilities = [
    'Overall operational oversight; management dashboards; team and system administration.',
    'Customer acquisition and customer relationship management; customer records and quotations; sales and marketing reporting.',
    'Vehicle records; renewal processing; policy and document coordination; customer service operations.',
    'Invoices and payment records; financial tracking and reporting; administrative records.',
  ];
  return <div className="users-layout"><div className="role-cards">{roles.map((r, i) => <button key={r} className={`role-card ${activeRole === r ? 'role-selected' : ''}`} onClick={() => setActiveRole(activeRole === r ? 'All roles' : r)}><span className={`role-number role-color-${i}`}>0{i + 1}</span><b>{r}</b><small>{roleCounts[i]} demo {roleCounts[i] === 1 ? 'user' : 'users'}</small><ArrowRight size={15} /></button>)}</div><div className="data-panel users-panel"><div className="table-toolbar"><div className="table-title"><h2>Your Team</h2><span className="live-tag"><i /> {rows.length} demo {rows.length === 1 ? 'user' : 'users'}</span></div><div className="table-tools"><label className="search-field"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search team members..." /></label><button className="primary-btn small-primary" onClick={onAction}><Plus size={15} /> Add User</button></div></div><div className="team-list">{roleRows.map((r, i) => <div className="team-row" key={r.name}><div className={`avatar team-avatar avatar-${i}`}>{r.extra}</div><div className="team-person"><b>{r.name}</b><small>{r.detail}</small></div><Status status={r.status} /><span className="team-active"><i /> Demo</span><button className="row-action" onClick={() => flash(`Edit demo team member ${r.name}`)} aria-label={`Edit demo team member ${r.name}`}><MoreHorizontal size={18} /></button></div>)}</div><div className="role-note"><ShieldCheck size={17} /><span>These role descriptions are for the prototype only. The role selector is a demo preview; access restrictions are not enforced.</span></div></div><div className="permission-panel"><div className="permission-heading"><div><div className="section-kicker">ACCESS GUIDE</div><h2>Roles & Responsibilities</h2></div><button className="text-link" onClick={() => flash('Access guide (demo)')}>View guide <ArrowRight size={14} /></button></div><div className="permission-grid">{roles.map((r, i) => <div key={r}><span className={`permission-index role-color-${i}`}>0{i + 1}</span><b>{r}</b><p>{responsibilities[i]}</p></div>)}</div></div></div>;
}

function AddModal({ path, title, onClose, onSave }: { path: string; title: string; onClose: () => void; onSave: (r: Row) => void }) {
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');
  const [amount, setAmount] = useState('');
  const isVehicle = path === '/kenderaan';
  const isUser = path === '/pengguna';
  const label = path === '/pelanggan' ? 'Customer Name' : isVehicle ? 'Registration Number' : isUser ? 'User Name' : path === '/invois' ? 'Customer Name / Reference' : path === '/pembaharuan' ? 'Registration Number' : 'Customer Name / Vehicle';
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: isVehicle ? name.toUpperCase() : name, detail: isUser ? detail || 'Demo member · No account' : detail || 'New demo record', status: isUser ? TEAM_ROLES[1] : 'Pending', date: '12 June 2025', extra: isVehicle ? name.toUpperCase() : isUser ? name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') : '012-000 0000', amount: amount ? `RM ${Number(amount).toLocaleString('en-MY', { minimumFractionDigits: 2 })}` : 'RM 0.00' });
  };
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><form className="modal-card" onSubmit={submit}><div className="modal-top"><div><div className="section-kicker">DEMO RECORD</div><h2>{title}</h2></div><button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div><p className="modal-description">{isUser ? 'This creates a prototype team entry only. No authenticated account is created, and changes are not saved.' : 'This record is available only during the current demo session and will not be saved.'}</p><label className="form-label">{label}<input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={isVehicle ? 'Example: VAB 4821' : 'Enter information'} required /></label><label className="form-label">{isVehicle ? 'Owner / vehicle model' : isUser ? 'Optional demo email' : 'Brief details'}<input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={isVehicle ? 'Example: Perodua Myvi · Nur Aisyah' : isUser ? 'demo@example.com (optional)' : 'Optional information'} /></label>{(path === '/invois' || path === '/sebut-harga' || path === '/pembaharuan') && <label className="form-label">Amount (RM)<input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></label>}<div className="modal-foot"><button type="button" className="outline-btn" onClick={onClose}>Cancel</button><button type="submit" className="primary-btn"><Check size={16} /> Add Demo Record</button></div></form></div>;
}

export default App;
