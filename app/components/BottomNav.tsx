"use client";

import { TabId } from "../lib/types";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: "dashboard", label: "Panel", icon: "📊" },
  { id: "mp", label: "Mat.Prima", icon: "📦" },
  { id: "camara", label: "Camara", icon: "❄️" },
  { id: "produccion", label: "Produccion", icon: "⚗️" },
  { id: "envasado", label: "Envasado", icon: "🏷️" },
  { id: "pcc_comp", label: "PCC Comp", icon: "🔬" },
  { id: "pcc_alim", label: "PCC Alim", icon: "🍽️" },
  { id: "stock", label: "Stock", icon: "📋" },
  { id: "trazabilidad", label: "Trazab.", icon: "🔗" },
  { id: "incidencias", label: "Incid.", icon: "⚠️" },
  { id: "formacion", label: "Curso", icon: "🎓" },
  { id: "firma", label: "Firma", icon: "✍️" },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max px-1 py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex flex-col items-center justify-center
                  min-w-[72px] min-h-[56px] px-3 py-2
                  rounded-lg mx-0.5 transition-colors
                  ${
                    isActive
                      ? "bg-green-50 border-b-2 border-green-600 text-green-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="text-xl leading-none">{tab.icon}</span>
                <span
                  className={`text-[11px] mt-1 font-medium whitespace-nowrap ${
                    isActive ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
