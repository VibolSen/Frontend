"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, ShieldCheck, BadgeCheck } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { apiClient } from "@/lib/api";

const KHQR_RED = "#D82C26"; // Official KHQR Red
const LOGO_URLS = {
  KHQR: "/Bakong/KHQR_Logo.png",
  BAKONG: "/Bakong/icon.png",
};

export default function BakongPaymentModal({ isOpen, invoice, onClose }) {
  const [qrString, setQrString] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [md5, setMd5] = useState("");
  const [mounted, setMounted] = useState(false);
  const [imgErrors, setImgErrors] = useState({ khqr: false, bakong: false });

  const handleImgError = (type) => {
    setImgErrors(prev => ({ ...prev, [type]: true }));
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen && invoice) {
        setCurrency(invoice.currency || "USD");
        setIsSuccess(false);
    }
  }, [isOpen, invoice]);

  useEffect(() => {
    if (isOpen && invoice) {
        generateQR();
    } else {
        setQrString("");
        setError("");
        setIsLoading(false);
        setIsSuccess(false);
    }
  }, [isOpen, invoice, currency]);

  // Polling Logic
  useEffect(() => {
    let pollInterval;
    
    if (isOpen && invoice && qrString && md5 && !isSuccess) {
      pollInterval = setInterval(async () => {
        try {
          // Poll check status endpoint using md5
          const statusData = await apiClient.get(`/financial/bakong-status/${invoice.id}?md5=${md5}`);
          
          if (statusData.paymentConfirmed || statusData.isPaid || statusData.status === 'PAID') {
            setIsSuccess(true);
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isOpen, invoice, qrString, md5, isSuccess]);

  const generateQR = async () => {
    if (!invoice) return;
    
    if (!invoice.totalAmount || isNaN(invoice.totalAmount) || invoice.totalAmount <= 0) {
        setError("Invalid invoice amount.");
        return;
    }

    setIsLoading(true);
    setError("");
    try {
        const response = await apiClient.post("/financial/bakong-qr", {
            amount: invoice.totalAmount,
            currency: currency,
            invoiceId: invoice.id
        });
        setQrString(response.qrString);
        if (response.md5) setMd5(response.md5);
    } catch (err) {
        console.error("Failed to generate QR:", err);
        const detailedError = err.response?.data?.details?.status?.message || err.response?.data?.error || "Failed to generate QR code. Please try again.";
        setError(detailedError);
    } finally {
        setIsLoading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-[340px] max-h-[95vh] overflow-hidden flex flex-col border border-slate-200"
          >
            {/* 1. Guideline Header: Red Banner + KHQR Logo */}
            <div className="bg-[#D82C26] pt-8 pb-11 px-5 relative shrink-0 flex flex-col items-center">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center gap-1">
                    {!imgErrors.khqr ? (
                      <img 
                          src={LOGO_URLS.KHQR} 
                          alt="KHQR" 
                          className="h-7 w-auto brightness-0 invert" 
                          onError={() => handleImgError('khqr')}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-white">
                        <QrCode className="w-6 h-6 border-2 border-white rounded-md p-0.5" />
                        <span className="font-black text-xl tracking-tighter italic text-center">KHQR</span>
                      </div>
                    )}
                </div>
                
                {/* Security Detail Line */}
                <div className="absolute -bottom-[0.5px] left-0 right-0 h-[1px] bg-white/20" />
            </div>

            <div className="px-6 pt-6 pb-5 flex flex-col items-center">
                {/* 2. QR Code Area / Success State */}
                <div className="relative p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm mb-3 shrink-0 overflow-hidden">
                    {isSuccess ? (
                        <div className="w-[140px] h-[140px] flex flex-col items-center justify-center gap-2">
                             <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 10 }}
                                className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-emerald-100"
                             >
                                <BadgeCheck size={36} fill="white" className="text-emerald-500" strokeWidth={2} />
                             </motion.div>
                             <p className="font-black text-[10px] uppercase tracking-widest text-emerald-600">Confirmed!</p>
                        </div>
                    ) : isLoading ? (
                        <div className="w-[140px] h-[140px] flex flex-col items-center justify-center gap-2">
                             <div className="w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Encoding...</p>
                        </div>
                    ) : error ? (
                        <div className="w-[140px] h-[140px] flex flex-col items-center justify-center text-center p-3">
                            <X className="w-8 h-8 text-red-500 mb-1" />
                            <p className="text-red-500 font-bold text-[10px]">{error}</p>
                            <button onClick={generateQR} className="mt-1 text-[9px] uppercase font-black text-slate-400 hover:text-red-500">Retry</button>
                        </div>
                    ) : (
                        qrString && (
                            <QRCodeCanvas 
                                value={qrString} 
                                size={140} // Small reduction in size
                                level={"H"}
                                includeMargin={false}
                                imageSettings={!imgErrors.bakong ? {
                                    src: LOGO_URLS.BAKONG,
                                    height: 28,
                                    width: 28,
                                    excavate: true,
                                } : undefined}
                            />
                        )
                    )}
                </div>

                {/* 3. Amount Section */}
                <div className="text-center mb-3 shrink-0">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Payment Amount</p>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-base font-black text-indigo-600">{currency === "USD" ? "$" : "៛"}</span>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">
                            {(() => {
                                const baseAmount = invoice?.totalAmount || 0;
                                const baseCurr = invoice?.currency || "USD";
                                
                                if (baseCurr === currency) return baseAmount.toLocaleString(undefined, { minimumFractionDigits: baseCurr === "USD" ? 2 : 0 });
                                
                                if (baseCurr === "USD" && currency === "KHR") {
                                    return Math.ceil(baseAmount * 4100).toLocaleString();
                                }
                                
                                if (baseCurr === "KHR" && currency === "USD") {
                                    return (baseAmount / 4100).toLocaleString(undefined, { minimumFractionDigits: 2 });
                                }
                                
                                return baseAmount.toLocaleString();
                            })()}
                        </span>
                    </div>
                </div>

                {/* 4. Merchant Info & Currency Selector */}
                <div className="w-full flex flex-col gap-3 mb-4">
                    <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 flex flex-col items-center">
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">STEP Education Center</h3>
                        <p className="text-[9px] font-bold text-slate-400 font-mono tracking-tight uppercase">
                            ID: {process.env.NEXT_PUBLIC_KHQR_ACCOUNT_ID || "SCHOOL_MERC"}
                        </p>
                    </div>

                    {isSuccess ? (
                      <button
                        onClick={() => {
                          onClose();
                          window.location.reload();
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#E1232E] text-white font-black text-[10px] uppercase tracking-widest shadow-md shadow-red-500/10 hover:bg-[#c91e27] active:scale-95 transition-all"
                      >
                        Done
                      </button>
                    ) : (
                      <div className="flex bg-slate-100/80 p-0.5 rounded-lg w-fit mx-auto border border-slate-200">
                          <button 
                              onClick={() => setCurrency("USD")}
                              className={`px-4 py-1.5 rounded-md text-[9px] font-black tracking-widest transition-all ${currency === "USD" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-400"}`}
                          >
                              USD
                          </button>
                          <button 
                              onClick={() => setCurrency("KHR")}
                              className={`px-4 py-1.5 rounded-md text-[9px] font-black tracking-widest transition-all ${currency === "KHR" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-400"}`}
                          >
                              KHR
                          </button>
                      </div>
                    )}
                </div>

                {/* 6. Bakong Footer Branding */}
                <div className="flex flex-col items-center gap-2.5 w-full shrink-0">
                    <div className="flex items-center gap-2 text-slate-400">
                        {!imgErrors.bakong ? (
                          <img 
                              src={LOGO_URLS.BAKONG} 
                              alt="Bakong" 
                              className="h-4 w-auto" 
                              onError={() => handleImgError('bakong')}
                          />
                        ) : (
                          <span className="text-[9px] font-black tracking-widest text-[#D82C26]">BAKONG</span>
                        )}
                        <div className="h-2 w-[1px] bg-slate-300" />
                        <span className="text-[8px] font-black uppercase tracking-widest underline decoration-indigo-600 decoration-2 underline-offset-4">Powered by Bakong</span>
                    </div>
                    
                    {isSuccess ? (
                         <div className="flex flex-col items-center gap-1">
                           <div className="flex items-center gap-1.5">
                             <ShieldCheck className="w-3.5 h-3.5 text-[#E1232E]" />
                             <p className="text-[10px] font-black text-[#E1232E] uppercase tracking-widest">NBC Certified · Payment Secured</p>
                           </div>
                           <p className="text-[9px] text-slate-400 font-bold">Click Done to refresh invoice status</p>
                         </div>
                    ) : (
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            Ready to scan
                        </div>
                    )}
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
