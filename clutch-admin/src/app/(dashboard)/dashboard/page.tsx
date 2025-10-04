"use client";

import React from "react";
import { useLanguage } from "@/contexts/language-context";

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground font-sans">
            {t('dashboard.welcome')}
          </p>
        </div>
      </div>

      {/* Empty content area - ready for widgets */}
    </div>
  );
}


