"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, UploadCloud } from "lucide-react";

type ImportResult = { job?: { id: string; fileName: string; status: string; detectedRows: number; preview: string[][] }; error?: string };

export function ImportPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [uploading, setUploading] = useState(false);

  async function upload() {
    if (!file) return;
    setUploading(true);
    setResult(null);
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/imports", { method: "POST", body });
    const data = await response.json().catch(() => ({ error: "The upload could not be processed." }));
    setUploading(false);
    setResult(data);
  }

  return (
    <section className="form-card">
      <div className="form-card-heading">
        <span className="feature-icon"><UploadCloud size={21} /></span>
        <div><h2>Import resources</h2><p>Upload a CSV, Excel workbook or PDF. Nothing is published until an admin approves the extracted records.</p></div>
      </div>
      <label className="drop-zone">
        <input type="file" accept=".csv,.xlsx,.xls,.pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <span className="drop-icon">{file?.name.endsWith(".pdf") ? <FileText size={27} /> : <FileSpreadsheet size={27} />}</span>
        <strong>{file ? file.name : "Choose a directory file"}</strong>
        <small>CSV, XLSX, XLS or PDF · up to 10 MB</small>
      </label>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-[var(--muted-foreground)]">CSV files receive an immediate row preview. Excel and PDF uploads enter the extraction review queue.</p>
        <button type="button" onClick={upload} disabled={!file || uploading} className="primary-button">{uploading ? "Uploading…" : "Upload for review"}</button>
      </div>
      {result?.error && <p className="form-status error">{result.error}</p>}
      {result?.job && (
        <div className="import-result">
          <strong>Import queued</strong>
          <p>{result.job.detectedRows ? `${result.job.detectedRows} rows detected.` : "The file is ready for structured extraction."} Status: {result.job.status.replaceAll("_", " ")}.</p>
          {result.job.preview?.length > 0 && (
            <div className="overflow-x-auto"><table><tbody>{result.job.preview.slice(0, 4).map((row, index) => <tr key={index}>{row.slice(0, 5).map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>
          )}
        </div>
      )}
    </section>
  );
}
