"use client";

import React, { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/api";
import toast from 'react-hot-toast';
import ConfirmationDialog from "@/components/ConfirmationDialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AddResourceModal from "./AddResourceModal";
import ResourceDetailModal from "./ResourceDetailModal";
import ELibraryGrid from "./ELibraryGrid";

const ELibraryView = ({ loggedInUser }) => {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedResource, setSelectedResource] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceToDelete, setResourceToDelete] = useState(null);

  const fetchResources = async () => {
    try {
      const data = await apiClient.get("/library");
      setResources(data || []);
    } catch (e) {
      console.error("Failed to fetch resources:", e);
      setResources([]);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [loggedInUser]);

  const handleAddClick = () => {
    setEditingResource(null);
    setIsEditModalOpen(true);
  };

  const handleEditClick = (resource) => {
    setEditingResource(resource);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (resource) => {
    try {
      await toast.promise(
          apiClient.delete(`/library/${resource.id}`),
          {
            loading: 'Deleting resource...',
            success: 'Resource deleted successfully',
            error: 'Failed to delete resource',
          }
      );
      setResources(resources.filter((r) => r.id !== resource.id));
      setResourceToDelete(null);
    } catch (e) {
      console.error(e.message);
    }
  };

  const handleSaveResource = async (resourceData) => {
    if (!loggedInUser) {
      console.error("You must be logged in to save a resource.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", resourceData.title);
      formData.append("uploadedById", loggedInUser.id);
      // Removed department field

      if (resourceData.author) formData.append("author", resourceData.author);
      if (resourceData.description) formData.append("description", resourceData.description);
      if (resourceData.coverImage) formData.append("coverImage", resourceData.coverImage);
      if (resourceData.resourceFile) formData.append("resourceFile", resourceData.resourceFile); // Add PDF file to upload
      if (resourceData.publicationYear && !isNaN(resourceData.publicationYear)) {
        formData.append("publicationYear", String(resourceData.publicationYear));
      }

      const url = editingResource 
        ? `/library/${editingResource.id}` 
        : `/library`;
      
      const promise = editingResource
        ? apiClient.put(url, formData)
        : apiClient.post(url, formData);

      await toast.promise(promise, {
        loading: editingResource ? 'Updating resource...' : 'Creating resource...',
        success: editingResource ? 'Resource updated successfully!' : 'Resource added successfully!',
        error: (err) => `Failed: ${err.message}`,
      });

      fetchResources();
      setIsEditModalOpen(false);
      setEditingResource(null);
    } catch (err) {
      console.error(err.message);
      // Toast is already handled by toast.promise, but redundant safety:
      // toast.error(err.message); 
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter(
      (r) =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [resources, searchTerm]);

  const canManage = loggedInUser?.role === 'ADMIN' || loggedInUser?.role === 'STUDY_OFFICE';

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">E-Library</h1>
           <p className="text-slate-500 mt-2">Access and manage educational resources.</p>
        </div>
        
        {canManage && (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Resource
            </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-lg mx-auto md:mx-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search resources by title, author, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <ELibraryGrid
        resources={filteredResources}
        onEditClick={canManage ? handleEditClick : undefined}
        onDeleteClick={canManage ? setResourceToDelete : undefined}
        onResourceClick={setSelectedResource}
      />

      <AddResourceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaveResource={handleSaveResource}
        resourceToEdit={editingResource}
        loggedInUser={loggedInUser}
      />

      <ConfirmationDialog
        isOpen={!!resourceToDelete}
        onCancel={() => setResourceToDelete(null)}
        onConfirm={() => handleDelete(resourceToDelete)}
        title="Delete Resource"
        message={`Are you sure you want to delete "${resourceToDelete?.title}"?`}
      />

      <ResourceDetailModal
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        resource={selectedResource}
      />
    </div>
  );
};

export default ELibraryView;