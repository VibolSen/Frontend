"use client";

import React, { useState } from "react";
import { X, Upload, FileType, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BulkUserImportModal({
  isOpen,
  onClose,
  onImport,
  isLoading = false,
}) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      parseCSV(selectedFile);
      setError("");
    } else {
      setError("Please select a valid CSV file.");
      setFile(null);
      setPreviewData([]);
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      
      const results = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(",").map(v => v.trim());
        const entry = {};
        headers.forEach((header, index) => {
          entry[header] = values[index];
        });
        results.push(entry);
      }
      setPreviewData(results.slice(0, 5)); // Show first 5 matches for preview
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      
      const users = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(",").map(v => v.trim());
        const user = {};
        headers.forEach((header, index) => {
          // Map CSV headers to API fields
          const fieldMap = {
            "firstname": "firstName",
            "lastname": "lastName",
            "email": "email",
            "role": "role",
            "password": "password",
            "gender": "gender"
          };
          const apiKey = fieldMap[header] || header;
          user[apiKey] = values[index];
        });
        users.push(user);
      }
      onImport(users);
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-white/20"
        >
          <div className="p-5 border-b flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Upload className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Bulk User Import</h2>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3">
              <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-700 leading-relaxed">
                <p className="font-bold mb-1">CSV Template Requirement</p>
                <p>Ensure your CSV has headers: <code className="bg-white/50 px-1 rounded">firstname, lastname, email, role, password</code>. Role must be one of: HR, TEACHER, STUDENT, STUDY_OFFICE.</p>
              </div>
            </div>

            <div 
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${file ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile && droppedFile.type === "text/csv") {
                  setFile(droppedFile);
                  parseCSV(droppedFile);
                }
              }}
            >
              {file ? (
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-emerald-100 rounded-full mb-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{file.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">Ready for processing</p>
                  <button onClick={() => {setFile(null); setPreviewData([]);}} className="text-[10px] text-rose-500 font-bold mt-4 hover:underline">Remove file</button>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-slate-100 rounded-full mb-4">
                    <FileType className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Click to browse or drag CSV file</p>
                  <p className="text-xs text-slate-400">Maximum file size: 5MB</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100">
                <AlertCircle size={16} />
                <span className="text-xs font-semibold">{error}</span>
              </div>
            )}

            {previewData.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preview (First 5 records)</h3>
                <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-3 py-2 font-bold text-slate-600">Name</th>
                        <th className="px-3 py-2 font-bold text-slate-600">Email</th>
                        <th className="px-3 py-2 font-bold text-slate-600">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-500">
                      {previewData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2">{row.firstname} {row.lastname}</td>
                          <td className="px-3 py-2">{row.email}</td>
                          <td className="px-3 py-2 text-indigo-600">{row.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 bg-slate-50 border-t flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              disabled={!file || isLoading}
              onClick={handleImport}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? "Processing..." : "Import Users"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
