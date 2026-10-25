import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Building2,
  CalendarDays,
  CarFront,
  Check,
  Eye,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CustomerRecord, CustomerStatus, CustomerType } from './customer-types';
import './customer-management.css';

const customerFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Masukkan nama sekurang-kurangnya 2 aksara.').max(120, 'Nama tidak boleh melebihi 120 aksara.'),
  customerType: z.enum(['Individu', 'Syarikat']),
  phoneNumber: z.string()
    .trim()
    .min(7, 'Masukkan nombor telefon yang sah.')
    .max(24, 'Nombor telefon terlalu panjang.')
    .regex(/^[0-9+()\s-]+$/, 'Gunakan nombor, ruang, tanda tambah, kurungan atau sempang sahaja.')
    .refine((value) => value.replace(/\D/g, '').length >= 7, 'Nombor telefon mesti mengandungi sekurang-kurangnya 7 digit.'),
  email: z.string().trim().max(160, 'E-mel terlalu panjang.').refine(
    (value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    'Masukkan alamat e-mel yang sah.',
  ),
  mailingAddress: z.string().trim().max(400, 'Alamat tidak boleh melebihi 400 aksara.'),
  notes: z.string().trim().max(1000, 'Nota tidak boleh melebihi 1,000 aksara.'),
  status: z.enum(['Aktif', 'Tidak aktif']),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

type CustomerManagementProps = {
  customers: CustomerRecord[];
  setCustomers: Dispatch<SetStateAction<CustomerRecord[]>>;
  notify: (message: string) => void;
};

const EMPTY_VALUES: CustomerFormValues = {
  fullName: '',
  customerType: 'Individu',
  phoneNumber: '',
  email: '',
  mailingAddress: '',
  notes: '',
  status: 'Aktif',
};

function localDateIso() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function nextCustomerId(customers: CustomerRecord[]) {
  const year = new Date().getFullYear();
  const prefix = `RTP-${year}-`;
  const highest = customers.reduce((max, customer) => {
    if (!customer.customerId.startsWith(prefix)) return max;
    const sequence = Number(customer.customerId.slice(prefix.length));
    return Number.isFinite(sequence) ? Math.max(max, sequence) : max;
  }, 0);
  return `${prefix}${String(highest + 1).padStart(4, '0')}`;
}

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase('ms-MY');
}

export function CustomerManagement({ customers, setCustomers, notify }: CustomerManagementProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Semua jenis');
  const [statusFilter, setStatusFilter] = useState('Semua status');
  const [formMode, setFormMode] = useState<'new' | 'edit' | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const upcomingCustomerId = useMemo(() => nextCustomerId(customers), [customers]);

  const visibleCustomers = useMemo(() => {
    const term = normalizeSearch(search);
    return customers.filter((customer) => {
      const matchesSearch = !term || [
        customer.fullName,
        customer.customerId,
        customer.phoneNumber,
      ].some((value) => normalizeSearch(value).includes(term));
      const matchesType = typeFilter === 'Semua jenis' || customer.customerType === typeFilter;
      const matchesStatus = statusFilter === 'Semua status' || customer.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [customers, search, statusFilter, typeFilter]);

  const selectedCustomer = customers.find((customer) => customer.customerId === selectedCustomerId) ?? null;
  const individualCount = customers.filter((customer) => customer.customerType === 'Individu').length;
  const companyCount = customers.filter((customer) => customer.customerType === 'Syarikat').length;

  function clearFilters() {
    setSearch('');
    setTypeFilter('Semua jenis');
    setStatusFilter('Semua status');
  }

  function saveCustomer(values: CustomerFormValues, existing?: CustomerRecord) {
    const customer: CustomerRecord = {
      customerId: existing?.customerId ?? upcomingCustomerId,
      fullName: values.fullName.trim(),
      customerType: values.customerType,
      phoneNumber: values.phoneNumber.trim(),
      email: values.email.trim(),
      mailingAddress: values.mailingAddress.trim(),
      notes: values.notes.trim(),
      registrationDate: existing?.registrationDate ?? localDateIso(),
      status: existing ? values.status : 'Aktif',
      vehicleIds: existing?.vehicleIds ?? [],
    };

    if (existing) {
      setCustomers((current) => current.map((item) => item.customerId === existing.customerId ? customer : item));
      setSelectedCustomerId(customer.customerId);
      setFormMode(null);
      notify(`Pelanggan ${customer.customerId} berjaya dikemas kini dalam sesi prototaip.`);
    } else {
      setCustomers((current) => [customer, ...current]);
      setFormMode(null);
      notify(`Pelanggan ${customer.customerId} berjaya didaftarkan dalam sesi prototaip.`);
    }
  }

  return (
    <section className="customer-module" aria-labelledby="customer-page-title">
      <div className="module-header customer-page-header">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> REKOD PELANGGAN</div>
          <h1 id="customer-page-title">Pelanggan</h1>
          <p>Daftar dan urus maklumat pelanggan Roadtax Pro.</p>
        </div>
        <button className="primary-btn customer-add-button" onClick={() => setFormMode('new')} data-testid="button-add-customer">
          <Plus size={17} /> Tambah pelanggan
        </button>
      </div>

      <div className="customer-prototype-banner" role="note" data-testid="notice-prototype-data">
        <span className="customer-prototype-icon"><ShieldCheck size={17} /></span>
        <div>
          <strong>Prototaip · Data rekaan sahaja</strong>
          <p>Rekod baharu hanya tersedia dalam sesi ini dan tidak disimpan selepas halaman dimuat semula.</p>
        </div>
      </div>

      <div className="customer-summary-grid">
        <SummaryCard icon={<Users size={17} />} label="Pelanggan dalam sesi ini" value={customers.length} />
        <SummaryCard icon={<UserRound size={17} />} label="Individu" value={individualCount} />
        <SummaryCard icon={<Building2 size={17} />} label="Syarikat" value={companyCount} />
      </div>

      <div className="customer-list-panel">
        <div className="customer-list-toolbar">
          <div className="customer-list-heading">
            <div>
              <h2>Senarai pelanggan</h2>
              <span>{visibleCustomers.length} daripada {customers.length} rekod contoh</span>
            </div>
            <span className="customer-demo-chip"><i /> Data contoh</span>
          </div>
          <div className="customer-filter-row">
            <label className="customer-search">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Cari nama, ID pelanggan atau nombor telefon</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, ID atau telefon"
                data-testid="input-customer-search"
              />
              {search && <button type="button" onClick={() => setSearch('')} aria-label="Kosongkan carian"><X size={14} /></button>}
            </label>
            <label className="customer-filter-control">
              <span>Jenis</span>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Tapis jenis pelanggan" data-testid="filter-customer-type">
                <option>Semua jenis</option>
                <option>Individu</option>
                <option>Syarikat</option>
              </select>
            </label>
            <label className="customer-filter-control">
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Tapis status pelanggan" data-testid="filter-customer-status">
                <option>Semua status</option>
                <option>Aktif</option>
                <option>Tidak aktif</option>
              </select>
            </label>
            {(search || typeFilter !== 'Semua jenis' || statusFilter !== 'Semua status') && (
              <button className="customer-clear-filters" onClick={clearFilters} data-testid="button-clear-customer-filters">Kosongkan</button>
            )}
          </div>
        </div>

        {visibleCustomers.length === 0 ? (
          <div className="customer-empty-state" data-testid="empty-customer-results">
            <Search size={22} />
            <strong>Tiada pelanggan ditemui</strong>
            <span>Cuba carian atau penapis yang lain.</span>
            <button onClick={clearFilters}>Kosongkan carian dan penapis</button>
          </div>
        ) : (
          <>
            <div className="customer-desktop-table">
              <table>
                <thead>
                  <tr>
                    <th>ID PELANGGAN</th>
                    <th>NAMA PELANGGAN</th>
                    <th>JENIS</th>
                    <th>NOMBOR TELEFON</th>
                    <th>TARIKH DAFTAR</th>
                    <th>STATUS</th>
                    <th>TINDAKAN</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleCustomers.map((customer) => (
                    <tr key={customer.customerId} data-testid={`row-customer-${customer.customerId}`}>
                      <td><span className="customer-id-text">{customer.customerId}</span></td>
                      <td>
                        <div className="customer-name-cell">
                          <span className={`customer-avatar ${customer.customerType === 'Syarikat' ? 'company-avatar' : ''}`}>
                            {customer.customerType === 'Syarikat' ? <Building2 size={16} /> : <UserRound size={16} />}
                          </span>
                          <span><strong>{customer.fullName}</strong><small>{customer.email || 'E-mel belum diisi'}</small></span>
                        </div>
                      </td>
                      <td><span className="customer-type-chip">{customer.customerType}</span></td>
                      <td>{customer.phoneNumber}</td>
                      <td>{formatDate(customer.registrationDate)}</td>
                      <td><CustomerStatusBadge status={customer.status} /></td>
                      <td>
                        <div className="customer-row-actions">
                          <button onClick={() => setSelectedCustomerId(customer.customerId)} aria-label={`Lihat ${customer.fullName}`} data-testid={`button-view-customer-${customer.customerId}`}><Eye size={16} /><span>Lihat</span></button>
                        <button onClick={() => { setSelectedCustomerId(customer.customerId); setFormMode('edit'); }} aria-label={`Sunting ${customer.fullName}`} data-testid={`button-edit-customer-${customer.customerId}`}><Pencil size={15} /><span>Sunting</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="customer-mobile-list">
              {visibleCustomers.map((customer) => (
                <article className="customer-mobile-card" key={customer.customerId} data-testid={`card-customer-${customer.customerId}`}>
                  <div className="customer-mobile-card-top">
                    <span className={`customer-avatar ${customer.customerType === 'Syarikat' ? 'company-avatar' : ''}`}>
                      {customer.customerType === 'Syarikat' ? <Building2 size={16} /> : <UserRound size={16} />}
                    </span>
                    <div className="customer-mobile-name"><strong>{customer.fullName}</strong><span>{customer.customerId}</span></div>
                    <CustomerStatusBadge status={customer.status} />
                  </div>
                  <div className="customer-mobile-details">
                    <span><Phone size={14} />{customer.phoneNumber}</span>
                    <span>{customer.customerType} · Daftar {formatDate(customer.registrationDate)}</span>
                  </div>
                  <div className="customer-mobile-actions">
                    <button onClick={() => setSelectedCustomerId(customer.customerId)} data-testid={`button-view-customer-mobile-${customer.customerId}`}><Eye size={15} /> Lihat butiran</button>
                    <button onClick={() => { setSelectedCustomerId(customer.customerId); setFormMode('edit'); }} data-testid={`button-edit-customer-mobile-${customer.customerId}`}><Pencil size={15} /> Sunting</button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
        <div className="customer-list-footnote">Semua nama, nombor telefon dan alamat dalam senarai ini ialah data rekaan untuk prototaip.</div>
      </div>

      {formMode && (
        <CustomerFormDialog
          key={`${formMode}-${formMode === 'edit' ? selectedCustomer?.customerId ?? 'none' : 'new'}`}
          mode={formMode}
          customer={formMode === 'edit' ? selectedCustomer ?? undefined : undefined}
          nextId={upcomingCustomerId}
          onClose={() => setFormMode(null)}
          onSave={saveCustomer}
        />
      )}
      {!formMode && selectedCustomer && (
        <CustomerDetailsDialog
          customer={selectedCustomer}
          onClose={() => setSelectedCustomerId(null)}
          onEdit={() => setFormMode('edit')}
        />
      )}
    </section>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="customer-summary-card">
      <span className="customer-summary-icon">{icon}</span>
      <span className="customer-summary-label">{label}</span>
      <strong>{value}</strong>
      <small>rekod contoh sahaja</small>
    </div>
  );
}

function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return <span className={`customer-status-badge ${status === 'Aktif' ? 'is-active' : 'is-inactive'}`}><i />{status}</span>;
}

function CustomerFormDialog({
  mode,
  customer,
  nextId,
  onClose,
  onSave,
}: {
  mode: 'new' | 'edit';
  customer?: CustomerRecord;
  nextId: string;
  onClose: () => void;
  onSave: (values: CustomerFormValues, existing?: CustomerRecord) => void;
}) {
  const isEditing = mode === 'edit';
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: customer ? {
      fullName: customer.fullName,
      customerType: customer.customerType,
      phoneNumber: customer.phoneNumber,
      email: customer.email,
      mailingAddress: customer.mailingAddress,
      notes: customer.notes,
      status: customer.status,
    } : EMPTY_VALUES,
  });

  const submit = form.handleSubmit((values) => onSave(values, customer));
  const registrationDate = customer?.registrationDate ?? localDateIso();

  return (
    <div className="customer-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="customer-dialog customer-form-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-form-title">
        <div className="customer-dialog-header">
          <div>
            <span className="customer-dialog-kicker">{isEditing ? 'KEMAS KINI REKOD' : 'PENDAFTARAN BAHARU'}</span>
            <h2 id="customer-form-title">{isEditing ? 'Sunting pelanggan' : 'Daftar pelanggan'}</h2>
            <p>{isEditing ? 'Kemas kini butiran pelanggan demo.' : 'Isi maklumat pelanggan untuk mencipta rekod prototaip.'}</p>
          </div>
          <button className="customer-dialog-close" type="button" onClick={onClose} aria-label="Tutup borang" data-testid="button-close-customer-form"><X size={19} /></button>
        </div>

        <div className="customer-prototype-inline"><ShieldCheck size={16} /><span>Prototaip sahaja. Rekod ini tidak disimpan selepas halaman dimuat semula.</span></div>

        <Form {...form}>
          <form onSubmit={submit} noValidate data-testid="form-customer">
            <div className="customer-auto-fields">
              <div className="customer-auto-field">
                <span>ID pelanggan</span>
                <strong>{customer?.customerId ?? nextId}</strong>
                <small>Dijana secara automatik</small>
              </div>
              <div className="customer-auto-field">
                <span>Tarikh pendaftaran</span>
                <strong>{formatDate(registrationDate)}</strong>
                <small>{isEditing ? 'Tarikh asal dikekalkan' : 'Dijana semasa pendaftaran'}</small>
              </div>
              <div className="customer-auto-field">
                <span>Status pelanggan</span>
                {isEditing ? (
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem className="customer-status-form-item">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger aria-label="Status pelanggan" data-testid="select-customer-status"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Aktif">Aktif</SelectItem>
                          <SelectItem value="Tidak aktif">Tidak aktif</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                ) : (
                  <strong className="customer-status-badge is-active"><i />Aktif</strong>
                )}
                {!isEditing && <small>Ditetapkan secara automatik</small>}
              </div>
            </div>

            <div className="customer-form-grid">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem className="customer-form-field customer-field-full">
                  <FormLabel>Nama penuh / nama syarikat <span>*</span></FormLabel>
                  <FormControl><Input {...field} autoComplete="name" maxLength={120} placeholder="Contoh: Aisyah Contoh" data-testid="input-customer-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="customerType" render={({ field }) => (
                <FormItem className="customer-form-field">
                  <FormLabel>Jenis pelanggan <span>*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger data-testid="select-customer-type"><SelectValue placeholder="Pilih jenis pelanggan" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Individu">Individu</SelectItem>
                      <SelectItem value="Syarikat">Syarikat</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem className="customer-form-field">
                  <FormLabel>Nombor telefon <span>*</span></FormLabel>
                  <FormControl><Input {...field} type="tel" inputMode="tel" autoComplete="tel" maxLength={24} placeholder="Contoh: 012-345 6789" data-testid="input-customer-phone" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem className="customer-form-field">
                  <FormLabel>E-mel <small>(pilihan)</small></FormLabel>
                  <FormControl><Input {...field} type="email" inputMode="email" autoComplete="email" maxLength={160} placeholder="nama@contoh.com" data-testid="input-customer-email" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="mailingAddress" render={({ field }) => (
                <FormItem className="customer-form-field customer-field-full">
                  <FormLabel>Alamat surat-menyurat <small>(pilihan)</small></FormLabel>
                  <FormControl><Textarea {...field} rows={2} maxLength={400} placeholder="Masukkan alamat surat-menyurat" data-testid="input-customer-address" /></FormControl>
                  <FormDescription>Maksimum 400 aksara.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem className="customer-form-field customer-field-full">
                  <FormLabel>Catatan <small>(pilihan)</small></FormLabel>
                  <FormControl><Textarea {...field} rows={3} maxLength={1000} placeholder="Catatan tambahan untuk rekod ini" data-testid="input-customer-notes" /></FormControl>
                  <FormDescription>Maksimum 1,000 aksara.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="customer-vehicle-future">
              <CarFront size={17} />
              <div><strong>Kenderaan berkaitan</strong><span>Satu pelanggan boleh mempunyai beberapa kenderaan. Pautan kenderaan akan ditambah melalui modul Kenderaan pada masa akan datang.</span></div>
            </div>

            <div className="customer-dialog-footer">
              <button type="button" className="customer-secondary-button" onClick={onClose} data-testid="button-cancel-customer">{'Batal'}</button>
              <button type="submit" className="primary-btn customer-submit-button" disabled={form.formState.isSubmitting} data-testid="button-submit-customer">
                <Check size={16} />{isEditing ? 'Simpan perubahan' : 'Daftar pelanggan'}
              </button>
            </div>
          </form>
        </Form>
      </section>
    </div>
  );
}

function CustomerDetailsDialog({ customer, onClose, onEdit }: { customer: CustomerRecord; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="customer-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="customer-dialog customer-details-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-details-title">
        <div className="customer-dialog-header">
          <div>
            <span className="customer-dialog-kicker">BUTIRAN PELANGGAN · {customer.customerId}</span>
            <h2 id="customer-details-title">{customer.fullName}</h2>
            <p>Rekod prototaip · Maklumat ini tidak disimpan selepas sesi tamat.</p>
          </div>
          <button className="customer-dialog-close" type="button" onClick={onClose} aria-label="Tutup butiran pelanggan" data-testid="button-close-customer-details"><X size={19} /></button>
        </div>

        <div className="customer-detail-status-row">
          <span className="customer-type-chip">{customer.customerType}</span>
          <CustomerStatusBadge status={customer.status} />
        </div>

        <dl className="customer-details-grid">
          <DetailItem icon={<Phone size={16} />} label="Nombor telefon" value={customer.phoneNumber} />
          <DetailItem icon={<Mail size={16} />} label="E-mel" value={customer.email || 'Tidak diberikan'} />
          <DetailItem icon={<CalendarDays size={16} />} label="Tarikh pendaftaran" value={formatDate(customer.registrationDate)} />
          <DetailItem icon={<MapPin size={16} />} label="Alamat surat-menyurat" value={customer.mailingAddress || 'Tidak diberikan'} />
          <div className="customer-detail-item customer-detail-full">
            <span className="customer-detail-icon"><ShieldCheck size={16} /></span>
            <div><dt>Catatan</dt><dd>{customer.notes || 'Tiada catatan'}</dd></div>
          </div>
        </dl>

        <div className="customer-linked-vehicles">
          <div className="customer-linked-vehicles-title"><CarFront size={17} /><strong>Kenderaan berkaitan</strong><span>{customer.vehicleIds.length}</span></div>
          <p>{customer.vehicleIds.length ? `${customer.vehicleIds.length} kenderaan demo dipautkan.` : 'Belum ada kenderaan dipautkan. Satu rekod pelanggan boleh mempunyai beberapa kenderaan.'}</p>
        </div>

        <div className="customer-dialog-footer">
          <button type="button" className="customer-secondary-button" onClick={onClose}>Tutup</button>
          <button type="button" className="primary-btn customer-submit-button" onClick={onEdit} data-testid="button-edit-customer-details"><Pencil size={15} /> Sunting pelanggan</button>
        </div>
      </section>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="customer-detail-item">
      <span className="customer-detail-icon">{icon}</span>
      <div><dt>{label}</dt><dd>{value}</dd></div>
    </div>
  );
}
