export type CustomerType = 'Individual' | 'Company';
export type CustomerStatus = 'Active' | 'Inactive';

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
  relatedRecordIds: string[];
};

export const DEMO_CUSTOMERS: CustomerRecord[] = [
  {
    customerId: 'RTP-DEMO-0001',
    fullName: 'Aisyah Contoh',
    customerType: 'Individual',
    phoneNumber: '012-000 0101',
    email: 'aisyah@example.com',
    mailingAddress: 'Sample address, Kuala Lumpur',
    notes: 'Fictional record for preview only.',
    registrationDate: '2025-06-12',
    status: 'Active',
    vehicleIds: [],
    relatedRecordIds: [],
  },
  {
    customerId: 'RTP-DEMO-0002',
    fullName: 'Perniagaan Contoh Maju Sdn. Bhd.',
    customerType: 'Company',
    phoneNumber: '03-0000 0202',
    email: 'admin@example.com',
    mailingAddress: 'Sample office address, Selangor',
    notes: 'Sample company information.',
    registrationDate: '2025-05-28',
    status: 'Active',
    vehicleIds: [],
    relatedRecordIds: [],
  },
  {
    customerId: 'RTP-DEMO-0003',
    fullName: 'Imran Hakim Contoh',
    customerType: 'Individual',
    phoneNumber: '013-000 0303',
    email: '',
    mailingAddress: '',
    notes: '',
    registrationDate: '2025-04-03',
    status: 'Active',
    vehicleIds: [],
    relatedRecordIds: [],
  },
  {
    customerId: 'RTP-DEMO-0004',
    fullName: 'Kedai Runcit Demo',
    customerType: 'Company',
    phoneNumber: '04-000 0404',
    email: 'kedai@example.com',
    mailingAddress: 'Fictional address, Penang',
    notes: 'Inactive sample customer.',
    registrationDate: '2024-11-19',
    status: 'Inactive',
    vehicleIds: [],
    relatedRecordIds: [],
  },
];
