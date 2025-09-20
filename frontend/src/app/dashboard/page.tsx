"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/form-components";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Veracious</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome back!</span>
              <button className="text-blue-600 hover:text-blue-500">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to your personalized eyewear experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🎯 Personalized Recommendations
            </h3>
            <p className="text-gray-600 mb-4">
              Discover frames perfectly suited to your face shape and style
              preferences.
            </p>
            <button className="text-blue-600 hover:text-blue-500 font-medium">
              View Recommendations →
            </button>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              👤 Profile Settings
            </h3>
            <p className="text-gray-600 mb-4">
              Update your preferences, face shape, and style choices.
            </p>
            <button className="text-blue-600 hover:text-blue-500 font-medium">
              Manage Profile →
            </button>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🛍️ Browse Collection
            </h3>
            <p className="text-gray-600 mb-4">
              Explore our curated collection of premium eyewear.
            </p>
            <button className="text-blue-600 hover:text-blue-500 font-medium">
              Browse Frames →
            </button>
          </Card>
        </div>

        {/* Success Message */}
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            🎉 Registration Complete!
          </h3>
          <p className="text-green-700">
            Your account has been successfully created and verified. You can now
            explore personalized recommendations and browse our premium eyewear
            collection.
          </p>
        </div>
      </main>
    </div>
  );
}
