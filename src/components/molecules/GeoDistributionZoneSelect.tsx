'use client';

import GeoDistributionRegionFilterSelect from '@/components/molecules/GeoDistributionRegionFilterSelect';
import { GEO_DISTRIBUTION_ALL_ZONES_PRESET_LABEL, formatGeoZoneOptionLabel } from '@/lib/constants/geoDistribution.constants';

type GeoDistributionZoneSelectProps = {
  zoneOptions: string[];
  isAllZonesPreset: boolean;
  selectedZones: string[];
  onAllZonesPresetChange: (enabled: boolean) => void;
  onSelectedZonesChange: (zones: string[]) => void;
  disabled?: boolean;
  className?: string;
};

export default function GeoDistributionZoneSelect({
  zoneOptions,
  isAllZonesPreset,
  selectedZones,
  onAllZonesPresetChange,
  onSelectedZonesChange,
  disabled,
  className,
}: GeoDistributionZoneSelectProps) {
  return (
    <GeoDistributionRegionFilterSelect
      presetLabel={GEO_DISTRIBUTION_ALL_ZONES_PRESET_LABEL}
      emptySelectionLabel="Select zones"
      isPresetActive={isAllZonesPreset}
      selectedItems={selectedZones}
      itemOptions={zoneOptions}
      onPresetChange={onAllZonesPresetChange}
      onSelectedItemsChange={onSelectedZonesChange}
      formatItemLabel={formatGeoZoneOptionLabel}
      disabled={disabled}
      className={className}
    />
  );
}
