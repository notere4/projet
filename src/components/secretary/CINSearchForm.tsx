import React, { useState } from 'react';
import { Search, User, AlertCircle, Loader2 } from 'lucide-react';
import { patientApi } from '../../services/api';
import { Patient } from '../../types';

interface CINSearchFormProps {
  onPatientFound: (patient: Patient) => void;
  onPatientNotFound: () => void;
}

export function CINSearchForm({ onPatientFound, onPatientNotFound }: CINSearchFormProps) {
  const [cin, setCin] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [searchResult, setSearchResult] = useState<Patient | null>(null);

  const validateCIN = (cinValue: string): boolean => {
    const cinRegex = /^\d{8}$/;
    return cinRegex.test(cinValue);
  };

  const handleCINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 8) {
      setCin(value);
      setError('');
      setSearchResult(null);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cin) {
      setError('Veuillez saisir un numéro CIN');
      return;
    }

    if (!validateCIN(cin)) {
      setError('Le CIN doit contenir exactement 8 chiffres');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResult(null);

    try {
      const patient = await patientApi.searchByCIN(cin);
      setSearchResult(patient);
      onPatientFound(patient);
    } catch (error: any) {
      if (error.message.includes('404')) {
        setError(`Aucun patient trouvé avec le CIN: ${cin}`);
        onPatientNotFound();
      } else {
        setError('Erreur lors de la recherche. Veuillez réessayer.');
      }
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickSearch = async () => {
    if (cin.length >= 3) {
      await handleSearch({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <Search className="h-6 w-6 text-blue-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Recherche par CIN
        </h2>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro CIN (Carte d'Identité Nationale)
          </label>
          <div className="relative">
            <input
              type="text"
              value={cin}
              onChange={handleCINChange}
              placeholder="12345678"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono tracking-wider ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isSearching}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isSearching ? (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              ) : (
                <Search className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
          
          {/* Real-time validation feedback */}
          <div className="mt-2 text-sm">
            {cin.length > 0 && (
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  cin.length === 8 ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className={cin.length === 8 ? 'text-green-600' : 'text-yellow-600'}>
                  {cin.length}/8 chiffres
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSearching || !validateCIN(cin)}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Recherche...</span>
              </div>
            ) : (
              'Rechercher'
            )}
          </button>
          
          {cin.length >= 3 && (
            <button
              type="button"
              onClick={handleQuickSearch}
              disabled={isSearching}
              className="px-4 py-3 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              Recherche rapide
            </button>
          )}
        </div>
      </form>

      {/* Search Result */}
      {searchResult && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <User className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Patient trouvé !
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Nom complet:</p>
                  <p className="text-gray-900">{searchResult.full_name}</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700">CIN:</p>
                  <p className="text-gray-900 font-mono">{searchResult.cin}</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700">Âge:</p>
                  <p className="text-gray-900">{calculateAge(searchResult.date_of_birth)} ans</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700">Téléphone:</p>
                  <p className="text-gray-900">{searchResult.phone}</p>
                </div>
                
                {searchResult.allergies_list && searchResult.allergies_list.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="font-medium text-red-700">⚠️ Allergies:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {searchResult.allergies_list.map((allergy, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Astuce:</strong> Le CIN (Carte d'Identité Nationale) est composé de 8 chiffres. 
          Vous pouvez commencer à taper et utiliser la recherche rapide dès 3 chiffres.
        </p>
      </div>
    </div>
  );
}