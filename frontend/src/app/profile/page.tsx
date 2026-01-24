"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Package, MapPin, LogOut } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { OrderHistory } from "@/components/profile/OrderHistory";
import { AddressBook } from "@/components/profile/AddressBook";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: loading, logout } = useUser();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null; // Or a loading spinner
  }

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "orders", label: "Order History", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
  ];

  const handleLogout = async () => {
     await logout();
     router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
             <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <div className="text-center mb-8 pb-8 border-b border-gray-100">
                   <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                   </div>
                   <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                   <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                <nav className="space-y-2">
                   {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                          activeTab === tab.id
                            ? "bg-amber-50 text-amber-700 shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                         <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-amber-600" : "text-gray-400"}`} />
                         {tab.label}
                      </button>
                   ))}
                   
                   <button
                     onClick={handleLogout}
                     className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-red-600 hover:bg-red-50 mt-4"
                   >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                   </button>
                </nav>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                 {activeTab === "profile" && <ProfileInfo />}
                 {activeTab === "orders" && <OrderHistory />}
                 {activeTab === "addresses" && <AddressBook />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
