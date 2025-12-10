"use client";

import React, { useState } from "react";
import { User } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";

export const ProfileInfo: React.FC = () => {
  const { user } = useUserStore();
  
  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Full Name
          </label>
          <p className="text-lg font-medium text-gray-900">{user.name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Email Address
          </label>
          <p className="text-lg font-medium text-gray-900">{user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Phone Number
          </label>
          <p className="text-lg font-medium text-gray-900">
            {user.phoneNumber || "Not provided"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Face Shape
          </label>
          <p className="text-lg font-medium text-gray-900">
            {user.faceShape || "Not specified"}
          </p>
        </div>

         <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Preferred Styles
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {user.preferredStyles && user.preferredStyles.length > 0 ? (
               user.preferredStyles.map((style, index) => (
                <span key={index} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                  {style}
                </span>
               ))
            ) : (
              <p className="text-gray-900">Not selected</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
