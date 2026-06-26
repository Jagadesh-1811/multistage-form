import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Mail, Phone, MapPin, ArrowRight, Save } from 'lucide-react';
import axios from 'axios';

import { useUI } from '../context/UIContext';
import { useSession } from '../context/SessionContext';
import FileUploader from '../components/FileUploader';
import { PersonalIllustration } from '../components/Illustrations';

const PersonalStage = () => {
  const navigate = useNavigate();
  const { setIsLoading, showToast } = useUI();
  const { session, setSession } = useSession();

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    setError,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      dob: '',
      email: '',
      phone: '',
      address: '',
      govtId: null
    }
  });

  // Pre-fill form if session has personalInfo
  useEffect(() => {
    if (session.personalInfo) {
      const { name, dob, email, phone, address, govtIdFile } = session.personalInfo;
      reset({
        name: name || '',
        dob: dob || '',
        email: email || '',
        phone: phone || '',
        address: address || '',
        // If we have an existing file, we set a dummy value to indicate it is uploaded,
        // but it's not a File object. The FileUploader understands this.
        govtId: govtIdFile ? 'existing' : null
      });
    }
  }, [session, reset]);

  const onSubmit = async (data, shouldNavigate = true) => {
    try {
      setIsLoading(true);
      
      let govtIdFile = null;

      // If it is a new File object, upload to S3 first
      if (data.govtId instanceof File) {
        // 1. Request presigned URL from Express backend
        const presignRes = await axios.post('/api/application/presign-upload', {
          fileName: data.govtId.name,
          fileType: data.govtId.type,
          documentType: 'govtId'
        });

        if (presignRes.data && presignRes.data.success) {
          const { presignedUrl, s3Key } = presignRes.data.data;

          // 2. Upload file directly to AWS S3 using PUT (raw XHR to avoid axios preflight quirks)
          await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', presignedUrl);
            xhr.setRequestHeader('Content-Type', data.govtId.type);
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
              } else {
                reject(new Error(`S3 upload failed (${xhr.status}): ${xhr.responseText || xhr.statusText}`));
              }
            };
            xhr.onerror = () => reject(new Error('Network error during S3 upload — check S3 bucket CORS configuration'));
            xhr.send(data.govtId);
          });

          govtIdFile = {
            s3Key,
            originalName: data.govtId.name,
            size: data.govtId.size
          };
        }
      }

      // 3. Submit data to backend as JSON
      const payload = {
        name: data.name.trim(),
        dob: data.dob,
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        govtIdFile
      };

      const response = await axios.post('/api/application/stage1', payload);

      if (response.data && response.data.success) {
        setSession(response.data.data);
        showToast('Personal information saved successfully!', 'success');
        if (shouldNavigate) {
          navigate('/register/education');
        }
      }
    } catch (error) {
      console.error('Error saving stage 1:', error);
      const errMsg = error.response?.data?.message || error.message || 'Failed to save personal details. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6 animate-fade-in">
      {/* Header & Illustration */}
      <div className="text-center">
        <PersonalIllustration />
        <h2 className="text-2xl font-bold text-slate-800 mt-4">Personal Information</h2>
        <p className="text-sm text-slate-400 mt-1">Please enter your personal details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Full Name */}
        <div className="relative text-left">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            Full Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="John Doe"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-purple-100 ${
                errors.name ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-purple-500'
              }`}
              {...register('name', {
                required: 'Full name is required',
                minLength: { value: 3, message: 'Name must be at least 3 characters' }
              })}
            />
          </div>
          {errors.name && (
            <p className="text-xs font-medium text-rose-500 mt-1.5">{errors.name.message}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="relative text-left">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            Date of Birth
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </span>
            <input
              type="date"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-purple-100 ${
                errors.dob ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-purple-500'
              }`}
              {...register('dob', {
                required: 'Date of birth is required',
                validate: {
                  isInPast: (value) => new Date(value) < new Date() || 'Date of birth must be in the past',
                  isValidDate: (value) => !isNaN(new Date(value).getTime()) || 'Enter a valid date'
                }
              })}
            />
          </div>
          {errors.dob && (
            <p className="text-xs font-medium text-rose-500 mt-1.5">{errors.dob.message}</p>
          )}
        </div>

        {/* Email Address */}
        <div className="relative text-left">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              placeholder="john.doe@example.com"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-purple-100 ${
                errors.email ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-purple-500'
              }`}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: 'Enter a valid email address'
                }
              })}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-rose-500 mt-1.5">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="relative text-left">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            Phone Number
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </span>
            <input
              type="tel"
              placeholder="+1 987 654 3210"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-purple-100 ${
                errors.phone ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-purple-500'
              }`}
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^\+?[0-9\s-]{10,15}$/,
                  message: 'Enter a valid phone number (10-15 digits)'
                }
              })}
            />
          </div>
          {errors.phone && (
            <p className="text-xs font-medium text-rose-500 mt-1.5">{errors.phone.message}</p>
          )}
        </div>

        {/* Address */}
        <div className="relative text-left">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="123 Main Street, Boston, MA 02101"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-purple-100 ${
                errors.address ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-purple-500'
              }`}
              {...register('address', {
                required: 'Address is required',
                minLength: { value: 10, message: 'Please enter a complete address (min 10 chars)' }
              })}
            />
          </div>
          {errors.address && (
            <p className="text-xs font-medium text-rose-500 mt-1.5">{errors.address.message}</p>
          )}
        </div>

        {/* Government ID Upload */}
        <FileUploader
          label="Upload Government ID"
          name="govtId"
          error={errors.govtId}
          setValue={setValue}
          clearErrors={clearErrors}
          setError={setError}
          watch={watch}
          existingFile={session.personalInfo?.govtIdFile}
        />
        
        {/* Register input in hook-form manually so it participates in validation */}
        <input
          type="hidden"
          {...register('govtId', {
            required: 'Government ID is required'
          })}
        />

        {/* Action Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, false))}
            disabled={isSubmitting}
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-100"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-2xl font-semibold shadow-lg shadow-purple-100 flex items-center justify-center gap-2 transition-all cursor-pointer group focus:outline-none focus:ring-4 focus:ring-purple-100"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalStage;
