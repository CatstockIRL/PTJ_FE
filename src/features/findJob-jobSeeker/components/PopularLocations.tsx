import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { NavLink } from "react-router-dom";

export const PopularLocations = () => {
  const { popularLocations, loading } = useSelector((state: RootState) => state.findJob);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="h-6 w-24 animate-pulse rounded bg-slate-200 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((index) => (
            <div key={index} className="h-4 w-full animate-pulse rounded bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Địa điểm nổi bật</p>
        <p className="text-lg font-semibold text-slate-900 mb-3">Nơi làm việc được quan tâm</p>
        <div className="space-y-3">
          {popularLocations.map((location) => (
            <NavLink
              key={location.id}
              to={`/viec-lam/tai-${location.id}`}
              className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 text-sm text-slate-700 transition hover:border-blue-200 hover:text-blue-900"
            >
              <span>{location.name}</span>
              <span className="text-slate-500">{location.count.toLocaleString("vi-VN")} việc</span>
            </NavLink>
          ))}
        </div>
      </div>
    </section>
  );
};
