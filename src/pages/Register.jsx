import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx6ZteLf4Bjg5UacdfYJqvT7kSRY0TDUq8ZfnHOHy-rgr9vZ_9p-nLBo2-MFZpYS9lgsA/exec";
const DEFAULT_UPI_ID = "ankit738885-1@oksbi";
const DEFAULT_PAYEE_NAME = "ANKIT KUMAR SINGH";

export const Register = () => {
  const { showToast } = useToast();
  
  // Step indicator state: 1 = Details, 2 = Payment
  const [currentStep, setCurrentStep] = useState(1);

  // State variables
  const [gameCategory, setGameCategory] = useState('singles');
  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    collegeName: '',
    branch: '',
    section: '',
    year: '',
    gender: '',
    mobileNumber: '',
    emailAddress: '',
    partnerName: '',
    partnerRollNumber: '',
    partnerCollege: '',
    partnerBranch: '',
    partnerSection: '',
    partnerYear: '',
    partnerMobile: '',
    partnerEmail: '',
    transactionId: ''
  });
  
  const [screenshot, setScreenshot] = useState({
    base64: '',
    name: '',
    sizeStr: ''
  });
  
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [statusModal, setStatusModal] = useState({
    visible: false,
    success: false,
    title: '',
    message: ''
  });
  
  const fileInputRef = useRef(null);

  // Dynamic QR Code generation details
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const amount = gameCategory === 'doubles' ? 150 : 100;
    const roll = formData.rollNumber.trim() || "ROLL";
    const name = formData.fullName.trim() || "PLAYER";
    const note = `SEMS_${gameCategory === 'doubles' ? 'DBL' : 'SGL'}_${roll}_${name}`
      .substring(0, 50)
      .replace(/[^a-zA-Z0-9_]/g, "_");
      
    const upiUrl = `upi://pay?pa=${DEFAULT_UPI_ID}&pn=${encodeURIComponent(DEFAULT_PAYEE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`);
  }, [gameCategory, formData.fullName, formData.rollNumber]);

  // Handle Text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Copy UPI ID
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(DEFAULT_UPI_ID)
      .then(() => showToast("UPI ID copied to clipboard!", "success"))
      .catch(() => showToast("Failed to copy UPI ID.", "error"));
  };

  // File drag & drop triggers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith("image/")) {
      showToast("Only image files are allowed!", "error");
      return;
    }
    
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast("Screenshot must be smaller than 4MB!", "error");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshot({
        base64: e.target.result,
        name: file.name,
        sizeStr: formatBytes(file.size)
      });
      setErrors((prev) => ({ ...prev, screenshotFile: null }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshot({ base64: '', name: '', sizeStr: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const tempErrors = {};
    const phonePattern = /^[6-9]\d{9}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.fullName.trim()) tempErrors.fullName = "Full Name is required";
    if (!formData.rollNumber.trim()) tempErrors.rollNumber = "Roll Number is required";
    if (!formData.collegeName.trim()) tempErrors.collegeName = "College Name is required";
    if (!formData.branch.trim()) tempErrors.branch = "Branch is required";
    if (!formData.section.trim()) tempErrors.section = "Section is required";
    if (!formData.year) tempErrors.year = "Year of study is required";
    if (!formData.gender) tempErrors.gender = "Gender is required";
    
    if (!formData.mobileNumber.trim()) {
      tempErrors.mobileNumber = "Mobile Number is required";
    } else if (!phonePattern.test(formData.mobileNumber.trim())) {
      tempErrors.mobileNumber = "Enter a valid 10-digit mobile number";
    }
    
    if (!formData.emailAddress.trim()) {
      tempErrors.emailAddress = "Email address is required";
    } else if (!emailPattern.test(formData.emailAddress.trim())) {
      tempErrors.emailAddress = "Enter a valid email address";
    }
    
    // Partner Validation if Doubles
    if (gameCategory === 'doubles') {
      if (!formData.partnerName.trim()) tempErrors.partnerName = "Partner Name is required";
      if (!formData.partnerRollNumber.trim()) tempErrors.partnerRollNumber = "Partner Roll Number is required";
      if (!formData.partnerCollege.trim()) tempErrors.partnerCollege = "Partner College is required";
      if (!formData.partnerBranch.trim()) tempErrors.partnerBranch = "Partner Branch is required";
      if (!formData.partnerSection.trim()) tempErrors.partnerSection = "Partner Section is required";
      if (!formData.partnerYear) tempErrors.partnerYear = "Partner Year is required";
      
      if (!formData.partnerMobile.trim()) {
        tempErrors.partnerMobile = "Partner Mobile Number is required";
      } else if (!phonePattern.test(formData.partnerMobile.trim())) {
        tempErrors.partnerMobile = "Enter a valid 10-digit mobile number";
      }
      
      if (!formData.partnerEmail.trim()) {
        tempErrors.partnerEmail = "Partner Email address is required";
      } else if (!emailPattern.test(formData.partnerEmail.trim())) {
        tempErrors.partnerEmail = "Enter a valid email address";
      }
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const tempErrors = {};
    const utrPattern = /^\d{12}$/;
    
    if (!formData.transactionId.trim()) {
      tempErrors.transactionId = "Transaction ID is required";
    } else if (!utrPattern.test(formData.transactionId.trim())) {
      tempErrors.transactionId = "UTR must be a valid 12-digit reference number";
    }
    
    if (!screenshot.base64) {
      tempErrors.screenshotFile = "Payment screenshot upload is required";
    }
    
    setErrors((prev) => ({ ...prev, ...tempErrors }));
    return Object.keys(tempErrors).length === 0;
  };

  // Proceed to Step 2
  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast("Please correct details errors before continuing.", "error");
    }
  };

  // Go back to Step 1
  const handlePrevStep = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Handler (on Step 2)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      showToast("Please provide transaction details and screenshot.", "error");
      return;
    }
    
    setLoading(true);
    
    const payload = {
      ...formData,
      gameCategory,
      screenshotBase64: screenshot.base64,
      screenshotName: screenshot.name,
      timestamp: new Date().toISOString(),
      action: "register"
    };
    
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.status === "success") {
        setStatusModal({
          visible: true,
          success: true,
          title: "Registration Submitted!",
          message: "Your registration details and payment screenshot have been submitted successfully. The sports committee will verify your transaction ID shortly. Keep your transaction reference handy!"
        });
        
        // Reset form & steps
        setFormData({
          fullName: '',
          rollNumber: '',
          collegeName: '',
          branch: '',
          section: '',
          year: '',
          gender: '',
          mobileNumber: '',
          emailAddress: '',
          partnerName: '',
          partnerRollNumber: '',
          partnerCollege: '',
          partnerBranch: '',
          partnerSection: '',
          partnerYear: '',
          partnerMobile: '',
          partnerEmail: '',
          transactionId: ''
        });
        handleRemoveScreenshot();
        setCurrentStep(1);
      } else {
        throw new Error(result.message || "Failed to save registration on server");
      }
    } catch (err) {
      console.error(err);
      setStatusModal({
        visible: true,
        success: false,
        title: "Submission Error",
        message: err.message || "An error occurred while uploading. Please check your internet connection or try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Wizard Step Progress Tracker */}
      <div className="flex justify-between items-center max-w-md mx-auto mb-10 select-none">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
            currentStep === 1
              ? 'border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/10'
              : 'border-green-500 bg-green-500 text-white'
          }`}>
            {currentStep > 1 ? <i className="fa-solid fa-check"></i> : "1"}
          </div>
          <span className={`text-sm font-semibold transition-colors duration-300 ${
            currentStep === 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
          }`}>
            Player Details
          </span>
        </div>
        <div className={`flex-grow h-[2px] mx-4 rounded transition-colors duration-500 ${
          currentStep > 1 ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-800'
        }`}></div>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
            currentStep === 2
              ? 'border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/10'
              : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-transparent'
          }`}>
            2
          </div>
          <span className={`text-sm font-semibold transition-colors duration-300 ${
            currentStep === 2 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
          }`}>
            Payment & Submit
          </span>
        </div>
      </div>

      {/* Form Area */}
      <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden transition-all duration-300">
        
        {/* STEP 1: Details Form */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fade-in">
            {/* Category selection */}
            <div>
              <h3 className="font-outfit text-xl font-bold text-slate-900 dark:text-white mb-1">
                Select Format
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Choose either singles or doubles registration
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="gameCategory"
                    checked={gameCategory === 'singles'}
                    onChange={() => setGameCategory('singles')}
                    className="sr-only"
                  />
                  <div className={`flex items-center gap-4 p-4 border-2 rounded-2xl transition-all duration-300 ${
                    gameCategory === 'singles'
                      ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a2744]/40 hover:border-slate-300'
                  }`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-colors duration-300 ${
                      gameCategory === 'singles' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-[#121d33] text-slate-500 dark:text-slate-400'
                    }`}>
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-outfit font-bold text-slate-900 dark:text-white">Singles</span>
                      <span className="text-sm font-semibold text-blue-500 dark:text-blue-400">₹100</span>
                    </div>
                    {gameCategory === 'singles' && (
                      <div className="ml-auto text-blue-500"><i className="fa-solid fa-circle-check text-xl"></i></div>
                    )}
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="gameCategory"
                    checked={gameCategory === 'doubles'}
                    onChange={() => setGameCategory('doubles')}
                    className="sr-only"
                  />
                  <div className={`flex items-center gap-4 p-4 border-2 rounded-2xl transition-all duration-300 ${
                    gameCategory === 'doubles'
                      ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a2744]/40 hover:border-slate-300'
                  }`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-colors duration-300 ${
                      gameCategory === 'doubles' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-[#121d33] text-slate-500 dark:text-slate-400'
                    }`}>
                      <i className="fa-solid fa-user-group"></i>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-outfit font-bold text-slate-900 dark:text-white">Doubles</span>
                      <span className="text-sm font-semibold text-blue-500 dark:text-blue-400">₹150</span>
                    </div>
                    {gameCategory === 'doubles' && (
                      <div className="ml-auto text-blue-500"><i className="fa-solid fa-circle-check text-xl"></i></div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Participant Details */}
            <div>
              <h3 className="font-outfit text-xl font-bold text-slate-900 dark:text-white mb-1">
                Participant Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Enter your academic and personal contact information
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-solid fa-user absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                        errors.fullName ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                      }`}
                    />
                  </div>
                  {errors.fullName && <span className="text-red-500 text-xs font-semibold">{errors.fullName}</span>}
                </div>

                {/* Roll Number */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Roll Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-solid fa-id-card absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 22BCE1024"
                      className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                        errors.rollNumber ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                      }`}
                    />
                  </div>
                  {errors.rollNumber && <span className="text-red-500 text-xs font-semibold">{errors.rollNumber}</span>}
                </div>

                {/* College Name */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    College Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-solid fa-school absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                    <input
                      type="text"
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleInputChange}
                      placeholder="Enter College Name"
                      className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                        errors.collegeName ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                      }`}
                    />
                  </div>
                  {errors.collegeName && <span className="text-red-500 text-xs font-semibold">{errors.collegeName}</span>}
                </div>

                {/* Branch */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Branch / Department <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-solid fa-graduation-cap absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      placeholder="e.g. Computer Science"
                      className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                        errors.branch ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                      }`}
                    />
                  </div>
                  {errors.branch && <span className="text-red-500 text-xs font-semibold">{errors.branch}</span>}
                </div>

                {/* Section */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-solid fa-door-open absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                    <input
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      placeholder="e.g. A, B, Sec-2"
                      className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                        errors.section ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                      }`}
                    />
                  </div>
                  {errors.section && <span className="text-red-500 text-xs font-semibold">{errors.section}</span>}
                </div>

                {/* Year */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Year of Study <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center after:content-['\f107'] after:font-black after:font-['Font_Awesome_6_Free'] after:absolute after:right-4 after:text-slate-400 after:pointer-events-none">
                    <i className="fa-solid fa-calendar-days absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-10 text-sm outline-none transition-all appearance-none cursor-pointer ${
                        errors.year ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                      }`}
                    >
                      <option value="" disabled>Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  {errors.year && <span className="text-red-500 text-xs font-semibold">{errors.year}</span>}
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center after:content-['\f107'] after:font-black after:font-['Font_Awesome_6_Free'] after:absolute after:right-4 after:text-slate-400 after:pointer-events-none">
                    <i className="fa-solid fa-venus-mars absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-10 text-sm outline-none transition-all appearance-none cursor-pointer ${
                        errors.gender ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                      }`}
                    >
                      <option value="" disabled>Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {errors.gender && <span className="text-red-500 text-xs font-semibold">{errors.gender}</span>}
                </div>

                {/* Mobile Number */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-solid fa-phone absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="10-digit number"
                      className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                        errors.mobileNumber ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                      }`}
                    />
                  </div>
                  {errors.mobileNumber && <span className="text-red-500 text-xs font-semibold">{errors.mobileNumber}</span>}
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5 sm:col-span-2 text-left">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-solid fa-envelope absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                    <input
                      type="email"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleInputChange}
                      placeholder="e.g. you@college.edu"
                      className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                        errors.emailAddress ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                      }`}
                    />
                  </div>
                  {errors.emailAddress && <span className="text-red-500 text-xs font-semibold">{errors.emailAddress}</span>}
                </div>
              </div>
            </div>

            {/* STEP 1.5: Doubles Team Member Details */}
            {gameCategory === 'doubles' && (
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 mt-6 animate-slide-down">
                <h3 className="font-outfit text-xl font-bold text-slate-900 dark:text-white mb-1">
                  Team Member Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Enter academic and contact information for your doubles partner
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Partner Name */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Partner Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <i className="fa-solid fa-user absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                      <input
                        type="text"
                        name="partnerName"
                        value={formData.partnerName}
                        onChange={handleInputChange}
                        placeholder="e.g. Aman Verma"
                        className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                          errors.partnerName ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                        }`}
                      />
                    </div>
                    {errors.partnerName && <span className="text-red-500 text-xs font-semibold">{errors.partnerName}</span>}
                  </div>

                  {/* Partner Roll Number */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Partner Roll Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <i className="fa-solid fa-id-card absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                      <input
                        type="text"
                        name="partnerRollNumber"
                        value={formData.partnerRollNumber}
                        onChange={handleInputChange}
                        placeholder="e.g. 22BCE1045"
                        className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                          errors.partnerRollNumber ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                        }`}
                      />
                    </div>
                    {errors.partnerRollNumber && <span className="text-red-500 text-xs font-semibold">{errors.partnerRollNumber}</span>}
                  </div>

                  {/* Partner College */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Partner College Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <i className="fa-solid fa-school absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                      <input
                        type="text"
                        name="partnerCollege"
                        value={formData.partnerCollege}
                        onChange={handleInputChange}
                        placeholder="e.g. College Name"
                        className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                          errors.partnerCollege ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                        }`}
                      />
                    </div>
                    {errors.partnerCollege && <span className="text-red-500 text-xs font-semibold">{errors.partnerCollege}</span>}
                  </div>

                  {/* Partner Branch */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Partner Branch / Dept <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <i className="fa-solid fa-graduation-cap absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                      <input
                        type="text"
                        name="partnerBranch"
                        value={formData.partnerBranch}
                        onChange={handleInputChange}
                        placeholder="e.g. Information Technology"
                        className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                          errors.partnerBranch ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                        }`}
                      />
                    </div>
                    {errors.partnerBranch && <span className="text-red-500 text-xs font-semibold">{errors.partnerBranch}</span>}
                  </div>

                  {/* Partner Section */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Partner Section <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <i className="fa-solid fa-door-open absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                      <input
                        type="text"
                        name="partnerSection"
                        value={formData.partnerSection}
                        onChange={handleInputChange}
                        placeholder="e.g. B, Sec-1"
                        className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                          errors.partnerSection ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                        }`}
                      />
                    </div>
                    {errors.partnerSection && <span className="text-red-500 text-xs font-semibold">{errors.partnerSection}</span>}
                  </div>

                  {/* Partner Year */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Partner Year <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center after:content-['\f107'] after:font-black after:font-['Font_Awesome_6_Free'] after:absolute after:right-4 after:text-slate-400 after:pointer-events-none">
                      <i className="fa-solid fa-calendar-days absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                      <select
                        name="partnerYear"
                        value={formData.partnerYear}
                        onChange={handleInputChange}
                        className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-10 text-sm outline-none transition-all appearance-none cursor-pointer ${
                          errors.partnerYear ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                        }`}
                      >
                        <option value="" disabled>Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                    {errors.partnerYear && <span className="text-red-500 text-xs font-semibold">{errors.partnerYear}</span>}
                  </div>

                  {/* Partner Mobile */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Partner Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <i className="fa-solid fa-phone absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                      <input
                        type="tel"
                        name="partnerMobile"
                        value={formData.partnerMobile}
                        onChange={handleInputChange}
                        placeholder="10-digit number"
                        className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                          errors.partnerMobile ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                        }`}
                      />
                    </div>
                    {errors.partnerMobile && <span className="text-red-500 text-xs font-semibold">{errors.partnerMobile}</span>}
                  </div>

                  {/* Partner Email */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Partner Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <i className="fa-solid fa-envelope absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                      <input
                        type="email"
                        name="partnerEmail"
                        value={formData.partnerEmail}
                        onChange={handleInputChange}
                        placeholder="e.g. partner@college.edu"
                        className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                          errors.partnerEmail ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                        }`}
                      />
                    </div>
                    {errors.partnerEmail && <span className="text-red-500 text-xs font-semibold">{errors.partnerEmail}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Next action button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 text-white font-semibold text-lg py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                Next: Proceed to Payment <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Payment & Screenshot Upload */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h3 className="font-outfit text-xl font-bold text-slate-900 dark:text-white mb-1">
                Payment details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Pay using the UPI details below and upload verification details
              </p>

              <div className="bg-slate-50 dark:bg-[#1a2744]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
                {/* fee summary */}
                <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-4 mb-6">
                  <span className="font-outfit font-bold text-slate-900 dark:text-white text-lg">Entry Fee Amount</span>
                  <span className="font-outfit text-3xl font-extrabold text-green-500 dark:text-green-400">
                    ₹{gameCategory === 'doubles' ? '150' : '100'}
                  </span>
                </div>

                {/* QR and details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 flex flex-col items-center gap-2">
                    <div className="bg-white p-2 rounded-xl shadow-md w-44 h-44 flex items-center justify-center relative border border-slate-100">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="Scan to Pay UPI QR Code" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-blue-500"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                      <i className="fa-solid fa-qrcode"></i> Scan with any UPI App
                    </p>
                  </div>

                  <div className="md:col-span-8 flex flex-col gap-4">
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">UPI ID</span>
                      <div className="flex items-center justify-between bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl">
                        <code className="font-mono font-bold text-slate-950 dark:text-slate-50">{DEFAULT_UPI_ID}</code>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="text-blue-500 hover:scale-105 active:scale-95 p-1 transition-transform"
                          title="Copy UPI ID"
                        >
                          <i className="fa-solid fa-copy"></i>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payee Name</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{DEFAULT_PAYEE_NAME}</span>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-3 rounded-xl flex gap-3 text-xs text-slate-600 dark:text-slate-400 text-left">
                      <i className="fa-solid fa-circle-info text-blue-500 text-sm mt-0.5"></i>
                      <span>Scan the QR code to auto-fill the exact amount (₹100 / ₹150) for fast verification!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs verification */}
            <div className="grid grid-cols-1 gap-5">
              {/* UTR Input */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  UPI Transaction ID / Ref No (12-digit UTR) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-receipt absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                  <input
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleInputChange}
                    placeholder="e.g. 612345678901"
                    className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                      errors.transactionId ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                    }`}
                  />
                </div>
                <span className="text-xs text-slate-400">Exactly 12 numeric digits from UPI transaction confirmation screen.</span>
                {errors.transactionId && <span className="text-red-500 text-xs font-semibold">{errors.transactionId}</span>}
              </div>

              {/* Screenshot Upload */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Payment Screenshot Upload <span className="text-red-500">*</span>
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a2744]/40 hover:border-blue-500/50'
                  } ${errors.screenshotFile ? 'border-red-500 bg-red-500/5' : ''}`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {!screenshot.base64 ? (
                    <div className="flex flex-col items-center gap-2">
                      <i className="fa-solid fa-cloud-arrow-up text-3xl text-blue-500 mb-1"></i>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        Drag & Drop payment screenshot, or <span className="text-blue-500 underline">Browse</span>
                      </p>
                      <p className="text-xs text-slate-400">PNG, JPG or JPEG (Max 4MB)</p>
                    </div>
                  ) : (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-between bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <i className="fa-regular fa-image text-2xl text-blue-500"></i>
                        <div className="flex flex-col max-w-[200px] sm:max-w-md">
                          <span className="text-xs font-semibold truncate text-slate-900 dark:text-white">{screenshot.name}</span>
                          <span className="text-[10px] text-slate-400">{screenshot.sizeStr}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveScreenshot}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500/10 text-red-500 transition-colors"
                        title="Remove file"
                      >
                        <i className="fa-solid fa-xmark text-lg"></i>
                      </button>
                    </div>
                  )}
                </div>
                {errors.screenshotFile && <span className="text-red-500 text-xs font-semibold">{errors.screenshotFile}</span>}
              </div>
            </div>

            {/* Back & Submit buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-full sm:w-1/3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <i className="fa-solid fa-arrow-left"></i> Edit Details
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full sm:w-2/3 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 text-white font-semibold text-lg py-4 rounded-xl shadow-lg hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Verifying & Saving...
                  </>
                ) : (
                  <>Submit Registration & Verify</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Modal Overlay */}
      {statusModal.visible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-zoom-in">
            <div className="text-6xl mb-6">
              {statusModal.success ? (
                <i className="fa-solid fa-circle-check text-green-500"></i>
              ) : (
                <i className="fa-solid fa-circle-xmark text-red-500"></i>
              )}
            </div>
            <h4 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
              {statusModal.title}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              {statusModal.message}
            </p>
            <button
              type="button"
              onClick={() => setStatusModal({ ...statusModal, visible: false })}
              className="bg-blue-500 dark:bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:brightness-105 active:scale-95 transition-all w-full"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
