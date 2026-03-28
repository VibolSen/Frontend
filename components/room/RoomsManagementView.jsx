"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, MapPin, ExternalLink } from "lucide-react";
import { apiClient } from "@/lib/api";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function RoomsManagementView() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
  });

  const [itemToDelete, setItemToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get("/rooms");
      setRooms(data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingRoom(null);
    setFormData({ name: "" });
    setIsModalOpen(true);
  };

  const handleEditClick = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (room) => {
    setItemToDelete(room);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await apiClient.delete(`/rooms/${itemToDelete.id}`);
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      setErrorMessage("Failed to delete room. It might be used in existing schedules.");
    } finally {
      setItemToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const payload = {
        ...formData,
    };

    try {
      if (editingRoom) {
        await apiClient.put(`/rooms/${editingRoom.id}`, payload);
      } else {
        await apiClient.post("/rooms", payload);
      }
      fetchRooms();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving room:", error);
      setErrorMessage(error.response?.data?.error || "Failed to save room.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-indigo-950 tracking-tight">
            Campus Facilities
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Manage physical classrooms, labs, and auditoriums for scheduling.
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus size={14} />
          Add Facility
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-200">
            {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <MapPin size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-indigo-950 tracking-tight">{room.name}</h3>
                    </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(room)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={14} />
                    </button>
                    <button onClick={() => handleDeleteClick(room)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                    </button>
                    <Link href={`/study-office/rooms/${room.id}`} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <ExternalLink size={14} />
                    </Link>
                </div>
            </div>
            
            {/* Room stats removed for simplification */}
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                <Link 
                    href={`/study-office/rooms/${room.id}`}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                >
                    View Details
                    <ExternalLink size={12} />
                </Link>
            </div>
          </div>
        ))}
        
        {rooms.length === 0 && !isLoading && (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm italic">
                No facilities found. Create one to get started.
            </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="px-5 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
                        <h3 className="text-base font-black text-indigo-950 tracking-tight">
                            {editingRoom ? "Edit Facility" : "Add New Facility"}
                        </h3>
                    </div>
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Room Name / Number</label>
                            <input 
                                required
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="e.g. Room 304"
                            />
                        </div>
                        {/* Simplified form: Name only */}

                        <div className="flex justify-end gap-2 pt-4">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl transition-all shadow-lg shadow-indigo-100"
                            >
                                {isLoading ? "Saving..." : "Save Facility"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={!!itemToDelete}
        onCancel={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Facility"
        message={`Are you sure you want to delete "${itemToDelete?.name}"?`}
        isLoading={isLoading}
      />
    </div>
  );
}
