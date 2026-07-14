import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx6ZteLf4Bjg5UacdfYJqvT7kSRY0TDUq8ZfnHOHy-rgr9vZ_9p-nLBo2-MFZpYS9lgsA/exec";
const ADMIN_PASSCODE = "SEMS2026";

export const Admin = () => {
  const { showToast } = useToast();
  
  // Auth state
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Dashboard data state
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState('all');
  
  // Image preview modal state
  const [previewImage, setPreviewImage] = useState(null);

  // Authenticate login
  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode.trim() === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setLoginError('');
      fetchDatabase(); // Fetch data immediately after unlocking
    } else {
      setLoginError('Incorrect Access Key! Access Denied.');
      setPasscode('');
    }
  };

  // Fetch registrations from sheet Web App
  const fetchDatabase = async () => {
    setLoading(true);
    try {
      const url = `${GOOGLE_SCRIPT_URL}?action=read&passcode=${ADMIN_PASSCODE}`;
      const response = await fetch(url);
      const resJson = await response.json();
      
      if (resJson.status === "success") {
        setRegistrations(resJson.data || []);
        showToast("Database synced successfully!", "success");
      } else {
        throw new Error(resJson.message || "Failed to load database");
      }
    } catch (err) {
      console.error(err);
      showToast("Error syncing registration database.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp helper
  const formatTimestamp = (isoString) => {
    if (!isoString) return "N/A";
    try {
      const dateObj = new Date(isoString);
      return dateObj.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "N/A";
    }
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    if (registrations.length === 0) {
      showToast("No data available to export.", "error");
      return;
    }
    
    const headers = [
      "Timestamp", "Category", 
      "Primary Name", "Primary Roll No", "Primary College", "Primary Branch", "Primary Section", "Primary Year", "Primary Gender", "Primary Mobile", "Primary Email",
      "Partner Name", "Partner Roll No", "Partner College", "Partner Branch", "Partner Section", "Partner Year", "Partner Mobile", "Partner Email",
      "Transaction ID", "Screenshot URL"
    ];
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\r\n";
    
    registrations.forEach(row => {
      const line = [
        row.timestamp || "",
        row.gameCategory || "",
        row.fullName || "",
        row.rollNumber || "",
        row.collegeName || "",
        row.branch || "",
        row.section || "",
        row.year || "",
        row.gender || "",
        row.mobileNumber || "",
        row.emailAddress || "",
        row.partnerName || "",
        row.partnerRollNumber || "",
        row.partnerCollege || "",
        row.partnerBranch || "",
        row.partnerSection || "",
        row.partnerYear || "",
        row.partnerMobile || "",
        row.partnerEmail || "",
        row.transactionId || row.transactionID || "",
        row.screenshotUrl || row.screenshotURL || ""
      ];
      csvContent += line.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",") + "\r\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SEMS_TT_Registrations_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV file downloaded!", "success");
  };

  // Safe HTML output
  const sanitize = (val) => {
    if (val === undefined || val === null || val === "") return "";
    return String(val);
  };

  // Filter & Search logic
  const filteredRegistrations = registrations.filter(row => {
    const category = String(row.gameCategory || "").toLowerCase();
    const matchCategory = filterFormat === 'all' || category === filterFormat;
    
    const query = searchQuery.toLowerCase().trim();
    const utrStr = String(row.transactionId || row.transactionID || "");
    const roll = String(row.rollNumber || "");
    const pRoll = String(row.partnerRollNumber || "");
    
    const matchSearch = !query || 
      (row.fullName && row.fullName.toLowerCase().includes(query)) ||
      (roll && roll.toLowerCase().includes(query)) ||
      (row.partnerName && row.partnerName.toLowerCase().includes(query)) ||
      (pRoll && pRoll.toLowerCase().includes(query)) ||
      (utrStr && utrStr.toLowerCase().includes(query));
      
    return matchCategory && matchSearch;
  });

  // Calculate Metrics
  const totalCount = registrations.length;
  const singlesCount = registrations.filter(r => r.gameCategory && String(r.gameCategory).toLowerCase() === 'singles').length;
  const doublesCount = registrations.filter(r => r.gameCategory && String(r.gameCategory).toLowerCase() === 'doubles').length;
  const totalRevenue = (singlesCount * 100) + (doublesCount * 150);

  // Authentication View
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-lg transition-colors duration-300">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 dark:bg-blue-400/10 text-blue-500 dark:text-blue-400 text-xl flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-lock"></i>
          </div>
          <h2 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            Admin Verification
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Please enter the administrative access key to view database
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col gap-1 text-left">
              <div className="relative flex items-center">
                <i className="fa-solid fa-key absolute left-4 text-slate-400 dark:text-slate-500"></i>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Access Key"
                  className={`w-full bg-slate-50 dark:bg-[#1a2744] border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                    loginError ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-[#121d33]'
                  }`}
                />
              </div>
              {loginError && <span className="text-red-500 text-xs font-semibold mt-1">{loginError}</span>}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 text-white font-semibold py-3 rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-md"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="font-outfit text-3xl font-extrabold text-slate-900 dark:text-white">
            SEMS Admin Portal
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time statistics & tournament registrations database
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchDatabase}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121d33] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            <i className={`fa-solid fa-rotate ${loading ? 'fa-spin' : ''}`}></i> Refresh Data
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-blue-500/10"
          >
            <i className="fa-solid fa-file-excel"></i> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Regs */}
        <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-6 right-6 w-11 h-11 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-lg">
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="font-outfit text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            {totalCount}
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Total Registrations
          </div>
        </div>

        {/* Singles Count */}
        <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-6 right-6 w-11 h-11 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-lg">
            <i className="fa-solid fa-user"></i>
          </div>
          <div className="font-outfit text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            {singlesCount}
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Singles Events
          </div>
        </div>

        {/* Doubles Count */}
        <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-6 right-6 w-11 h-11 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center text-lg">
            <i className="fa-solid fa-user-group"></i>
          </div>
          <div className="font-outfit text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            {doublesCount}
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Doubles Teams
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-6 right-6 w-11 h-11 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center text-lg">
            <i className="fa-solid fa-indian-rupee-sign"></i>
          </div>
          <div className="font-outfit text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            ₹{totalRevenue}
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Total Revenue Collected
          </div>
        </div>
      </div>

      {/* Table controls search & filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex items-center w-full sm:max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-4 text-slate-400 dark:text-slate-500"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or roll number..."
            className="w-full bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-blue-500"
          />
        </div>

        <div className="relative w-full sm:w-48 after:content-['\f107'] after:font-black after:font-['Font_Awesome_6_Free'] after:absolute after:right-4 after:top-[14px] after:text-slate-400 after:pointer-events-none">
          <select
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
            className="w-full bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-4 pr-10 text-sm outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Formats</option>
            <option value="singles">Singles Only</option>
            <option value="doubles">Doubles Only</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#1a2744]/40 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold">
                <th className="p-4 whitespace-nowrap">Timestamp</th>
                <th className="p-4 whitespace-nowrap">Category</th>
                <th className="p-4 whitespace-nowrap">Player Details</th>
                <th className="p-4 whitespace-nowrap">Team Partner Details</th>
                <th className="p-4 whitespace-nowrap">Fee Paid</th>
                <th className="p-4 whitespace-nowrap">Transaction Details</th>
                <th className="p-4 whitespace-nowrap">Screenshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-center gap-2 font-semibold">
                      <i className="fa-solid fa-circle-notch fa-spin text-blue-500 text-xl"></i>
                      Fetching records from database...
                    </div>
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-500 dark:text-slate-400 font-semibold">
                    No registrations found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((row, idx) => {
                  const category = String(row.gameCategory || "").toLowerCase();
                  const utr = String(row.transactionId || row.transactionID || "");
                  const sUrl = row.screenshotUrl || row.screenshotURL;
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="p-4 align-top whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">
                        {formatTimestamp(row.timestamp)}
                      </td>
                      <td className="p-4 align-top whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-md uppercase ${
                          category === 'singles'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                        }`}>
                          {category || "N/A"}
                        </span>
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{sanitize(row.fullName)}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Roll: <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{sanitize(row.rollNumber)}</span>
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Coll: {sanitize(row.collegeName)} | Yr: {sanitize(row.year)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Mob: {sanitize(row.mobileNumber)} | Email: {sanitize(row.emailAddress)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        {category === 'doubles' && row.partnerName ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{sanitize(row.partnerName)}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Roll: <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{sanitize(row.partnerRollNumber)}</span>
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Coll: {sanitize(row.partnerCollege)} | Yr: {sanitize(row.partnerYear)}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Mob: {sanitize(row.partnerMobile)} | Email: {sanitize(row.partnerEmail)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">N/A (Singles)</span>
                        )}
                      </td>
                      <td className="p-4 align-top whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        ₹{category === 'doubles' ? '150' : '100'}
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono font-bold text-slate-950 dark:text-slate-50 text-sm tracking-wide">{utr}</span>
                          <span className="text-xs font-semibold text-green-500 flex items-center gap-1">
                            <i className="fa-solid fa-circle-check"></i> Submitted
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-top whitespace-nowrap">
                        {sUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(sUrl)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-500 dark:text-blue-400 font-semibold text-xs rounded-lg hover:bg-blue-500/10 hover:border-blue-500 transition-colors"
                          >
                            <i className="fa-regular fa-image"></i> View File
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">No File</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screenshot Preview Modal Overlay */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2100] flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-2xl p-2 max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-zoom-in">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121d33] text-slate-800 dark:text-slate-200 flex items-center justify-center hover:scale-105 active:scale-95 shadow-md transition-transform"
              title="Close Preview"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="overflow-auto max-h-[80vh] rounded-lg">
              <img src={previewImage} alt="Payment Screenshot Full Preview" className="max-w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
