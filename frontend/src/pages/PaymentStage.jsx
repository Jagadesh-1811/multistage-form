import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, Building2, CheckCircle2, ChevronRight } from 'lucide-react';
import axios from 'axios';

import { useUI } from '../context/UIContext';
import { useSession } from '../context/SessionContext';
import { PaymentIllustration } from '../components/Illustrations';

// Custom logos
const VisaLogo = () => (
  <span className="text-blue-800 font-extrabold italic text-sm tracking-wider select-none">VISA</span>
);

const MastercardLogo = () => (
  <div className="flex -space-x-1.5 select-none">
    <div className="w-4 h-4 rounded-full bg-rose-500 opacity-90"></div>
    <div className="w-4 h-4 rounded-full bg-amber-500 opacity-90"></div>
  </div>
);

const UpiLogo = () => (
  <span className="text-[10px] font-black tracking-tight text-slate-600 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded select-none">UPI</span>
);

const PaymentStage = () => {
  const navigate = useNavigate();
  const { setIsLoading, showToast } = useUI();
  const { setSession } = useSession();
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      // Step 1: Initiate payment request on backend
      const createResponse = await axios.post('/api/payment/create');
      
      if (createResponse.data && createResponse.data.success) {
        // Simulate minor processing lag for premium feel
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Map UI payment method key to human-readable label
        const methodLabels = {
          card: 'Credit / Debit Card',
          netbanking: 'Net Banking',
          upi: 'UPI / Other'
        };

        // Step 2: Confirm successful payment with backend
        const successResponse = await axios.post('/api/payment/success', {
          paymentMethod: methodLabels[paymentMethod]
        });

        if (successResponse.data && successResponse.data.success) {
          // Sync full session to capture updated step & payment details
          const sessionResponse = await axios.get('/api/application/session');
          if (sessionResponse.data && sessionResponse.data.success) {
            setSession(sessionResponse.data.data);
          }
          
          showToast('Payment successful!', 'success');
          navigate('/register/confirmation');
        }
      }
    } catch (error) {
      console.error('Error during payment flow:', error);
      const errMsg = error.response?.data?.message || 'Payment simulation failed. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6 animate-fade-in">
      {/* Header & Illustration */}
      <div className="text-center">
        <PaymentIllustration />
        <h2 className="text-2xl font-bold text-slate-800 mt-4">Payment</h2>
        <p className="text-sm text-slate-400 mt-1">Review and complete your payment</p>
      </div>

      {/* Application Fee Summary */}
      <div className="bg-purple-50/40 border border-purple-100 rounded-3xl p-5 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-purple-900 text-left">Application Summary</h3>
        
        <div className="flex flex-col gap-2 text-sm text-slate-600">
          <div className="flex justify-between items-center">
            <span>Application Fee</span>
            <span className="font-semibold text-slate-800">$100.00</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Processing Fee</span>
            <span className="font-semibold text-slate-800">$10.00</span>
          </div>
        </div>

        {/* Dashed Line separator */}
        <div className="border-t border-dashed border-purple-200 my-1"></div>

        <div className="flex justify-between items-center text-base font-bold text-purple-900">
          <span>Total Amount</span>
          <span className="text-lg">$110.00</span>
        </div>
      </div>

      {/* Choose Payment Method */}
      <div className="flex flex-col gap-3 text-left">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
          Choose Payment Method
        </h4>

        <div className="flex flex-col gap-2.5">
          {/* Credit / Debit Card option */}
          <div 
            onClick={() => setPaymentMethod('card')}
            className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 ${
              paymentMethod === 'card' 
                ? 'border-purple-600 bg-purple-50/20' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                paymentMethod === 'card' ? 'border-purple-600' : 'border-slate-300'
              }`}>
                {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>}
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className={`w-4 h-4 ${paymentMethod === 'card' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className="text-sm font-semibold text-slate-700">Credit / Debit Card</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <VisaLogo />
              <MastercardLogo />
            </div>
          </div>

          {/* Net Banking option */}
          <div 
            onClick={() => setPaymentMethod('netbanking')}
            className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 ${
              paymentMethod === 'netbanking' 
                ? 'border-purple-600 bg-purple-50/20' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                paymentMethod === 'netbanking' ? 'border-purple-600' : 'border-slate-300'
              }`}>
                {paymentMethod === 'netbanking' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>}
              </div>
              <div className="flex items-center gap-2">
                <Building2 className={`w-4 h-4 ${paymentMethod === 'netbanking' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className="text-sm font-semibold text-slate-700">Net Banking</span>
              </div>
            </div>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          {/* UPI option */}
          <div 
            onClick={() => setPaymentMethod('upi')}
            className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 ${
              paymentMethod === 'upi' 
                ? 'border-purple-600 bg-purple-50/20' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                paymentMethod === 'upi' ? 'border-purple-600' : 'border-slate-300'
              }`}>
                {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${paymentMethod === 'upi' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className="text-sm font-semibold text-slate-700">UPI / Other</span>
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
