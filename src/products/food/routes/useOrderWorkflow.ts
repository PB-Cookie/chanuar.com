import { useReducer } from 'react';
import { initialOrderWorkflow, orderWorkflowReducer } from '../model/orderState';
import type { OrderRouteData } from '../model/types';

export function useOrderWorkflow(initialData: OrderRouteData | null) {
  return useReducer(orderWorkflowReducer, initialData, initialOrderWorkflow);
}
