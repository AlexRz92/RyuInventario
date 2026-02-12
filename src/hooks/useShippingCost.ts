import { useState, useCallback } from 'react';
import { calculateShippingCost, ShippingCost } from '../lib/shippingCalculator';

export function useShippingCost() {
  const [shippingCost, setShippingCost] = useState<ShippingCost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getShippingCost = useCallback(
    async (country: string, state: string, city?: string): Promise<ShippingCost> => {
      setLoading(true);
      setError(null);

      try {
        const cost = await calculateShippingCost(country, state, city);
        setShippingCost(cost);
        return cost;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al calcular envío';
        setError(errorMessage);
        const failureResult: ShippingCost = {
          available: false,
          cost: 0,
          isFree: false,
          message: errorMessage,
        };
        setShippingCost(failureResult);
        return failureResult;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setShippingCost(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    shippingCost,
    loading,
    error,
    getShippingCost,
    reset,
  };
}
