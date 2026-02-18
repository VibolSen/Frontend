// components/e-library/ResourceDetailModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ResourceDetailModal = ({ isOpen, onClose, resource }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !resource || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-full overflow-y-auto animate-fade-in-scale">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{resource.title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">✕</button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img src={resource.coverImage} alt={resource.title} className="w-full h-auto rounded-lg shadow-md" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700">Author: {resource.author}</h3>
              <p className="text-sm text-slate-600">Publication Year: {resource.publicationYear}</p>
              <p className="mt-4 text-slate-700">{resource.description}</p>
              
              {resource.fileUrl && (
                <div className="mt-6">
                  <a 
                    href={resource.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    Read Resource
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t rounded-b-xl flex justify-end items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ResourceDetailModal;