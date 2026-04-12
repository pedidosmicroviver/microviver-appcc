"use client";

import { TabId } from "../lib/types";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navGroups: {
  label: string;
  tabs: { id: TabId; label: string; icon: string }[];
}[] = [
  {
    label: "",
    tabs: [{ id: "dashboard", label: "Panel", icon: "📊" }],
  },
  {
    label: "Operaciones",
    tabs: [
      { id: "mp", label: "Materias Primas", icon: "📦" },
      { id: "camara", label: "Fermentacion", icon: "🧫" },
      { id: "produccion", label: "Produccion", icon: "⚗️" },
      { id: "envasado", label: "Envasado", icon: "🏷️" },
    ],
  },
  {
    label: "Control",
    tabs: [
      { id: "pcc_comp", label: "PCC Complementos", icon: "🔬" },
      { id: "pcc_alim", label: "PCC Alimentos", icon: "🍽️" },
      { id: "stock", label: "Stock", icon: "📋" },
      { id: "trazabilidad", label: "Trazabilidad", icon: "🔗" },
      { id: "incidencias", label: "Incidencias", icon: "⚠️" },
    ],
  },
  {
    label: "Formacion",
    tabs: [
      { id: "formacion", label: "Curso APPCC", icon: "🎓" },
      { id: "firma", label: "Firma Digital", icon: "✍️" },
    ],
  },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-slate-200 z-50 flex flex-col overflow-y-auto shadow-sm">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
            M
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">Microviver</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">APPCC</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-4 pb-1.5">
                {group.label}
              </p>
            )}
            {group.tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left
                    transition-all duration-150 group
                    ${
                      isActive
                        ? "bg-green-50 text-green-700 border-l-[3px] border-green-600 pl-[9px] shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800 border-l-[3px] border-transparent pl-[9px]"
                    }
                  `}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="text-lg leading-none flex-shrink-0">{tab.icon}</span>
                  <span
                    className={`text-sm font-medium truncate ${
                      isActive ? "text-green-700" : "text-slate-600 group-hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100 text-[10px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>v1.0 Supabase</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Online
          </span>
        </div>
      </div>
    </aside>
  );
}
