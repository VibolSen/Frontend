"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { apiClient } from "@/lib/api";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { motion, AnimatePresence } from "framer-motion";

export default function RoomsManagementView() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    capacity: 30,
    type: "CLASSROOM",
    resources: "", // Comma separated string for input
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
    setFormData({ name: "", capacity: 30, type: "CLASSROOM", resources: "" });
    setIsModalOpen(true);
  };

  const handleEditClick = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity,
      type: room.type,
      resources: room.resources ? room.resources.join(", ") : "",
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
        resources: formData.resources.split(",").map(s => s.trim()).filter(Boolean)
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
          <h1 className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight">
            Campus Facilities
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Manage physical classrooms, labs, and auditoriums for scheduling.
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
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
                        <h3 className="font-bold text-slate-800">{room.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{room.type}</p>
                    </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(room)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={14} />
                    </button>
                    <button onClick={() => handleDeleteClick(room)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
            
            <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Capacity</span>
                    <span className="font-bold text-slate-700">{room.capacity} Students</span>
                </div>
                {room.resources && room.resources.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {room.resources.map((res, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md border border-slate-200">
                                {res}
                            </span>
                        ))}
                    </div>
                )}
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="p-5 border-b bg-gray-50">
                        <h3 className="font-bold text-gray-800">
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
                                <select 
                                    value={formData.type}
                                    onChange={e => setFormData({...formData, type: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="CLASSROOM">Classroom</option>
                                    <option value="LAB">Computer Lab</option>
                                    <option value="AUDITORIUM">Auditorium</option>
                                    <option value="MEETING_ROOM">Meeting Room</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Capacity</label>
                                <input 
                                    type="number" 
                                    value={formData.capacity} 
                                    onChange={e => setFormData({...formData, capacity: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Resources (Comma separated)</label>
                            <input 
                                type="text" 
                                value={formData.resources} 
                                onChange={e => setFormData({...formData, resources: e.target.value})}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="e.g. Projector, Whiteboard, AC"
                            />
                        </div>

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
                                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-200"
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
