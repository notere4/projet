import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PatientForm } from './PatientForm';
import { QueueTable } from './QueueTable';
import { NotificationCenter } from './NotificationCenter';
import { UserPlus, Users, Clock, FileText } from 'lucide-react';

export function SecretaryDashboard() {
  const { state, dispatch } = useAppContext();
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleAddToQueue = (patientId: string) => {
    // Simple logic to assign to first available doctor
    const availableDoctor = state.doctors.find(d => d.isAvailable) || state.doctors[0];
    
    dispatch({
      type: 'ADD_TO_QUEUE',
      payload: {
        id: Date.now().toString(),
        patientId,
        doctorId: availableDoctor.id,
        status: 'waiting',
        arrivalTime: new Date().toISOString(),
        priority: 'normal'
      }
    });
  };

  const waitingCount = state.queue.filter(q => q.status === 'waiting').length;
  const inConsultationCount = state.queue.filter(q => q.status === 'in_consultation').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion de la File d'Attente</h1>
        <button
          onClick={() => setShowPatientForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nouveau patient
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-semibold text-gray-900">{waitingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En consultation</p>
              <p className="text-2xl font-semibold text-gray-900">{inConsultationCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total patients</p>
              <p className="text-2xl font-semibold text-gray-900">{state.patients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Médecins</p>
              <p className="text-2xl font-semibold text-gray-900">{state.doctors.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <NotificationCenter />

      {/* Patients existants */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Patients enregistrés</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.patients.map(patient => (
              <div
                key={patient.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedPatient(patient);
                  setShowPatientForm(true);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{patient.phone}</p>
                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Allergies
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToQueue(patient.id);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ajouter à la file
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <QueueTable />

      {/* Patient Form Modal */}
      {showPatientForm && (
        <PatientForm
          patient={selectedPatient}
          onClose={() => {
            setShowPatientForm(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
}