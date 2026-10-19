'use client';

import GeoDistributionRegionFilterSelect from '@/components/molecules/GeoDistributionRegionFilterSelect';
import {
  GEO_DISTRIBUTION_TOP_N_PRESET_LABEL,
  formatGeoStateOptionLabel,
} from '@/lib/constants/geoDistribution.constants';

type GeoDistributionStateSelectProps = {
  stateOptions: string[];
  isTopNPreset: boolean;
  selectedStates: string[];
  onTopNPresetChange: (enabled: boolean) => void;
  onSelectedStatesChange: (states: string[]) => void;
  disabled?: boolean;
  className?: string;
};

export default function GeoDistributionStateSelect(props: GeoDistributionStateSelectProps) {
  return (
    <GeoDistributionRegionFilterSelect
      presetLabel={GEO_DISTRIBUTION_TOP_N_PRESET_LABEL}
      emptySelectionLabel="Select states"
      isPresetActive={props.isTopNPreset}
      selectedItems={props.selectedStates}
      itemOptions={props.stateOptions}
      onPresetChange={props.onTopNPresetChange}
      onSelectedItemsChange={props.onSelectedStatesChange}
      formatItemLabel={formatGeoStateOptionLabel}
      disabled={props.disabled}
      className={props.className}
    />
  );
}
