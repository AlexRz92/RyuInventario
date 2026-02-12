import { supabase } from './supabase';

export interface ShippingCost {
  available: boolean;
  cost: number;
  isFree: boolean;
  ruleId?: string;
  message: string;
}

export async function getShippingRule(
  country: string,
  state: string,
  city?: string
) {
  try {
    let query = supabase
      .from('shipping_rules')
      .select('*')
      .eq('country', country)
      .eq('state', state)
      .eq('is_active', true);

    const normalizedCity = (city || '').trim();

    if (normalizedCity) {
      query = query.eq('city', normalizedCity);
      const { data: cityRule, error: cityError } = await query;

      if (cityError) throw cityError;

      if (cityRule && cityRule.length > 0) {
        return cityRule[0];
      }
    }

    query = supabase
      .from('shipping_rules')
      .select('*')
      .eq('country', country)
      .eq('state', state)
      .is('city', null)
      .eq('is_active', true);

    const { data: stateRule, error: stateError } = await query;

    if (stateError) throw stateError;

    if (stateRule && stateRule.length > 0) {
      return stateRule[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching shipping rule:', error);
    return null;
  }
}

export async function calculateShippingCost(
  country: string,
  state: string,
  city?: string
): Promise<ShippingCost> {
  try {
    const rule = await getShippingRule(country, state, city);

    if (!rule) {
      return {
        available: false,
        cost: 0,
        isFree: false,
        message: 'Envío no disponible para esta ubicación',
      };
    }

    const cost = rule.is_free ? 0 : rule.base_cost;

    return {
      available: true,
      cost,
      isFree: rule.is_free,
      ruleId: rule.id,
      message: rule.is_free ? 'Envío gratis' : `Costo de envío: $${cost.toFixed(2)}`,
    };
  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    return {
      available: false,
      cost: 0,
      isFree: false,
      message: 'Error al calcular el costo de envío',
    };
  }
}
