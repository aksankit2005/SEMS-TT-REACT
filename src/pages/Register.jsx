import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwQBRLpFgY0Q9QyDjntvbVdRmcxtmuG_lZI86WhtMFT6QhpPhfRequlQ_I4uZm3vEnhaA/exec";
// Replace this with your actual Razorpay Key ID locally in this file!
const RAZORPAY_KEY_ID = "rzp_live_TDL9OG0BrV1qDp";

export const Register = () => {
  const { showToast } = useToast();
  
  // Step indicator state: 1 = Details, 2 = Payment
  const [currentStep, setCurrentStep] = useState(1);

  // State variables
  const [gameCategory, setGameCategory] = useState('singles');
  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    aadhaarNumber: '',
    collegeName: '',
    course: '',
    year: '',
    gender: '',
    mobileNumber: '',
    emailAddress: '',
    partnerName: '',
    partnerRollNumber: '',
    partnerAadhaar: '',
    partnerCollege: '',
    partnerCourse: '',
    partnerYear: '',
    partnerMobile: '',
    partnerEmail: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [statusModal, setStatusModal] = useState({
    visible: false,
    success: false,
    title: '',
    message: ''
  });

  // Handle Text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Numeric-only filter for Aadhaar Card Number
    if (name === "aadhaarNumber" || name === "partnerAadhaar") {
      const numericValue = value.replace(/\D/g, '').slice(0, 12);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear validation error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const tempErrors = {};
    const phonePattern = /^[6-9]\d{9}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const aadhaarPattern = /^\d{12}$/;

    if (!formData.fullName.trim()) tempErrors.fullName = "Full Name is required";
    if (!formData.rollNumber.trim()) tempErrors.rollNumber = "Roll Number is required";
    if (!formData.collegeName.trim()) tempErrors.collegeName = "College Name is required";
    if (!formData.course.trim()) tempErrors.course = "Course is required";
    if (!formData.year) tempErrors.year = "Year of study is required";
    if (!formData.gender) tempErrors.gender = "Gender is required";
    
    if (!formData.aadhaarNumber.trim()) {
      tempErrors.aadhaarNumber = "Aadhaar Card Number is required";
    } else if (!aadhaarPattern.test(formData.aadhaarNumber.trim())) {
      tempErrors.aadhaarNumber = "Aadhaar must be exactly 12 numeric digits";
    }
    
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
      if (!formData.partnerCourse.trim()) tempErrors.partnerCourse = "Partner Course is required";
      if (!formData.partnerYear) tempErrors.partnerYear = "Partner Year is required";
      
      if (!formData.partnerAadhaar.trim()) {
        tempErrors.partnerAadhaar = "Partner Aadhaar Card Number is required";
      } else if (!aadhaarPattern.test(formData.partnerAadhaar.trim())) {
        tempErrors.partnerAadhaar = "Partner Aadhaar must be exactly 12 numeric digits";
      }
      
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

  // Submit Handler (Launches Razorpay checkout)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (RAZORPAY_KEY_ID === "YOUR_RAZORPAY_KEY_ID") {
      showToast("Razorpay Key ID is not configured. Please add your Key ID inside Register.jsx.", "error");
      return;
    }

    setLoading(true);
    const amount = gameCategory === 'doubles' ? 200 : 100;
    
    try {
      // 1. Request Razorpay Order ID from Google Apps Script Backend
      const orderResponse = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          action: "createOrder",
          amount: amount,
          rollNumber: formData.rollNumber
        })
      });
      
      const orderResult = await orderResponse.json();
      if (orderResult.status !== "success") {
        throw new Error(orderResult.message || "Failed to create payment order");
      }
      
      const orderId = orderResult.orderId;

      // 2. Configure and Open Razorpay Checkout overlay
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount * 100, // amount in paise
        currency: "INR",
        name: "SEMS Championship",
        description: `Registration Fee - ${gameCategory.toUpperCase()}`,
        image: "/logo.png",
        order_id: orderId,
        handler: async function (response) {
          // This callback runs only after successful checkout completion
          try {
            setLoading(true);
            
            // Send payment signature details to Apps Script backend to verify and write to sheet
            const verifyResponse = await fetch(GOOGLE_SCRIPT_URL, {
              method: "POST",
              headers: {
                "Content-Type": "text/plain;charset=utf-8"
              },
              body: JSON.stringify({
                ...formData,
                branch: formData.course,
                partnerBranch: formData.partnerCourse,
                section: "",
                partnerSection: "",
                gameCategory: gameCategory,
                action: "register",
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });
            
            const verifyResult = await verifyResponse.json();
            if (verifyResult.status === "success") {
              setStatusModal({
                visible: true,
                success: true,
                title: "Registration Verified!",
                message: `Congratulations! Your payment has been captured (ID: ${response.razorpay_payment_id}) and registration details saved successfully.`
              });
              
              // Reset state forms
              setFormData({
                fullName: '', rollNumber: '', aadhaarNumber: '', collegeName: '', course: '', year: '', gender: '', mobileNumber: '', emailAddress: '',
                partnerName: '', partnerRollNumber: '', partnerAadhaar: '', partnerCollege: '', partnerCourse: '', partnerYear: '', partnerMobile: '', partnerEmail: ''
              });
              setCurrentStep(1);
            } else {
              throw new Error(verifyResult.message || "Payment signature verification failed.");
            }
          } catch (error) {
            showToast(error.message || "Verification failed.", "error");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.emailAddress,
          contact: formData.mobileNumber
        },
        theme: { color: "#3B82F6" }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        showToast(`Payment failed: ${response.error.description}`, "error");
        setLoading(false);
      });

      rzp.open();
      
    } catch (err) {
      console.error(err);
      showToast(err.message || "An error occurred initiating checkout", "error");
      setLoading(false);
    }
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
                      <span className="text-sm font-semibold text-blue-500 dark:text-blue-400">₹200</span>
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

                {/* Aadhaar Card Number */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Aadhaar Card Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-solid fa-fingerprint absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                    <input
                      type="text"
                      name="aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 123456789012"
                      maxLength="12"
                      className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                        errors.aadhaarNumber ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                      }`}
                    />
                  </div>
                  {errors.aadhaarNumber && <span className="text-red-500 text-xs font-semibold">{errors.aadhaarNumber}</span>}
                </div>

                {/* College Name Dropdown */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    College Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center after:content-['\f107'] after:font-black after:font-['Font_Awesome_6_Free'] after:absolute after:right-4 after:text-slate-400 after:pointer-events-none">
                    <i className="fa-solid fa-school absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                    <select
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-10 text-sm outline-none transition-all appearance-none cursor-pointer ${
                        errors.collegeName ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                      }`}
                    >
                      <option value="" disabled>Select College</option>
                      <option value="MPEC">MPEC</option>
                      <option value="MIPS">MIPS</option>
                      <option value="MPCPS (KN142)">MPCPS (KN142)</option>
                      <option value="MPCP">MPCP</option>
                      <option value="MPCPS Pharmacy">MPCPS Pharmacy</option>
                      <option value="MPDC">MPDC</option>
                      <option value="MPCN & PS">MPCN & PS</option>
                      <option value="MPAMC">MPAMC</option>
                      <option value="MPCAMS">MPCAMS</option>
                    </select>
                  </div>
                  {errors.collegeName && <span className="text-red-500 text-xs font-semibold">{errors.collegeName}</span>}
                </div>

                {/* Course */}
                <div className="flex flex-col gap-1.5 text-left sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-solid fa-graduation-cap absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      placeholder="e.g. B.Tech Computer Science"
                      className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                        errors.course ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                      }`}
                    />
                  </div>
                  {errors.course && <span className="text-red-500 text-xs font-semibold">{errors.course}</span>}
                </div>

                {/* Year Dropdown */}
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
                      <option value="5th Year">5th Year</option>
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

            {/* STEP 1.5: Doubles Team Partner Details */}
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

                  {/* Partner Aadhaar Card Number */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Partner Aadhaar Card Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <i className="fa-solid fa-fingerprint absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                      <input
                        type="text"
                        name="partnerAadhaar"
                        value={formData.partnerAadhaar}
                        onChange={handleInputChange}
                        placeholder="e.g. 987654321098"
                        maxLength="12"
                        className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                          errors.partnerAadhaar ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                        }`}
                      />
                    </div>
                    {errors.partnerAadhaar && <span className="text-red-500 text-xs font-semibold">{errors.partnerAadhaar}</span>}
                  </div>

                  {/* Partner College Name Dropdown */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Partner College Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center after:content-['\f107'] after:font-black after:font-['Font_Awesome_6_Free'] after:absolute after:right-4 after:text-slate-400 after:pointer-events-none">
                      <i className="fa-solid fa-school absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                      <select
                        name="partnerCollege"
                        value={formData.partnerCollege}
                        onChange={handleInputChange}
                        className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-10 text-sm outline-none transition-all appearance-none cursor-pointer ${
                          errors.partnerCollege ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                        }`}
                      >
                        <option value="" disabled>Select College</option>
                        <option value="MPEC">MPEC</option>
                        <option value="MIPS">MIPS</option>
                        <option value="MPCPS (KN142)">MPCPS (KN142)</option>
                        <option value="MPCP">MPCP</option>
                        <option value="MPCPS Pharmacy">MPCPS Pharmacy</option>
                        <option value="MPDC">MPDC</option>
                        <option value="MPCN & PS">MPCN & PS</option>
                        <option value="MPAMC">MPAMC</option>
                        <option value="MPCAMS">MPCAMS</option>
                      </select>
                    </div>
                    {errors.partnerCollege && <span className="text-red-500 text-xs font-semibold">{errors.partnerCollege}</span>}
                  </div>

                  {/* Partner Course */}
                  <div className="flex flex-col gap-1.5 text-left sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Partner Course <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <i className="fa-solid fa-graduation-cap absolute left-4 text-slate-400 dark:text-slate-500 text-sm"></i>
                      <input
                        type="text"
                        name="partnerCourse"
                        value={formData.partnerCourse}
                        onChange={handleInputChange}
                        placeholder="e.g. B.Tech Computer Science"
                        className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                          errors.partnerCourse ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                        }`}
                      />
                    </div>
                    {errors.partnerCourse && <span className="text-red-500 text-xs font-semibold">{errors.partnerCourse}</span>}
                  </div>

                  {/* Partner Year Dropdown */}
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
                        <option value="5th Year">5th Year</option>
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
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 text-white font-semibold text-lg py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Next: Proceed to Payment <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Razorpay Payment Integration */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h3 className="font-outfit text-xl font-bold text-slate-900 dark:text-white mb-1">
                Payment details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Complete your registration using our secure payment gateway
              </p>

              <div className="bg-slate-50 dark:bg-[#1a2744]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 mb-6">
                {/* Fee Summary */}
                <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-4 mb-6">
                  <span className="font-outfit font-bold text-slate-950 dark:text-slate-100 text-lg">Entry Fee Amount</span>
                  <span className="font-outfit text-3xl font-extrabold text-green-500 dark:text-green-400">
                    ₹{gameCategory === 'doubles' ? '200' : '100'}
                  </span>
                </div>

                {/* Gateway visual detail */}
                <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-3xl shadow-sm">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <h4 className="font-outfit font-bold text-slate-900 dark:text-white text-base">
                    Secure Payment Gateway
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                    Powered by Razorpay. Pay instantly with UPI, Cards, Netbanking, or Wallets. Your registration will verify automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Back & Submit buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-full sm:w-1/3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-arrow-left"></i> Edit Details
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full sm:w-2/3 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 text-white font-semibold text-lg py-4 rounded-xl shadow-lg hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Processing Checkout...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-credit-card"></i> Pay & Register Now
                  </>
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
              className="bg-blue-500 dark:bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:brightness-105 active:scale-95 transition-all w-full cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

