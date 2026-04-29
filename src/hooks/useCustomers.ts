import { useMemo } from 'react';
import {
  customers,
  northwindPostFlipState,
  type Customer,
  type HealthSignal,
} from '../data/customers';
import { useApp } from '../state/AppContext';

const NORTHWIND_ID = 8;

function computeOverall(signals: {
  responsiveness: HealthSignal;
  ticketVolume: HealthSignal;
  milestoneProgress: HealthSignal;
  stakeholderEngagement: HealthSignal;
}): HealthSignal {
  const values = Object.values(signals);
  const reds = values.filter((s) => s === 'red').length;
  const ambers = values.filter((s) => s === 'amber').length;
  if (reds >= 2) return 'red';
  if (reds >= 1 || ambers >= 1) return 'amber';
  return 'green';
}

export function useCustomers(): Customer[] {
  const { state } = useApp();
  const { northwindFlipped, northwindFlipInProgress, northwindFlipProgress } =
    state;

  return useMemo(() => {
    return customers.map((c) => {
      if (c.id !== NORTHWIND_ID) return c;

      if (northwindFlipped) {
        return { ...c, ...northwindPostFlipState };
      }

      if (northwindFlipInProgress) {
        const overall = computeOverall({
          responsiveness: c.health.responsiveness,
          ticketVolume: northwindFlipProgress.ticketsState,
          milestoneProgress: northwindFlipProgress.milestoneState,
          stakeholderEngagement: northwindFlipProgress.stakeholderState,
        });
        return {
          ...c,
          health: {
            ...c.health,
            ticketVolume: northwindFlipProgress.ticketsState,
            milestoneProgress: northwindFlipProgress.milestoneState,
            stakeholderEngagement: northwindFlipProgress.stakeholderState,
            overall,
          },
          // Surface the auto-promotion intent the moment the banner-visible
          // signal fires; tier stays senior_migration until COMPLETE so the
          // queue grouping doesn't move yet.
          tierTransition: northwindFlipProgress.bannerVisible
            ? 'auto_promoted'
            : c.tierTransition,
          originalTier: northwindFlipProgress.bannerVisible
            ? 'senior_migration'
            : c.originalTier,
        };
      }

      return c;
    });
  }, [northwindFlipped, northwindFlipInProgress, northwindFlipProgress]);
}
