"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Plus, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
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
  const { data: addresses = [], isLoading: loading } = useAddressesQuery();
  const addAddressMutation = useAddAddressMutation();
  const deleteAddressMutation = useDeleteAddressMutation();
  
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
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
    } catch (error) {
      // Error handled in hook
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Saved Addresses</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 rounded-xl p-6 border border-amber-200 overflow-hidden"
            onSubmit={handleAddSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Street Address"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none"
                  value={newAddress.street}
                  onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="City"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none"
                  value={newAddress.city}
                  onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                  required
                />
              </div>
               <div>
                <input
                  type="text"
                  placeholder="State"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none"
                  value={newAddress.state}
                  onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                  required
                />
              </div>
               <div>
                <input
                  type="text"
                  placeholder="Zip Code"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none"
                  value={newAddress.zipCode}
                  onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})}
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Country"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none"
                  value={newAddress.country}
                  onChange={e => setNewAddress({...newAddress, country: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Address
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address: Address) => (
          <motion.div
            key={address.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative group hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{address.street}</p>
                <p className="text-gray-600">{address.city}, {address.state}</p>
                 <p className="text-gray-600">{address.zipCode}, {address.country}</p>
              </div>
              <button
                onClick={() => handleDelete(address.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        
        {addresses.length === 0 && !showAddForm && (
           <div className="col-span-1 md:col-span-2 text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
             No addresses saved yet.
           </div>
        )}
      </div>
    </div>
  );
};
