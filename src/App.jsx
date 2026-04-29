import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ToastContainer } from './components/ui';
// Import Form Pages
import AddNewCustomer from './pages/AddNewCustomer';
import AddNewTruck from './pages/AddNewTruck';
import AddNewUser from './pages/AddNewUser';
import NewDispatch from './pages/NewDispatch';
import NewMaterial from './pages/NewMaterial';
import CreateNewSJ from './pages/CreateNewSJ';
import VehicleChecklist from './pages/VehicleChecklist';
// Import Index Pages
import FleetIndex from './pages/FleetIndex';
import FleetDetail from './pages/FleetDetail';
import CustomerIndex from './pages/CustomerIndex';
import MaterialIndex from './pages/MaterialIndex';
import DriverIndex from './pages/DriverIndex';
import UserIndex from './pages/UserIndex';
import SJIndex from './pages/SJIndex';
import DispatchIndex from './pages/DispatchIndex';
import PODIndex from './pages/PODIndex';
import ProofOfDelivery from './pages/ProofOfDelivery';
import LPJIndex from './pages/LPJIndex';
import LPJKeuangan from './pages/LPJKeuangan';
// Import Other Pages
import Monitoring from './pages/Monitoring';
import Archiving from './pages/Archiving';
import Reports from './pages/Reports';
import AuditLog from './pages/AuditLog';
import Settings from './pages/Settings';

import { Link } from 'react-router-dom';

function Dashboard() {
  const stats = [
    { title: 'Active Dispatches', value: '24', trend: '+12%', isUp: true, icon: 'route', color: 'primary' },
    { title: 'Pending SJ', value: '8', trend: '-2%', isUp: false, icon: 'receipt_long', color: 'secondary' },
    { title: 'Available Fleet', value: '15', trend: 'Stable', isUp: true, icon: 'local_shipping', color: 'tertiary' },
    { title: 'On-Time Delivery', value: '94.2%', trend: '+1.5%', isUp: true, icon: 'check_circle', color: 'primary' }
  ];

  const recentActivity = [
    { id: 'SJ/2023/10/029', action: 'New Surat Jalan generated', time: '10 mins ago', status: 'Pending Dispatch' },
    { id: 'DSP-8821', action: 'Fleet B 9102 UXA departed', time: '1 hour ago', status: 'In Transit' },
    { id: 'DSP-8819', action: 'Delivery completed at Warehouse B', time: '3 hours ago', status: 'Completed' },
    { id: 'MT-002', action: 'Truck maintenance scheduled', time: '5 hours ago', status: 'Scheduled' },
  ];

  const activeRoutes = [
    { id: 'DSP-8821', driver: 'Sudirman P.', truck: 'B 9102 UXA', destination: 'PT. Indofood Sukses', progress: 45, status: 'On Track' },
    { id: 'DSP-8822', driver: 'Agus M.', truck: 'D 8831 XYZ', destination: 'Distribution Center', progress: 15, status: 'Delayed' },
    { id: 'DSP-8820', driver: 'Budi S.', truck: 'B 1120 ABC', destination: 'Cikarang Hub', progress: 85, status: 'Arriving' },
  ];

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "REPORT: LOGISTICS COMMAND CENTER\n\n";
    
    csvContent += "--- METRICS ---\n";
    stats.forEach(stat => {
      csvContent += `"${stat.title}","${stat.value}","${stat.trend}"\n`;
    });
    
    csvContent += "\n--- RECENT ACTIVITY ---\n";
    csvContent += "ID,Action,Time,Status\n";
    recentActivity.forEach(act => {
      csvContent += `"${act.id}","${act.action}","${act.time}","${act.status}"\n`;
    });
    
    csvContent += "\n--- LIVE DEPLOYMENTS ---\n";
    csvContent += "Dispatch ID,Driver,Truck,Destination,Status,Progress\n";
    activeRoutes.forEach(route => {
      csvContent += `"${route.id}","${route.driver}","${route.truck}","${route.destination}","${route.status}","${route.progress}%"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    // Simple timestamp formatting
    const d = new Date();
    const fName = `fleet_ops_report_${d.getFullYear()}${(d.getMonth()+1).toString().padStart(2,'0')}${d.getDate().toString().padStart(2,'0')}.csv`;
    link.setAttribute("download", fName);
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold font-headline tracking-tight text-on-surface">Logistics Command Center</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">Real-time overview of fleet operations and deliveries.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleExport} className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2 active:scale-95">
                <span className="material-symbols-outlined text-[18px]">download</span> Export Report
              </button>
              <Link to="/dispatch/new" className="px-4 py-2.5 bg-primary hover:bg-[#3a533a] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add</span> New Dispatch
              </Link>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, idx) => {
              const bgClass = stat.color === 'primary' ? 'bg-primary' : stat.color === 'secondary' ? 'bg-secondary' : 'bg-tertiary';
              return (
              <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-200/50 hover:shadow-lg transition-transform hover:-translate-y-1 relative overflow-hidden group bg-white dark:bg-slate-800">
                <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 transform duration-500 pointer-events-none">
                  <span className="material-symbols-outlined text-[100px] text-slate-800 dark:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${bgClass} shadow-sm`}>
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.title}</h3>
                </div>
                <div className="relative z-10">
                  <span className="text-3xl font-black font-headline text-on-surface">{stat.value}</span>
                  <div className={`mt-2 text-xs font-bold flex items-center gap-1 ${stat.isUp ? 'text-primary' : 'text-error'}`}>
                    <span className="material-symbols-outlined text-[16px]">{stat.isUp ? 'trending_up' : 'trending_down'}</span>
                    {stat.trend} <span className="text-slate-400 font-normal ml-1">vs last week</span>
                  </div>
                </div>
              </div>
            )})}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8">
            
            {/* Chart / Analytics Area */}
            <div className="xl:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200/50 shadow-sm flex flex-col bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold font-headline text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  Weekly Fleet Utilization
                </h3>
                <select className="bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none">
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>This Month</option>
                </select>
              </div>
              
              <div className="flex-1 flex items-end justify-between gap-3 md:gap-6 min-h-[200px] pt-4 mt-auto">
                {/* CSS Bar Chart Simulation */}
                {[45, 60, 35, 80, 95, 75, 40].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 flex-1 group h-full justify-end">
                    <div className="w-full relative flex items-end justify-center h-[180px] rounded-t-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors pt-4 px-1 md:px-4">
                      <div className="w-full max-w-[40px] bg-gradient-to-t from-primary/80 to-primary rounded-t-lg relative group-hover:from-primary group-hover:to-[#638a64] transition-all cursor-pointer shadow-sm group-hover:shadow-md" style={{ height: `${h}%` }}>
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 p-1.5 bg-slate-800 dark:bg-slate-700 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-lg pointer-events-none">{h}%</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{'SMTWTFS'[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 shadow-sm bg-white dark:bg-slate-800 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold font-headline text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">history</span>
                  Action Required
                </h3>
                <span className="text-xs font-bold text-primary hover:underline cursor-pointer">View All</span>
              </div>
              
              <div className="space-y-5 flex-1">
                {recentActivity.map((act, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer relative pb-5 border-l-2 border-slate-100 dark:border-slate-700 ml-2 pl-4 last:border-transparent last:pb-0">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-primary transition-colors ring-4 ring-white dark:ring-slate-800"></div>
                    <div className="-mt-1">
                      <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{act.action}</h4>
                      <div className="flex items-center gap-2 mt-1.5 mb-1.5">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{act.id}</span>
                        <span className="text-slate-300 dark:text-slate-600 text-[10px]">•</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ${act.status === 'Pending Dispatch' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : act.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                          {act.status}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span> {act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Active Routes Table */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 shadow-sm bg-white dark:bg-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-headline text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">alt_route</span>
                Live Deployments
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-4">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Live Update
                </div>
                <button className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="py-4 px-5">Dispatch ID</th>
                    <th className="py-4 px-5">Driver / Asset</th>
                    <th className="py-4 px-5">Destination</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 w-48">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
                  {activeRoutes.map((route, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group">
                      <td className="py-3 px-5 font-bold font-headline text-on-surface group-hover:text-primary transition-colors">{route.id}</td>
                      <td className="py-3 px-5">
                        <div className="font-bold flex items-center gap-2">
                          <img src={`https://ui-avatars.com/api/?name=${route.driver}&background=random&color=fff&size=24`} className="w-6 h-6 rounded-full" alt="Driver" />
                          {route.driver}
                        </div>
                        <div className="text-xs font-medium text-slate-500 mt-0.5 ml-8">{route.truck}</div>
                      </td>
                      <td className="py-3 px-5 font-medium text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                          {route.destination}
                        </div>
                      </td>
                      <td className="py-3 px-5">
                         <span className={`text-[10px] px-2.5 py-1 rounded-md border font-bold uppercase tracking-widest ${route.status === 'Delayed' ? 'bg-error/10 text-error border-error/20' : route.status === 'Arriving' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                          {route.status}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-0 overflow-hidden shadow-inner">
                            <div className={`h-full rounded-full transition-all duration-1000 ${route.status === 'Delayed' ? 'bg-error' : 'bg-primary'}`} style={{ width: `${route.progress}%` }}></div>
                          </div>
                          <div className="text-xs font-bold text-slate-500 w-8">{route.progress}%</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
      <Route path="/" element={<Dashboard />} />
      
      {/* Index (List) Routes */}
      <Route path="/fleet" element={<FleetIndex />} />
      <Route path="/fleet/:id" element={<FleetDetail />} />
      <Route path="/fleet/new" element={<AddNewTruck />} />
      <Route path="/customers" element={<CustomerIndex />} />
      <Route path="/drivers" element={<DriverIndex />} />
      <Route path="/materials" element={<MaterialIndex />} />
      <Route path="/users" element={<UserIndex />} />
      <Route path="/sj" element={<SJIndex />} />
      <Route path="/dispatch" element={<DispatchIndex />} />
      <Route path="/pod" element={<PODIndex />} />
      <Route path="/pod/new" element={<ProofOfDelivery />} />
      <Route path="/pod/:sjNumber" element={<ProofOfDelivery />} />
      <Route path="/lpj" element={<LPJIndex />} />

      {/* Form Routes */}
      <Route path="/customers/new" element={<AddNewCustomer />} />
      <Route path="/users/new" element={<AddNewUser />} />
      <Route path="/dispatch/new" element={<NewDispatch />} />
      <Route path="/materials/new" element={<NewMaterial />} />
      <Route path="/sj/new" element={<CreateNewSJ />} />
      <Route path="/checklist/new" element={<VehicleChecklist />} />
      <Route path="/checklist/:sjNumber" element={<VehicleChecklist />} />
      <Route path="/lpj/new" element={<LPJKeuangan />} />
      <Route path="/lpj/:sjNumber" element={<LPJKeuangan />} />
      
      {/* Existing Feature Routes */}
      <Route path="/monitoring" element={<Monitoring />} />
      <Route path="/archive" element={<Archiving />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/audit" element={<AuditLog />} />
      <Route path="/settings" element={<Settings />} />
      
      <Route path="*" element={<Dashboard />} />
    </Routes>
    </>
  );
}

export default App;
