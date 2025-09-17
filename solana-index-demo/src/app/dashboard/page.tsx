/* =====================================================
 * app/dashboard/page.tsx ― App Router server component
 * ===================================================== */

import { marketEvents } from '../../lib/market-events'
import { processDashboardData } from '../../lib/dashboard-data'
import UnifiedDashboard from './UnifiedDashboard'

export const metadata = {
  title: 'Market Pulse Index',
  description: 'An equally weighted index to capture the true sentiment of the crypto market.',
}

export default async function Page() {
  console.log('Dashboard page rendering...')
  
  // Use static data instead of reading CSV file
  const dashboardData = processDashboardData()
  
  const props = {
    initialLatestEntry: dashboardData.initialLatestEntry,
    echartsData: dashboardData.echartsData,
    initialDailyChange: dashboardData.initialDailyChange,
    events: marketEvents,
    error: undefined as string | undefined,
  }
  
  return (
    <UnifiedDashboard
      initialLatestEntry={props.initialLatestEntry}
      echartsData={props.echartsData}
      initialDailyChange={props.initialDailyChange}
      events={props.events}
      error={props.error}
    />
  )
}
