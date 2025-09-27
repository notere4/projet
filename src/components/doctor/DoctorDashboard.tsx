import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PatientRecord } from './PatientRecord';
import { ConsultationForm } from './ConsultationForm';
import { User, Clock, FileText } from 'lucide-react';

export function DoctorDashboard() {
  const { state, dispatch } = useAppContext();

  // Automatically start consultation when patient is selected
  useEffect(() => {
    if (state.selectedPatient && !state.currentConsultation) {
      const newConsultation = {
        id: Date.now().toString(),
        patientId: state.selectedPatient.id,
        doctorId: state.selectedDoctorId || 'doc1',
        date: new Date().toISOString(),
        observations: '',
        status: 'in_progress' as const
      };
      
      dispatch({ type: 'START_CONSULTATION', payload: newConsultation });
    }
  }, [state.selectedPatient, state.currentConsultation, state.selectedDoctorId, dispatch]);

  if (!state.selectedPatient) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            En attente du prochain patient
          </h2>
          <p className="text-gray-500">
            Le dossier s'ouvrira automatiquement lorsque le secrétariat enverra un patient.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dossier Médical et Consultation</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {new Date().toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          {state.currentConsultation && (
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Consultation en cours
            </div>
          )}
        </div>
      </div>

      {/* Patient Record */}
      <PatientRecord patient={state.selectedPatient} />

      {/* Consultation Form */}
      <ConsultationForm />
    </div>
  );
}