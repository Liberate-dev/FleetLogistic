import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { auditLogger } from '../utils/auditLogger';

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

    // Material Actions
    case 'MATERIALS_SET':
      return { ...state, materials: action.payload };

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

    default:
      return state;
  }
}

// Provider Component
export function FleetOpsProvider({ children }) {
  const [state, dispatch] = useReducer(fleetOpsReducer, initialState);

  // Fetch drivers on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [driversRes, customersRes, materialsRes] = await Promise.all([
          fetch('/api/drivers'),
          fetch('/api/customers'),
          fetch('/api/materials'),
        ]);
        const driversData = await driversRes.json();
        const customersData = await customersRes.json();
        const materialsData = await materialsRes.json();

        dispatch({ type: 'DRIVERS_SET', payload: driversData.drivers || [] });
        dispatch({ type: 'CUSTOMERS_SET', payload: customersData.customers || [] });
        dispatch({ type: 'MATERIALS_SET', payload: materialsData.materials || [] });
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    }
    fetchData();
  }, []);

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
          // Update local state
          dispatch({ type: 'SJ_CREATE', payload: { ...data, id: result.suratJalan.id } });
        } else {
          throw new Error(result.error || 'Failed to create SJ');
        }
      } catch (error) {
        console.error('createSJ error:', error);
        throw error;
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

    // Material Actions
    setMaterials: (data) => dispatch({ type: 'MATERIALS_SET', payload: data }),

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
