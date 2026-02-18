'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const AddResourceModal = ({ 
  isOpen, 
    onClose,
    onSaveResource,
    resourceToEdit,
    loggedInUser,
  }) => {  const isEditMode = !!resourceToEdit;

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    coverImage: null,
    publicationYear: new Date().getFullYear(),
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (resourceToEdit) {
      setFormData({
        title: resourceToEdit.title || '',
        author: resourceToEdit.author || '',
        coverImage: null, // Reset file input on edit, keep existing URL effectively
        publicationYear: resourceToEdit.publicationYear || new Date().getFullYear(),
        description: resourceToEdit.description || '',
      });
      setPreviewUrl(resourceToEdit.coverImage);
    } else {
      setFormData({
        title: '',
        author: '',
        coverImage: null,
        publicationYear: new Date().getFullYear(),
        description: '',
      });
      setPreviewUrl(null);
    }

    setErrors({});
  }, [isOpen, resourceToEdit, loggedInUser]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'coverImage' && files?.[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, coverImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      
    } else if (name === 'resourceFile' && files?.[0]) {
      setFormData(prev => ({ ...prev, resourceFile: files[0] }));
    } else if (name === 'publicationYear') {
      const year = parseInt(value, 10);
      setFormData(prev => ({ ...prev, publicationYear: isNaN(year) ? prev.publicationYear : year }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required.';
    if (!formData.author.trim()) newErrors.author = 'Author is required.';
    if (!formData.coverImage && !isEditMode && !previewUrl) newErrors.coverImage = 'Cover image is required.';
    if (!formData.publicationYear || isNaN(Number(formData.publicationYear))) {
      newErrors.publicationYear = 'Publication year must be a valid number.';
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const resourceData = {
      ...formData,
      title: formData.title.trim(),
      author: formData.author.trim(),
      description: formData.description.trim(),
    };

    onSaveResource(resourceData);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
          <h2 className="text-xl font-bold text-slate-800">
            {isEditMode ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Cover Image Upload Area */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Image</label>
              <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors ${errors.coverImage ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}`}>
                <div className="space-y-1 text-center relative">
                   {previewUrl ? (
                      <div className="relative group">
                          <img 
                            src={previewUrl} 
                            alt="Cover Preview" 
                            className="mx-auto h-48 object-cover rounded-lg shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                              <span className="text-white text-sm font-medium">Click to change</span>
                          </div>
                      </div>
                   ) : (
                      <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                   )}
                  
                  <div className={`flex text-sm text-slate-600 justify-center ${previewUrl ? 'opacity-0 absolute inset-0 cursor-pointer' : ''}`}>
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="coverImage" type="file" accept="image/*" className="sr-only" onChange={handleChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  {!previewUrl && <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>}
                </div>
              </div>
              {errors.coverImage && <p className="text-xs text-red-500 mt-1 font-medium">{errors.coverImage}</p>}
            </div>

            {/* Resource File (PDF) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Resource File (PDF)</label>
              <input
                type="file"
                name="resourceFile"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
                className={`block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  ${errors.resourceFile ? 'ring-1 ring-red-500 rounded-md' : ''}
                `}
              />
               {formData.resourceFile && (
                <p className="text-xs text-slate-600 mt-1">Selected: {formData.resourceFile.name}</p>
              )}
               {errors.resourceFile && <p className="text-xs text-red-500 mt-1">{errors.resourceFile}</p>}
            </div>

            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Advanced Calculus"
                className={`w-full px-4 py-2 border rounded-xl text-sm transition-all focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none shadow-sm ${errors.title ? 'border-red-300 ring-red-200' : 'border-slate-200'}`}
                required
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Author</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Author Name"
                className={`w-full px-4 py-2 border rounded-xl text-sm transition-all focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none shadow-sm ${errors.author ? 'border-red-300 ring-red-200' : 'border-slate-200'}`}
                required
              />
              {errors.author && <p className="text-xs text-red-500 mt-1">{errors.author}</p>}
            </div>

            {/* Publication Year */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Publication Year</label>
              <input
                type="number"
                name="publicationYear"
                value={formData.publicationYear}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
                className={`w-full px-4 py-2 border rounded-xl text-sm transition-all focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none shadow-sm ${errors.publicationYear ? 'border-red-300 ring-red-200' : 'border-slate-200'}`}
                required
              />
              {errors.publicationYear && <p className="text-xs text-red-500 mt-1">{errors.publicationYear}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Brief summary of the resource..."
                className={`w-full px-4 py-3 border rounded-xl text-sm transition-all focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none shadow-sm resize-none ${errors.description ? 'border-red-300 ring-red-200' : 'border-slate-200'}`}
                required
              ></textarea>
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex justify-end items-center gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-slate-900 border border-transparent rounded-xl text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              {isEditMode ? 'Save Changes' : 'Create Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddResourceModal;
