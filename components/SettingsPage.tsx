import React, { useState, useEffect } from 'react';
import { User, Palette, Bell, Shield, Save, Loader2, Camera, Moon, Sun, Monitor, Check, Mail, Smartphone, AlertTriangle, Clock, Key, LogOut, Trash2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';

type TabKey = 'profile' | 'appearance' | 'notifications' | 'security';

interface UserProfile {
    name: string;
    email: string;
    company: string;
    role: string;
    avatar: string;
}

interface NotificationSettings {
    emailNotifications: boolean;
    pushNotifications: boolean;
    lowStockAlerts: boolean;
    jobUpdates: boolean;
    systemAlerts: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
}

export const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<TabKey>('profile');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Profile State
    const [profile, setProfile] = useState<UserProfile>({
        name: 'Admin User',
        email: 'admin@hvachub.com',
        company: 'HVAC Solutions Inc.',
        role: 'Administrator',
        avatar: ''
    });

    // Notification Settings
    const [notifications, setNotifications] = useState<NotificationSettings>({
        emailNotifications: true,
        pushNotifications: true,
        lowStockAlerts: true,
        jobUpdates: true,
        systemAlerts: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00'
    });

    // Security State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    // Load saved settings
    useEffect(() => {
        const savedProfile = localStorage.getItem('hvachub-profile');
        const savedNotifications = localStorage.getItem('hvachub-notifications');
        if (savedProfile) setProfile(JSON.parse(savedProfile));
        if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        localStorage.setItem('hvachub-profile', JSON.stringify(profile));
        localStorage.setItem('hvachub-notifications', JSON.stringify(notifications));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
        { key: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
        { key: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
        { key: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        { key: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> }
    ];

    const themeOptions: { value: 'dark' | 'light' | 'system'; label: string; icon: React.ReactNode }[] = [
        { value: 'dark', label: 'Dark', icon: <Moon className="w-5 h-5" /> },
        { value: 'light', label: 'Light', icon: <Sun className="w-5 h-5" /> },
        { value: 'system', label: 'System', icon: <Monitor className="w-5 h-5" /> }
    ];

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-slate-400 mt-1">Manage your account preferences and settings</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 bg-slate-800/50 p-1.5 rounded-xl">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>

                        {/* Avatar */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white">
                                    {profile.name.charAt(0)}
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-slate-800 rounded-full border border-slate-600 hover:bg-slate-700 transition-colors">
                                    <Camera className="w-4 h-4 text-white" />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white">{profile.name}</h3>
                                <p className="text-slate-400">{profile.role}</p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
                                <input
                                    type="text"
                                    value={profile.company}
                                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                                <input
                                    type="text"
                                    value={profile.role}
                                    disabled
                                    className="w-full px-4 py-3 bg-slate-800/30 border border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Appearance</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-3">Theme</label>
                            <div className="grid grid-cols-3 gap-3">
                                {themeOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setTheme(option.value)}
                                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === option.value
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-full ${theme === option.value ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                            {option.icon}
                                        </div>
                                        <span className={`text-sm font-medium ${theme === option.value ? 'text-blue-400' : 'text-slate-400'}`}>
                                            {option.label}
                                        </span>
                                        {theme === option.value && (
                                            <Check className="w-4 h-4 text-blue-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Notification Preferences</h2>

                        {/* Notification Channels */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">Channels</h3>

                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-white font-medium">Email Notifications</p>
                                        <p className="text-slate-500 text-sm">Receive updates via email</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })}
                                    className={`w-12 h-6 rounded-full transition-colors ${notifications.emailNotifications ? 'bg-blue-500' : 'bg-slate-600'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${notifications.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-white font-medium">Push Notifications</p>
                                        <p className="text-slate-500 text-sm">Receive push notifications</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setNotifications({ ...notifications, pushNotifications: !notifications.pushNotifications })}
                                    className={`w-12 h-6 rounded-full transition-colors ${notifications.pushNotifications ? 'bg-blue-500' : 'bg-slate-600'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${notifications.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Alert Types */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">Alert Types</h3>

                            {[
                                { key: 'lowStockAlerts', label: 'Low Stock Alerts', icon: <AlertTriangle className="w-5 h-5" /> },
                                { key: 'jobUpdates', label: 'Job Updates', icon: <Check className="w-5 h-5" /> },
                                { key: 'systemAlerts', label: 'System Alerts', icon: <Bell className="w-5 h-5" /> }
                            ].map(item => (
                                <label key={item.key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800/70 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-400">{item.icon}</span>
                                        <span className="text-white">{item.label}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications[item.key as keyof NotificationSettings] as boolean}
                                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                                    />
                                </label>
                            ))}
                        </div>

                        {/* Quiet Hours */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-white font-medium">Quiet Hours</p>
                                        <p className="text-slate-500 text-sm">Pause notifications during specific hours</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setNotifications({ ...notifications, quietHoursEnabled: !notifications.quietHoursEnabled })}
                                    className={`w-12 h-6 rounded-full transition-colors ${notifications.quietHoursEnabled ? 'bg-blue-500' : 'bg-slate-600'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${notifications.quietHoursEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            {notifications.quietHoursEnabled && (
                                <div className="flex items-center gap-4 ml-8">
                                    <input
                                        type="time"
                                        value={notifications.quietHoursStart}
                                        onChange={(e) => setNotifications({ ...notifications, quietHoursStart: e.target.value })}
                                        className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                                    />
                                    <span className="text-slate-500">to</span>
                                    <input
                                        type="time"
                                        value={notifications.quietHoursEnd}
                                        onChange={(e) => setNotifications({ ...notifications, quietHoursEnd: e.target.value })}
                                        className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Security Settings</h2>

                        {/* Change Password */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                <Key className="w-4 h-4" />
                                Change Password
                            </h3>
                            <div className="space-y-3">
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                                />
                                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors">
                                    Update Password
                                </button>
                            </div>
                        </div>

                        {/* Two-Factor Auth */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-white font-medium">Two-Factor Authentication</p>
                                    <p className="text-slate-500 text-sm">Add an extra layer of security</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                className={`w-12 h-6 rounded-full transition-colors ${twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        {/* Active Sessions */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                <LogOut className="w-4 h-4" />
                                Active Sessions
                            </h3>
                            <div className="p-4 bg-slate-800/50 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">Current Session</p>
                                    <p className="text-slate-500 text-sm">Chrome on macOS • Active now</p>
                                </div>
                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">Current</span>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="border-t border-slate-700 pt-6">
                            <h3 className="text-sm font-medium text-red-400 uppercase tracking-wide flex items-center gap-2 mb-4">
                                <Trash2 className="w-4 h-4" />
                                Danger Zone
                            </h3>
                            <button className="px-6 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 font-medium rounded-xl transition-colors">
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all ${saved
                            ? 'bg-emerald-600'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25'
                        }`}
                >
                    {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : saved ? (
                        <>
                            <Check className="w-5 h-5" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
