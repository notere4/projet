import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Consultation, Prescription, ExamRequest } from '../../types';
import { Save, Plus, Trash2, FileText, Pill, Stethoscope } from 'lucide-react';

export function ConsultationForm() {
  const { state, dispatch } = useAppContext();
  const [formData, setFormData] = useState({
    observations: '',
    diagnosis: '',
    treatmentPlan: '',
  });
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [examRequests, setExamRequests] = useState<ExamRequest[]>([]);

  // Auto-save functionality
  useEffect(() => {
    if (state.currentConsultation) {
      const timer = setTimeout(() => {
        const updatedConsultation: Consultation = {
          ...state.currentConsultation,
          observations: formData.observations,
          diagnosis: formData.diagnosis,
          treatmentPlan: formData.treatmentPlan,
          prescriptions,
          exams: examRequests,
        };
        
        dispatch({ type: 'UPDATE_CONSULTATION', payload: updatedConsultation });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [formData, prescriptions, examRequests, state.currentConsultation, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addPrescription = () => {
    const newPrescription: Prescription = {
      id: Date.now().toString(),
      medication: '',
      dosage: '',
      duration: '',
      instructions: ''
    };
    setPrescriptions([...prescriptions, newPrescription]);
  };

  const updatePrescription = (id: string, field: keyof Prescription, value: string) => {
    setPrescriptions(prev => 
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
  };

  const removePrescription = (id: string) => {
    setPrescriptions(prev => prev.filter(p => p.id !== id));
  };

  const addExamRequest = () => {
    const newExam: ExamRequest = {
      id: Date.now().toString(),
      type: '',
      description: '',
      urgent: false
    };
    setExamRequests([...examRequests, newExam]);
  };

  const updateExamRequest = (id: string, field: keyof ExamRequest, value: string | boolean) => {
    setExamRequests(prev => 
      prev.map(e => e.id === id ? { ...e, [field]: value } : e)
    );
  };

  const removeExamRequest = (id: string) => {
    setExamRequests(prev => prev.filter(e => e.id !== id));
  };

  const handleCompleteConsultation = () => {
    if (state.currentConsultation) {
      const finalConsultation: Consultation = {
        ...state.currentConsultation,
        observations: formData.observations,
        diagnosis: formData.diagnosis,
        treatmentPlan: formData.treatmentPlan,
        prescriptions,
        exams: examRequests,
        status: 'completed'
      };
      
      dispatch({ type: 'UPDATE_CONSULTATION', payload: finalConsultation });
      dispatch({ type: 'COMPLETE_CONSULTATION', payload: state.currentConsultation.id });
      
      // Reset form
      setFormData({ observations: '', diagnosis: '', treatmentPlan: '' });
      setPrescriptions([]);
      setExamRequests([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Saisie principale */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Stethoscope className="h-5 w-5 mr-2 text-blue-500" />
            Saisie de la consultation
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Observations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observations et Anamnèse
            </label>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleInputChange}
              rows={4}
              placeholder="Saisissez vos observations sur l'état du patient, ses symptômes, l'anamnèse..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Diagnostic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnostic
            </label>
            <input
              type="text"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              placeholder="Diagnostic posé..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Plan de traitement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan de traitement
            </label>
            <textarea
              name="treatmentPlan"
              value={formData.treatmentPlan}
              onChange={handleInputChange}
              rows={3}
              placeholder="Plan de traitement et recommandations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      {/* Ordonnances */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Pill className="h-5 w-5 mr-2 text-green-500" />
              Ordonnances
            </h3>
            <button
              onClick={addPrescription}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {prescriptions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune ordonnance</p>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Médicament
                      </label>
                      <input
                        type="text"
                        value={prescription.medication}
                        onChange={(e) => updatePrescription(prescription.id, 'medication', e.target.value)}
                        placeholder="Nom du médicament"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        value={prescription.dosage}
                        onChange={(e) => updatePrescription(prescription.id, 'dosage', e.target.value)}
                        placeholder="Ex: 1000mg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durée
                      </label>
                      <input
                        type="text"
                        value={prescription.duration}
                        onChange={(e) => updatePrescription(prescription.id, 'duration', e.target.value)}
                        placeholder="Ex: 7 jours"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removePrescription(prescription.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions
                    </label>
                    <input
                      type="text"
                      value={prescription.instructions || ''}
                      onChange={(e) => updatePrescription(prescription.id, 'instructions', e.target.value)}
                      placeholder="Instructions particulières"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Examens complémentaires */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-500" />
              Examens complémentaires
            </h3>
            <button
              onClick={addExamRequest}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {examRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun examen demandé</p>
          ) : (
            <div className="space-y-4">
              {examRequests.map((exam) => (
                <div key={exam.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type d'examen
                      </label>
                      <input
                        type="text"
                        value={exam.type}
                        onChange={(e) => updateExamRequest(exam.id, 'type', e.target.value)}
                        placeholder="Ex: Prise de sang, Radio..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exam.urgent}
                          onChange={(e) => updateExamRequest(exam.id, 'urgent', e.target.checked)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-red-700 font-medium">
                          Urgent
                        </label>
                      </div>
                      <button
                        onClick={() => removeExamRequest(exam.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={exam.description}
                      onChange={(e) => updateExamRequest(exam.id, 'description', e.target.value)}
                      placeholder="Description détaillée de l'examen"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bouton de fin de consultation */}
      <div className="flex justify-center pt-6">
        <button
          onClick={handleCompleteConsultation}
          disabled={!state.selectedPatient}
          className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          <Save className="h-6 w-6 mr-3" />
          Terminer & Patient Suivant
        </button>
      </div>
    </div>
  );
}