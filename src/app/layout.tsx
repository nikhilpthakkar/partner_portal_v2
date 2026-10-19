import type { Metadata } from 'next';
import '@/app/globals.css';
import Providers from '@/app/providers';
import { initAckoAnalytics } from '@acko-tech/building-blocks.ui.acko-analytics';
import { generateUUID } from '@/lib/utils/helpers';
import { getSegmentKey } from '@/lib/segment';
import DatadogRumInit from '@/components/datadogRumInit';
import { FINANCIAL_SIMULATOR_ENABLED } from '@/features/financial-workspace/config';

export const metadata: Metadata = {
  title: 'Partner Portal',
  description: 'Partner Portal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-screen overflow-hidden">
      <head>
        {(() => {
          if (FINANCIAL_SIMULATOR_ENABLED) return null;
          const uuid = generateUUID();
          return uuid ? (
            <script
              async
              defer
              type="text/javascript"
              dangerouslySetInnerHTML={{
                __html: initAckoAnalytics(uuid, getSegmentKey()),
              }}
            ></script>
          ) : null;
        })()}
      </head>
      <body className="h-screen overflow-hidden antialiased font-sans">
        {!FINANCIAL_SIMULATOR_ENABLED && <DatadogRumInit />}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
