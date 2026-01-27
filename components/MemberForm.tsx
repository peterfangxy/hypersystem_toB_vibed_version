
import React, { useState, useEffect } from 'react';
import { Member, Gender, MemberStatus, TierDefinition } from '../types';
import { THEME } from '../theme';
import { Modal } from './ui/Modal';
import { useLanguage } from '../contexts/LanguageContext';
import NumberInput from './ui/NumberInput';
import Button from './ui/Button';
import * as DataService from '../services/dataService';
import { Calendar, UserSquare2, Camera, ChevronDown, ChevronUp, Fingerprint, Globe, CheckCircle2, Ban, AlertTriangle, RotateCcw } from 'lucide-react';

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (member: Member) => void;
  initialData?: Member;
  isActivationMode?: boolean;
}

const MOCK_ID_FRONT = 'https://www.ris.gov.tw/documents/data/apply-idCard/images/ddccc3f2-2aa9-4e92-9578-41d035af66ea.jpg';
const MOCK_ID_BACK = 'https://www.ris.gov.tw/documents/data/apply-idCard/images/4f3bafb8-502b-400f-ab63-a819044e2621.jpg';

const MemberForm: React.FC<MemberFormProps> = ({ isOpen, onClose, onSubmit, initialData, isActivationMode = false }) => {
  const { t } = useLanguage();
  const [isPhotosExpanded, setIsPhotosExpanded] = useState(false);
  const [availableTiers, setAvailableTiers] = useState<TierDefinition[]>([]);
  
  // Deactivation Flow State
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateInput, setDeactivateInput] = useState('');

  const [formData, setFormData] = useState<Partial<Member>>({
    fullName: '',
    nickname: '',
    club_id: '',
    email: '',
    phone: '',
    birthDate: '',
    age: 0,
    gender: 'Male',
    tier: '', // Default to no tier
    status: 'Pending Approval',
    notes: '',
    idNumber: '',
    passportNumber: '',
    idPhotoFrontUrl: MOCK_ID_FRONT,
    idPhotoBackUrl: MOCK_ID_BACK,
    isIdVerified: false
  });

  useEffect(() => {
    if (isOpen) {
      setAvailableTiers(DataService.getTierDefinitions());
      
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
          tier: '', // Default to empty/no tier
          status: 'Pending Approval',
          notes: '',
          idNumber: '',
          passportNumber: '',
          idPhotoFrontUrl: MOCK_ID_FRONT,
          idPhotoBackUrl: MOCK_ID_BACK,
          isIdVerified: false
        });
      }
      // Reset states on open
      setIsPhotosExpanded(false);
      setIsDeactivating(false);
      setDeactivateInput('');
    }
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

  const handleIdVerificationChange = (checked: boolean) => {
      // Auto-switch status based on verification if in Pending Approval
      let newStatus = formData.status;
      
      if (checked && formData.status === 'Pending Approval') {
          newStatus = 'Activated';
      } else if (!checked && formData.status === 'Activated') {
          newStatus = 'Pending Approval';
      }

      setFormData(prev => ({
          ...prev,
          isIdVerified: checked,
          status: newStatus
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const newMember: Member = {
      id: initialData?.id || crypto.randomUUID(),
      joinDate: initialData?.joinDate || new Date().toISOString(),
      avatarUrl: initialData?.avatarUrl || `https://picsum.photos/150/150?random=${Math.random()}`,
      ...formData as Member
    };
    onSubmit(newMember);
    onClose();
  };

  const handleConfirmDeactivation = () => {
      if (deactivateInput !== 'YES') return;
      
      const newMember: Member = {
          id: initialData?.id || crypto.randomUUID(),
          joinDate: initialData?.joinDate || new Date().toISOString(),
          avatarUrl: initialData?.avatarUrl || '',
          ...formData as Member,
          status: 'Deactivated'
      };
      onSubmit(newMember);
      onClose();
  };

  const handleReactivate = () => {
      const newMember: Member = {
          id: initialData?.id || crypto.randomUUID(),
          joinDate: initialData?.joinDate || new Date().toISOString(),
          avatarUrl: initialData?.avatarUrl || '',
          ...formData as Member,
          status: 'Activated'
      };
      onSubmit(newMember);
      onClose();
  };

  // Basic validation: Name, Email, and Age >= 18
  const isAgeInvalid = (formData.age || 0) < 18;
  const isFormValid = !!formData.fullName && !!formData.email && !isAgeInvalid;
  
  // Specific validation for activation mode: Must have ID verified to proceed
  const canSubmit = isActivationMode ? (isFormValid && formData.isIdVerified) : isFormValid;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isDeactivating ? t('members.form.deactivate.title') : (isActivationMode ? t('members.form.activateBtn') : (initialData ? t('members.form.titleEdit') : t('members.form.titleNew')))}
      size="lg"
    >
      {isDeactivating ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 ring-1 ring-red-500/20">
                  <AlertTriangle size={36} strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">{t('members.form.deactivate.warning')}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto whitespace-pre-wrap">
                      {t('members.form.deactivate.message')}
                  </p>
              </div>
              
              <input 
                  type="text"
                  value={deactivateInput}
                  onChange={e => setDeactivateInput(e.target.value)}
                  className={`w-full max-w-xs ${THEME.input} text-center font-bold tracking-widest text-lg py-3 rounded-xl border-red-900/50 focus:border-red-500 placeholder:text-gray-700`}
                  placeholder={t('members.form.deactivate.confirmPlaceholder')}
                  autoFocus
                  autoComplete="off"
                  autoCapitalize="off"
              />
              
              <div className="flex gap-3 w-full max-w-xs pt-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => { setIsDeactivating(false); setDeactivateInput(''); }} 
                    fullWidth
                    size="lg"
                  >
                    {t('members.form.deactivate.cancelBtn')}
                  </Button>
                  <Button 
                      variant="danger" 
                      onClick={handleConfirmDeactivation} 
                      disabled={deactivateInput !== 'YES'} 
                      fullWidth
                      size="lg"
                  >
                      {t('members.form.deactivate.confirmBtn')}
                  </Button>
              </div>
          </div>
      ) : (
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
                    <option value="Male">{t('members.form.genderOptions.male')}</option>
                    <option value="Female">{t('members.form.genderOptions.female')}</option>
                    <option value="Other">{t('members.form.genderOptions.other')}</option>
                    <option value="Prefer not to say">{t('members.form.genderOptions.preferNotToSay')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Identity Verification Section */}
            <div className={`pt-4 border-t border-[#222] space-y-4 ${isActivationMode ? 'bg-brand-green/5 -mx-6 px-6 py-6 border-b border-brand-green/20' : ''}`}>
                <div className="flex items-center justify-between">
                    <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isActivationMode ? 'text-brand-green' : 'text-gray-500'}`}>
                        <UserSquare2 size={14} /> {t('members.form.identity.title')} {isActivationMode && t('members.form.identity.required')}
                    </h3>
                    
                    {/* ID Verified Checkbox - Staff Only Control */}
                    <div 
                        onClick={() => handleIdVerificationChange(!formData.isIdVerified)}
                        className={`flex items-center gap-3 px-4 py-2 rounded-xl border cursor-pointer transition-all select-none ${
                            formData.isIdVerified 
                            ? 'bg-brand-green/20 border-brand-green text-white' 
                            : 'bg-[#1A1A1A] border-[#333] text-gray-400 hover:border-gray-500'
                        }`}
                    >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            formData.isIdVerified ? 'bg-brand-green border-brand-green text-black' : 'border-gray-500 bg-transparent'
                        }`}>
                            {formData.isIdVerified && <CheckCircle2 size={14} strokeWidth={3}/>}
                        </div>
                        <span className="text-sm font-bold">{t('members.form.identity.verified')}</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <Fingerprint size={14} className="text-brand-green/70"/> {t('members.form.identity.idNumber')}
                        </label>
                        <input 
                            type="text" 
                            value={formData.idNumber || ''}
                            disabled
                            className={`w-full bg-[#1A1A1A] border border-[#333] text-gray-400 rounded-xl px-4 py-3 outline-none cursor-not-allowed font-mono`}
                            placeholder={t('members.form.identity.notVerified')}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <Globe size={14} className="text-blue-400/70"/> {t('members.form.identity.passportNumber')}
                        </label>
                        <input 
                            type="text" 
                            value={formData.passportNumber || ''}
                            disabled
                            className={`w-full bg-[#1A1A1A] border border-[#333] text-gray-400 rounded-xl px-4 py-3 outline-none cursor-not-allowed font-mono`}
                            placeholder={t('members.form.identity.notVerified')}
                        />
                    </div>
                </div>

                {/* Collapsible ID Photos */}
                <div className="border border-[#333] rounded-xl overflow-hidden bg-[#1A1A1A]">
                    <button 
                        type="button"
                        onClick={() => setIsPhotosExpanded(!isPhotosExpanded)}
                        className="flex items-center justify-between w-full p-3 hover:bg-[#222] transition-colors outline-none"
                    >
                        <span className="text-sm font-bold text-gray-400 flex items-center gap-2">
                            <Camera size={16} /> {t('members.form.identity.idPhotos')}
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
                                            <span className="text-xs font-bold">{t('members.form.identity.frontId')}</span>
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
                                            <span className="text-xs font-bold">{t('members.form.identity.backId')}</span>
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
                    value={formData.tier || ''}
                    onChange={e => setFormData({...formData, tier: e.target.value})}
                    className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer`}
                  >
                    <option value="" className="text-gray-500">{t('members.form.noTier')}</option>
                    {availableTiers.map(tier => (
                      <option key={tier.id} value={tier.id}>{tier.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">{t('members.form.accountStatus')}</label>
                  <select 
                    disabled={true}
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as MemberStatus})}
                    className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none appearance-none cursor-not-allowed opacity-70 ${
                        formData.status === 'Activated' ? 'text-brand-green font-bold' : ''
                    }`}
                  >
                    <option value="Pending Approval">{t('members.statusOption.pending')}</option>
                    <option value="Activated">{t('members.statusOption.activated')}</option>
                    <option value="Deactivated">{t('members.statusOption.deactivated')}</option>
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
                  placeholder={t('members.form.placeholders.notes')}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center gap-4">
              {/* Deactivate/Reactivate Buttons (Edit Mode Only, Not Activated Mode) */}
              {initialData && !isActivationMode ? (
                  formData.status === 'Deactivated' ? (
                      <button
                          type="button"
                          onClick={handleReactivate}
                          className="text-brand-green hover:text-green-400 text-sm font-bold flex items-center gap-2 px-3 py-3 rounded-xl border border-transparent hover:border-brand-green/20 hover:bg-brand-green/10 transition-colors whitespace-nowrap"
                      >
                          <RotateCcw size={16} /> {t('members.form.deactivate.reactivateLabel')}
                      </button>
                  ) : (
                      <button
                          type="button"
                          onClick={() => setIsDeactivating(true)}
                          className="text-red-500 hover:text-red-400 text-sm font-bold flex items-center gap-2 px-3 py-3 rounded-xl border border-transparent hover:border-red-500/20 hover:bg-red-500/10 transition-colors whitespace-nowrap"
                      >
                          <Ban size={16} /> {t('members.form.deactivate.buttonLabel')}
                      </button>
                  )
              ) : <div />}

              <Button 
                type="submit" 
                variant="primary"
                size="xl"
                className="flex-1"
                disabled={!canSubmit}
              >
                {isActivationMode 
                    ? t('members.form.activateBtn') 
                    : (initialData ? t('members.form.submitSave') : t('members.form.submitCreate'))
                }
              </Button>
            </div>
          </form>
      )}
    </Modal>
  );
};

export default MemberForm;
