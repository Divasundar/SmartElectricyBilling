import React, { useState } from 'react';
import { Bell, User, Lock, Monitor, Save } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';

type SettingsTab = 'profile' | 'account' | 'notifications' | 'preferences';

const Toggle: React.FC<{ label: string; desc?: string; defaultChecked?: boolean }> = ({
  label, desc, defaultChecked = false,
}) => {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => setOn(!on)}
        role="switch"
        aria-checked={on}
        aria-label={label}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${on ? 'bg-accent' : 'bg-gray-200'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User size={15} /> },
    { id: 'account', label: 'Account', icon: <Lock size={15} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'preferences', label: 'Preferences', icon: <Monitor size={15} /> },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Settings"
        subtitle="Manage your account settings and application preferences."
        breadcrumb={['Admin', 'Settings']}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar tabs */}
        <div className="bento-card h-fit">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent-muted text-accent'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                id={`settings-tab-${tab.id}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          {activeTab === 'profile' && (
            <div className="bento-card">
              <h2 className="section-title mb-5">Profile Information</h2>
              <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
                  <span className="text-xl font-bold text-accent">RN</span>
                </div>
                <div>
                  <Button variant="secondary" size="sm">Change Photo</Button>
                  <p className="text-xs text-gray-400 mt-1.5">JPG, PNG. Max 2MB</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" defaultValue="Rajesh" id="settings-first-name" />
                <Input label="Last Name" defaultValue="Nair" id="settings-last-name" />
                <Input label="Email" type="email" defaultValue="rajesh.nair@smartbilling.in" id="settings-email" />
                <Input label="Phone" defaultValue="+91 98450 12345" id="settings-phone" />
                <div className="md:col-span-2">
                  <label className="input-label">Bio / Notes</label>
                  <textarea
                    className="input resize-none"
                    rows={3}
                    defaultValue="System Administrator — Smart Billing"
                    id="settings-bio"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="primary"><Save size={14} />Save Profile</Button>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="bento-card">
              <h2 className="section-title mb-5">Security & Account</h2>
              <div className="space-y-4 max-w-md">
                <Input label="Current Password" type="password" placeholder="Enter current password" id="settings-current-pw" />
                <Input label="New Password" type="password" placeholder="Enter new password" id="settings-new-pw" />
                <Input label="Confirm New Password" type="password" placeholder="Confirm new password" id="settings-confirm-pw" />
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="primary">Update Password</Button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Two-Factor Authentication</h3>
                <Toggle label="Enable 2FA via Email OTP" desc="Receive OTP to email on every login" />
                <Toggle label="Enable 2FA via SMS" desc="Receive OTP to mobile on every login" />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bento-card">
              <h2 className="section-title mb-5">Notification Preferences</h2>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Email Notifications</p>
                <Toggle label="Bill Generation" desc="Notify when bills are generated" defaultChecked />
                <Toggle label="Payment Received" desc="Notify on successful payments" defaultChecked />
                <Toggle label="Overdue Bills" desc="Daily digest of overdue bills" defaultChecked />
                <Toggle label="Faulty Meter Alerts" desc="Immediate alert on meter faults" defaultChecked />
                <Toggle label="New Consumer Registration" desc="Notify on new consumer onboarding" />
              </div>
              <div className="space-y-1 mt-6">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">In-App Notifications</p>
                <Toggle label="System Announcements" defaultChecked />
                <Toggle label="Daily Summary" desc="Daily report summary at 8 PM" defaultChecked />
                <Toggle label="Monthly Reports" desc="Auto-generate monthly PDF report" />
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="primary">Save Preferences</Button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="bento-card">
              <h2 className="section-title mb-5">Application Preferences</h2>
              <div className="space-y-5">
                <Select
                  label="Date Format"
                  id="pref-date-format"
                  options={[
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (Indian Standard)' },
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US Format)' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO Format)' },
                  ]}
                />
                <Select
                  label="Currency Display"
                  id="pref-currency"
                  options={[
                    { value: 'INR', label: '₹ Indian Rupee (INR)' },
                  ]}
                />
                <Select
                  label="Bill Due Date (days after generation)"
                  id="pref-due-days"
                  options={[
                    { value: '15', label: '15 days' },
                    { value: '30', label: '30 days' },
                    { value: '45', label: '45 days' },
                  ]}
                />
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Interface</p>
                  <Toggle label="Compact Table View" desc="Show more rows by reducing padding" />
                  <Toggle label="Auto-refresh Dashboard" desc="Refresh dashboard every 60 seconds" defaultChecked />
                  <Toggle label="Show Consumption in Chart by Default" defaultChecked />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="primary">Save Preferences</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
