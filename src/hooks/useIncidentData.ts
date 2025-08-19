import { useEffect, useState } from 'react';
import { 
  generateRandomIncident, 
  generateNetworkTraffic, 
  generateSystemStatus, 
  generateAlert, 
  generateThreatDetection, 
  generateAnomalyDetection,
  correlateAlerts 
} from '../utils/dataSimulator';
import { Incident, NetworkTraffic, SystemStatus, Alert, ThreatDetection, AnomalyDetection } from '../types/incident';

export function useIncidentData() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [networkTraffic, setNetworkTraffic] = useState<NetworkTraffic[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [threatDetections, setThreatDetections] = useState<ThreatDetection[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    // Initialize with some sample data
    const initialIncidents = Array.from({ length: 10 }, () => generateRandomIncident());
    const initialSystemStatus = generateSystemStatus();
    const initialAlerts = Array.from({ length: 15 }, () => generateAlert());
    const initialThreatDetections = Array.from({ length: 8 }, () => generateThreatDetection());
    const initialAnomalies = Array.from({ length: 6 }, () => generateAnomalyDetection());
    
    setIncidents(initialIncidents);
    setSystemStatus(initialSystemStatus);
    setThreatDetections(initialThreatDetections);
    setAnomalies(initialAnomalies);
    
    // Correlate and set alerts
    const correlatedAlerts = correlateAlerts(initialAlerts);
    setAlerts(correlatedAlerts);

    // Set up intervals for real-time simulation
    const intervals: NodeJS.Timeout[] = [];
    
    if (isMonitoring) {
      // Generate new incidents occasionally
      intervals.push(setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance every 5 seconds
          const newIncident = generateRandomIncident();
          setIncidents(prev => [newIncident, ...prev.slice(0, 49)]); // Keep last 50
        }
      }, 5000));
      
      // Generate network traffic continuously
      intervals.push(setInterval(() => {
        const newTraffic = generateNetworkTraffic();
        setNetworkTraffic(prev => [newTraffic, ...prev.slice(0, 99)]); // Keep last 100
      }, 1000));
      
      // Generate new alerts occasionally
      intervals.push(setInterval(() => {
        if (Math.random() < 0.4) { // 40% chance every 3 seconds
          const newAlert = generateAlert();
          setAlerts(prev => {
            const updatedAlerts = [newAlert, ...prev];
            return correlateAlerts(updatedAlerts).slice(0, 99); // Keep last 100
          });
        }
      }, 3000));
      
      // Generate threat detections occasionally
      intervals.push(setInterval(() => {
        if (Math.random() < 0.2) { // 20% chance every 8 seconds
          const newThreat = generateThreatDetection();
          setThreatDetections(prev => [newThreat, ...prev.slice(0, 49)]); // Keep last 50
        }
      }, 8000));
      
      // Generate anomalies occasionally
      intervals.push(setInterval(() => {
        if (Math.random() < 0.15) { // 15% chance every 10 seconds
          const newAnomaly = generateAnomalyDetection();
          setAnomalies(prev => [newAnomaly, ...prev.slice(0, 49)]); // Keep last 50
        }
      }, 10000));
      
      // Update system status periodically
      intervals.push(setInterval(() => {
        const updatedStatus = generateSystemStatus();
        setSystemStatus(updatedStatus);
      }, 15000));
    }

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [isMonitoring]);

  const resolveIncident = (incidentId: string) => {
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === incidentId 
          ? { ...incident, status: 'resolved' as const }
          : incident
      )
    );
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  return { 
    incidents,
    networkTraffic,
    systemStatus,
    alerts,
    threatDetections,
    anomalies,
    isMonitoring,
    toggleMonitoring,
    resolveIncident,
    acknowledgeAlert
  };
}