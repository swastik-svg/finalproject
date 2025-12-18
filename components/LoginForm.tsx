import React, { useState, useRef } from 'react';
import { Calendar, User, Lock, LogIn, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Input } from './Input';
import { Select } from './Select';
import { FISCAL_YEARS } from '../constants';
import { LoginFormData, LoginFormProps } from '../types';

export const LoginForm: React.FC<LoginFormProps> = ({ users, onLoginSuccess, initialFiscalYear }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    fiscalYear: initialFiscalYear || '2081/082',
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginFormData & { form: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (errors.form) setErrors(prev => ({ ...prev, form: undefined }));
  };

  const handleUsernameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordInputRef.current?.focus();
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    if (!formData.fiscalYear) newErrors.fiscalYear = 'आर्थिक वर्ष छान्नुहोस्';
    if (!formData.username.trim()) newErrors.username = 'प्रयोगकर्ता नाम आवश्यक छ';
    if (!formData.password) newErrors.password = 'पासवर्ड आवश्यक छ';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const foundUser = users.find(
        u => u.username.toLowerCase() === formData.username.trim().toLowerCase() && u.password === formData.password
      );

      if (foundUser) {
        onLoginSuccess(foundUser, formData.fiscalYear);
      } else {
        setErrors({ form: 'प्रयोगकर्ता नाम वा पासवर्ड मिलेन' });
      }
    } catch (error) {
      setErrors({ form: 'प्राविधिक समस्या आयो, फेरि प्रयास गर्नुहोस्' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.form && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200 flex items-center gap-2 animate-pulse font-nepali">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Select
            label="आर्थिक वर्ष (Fiscal Year)"
            name="fiscalYear"
            value={formData.fiscalYear}
            onChange={handleChange}
            options={FISCAL_YEARS}
            error={errors.fiscalYear}
            icon={<Calendar size={18} />}
            className="font-nepali font-bold"
          />
        </div>

        <Input
          label="प्रयोगकर्ता नाम (Username)"
          name="username"
          type="text"
          placeholder="Enter username"
          value={formData.username}
          onChange={handleChange}
          onKeyDown={handleUsernameKeyDown}
          error={errors.username}
          icon={<User size={18} />}
        />

        <div className="relative">
          <Input
            ref={passwordInputRef}
            label="पासवर्ड (Password)"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<Lock size={18} />}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-full hover:bg-slate-100 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 font-nepali text-lg"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>प्रक्रियामा छ...</span>
            </>
          ) : (
            <>
              <LogIn size={20} />
              <span>लगइन गर्नुहोस् (Login)</span>
            </>
          )}
        </button>
      </div>

      <div className="text-center pt-2">
        <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
          App Developed By: Swastik Khatiwada
        </p>
      </div>
    </form>
  );
};