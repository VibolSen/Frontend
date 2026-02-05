import React, { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/api";
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
      await apiClient.delete(`/library/${resource.id}`);
      setResources(resources.filter((r) => r.id !== resource.id));
      setResourceToDelete(null);
      console.log("Resource deleted successfully!");
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
      formData.append("department", loggedInUser.departmentId || "");

      if (resourceData.author) formData.append("author", resourceData.author);
      if (resourceData.description) formData.append("description", resourceData.description);
      if (resourceData.coverImage) formData.append("coverImage", resourceData.coverImage);
      if (resourceData.publicationYear && !isNaN(resourceData.publicationYear)) {
        formData.append("publicationYear", String(resourceData.publicationYear));
      }

      const url = editingResource 
        ? `/library/${editingResource.id}` 
        : `/library`;
      
      if (editingResource) {
        await apiClient.put(url, formData);
      } else {
        await apiClient.post(url, formData);
      }

      fetchResources();
      setIsEditModalOpen(false);
      setEditingResource(null);
      console.log(`Resource ${editingResource ? "updated" : "added"} successfully!`);
    } catch (err) {
      console.error(err.message);
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter(
      (r) =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [resources, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">E-Library</h1>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Resource
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      <ELibraryGrid
        resources={filteredResources}
        onEditClick={handleEditClick}
        onDeleteClick={setResourceToDelete}
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