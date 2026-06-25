import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, School, BookOpen, Calendar, Award, ArrowLeft, ArrowRight } from 'lucide-react';
import axios from 'axios';

import { useUI } from '../context/UIContext';
import { useSession } from '../context/SessionContext';
import FileUploader from '../components/FileUploader';
import { EducationIllustration } from '../components/Illustrations';

const qualifications = [
  'High School / Diploma',
  'Associate Degree',
  'Bachelor of Science',
  'Bachelor of Arts',
  'Bachelor of Engineering / Tech',
  'Master of Science',
  'Master of Arts',
  'Master of Business Administration',
  'Doctor of Philosophy (Ph.D.)',
  'Other'
];

// Generate years from current + 5 down to 1990
const currentYear = new Date().getFullYear();
const completionYears = Array.from(
  { length: currentYear + 5 - 1990 + 1 },
  (_, idx) => currentYear + 5 - idx
);

const EducationStage = () => {
  const navigate = useNavigate();
  const { setIsLoading, showToast } = useUI();
  const { session, setSession, fetchSession } = useSession();

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
      qualification: '',
      institution: '',
      course: '',
      year: '',
      grade: '',
      certificate: null
    }
  });

  // Pre-fill form if session has educationalDetails
  useEffect(() => {
    if (session.educationalDetails) {
      const { qualification, institution, course, year, grade, certificateFile } = session.educationalDetails;
      reset({
        qualification: qualification || '',
        institution: institution || '',
        course: course || '',
        year: year || '',
        grade: grade || '',
        certificate: certificateFile ? 'existing' : null
      });
    }
  }, [session, reset]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('qualification', data.qualification);
      formData.append('institution', data.institution.trim());
      formData.append('course', data.course.trim());
      formData.append('year', data.year);
      formData.append('grade', data.grade.trim());

      // If the file is a new File object, append it
      if (data.certificate instanceof File) {
        formData.append('certificate', data.certificate);
      }

      const response = await axios.post('/api/application/stage2', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.success) {
        setSession(response.data.data);
        showToast('Educational details saved successfully!', 'success');
        navigate('/register/payment');
      }
    } catch (error) {
      console.error('Error saving stage 2:', error);
      const errMsg = error.response?.data?.message || 'Failed to save educational details. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Navigate back to stage 1
    // We fetch the session again just to be sure we have the latest server state
    fetchSession();
    navigate('/register/personal');
  };

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6 animate-fade-in">
      {/* Header & Illustration */}
      <div className="text-center">
        <EducationIllustration />
        <h2 className="text-2xl font-bold text-slate-800 mt-4">Educational Details</h2>
        <p className="text-sm text-slate-400 mt-1">Please enter your educational information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Highest Qualification */}
        <div className="relative text-left">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            Highest Qualification
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <GraduationCap className="w-4 h-4" />
            </span>
            <select
              className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-purple-100 appearance-none ${
                errors.qualification ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-purple-500'
              }`}
              {...register('qualification', { required: 'Please select your qualification' })}
            >
              <option value="">Select Qualification</option>
              {qualifications.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
          {errors.qualification && (
            <p className="text-xs font-medium text-rose-500 mt-1.5">{errors.qualification.message}</p>
          )}
        </div>

        {/* University / Institution */}
        <div className="relative text-left">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            University / Institution
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <School className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Boston University"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-purple-100 ${
                errors.institution ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-purple-500'
              }`}
              {...register('institution', {
                required: 'University or institution name is required',
                minLength: { value: 3, message: 'Please enter a valid institution name' }
              })}
            />
          </div>
          {errors.institution && (
            <p className="text-xs font-medium text-rose-500 mt-1.5">{errors.institution.message}</p>
          )}
        </div>

        {/* Course / Major */}
        <div className="relative text-left">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            Course / Major
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <BookOpen className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Computer Science"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-purple-100 ${
                errors.course ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-purple-500'
              }`}
              {...register('course', {
                required: 'Course or major name is required',
                minLength: { value: 2, message: 'Please enter a valid major name' }
              })}
            />
          </div>
          {errors.course && (
            <p className="text-xs font-medium text-rose-500 mt-1.5">{errors.course.message}</p>
          )}
        </div>

        {/* Year of Completion */}
        <div className="relative text-left">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            Year of Completion
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </span>
            <select
              className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-purple-100 appearance-none ${
                errors.year ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-purple-500'
              }`}
              {...register('year', { required: 'Please select the completion year' })}
            >
              <option value="">Select Year</option>
              {completionYears.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
          {errors.year && (
            <p className="text-xs font-medium text-rose-500 mt-1.5">{errors.year.message}</p>
          )}
        </div>

        {/* Percentage / CGPA */}
        <div className="relative text-left">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            Percentage / CGPA
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Award className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="e.g. 8.6/10 or 85%"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-purple-100 ${
                errors.grade ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-purple-500'
              }`}
              {...register('grade', {
                required: 'Percentage/CGPA is required',
                pattern: {
                  value: /^[0-9.%/\s-]{2,10}$/,
                  message: 'Enter a valid grade (e.g. 8.6/10, 85%, or 3.8 GPA)'
                }
              })}
            />
          </div>
          {errors.grade && (
            <p className="text-xs font-medium text-rose-500 mt-1.5">{errors.grade.message}</p>
          )}
        </div>

        {/* Certificate Upload */}
        <FileUploader
          label="Upload Educational Certificate"
          name="certificate"
          error={errors.certificate}
          setValue={setValue}
          clearErrors={clearErrors}
          setError={setError}
          watch={watch}
          existingFile={session.educationalDetails?.certificateFile}
        />
        
        {/* Register input in hook-form manually so it participates in validation */}
        <input
          type="hidden"
          {...register('certificate', {
            required: 'Educational certificate is required'
          })}
        />

        {/* Action Buttons: Back and Next */}
        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-semibold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
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

export default EducationStage;
