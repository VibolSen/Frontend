"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Printer, Download, MapPin, Mail, Hash, Calendar, Clock, User, CreditCard, AlertCircle, QrCode, ShieldCheck, BadgeCheck } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { QRCodeCanvas } from "qrcode.react";

// Helper Component for Status Stamp
const StatusStamp = ({ status }) => {
    let colorClass, text;
    switch (status) {
      case 'PAID': colorClass = 'text-emerald-500 border-emerald-500 bg-emerald-50/10 rotate-[-12deg]'; text = 'PAID IN FULL'; break;
      case 'OVERDUE': colorClass = 'text-rose-500 border-rose-500 bg-rose-50/10 rotate-[-12deg]'; text = 'OVERDUE'; break;
      case 'SENT': colorClass = 'text-blue-500 border-blue-500 bg-blue-50/10 rotate-[-12deg]'; text = 'AWAITING PAYMENT'; break;
      case 'DRAFT': colorClass = 'text-slate-400 border-slate-300 bg-slate-50/10 rotate-[0deg] opacity-50'; text = 'DRAFT'; break;
      default: colorClass = 'text-slate-500'; text = status;
    }
  
    return (
      <div className={`absolute top-12 right-12 z-10 pointer-events-none opacity-20 transform scale-[3] md:scale-[3] border-4 border-double rounded-lg px-2 py-1 flex items-center justify-center font-black ${colorClass}`}>
         <span className="text-[10px] tracking-widest whitespace-nowrap">{text}</span>
      </div>
    );
};

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrString, setQrString] = useState("");
  const [md5Hash, setMd5Hash] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initial Data & QR Fetch
  useEffect(() => {
    if (!id) {
      setError("Invoice reference is missing.");
      setLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const data = await apiClient.get(`/financial/invoices/${id}`);
        setInvoice(data);
        
        if (data.status !== 'PAID') {
           fetchQR(data);
        }
      } catch (e) {
        console.error("Failed to fetch invoice details:", e);
        setError("Failed to secure invoice information.");
      } finally {
        setLoading(false);
      }
    };

    const fetchQR = async (invoiceData) => {
        setQrLoading(true);
        try {
            const response = await apiClient.post("/financial/bakong-qr", {
                amount: invoiceData.totalAmount,
                currency: invoiceData.currency || "USD",
                invoiceId: invoiceData.id
            });
            setQrString(response.qrString);
            setMd5Hash(response.md5);
        } catch (err) {
            console.error("Failed to fetch QR:", err);
        } finally {
            setQrLoading(false);
        }
    };

    fetchInitialData();
  }, [id]);

  // Background Polling for Auto-Verify via MD5
  useEffect(() => {
    let pollingInterval;

    if (invoice && invoice.status !== 'PAID' && md5Hash) {
        pollingInterval = setInterval(async () => {
            try {
                // Poll check status endpoint
                const statusData = await apiClient.get(`/financial/bakong-status/${id}?md5=${md5Hash}`);
                
                if (statusData.paymentConfirmed || statusData.isPaid || statusData.status === 'PAID') {
                    console.log(" ✅ Payment Confirmed by Bank API! Refreshing UI...");
                    setIsSuccess(true);
                    clearInterval(pollingInterval);
                    
                    const freshData = await apiClient.get(`/financial/invoices/${id}`);
                    setInvoice(freshData);
                    
                    setTimeout(() => {
                        setIsSuccess(false);
                    }, 3500);
                } else {
                    // Update state silently if a partial payment arrived
                    const currentData = await apiClient.get(`/financial/invoices/${id}`);
                    if (currentData.status === 'PAID' || currentData.payments.length !== invoice.payments.length) {
                        setInvoice(currentData);
                    }
                }
            } catch (err) {
                console.error("Polling check failed:", err);
            }
        }, 3000); // 3 seconds interval
    }

    return () => {
        if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [id, invoice?.status, invoice?.payments?.length, md5Hash]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" color="blue" />
        <p className="mt-4 text-slate-400 text-xs font-bold tracking-widest animate-pulse uppercase">Generating Official Document...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="inline-flex p-3 bg-rose-50 rounded-full mb-3">
          <AlertCircle className="text-rose-500 w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Document Not Found</h2>
        <p className="text-slate-500 text-xs mt-1 leading-relaxed px-4">
          Invoice reference #{id?.substring(0,8).toUpperCase()} could not be retrieved.
        </p>
        <Link 
          href="/student/invoices"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors text-xs"
        >
          <ArrowLeft className="w-3 h-3" />
          Return to History
        </Link>
      </div>
    );
  }

  const totalPaid = (invoice.payments || []).reduce((sum, payment) => {
    let normalizedAmount = payment.amount;
    if (payment.currency === "KHR" && invoice.currency === "USD") {
      normalizedAmount = normalizedAmount / 4100;
    } else if (payment.currency === "USD" && invoice.currency === "KHR") {
      normalizedAmount = normalizedAmount * 4100;
    }
    return sum + normalizedAmount;
  }, 0);
  const outstandingAmount = invoice.totalAmount - totalPaid;

  return (
    <div className="min-h-screen bg-slate-100/50 py-10 px-6 font-sans">
      <AnimatePresence>
        {isSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-[12px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -40 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="relative bg-slate-900/90 border border-slate-700/50 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] p-10 max-w-[360px] w-full text-center flex flex-col items-center overflow-hidden"
            >
              {/* Animated Background Glows */}
              <div className="absolute -top-32 -left-32 w-[350px] h-[350px] bg-emerald-500/20 rounded-full blur-[80px] opacity-70 animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute -bottom-32 -right-32 w-[350px] h-[350px] bg-blue-500/15 rounded-full blur-[80px]" />
              
              {/* Success Ring & Icon */}
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15, delay: 0.15 }}
                className="relative flex items-center justify-center w-36 h-36 mb-6"
              >
                {/* Expanding outer ring */}
                <motion.div 
                   animate={{ scale: [1, 1.4, 1.2], opacity: [0.5, 0, 0] }}
                   transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
                   className="absolute inset-0 bg-emerald-500/40 rounded-full"
                />
                
                {/* Glossy inner circle */}
                <div className="relative w-28 h-28 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_50px_-5px_rgba(52,211,153,0.6)] border-4 border-emerald-300/30 overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent w-full h-[50%] rounded-t-full" />
                   <BadgeCheck size={56} fill="white" stroke="none" className="drop-shadow-lg" />
                   <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, type: "spring" }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                   >
                      <ShieldCheck className="w-9 h-9 text-emerald-800 drop-shadow-md translate-y-[2px]" strokeWidth={2.5} />
                   </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="z-10"
              >
                <h2 className="text-3xl font-black text-white tracking-tight mb-2 drop-shadow-sm">Payment Verified!</h2>
                <p className="text-sm font-medium text-slate-300 mb-8 leading-relaxed">
                   Your transaction has been securely confirmed via the <span className="text-emerald-400 font-bold tracking-tight">Bakong Network</span>.
                </p>
                
                <div className="mx-auto flex items-center w-fit gap-3 bg-slate-950/60 pr-5 pl-2 py-2 rounded-full border border-slate-700/50 shadow-[rgba(0,0,0,0.3)_0px_3px_8px] backdrop-blur-md">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                       <div className="w-4 h-4 border-[2.5px] border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
                    </div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Updating Ledger...</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <Link 
          href="/student/invoices" 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm group"
        >
          <div className="w-5 h-5 bg-indigo-50 rounded-full flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
            <ArrowLeft className="w-3 h-3 text-indigo-600" />
          </div>
          Back to Invoices
        </Link>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-indigo-100">
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto bg-white shadow-2xl rounded-sm overflow-hidden relative"
        id="invoice-document"
      >
        <StatusStamp status={invoice.status} />

        {/* Paper Header */}
        <div className="p-12 border-b-2 border-slate-100">
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div>
              <div className="mb-6 relative w-[240px] h-[75px]">
                <Image 
                  src="/logo/STEP.png" 
                  alt="STEP Academy" 
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
              <div className="space-y-1 text-xs text-slate-500 font-medium">
                <p className="flex items-center gap-2 leading-none"><MapPin className="w-3 h-3 text-blue-900" /> 123 Education Plaza, Knowledge District</p>
                <p className="flex items-center gap-2 leading-none"><Mail className="w-3 h-3 text-blue-900" /> billing@stepacademy.edu</p>
                <p className="flex items-center gap-2 leading-none"><Hash className="w-3 h-3 text-blue-900" /> +1 (555) 900-STEP</p>
              </div>
            </div>
            <div className="text-left md:text-right flex flex-col items-start md:items-end">
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 opacity-10">INVOICE</h2>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Document Number</p>
                <p className="text-lg font-black text-slate-900 tracking-tight leading-none">INV-{invoice.id.substring(0, 8).toUpperCase()}</p>
                <div className="pt-2 flex flex-col md:items-end gap-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 leading-none">
                    <Calendar className="w-3 h-3 text-blue-900" />
                    Issue Date: {new Date(invoice.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-500 leading-none">
                    <Clock className="w-3 h-3" />
                    Due Date: {new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="px-12 py-10 grid grid-cols-1 md:grid-cols-2 gap-12 bg-slate-50/50 border-b border-slate-100">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pb-2 border-b border-slate-200">Bill To (Recipient)</h3>
            <div className="space-y-1">
              <p className="text-lg font-black text-slate-900 tracking-tight">{invoice.student.firstName} {invoice.student.lastName}</p>
              <div className="text-xs text-slate-500 font-bold space-y-1 mt-2">
                <p className="flex items-center gap-2 opacity-80"><User className="w-3 h-3 text-blue-600" /> Student ID: {invoice.student.id.substring(0, 8).toUpperCase()}</p>
                <p className="flex items-center gap-2 opacity-80"><Mail className="w-3 h-3 text-blue-600" /> {invoice.student.email}</p>
              </div>
            </div>
          </div>
          <div className="md:text-right">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pb-2 border-b border-slate-200 inline-block md:min-w-[200px]">Payment Summary</h3>
             <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between md:justify-end gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Billed:</span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    <span className="text-indigo-600 mr-2">{invoice.currency === 'USD' ? '$' : '៛'}</span>
                    {invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: invoice.currency === 'USD' ? 2 : 0 })}
                  </h2>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">TOTAL CREDITS:</span>
                  <span className="text-sm font-black text-blue-600">-{invoice.currency === "USD" ? "$" : "៛"}{totalPaid.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between md:justify-end gap-4">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Balance Due:</span>
                  <span className="text-xl font-black text-blue-900">{invoice.currency === "USD" ? "$" : "៛"}{outstandingAmount.toLocaleString()}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="px-12 py-10 border-b border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Itemized Billing Ledger</h3>
          <div className="overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900">
                  <th className="px-2 py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 w-16 italic">REF</th>
                  <th className="px-2 py-4 text-[10px] font-black uppercase tracking-widest text-slate-900">Description / Fee Category</th>
                  <th className="px-2 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-900">Amount ({invoice.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className="text-slate-700">
                    <td className="px-2 py-5 text-[10px] font-black text-slate-300">0{index + 1}</td>
                    <td className="px-2 py-5">
                      <p className="text-sm font-black text-slate-900 tracking-tight">{item.fee.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1 uppercase italic tracking-wide">{item.description || 'Academic service fee'}</p>
                    </td>
                    <td className="px-2 py-5 text-right font-black text-slate-900 text-sm">
                      {invoice.currency === "USD" ? "$" : "៛"}{item.amount.toLocaleString(undefined, { minimumFractionDigits: invoice.currency === "USD" ? 2 : 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2" className="px-2 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest pt-8">Grand Total</td>
                  <td className="px-2 py-6 text-right text-xl font-black text-blue-900 pt-8">{invoice.currency === "USD" ? "$" : "៛"}{invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: invoice.currency === "USD" ? 2 : 0 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payments Section */}
        <div className="px-12 py-10 bg-slate-50/30">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 pb-2 border-b border-slate-100">Official Payment History</h3>
          {invoice.payments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {invoice.payments.map((payment) => (
                <div key={payment.id} className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight leading-none">{payment.paymentMethod.replace('_', ' ')}</p>
                           <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-emerald-100">Verified</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(payment.paymentDate).toLocaleString()}</p>
                        
                        {/* Audit Trail Details */}
                        <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">From (Sender)</p>
                            <p className="text-[11px] font-bold text-slate-800 tracking-tight leading-none">{payment.senderName || 'N/A'}</p>
                            <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{payment.senderAccount || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Receiving Account</p>
                            <p className="text-[11px] font-bold text-slate-800 tracking-tight leading-none">Step Academy Finance</p>
                            <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{payment.receiverAccount || 'SCHOOL_ACCOUNT'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Currency & Amount</p>
                            <p className="text-[11px] font-bold text-slate-800 tracking-tight leading-none uppercase">{payment.currency || 'USD'} {payment.currency === 'USD' ? '$' : '៛'}{payment.amount.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Conversion: Verified</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
                            <p className="text-[11px] font-bold text-emerald-600 tracking-tight leading-none flex items-center gap-1">
                               <BadgeCheck size={12} />
                               Successful
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Transaction Hash</p>
                              <p className="text-[10px] text-blue-600 font-mono break-all bg-slate-50 p-2 rounded-lg border border-slate-100">{payment.transactionId || 'N/A'}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Security MD5 Signature</p>
                              <p className="text-[10px] text-slate-400 font-mono break-all bg-slate-50 p-2 rounded-lg border border-slate-100 italic">{payment.md5 || 'N/A'}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-black text-emerald-600 tabular-nums uppercase">
                        {payment.currency === 'USD' ? '$' : '៛'} {payment.amount.toLocaleString(undefined, { minimumFractionDigits: payment.currency === 'USD' ? 2 : 0 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-white border border-slate-100 rounded-xl border-dashed">
              <div className="inline-flex p-3 bg-slate-50 rounded-full mb-2">
                <CreditCard className="w-4 h-4 text-slate-300" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No recorded payments</p>
            </div>
          )}
        </div>

        {/* QR Code Section - Pay with Bakong */}
        {invoice.status !== 'PAID' && (
          <div className="px-12 py-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-5">
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/20">
                      <QrCode className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase leading-none">Instant KHQR Payment</h3>
                      <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mt-1">Verified via Bakong Network</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed uppercase tracking-wide italic">
                    Open any mobile banking app (Bakong, ABA, ACLEDA, wing, etc.) to scan this official QR code for an instant, secure tuition payment.
                  </p>
               </div>
               
               <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                     <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> End-to-End Secure</span>
                     <span className="flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5 text-blue-600" /> Bank Integrated</span>
                     <span className="text-red-700 underline decoration-red-200">No Transaction Fees</span>
                  </div>
               </div>
            </div>
            
            <div className="relative group">
              {/* Subtle animated ring around QR */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-red-600/10 to-blue-600/10 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-[180px] h-[180px] bg-white p-3 rounded-[2rem] border-2 border-slate-100 shadow-xl flex items-center justify-center relative z-10 overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-300">
                {qrLoading ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-3 border-red-600/10 border-t-red-600 rounded-full animate-spin"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Sync...</span>
                    </div>
                ) : qrString ? (
                    <div className="relative">
                      <QRCodeCanvas 
                        value={qrString} 
                        size={156}
                        level="H"
                        includeMargin={false}
                        imageSettings={{
                          src: "/Bakong/icon.png",
                          x: undefined,
                          y: undefined,
                          height: 35,
                          width: 35,
                          excavate: true,
                        }}
                      />
                    </div>
                ) : (
                    <div className="text-center space-y-2 p-4">
                      <AlertCircle className="w-6 h-6 text-slate-300 mx-auto" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight block">Connection Timeout</span>
                    </div>
                )}
              </div>
              
              {/* NBC/Bakong Compliance Badge */}
              <div className="absolute -bottom-3 -right-3 bg-white px-2 py-1 rounded-lg shadow-lg border border-slate-100 flex items-center gap-1.5 z-20">
                 <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                    <ShieldCheck className="text-white w-2.5 h-2.5" />
                 </div>
                 <span className="text-[8px] font-black uppercase tracking-tighter text-slate-600">Bakong Certified</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="bg-blue-950 p-8 text-center">
          <p className="text-[9px] text-blue-200 font-black uppercase tracking-[0.3em] mb-2">System Generated Independent Financial Record</p>
          <p className="text-[8px] text-blue-400 font-medium px-20 leading-relaxed uppercase tracking-widest">
            Please resolve any outstanding balance by the due date to maintain active status. Thank you for choosing Step Academy.
          </p>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto mt-8 flex justify-center text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
        &copy; {new Date().getFullYear()} Step Academy Finance &bull; Internal Records
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
