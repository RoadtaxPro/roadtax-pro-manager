import { customerFormSchema } from './customer-validation';
import type { CustomerRecord, CustomerType } from './customer-types';

export type CustomerImportCandidate = {
  fullName: string;
  customerType: CustomerType;
  phoneNumber: string;
  email: string;
  mailingAddress: string;
  notes: string;
};

export type CustomerImportRow = {
  sourceRow: number;
  customerTypeValue: string;
  candidate: CustomerImportCandidate;
  result: 'ready' | 'duplicate' | 'invalid';
  messages: string[];
};

export type CustomerImportPreview = {
  rows: CustomerImportRow[];
  readyCount: number;
  duplicateCount: number;
  invalidCount: number;
};

export const CUSTOMER_CSV_HEADERS = [
  'Customer Name',
  'Customer Type',
  'Phone Number',
  'Email Address',
  'Mailing Address',
  'Notes',
] as const;

const MAX_IMPORT_ROWS = 999;

function detectCsvDelimiter(source: string): ',' | ';' {
  let commas = 0;
  let semicolons = 0;
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (inQuotes && source[index + 1] === '"') {
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes && (character === '\n' || character === '\r')) {
      break;
    } else if (!inQuotes && character === ',') {
      commas += 1;
    } else if (!inQuotes && character === ';') {
      semicolons += 1;
    }
  }

  return semicolons > commas ? ';' : ',';
}

function parseCsvRows(source: string, delimiter: ',' | ';'): string[][] {
  const text = source.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"' && field.length === 0) {
      inQuotes = true;
      continue;
    }

    if (character === delimiter) {
      row.push(field);
      field = '';
      continue;
    }

    if (character === '\n' || character === '\r') {
      row.push(field);
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      field = '';
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      continue;
    }

    field += character;
  }

  if (inQuotes) {
    throw new Error('The CSV contains an unfinished quoted value. Check the file and try again.');
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.trim() !== '')) rows.push(row);
  }

  return rows;
}

function normalizeName(value: string) {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-MY');
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function findDuplicate(candidate: CustomerImportCandidate, customers: CustomerRecord[], priorRows: CustomerImportRow[]) {
  const phone = normalizePhone(candidate.phoneNumber);
  const name = normalizeName(candidate.fullName);

  const existing = customers.find((customer) => (
    (phone && normalizePhone(customer.phoneNumber) === phone)
    || (normalizeName(customer.fullName) === name && customer.customerType === candidate.customerType)
  ));
  if (existing) return `Potential duplicate of customer ${existing.customerId}.`;

  const prior = priorRows.find((entry) => {
    if (entry.result !== 'ready') return false;
    const priorPhone = normalizePhone(entry.candidate.phoneNumber);
    return (phone && priorPhone === phone)
      || (normalizeName(entry.candidate.fullName) === name && entry.candidate.customerType === candidate.customerType);
  });
  return prior ? `Potential duplicate of CSV row ${prior.sourceRow}.` : null;
}

export function createCustomerImportPreview(source: string, customers: CustomerRecord[]): CustomerImportPreview {
  let text = source.replace(/^\uFEFF/, '');
  const separatorDirective = text.match(/^sep=([;,])(?:\r\n|\r|\n)/i);
  const delimiter: ',' | ';' = separatorDirective ? separatorDirective[1] as ',' | ';' : detectCsvDelimiter(text);
  if (separatorDirective) text = text.slice(separatorDirective[0].length);
  const csvRows = parseCsvRows(text, delimiter);
  if (csvRows.length < 2) {
    throw new Error('The CSV must include a header row and at least one customer row.');
  }

  const header = csvRows[0].map((value) => value.trim().replace(/^\uFEFF/, '').toLocaleLowerCase('en-MY'));
  const requiredHeaders = ['customer name', 'customer type', 'phone number'];
  const missingHeaders = requiredHeaders.filter((name) => !header.includes(name));
  if (missingHeaders.length) {
    throw new Error(`Missing required columns: ${missingHeaders.map((name) => CUSTOMER_CSV_HEADERS[requiredHeaders.indexOf(name)]).join(', ')}. Download the CSV template and try again.`);
  }

  const headerIndexes = new Map<string, number>();
  header.forEach((name, index) => {
    if (name && !headerIndexes.has(name)) headerIndexes.set(name, index);
  });

  const dataRows = csvRows.slice(1);
  if (dataRows.length > MAX_IMPORT_ROWS) {
    throw new Error(`This file contains ${dataRows.length} customer rows. The prototype import limit is 999 rows per file.`);
  }

  const column = (values: string[], name: string) => {
    const index = headerIndexes.get(name.toLocaleLowerCase('en-MY'));
    return index === undefined ? '' : (values[index] ?? '');
  };

  const previewRows: CustomerImportRow[] = [];
  dataRows.forEach((values, index) => {
    const rawType = column(values, 'Customer Type').trim().toLocaleLowerCase('en-MY');
    const customerType: CustomerType = rawType === 'company' ? 'Company' : 'Individual';
    const candidate: CustomerImportCandidate = {
      fullName: column(values, 'Customer Name').trim(),
      customerType,
      phoneNumber: column(values, 'Phone Number').trim(),
      email: column(values, 'Email Address').trim(),
      mailingAddress: column(values, 'Mailing Address').trim(),
      notes: column(values, 'Notes').trim(),
    };
    const customerTypeValue = column(values, 'Customer Type').trim();
    const sourceRow = index + 2;
    const messages: string[] = [];

    if (values.length > header.length) {
      messages.push('This row has more columns than the header. Quote values that contain commas.');
    }
    if (rawType !== 'individual' && rawType !== 'company') {
      messages.push('Customer Type must be Individual or Company.');
    }

    const validated = customerFormSchema.safeParse({
      ...candidate,
      status: 'Active',
    });
    if (!validated.success) {
      messages.push(...validated.error.issues.map((issue) => issue.message));
    }

    if (messages.length) {
      previewRows.push({ sourceRow, customerTypeValue, candidate, result: 'invalid', messages: [...new Set(messages)] });
      return;
    }

    const duplicateMessage = findDuplicate(candidate, customers, previewRows);
    if (duplicateMessage) {
      previewRows.push({ sourceRow, customerTypeValue, candidate, result: 'duplicate', messages: [duplicateMessage] });
      return;
    }

    previewRows.push({ sourceRow, customerTypeValue, candidate, result: 'ready', messages: [] });
  });

  return {
    rows: previewRows,
    readyCount: previewRows.filter((row) => row.result === 'ready').length,
    duplicateCount: previewRows.filter((row) => row.result === 'duplicate').length,
    invalidCount: previewRows.filter((row) => row.result === 'invalid').length,
  };
}

export function decodeCustomerCsv(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes.subarray(2));
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes.subarray(2));

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('windows-1252').decode(bytes);
  }
}
