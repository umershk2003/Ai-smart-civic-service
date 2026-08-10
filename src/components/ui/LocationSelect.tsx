import React from 'react';
import {
  getProvinces,
  getDivisions,
  getDistricts,
  getTehsils,
  getMunicipalities,
  getWards,
  getAreas,
  LocationSelection,
} from '../../data/locations';

export type LocationLevel = 'province' | 'division' | 'district' | 'tehsil' | 'municipality' | 'ward' | 'area';

interface LocationSelectProps {
  value: LocationSelection;
  onChange: (sel: LocationSelection) => void;
  /** Which levels to render (default: the full cascade) */
  levels?: LocationLevel[];
  /** Use a compact grid instead of stacked rows */
  compact?: boolean;
}

const LEVEL_LABELS: Record<LocationLevel, string> = {
  province: 'Province',
  division: 'Division',
  district: 'District',
  tehsil: 'Tehsil / Taluka',
  municipality: 'Municipality',
  ward: 'Ward',
  area: 'Area',
};

const inputClass =
  'w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

/**
 * Cascading Pakistan location dropdowns: selecting a level filters the next.
 * No maps — plain structured administrative forms.
 */
export const LocationSelect: React.FC<LocationSelectProps> = ({
  value,
  onChange,
  levels = ['province', 'division', 'district', 'tehsil', 'municipality', 'ward', 'area'],
  compact = false,
}) => {
  const update = (patch: Partial<LocationSelection>) => {
    onChange({ ...value, ...patch });
  };

  const provinces = getProvinces();
  const divisions = value.provinceId ? getDivisions(value.provinceId) : [];
  const districts = value.divisionId ? getDistricts(value.divisionId) : [];
  const tehsils = value.districtId ? getTehsils(value.districtId) : [];
  const municipalities = value.tehsilId ? getMunicipalities(value.tehsilId) : [];
  const wards = value.municipalityId ? getWards(value.municipalityId) : [];
  const areas = value.wardId ? getAreas(value.wardId) : [];

  const field = (level: LocationLevel) => {
    switch (level) {
      case 'province':
        return (
          <select
            aria-label="Province"
            value={value.provinceId}
            onChange={(e) =>
              update({
                provinceId: e.target.value,
                divisionId: undefined,
                districtId: undefined,
                tehsilId: undefined,
                municipalityId: undefined,
                wardId: undefined,
                area: undefined,
              })
            }
            className={inputClass}
          >
            <option value="">Select province</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        );
      case 'division':
        return (
          <select
            aria-label="Division"
            value={value.divisionId ?? ''}
            disabled={!value.provinceId}
            onChange={(e) =>
              update({
                divisionId: e.target.value || undefined,
                districtId: undefined,
                tehsilId: undefined,
                municipalityId: undefined,
                wardId: undefined,
                area: undefined,
              })
            }
            className={inputClass}
          >
            <option value="">Select division</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        );
      case 'district':
        return (
          <select
            aria-label="District"
            value={value.districtId ?? ''}
            disabled={!value.divisionId}
            onChange={(e) =>
              update({
                districtId: e.target.value || undefined,
                tehsilId: undefined,
                municipalityId: undefined,
                wardId: undefined,
                area: undefined,
              })
            }
            className={inputClass}
          >
            <option value="">Select district</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        );
      case 'tehsil':
        return (
          <select
            aria-label="Tehsil / Taluka"
            value={value.tehsilId ?? ''}
            disabled={!value.districtId}
            onChange={(e) =>
              update({
                tehsilId: e.target.value || undefined,
                municipalityId: undefined,
                wardId: undefined,
                area: undefined,
              })
            }
            className={inputClass}
          >
            <option value="">Select tehsil</option>
            {tehsils.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        );
      case 'municipality':
        return (
          <select
            aria-label="Municipality"
            value={value.municipalityId ?? ''}
            disabled={!value.tehsilId}
            onChange={(e) =>
              update({ municipalityId: e.target.value || undefined, wardId: undefined, area: undefined })
            }
            className={inputClass}
          >
            <option value="">Select municipality</option>
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        );
      case 'ward':
        return (
          <select
            aria-label="Ward"
            value={value.wardId ?? ''}
            disabled={!value.municipalityId}
            onChange={(e) => update({ wardId: e.target.value || undefined, area: undefined })}
            className={inputClass}
          >
            <option value="">Select ward</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        );
      case 'area':
        return (
          <select
            aria-label="Area"
            value={value.area ?? ''}
            disabled={!value.wardId}
            onChange={(e) => update({ area: e.target.value || undefined })}
            className={inputClass}
          >
            <option value="">Select area</option>
            {areas.map((a) => (
              <option key={a.id} value={a.name}>{a.name}</option>
            ))}
          </select>
        );
    }
  };

  const visibleLevels = levels.filter(Boolean) as LocationLevel[];

  return (
    <div className={compact ? 'grid grid-cols-2 gap-3 sm:grid-cols-3' : 'space-y-3'}>
      {visibleLevels.map((level) => (
        <div key={level} className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            {LEVEL_LABELS[level]}
          </label>
          {field(level)}
        </div>
      ))}
    </div>
  );
};
