"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
  const [showSimModal, setShowSimModal] = useState(false);
  const [simName, setSimName] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSuccess, setSimSuccess] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Invoice reference is missing.");
      setLoading(false);
      return;
    }

    const fetchInvoiceDetails = async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      try {
        const data = await apiClient.get(`/financial/invoices/${id}`);
        
        // Check if status changed from unpaid to PAID
        if (invoice?.status !== 'PAID' && data.status === 'PAID') {
           console.log("🚀 Status changed to PAID! Updating UI...");
           setInvoice(data);
           setLoading(false);
           return;
        }

        setInvoice(data);
        
        // If not paid, generate QR
        if (data.status !== 'PAID' && !qrString && !isSilent) {
           fetchQR(data);
        } else if (data.status !== 'PAID' && isSilent && md5Hash) {
            // Check real Bakong status using MD5 during silent polling
            const statusData = await apiClient.get(`/financial/bakong-status/${id}?md5=${md5Hash}`);
            if (statusData.isPaid) {
               console.log(" ✅ Payment Confirmed by Bank API! Refreshing data...");
               const freshData = await apiClient.get(`/financial/invoices/${id}`);
               setInvoice(freshData);
            }
        }
      } catch (e) {
        console.error("Failed to fetch invoice details:", e);
        if (!isSilent) setError("Failed to secure invoice information.");
      } finally {
        if (!isSilent) setLoading(false);
      }
    };

    const fetchQR = async (invoiceData) => {
        setQrLoading(true);
        try {
            const response = await apiClient.post("/financial/bakong-qr", {
                amount: invoiceData.totalAmount,
                currency: "USD",
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

    fetchInvoiceDetails();

    // Start Polling for Payment Status if not paid
    let pollingInterval;
    if (invoice?.status !== 'PAID') {
        pollingInterval = setInterval(() => {
            fetchInvoiceDetails(true); // Silent update
        }, 3000);
    }

    return () => {
        if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [id, invoice?.status, md5Hash]);

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

  const totalPaid = invoice.payments ? invoice.payments.reduce((sum, payment) => sum + payment.amount, 0) : 0;
  const outstandingAmount = invoice.totalAmount - totalPaid;

  return (
    <div className="min-h-screen bg-slate-100/50 py-10 px-6 font-sans">
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <Link 
          href="/student/invoices" 
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-900 transition-colors bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all font-bold text-xs shadow-sm">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-all font-bold text-xs shadow-sm">
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
                  <span className="text-sm font-black text-slate-900">${invoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">TOTAL CREDITS:</span>
                  <span className="text-sm font-black text-blue-600">-${totalPaid.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between md:justify-end gap-4">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Balance Due:</span>
                  <span className="text-xl font-black text-blue-900">${outstandingAmount.toLocaleString()}</span>
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
                  <th className="px-2 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-900">Amount (USD)</th>
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
                      ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2" className="px-2 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest pt-8">Grand Total</td>
                  <td className="px-2 py-6 text-right text-xl font-black text-blue-900 pt-8">${invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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
                            <p className="text-[11px] font-bold text-slate-800 tracking-tight leading-none uppercase">{payment.currency || 'USD'} ${payment.amount.toFixed(2)}</p>
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
                      <p className="text-lg font-black text-blue-600 leading-none">+${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
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
                  
                  <button 
                    onClick={() => {
                      setSimName(`${invoice.student.firstName} ${invoice.student.lastName}`.toUpperCase());
                      setShowSimModal(true);
                      setSimSuccess(false);
                    }}
                    className="w-fit px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.15em] hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10 group"
                  >
                     <CreditCard size={12} className="group-hover:rotate-12 transition-transform" />
                     Pro-Demo Sandbox
                  </button>
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

      {/* Premium Simulation Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => !isSimulating && setShowSimModal(false)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="bg-slate-950 p-6 text-center relative">
               <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg shadow-blue-500/30">
                  <CreditCard className="text-white w-6 h-6" />
               </div>
               <h3 className="text-white text-sm font-black uppercase tracking-widest">Demo Sandbox</h3>
               <p className="text-blue-400 text-[9px] font-bold uppercase tracking-widest mt-1 opacity-60">Payment Simulation Engine</p>
            </div>

            <div className="p-8 space-y-6">
               {!simSuccess ? (
                 <>
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Payer Identity (Simulation)</label>
                        <input 
                          type="text" 
                          value={simName}
                          onChange={(e) => setSimName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          placeholder="e.g. VIBOL SEN"
                        />
                      </div>
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-black text-blue-400 uppercase">Amount</span>
                            <span className="text-xs font-black text-blue-700">${invoice.totalAmount.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-blue-400 uppercase">Status</span>
                            <span className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-1 animate-pulse"><Clock size={10} /> Pending Confirmation</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-2 pt-2">
                     <button 
                        onClick={() => setShowSimModal(false)}
                        disabled={isSimulating}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all font-mono"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={async () => {
                          setIsSimulating(true);
                          try {
                            await apiClient.post("/financial/bakong-callback", {
                              invoiceId: invoice.id,
                              amount: invoice.totalAmount,
                              currency: "USD",
                              md5: `sim_${Date.now()}`,
                              transactionId: `SIM-${Date.now()}`,
                              senderName: simName.toUpperCase() || "DEMO_USER",
                              senderAccount: "003 128 656",
                              receiverAccount: "vibol_sen@bkrt"
                            });
                            setSimSuccess(true);
                            setTimeout(() => setShowSimModal(false), 2000);
                          } catch (e) { console.error(e); }
                          finally { setIsSimulating(false); }
                        }}
                        disabled={isSimulating}
                        className="flex-[2] bg-blue-600 text-white rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                     >
                        {isSimulating ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <ShieldCheck size={14} />}
                        Confirm Simulation
                     </button>
                   </div>
                 </>
               ) : (
                 <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                       <BadgeCheck className="text-white w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-slate-900 font-black uppercase text-sm tracking-tight">Signal Verified</h4>
                      <p className="text-slate-400 text-[9px] font-bold tracking-widest uppercase">Invoice UI will update instantly</p>
                    </div>
                 </motion.div>
               )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetailPage;
