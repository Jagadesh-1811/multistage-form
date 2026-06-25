import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

const FileUploader = ({
  label,
  name,
  error,
  setValue,
  clearErrors,
  setError,
  watch,
  existingFile,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  allowedExtensionsLabel = 'JPG, PNG, PDF',
  maxSizeMB = 5
}) => {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Watch the current value of this field in react-hook-form
  const fileValue = watch(name);
  
  // Determine if there is currently a selected file (either new or existing from session)
  const currentFile = fileValue instanceof File 
    ? { name: fileValue.name, size: fileValue.size, isNew: true } 
    : (existingFile ? { name: existingFile.originalName, size: existingFile.size, isNew: false, path: existingFile.path } : null);

  const validateAndSetFile = (file) => {
    if (!file) return;

    // Check size limit
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(name, {
        type: 'manual',
        message: `File size exceeds the limit of ${maxSizeMB}MB.`
      });
      return;
    }

    // Check mime type
    if (!allowedTypes.includes(file.type) && file.type !== "") {
      setError(name, {
        type: 'manual',
        message: `Invalid format. Allowed formats: ${allowedExtensionsLabel}.`
      });
      return;
    }

    // Secondary check for extensions if mime type is blank
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
    if (!allowedExts.includes(extension)) {
      setError(name, {
        type: 'manual',
        message: `Invalid format. Allowed formats: ${allowedExtensionsLabel}.`
      });
      return;
    }

    // If valid, store file in React Hook Form state
    setValue(name, file, { shouldValidate: true, shouldDirty: true });
    clearErrors(name);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const onUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setValue(name, null, { shouldValidate: true, shouldDirty: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Convert bytes to human readable format
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full text-left">
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      
      {/* Hidden input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
      />

      {/* Drag & Drop Area */}
      {!currentFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onUploadButtonClick}
          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
            isDragActive 
              ? 'border-purple-600 bg-purple-50/50' 
              : error 
                ? 'border-rose-300 bg-rose-50/10 hover:bg-rose-50/20' 
                : 'border-purple-200 bg-purple-50/20 hover:bg-purple-50/40'
          }`}
        >
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-600">Click to upload ID</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {allowedExtensionsLabel} (Max {maxSizeMB}MB)
            </p>
          </div>
        </div>
      ) : (
        /* Uploaded File Item Preview */
        <div className="flex flex-col gap-2">
          {/* Re-upload Clickable Area if wanted or just file status item */}
          <div className={`flex items-center justify-between p-3.5 border rounded-2xl transition-all duration-200 ${
            error 
              ? 'border-rose-300 bg-rose-50/10' 
              : 'border-emerald-200 bg-emerald-50/20'
          }`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`p-2 rounded-xl shrink-0 ${error ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate" title={currentFile.name}>
                  {currentFile.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatBytes(currentFile.size)} 
                  {!currentFile.isNew && <span className="ml-1.5 text-slate-400 font-normal italic">(Saved)</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {!error && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
              <button
                type="button"
                onClick={removeFile}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none"
                title="Remove File"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs font-medium text-rose-500 mt-1.5 flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5" />
          {error.message}
        </p>
      )}
    </div>
  );
};

export default FileUploader;
