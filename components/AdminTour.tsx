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
      setActiveTab?.('orders');

      setStepIndex(nextStepIndex);
    }
  };

  const steps: Step[] = [
    {
      target: '.tour-sidebar-nav',
      content: 'Welcome to the Command Center! Let me show you how to process incoming orders.',
      placement: 'right',
    },
    {
      target: '.tour-tab-orders',
      content: 'Global Orders: This tab contains all customer purchases.',
      placement: 'right',
    },
    {
      target: '.tour-content-orders',
      content: 'Click on any order to view details and update its shipment status. (Note: Tracking codes are now automatically generated and emailed to the client upon payment!)',
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
