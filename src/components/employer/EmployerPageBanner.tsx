import React from "react";

interface BannerChip {
  label: string;
  value?: string | number;
}

interface EmployerPageBannerProps {
  tag?: string;
  title: string;
  subtitle?: string;
  chips?: BannerChip[];
  actions?: React.ReactNode;
}

const EmployerPageBanner: React.FC<EmployerPageBannerProps> = ({
  tag,
  title,
  subtitle,
  chips,
  actions,
}) => {
  return (
    <div className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-2">
        {tag && (
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/80">
            {tag}
          </p>
        )}
        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-white/90 max-w-3xl">{subtitle}</p>
        )}
        {chips && chips.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="px-3 py-1 rounded-md bg-white/15 border border-white/20 text-sm font-semibold"
              >
                {chip.label}
                {chip.value !== undefined && (
                  <span className="font-bold ml-1">{chip.value}</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      )}
    </div>
  );
};

export default EmployerPageBanner;
