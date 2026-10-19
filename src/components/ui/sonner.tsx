'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:h-8 group-[.toast]:rounded-md group-[.toast]:border group-[.toast]:border-input group-[.toast]:bg-white group-[.toast]:px-3 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:text-foreground group-[.toast]:shadow-xs',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success: '!bg-green-50 !border-green-200 !text-green-900 !shadow-green-100/50',
          error: '!bg-red-50 !border-red-200 !text-red-900 !shadow-red-100/50',
          info: '!bg-blue-50 !border-blue-200 !text-blue-900 !shadow-blue-100/50',
          warning: '!bg-amber-50 !border-amber-200 !text-amber-900 !shadow-amber-100/50',
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius-lg)',
        } as React.CSSProperties
      }
      position="top-center"
      {...props}
    />
  );
};

export { Toaster };
