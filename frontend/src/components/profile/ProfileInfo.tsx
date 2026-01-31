"use client";

import React from "react";
import { User, Mail, Phone, Sparkles, Edit3 } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";

export const ProfileInfo: React.FC = () => {
  const { user } = useUserStore();
  
  if (!user) return null;

  const infoFields = [
    { 
      icon: User, 
      label: "Full Name", 
      value: user.name,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      icon: Mail, 
      label: "Email Address", 
      value: user.email,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    { 
      icon: Phone, 
      label: "Phone Number", 
      value: user.phoneNumber || "Not provided",
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    { 
      icon: Sparkles, 
      label: "Face Shape", 
      value: user.faceShape || "Not specified",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-white/80 text-sm">{user.email}</p>
              </div>
            </div>
            <button className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors">
              <Edit3 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-amber-600" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infoFields.map((field, index) => (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 ${field.bgColor} rounded-lg`}>
                  <field.icon className={`w-4 h-4 ${field.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    {field.label}
                  </p>
                  <p className="text-gray-900 font-medium truncate">
                    {field.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preferred Styles */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          Style Preferences
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {user.preferredStyles && user.preferredStyles.length > 0 ? (
            user.preferredStyles.map((style, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200 hover:shadow-sm transition-shadow"
              >
                {style}
              </motion.span>
            ))
          ) : (
            <div className="w-full p-6 bg-gray-50 rounded-xl text-center">
              <p className="text-gray-500">No style preferences set yet</p>
              <button className="mt-2 text-amber-600 font-medium text-sm hover:text-amber-700">
                + Add preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
