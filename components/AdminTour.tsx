'use client';

import React, { useEffect, useState } from 'react';
import { Joyride, STATUS, Step, EVENTS, ACTIONS } from 'react-joyride';

interface AdminTourProps {
  setActiveTab?: (tab: 'diagnostics' | 'orders' | 'promos' | 'products') => void;
}

export default function AdminTour({ setActiveTab }: AdminTourProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('adminTourCompleted');
    if (!tourCompleted) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { action, index, status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      localStorage.setItem('adminTourCompleted', 'true');
      setRun(false);
      return;
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      
      // Navigate to the correct tab based on the upcoming step
      if (nextStepIndex === 1 || nextStepIndex === 2) setActiveTab?.('diagnostics');
      if (nextStepIndex === 3 || nextStepIndex === 4) setActiveTab?.('orders');
      if (nextStepIndex === 5 || nextStepIndex === 6) setActiveTab?.('promos');
      if (nextStepIndex === 7 || nextStepIndex === 8) setActiveTab?.('products');

      setStepIndex(nextStepIndex);
    }
  };

  const steps: Step[] = [
    {
      target: '.tour-sidebar-nav',
      content: 'Welcome to the Command Center! Let me show you the key sections.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '.tour-tab-diagnostics',
      content: 'System Diagnostics: Your control panel for system health.',
      placement: 'right',
    },
    {
      target: '.tour-content-diagnostics',
      content: 'Here you can view real-time traffic, active sessions, and check the database encryption status.',
      placement: 'left',
    },
    {
      target: '.tour-tab-orders',
      content: 'Global Orders: Manage your incoming orders.',
      placement: 'right',
    },
    {
      target: '.tour-content-orders',
      content: 'You can update statuses to "Shipped" and add tracking numbers directly here.',
      placement: 'left',
    },
    {
      target: '.tour-tab-promos',
      content: 'Discounts: Create and manage FOMO-inducing promo codes.',
      placement: 'right',
    },
    {
      target: '.tour-content-promos',
      content: 'Set percentage discounts and disable old codes easily from this panel.',
      placement: 'left',
    },
    {
      target: '.tour-tab-products',
      content: 'Products: Control your inventory.',
      placement: 'right',
    },
    {
      target: '.tour-content-products',
      content: 'Edit stock quantities for each product and dispatch mass email stock alerts to your subscribers from here.',
      placement: 'left',
    },
  ];

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      onEvent={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
        },
        tooltip: {
          backgroundColor: '#0A0A0A',
          color: '#F9F9F7',
          textAlign: 'left',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        buttonPrimary: {
          backgroundColor: '#800000',
          color: '#F9F9F7',
          fontFamily: 'sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '10px 16px',
          borderRadius: '0',
        },
        buttonBack: {
          color: '#8c8c87',
          fontFamily: 'sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontSize: '10px',
        },
        buttonSkip: {
          color: '#8c8c87',
          fontFamily: 'sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontSize: '10px',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }
      }}
    />
  );
}
