import React, { useState } from 'react';
import { X, User, Settings, Key, Sliders, Save, Shield, Sparkles, Headphones, ChevronDown, ExternalLink, LogIn, LogOut, Database } from 'lucide-react';
import { UserSettings, GeminiModel, BackendType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithGoogle, logout } from '../firebase';
import { getSupabase } from '../services/supabaseService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, onShowToast }) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>({ ...settings });

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-backdrop flex items-center justify-center p-4 z-50" 
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-[var(--color-background)] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-[var(--color-border)] rounded-3xl" 
            onClick={e => e.stopPropagation()}
          >
          {/* Header */}
          <div className="relative overflow-hidden bg-[var(--color-primary-light)] p-6 border-b border-[var(--color-border)] shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[var(--color-primary)]">
                  <Settings size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">الإعدادات</h2>
                  <p className="text-xs text-gray-500 mt-0.5">تخصيص تجربتك مع أنيس القلوب</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center bg-white/50 hover:bg-white text-gray-500 hover:text-gray-800 rounded-full transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            
            {/* Account Section */}
            <section className="bg-white rounded-3xl p-6 border border-[var(--color-border)] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-2 h-full bg-[var(--color-primary)] opacity-20 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-xl shadow-sm">
                  <User size={18} />
                </div>
                الحساب والمزامنة
              </h3>
              
              {localSettings.isLoggedIn ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-[var(--color-border)]">
                    {localSettings.photoURL ? (
                      <img src={localSettings.photoURL} alt="User" className="w-12 h-12 rounded-full border-2 border-[var(--color-primary)]" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]">
                        <User size={24} />
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-gray-800 truncate">{localSettings.username}</p>
                      <p className="text-xs text-gray-500 truncate">{localSettings.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        await logout();
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="w-full py-3 px-4 rounded-2xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    تسجيل الخروج
                  </button>
                  <p className="text-[10px] text-center text-gray-400">بياناتك وإعداداتك تتم مزامنتها تلقائياً مع حسابك.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600 leading-relaxed">قم بتسجيل الدخول لمزامنة إعداداتك، محفوظاتك، وتاريخ محادثاتك عبر جميع أجهزتك.</p>
                  <button 
                    onClick={async () => {
                      try {
                        await signInWithGoogle();
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white border border-[var(--color-border)] text-gray-700 text-sm font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    تسجيل الدخول باستخدام Google
                  </button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-bold uppercase">أو أدخل حسابك يدوياً</span>
                    <div className="flex-grow border-t border-gray-100"></div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">البريد الإلكتروني (اختياري)</label>
                    <input 
                      type="email" 
                      value={localSettings.email || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                      className="w-full bg-gray-50/50 border border-[var(--color-border)] rounded-2xl py-3 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:outline-none transition-all shadow-inner"
                      placeholder="example@email.com"
                    />
                    <p className="text-[9px] text-gray-400 leading-relaxed">
                      إدخال بريدك يدوياً يساعدنا في التعرف على حسابك وتخصيص تجربتك بشكل أفضل.
                    </p>
                  </div>
                </div>
              )}

              {/* Backend Selection - Always Visible */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-gray-400" />
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">نظام المزامنة الأساسي</label>
                  </div>
                  {!getSupabase() && (
                    <span className="text-[9px] text-amber-500 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">بانتظار إعداد Supabase</span>
                  )}
                </div>
                <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                  <button
                    onClick={() => {
                      if (!getSupabase()) {
                        onShowToast("يرجى إعداد مفاتيح Supabase في إعدادات الأسرار (Secrets) أولاً لتفعيل الخيار الأساسي.", 'info');
                        return;
                      }
                      setLocalSettings({ ...localSettings, preferredBackend: 'supabase' });
                    }}
                    className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all ${
                      (localSettings.preferredBackend === 'supabase' || (!localSettings.preferredBackend && getSupabase()))
                        ? 'bg-white text-[var(--color-primary)] shadow-md'
                        : 'text-gray-500 hover:text-gray-700'
                    } ${!getSupabase() ? 'opacity-40 grayscale' : ''}`}
                  >
                    Supabase (الأساسي)
                  </button>
                  <button
                    onClick={() => setLocalSettings({ ...localSettings, preferredBackend: 'firestore' })}
                    className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all ${
                      (localSettings.preferredBackend === 'firestore' || (!localSettings.preferredBackend && !getSupabase()))
                        ? 'bg-white text-[var(--color-primary)] shadow-md'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Firestore (البديل)
                  </button>
                </div>
                <p className="text-[9px] text-gray-400 mt-3 text-center leading-relaxed">
                  تم تعيين Supabase كخيار أساسي للمزامنة، وسيتم استخدام Firestore كبديل تلقائي في حال عدم توفر الإعدادات.
                </p>
              </div>
            </section>

            {/* Profile Section */}
            <section className="bg-white rounded-3xl p-6 border border-[var(--color-border)] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-2 h-full bg-[var(--color-primary)] opacity-20 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-xl shadow-sm">
                  <User size={18} />
                </div>
                الملف الشخصي
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">الاسم</label>
                  <input 
                    type="text" 
                    value={localSettings.username}
                    onChange={(e) => setLocalSettings({ ...localSettings, username: e.target.value })}
                    className="w-full bg-gray-50/50 border border-[var(--color-border)] rounded-2xl py-3.5 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:outline-none transition-all shadow-inner"
                    placeholder="أدخل اسمك..."
                  />
                </div>
              </div>
            </section>

            {/* AI Configuration Section */}
            <section className="bg-white rounded-3xl p-6 border border-[var(--color-border)] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-2 h-full bg-[var(--color-primary)] opacity-20 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-xl shadow-sm">
                  <Sparkles size={18} />
                </div>
                الذكاء الاصطناعي والتلاوة
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">النموذج المستخدم</label>
                  <div className="relative group/select">
                    <select 
                      value={localSettings.model}
                      onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value as GeminiModel })}
                      className="w-full bg-gray-50/50 border border-[var(--color-border)] rounded-2xl py-3.5 pl-10 pr-12 text-sm focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:outline-none transition-all shadow-inner appearance-none cursor-pointer"
                    >
                      <option value="gemini-3-flash-preview">Gemini 3 Flash (متوازن وسريع)</option>
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (تفكير عميق ودقيق)</option>
                      <option value="gemini-3.1-flash-lite-preview">Gemini Flash Lite (الأسرع)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-hover/select:text-[var(--color-primary)] transition-colors">
                      <Sliders size={18} />
                    </div>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">القارئ المفضل</label>
                  <div className="relative group/select">
                    <select 
                      value={localSettings.reciter || 'ar.alafasy'}
                      onChange={(e) => setLocalSettings({ ...localSettings, reciter: e.target.value })}
                      className="w-full bg-gray-50/50 border border-[var(--color-border)] rounded-2xl py-3.5 pl-10 pr-12 text-sm focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:outline-none transition-all shadow-inner appearance-none cursor-pointer"
                    >
                      <option value="ar.alafasy">مشاري راشد العفاسي</option>
                      <option value="ar.islamsobhi">إسلام صبحي</option>
                      <option value="ar.yasseraldosari">ياسر الدوسري</option>
                      <option value="ar.abdulsamad">عبد الباسط عبد الصمد</option>
                      <option value="ar.as-sudais">عبد الرحمن السديس</option>
                      <option value="ar.maheralmuaiqly">ماهر المعيقلي</option>
                      <option value="ar.saadghamidi">سعد الغامدي</option>
                      <option value="ar.minshawi">محمد صديق المنشاوي</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-hover/select:text-[var(--color-primary)] transition-colors">
                      <Headphones size={18} />
                    </div>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                <div className="pt-2 bg-gray-50/50 p-4 rounded-2xl border border-[var(--color-border)]">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold text-gray-700">مستوى الإبداع في التفسير</label>
                    <span className="px-3 py-1 bg-white border border-[var(--color-border)] rounded-xl text-xs font-mono font-bold text-[var(--color-primary)] shadow-sm">
                      {localSettings.creativityLevel}
                    </span>
                  </div>
                  <div className="relative pt-1">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1"
                      value={localSettings.creativityLevel}
                      onChange={(e) => setLocalSettings({ ...localSettings, creativityLevel: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)] hover:accent-[var(--color-primary-dark)] transition-all"
                      style={{
                        background: `linear-gradient(to right, #B8860B 0%, #B8860B ${localSettings.creativityLevel * 100}%, #e5e7eb ${localSettings.creativityLevel * 100}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 mt-3 font-bold px-1">
                    <span>دقيق ومباشر</span>
                    <span>إبداعي وعميق</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section className="bg-white rounded-3xl p-6 border border-[var(--color-border)] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-2 h-full bg-[var(--color-primary)] opacity-20 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-xl shadow-sm">
                  <Shield size={18} />
                </div>
                الأمان والخصوصية
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-600">مفتاح API الخاص (اختياري)</label>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] underline flex items-center gap-1"
                    >
                      الحصول على مفتاح
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <div className="relative group/input">
                    <input 
                      type="password" 
                      value={localSettings.apiKey || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                      className="w-full bg-gray-50/50 border border-[var(--color-border)] rounded-2xl py-3.5 pl-4 pr-12 text-sm focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:outline-none transition-all shadow-inner"
                      placeholder="أدخل مفتاح Gemini الخاص بك (اختياري)..."
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-hover/input:text-[var(--color-primary)] transition-colors">
                      <Key size={18} />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-3 leading-relaxed bg-gray-50 p-3 rounded-xl border border-[var(--color-border)]">
                    يمكنك استخدام التطبيق مجاناً. ولكن إذا كان لديك مفتاح خاص من Google AI Studio، يمكنك إضافته هنا (اختياري) لتجنب حدود الاستخدام. يتم حفظ المفتاح محلياً في متصفحك فقط.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-[var(--color-border)] bg-gray-50/50 flex gap-3 shrink-0">
            <button 
              onClick={handleSave}
              className="flex-1 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Save size={18} />
              حفظ التغييرات
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-3.5 bg-white border border-[var(--color-border)] rounded-2xl font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all"
            >
              إلغاء
            </button>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

