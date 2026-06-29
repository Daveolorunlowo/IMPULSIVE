'use client';

import React, { useEffect, useState } from 'react';
import { Joyride, STATUS, Step } from 'react-joyride';

export default function AdminTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('adminTourCompleted');
    if (!tourCompleted) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      localStorage.setItem('adminTourCompleted', 'true');
      setRun(false);
    }
  };

  const steps: Step[] = [
    {
      target: '.tour-sidebar-nav',
      content: 'Welcome to the Command Center! This is your control panel for the entire operation. Let me show you around.',

      placement: 'right',
    },
    {
      target: '.tour-tab-diagnostics',
      content: 'System Diagnostics: Here you can view real-time traffic, active sessions, and check the database encryption status.',
      placement: 'right',
    },
    {
      target: '.tour-tab-orders',
      content: 'Global Orders: Manage your incoming orders. You can update statuses to "Shipped" and add tracking numbers directly here.',
      placement: 'right',
    },
    {
      target: '.tour-tab-promos',
      content: 'Discounts: Create and manage FOMO-inducing promo codes. Set percentage discounts and disable old codes.',
      placement: 'right',
    },
    {
      target: '.tour-tab-products',
      content: 'Products: Control your inventory. You can edit stock quantities for each product and dispatch mass email stock alerts to your subscribers from here.',
      placement: 'right',
    },
  ];

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
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
