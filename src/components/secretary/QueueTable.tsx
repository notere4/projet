import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Clock, User, Send, AlertCircle } from 'lucide-react';
import { QueueItem } from '../../types';

export function QueueTable() {
  const { state, dispatch } = useAppContext();

  const getPatientName = (patientId: string) => {
    const patient = state.patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = state.doctors.find(d => d.id === doctorId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Médecin inconnu';
  };

  const getWaitingTime = (arrivalTime: string) => {
    const now = new Date();
    const arrival = new Date(arrivalTime);
    const diffMinutes = Math.floor((now.getTime() - arrival.getTime()) / 60000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    }
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}min`;
  };

  const getStatusColor = (status: QueueItem['status']) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_consultation':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: QueueItem['status']) => {
    switch (status) {
      case 'waiting':
        return 'En attente';
      case 'in_consultation':
        return 'En consultation';
      case 'completed':
        return 'Terminé';
      default:
        return 'Inconnu';
    }
  };

  const handleSendPatient = (queueItem: QueueItem) => {
    dispatch({
      type: 'SEND_PATIENT_TO_DOCTOR',
      payload: {
        queueItemId: queueItem.id,
        patientId: queueItem.patientId
      }
    });

    // Mark doctor as unavailable
    dispatch({
      type: 'UPDATE_QUEUE_ITEM',
      payload: { ...queueItem, status: 'in_consultation' }
    });
  };

  const handleReassignPatient = (queueItem: QueueItem, newDoctorId: string) => {
    dispatch({
      type: 'UPDATE_QUEUE_ITEM',
      payload: { ...queueItem, doctorId: newDoctorId }
    });
  };

  const waitingPatients = state.queue.filter(q => q.status === 'waiting');
  const inConsultationPatients = state.queue.filter(q => q.status === 'in_consultation');

  return (
    <div className="space-y-6">
      {/* File d'attente */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-yellow-500" />
              File d'attente ({waitingPatients.length})
            </h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Médecin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temps d'attente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {waitingPatients.map((queueItem) => (
                <tr key={queueItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getPatientName(queueItem.patientId)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Arrivé à {new Date(queueItem.arrivalTime).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={queueItem.doctorId}
                      onChange={(e) => handleReassignPatient(queueItem, e.target.value)}
                      className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      {state.doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.firstName} {doctor.lastName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getWaitingTime(queueItem.arrivalTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      queueItem.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {queueItem.priority === 'urgent' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {queueItem.priority === 'urgent' ? 'Urgent' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleSendPatient(queueItem)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer
                    </button>
                  </td>
                </tr>
              ))}
              {waitingPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucun patient en attente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patients en consultation */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-500" />
            En consultation ({inConsultationPatients.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Médecin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Début consultation
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inConsultationPatients.map((queueItem) => (
                <tr key={queueItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">
                        {getPatientName(queueItem.patientId)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getDoctorName(queueItem.doctorId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(queueItem.status)}`}>
                      {getStatusText(queueItem.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {queueItem.calledTime ? 
                      new Date(queueItem.calledTime).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : 
                      '-'
                    }
                  </td>
                </tr>
              ))}
              {inConsultationPatients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Aucune consultation en cours
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}