import React from 'react';
import { Patient } from '../../types';
import { User, Phone, Mail, MapPin, AlertTriangle, Pill, Clock, FileText } from 'lucide-react';

interface PatientRecordProps {
  patient: Patient;
}

export function PatientRecord({ patient }: PatientRecordProps) {
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
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h2>
              <p className="text-sm text-gray-600">
                {calculateAge(patient.dateOfBirth)} ans • Né(e) le {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Informations de contact */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Informations de contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-900">{patient.phone}</span>
            </div>
            {patient.email && (
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-900">{patient.email}</span>
              </div>
            )}
            {patient.address && (
              <div className="flex items-center space-x-3 md:col-span-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-900">{patient.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Allergies - Section mise en évidence */}
        {patient.allergies && patient.allergies.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-medium text-red-900">⚠️ ALLERGIES</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((allergy, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300"
                >
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Traitements en cours */}
        {patient.currentTreatments && patient.currentTreatments.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Pill className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-blue-900">Traitements en cours</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {patient.currentTreatments.map((treatment, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {treatment}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dernier motif de consultation */}
        {patient.lastConsultationReason && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-green-900">Dernier motif de consultation</h3>
            </div>
            <p className="text-sm text-green-800">{patient.lastConsultationReason}</p>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            <FileText className="h-4 w-4 mr-2" />
            Historique complet
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            <FileText className="h-4 w-4 mr-2" />
            Documents joints
          </button>
        </div>
      </div>
    </div>
  );
}