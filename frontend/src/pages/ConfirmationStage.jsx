import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, CheckCircle2, ExternalLink, FileText, Mail, Phone, MapPin, User, GraduationCap, School, Award, Calendar, RotateCcw } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

import { useUI } from '../context/UIContext';
import { useSession } from '../context/SessionContext';
import { ConfirmationIllustration } from '../components/Illustrations';

const ConfirmationStage = () => {
  const navigate = useNavigate();
  const { setIsLoading, showToast } = useUI();
  const { resetSession } = useSession();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/application/summary');
        if (response.data && response.data.success) {
          setSummary(response.data.data);
          
          // Trigger confetti burst on success
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
      } catch (error) {
        console.error('Error fetching summary:', error);
        showToast('Failed to load application summary.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [setIsLoading, showToast]);

  const handleFinish = async () => {
    // Reset backend and context session, then go back to page 1
    await resetSession();
    navigate('/register/personal');
  };

  const handleDownload = () => {
    if (!summary) return;

    const { personalInfo, educationalDetails, paymentDetails } = summary;

    const summaryText = `===================================================
          REGISTRATION SUMMARY & RECEIPT
===================================================
Application Date   : ${new Date(paymentDetails.dateTime).toLocaleString()}
Transaction ID     : ${paymentDetails.transactionId}
Payment Status     : ${paymentDetails.status}
Total Amount Paid  : ₹${paymentDetails.amount.toFixed(2)} ${paymentDetails.currency}
Payment Method     : ${paymentDetails.paymentMethod}
---------------------------------------------------
PERSONAL INFORMATION
---------------------------------------------------
Full Name          : ${personalInfo.name}
Date of Birth      : ${personalInfo.dob}
Email Address      : ${personalInfo.email}
Phone Number       : ${personalInfo.phone}
Address            : ${personalInfo.address}
Government ID File : ${personalInfo.govtIdFile.originalName}

---------------------------------------------------
EDUCATIONAL DETAILS
---------------------------------------------------
Qualification      : ${educationalDetails.qualification}
Institution        : ${educationalDetails.institution}
Course/Major       : ${educationalDetails.course}
Year of Completion : ${educationalDetails.year}
Percentage / CGPA  : ${educationalDetails.grade}
Certificate File   : ${educationalDetails.certificateFile.originalName}

===================================================
Thank you! Your registration has been submitted.
===================================================`;

    // Create file download in browser
    const element = document.createElement("a");
    const file = new Blob([summaryText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Registration_Summary_${paymentDetails.transactionId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Summary downloaded successfully!', 'success');
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!summary) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400 text-sm">Loading summary details...</p>
      </div>
    );
  }

  const { personalInfo, educationalDetails, paymentDetails } = summary;

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6 animate-fade-in">
      {/* Header & Illustration */}
      <div className="text-center">
        <ConfirmationIllustration />
        <h2 className="text-2xl font-bold text-slate-800 mt-4">Confirmation</h2>
        <p className="text-sm text-slate-400 mt-1">Your application has been submitted successfully!</p>
      </div>

      {/* Payment Success Banner */}
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-4 flex items-start gap-3">
        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="text-left">
          <h3 className="text-sm font-bold text-emerald-800">Payment Successful</h3>
          <p className="text-xs text-emerald-600 mt-0.5 leading-relaxed">
            Thank you! Your payment has been completed successfully.
          </p>
        </div>
      </div>

      {/* Summary Sections */}
      <div className="flex flex-col gap-5 text-left">
        {/* Personal Info Summary */}
        <div className="border border-slate-100 rounded-3xl p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-purple-900 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Personal Information</span>
            </h4>
            <button 
              onClick={() => navigate('/register/personal')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Full Name</span>
              <span className="font-semibold text-slate-700">{personalInfo.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Email</span>
              <span className="font-semibold text-slate-700 truncate block">{personalInfo.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Phone Number</span>
              <span className="font-semibold text-slate-700">{personalInfo.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Address</span>
              <span className="font-semibold text-slate-700 truncate block">{personalInfo.address}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block mb-1">ID Document</span>
              <a 
                href={`/api${personalInfo.govtIdFile.path}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-100 rounded-lg text-slate-600 font-medium transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[200px]">{personalInfo.govtIdFile.originalName}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Educational Info Summary */}
        <div className="border border-slate-100 rounded-3xl p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-purple-900 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>Educational Details</span>
            </h4>
            <button 
              onClick={() => navigate('/register/education')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Qualification</span>
              <span className="font-semibold text-slate-700">{educationalDetails.qualification}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Institution</span>
              <span className="font-semibold text-slate-700">{educationalDetails.institution}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Course / Major</span>
              <span className="font-semibold text-slate-700">{educationalDetails.course}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Year of Completion</span>
              <span className="font-semibold text-slate-700">{educationalDetails.year}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block mb-1">Certificate</span>
              <a 
                href={`/api${educationalDetails.certificateFile.path}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-100 rounded-lg text-slate-600 font-medium transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[200px]">{educationalDetails.certificateFile.originalName}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Payment Summary details */}
        <div className="border border-slate-100 rounded-3xl p-5 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-purple-900 flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>Payment Details</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Amount Paid</span>
              <span className="font-semibold text-slate-700">₹{paymentDetails.amount.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Payment Status</span>
              <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                {paymentDetails.status}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Transaction ID</span>
              <span className="font-mono text-slate-700 font-semibold">{paymentDetails.transactionId}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Date & Time</span>
              <span className="font-semibold text-slate-700">{formatDate(paymentDetails.dateTime)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-2">
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-semibold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-100"
        >
          <Download className="w-4 h-4" />
          <span>Download Summary</span>
        </button>
        
        <button
          type="button"
          onClick={handleFinish}
          className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-semibold shadow-lg shadow-purple-100 flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-100"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Finish</span>
        </button>
      </div>
    </div>
  );
};

export default ConfirmationStage;
