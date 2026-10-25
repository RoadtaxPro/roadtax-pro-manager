export type CustomerType = 'Individu' | 'Syarikat';
export type CustomerStatus = 'Aktif' | 'Tidak aktif';

export type CustomerRecord = {
  customerId: string;
  fullName: string;
  customerType: CustomerType;
  phoneNumber: string;
  email: string;
  mailingAddress: string;
  notes: string;
  registrationDate: string;
  status: CustomerStatus;
  vehicleIds: string[];
};

export const DEMO_CUSTOMERS: CustomerRecord[] = [
  {
    customerId: 'RTP-DEMO-0001',
    fullName: 'Aisyah Contoh',
    customerType: 'Individu',
    phoneNumber: '012-000 0101',
    email: 'aisyah@example.com',
    mailingAddress: 'Alamat contoh, Kuala Lumpur',
    notes: 'Rekod rekaan untuk pratonton sahaja.',
    registrationDate: '2025-06-12',
    status: 'Aktif',
    vehicleIds: [],
  },
  {
    customerId: 'RTP-DEMO-0002',
    fullName: 'Perniagaan Contoh Maju Sdn. Bhd.',
    customerType: 'Syarikat',
    phoneNumber: '03-0000 0202',
    email: 'admin@contoh.example',
    mailingAddress: 'Alamat pejabat contoh, Selangor',
    notes: 'Maklumat syarikat contoh.',
    registrationDate: '2025-05-28',
    status: 'Aktif',
    vehicleIds: [],
  },
  {
    customerId: 'RTP-DEMO-0003',
    fullName: 'Imran Hakim Contoh',
    customerType: 'Individu',
    phoneNumber: '013-000 0303',
    email: '',
    mailingAddress: '',
    notes: '',
    registrationDate: '2025-04-03',
    status: 'Aktif',
    vehicleIds: [],
  },
  {
    customerId: 'RTP-DEMO-0004',
    fullName: 'Kedai Runcit Demo',
    customerType: 'Syarikat',
    phoneNumber: '04-000 0404',
    email: 'kedai@example.com',
    mailingAddress: 'Alamat rekaan, Pulau Pinang',
    notes: 'Pelanggan contoh tidak aktif.',
    registrationDate: '2024-11-19',
    status: 'Tidak aktif',
    vehicleIds: [],
  },
];
