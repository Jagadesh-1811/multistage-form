import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, Building2, CheckCircle2, ChevronRight } from 'lucide-react';
import axios from 'axios';

import { useUI } from '../context/UIContext';
import { useSession } from '../context/SessionContext';
import { PaymentIllustration } from '../components/Illustrations';

// Styled Indian UPI Logo
const UpiLogo = () => (
  <span className="text-[10px] font-black tracking-tight text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg select-none">UPI</span>
);

const GpayLogo = () => (
  <span className="text-sm font-bold text-slate-800 tracking-tight flex items-center select-none">
    <span className="text-blue-600">G</span>
    <span className="text-red-500">o</span>
    <span className="text-yellow-500">o</span>
    <span className="text-blue-600">g</span>
    <span className="text-green-500">l</span>
    <span className="text-red-500">e</span>
    <span className="ml-1 text-slate-600 font-semibold">Pay</span>
  </span>
);

const PaymentStage = () => {
  const navigate = useNavigate();
  const { setIsLoading, showToast } = useUI();
  const { setSession } = useSession();
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handlePayment = async () => {
    if (paymentMethod === 'gpay') {
      await handleGooglePay();
      return;
    }

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
          {/* Credit / Debit Card option */}
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

      {/* Pay Now Button */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <button
          type="button"
          onClick={handlePayment}
          className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-semibold shadow-lg shadow-purple-100 flex items-center justify-center gap-2 transition-all cursor-pointer group focus:outline-none focus:ring-4 focus:ring-purple-100"
        >
          <Lock className="w-4 h-4" />
          <span>Pay $110.00</span>
        </button>
        <span className="text-xs text-slate-400">Secure payments powered by Stripe</span>
      </div>
    </div>
  );
};

export default PaymentStage;
