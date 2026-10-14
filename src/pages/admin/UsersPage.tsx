import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { useAppState } from '../../hooks/useAppState';
import { formatDateTime, getInitials } from '../../lib/utils';
import type { UserRole } from '../../types';

export const UsersPage: React.FC = () => {
  const { users, addUser, updateUser } = useAppState();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [addOpen, setAddOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('BILLING_CLERK');

  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addUser({
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@smartbilling.in`,
      role,
      status: 'ACTIVE',
      phone: phone.trim() || '+91 99000 00000',
    });

    setName('');
    setEmail('');
    setPhone('');
    setRole('BILLING_CLERK');
    setAddOpen(false);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    updateUser(id, {
      status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="User Management"
        subtitle="Manage system users: Admins, Billing Clerks, and Consumers."
        breadcrumb={['Admin', 'Users']}
        actions={
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)} id="add-user-btn">
            <Plus size={14} />Add User
          </Button>
        }
      />

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { role: 'ADMIN', label: 'Admins', count: users.filter(u => u.role === 'ADMIN').length },
          { role: 'BILLING_CLERK', label: 'Billing Clerks', count: users.filter(u => u.role === 'BILLING_CLERK').length },
          { role: 'CONSUMER', label: 'Consumers', count: users.filter(u => u.role === 'CONSUMER').length },
        ].map(r => (
          <div key={r.role} className="bento-card text-center py-3">
            <p className="text-2xl font-bold text-gray-900">{r.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{r.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bento-card mb-5">
        <div className="flex gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name or email..."
            className="flex-1"
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="input text-sm w-40"
            aria-label="Filter by role"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="BILLING_CLERK">Billing Clerk</option>
            <option value="CONSUMER">Consumer</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bento-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table" aria-label="Users table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-accent">{getInitials(u.name)}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-sm text-gray-500">{u.email}</td>
                  <td><StatusBadge status={u.role} /></td>
                  <td className="text-sm text-gray-500">{u.phone ?? '—'}</td>
                  <td className="text-sm text-gray-500">{formatDateTime(u.lastLogin)}</td>
                  <td><StatusBadge status={u.status} /></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'text-red-500 hover:underline hover:bg-red-50'
                            : 'text-green-600 hover:underline hover:bg-green-50'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New User"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateUser}>Create User</Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Anita Sharma"
            id="user-name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="user@smartbilling.in"
            id="user-email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            label="Phone"
            placeholder="+91 XXXXX XXXXX"
            id="user-phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <Select
            label="Role"
            id="user-role"
            value={role}
            onChange={e => setRole(e.target.value as UserRole)}
            options={[
              { value: 'ADMIN', label: 'Administrator' },
              { value: 'BILLING_CLERK', label: 'Billing Clerk' },
              { value: 'CONSUMER', label: 'Consumer' },
            ]}
          />
        </form>
      </Modal>
    </AppShell>
  );
};
