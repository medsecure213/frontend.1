import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useIncidentData() {
  const [incidents, setIncidents] = useState<any[]>([])
  const [networkTraffic, setNetworkTraffic] = useState<any[]>([])
  const [systemStatus, setSystemStatus] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [threatDetections, setThreatDetections] = useState<any[]>([])
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [isMonitoring, setIsMonitoring] = useState(true)

  useEffect(() => {
    fetchAlerts()

    const channel = supabase.channel('public:alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, (payload) => {
        // refresh data when new alert is inserted/updated
        fetchAlerts()
      })
      .subscribe()

    return () => {
      try {
        supabase.removeChannel(channel)
      } catch (e) {
        // ignore if removal fails
      }
    }
  }, [])

  async function fetchAlerts() {
    const { data, error } = await supabase.from('alerts').select('*').order('timestamp', { ascending: false })
    if (!error && data) setAlerts(data)
  }

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
  }

  return { 
    incidents,
    networkTraffic,
    systemStatus,
    alerts,
    threatDetections,
    anomalies,
    isMonitoring,
    toggleMonitoring
  }
}