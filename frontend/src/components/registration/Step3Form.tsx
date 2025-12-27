"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Glasses,
  CheckCircle,
  SkipForward,
  Sparkles,
  Eye,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Step3FormData, step3Schema } from "@/types/registrationTypes";
import { useUpdateProfileMutation } from "@/hooks/useRegistration";
import { Button, Card, Select } from "@/components/ui/form-components";

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
  { value: "TRIANGLE", label: "Triangle", emoji: "🔺" },
  { value: "OBLONG", label: "Oblong", emoji: "🏈" },
];

const styleOptions = [
  {
    id: "classic",
    label: "Classic",
    description: "Timeless and traditional styles",
    icon: "👔",
    gradient: "from-slate-400 to-slate-600",
  },
  {
    id: "modern",
    label: "Modern",
    description: "Contemporary and trendy designs",
    icon: "⚡",
    gradient: "from-blue-400 to-purple-600",
  },
  {
    id: "vintage",
    label: "Vintage",
    description: "Retro and nostalgic styles",
    icon: "📻",
    gradient: "from-amber-400 to-orange-600",
  },
  {
    id: "minimalist",
    label: "Minimalist",
    description: "Clean and simple designs",
    icon: "🔸",
    gradient: "from-gray-400 to-slate-500",
  },
  {
    id: "bold",
    label: "Bold",
    description: "Statement-making and dramatic",
    icon: "🔥",
    gradient: "from-red-400 to-pink-600",
  },
  {
    id: "sophisticated",
    label: "Sophisticated",
    description: "Elegant and refined",
    icon: "👑",
    gradient: "from-purple-400 to-indigo-600",
  },
  {
    id: "casual",
    label: "Casual",
    description: "Relaxed and everyday wear",
    icon: "🏖️",
    gradient: "from-green-400 to-blue-500",
  },
  {
    id: "sporty",
    label: "Sporty",
    description: "Active and athletic styles",
    icon: "🏃‍♂️",
    gradient: "from-orange-400 to-red-500",
  },
];

export const Step3Form: React.FC<Step3Props> = ({
  userId,
  onSuccess,
  onSkip,
}) => {
  const [selectedStyles, setSelectedStyles] = React.useState<string[]>([]);

  const updateProfileMutation = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    mode: "onBlur",
  });

  const faceShape = watch("faceShape");

  const handleStyleToggle = (styleId: string) => {
    setSelectedStyles((prev) => {
      if (prev.includes(styleId)) {
        return prev.filter((id) => id !== styleId);
      } else {
        return [...prev, styleId];
      }
    });
  };

  const onSubmit = async (data: Step3FormData) => {
    try {
      await updateProfileMutation.mutateAsync({
        userId,
        faceShape: data.faceShape || "",
        preferredStyle: selectedStyles,
      });
      onSuccess();
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <div className="relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-3xl opacity-60" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Card
        variant="glass"
        className="relative z-10 w-full max-w-lg mx-auto border-amber-200/30"
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <Eye className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Perfect Your Style
          </h1>
          <p className="text-slate-600">
            Help us recommend the perfect eyewear that matches your unique style
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Face Shape Selection */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                <Glasses className="w-4 h-4 text-white" />
              </div>
              <label className="text-lg font-semibold text-slate-800">
                What&apos;s your face shape?
              </label>
            </div>
            <Select
              {...register("faceShape")}
              options={faceShapeOptions.map((shape) => ({
                value: shape.value,
                label: `${shape.emoji} ${shape.label}`,
              }))}
              placeholder="Select your face shape"
              error={errors.faceShape?.message}
              className="transition-all duration-300 hover:border-amber-300"
            />
            <motion.p
              className="text-sm text-slate-500 mt-2 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Heart className="w-4 h-4 mr-1 text-amber-500" />
              This helps us recommend frames that complement your features
            </motion.p>
          </motion.div>

          {/* Style Preferences */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <label className="text-lg font-semibold text-slate-800">
                What styles speak to you?
              </label>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Select all that match your personality
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {styleOptions.map((style, index) => (
                <motion.div
                  key={style.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className={`relative overflow-hidden p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedStyles.includes(style.id)
                      ? "border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg"
                      : "border-slate-200 hover:border-amber-300 bg-white/50 backdrop-blur-sm hover:shadow-md"
                  }`}
                  onClick={() => handleStyleToggle(style.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${style.gradient} flex items-center justify-center text-white text-lg mr-4 shadow-md`}
                      >
                        {style.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-slate-800 flex items-center">
                          {style.label}
                          <AnimatePresence>
                            {selectedStyles.includes(style.id) && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="ml-2"
                              >
                                <CheckCircle className="w-5 h-5 text-amber-600" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {style.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Selection glow effect */}
                  {selectedStyles.includes(style.id) && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-orange-200/20 rounded-2xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {selectedStyles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl"
                >
                  <p className="text-sm text-amber-700 font-medium text-center">
                    ✨ {selectedStyles.length} style
                    {selectedStyles.length !== 1 ? "s" : ""} selected - Perfect
                    for personalized recommendations!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full relative overflow-hidden group"
              loading={isSubmitting || updateProfileMutation.isPending}
              disabled={isSubmitting || updateProfileMutation.isPending}
            >
              <span className="relative z-10">Complete Your Profile</span>
            </Button>

            <motion.button
              type="button"
              onClick={handleSkip}
              className="w-full flex items-center justify-center py-3 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors rounded-xl hover:bg-slate-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip for now - I&apos;ll set this up later
            </motion.button>
          </motion.div>
        </form>

        {/* Benefits section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/30 rounded-2xl backdrop-blur-sm"
        >
          <h4 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
            Why personalize your experience?
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
              <span>Personalized style recommendations</span>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
              <span>Face shape-matched frames</span>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
              <span>Curated collections</span>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
              <span>Filtered browsing experience</span>
            </div>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-20" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-red-400 to-pink-500 rounded-full opacity-20" />
      </Card>
    </div>
  );
};
