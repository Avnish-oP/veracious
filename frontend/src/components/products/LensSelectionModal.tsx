
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ArrowRight, ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/form-components";
import { cn } from "@/utils/cn";

export interface PrescriptionData {
  left: {
    sphere: string;
    cylinder: string;
    axis: string;
    add?: string;
  };
  right: {
    sphere: string;
    cylinder: string;
    axis: string;
    add?: string;
  };
  pd: string; // Pupillary Distance
}

export interface LensConfig {
  type: string; // Zero Power, Single Vision, Bifocal/Progressive
  price: number;
  prescription?: PrescriptionData;
  coating?: string;
  lensPriceId?: string; // ID for backend validation
}

export interface LensPriceOption {
  id: string;
  name: string;
  price: number | string; // Handle potential string from API
  description?: string;
  title?: string;
}

interface LensSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: LensConfig) => void;
  basePrice: number;
  lensPrices?: LensPriceOption[];
}

const COATINGS = [
  { id: "anti_glare", label: "Anti-Glare", price: 0 },
  { id: "blue_cut", label: "Blue Cut (Screen Protection)", price: 500 },
  { id: "photochromic", label: "Photochromic (Light Adaptive)", price: 1000 },
];

export const LensSelectionModal: React.FC<LensSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  basePrice,
  lensPrices = [], 
}) => {
  const displayLensTypes = lensPrices.length > 0 ? lensPrices.map((lp) => ({
      id: lp.id,
      label: lp.title || lp.name,
      price: Number(lp.price),
      description: lp.description,
      requiresPrescription: Number(lp.price) > 0 
  })) : [
      {
        id: "zero_power",
        label: "Zero Power (Frame Only / Fashion)",
        price: 0,
        description: "No prescription. Best for style or if you wear contacts.",
        requiresPrescription: false,
      },
      {
        id: "single_vision",
        label: "Single Vision",
        price: 500,
        description: "For distance OR reading. Corrects one field of vision.",
        requiresPrescription: true,
      },
       {
        id: "bifocal",
        label: "Bifocal / Progressive",
        price: 1500,
        description: "Corrects near, intermediate, and far vision.",
        requiresPrescription: true,
      },
  ];



  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<typeof displayLensTypes[0] | null>(null);
  const [prescription, setPrescription] = useState<PrescriptionData>({
    left: { sphere: "0.00", cylinder: "0.00", axis: "0" },
    right: { sphere: "0.00", cylinder: "0.00", axis: "0" },
    pd: "63",
  });
  const [selectedCoating, setSelectedCoating] = useState<typeof COATINGS[0] | null>(null);

  // Generate options for dropdowns
  const generateSpheres = () => {
    const opts = [];
    for (let i = -10; i <= 10; i += 0.25) {
      opts.push(i.toFixed(2));
    }
    return opts;
  };
  const spheres = generateSpheres();

  const handleNext = () => {
    if (step === 1 && selectedType) {
      if (!selectedType.requiresPrescription) {
        // Pass lensPriceId if available
        onConfirm({ 
            type: selectedType.label, 
            price: selectedType.price,
            lensPriceId: selectedType.id.includes('-') ? selectedType.id : undefined // Assuming UUID has dashes, or just check if it's from API
        });
        onClose();
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (selectedType) { 
         const finalPrice = selectedType.price + (selectedCoating?.price || 0);
         onConfirm({
             type: selectedType.label,
             price: finalPrice,
             prescription,
             coating: selectedCoating?.label,
             lensPriceId: selectedType.id.includes('-') ? selectedType.id : undefined
         });
         onClose();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
           initial={{ scale: 0.95, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           exit={{ scale: 0.95, opacity: 0 }}
           className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
           {/* Header */}
           <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Customize Your Lenses</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
           </div>

           {/* Content */}
           <div className="flex-1 overflow-y-auto p-6">
               
               {/* Progress Indicator */}
               <div className="flex justify-center mb-8">
                  <div className="flex items-center gap-2">
                     <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors", step >= 1 ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-400")}>1</span>
                     <div className={cn("w-12 h-1 rounded-full transition-colors", step >= 2 ? "bg-amber-500" : "bg-gray-100")} />
                     <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors", step >= 2 ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-400")}>2</span>
                     <div className={cn("w-12 h-1 rounded-full transition-colors", step >= 3 ? "bg-amber-500" : "bg-gray-100")} />
                     <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors", step >= 3 ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-400")}>3</span>
                  </div>
               </div>

               {step === 1 && (
                  <div className="space-y-4">
                     <h3 className="text-lg font-bold text-gray-800 mb-4">Select Lens Type</h3>
                     {displayLensTypes.map((type) => (
                        <div 
                           key={type.id}
                           onClick={() => setSelectedType(type)}
                           className={cn(
                               "p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center group",
                               selectedType?.id === type.id ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-200 hover:bg-gray-50"
                           )}
                        >
                           <div>
                              <p className={cn("font-bold text-base", selectedType?.id === type.id ? "text-amber-700" : "text-gray-900")}>{type.label}</p>
                              <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                           </div>
                           <div className="text-right">
                              <p className="font-bold text-amber-600">{type.price === 0 ? "FREE" : `+₹${type.price}`}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               {step === 2 && (
                   <div className="space-y-6">
                       <h3 className="text-lg font-bold text-gray-800">Enter Prescription</h3>
                       
                       {/* Right Eye (OD) */}
                       <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                              Right Eye (OD)
                              <Info className="w-4 h-4 text-gray-400" />
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                              <div>
                                 <label className="text-xs font-semibold text-gray-500 uppercase">Sphere (SPH)</label>
                                 <select 
                                    className="w-full mt-1 p-2 border rounded-lg"
                                    value={prescription.right.sphere}
                                    onChange={e => setPrescription({...prescription, right: {...prescription.right, sphere: e.target.value}})}
                                 >
                                    {spheres.map(s => <option key={`r-sph-${s}`} value={s}>{s}</option>)}
                                 </select>
                              </div>
                              <div>
                                 <label className="text-xs font-semibold text-gray-500 uppercase">Cylinder (CYL)</label>
                                 <select 
                                    className="w-full mt-1 p-2 border rounded-lg"
                                    value={prescription.right.cylinder}
                                    onChange={e => setPrescription({...prescription, right: {...prescription.right, cylinder: e.target.value}})}
                                 >
                                    {spheres.map(s => <option key={`r-cyl-${s}`} value={s}>{s}</option>)}
                                 </select>
                              </div>
                              <div>
                                 <label className="text-xs font-semibold text-gray-500 uppercase">Axis</label>
                                 <input 
                                    type="number" 
                                    min="0" max="180" 
                                    className="w-full mt-1 p-2 border rounded-lg"
                                    value={prescription.right.axis}
                                    onChange={e => setPrescription({...prescription, right: {...prescription.right, axis: e.target.value}})}
                                 />
                              </div>
                          </div>
                       </div>

                       {/* Left Eye (OS) */}
                       <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                              Left Eye (OS)
                              <Info className="w-4 h-4 text-gray-400" />
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                              <div>
                                 <label className="text-xs font-semibold text-gray-500 uppercase">Sphere (SPH)</label>
                                 <select 
                                    className="w-full mt-1 p-2 border rounded-lg"
                                    value={prescription.left.sphere}
                                    onChange={e => setPrescription({...prescription, left: {...prescription.left, sphere: e.target.value}})}
                                 >
                                    {spheres.map(s => <option key={`l-sph-${s}`} value={s}>{s}</option>)}
                                 </select>
                              </div>
                              <div>
                                 <label className="text-xs font-semibold text-gray-500 uppercase">Cylinder (CYL)</label>
                                 <select 
                                    className="w-full mt-1 p-2 border rounded-lg"
                                    value={prescription.left.cylinder}
                                    onChange={e => setPrescription({...prescription, left: {...prescription.left, cylinder: e.target.value}})}
                                 >
                                    {spheres.map(s => <option key={`l-cyl-${s}`} value={s}>{s}</option>)}
                                 </select>
                              </div>
                              <div>
                                 <label className="text-xs font-semibold text-gray-500 uppercase">Axis</label>
                                 <input 
                                    type="number" 
                                    min="0" max="180" 
                                    className="w-full mt-1 p-2 border rounded-lg"
                                    value={prescription.left.axis}
                                    onChange={e => setPrescription({...prescription, left: {...prescription.left, axis: e.target.value}})}
                                 />
                              </div>
                          </div>
                       </div>

                       {/* PD */}
                       <div>
                          <label className="text-sm font-bold text-gray-700">Pupillary Distance (PD)</label>
                          <div className="flex gap-4 mt-2">
                              <input 
                                type="text"
                                className="w-full p-2 border rounded-lg max-w-[100px]"
                                value={prescription.pd}
                                onChange={e => setPrescription({...prescription, pd: e.target.value})}
                                placeholder="63"
                              />
                              <p className="text-xs text-gray-500 self-center">Standard adult PD is between 54-74mm.</p>
                          </div>
                       </div>

                   </div>
               )}

               {step === 3 && (
                 <div className="space-y-4">
                     <h3 className="text-lg font-bold text-gray-800 mb-4">Select Coating</h3>
                     {COATINGS.map(coating => (
                        <div 
                           key={coating.id}
                           onClick={() => setSelectedCoating(coating)}
                           className={cn(
                               "p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center group",
                               selectedCoating?.id === coating.id ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-200 hover:bg-gray-50"
                           )}
                        >
                           <p className={cn("font-bold text-base", selectedCoating?.id === coating.id ? "text-amber-700" : "text-gray-900")}>{coating.label}</p>
                           <div className="text-right">
                              <p className="font-bold text-amber-600">{coating.price === 0 ? "FREE" : `+₹${coating.price}`}</p>
                           </div>
                        </div>
                     ))}
                 </div>
               )}
           </div>

           {/* Footer */}
           <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              {step > 1 ? (
                 <button 
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
                 >
                   <ArrowLeft className="w-4 h-4" /> Back
                 </button>
              ) : (
                <div />
              )}
              
              <div className="flex items-center gap-4">
                 <div className="text-right mr-2">
                    <p className="text-xs text-gray-500 uppercase">Total Extra</p>
                    <p className="font-bold text-lg text-amber-600">
                        +₹{(selectedType?.price || 0) + (selectedCoating?.price || 0)}
                    </p>
                 </div>
                 <Button onClick={handleNext} disabled={!selectedType} className="bg-amber-500 hover:bg-amber-600 text-white px-6">
                    {step === 3 || (step === 1 && !selectedType?.requiresPrescription) ? "Confirm" : "Next"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
              </div>
           </div>
        </motion.div>
       </div>
    </AnimatePresence>
  );
};
