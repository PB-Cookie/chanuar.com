import type { ActiveMenu, Credential, FoodOrder, OrderRouteData } from './types';

export type OrderWorkflow = {
  phase: 'loading' | 'ready' | 'empty' | 'error';
  active: ActiveMenu | null;
  savedOrder: FoodOrder | null;
  credential: Credential | null;
  editing: boolean;
};

export type OrderAction =
  | { type: 'loading' }
  | { type: 'loaded'; data: OrderRouteData }
  | { type: 'failed' }
  | { type: 'edit' }
  | { type: 'credential-recorded'; credential: Credential }
  | { type: 'saved'; credential: Credential; order: FoodOrder }
  | { type: 'closed'; order: FoodOrder | null }
  | { type: 'forget' };

export function initialOrderWorkflow(data: OrderRouteData | null = null): OrderWorkflow {
  if (!data) return { phase: 'loading', active: null, savedOrder: null, credential: null, editing: false };
  if (data.order) return { phase: 'ready', active: data.menu, savedOrder: data.order, credential: data.credential, editing: false };
  if (data.menu) return { phase: 'ready', active: data.menu, savedOrder: null, credential: null, editing: true };
  return { phase: 'empty', active: null, savedOrder: null, credential: null, editing: false };
}

export function orderWorkflowReducer(state: OrderWorkflow, action: OrderAction): OrderWorkflow {
  switch (action.type) {
    case 'loading': return { ...state, phase: 'loading', editing: false };
    case 'loaded': return initialOrderWorkflow(action.data);
    case 'failed': return { phase: 'error', active: null, savedOrder: null, credential: null, editing: false };
    case 'edit': return state.active && state.savedOrder ? { ...state, editing: true } : state;
    case 'credential-recorded': return { ...state, credential: action.credential };
    case 'saved': return { ...state, phase: 'ready', credential: action.credential, savedOrder: action.order, editing: false };
    case 'closed': return action.order
      ? { ...state, phase: 'ready', savedOrder: action.order, editing: false }
      : { phase: 'empty', active: null, savedOrder: null, credential: null, editing: false };
    case 'forget': return state.active
      ? { ...state, phase: 'ready', savedOrder: null, credential: null, editing: true }
      : { phase: 'empty', active: null, savedOrder: null, credential: null, editing: false };
  }
}
