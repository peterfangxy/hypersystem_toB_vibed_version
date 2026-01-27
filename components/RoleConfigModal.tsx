
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Trash2, 
  CheckCircle2,
  Lock, 
  Eye, 
  EyeOff, 
  Edit3
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { RoleDefinition, AppModule, PermissionLevel } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import { useLanguage } from '../contexts/LanguageContext';

interface RoleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODULES: AppModule[] = [
    'dashboard',
    'members',
    'tables',
    'tournaments',
    'structures',
    'clocks',
    'settings'
];

const RoleConfigModal: React.FC<RoleConfigModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRoles();
    }
  }, [isOpen]);

  const loadRoles = () => {
      const data = DataService.getRoleConfigs();
      setRoles(data);
      // Select first role by default if none selected
      if (!selectedRole && data.length > 0) {
          setSelectedRole(data[0]);
      } else if (selectedRole) {
          // Refresh selected role data
          const updated = data.find(r => r.id === selectedRole.id);
          if (updated) setSelectedRole(updated);
      }
  };

  const handleAddRole = () => {
      const newRole: RoleDefinition = {
          id: crypto.randomUUID(),
          name: t('settings.roleModal.addRole'), // Initial placeholder name
          description: '',
          isSystem: false,
          permissions: {
              dashboard: 'view',
              members: 'no_access',
              tables: 'no_access',
              tournaments: 'no_access',
              structures: 'no_access',
              clocks: 'no_access',
              settings: 'no_access'
          }
      };
      setRoles([...roles, newRole]);
      setSelectedRole(newRole);
      setHasChanges(true);
  };

  const handleDeleteRole = (id: string) => {
      if (window.confirm(t('settings.roleModal.deleteRoleConfirm'))) {
          const updatedRoles = roles.filter(r => r.id !== id);
          setRoles(updatedRoles);
          setHasChanges(true);
          if (selectedRole?.id === id) {
              setSelectedRole(updatedRoles[0] || null);
          }
      }
  };

  const handleNameChange = (name: string) => {
      if (!selectedRole) return;
      const updated = { ...selectedRole, name };
      setSelectedRole(updated);
      setRoles(roles.map(r => r.id === updated.id ? updated : r));
      setHasChanges(true);
  };

  const handleDescriptionChange = (description: string) => {
      if (!selectedRole) return;
      const updated = { ...selectedRole, description };
      setSelectedRole(updated);
      setRoles(roles.map(r => r.id === updated.id ? updated : r));
      setHasChanges(true);
  };

  const handlePermissionChange = (moduleKey: AppModule, level: PermissionLevel) => {
      if (!selectedRole) return;
      const updatedPermissions = { ...selectedRole.permissions, [moduleKey]: level };
      const updated = { ...selectedRole, permissions: updatedPermissions };
      setSelectedRole(updated);
      setRoles(roles.map(r => r.id === updated.id ? updated : r));
      setHasChanges(true);
  };

  const handleSave = () => {
      const allStored = DataService.getRoleConfigs();
      const currentIds = new Set(roles.map(r => r.id));
      allStored.forEach(r => {
          if (!currentIds.has(r.id)) DataService.deleteRoleConfig(r.id);
      });
      roles.forEach(r => DataService.saveRoleConfig(r));
      
      setHasChanges(false);
      onClose();
  };

  // Helper to resolve localized name
  const getRoleDisplayName = (role: RoleDefinition) => {
      if (role.id === 'role_admin') return t('settings.roles.adminName');
      if (role.id === 'role_viewer') return t('settings.roles.viewerName');
      return role.name;
  };

  // Helper to resolve localized description
  const getRoleDisplayDesc = (role: RoleDefinition) => {
      if (role.id === 'role_admin') return t('settings.roles.adminDesc');
      if (role.id === 'role_viewer') return t('settings.roles.viewerDesc');
      return role.description;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
          <div className="flex items-center gap-2 text-lg">
              <Shield size={20} className="text-brand-green"/>
              {t('settings.roleModal.title')}
          </div>
      }
      size="xl"
    >
      <div className="flex flex-1 overflow-hidden h-[450px]">
          {/* Left: Role List */}
          <div className="w-1/3 bg-[#1A1A1A] border-r border-[#222] flex flex-col">
              <div className="p-3 border-b border-[#222]">
                  <button 
                      onClick={handleAddRole}
                      className="w-full py-2 bg-[#222] hover:bg-[#333] text-white border border-[#333] hover:border-gray-500 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                      <Plus size={14} /> {t('settings.roleModal.addRole')}
                  </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {roles.map(role => (
                      <button
                          key={role.id}
                          onClick={() => setSelectedRole(role)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between group transition-all ${
                              selectedRole?.id === role.id 
                              ? 'bg-brand-green/10 text-brand-green border border-brand-green/30' 
                              : 'text-gray-400 hover:bg-[#222] border border-transparent'
                          }`}
                      >
                          <span className="font-bold text-sm truncate">{getRoleDisplayName(role)}</span>
                          {role.isSystem && <Lock size={12} className="opacity-50 shrink-0" />}
                      </button>
                  ))}
              </div>
          </div>

          {/* Right: Permissions Editor */}
          <div className="flex-1 bg-[#111] flex flex-col min-w-0">
              {selectedRole ? (
                  <>
                      {/* Header */}
                      <div className="p-4 border-b border-[#222] flex justify-between items-start bg-[#151515]">
                          <div className="flex-1 mr-3 space-y-3 min-w-0">
                              <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t('settings.roleModal.roleName')}</label>
                                  <input 
                                      type="text" 
                                      value={getRoleDisplayName(selectedRole)}
                                      onChange={(e) => handleNameChange(e.target.value)}
                                      disabled={selectedRole.isSystem}
                                      className={`w-full bg-transparent text-lg font-bold outline-none ${selectedRole.isSystem ? 'text-gray-500 cursor-not-allowed' : 'text-white border-b border-gray-700 focus:border-brand-green'}`}
                                  />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t('settings.roleModal.description')}</label>
                                  <input 
                                      type="text" 
                                      value={getRoleDisplayDesc(selectedRole) || ''}
                                      onChange={(e) => handleDescriptionChange(e.target.value)}
                                      disabled={selectedRole.isSystem}
                                      placeholder={t('settings.roleModal.descriptionPlaceholder')}
                                      className={`w-full bg-[#1A1A1A] rounded px-3 py-1.5 text-sm outline-none border border-transparent transition-colors ${selectedRole.isSystem ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 focus:border-brand-green/50'}`}
                                  />
                              </div>
                          </div>
                          {!selectedRole.isSystem && (
                              <button 
                                  onClick={() => handleDeleteRole(selectedRole.id)}
                                  className="p-2 text-gray-600 hover:text-red-500 hover:bg-[#222] rounded transition-colors"
                                  title={t('common.delete')}
                              >
                                  <Trash2 size={16} />
                              </button>
                          )}
                      </div>

                      {/* Permissions Table */}
                      <div className="flex-1 overflow-y-auto p-4">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              {t('settings.roleModal.moduleAccess')}
                          </h4>
                          <div className="space-y-1">
                              {MODULES.map(moduleKey => (
                                  <div key={moduleKey} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#1A1A1A] border border-transparent hover:border-[#222] transition-colors gap-3">
                                      <span className="text-sm font-medium text-gray-300 truncate flex-1">{t(`sidebar.${moduleKey}`)}</span>
                                      
                                      <div className="flex bg-[#222] rounded-lg p-1 shrink-0">
                                          <button
                                              onClick={() => handlePermissionChange(moduleKey, 'no_access')}
                                              disabled={selectedRole.isSystem}
                                              className={`px-3 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1.5 ${
                                                  selectedRole.permissions[moduleKey] === 'no_access'
                                                  ? 'bg-[#333] text-gray-300 shadow-sm'
                                                  : 'text-gray-600 hover:text-gray-400'
                                              } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-50' : ''}`}
                                              title={t('settings.roleModal.noAccess')}
                                          >
                                              <EyeOff size={12} />
                                          </button>
                                          <button
                                              onClick={() => handlePermissionChange(moduleKey, 'view')}
                                              disabled={selectedRole.isSystem}
                                              className={`px-3 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1.5 ${
                                                  selectedRole.permissions[moduleKey] === 'view'
                                                  ? 'bg-blue-500/20 text-blue-400 shadow-sm'
                                                  : 'text-gray-600 hover:text-gray-400'
                                              } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-50' : ''}`}
                                              title={t('settings.roleModal.viewOnly')}
                                          >
                                              <Eye size={12} />
                                          </button>
                                          <button
                                              onClick={() => handlePermissionChange(moduleKey, 'edit')}
                                              disabled={selectedRole.isSystem}
                                              className={`px-3 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1.5 ${
                                                  selectedRole.permissions[moduleKey] === 'edit'
                                                  ? 'bg-brand-green/20 text-brand-green shadow-sm'
                                                  : 'text-gray-600 hover:text-gray-400'
                                              } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-50' : ''}`}
                                              title={t('settings.roleModal.editAccess')}
                                          >
                                              <Edit3 size={12} />
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </>
              ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
                      {t('settings.roleModal.selectRole')}
                  </div>
              )}
          </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#222] bg-[#151515] flex justify-end gap-3">
          <button 
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
          >
              {t('settings.roleModal.cancel')}
          </button>
          <button 
              onClick={handleSave}
              className={`${THEME.buttonPrimary} px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2`}
          >
              <CheckCircle2 size={16} /> {t('settings.roleModal.save')}
          </button>
      </div>
    </Modal>
  );
};

export default RoleConfigModal;
