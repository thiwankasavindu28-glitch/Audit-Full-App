import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Lock, Bell, FileText, Save, Eye, EyeOff, Award, Calendar, TrendingDown, Sun, Moon } from 'lucide-react'; // <-- 1. Add Sun/Moon
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // <-- 2. Import useTheme
import api from '../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    auditComplete: true, weeklyReport: true, errorThreshold: false, emailReports: true
  });
  
  const { auditor, loading } = useAuth();
  const { theme, toggleTheme } = useTheme(); // <-- 3. Use the theme context
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  
  // ... (useEffect and other functions are unchanged) ...
  
    useEffect(() => {
    if (auditor) {
      setFormData({
        name: auditor.name || '',
        email: auditor.email || '',
        phone: auditor.phone || '' 
      });
    }
  }, [auditor]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/me', formData);
      alert('Profile updated!');
    } catch (err) {
      console.error("Failed to update profile", err);
      alert('Error updating profile.');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = e.target.elements;
    
    if (newPassword.value !== confirmPassword.value) {
        alert("New passwords do not match!");
        return;
    }
    
    try {
        await api.put('/auth/password', {
            currentPassword: currentPassword.value,
            newPassword: newPassword.value
        });
        alert('Password updated successfully!');
        e.target.reset();
    } catch (err) {
        console.error("Failed to update password", err);
        alert('Error updating password. Is your current password correct?');
    }
  };


  if (loading || !auditor) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                {/* ... (header content) ... */}
             </div>
           </div>
         </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            {/* --- 4. Add Theme styles and new Theme button --- */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 dark:bg-slate-800 dark:border-slate-700">
              <nav className="space-y-2">
                 <button 
                   onClick={() => setActiveTab('profile')} 
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${activeTab === 'profile' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                 >
                   <User size={20} /> Profile
                 </button>
                 <button 
                   onClick={() => setActiveTab('security')} 
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${activeTab === 'security' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                 >
                   <Lock size={20} /> Security
                 </button>
                 <button 
                   onClick={() => setActiveTab('theme')} 
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${activeTab === 'theme' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                 >
                   {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />} Theme
                 </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 dark:text-white">Profile Information</h2>
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 dark:text-white">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Full Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                  {/* ... (Work Info - mostly disabled fields) ... */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg">
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordUpdate} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 dark:text-white">Security Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Current Password</label>
                    <input name="currentPassword" type="password" required className="w-full px-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">New Password</label>
                    <input name="newPassword" type="password" required className="w-full px-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Confirm New Password</label>
                    <input name="confirmPassword" type="password" required className="w-full px-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                  </div>
                </div>
                {/* ... (Password Requirements JSX) ... */}
                <div className="pt-6 border-t border-slate-200 mt-6 dark:border-slate-700">
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg">
                    Update Password
                  </button>
                </div>
              </form>
            )}
            
            {/* --- 5. Add the new Theme settings panel --- */}
            {activeTab === 'theme' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 dark:text-white">Theme Settings</h2>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-slate-700 dark:text-slate-300">Dark Mode</span>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                      theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-slate-500 mt-2 dark:text-slate-400">
                  Current mode: <span className="font-semibold">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;