import { useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  FIELDS,
  MAX_ROWS,
  buildRows,
  downloadTemplate,
  guessMapping,
  inventoryApi,
  readSheetFile,
  rememberMapping,
  type CheckResult,
  type CommitResult,
  type InventoryField,
  type RowStatus,
  type SheetFile,
} from '@/lib/inventory';

type Step = 'pick' | 'match' | 'check' | 'done';

const STATUS_STYLE: Record<RowStatus, { label: string; cls: string }> = {
  new: { label: 'New', cls: 'bg-green-50 text-green-700' },
  update: { label: 'Will update', cls: 'bg-blue-50 text-blue-700' },
  same: { label: 'No change', cls: 'bg-gray-100 text-gray-500' },
  error: { label: 'Problem', cls: 'bg-red-50 text-red-600' },
};

const apiError = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.message || fallback;

export default function UploadTab({ onSaved }: { onSaved: () => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('pick');
  const [fileName, setFileName] = useState('');
  const [sheet, setSheet] = useState<SheetFile | null>(null);
  const [mapping, setMapping] = useState<(InventoryField | '')[]>([]);
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [result, setResult] = useState<CommitResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<RowStatus | 'all'>('all');

  const reset = () => {
    setStep('pick');
    setSheet(null);
    setCheck(null);
    setResult(null);
    setFileName('');
    setFilter('all');
    if (fileInput.current) fileInput.current.value = '';
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const data = await readSheetFile(file);
      if (data.rows.length > MAX_ROWS) {
        throw new Error(`The file has ${data.rows.length} rows. Up to ${MAX_ROWS} per upload — split it.`);
      }
      setFileName(file.name);
      setSheet(data);
      setMapping(guessMapping(data.headers));
      setStep('match');
    } catch (err) {
      toast.error(apiError(err, 'Could not read that file.'));
      if (fileInput.current) fileInput.current.value = '';
    } finally {
      setBusy(false);
    }
  };

  const setColumn = (i: number, field: InventoryField | '') =>
    setMapping((m) =>
      m.map((f, j) => {
        if (j === i) return field;
        return field && f === field ? '' : f; // each field from one column only
      }),
    );

  const missing = FIELDS.filter((f) => f.required && !mapping.includes(f.key));
  const rows = sheet ? buildRows(sheet.rows, mapping) : [];

  const runCheck = async () => {
    if (!sheet) return;
    setBusy(true);
    try {
      rememberMapping(sheet.headers, mapping);
      setCheck(await inventoryApi.preview(rows));
      setFilter('all');
      setStep('check');
    } catch (err) {
      toast.error(apiError(err, 'Could not check the file.'));
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      const res = await inventoryApi.commit(rows);
      setResult(res);
      setStep('done');
      onSaved();
      toast.success(`Saved: ${res.saved.created} new, ${res.saved.updated} updated.`);
    } catch (err: any) {
      if (err?.response?.data?.code === 'PAYLUK_SETUP_REQUIRED') {
        toast.error('Set up your payment profile first (Settings › Payment setup).');
      } else {
        toast.error(apiError(err, 'Could not save. Please try again.'));
      }
    } finally {
      setBusy(false);
    }
  };

  const toSave = check ? check.summary.new + check.summary.update : 0;
  const shownRows = (check?.rows ?? []).filter((r) => filter === 'all' || r.status === filter);

  return (
    <div className="space-y-6">
      {/* Step 1 — template + file */}
      {step === 'pick' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
            <h3 className="font-bold text-gray-900">1. Get the template</h3>
            <p className="mt-1 text-sm text-gray-500">
              Fill it in with Excel or Google Sheets. Your own column names are fine too — you’ll
              match them next.
            </p>
            <Button variant="outline" onClick={downloadTemplate} className="mt-3 gap-2 rounded-xl">
              <Download size={16} /> Download template (CSV)
            </Button>
          </div>

          <label
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-8 text-center transition hover:bg-orange-50',
              busy && 'pointer-events-none opacity-60',
            )}
          >
            {busy ? (
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            ) : (
              <FileSpreadsheet className="h-8 w-8 text-orange-500" />
            )}
            <span className="font-bold text-gray-900">2. Upload your file</span>
            <span className="text-sm text-gray-500">
              CSV or Excel (.xlsx), up to {MAX_ROWS.toLocaleString()} rows. Re-upload any time to
              update prices and stock — rows match on item code, nothing is duplicated.
            </span>
            <input
              ref={fileInput}
              type="file"
              accept=".csv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
          </label>
        </div>
      )}

      {/* Step 2 — match columns */}
      {step === 'match' && sheet && (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-900">Match your columns</h3>
              <p className="mt-1 text-sm text-gray-500">
                {fileName} · {sheet.rows.length.toLocaleString()} rows. We guessed — change any
                that are wrong. We’ll remember your choice in this browser.
              </p>
            </div>
            <Button variant="ghost" onClick={reset} className="gap-2 text-gray-500">
              <RotateCcw size={14} /> Another file
            </Button>
          </div>

          <div className="mt-4 divide-y divide-gray-100 rounded-xl ring-1 ring-gray-100">
            {sheet.headers.map((h, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">{h || `Column ${i + 1}`}</p>
                  <p className="truncate text-xs text-gray-400">
                    e.g. {sheet.rows.slice(0, 2).map((r) => r[i]).filter(Boolean).join(', ') || '—'}
                  </p>
                </div>
                <select
                  value={mapping[i] ?? ''}
                  onChange={(e) => setColumn(i, e.target.value as InventoryField | '')}
                  aria-label={`What is “${h}”?`}
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-base sm:h-10 sm:w-56 sm:text-sm"
                >
                  <option value="">Don’t use</option>
                  {FIELDS.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                      {f.required ? ' *' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {missing.length > 0 && (
            <p className="mt-3 text-sm font-medium text-red-600">
              Choose a column for: {missing.map((m) => m.label).join(', ')}
            </p>
          )}
          <Button
            onClick={() => void runCheck()}
            disabled={busy || missing.length > 0}
            className="mt-4 w-full gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 sm:w-auto"
          >
            {busy && <Loader2 size={16} className="animate-spin" />} Check {rows.length.toLocaleString()} rows
          </Button>
        </div>
      )}

      {/* Step 3 — check, then save */}
      {step === 'check' && check && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(['new', 'update', 'same', 'error'] as RowStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(filter === s ? 'all' : s)}
                className={cn(
                  'rounded-2xl bg-white p-4 text-left ring-1 ring-black/5 transition',
                  filter === s && 'ring-2 ring-orange-400',
                )}
              >
                <p className="text-2xl font-black text-gray-900">{check.summary[s].toLocaleString()}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {STATUS_STYLE[s].label}
                </p>
              </button>
            ))}
          </div>

          <div className="max-h-[55vh] overflow-y-auto rounded-2xl bg-white ring-1 ring-black/5">
            {shownRows.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-400">No rows here.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {shownRows.slice(0, 500).map((r) => (
                  <li key={r.row} className="flex items-start gap-3 px-4 py-2.5 text-sm">
                    <span className="w-10 shrink-0 text-xs text-gray-400 tabular-nums">#{r.row}</span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium text-gray-800 sm:truncate">{r.name || '—'}</p>
                      {r.reason && <p className="text-xs text-red-600">{r.reason}</p>}
                      {r.status === 'update' && r.changes?.length ? (
                        <p className="text-xs text-gray-400">Changes: {r.changes.join(', ')}</p>
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                        STATUS_STYLE[r.status].cls,
                      )}
                    >
                      {STATUS_STYLE[r.status].label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {shownRows.length > 500 && (
              <p className="p-3 text-center text-xs text-gray-400">
                Showing the first 500 of {shownRows.length.toLocaleString()}.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={() => void save()}
              disabled={busy || toSave === 0}
              className="gap-2 rounded-xl bg-orange-500 hover:bg-orange-600"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Save {toSave.toLocaleString()} product{toSave === 1 ? '' : 's'}
              {check.summary.error > 0 && ` (skip ${check.summary.error} with problems)`}
            </Button>
            <Button variant="outline" onClick={() => setStep('match')} disabled={busy} className="rounded-xl">
              Back to columns
            </Button>
          </div>
        </div>
      )}

      {/* Step 4 — saved */}
      {step === 'done' && result && (
        <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-7 w-7 text-green-500" />
            <div>
              <h3 className="font-bold text-gray-900">Saved</h3>
              <p className="text-sm text-gray-500">
                {result.saved.created.toLocaleString()} new · {result.saved.updated.toLocaleString()} updated ·{' '}
                {result.summary.same.toLocaleString()} unchanged
              </p>
            </div>
          </div>
          {result.problems.length > 0 && (
            <div className="mt-4 rounded-xl bg-red-50 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-red-700">
                <AlertTriangle size={16} /> {result.problems.length} row(s) skipped
              </p>
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-red-700">
                {result.problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          <Button onClick={reset} variant="outline" className="mt-4 gap-2 rounded-xl">
            <Upload size={16} /> Upload another file
          </Button>
        </div>
      )}
    </div>
  );
}
