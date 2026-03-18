import React, { useState } from "react";
import Link from "next/link";
import { FiEye, FiCalendar, FiDollarSign } from "react-icons/fi";
import { QrCode } from "lucide-react"; // Or react-icons equivalent
import BakongPaymentModal from "@/components/finance/BakongPaymentModal";

const StudentInvoicesList = ({ invoices }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const handlePayClick = (invoice) => {
    setSelectedInvoice(invoice);
    setIsPayModalOpen(true);
  };

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 text-lg">No invoices found.</p>
        <p className="text-gray-500 text-md">Check back later or contact support if you believe this is an error.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                  <div className="flex items-center">
                    <span className="text-indigo-600 mr-1.5 font-black">{invoice.currency === 'USD' ? '$' : '៛'}</span>
                    {invoice.totalAmount ? invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: invoice.currency === 'USD' ? 2 : 0 }) : "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <FiCalendar className="text-blue-500 mr-1" />
                    {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.payments && invoice.payments.length > 0 ? (
                    <div className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                      {new Date(Math.max(...invoice.payments.map(p => new Date(p.paymentDate)))).toLocaleDateString()}
                    </div>
                  ) : (
                    <span className="text-gray-400 font-medium italic">--</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.status === "PAID"
                        ? "bg-green-100 text-green-800"
                        : invoice.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-3">
                  <Link
                    href={`/student/invoices/${invoice.id}`}
                    prefetch={false}
                    className="text-blue-600 hover:text-blue-900 flex items-center"
                  >
                    <FiEye className="mr-1" /> View
                  </Link>
                  {invoice.status !== "PAID" && (
                    <button
                      onClick={() => handlePayClick(invoice)}
                      className="px-4 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-100/50 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group shadow-sm active:scale-95"
                    >
                      <QrCode className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" /> 
                      Pay Now
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BakongPaymentModal
        isOpen={isPayModalOpen}
        invoice={selectedInvoice}
        onClose={() => setIsPayModalOpen(false)}
      />
    </>
  );
};

export default StudentInvoicesList;
