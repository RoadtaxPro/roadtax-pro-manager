import { useMemo, useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CarFront,
  Check,
  Download,
  Eye,
  FileSpreadsheet,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerCsvImportDialog } from './CustomerCsvImportDialog';
import { createCustomerImportPreview, CUSTOMER_CSV_HEADERS, decodeCustomerCsv, type CustomerImportPreview } from './customer-import';
import type { CustomerRecord, CustomerStatus, CustomerType } from './customer-types';
import { customerFormSchema, type CustomerFormValues } from './customer-validation';
import './customer-management.css';

type CustomerManagementProps = {
  customers: CustomerRecord[];
  setCustomers: Dispatch<SetStateAction<CustomerRecord[]>>;
  notify: (message: string) => void;
  hasExternalRelatedRecords: (customer: CustomerRecord) => boolean;
};

type CustomerConfirmationAction = 'deactivate' | 'reactivate' | 'delete';

const EMPTY_VALUES: CustomerFormValues = {
  fullName: '',
  customerType: 'Individual',
  phoneNumber: '',
  email: '',
  mailingAddress: '',
  notes: '',
  status: 'Active',
};

function localDateIso() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
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
  return value.trim().toLocaleLowerCase('en-MY');
}

export function CustomerManagement({ customers, setCustomers, notify, hasExternalRelatedRecords }: CustomerManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [formMode, setFormMode] = useState<'new' | 'edit' | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [confirmationAction, setConfirmationAction] = useState<CustomerConfirmationAction | null>(null);
  const [importPreview, setImportPreview] = useState<CustomerImportPreview | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState('');
  const upcomingCustomerId = useMemo(() => nextCustomerId(customers), [customers]);

  const visibleCustomers = useMemo(() => {
    const term = normalizeSearch(search);
    return customers.filter((customer) => {
      const matchesSearch = !term || [
        customer.fullName,
        customer.customerId,
        customer.phoneNumber,
      ].some((value) => normalizeSearch(value).includes(term));
      const matchesType = typeFilter === 'All types' || customer.customerType === typeFilter;
      const matchesStatus = statusFilter === 'All statuses' || customer.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [customers, search, statusFilter, typeFilter]);

  const selectedCustomer = customers.find((customer) => customer.customerId === selectedCustomerId) ?? null;
  const individualCount = customers.filter((customer) => customer.customerType === 'Individual').length;
  const companyCount = customers.filter((customer) => customer.customerType === 'Company').length;
  const selectedCustomerHasRelatedRecords = selectedCustomer ? isDeleteBlocked(selectedCustomer, hasExternalRelatedRecords) : false;

  function clearFilters() {
    setSearch('');
    setTypeFilter('All types');
    setStatusFilter('All statuses');
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
      status: existing ? values.status : 'Active',
      vehicleIds: existing?.vehicleIds ?? [],
      relatedRecordIds: existing?.relatedRecordIds ?? [],
    };

    if (existing) {
      setCustomers((current) => current.map((item) => item.customerId === existing.customerId ? customer : item));
      setSelectedCustomerId(customer.customerId);
      setFormMode(null);
      notify(`Customer ${customer.customerId} was updated in this prototype session.`);
    } else {
      setCustomers((current) => [customer, ...current]);
      setFormMode(null);
      notify(`Customer ${customer.customerId} was added in this prototype session.`);
    }
  }

  async function handleCsvFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    setImportError('');
    if (!file.name.toLocaleLowerCase('en-MY').endsWith('.csv')) {
      setImportError('Choose a CSV file to import.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImportError('The CSV file must be smaller than 5 MB.');
      return;
    }

    try {
      const csvText = decodeCustomerCsv(await file.arrayBuffer());
      const preview = createCustomerImportPreview(csvText, customers);
      setImportFileName(file.name);
      setImportPreview(preview);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'The CSV could not be read. Check the file and try again.');
    }
  }

  function downloadCsvTemplate() {
    const content = `\uFEFF${CUSTOMER_CSV_HEADERS.join(',')}\r\n`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'roadtax-pro-customer-template.csv';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function confirmCsvImport() {
    if (!importPreview || importPreview.readyCount === 0) return;
    const rowsToImport = importPreview.rows.filter((row) => row.result === 'ready');
    const registrationDate = localDateIso();

    setCustomers((current) => {
      let idSource = current;
      const imported: CustomerRecord[] = [];
      for (const row of rowsToImport) {
        const customer: CustomerRecord = {
          customerId: nextCustomerId(idSource),
          ...row.candidate,
          registrationDate,
          status: 'Active',
          vehicleIds: [],
          relatedRecordIds: [],
        };
        imported.push(customer);
        idSource = [...idSource, customer];
      }
      return [...imported, ...current];
    });

    const duplicateText = importPreview.duplicateCount ? ` ${importPreview.duplicateCount} duplicate row(s) skipped.` : '';
    const invalidText = importPreview.invalidCount ? ` ${importPreview.invalidCount} invalid row(s) skipped.` : '';
    notify(`Imported ${rowsToImport.length} customer(s) into this prototype session.${duplicateText}${invalidText}`);
    setImportPreview(null);
    setImportFileName('');
  }

  function confirmCustomerAction() {
    if (!selectedCustomer || !confirmationAction) return;
    const customer = selectedCustomer;
    const action = confirmationAction;

    if (action === 'delete') {
      if (isDeleteBlocked(customer, hasExternalRelatedRecords)) {
        setConfirmationAction(null);
        notify('This customer cannot be deleted while related records exist. Deactivate the customer instead.');
        return;
      }
      setCustomers((current) => current.filter((item) => item.customerId !== customer.customerId));
      setSelectedCustomerId(null);
      notify(`Customer ${customer.customerId} was removed from this prototype session.`);
    } else {
      const status: CustomerStatus = action === 'deactivate' ? 'Inactive' : 'Active';
      setCustomers((current) => current.map((item) => item.customerId === customer.customerId ? { ...item, status } : item));
      notify(`Customer ${customer.customerId} is now ${status.toLocaleLowerCase('en-MY')}.`);
    }

    setConfirmationAction(null);
  }

  return (
    <section className="customer-module" aria-labelledby="customer-page-title">
      <div className="module-header customer-page-header">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> CUSTOMER RECORDS</div>
          <h1 id="customer-page-title">Customers</h1>
          <p>Register and manage Roadtax Pro customer information.</p>
        </div>
        <div className="customer-page-actions">
          <button className="customer-template-button" onClick={downloadCsvTemplate} data-testid="button-download-csv-template">
            <Download size={15} /> Download CSV Template
          </button>
          <button className="customer-import-button" onClick={() => fileInputRef.current?.click()} data-testid="button-import-customers">
            <Upload size={15} /> Import Customers
          </button>
          <button className="primary-btn customer-add-button" onClick={() => setFormMode('new')} data-testid="button-add-customer">
            <Plus size={17} /> Add Customer
          </button>
          <input ref={fileInputRef} className="customer-file-input" type="file" accept=".csv,text/csv" onChange={handleCsvFileChange} aria-label="Choose a customer CSV file" />
        </div>
      </div>

      <div className="customer-prototype-banner" role="note" data-testid="notice-prototype-data">
        <span className="customer-prototype-icon"><ShieldCheck size={17} /></span>
        <div>
          <strong>Prototype · Fictional sample data only</strong>
          <p>New records and imports are available only in this session and are not saved after the page is refreshed.</p>
        </div>
      </div>
      {importError && <div className="customer-import-error" role="alert"><AlertTriangle size={16} /><span>{importError}</span><button onClick={() => setImportError('')} aria-label="Dismiss import error"><X size={15} /></button></div>}

      <div className="customer-summary-grid">
        <SummaryCard icon={<Users size={17} />} label="Customers in this session" value={customers.length} />
        <SummaryCard icon={<UserRound size={17} />} label="Individuals" value={individualCount} />
        <SummaryCard icon={<Building2 size={17} />} label="Companies" value={companyCount} />
      </div>

      <div className="customer-list-panel">
        <div className="customer-list-toolbar">
          <div className="customer-list-heading">
            <div>
              <h2>Customer List</h2>
              <span>{visibleCustomers.length} of {customers.length} sample records</span>
            </div>
            <span className="customer-demo-chip"><i /> Demo data</span>
          </div>
          <div className="customer-filter-row">
            <label className="customer-search">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Search customer name, ID, or phone number</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, ID, or phone"
                data-testid="input-customer-search"
              />
              {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>}
            </label>
            <label className="customer-filter-control">
              <span>Type</span>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter customer type" data-testid="filter-customer-type">
                <option>All types</option>
                <option>Individual</option>
                <option>Company</option>
              </select>
            </label>
            <label className="customer-filter-control">
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter customer status" data-testid="filter-customer-status">
                <option>All statuses</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
            {(search || typeFilter !== 'All types' || statusFilter !== 'All statuses') && (
              <button className="customer-clear-filters" onClick={clearFilters} data-testid="button-clear-customer-filters">Clear filters</button>
            )}
          </div>
        </div>

        {visibleCustomers.length === 0 ? (
          <div className="customer-empty-state" data-testid="empty-customer-results">
            <Search size={22} />
            <strong>No customers found</strong>
            <span>Try another search term or filter.</span>
            <button onClick={clearFilters}>Clear search and filters</button>
          </div>
        ) : (
          <>
            <div className="customer-desktop-table">
              <table>
                <thead>
                  <tr>
                    <th>CUSTOMER ID</th>
                    <th>CUSTOMER NAME</th>
                    <th>TYPE</th>
                    <th>PHONE NUMBER</th>
                    <th>REGISTRATION DATE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleCustomers.map((customer) => (
                    <tr key={customer.customerId} data-testid={`row-customer-${customer.customerId}`}>
                      <td><span className="customer-id-text">{customer.customerId}</span></td>
                      <td>
                        <div className="customer-name-cell">
                          <span className={`customer-avatar ${customer.customerType === 'Company' ? 'company-avatar' : ''}`}>
                            {customer.customerType === 'Company' ? <Building2 size={16} /> : <UserRound size={16} />}
                          </span>
                          <span><strong>{customer.fullName}</strong><small>{customer.email || 'No email provided'}</small></span>
                        </div>
                      </td>
                      <td><span className="customer-type-chip">{customer.customerType}</span></td>
                      <td>{customer.phoneNumber}</td>
                      <td>{formatDate(customer.registrationDate)}</td>
                      <td><CustomerStatusBadge status={customer.status} /></td>
                      <td>
                        <div className="customer-row-actions">
                          <button onClick={() => setSelectedCustomerId(customer.customerId)} aria-label={`View ${customer.fullName}`} data-testid={`button-view-customer-${customer.customerId}`}><Eye size={16} /><span>View Profile</span></button>
                          <button onClick={() => { setSelectedCustomerId(customer.customerId); setFormMode('edit'); }} aria-label={`Edit ${customer.fullName}`} data-testid={`button-edit-customer-${customer.customerId}`}><Pencil size={15} /><span>Edit</span></button>
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
                      <span className={`customer-avatar ${customer.customerType === 'Company' ? 'company-avatar' : ''}`}>
                        {customer.customerType === 'Company' ? <Building2 size={16} /> : <UserRound size={16} />}
                    </span>
                    <div className="customer-mobile-name"><strong>{customer.fullName}</strong><span>{customer.customerId}</span></div>
                    <CustomerStatusBadge status={customer.status} />
                  </div>
                  <div className="customer-mobile-details">
                    <span><Phone size={14} />{customer.phoneNumber}</span>
                    <span>{customer.customerType} · Registered {formatDate(customer.registrationDate)}</span>
                  </div>
                  <div className="customer-mobile-actions">
                    <button onClick={() => setSelectedCustomerId(customer.customerId)} data-testid={`button-view-customer-mobile-${customer.customerId}`}><Eye size={15} /> View Profile</button>
                    <button onClick={() => { setSelectedCustomerId(customer.customerId); setFormMode('edit'); }} data-testid={`button-edit-customer-mobile-${customer.customerId}`}><Pencil size={15} /> Edit</button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
        <div className="customer-list-footnote">All names, phone numbers, and addresses in this list are fictional prototype data.</div>
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
          canDelete={!selectedCustomerHasRelatedRecords}
          onClose={() => setSelectedCustomerId(null)}
          onEdit={() => setFormMode('edit')}
          onRequestAction={setConfirmationAction}
        />
      )}
      {importPreview && (
        <CustomerCsvImportDialog
          fileName={importFileName}
          preview={importPreview}
          onClose={() => { setImportPreview(null); setImportFileName(''); }}
          onConfirm={confirmCsvImport}
        />
      )}
      {confirmationAction && selectedCustomer && (
        <CustomerActionConfirmation
          action={confirmationAction}
          customer={selectedCustomer}
          onCancel={() => setConfirmationAction(null)}
          onConfirm={confirmCustomerAction}
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
      <small>sample records only</small>
    </div>
  );
}

function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return <span className={`customer-status-badge ${status === 'Active' ? 'is-active' : 'is-inactive'}`}><i />{status}</span>;
}

function isDeleteBlocked(customer: CustomerRecord, hasExternalRelatedRecords: (customer: CustomerRecord) => boolean) {
  return customer.vehicleIds.length > 0 || customer.relatedRecordIds.length > 0 || hasExternalRelatedRecords(customer);
}

function relatedRecordCount(customer: CustomerRecord) {
  return customer.vehicleIds.length + customer.relatedRecordIds.length;
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
            <span className="customer-dialog-kicker">{isEditing ? 'EDIT CUSTOMER RECORD' : 'NEW CUSTOMER REGISTRATION'}</span>
            <h2 id="customer-form-title">{isEditing ? 'Edit Customer' : 'Add Customer'}</h2>
            <p>{isEditing ? 'Update this customer’s details.' : 'Enter customer information to create a prototype record.'}</p>
          </div>
          <button className="customer-dialog-close" type="button" onClick={onClose} aria-label="Close form" data-testid="button-close-customer-form"><X size={19} /></button>
        </div>

        <div className="customer-prototype-inline"><ShieldCheck size={16} /><span>Prototype only. This record will not be saved after the page is refreshed.</span></div>

        <Form {...form}>
          <form onSubmit={submit} noValidate data-testid="form-customer">
            <div className="customer-auto-fields">
              <div className="customer-auto-field">
                <span>Customer ID</span>
                <strong>{customer?.customerId ?? nextId}</strong>
                <small>Generated automatically</small>
              </div>
              <div className="customer-auto-field">
                <span>Registration Date</span>
                <strong>{formatDate(registrationDate)}</strong>
                <small>{isEditing ? 'Original date retained' : 'Generated on registration'}</small>
              </div>
              <div className="customer-auto-field">
                <span>Customer Status</span>
                {isEditing ? (
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem className="customer-status-form-item">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger aria-label="Customer status" data-testid="select-customer-status"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                ) : (
                  <strong className="customer-status-badge is-active"><i />Active</strong>
                )}
                {!isEditing && <small>Set automatically</small>}
              </div>
            </div>

            <div className="customer-form-grid">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem className="customer-form-field customer-field-full">
                  <FormLabel>Customer Name / Company Name <span>*</span></FormLabel>
                  <FormControl><Input {...field} autoComplete="name" maxLength={120} placeholder="Example: Aisyah Contoh" data-testid="input-customer-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="customerType" render={({ field }) => (
                <FormItem className="customer-form-field">
                  <FormLabel>Customer Type <span>*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger data-testid="select-customer-type"><SelectValue placeholder="Select customer type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem className="customer-form-field">
                  <FormLabel>Phone Number <span>*</span></FormLabel>
                  <FormControl><Input {...field} type="tel" inputMode="tel" autoComplete="tel" maxLength={24} placeholder="Example: 012-345 6789" data-testid="input-customer-phone" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem className="customer-form-field">
                  <FormLabel>Email Address <small>(optional)</small></FormLabel>
                  <FormControl><Input {...field} type="email" inputMode="email" autoComplete="email" maxLength={160} placeholder="name@example.com" data-testid="input-customer-email" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="mailingAddress" render={({ field }) => (
                <FormItem className="customer-form-field customer-field-full">
                  <FormLabel>Mailing Address <small>(optional)</small></FormLabel>
                  <FormControl><Textarea {...field} rows={2} maxLength={400} placeholder="Enter mailing address" data-testid="input-customer-address" /></FormControl>
                  <FormDescription>Maximum 400 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem className="customer-form-field customer-field-full">
                  <FormLabel>Notes <small>(optional)</small></FormLabel>
                  <FormControl><Textarea {...field} rows={3} maxLength={1000} placeholder="Additional notes for this record" data-testid="input-customer-notes" /></FormControl>
                  <FormDescription>Maximum 1,000 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="customer-vehicle-future">
              <CarFront size={17} />
              <div><strong>Related Vehicles</strong><span>A customer can have multiple vehicles. Vehicle links can be managed here when the Vehicles module is connected.</span></div>
            </div>

            <div className="customer-dialog-footer">
              <button type="button" className="customer-secondary-button" onClick={onClose} data-testid="button-cancel-customer">Cancel</button>
              <button type="submit" className="primary-btn customer-submit-button" disabled={form.formState.isSubmitting} data-testid="button-submit-customer">
                <Check size={16} />{isEditing ? 'Save Changes' : 'Add Customer'}
              </button>
            </div>
          </form>
        </Form>
      </section>
    </div>
  );
}

function CustomerDetailsDialog({
  customer,
  canDelete,
  onClose,
  onEdit,
  onRequestAction,
}: {
  customer: CustomerRecord;
  canDelete: boolean;
  onClose: () => void;
  onEdit: () => void;
  onRequestAction: (action: CustomerConfirmationAction) => void;
}) {
  return (
    <div className="customer-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="customer-dialog customer-details-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-details-title">
        <div className="customer-dialog-header">
          <div>
            <span className="customer-dialog-kicker">CUSTOMER PROFILE · {customer.customerId}</span>
            <h2 id="customer-details-title">{customer.fullName}</h2>
            <p>Prototype record · Changes are not saved after this session.</p>
          </div>
          <button className="customer-dialog-close" type="button" onClick={onClose} aria-label="Close customer profile" data-testid="button-close-customer-details"><X size={19} /></button>
        </div>

        <div className="customer-detail-status-row">
          <span className="customer-type-chip">{customer.customerType}</span>
          <CustomerStatusBadge status={customer.status} />
        </div>

        <dl className="customer-details-grid">
          <DetailItem icon={<Phone size={16} />} label="Phone Number" value={customer.phoneNumber} />
          <DetailItem icon={<Mail size={16} />} label="Email Address" value={customer.email || 'Not provided'} />
          <DetailItem icon={<CalendarDays size={16} />} label="Registration Date" value={formatDate(customer.registrationDate)} />
          <DetailItem icon={<MapPin size={16} />} label="Mailing Address" value={customer.mailingAddress || 'Not provided'} />
          <div className="customer-detail-item customer-detail-full">
            <span className="customer-detail-icon"><ShieldCheck size={16} /></span>
            <div><dt>Notes</dt><dd>{customer.notes || 'No notes'}</dd></div>
          </div>
        </dl>

        <div className="customer-linked-vehicles">
          <div className="customer-linked-vehicles-title"><CarFront size={17} /><strong>Related Vehicles</strong><span>{customer.vehicleIds.length}</span></div>
          <p>{customer.vehicleIds.length ? `${customer.vehicleIds.length} vehicle(s) linked.` : 'No vehicles are linked. One customer can have multiple vehicles.'}</p>
          {customer.relatedRecordIds.length > 0 && <p>{customer.relatedRecordIds.length} other related business record(s) linked.</p>}
        </div>

        {!canDelete && (
          <div className="customer-delete-protection" role="note">
            <ShieldCheck size={16} />
            <span>Deletion is disabled because this customer is linked to a vehicle or business record. Deactivate the customer instead to keep the related history.</span>
          </div>
        )}

        <div className="customer-dialog-footer">
          <button
            type="button"
            className="customer-danger-button"
            onClick={() => onRequestAction(customer.status === 'Active' ? 'deactivate' : 'reactivate')}
            data-testid={customer.status === 'Active' ? 'button-deactivate-customer' : 'button-reactivate-customer'}
          >
            {customer.status === 'Active' ? 'Deactivate Customer' : 'Activate Customer'}
          </button>
          <button type="button" className="customer-delete-button" onClick={() => onRequestAction('delete')} disabled={!canDelete} data-testid="button-delete-customer">
            <Trash2 size={14} /> Delete Customer
          </button>
          <span className="customer-footer-spacer" />
          <button type="button" className="customer-secondary-button" onClick={onClose}>Close</button>
          <button type="button" className="primary-btn customer-submit-button" onClick={onEdit} data-testid="button-edit-customer-details"><Pencil size={15} /> Edit Customer</button>
        </div>
      </section>
    </div>
  );
}

function CustomerActionConfirmation({
  action,
  customer,
  onCancel,
  onConfirm,
}: {
  action: CustomerConfirmationAction;
  customer: CustomerRecord;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isDelete = action === 'delete';
  const isDeactivate = action === 'deactivate';
  const title = isDelete ? 'Delete Customer?' : isDeactivate ? 'Deactivate Customer?' : 'Activate Customer?';
  const confirmLabel = isDelete ? 'Delete Customer' : isDeactivate ? 'Deactivate Customer' : 'Activate Customer';

  return (
    <div className="customer-dialog-backdrop customer-action-backdrop">
      <section className="customer-dialog customer-action-dialog" role="alertdialog" aria-modal="true" aria-labelledby="customer-action-title" aria-describedby="customer-action-description">
        <div className="customer-action-icon"><AlertTriangle size={20} /></div>
        <h2 id="customer-action-title">{title}</h2>
        <p id="customer-action-description">
          {isDelete
            ? `This removes ${customer.fullName} from the current prototype session. This action cannot be undone before the page is refreshed. Customers with linked records cannot be deleted.`
            : isDeactivate
              ? `${customer.fullName} will be marked Inactive. The customer and any related history will remain in this prototype session.`
              : `${customer.fullName} will be marked Active again.`}
        </p>
        <div className="customer-dialog-footer">
          <button type="button" className="customer-secondary-button" onClick={onCancel}>Cancel</button>
          <button type="button" className={isDelete ? 'customer-delete-confirm-button' : 'customer-danger-confirm-button'} onClick={onConfirm} data-testid="button-confirm-customer-action">{confirmLabel}</button>
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
