
import React, { useState, useEffect } from 'react';
import { Member, MembershipTier, Gender, MemberStatus } from '../types';
import { THEME } from '../theme';
import { Modal } from './Modal';

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (member: Member) => void;
  initialData?: Member;
}

const MemberForm: React.FC<MemberFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<Member>>({
    fullName: '',
    nickname: '',
    club_id: '',
    email: '',
    phone: '',
    age: 21,
    gender: 'Male',
    tier: MembershipTier.BRONZE,
    status: 'Submitted',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        fullName: '',
        nickname: '',
        club_id: '',
        email: '',
        phone: '',
        age: 21,
        gender: 'Male',
        tier: MembershipTier.BRONZE,
        status: 'Submitted',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: Member = {
      id: initialData?.id || crypto.randomUUID(),
      joinDate: initialData?.joinDate || new Date().toISOString(),
      avatarUrl: initialData?.avatarUrl || `https://picsum.photos/150/150?random=${Math.random()}`,
      ...formData as Member
    };
    onSubmit(newMember);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Profile' : 'New Member'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Personal Details</h3>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Full Name</label>
            <input 
              required
              type="text" 
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600`}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Nickname</label>
            <input 
              type="text" 
              value={formData.nickname || ''}
              onChange={e => setFormData({...formData, nickname: e.target.value})}
              className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600`}
              placeholder="e.g. Kid Poker"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Age</label>
              <input 
                required
                type="number" 
                min="18"
                value={formData.age}
                onChange={e => setFormData({...formData, age: parseInt(e.target.value)})}
                className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Gender</label>
              <select 
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
                className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer`}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</h3>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input 
              required
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600`}
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Phone</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600`}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        {/* Membership Info */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Membership</h3>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Club ID</label>
            <input 
              type="text" 
              value={formData.club_id || ''}
              onChange={e => setFormData({...formData, club_id: e.target.value})}
              className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600`}
              placeholder="e.g. RFC-1001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Tier Status</label>
              <select 
                value={formData.tier}
                onChange={e => setFormData({...formData, tier: e.target.value as MembershipTier})}
                className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer`}
              >
                {Object.values(MembershipTier).map(tier => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Account Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as MemberStatus})}
                className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer`}
              >
                <option value="Submitted">Submitted</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Activated">Activated</option>
                <option value="Deactivated">Deactivated</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Notes</label>
            <textarea 
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none resize-none`}
              placeholder="Internal notes..."
            />
          </div>
        </div>

        <div className="pt-6">
          <button 
            type="submit" 
            className={`w-full ${THEME.buttonPrimary} font-bold text-lg py-4 rounded-xl transition-transform active:scale-[0.98]`}
          >
            {initialData ? 'Save Changes' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MemberForm;