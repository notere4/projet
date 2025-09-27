import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Mail, Lock, Eye, EyeOff, AlertCircle, Users } from 'lucide-react';

export function LoginForm() {
  const { login, state } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'secretary' | 'doctor'>('secretary');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(formData.email, formData.password);
    
    if (!success) {
      setError('Email ou mot de passe incorrect');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuickLogin = (role: 'secretary' | 'doctor') => {
    if (role === 'secretary') {
      setFormData({
        email: 'secretaire@cabinet.fr',
        password: 'password123'
      });
    } else {
      setFormData({
        email: 'dr.martin@cabinet.fr',
        password: 'password123'
      });
    }
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CabinetFlow</h1>
          <p className="text-gray-600">Gestion de Cabinet Médical</p>
        </div>

        {/* Quick Access Buttons */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 text-center mb-4">Accès rapide pour la démonstration :</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin('secretary')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedRole === 'secretary'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 text-gray-700'
              }`}
            >
              <Users className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Secrétariat</div>
              <div className="text-xs text-gray-500">Marie Dupont</div>
            </button>
            <button
              onClick={() => handleQuickLogin('doctor')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedRole === 'doctor'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300 text-gray-700'
              }`}
            >
              <Stethoscope className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Médecin</div>
              <div className="text-xs text-gray-500">Dr. Sophie Martin</div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="votre.email@cabinet.fr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={state.loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {state.loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Comptes de démonstration :</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>Secrétariat :</strong> secretaire@cabinet.fr</div>
              <div><strong>Médecin :</strong> dr.martin@cabinet.fr</div>
              <div><strong>Mot de passe :</strong> password123</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 CabinetFlow - Gestion de Cabinet Médical</p>
        </div>
      </div>
    </div>
  );
}