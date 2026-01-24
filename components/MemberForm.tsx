
import React, { useState, useEffect } from 'react';
import { Member, MembershipTier, Gender, MemberStatus } from '../types';
import { THEME } from '../theme';
import { Modal } from './ui/Modal';
import { useLanguage } from '../contexts/LanguageContext';
import NumberInput from './ui/NumberInput';
import Button from './ui/Button';
import { Calendar, UserSquare2, Camera, ChevronDown, ChevronUp, Fingerprint, Globe } from 'lucide-react';

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (member: Member) => void;
  initialData?: Member;
}

const MOCK_ID_FRONT = 'https://www.ris.gov.tw/documents/data/apply-idCard/images/ddccc3f2-2aa9-4e92-9578-41d035af66ea.jpg';
const MOCK_ID_BACK = 'https://www.ris.gov.tw/documents/data/apply-idCard/images/4f3bafb8-502b-400f-ab63-a819044e2621.jpg';

const MemberForm: React.FC<MemberFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { t } = useLanguage();
  const [isPhotosExpanded, setIsPhotosExpanded] = useState(false);
  const [formData, setFormData] = useState<Partial<Member>>({
    fullName: '',
    nickname: '',
    club_id: '',
    email: '',
    phone: '',
    birthDate: '',
    age: 0,
    gender: 'Male',
    tier: MembershipTier.BRONZE,
    status: 'Submitted',
    notes: '',
    idNumber: '',
    passportNumber: '',
    idPhotoFrontUrl: MOCK_ID_FRONT,
    idPhotoBackUrl: MOCK_ID_BACK
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
        birthDate: '',
        age: 0,
        gender: 'Male',
        tier: MembershipTier.BRONZE,
        status: 'Submitted',
        notes: '',
        idNumber: '',
        passportNumber: '',
        idPhotoFrontUrl: MOCK_ID_FRONT,
        idPhotoBackUrl: MOCK_ID_BACK
      });
    }
    // Reset accordion state on open
    setIsPhotosExpanded(false);
  }, [initialData, isOpen]);

  const calculateAge = (dateString: string): number => {
    if (!dateString) return 0;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    const age = calculateAge(dateStr);
    setFormData(prev => ({ ...prev, birthDate: dateStr, age }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const newMember: Member = {
      id: initialData?.id || crypto.randomUUID(),
      joinDate: initialData?.joinDate || new Date().toISOString(),
      avatarUrl: initialData?.avatarUrl || `https://picsum.photos/150/150?random=${Math.random()}`,
      ...formData as Member
    };
    onSubmit(newMember);
    onClose();
  };

  // Basic validation: Name, Email, and Age >= 18
  const isAgeInvalid = (formData.age || 0) < 18;
  const isFormValid = !!formData.fullName && !!formData.email && !isAgeInvalid;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('members.form.titleEdit') : t('members.form.titleNew')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
        
        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('members.form.personal')}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">
                    {t('members.form.fullName')} <span className="text-red-500">*</span>
                </label>
                <input 
                required
                type="text" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600 ${!formData.fullName ? 'border-red-500/40 focus:border-red-500' : ''}`}
                placeholder="e.g. John Doe"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">{t('members.form.nickname')}</label>
                <input 
                type="text" 
                value={formData.nickname || ''}
                onChange={e => setFormData({...formData, nickname: e.target.value})}
                className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600`}
                placeholder="e.g. Kid Poker"
                />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Calendar size={14} /> Birth Date
                </label>
                <input 
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={handleDateChange}
                    className={`w-full ${THEME.input} rounded-xl px-4 py-2.5 outline-none transition-all [color-scheme:dark]`}
                />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">{t('members.form.age')}</label>
              <NumberInput
                value={formData.age}
                onChange={() => {}} // Read only
                disabled={true}
                isInvalid={isAgeInvalid}
                className="bg-[#1A1A1A] border-transparent"
              />
              {isAgeInvalid && (
                <p className="text-[10px] text-red-500 mt-1 font-bold">Must be 18+</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">{t('members.form.gender')}</label>
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

        {/* Identity Verification Section - Always Visible */}
        <div className="pt-4 border-t border-[#222] space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <UserSquare2 size={14} /> Identity Verification
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Fingerprint size={14} className="text-brand-green/70"/> ID Number
                    </label>
                    <input 
                        type="text" 
                        value={formData.idNumber || ''}
                        disabled
                        className={`w-full bg-[#1A1A1A] border border-[#333] text-gray-400 rounded-xl px-4 py-3 outline-none cursor-not-allowed font-mono`}
                        placeholder="Not verified"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Globe size={14} className="text-blue-400/70"/> Passport Number
                    </label>
                    <input 
                        type="text" 
                        value={formData.passportNumber || ''}
                        disabled
                        className={`w-full bg-[#1A1A1A] border border-[#333] text-gray-400 rounded-xl px-4 py-3 outline-none cursor-not-allowed font-mono`}
                        placeholder="Not verified"
                    />
                </div>
            </div>

            {/* Collapsible ID Photos */}
            <div className="border border-[#333] rounded-xl overflow-hidden">
                <button 
                    type="button"
                    onClick={() => setIsPhotosExpanded(!isPhotosExpanded)}
                    className="flex items-center justify-between w-full p-3 bg-[#1A1A1A] hover:bg-[#222] transition-colors outline-none"
                >
                    <span className="text-sm font-bold text-gray-400 flex items-center gap-2">
                        <Camera size={16} /> ID Photos
                    </span>
                    <div className="text-gray-500">
                        {isPhotosExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                </button>
                
                {isPhotosExpanded && (
                    <div className="p-4 bg-[#151515] border-t border-[#333] animate-in slide-in-from-top-1 fade-in duration-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border border-dashed border-[#333] bg-[#111] rounded-xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-green/50 hover:bg-[#1A1A1A] transition-all group relative overflow-hidden">
                                {formData.idPhotoFrontUrl ? (
                                    <img src={formData.idPhotoFrontUrl} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Front ID"/>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-500 group-hover:text-gray-300">
                                        <div className="p-3 bg-[#1A1A1A] rounded-full mb-1">
                                            <Camera size={20} />
                                        </div>
                                        <span className="text-xs font-bold">Front ID</span>
                                    </div>
                                )}
                            </div>
                            <div className="border border-dashed border-[#333] bg-[#111] rounded-xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-green/50 hover:bg-[#1A1A1A] transition-all group relative overflow-hidden">
                                {formData.idPhotoBackUrl ? (
                                    <img src={formData.idPhotoBackUrl} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Back ID"/>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-500 group-hover:text-gray-300">
                                        <div className="p-3 bg-[#1A1A1A] rounded-full mb-1">
                                            <Camera size={20} />
                                        </div>
                                        <span className="text-xs font-bold">Back ID</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4 pt-4 border-t border-[#222]">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('members.form.contact')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">
                    {t('members.form.email')} <span className="text-red-500">*</span>
                </label>
                <input 
                required
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600 ${!formData.email ? 'border-red-500/40 focus:border-red-500' : ''}`}
                placeholder="john@example.com"
                />
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">{t('members.form.phone')}</label>
                <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600`}
                placeholder="+1 (555) 000-0000"
                />
            </div>
          </div>
        </div>

        {/* Membership Info */}
        <div className="space-y-4 pt-4 border-t border-[#222]">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('members.form.membership')}</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">{t('members.form.clubId')}</label>
                <input 
                type="text" 
                value={formData.club_id || ''}
                onChange={e => setFormData({...formData, club_id: e.target.value})}
                className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600`}
                placeholder="e.g. RFC-1001"
                />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">{t('members.form.tier')}</label>
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
              <label className="text-sm font-medium text-gray-300">{t('members.form.accountStatus')}</label>
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
            <label className="text-sm font-medium text-gray-300">{t('members.form.notes')}</label>
            <textarea 
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none resize-none`}
              placeholder="Internal notes..."
            />
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            variant="primary"
            size="xl"
            fullWidth
            disabled={!isFormValid}
          >
            {initialData ? t('members.form.submitSave') : t('members.form.submitCreate')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MemberForm;
