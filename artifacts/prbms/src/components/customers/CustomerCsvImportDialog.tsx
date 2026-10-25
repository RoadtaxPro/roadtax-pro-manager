import { AlertTriangle, Check, FileSpreadsheet, X } from 'lucide-react';
import type { CustomerImportPreview } from './customer-import';

type CustomerCsvImportDialogProps = {
  fileName: string;
  preview: CustomerImportPreview;
  onClose: () => void;
  onConfirm: () => void;
};

export function CustomerCsvImportDialog({ fileName, preview, onClose, onConfirm }: CustomerCsvImportDialogProps) {
  return (
    <div className="customer-dialog-backdrop customer-import-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="customer-dialog customer-import-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-import-title">
        <div className="customer-dialog-header">
          <div>
            <span className="customer-dialog-kicker">CUSTOMER DATA</span>
            <h2 id="customer-import-title">Import Preview</h2>
            <p>Review the CSV rows before adding them to this prototype session.</p>
          </div>
          <button className="customer-dialog-close" type="button" onClick={onClose} aria-label="Close import preview"><X size={19} /></button>
        </div>

        <div className="customer-import-file">
          <span><FileSpreadsheet size={17} /></span>
          <div><strong>{fileName}</strong><small>CSV file · Up to 999 customer rows</small></div>
        </div>

        <div className="customer-import-notice" role="note">
          <AlertTriangle size={16} />
          <p>Only valid, unique rows will be imported. Duplicate and invalid rows will be skipped. Phone numbers are read as text; set the phone column to Text in Excel to preserve leading zeros.</p>
        </div>

        <div className="customer-import-summary" aria-label="Import summary">
          <div className="is-ready"><strong>{preview.readyCount}</strong><span>Ready to import</span></div>
          <div className="is-duplicate"><strong>{preview.duplicateCount}</strong><span>Potential duplicates</span></div>
          <div className="is-invalid"><strong>{preview.invalidCount}</strong><span>Rows with errors</span></div>
        </div>

        <div className="customer-import-table-wrap">
          <table className="customer-import-table">
            <thead>
              <tr>
                <th>Row</th>
                <th>Customer Name</th>
                <th>Customer Type</th>
                <th>Phone Number</th>
                <th>Email Address</th>
                <th>Mailing Address</th>
                <th>Notes</th>
                <th>Import Result</th>
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row) => (
                <tr key={row.sourceRow} className={`import-row-${row.result}`}>
                  <td>{row.sourceRow}</td>
                  <td>{row.candidate.fullName || <span className="customer-import-empty">Missing name</span>}</td>
                  <td>{row.customerTypeValue || <span className="customer-import-empty">Missing type</span>}</td>
                  <td className="customer-import-phone">{row.candidate.phoneNumber || <span className="customer-import-empty">Missing phone</span>}</td>
                  <td>{row.candidate.email || <span className="customer-import-empty">Not provided</span>}</td>
                  <td className="customer-import-long-value">{row.candidate.mailingAddress || <span className="customer-import-empty">Not provided</span>}</td>
                  <td className="customer-import-long-value">{row.candidate.notes || <span className="customer-import-empty">None</span>}</td>
                  <td>
                    <span className={`customer-import-result is-${row.result}`}>
                      {row.result === 'ready' ? 'Ready' : row.result === 'duplicate' ? 'Duplicate' : 'Invalid'}
                    </span>
                    {row.messages.length > 0 && <small className="customer-import-message">{row.messages.join(' ')}</small>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="customer-dialog-footer">
          <button type="button" className="customer-secondary-button" onClick={onClose}>Cancel</button>
          <button type="button" className="primary-btn customer-submit-button" onClick={onConfirm} disabled={preview.readyCount === 0} data-testid="button-confirm-customer-import">
            <Check size={16} /> Confirm Import
          </button>
        </div>
      </section>
    </div>
  );
}
