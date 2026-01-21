import {useCallback, useMemo, useState} from 'react';

import {CAMERA_BRANDS, getCameraPresetById} from '../data';

interface CameraSelectorStateOptions {
  selectedId?: string | null;
}

export const useCameraSelectorState = ({
  selectedId,
}: CameraSelectorStateOptions) => {
  const [search, setSearch] = useState('');
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);

  const selectedPreset = useMemo(
    () => (selectedId ? getCameraPresetById(selectedId) ?? null : null),
    [selectedId],
  );

  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return CAMERA_BRANDS;
    }
    return CAMERA_BRANDS.map(brand => ({
      ...brand,
      models: brand.models.filter(model => {
        const display = model.displayName.toLowerCase();
        const raw = model.model.toLowerCase();
        return display.includes(query) || raw.includes(query);
      }),
    })).filter(brand => brand.models.length > 0);
  }, [search]);

  const hasSearchQuery = Boolean(search.trim());

  const toggleBrand = useCallback((brandId: string) => {
    setExpandedBrand(prev => (prev === brandId ? null : brandId));
  }, []);

  const resetSearch = useCallback(() => {
    setSearch('');
  }, []);

  return {
    search,
    setSearch,
    expandedBrand,
    toggleBrand,
    selectedPreset,
    filteredBrands,
    hasSearchQuery,
    resetSearch,
  };
};
