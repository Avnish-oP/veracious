"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Step3FormData, step3Schema } from "@/types/registrationTypes";
import { useUpdateProfileMutation } from "@/hooks/useRegistration";

interface Step3Props {
  userId: string;
  onSuccess: () => void;
  onSkip: () => void;
}

const faceShapeOptions = [
  { value: "ROUND", label: "Round", emoji: "🔵" },
  { value: "OVAL", label: "Oval", emoji: "🥚" },
  { value: "SQUARE", label: "Square", emoji: "⬜" },
  { value: "RECTANGLE", label: "Rectangle", emoji: "📱" },
  { value: "HEART", label: "Heart", emoji: "💝" },
  { value: "DIAMOND", label: "Diamond", emoji: "💎" },
] as const;

const styleOptions = [
  {
    id: "classic",
    label: "Classic",
    description: "Timeless styling",
    icon: "👔",
  },
  {
    id: "modern",
    label: "Modern",
    description: "Contemporary looks",
    icon: "✨",
  },
  {
    id: "bold",
    label: "Bold",
    description: "Stand out frames",
    icon: "🔥",
  },
  {
    id: "minimalist",
    label: "Minimalist",
    description: "Clean & Simple",
    icon: "⚪",
  },
];

export const Step3Form: React.FC<Step3Props> = ({
  userId,
  onSuccess,
  onSkip,
}) => {
  const updateProfileMutation = useUpdateProfileMutation();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      faceShape: undefined,
      preferredStyles: [],
    },
  });

  const selectedFaceShape = watch("faceShape");
  const selectedStyles = watch("preferredStyles");

  const handleStyleToggle = (styleId: string) => {
    const current = selectedStyles || [];
    if (current.includes(styleId)) {
      setValue(
        "preferredStyles",
        current.filter((id) => id !== styleId)
      );
    } else {
      if (current.length < 3) {
        setValue("preferredStyles", [...current, styleId]);
      }
    }
  };

  const onSubmit = async (data: Step3FormData) => {
    try {
      await updateProfileMutation.mutateAsync({
        userId: userId, // Use userId from props
        faceShape: data.faceShape || "", // Backend expects string, map undefined to empty/default if needed
        preferredStyle: data.preferredStyles || [], // Mapping preferredStyles to preferredStyle
      });
      onSuccess();
    } catch {
      // Allow proceeding even if preference update fails, logging silently
      onSuccess();
    }
  };

  const isLoading = isSubmitting || updateProfileMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Face Shape Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What is your face shape?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {faceShapeOptions.map((shape) => (
             <button
                key={shape.value}
                type="button"
                onClick={() => setValue("faceShape", shape.value)}
                className={`relative p-3 rounded-xl border text-left transition-all hover:shadow-md ${
                  selectedFaceShape === shape.value
                    ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                    : "border-gray-200 bg-white hover:border-amber-200"
                }`}
             >
                <div className="text-2xl mb-1">{shape.emoji}</div>
                <div className="text-xs font-medium text-gray-900">{shape.label}</div>
                {selectedFaceShape === shape.value && (
                  <div className="absolute top-2 right-2 text-amber-500">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
             </button>
          ))}
        </div>
      </div>

      {/* Style Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred Styles (Select up to 3)
        </label>
        <div className="grid grid-cols-2 gap-3">
            {styleOptions.map((style) => {
                const isSelected = selectedStyles?.includes(style.id);
                return (
                    <button
                        key={style.id}
                        type="button"
                        onClick={() => handleStyleToggle(style.id)}
                        className={`relative p-4 rounded-xl border text-left transition-all hover:shadow-md ${
                            isSelected
                              ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                              : "border-gray-200 bg-white hover:border-amber-200"
                        }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                             <span className="text-2xl">{style.icon}</span>
                             {isSelected && <CheckCircle className="w-5 h-5 text-amber-500" />}
                        </div>
                        <div className="font-medium text-gray-900">{style.label}</div>
                        <div className="text-xs text-gray-500">{style.description}</div>
                    </button>
                );
            })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Finish Registration"}
          {!isLoading && <ArrowRight className="w-5 h-5" />}
        </button>
        
        <button
          type="button"
          onClick={onSkip}
          className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
        >
          Skip personalization for now
        </button>
      </div>
    </form>
  );
};
