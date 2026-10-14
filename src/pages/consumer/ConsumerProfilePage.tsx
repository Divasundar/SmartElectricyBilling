import React, { useState } from 'react';
import { User, Phone, Bell, Save, Check } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../lib/utils';

export const ConsumerProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState(currentUser?.email || 'rahul@smartbilling.com');
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [emailInvoices, setEmailInvoices] = useState(true);
  const [outageAlerts, setOutageAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const displayName = currentUser?.name || 'Rahul Kumar';
  const displayConsumerId = currentUser?.consumerId || 'C10234';

  return (
    <AppShell>
      <PageHeader
        title="Account & Profile"
        subtitle="View electricity connection details and configure alert preferences."
        breadcrumb={['Consumer', 'Profile']}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Connection Details Bento */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bento-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center font-bold text-lg text-gray-900">
                {getInitials(displayName)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{displayName}</h3>
                <span className="badge badge-success mt-0.5">Active Consumer</span>
              </div>
            </div>

            <div className="space-y-3 text-xs border-t border-gray-100 pt-3">
              <div>
                <span className="text-gray-500 uppercase tracking-wider text-[10px] font-semibold block">Consumer ID</span>
                <span className="font-mono font-medium text-gray-900 text-sm">{displayConsumerId}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-wider text-[10px] font-semibold block">Meter Serial Number</span>
                <span className="font-mono font-medium text-gray-900 text-sm">MTR-BLR-00124</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-wider text-[10px] font-semibold block">Tariff Category</span>
                <span className="font-medium text-gray-900 text-sm">Residential (LT-1)</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-wider text-[10px] font-semibold block">Sanctioned Load</span>
                <span className="font-medium text-gray-900 text-sm">5.0 kW (Single Phase)</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-wider text-[10px] font-semibold block">Discom Substation / Feeder</span>
                <span className="font-medium text-gray-900 text-sm">Indiranagar 11kV Substation #3</span>
              </div>
            </div>
          </div>

          {/* Support / Helpline Card */}
          <div className="bento-card bg-gray-900 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Phone size={16} className="text-accent" />
              <h4 className="font-bold text-sm">24x7 Electricity Helpline</h4>
            </div>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Facing outage, voltage fluctuations, or meter faults? Call your local DISCOM line:
            </p>
            <p className="text-xl font-bold font-mono text-accent">1912</p>
            <p className="text-[11px] text-gray-400 mt-1">Toll-free emergency helpline</p>
          </div>
        </div>

        {/* Contact info and Notification settings */}
        <div className="lg:col-span-2 space-y-5">
          <form onSubmit={handleSave} className="bento-card">
            <h3 className="section-title mb-4 flex items-center gap-2">
              <User size={16} className="text-gray-500" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  disabled
                  className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Supply Premises Address
                </label>
                <textarea
                  rows={2}
                  disabled
                  defaultValue="12, MG Road, Bangalore - 560001"
                  className="input-field bg-gray-50 text-gray-500 cursor-not-allowed resize-none"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 mt-5">
              <h3 className="section-title mb-4 flex items-center gap-2">
                <Bell size={16} className="text-gray-500" />
                Alerts & Communications
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-gray-900">SMS Bill Due Alerts</p>
                    <p className="text-xs text-gray-500">Receive SMS 3 days before due date</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={e => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-accent"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-gray-900">WhatsApp Monthly Invoices</p>
                    <p className="text-xs text-gray-500">Get PDF bill copy directly on WhatsApp</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={e => setWhatsappAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-accent"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                    <p className="text-xs text-gray-500">Payment receipts and monthly statement summaries</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailInvoices}
                    onChange={e => setEmailInvoices(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-accent"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Power Outage & Maintenance Broadcasts</p>
                    <p className="text-xs text-gray-500">Advance notices about grid maintenance in your sector</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={outageAlerts}
                    onChange={e => setOutageAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-accent"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-5 mt-5 border-t border-gray-100">
              <Button variant="primary" type="submit" id="save-profile-btn">
                {saved ? (
                  <>
                    <Check size={14} className="text-emerald-700" />
                    Saved Successfully
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
};
