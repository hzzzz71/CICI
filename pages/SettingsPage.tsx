import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SettingsPage: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handlePasswordReset = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match!");
            return;
        }
        // Simulate API call
        setTimeout(() => {
            setSuccessMsg("Your password has been successfully updated.");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setSuccessMsg(''), 3000);
        }, 500);
    };

    return (
        <div className="flex-grow flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl space-y-8">
                <nav className="flex items-center text-sm text-stone-500 mb-6">
                    <Link to="/account" className="hover:text-primary transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Account
                    </Link>
                </nav>

                <h1 className="text-2xl font-bold tracking-tight text-stone-900">Account Settings</h1>

                <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-stone-900 mb-1">Password & Security</h2>
                        <p className="text-sm text-stone-500">Ensure your account is using a long, random password to stay secure.</p>
                    </div>

                    {successMsg && (
                        <div className="p-4 bg-green-50 text-green-700 text-sm font-medium rounded-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            {successMsg}
                        </div>
                    )}

                    <form onSubmit={handlePasswordReset} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-stone-700">Current Password</label>
                            <input 
                                type="password" 
                                required 
                                className="w-full h-11 px-4 rounded-lg border-stone-200 text-sm focus:ring-primary focus:border-primary transition-colors"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-stone-700">New Password</label>
                                <input 
                                    type="password" 
                                    required 
                                    className="w-full h-11 px-4 rounded-lg border-stone-200 text-sm focus:ring-primary focus:border-primary transition-colors"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-stone-700">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    required 
                                    className="w-full h-11 px-4 rounded-lg border-stone-200 text-sm focus:ring-primary focus:border-primary transition-colors"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="pt-2">
                            <button type="submit" className="bg-primary text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
