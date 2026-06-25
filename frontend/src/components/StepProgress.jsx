import React from 'react';
import { useLocation } from 'react-router-dom';

const StepProgress = () => {
  const location = useLocation();

  const getStepNumber = (pathname) => {
    if (pathname.includes('/register/personal')) return 1;
    if (pathname.includes('/register/education')) return 2;
    if (pathname.includes('/register/payment')) return 3;
    if (pathname.includes('/register/confirmation')) return 4;
    return 1;
  };

  const currentStep = getStepNumber(location.pathname);

  const steps = [
    { id: 1, label: 'Personal Information' },
    { id: 2, label: 'Educational Details' },
    { id: 3, label: 'Payment' },
    { id: 4, label: 'Confirmation' }
  ];

  return (
    <div className="w-full select-none">
      {/* Circles and Lines Row */}
      <div className="flex items-center justify-between relative px-2">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          
          return (
            <React.Fragment key={step.id}>
              {/* Step Circle with Label (stacked or side-by-side depending on viewport) */}
              <div className="flex items-center gap-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200' 
                    : isActive 
                      ? 'bg-purple-600 border-purple-600 text-white ring-4 ring-purple-100'
                      : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                
                {/* Desktop & Tablet Label next to circle */}
                <span className={`hidden sm:inline text-xs font-medium whitespace-nowrap transition-colors duration-300 ${
                  isActive ? 'text-slate-800 font-semibold' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>

              {/* Connecting Line (Only between steps) */}
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-2 h-[2px] relative bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-purple-600 transition-all duration-500 ease-out"
                    style={{ 
                      width: isCompleted 
                        ? '100%' 
                        : (currentStep - 1 === step.id) 
                          ? '50%' // partial fill if next step is active (optional, looks great)
                          : '0%' 
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile-only Label: Display only the active step text below the progress circles */}
      <div className="sm:hidden text-center mt-3">
        <p className="text-xs font-semibold text-purple-600 tracking-wide uppercase">
          Step {currentStep} of 4
        </p>
        <p className="text-sm font-semibold text-slate-800">
          {steps[currentStep - 1]?.label}
        </p>
      </div>
    </div>
  );
};

export default StepProgress;
