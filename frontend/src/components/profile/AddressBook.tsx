"use client";

import React, { useState } from "react";
import { MapPin, Plus, Trash2, Loader2, Home, Building2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAddressesQuery,
  useAddAddressMutation,
  useDeleteAddressMutation,
} from "@/hooks/useProfile";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export const AddressBook: React.FC = () => {
  const { data, isLoading: loading } = useAddressesQuery();
  const addresses = (data as Address[]) || [];
  const addAddressMutation = useAddAddressMutation();
  const deleteAddressMutation = useDeleteAddressMutation();
  
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });

  const handleDelete = async (id: string) => {
    deleteAddressMutation.mutate(id);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAddressMutation.mutateAsync(newAddress);
      setShowAddForm(false);
      setNewAddress({ street: "", city: "", state: "", zipCode: "", country: "India" });
    } catch {
      // Error handled in hook
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-lg">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600 mb-4" />
        <p className="text-gray-500">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-600" />
          Saved Addresses
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      {/* Add Address Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-lg overflow-hidden"
            onSubmit={handleAddSubmit}
          >
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-4 h-4 text-amber-600" />
              New Address
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="123 Main Street, Apt 4B"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={newAddress.street}
                  onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Mumbai"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={newAddress.city}
                  onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                  State
                </label>
                <input
                  type="text"
                  placeholder="Maharashtra"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={newAddress.state}
                  onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                  PIN Code
                </label>
                <input
                  type="text"
                  placeholder="400001"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={newAddress.zipCode}
                  onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="India"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={newAddress.country}
                  onChange={e => setNewAddress({...newAddress, country: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addAddressMutation.isPending}
                className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-medium shadow-md transition-colors flex items-center gap-2"
              >
                {addAddressMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Address
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Address Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {addresses.map((address: Address, index: number) => (
            <motion.div
              key={address.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, height: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md hover:shadow-lg hover:border-amber-200 transition-all group relative"
            >
              {address.isDefault && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  Default
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <Building2 className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium">{address.street}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {address.city}, {address.state}
                  </p>
                  <p className="text-sm text-gray-500">
                    {address.zipCode}, {address.country}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => handleDelete(address.id)}
                  disabled={deleteAddressMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                >
                  {deleteAddressMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {addresses.length === 0 && !showAddForm && (
          <div className="col-span-1 md:col-span-2 text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-2">No addresses saved yet</p>
            <p className="text-sm text-gray-500 mb-4">Add your first delivery address</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-amber-600 font-medium hover:text-amber-700"
            >
              + Add Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
