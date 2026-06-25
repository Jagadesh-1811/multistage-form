import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, QrCode, Smartphone, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';

import { useUI } from '../context/UIContext';
import { useSession } from '../context/SessionContext';
import { PaymentIllustration } from '../components/Illustrations';

// Styled Indian UPI Logo
const UpiLogo = () => (
  <span className="text-[10px] font-black tracking-tight text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg select-none">UPI</span>
);

const PaymentStage = () => {
  const navigate = useNavigate();
  const { setIsLoading, showToast } = useUI();
  const { setSession } = useSession();
  
  // Available sub-methods: 'gpay' (Google Pay), 'upi_qr' (QR Code Scan), 'upi_id' (UPI VPA Input)
  const [paymentMethod, setPaymentMethod] = useState('gpay');
  const [upiId, setUpiId] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);

  const handlePayment = async () => {
    try {
      setLoadingLocal(true);
      setIsLoading(true);
      
      // Step 1: Initiate payment request on backend
      const createResponse = await axios.post('/api/payment/create');
      
      if (createResponse.data && createResponse.data.success) {
        // Simulate minor processing lag for premium feel
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Map UI payment method key to human-readable label
        const methodLabels = {
          gpay: 'Google Pay (UPI)',
          upi_qr: 'UPI QR Code Scan',
          upi_id: `UPI VPA (${upiId})`
        };

        // Step 2: Confirm successful payment with backend
        const successResponse = await axios.post('/api/payment/success', {
          paymentMethod: methodLabels[paymentMethod],
          upiId: paymentMethod === 'upi_id' ? upiId : undefined
        });

        if (successResponse.data && successResponse.data.success) {
          // Sync current session directly with the returned form progress state
          setSession(successResponse.data.data);
          
          showToast('Payment successful!', 'success');
          navigate('/register/confirmation');
        }
      }
    } catch (error) {
      console.error('Error during payment flow:', error);
      const errMsg = error.response?.data?.message || 'Payment simulation failed. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setLoadingLocal(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6 animate-fade-in">
      {/* Header & Illustration */}
      <div className="text-center">
        <PaymentIllustration />
        <h2 className="text-2xl font-bold text-slate-800 mt-4">Payment Stage</h2>
        <p className="text-sm text-slate-400 mt-1">Select your preferred UPI method to pay</p>
      </div>

      {/* Application Fee Summary (INR / ₹) */}
      <div className="bg-purple-50/40 border border-purple-100 rounded-3xl p-5 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-purple-900 text-left">Application Summary</h3>
        
        <div className="flex flex-col gap-2 text-sm text-slate-600">
          <div className="flex justify-between items-center">
            <span>Application Fee</span>
            <span className="font-semibold text-slate-800">₹100.00</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Processing Fee</span>
            <span className="font-semibold text-slate-800">₹10.00</span>
          </div>
        </div>

        {/* Dashed Line separator */}
        <div className="border-t border-dashed border-purple-200 my-1"></div>

        <div className="flex justify-between items-center text-base font-bold text-purple-900">
          <span>Total Amount</span>
          <span className="text-lg">₹110.00</span>
        </div>
      </div>

      {/* Choose Payment Method */}
      <div className="flex flex-col gap-3 text-left">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
          Choose UPI Option
        </h4>

        <div className="flex flex-col gap-2.5">
          {/* Google Pay option */}
          <div 
            onClick={() => setPaymentMethod('gpay')}
            className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 ${
              paymentMethod === 'gpay' 
                ? 'border-purple-600 bg-purple-50/20' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                paymentMethod === 'gpay' ? 'border-purple-600' : 'border-slate-300'
              }`}>
                {paymentMethod === 'gpay' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>}
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className={`w-4 h-4 ${paymentMethod === 'gpay' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className="text-sm font-semibold text-slate-700">Google Pay (GPay)</span>
              </div>
            </div>
            <UpiLogo />
          </div>

          {/* UPI QR Code option */}
          <div 
            onClick={() => setPaymentMethod('upi_qr')}
            className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 ${
              paymentMethod === 'upi_qr' 
                ? 'border-purple-600 bg-purple-50/20' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                paymentMethod === 'upi_qr' ? 'border-purple-600' : 'border-slate-300'
              }`}>
                {paymentMethod === 'upi_qr' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>}
              </div>
              <div className="flex items-center gap-2">
                <QrCode className={`w-4 h-4 ${paymentMethod === 'upi_qr' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className="text-sm font-semibold text-slate-700">UPI QR Code</span>
              </div>
            </div>
            <UpiLogo />
          </div>

          {/* UPI ID option */}
          <div 
            onClick={() => setPaymentMethod('upi_id')}
            className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 ${
              paymentMethod === 'upi_id' 
                ? 'border-purple-600 bg-purple-50/20' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                paymentMethod === 'upi_id' ? 'border-purple-600' : 'border-slate-300'
              }`}>
                {paymentMethod === 'upi_id' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${paymentMethod === 'upi_id' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className="text-sm font-semibold text-slate-700">UPI ID / VPA</span>
              </div>
            </div>
            <UpiLogo />
          </div>
        </div>
      </div>

      {/* Dynamic UPI Sub-Forms */}
      <div className="mt-2">
        {/* Google Pay Simulator */}
        {paymentMethod === 'gpay' && (
          <div className="flex flex-col items-center gap-4 bg-slate-50 border border-slate-100 p-6 rounded-3xl animate-fade-in">
            <p className="text-xs text-slate-500 font-medium text-center">
              Click below to pay securely via Google Pay UPI deep-link.
            </p>
            <button
              type="button"
              onClick={handlePayment}
              disabled={loadingLocal}
              className="w-full max-w-xs py-3.5 bg-black hover:bg-zinc-900 disabled:bg-zinc-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md focus:outline-none focus:ring-4 focus:ring-zinc-200 group"
            >
              {loadingLocal ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Pay with</span>
                  <span className="tracking-tight text-white flex items-center gap-0.5">
                    <span className="text-blue-400">G</span>
                    <span className="text-red-400">P</span>
                    <span className="text-yellow-400">a</span>
                    <span className="text-green-400">y</span>
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* UPI QR Code Simulator */}
        {paymentMethod === 'upi_qr' && (
          <div className="flex flex-col items-center gap-4 bg-slate-50 border border-slate-100 p-6 rounded-3xl animate-fade-in">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              {/* Styled Mock SVG QR Code */}
              <svg className="w-40 h-40 text-slate-800" viewBox="0 0 100 100">
                <rect x="0" y="0" width="25" height="25" fill="currentColor" />
                <rect x="5" y="5" width="15" height="15" fill="white" />
                <rect x="8" y="8" width="9" height="9" fill="currentColor" />
                
                <rect x="75" y="0" width="25" height="25" fill="currentColor" />
                <rect x="80" y="5" width="15" height="15" fill="white" />
                <rect x="83" y="8" width="9" height="9" fill="currentColor" />
                
                <rect x="0" y="75" width="25" height="25" fill="currentColor" />
                <rect x="5" y="80" width="15" height="15" fill="white" />
                <rect x="8" y="83" width="9" height="9" fill="currentColor" />
                
                <rect x="35" y="10" width="5" height="15" fill="currentColor" />
                <rect x="45" y="5" width="10" height="5" fill="currentColor" />
                <rect x="60" y="15" width="5" height="20" fill="currentColor" />
                <rect x="35" y="35" width="25" height="5" fill="currentColor" />
                <rect x="10" y="35" width="15" height="10" fill="currentColor" />
                <rect x="35" y="45" width="5" height="15" fill="currentColor" />
                <rect x="45" y="55" width="20" height="5" fill="currentColor" />
                <rect x="55" y="40" width="5" height="10" fill="currentColor" />
                <rect x="70" y="35" width="20" height="20" fill="currentColor" />
                <rect x="80" y="60" width="10" height="10" fill="currentColor" />
                <rect x="35" y="75" width="10" height="15" fill="currentColor" />
                <rect x="50" y="80" width="15" height="5" fill="currentColor" />
                <rect x="55" y="70" width="10" height="5" fill="currentColor" />
                <rect x="70" y="75" width="15" height="15" fill="currentColor" />
              </svg>
              {/* Scan visual animation line */}
              <div className="absolute left-0 right-0 top-0 h-0.5 bg-purple-500 opacity-70 animate-bounce"></div>
            </div>
            <p className="text-xs font-semibold text-slate-500 text-center px-4">
              Scan this QR code using GPay, PhonePe, Paytm, or BHIM to pay ₹110.00
            </p>
            <button
              type="button"
              onClick={handlePayment}
              disabled={loadingLocal}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-2xl font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loadingLocal ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Verify & Confirm Payment</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* UPI ID / VPA Simulator */}
        {paymentMethod === 'upi_id' && (
          <div className="flex flex-col gap-4 bg-slate-50 border border-slate-100 p-6 rounded-3xl animate-fade-in">
            <div className="flex flex-col text-left">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Enter UPI ID / VPA
              </label>
              <input
                type="text"
                placeholder="e.g. name@okaxis"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500"
              />
            </div>
            <button
              type="button"
              onClick={handlePayment}
              disabled={loadingLocal || !upiId.includes('@')}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-2xl font-semibold shadow-lg shadow-purple-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loadingLocal ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Verify & Pay ₹110.00</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-400">
        Secure mock payments for testing purposes
      </div>
    </div>
  );
};

export default PaymentStage;
