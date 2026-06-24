import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { auditLogger } from '../utils/auditLogger';
import { storageService } from '../utils/storageService';

const FleetOpsContext = createContext();

// Initial State
const initialState = {
  // Surat Jalan
  suratJalan: [],
  currentSJ: null,

  // Checklists
  checklists: [],
  currentChecklist: null,

  // POD
  pods: [],
  currentPOD: null,

  // LPJ
  lpjRecords: [],
  currentLPJ: null,

  // Fleet
  fleet: [],
  currentFleet: null,

  // Drivers/Users
  drivers: [],
  currentDriver: null,

  // Customers
  customers: [],

  // Materials
  materials: [],

  // Dispatches
  dispatches: [],

  // UI State
  loading: false,
  error: null,
  notifications: [],
};

// Reducer
function fleetOpsReducer(state, action) {
  switch (action.type) {
    // Surat Jalan Actions
    case 'SJ_CREATE':
      const newSJ = {
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      auditLogger.log({
        action: 'CREATE',
        documentType: 'SJ',
        documentId: newSJ.number,
        details: `Surat Jalan ${newSJ.number} created`,
      });
      return {
        ...state,
        suratJalan: [newSJ, ...state.suratJalan],
        currentSJ: newSJ,
      };

    case 'SJ_UPDATE':
      return {
        ...state,
        suratJalan: state.suratJalan.map(sj =>
          sj.number === action.payload.number
            ? { ...action.payload, updatedAt: new Date().toISOString() }
            : sj
        ),
        currentSJ: state.currentSJ?.number === action.payload.number
          ? { ...action.payload, updatedAt: new Date().toISOString() }
          : state.currentSJ,
      };

    case 'SJ_STATUS_CHANGE':
      const { number, fromStatus, toStatus, details } = action.payload;
      auditLogger.logStatusChange('SJ', number, fromStatus, toStatus, details);
      return {
        ...state,
        suratJalan: state.suratJalan.map(sj =>
          sj.number === number
            ? { ...sj, status: toStatus, updatedAt: new Date().toISOString() }
            : sj
        ),
        currentSJ: state.currentSJ?.number === number
          ? { ...state.currentSJ, status: toStatus, updatedAt: new Date().toISOString() }
          : state.currentSJ,
      };

    case 'SJ_DELETE':
      auditLogger.log({
        action: 'DELETE',
        documentType: 'SJ',
        documentId: action.payload.number,
        details: `Surat Jalan ${action.payload.number} deleted`,
      });
      return {
        ...state,
        suratJalan: state.suratJalan.filter(sj => sj.number !== action.payload.number),
        currentSJ: null,
      };

    // Checklist Actions
    case 'CHECKLIST_SET':
      return { ...state, checklists: action.payload };
    case 'CHECKLIST_CREATE':
      return {
        ...state,
        checklists: [action.payload, ...state.checklists],
        currentChecklist: action.payload,
      };

    case 'CHECKLIST_UPDATE':
      return {
        ...state,
        checklists: state.checklists.map(cl =>
          cl.id === action.payload.id
            ? { ...action.payload, updatedAt: new Date().toISOString() }
            : cl
        ),
        currentChecklist: state.currentChecklist?.id === action.payload.id
          ? { ...action.payload, updatedAt: new Date().toISOString() }
          : state.currentChecklist,
      };

    // POD Actions
    case 'POD_SET':
      return { ...state, pods: action.payload };
    case 'POD_CREATE':
      return {
        ...state,
        pods: [action.payload, ...state.pods],
        currentPOD: action.payload,
      };

    case 'POD_UPDATE':
      return {
        ...state,
        pods: state.pods.map(pod =>
          pod.id === action.payload.id
            ? { ...action.payload, updatedAt: new Date().toISOString() }
            : pod
        ),
        currentPOD: state.currentPOD?.id === action.payload.id
          ? { ...action.payload, updatedAt: new Date().toISOString() }
          : state.currentPOD,
      };

    // LPJ Actions
    case 'LPJ_SET':
      return { ...state, lpjRecords: action.payload };
    case 'LPJ_CREATE':
      return {
        ...state,
        lpjRecords: [action.payload, ...state.lpjRecords],
        currentLPJ: action.payload,
      };

    case 'LPJ_UPDATE':
      return {
        ...state,
        lpjRecords: state.lpjRecords.map(lpj =>
          lpj.id === action.payload.id
            ? { ...action.payload, updatedAt: new Date().toISOString() }
            : lpj
        ),
        currentLPJ: state.currentLPJ?.id === action.payload.id
          ? { ...action.payload, updatedAt: new Date().toISOString() }
          : state.currentLPJ,
      };

    // Fleet Actions
    case 'FLEET_SET':
      return { ...state, fleet: action.payload };

    case 'FLEET_ADD':
      return { ...state, fleet: [action.payload, ...state.fleet] };

    case 'FLEET_UPDATE':
      return {
        ...state,
        fleet: state.fleet.map(f =>
          f.id === action.payload.id ? action.payload : f
        ),
      };

    // Driver Actions
    case 'DRIVERS_SET':
      return { ...state, drivers: action.payload };

    case 'DRIVERS_ADD':
      return { ...state, drivers: [action.payload, ...state.drivers] };

    case 'DRIVERS_UPDATE':
      return {
        ...state,
        drivers: state.drivers.map(d =>
          d.id === action.payload.id ? action.payload : d
        ),
      };

    // Customer Actions
    case 'CUSTOMERS_SET':
      return { ...state, customers: action.payload };

    case 'CUSTOMER_ADD':
      return { ...state, customers: [action.payload, ...state.customers] };

    // Material Actions
    case 'MATERIALS_SET':
      return { ...state, materials: action.payload };

    case 'MATERIAL_ADD':
      return { ...state, materials: [action.payload, ...state.materials] };

    // User Actions
    case 'USER_ADD':
      return { ...state, drivers: [action.payload, ...state.drivers] };

    // SJ Actions
    case 'SJ_SET':
      return { ...state, suratJalan: action.payload };

    // Dispatch Actions
    case 'DISPATCHES_SET':
      return { ...state, dispatches: action.payload };

    case 'DISPATCH_ADD':
      return { ...state, dispatches: [action.payload, ...state.dispatches] };

    // UI Actions
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, { id: Date.now(), ...action.payload }],
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    case 'RESET_ALL':
      return initialState;

    default:
      return state;
  }
}

// Helper: Normalize SJ from DB format to UI-compatible shape
function normalizeSJFromDB(sj, originalData = {}) {
  const items = sj.items?.map(item => ({
    id: item.id,
    sku: item.material?.code || originalData?.items?.find(i => i.sku === item.material?.code)?.sku || item.material?.code,
    name: item.material?.name || '',
    qty: item.quantity,
    unit: item.material?.unit || 'Kg',
    weight: item.quantity, // fallback
    weightUnit: 'kg',
    volume: 0,
    volumeUnit: 'm³',
  })) || originalData?.items || [];

  return {
    id: sj.id,
    number: sj.documentNumber,
    documentNumber: sj.documentNumber,
    status: sj.status,
    loadingDate: sj.date,
    date: sj.date,
    originDepot: sj.originDepot || originalData?.originDepot || '',
    destination: sj.destination || originalData?.destination || '',
    destinationAddress: sj.destinationAddress || originalData?.destinationAddress || '',
    clientName: sj.customer?.name || originalData?.clientName || '',
    contactPerson: sj.contactPerson || originalData?.contactPerson || '',
    contactPhone: sj.contactPhone || originalData?.contactPhone || '',
    createdByName: sj.createdByName || originalData?.createdByName || '',
    createdBy: sj.createdBy || null,
    items,
    cashAdvance: originalData?.cashAdvance || {
      uangJalan: { nominal: sj.uangJalanNominal || '', recipient: sj.uangJalanRecipient || '' },
      danaCadangan: { nominal: sj.danaCadanganNominal || '' },
    },
    totalWeight: originalData?.totalWeight || '',
    totalQty: originalData?.totalQty || items.length,
    photoCount: sj.photoReceived ? 1 : (originalData?.photoCount || 0),
    createdAt: sj.createdAt,
    updatedAt: sj.updatedAt,
    // Keep customer relation
    customer: sj.customer || null,
    dispatch: sj.dispatch || null,
  };
}

// Persistence helpers (for static / cPanel deploys without backend)
const PERSIST_KEY = 'fleet_ops_main_data';

function getPersistedState() {
  try {
    const saved = localStorage.getItem(PERSIST_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with initial to ensure all keys exist
      return { ...initialState, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to read persisted data:', e);
  }
  return initialState;
}

function savePersistedState(partialState) {
  try {
    // Only persist the core business data (avoid UI noise)
    const toSave = {
      suratJalan: partialState.suratJalan || [],
      checklists: partialState.checklists || [],
      pods: partialState.pods || [],
      lpjRecords: partialState.lpjRecords || [],
      fleet: partialState.fleet || [],
      drivers: partialState.drivers || [],
      customers: partialState.customers || [],
      materials: partialState.materials || [],
      dispatches: partialState.dispatches || [],
    };
    localStorage.setItem(PERSIST_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Failed to save data to localStorage (quota may be full, especially with many photos):', e);
  }
}

// Provider Component
export function FleetOpsProvider({ children }) {
  const [state, dispatch] = useReducer(fleetOpsReducer, getPersistedState());

  // Fetch initial data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [driversRes, customersRes, materialsRes, vehiclesRes, suratJalanRes, dispatchesRes] = await Promise.all([
          fetch('/api/drivers'),
          fetch('/api/customers'),
          fetch('/api/materials'),
          fetch('/api/vehicles'),
          fetch('/api/surat-jalan'),
          fetch('/api/dispatches?limit=100'),
        ]);
        const driversData = await driversRes.json();
        const customersData = await customersRes.json();
        const materialsData = await materialsRes.json();
        const vehiclesData = await vehiclesRes.json();
        const suratJalanData = await suratJalanRes.json();
        const dispatchesData = await dispatchesRes.json();

        dispatch({ type: 'DRIVERS_SET', payload: driversData.drivers || [] });
        dispatch({ type: 'CUSTOMERS_SET', payload: customersData.customers || [] });
        dispatch({ type: 'MATERIALS_SET', payload: materialsData.materials || [] });
        dispatch({ type: 'FLEET_SET', payload: (vehiclesData.vehicles || []).map(v => ({
          ...v,
          plate: v.plateNumber,
        })) });
        // Normalize SJ data from DB to UI-compatible shape
        const normalizedSJ = (suratJalanData.suratJalan || []).map(sj => normalizeSJFromDB(sj));
        dispatch({ type: 'SJ_SET', payload: normalizedSJ });

        // Normalize Dispatches and related entities
        const rawDispatches = dispatchesData.dispatches || [];
        const normalizedDispatches = [];
        const normalizedPods = [];
        const normalizedLpjs = [];
        const normalizedChecklists = [];

        rawDispatches.forEach(d => {
          let status = 'PLANNED';
          if (d.status === 'ASSIGNED') status = 'READY';
          if (d.status === 'DISPATCHED') status = 'IN TRANSIT';
          if (d.status === 'DELIVERED') status = 'DELIVERED';
          if (d.status === 'COMPLETED') status = 'COMPLETED';

          normalizedDispatches.push({
            id: d.id,
            number: d.id, // Some UI might expect number
            sjNumber: d.suratJalan?.documentNumber,
            truckId: d.vehicleId,
            truckPlate: d.vehicle?.plateNumber,
            driverName: d.driver?.name,
            status: status,
            priority: 'standard', // default mock
            createdAt: d.createdAt,
          });

          if (d.pod) {
            let extraFields = {};
            if (d.pod.notes && d.pod.notes.trim().startsWith('{')) {
              try {
                extraFields = JSON.parse(d.pod.notes);
              } catch (e) {
                // Not JSON
              }
            }
            normalizedPods.push({
              id: d.pod.id,
              number: extraFields.number || (d.suratJalan?.documentNumber ? d.suratJalan.documentNumber.replace(/^SJ/i, 'POD') : `POD-${d.pod.id.slice(0, 8).toUpperCase()}`),
              sjNumber: d.suratJalan?.documentNumber,
              receivedBy: d.pod.receivedBy,
              receiverName: d.pod.receivedBy,
              notes: extraFields.notes || d.pod.notes,
              createdAt: d.pod.receivedAt || d.pod.createdAt,
              receivedAt: d.pod.receivedAt || d.pod.createdAt,
              photos: d.pod.photos ? JSON.parse(d.pod.photos) : [],
              status: extraFields.status || (status === 'DELIVERED' || status === 'COMPLETED' ? 'RECEIVED' : 'PENDING'),
              deliveryCondition: extraFields.deliveryCondition || 'good',
              discrepancyDetails: extraFields.discrepancyDetails || '',
              ...extraFields
            });
          }

          if (d.lpj) {
            normalizedLpjs.push({
              id: d.lpj.id,
              number: d.suratJalan?.documentNumber ? d.suratJalan.documentNumber.replace(/^SJ/i, 'LPJ') : `LPJ-${d.lpj.id.slice(0, 8).toUpperCase()}`,
              sjNumber: d.suratJalan?.documentNumber,
              status: 'APPROVED', // Assuming seed LPJs are approved
              driverName: d.driver?.name,
              truckPlate: d.vehicle?.plateNumber,
              totalAmount: d.lpj.expenses ? JSON.parse(d.lpj.expenses).reduce((sum, e) => sum + e.amount, 0) : 0,
              expenses: d.lpj.expenses ? JSON.parse(d.lpj.expenses) : [],
              createdAt: d.lpj.createdAt,
            });
          }

          if (d.vehicleChecklist) {
            let clFields = {};
            if (d.vehicleChecklist.notes && d.vehicleChecklist.notes.trim().startsWith('{')) {
              try {
                clFields = JSON.parse(d.vehicleChecklist.notes);
              } catch (e) {}
            }
            normalizedChecklists.push({
              id: d.vehicleChecklist.id,
              number: d.vehicleChecklist.id,
              sjNumber: d.suratJalan?.documentNumber,
              vehiclePlate: clFields.vehiclePlate || d.vehicle?.plateNumber,
              truckPlate: d.vehicle?.plateNumber,
              driverName: clFields.driverName || d.driver?.name,
              type: clFields.type || 'pre-departure',
              status: d.gateCheckStatus === 'PASSED' ? 'PRE-DEPARTURE DONE' : 'PENDING',
              odometerAwal: clFields.odometerAwal || 0,
              odometerAkhir: clFields.odometerAkhir || 0,
              distanceTraveled: clFields.distanceTraveled || 0,
              itemValues: clFields.itemValues || {},
              createdAt: d.vehicleChecklist.createdAt || d.createdAt,
              date: d.vehicleChecklist.createdAt || d.createdAt,
              ...clFields
            });
          }
        });

        dispatch({ type: 'DISPATCHES_SET', payload: normalizedDispatches });
        dispatch({ type: 'POD_SET', payload: normalizedPods });
        dispatch({ type: 'LPJ_SET', payload: normalizedLpjs });
        dispatch({ type: 'CHECKLIST_SET', payload: normalizedChecklists });

      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    }
    fetchData();
  }, []);

  // Persist core data to localStorage whenever it changes
  // (enables data to survive refresh on static deploys like cPanel)
  useEffect(() => {
    savePersistedState(state);
  }, [state.suratJalan, state.checklists, state.pods, state.lpjRecords, state.fleet, state.drivers, state.customers, state.materials, state.dispatches]);

  // Memoized actions
  const actions = useCallback(() => ({
    dispatch,

    // SJ Actions
    createSJ: async (data) => {
      // Call API to save to database
      try {
        const response = await fetch('/api/surat-jalan/create-from-ui', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (result.success) {
          // Normalize the DB response to match UI shape and update local state
          const sjFromDB = result.suratJalan;
          const normalizedSJ = normalizeSJFromDB(sjFromDB, data);
          dispatch({ type: 'SJ_CREATE', payload: normalizedSJ });
        } else {
          throw new Error(result.error || 'Failed to create SJ');
        }
      } catch (error) {
        // Backend not available (static cPanel deploy, no Node backend) → local fallback
        console.warn('createSJ: backend unavailable, saving locally (localStorage). Data will persist on refresh.');
        // The form already generates a proper number via documentNumberingService.
        // SJ_CREATE reducer will add timestamps + audit log.
        dispatch({ type: 'SJ_CREATE', payload: data });
        // Do NOT throw — allow caller (CreateNewSJ form) to continue with notifications, WA attempt (will fail gracefully), and redirect.
        return { success: true, local: true, data };
      }
    },
    updateSJ: (data) => dispatch({ type: 'SJ_UPDATE', payload: data }),
    changeSJStatus: (number, fromStatus, toStatus, details) =>
      dispatch({ type: 'SJ_STATUS_CHANGE', payload: { number, fromStatus, toStatus, details } }),
    deleteSJ: (data) => dispatch({ type: 'SJ_DELETE', payload: data }),

    // Checklist Actions
    createChecklist: (data) => dispatch({ type: 'CHECKLIST_CREATE', payload: data }),
    updateChecklist: (data) => dispatch({ type: 'CHECKLIST_UPDATE', payload: data }),

    // POD Actions
    createPOD: (data) => dispatch({ type: 'POD_CREATE', payload: data }),
    updatePOD: (data) => dispatch({ type: 'POD_UPDATE', payload: data }),

    // LPJ Actions
    createLPJ: (data) => dispatch({ type: 'LPJ_CREATE', payload: data }),
    updateLPJ: (data) => dispatch({ type: 'LPJ_UPDATE', payload: data }),

    // Fleet Actions
    setFleet: (data) => dispatch({ type: 'FLEET_SET', payload: data }),
    addFleet: (data) => dispatch({ type: 'FLEET_ADD', payload: data }),
    updateFleet: (data) => dispatch({ type: 'FLEET_UPDATE', payload: data }),

    // Driver Actions
    setDrivers: (data) => dispatch({ type: 'DRIVERS_SET', payload: data }),
    addDriver: (data) => dispatch({ type: 'DRIVERS_ADD', payload: data }),
    updateDriver: (data) => dispatch({ type: 'DRIVERS_UPDATE', payload: data }),

    // Customer Actions
    setCustomers: (data) => dispatch({ type: 'CUSTOMERS_SET', payload: data }),
    addCustomer: (data) => dispatch({ type: 'CUSTOMER_ADD', payload: data }),

    // Material Actions
    setMaterials: (data) => dispatch({ type: 'MATERIALS_SET', payload: data }),
    addMaterial: (data) => dispatch({ type: 'MATERIAL_ADD', payload: data }),

    // User Actions
    addUser: (data) => dispatch({ type: 'USER_ADD', payload: data }),

    // Vehicle Actions (alias for fleet)
    addVehicle: (data) => dispatch({ type: 'FLEET_ADD', payload: data }),

    // Dispatch Actions
    setDispatches: (data) => dispatch({ type: 'DISPATCHES_SET', payload: data }),
    addDispatch: (data) => dispatch({ type: 'DISPATCH_ADD', payload: data }),

    // UI Actions
    setLoading: (value) => dispatch({ type: 'SET_LOADING', payload: value }),
    setError: (value) => dispatch({ type: 'SET_ERROR', payload: value }),
    addNotification: (notification) =>
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
    removeNotification: (id) =>
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }),

    // Dev / Maintenance (useful for static deploys)
    resetAllData: () => {
      try {
        localStorage.removeItem(PERSIST_KEY);
      } catch {}

      // Also clear photo/attachment files stored in IndexedDB
      if (storageService && typeof storageService.clearAll === 'function') {
        storageService.clearAll().catch(err => console.warn('Failed to clear attachment files:', err));
      }

      dispatch({ type: 'RESET_ALL' });

      // Small delay so state updates, then ask to reload for clean slate
      setTimeout(() => {
        if (window.confirm('Semua data (termasuk foto bukti) sudah di-reset. Reload halaman sekarang untuk tampilan bersih?')) {
          window.location.reload();
        }
      }, 80);
    },
  }), []);

  return (
    <FleetOpsContext.Provider value={{ ...state, ...actions() }}>
      {children}
    </FleetOpsContext.Provider>
  );
}

// Custom Hook
export function useFleetOps() {
  const context = useContext(FleetOpsContext);
  if (!context) {
    throw new Error('useFleetOps must be used within a FleetOpsProvider');
  }
  return context;
}

export default FleetOpsContext;
