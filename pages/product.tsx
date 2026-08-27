"use client"

import { Protect, PricingTable, UserButton } from '@clerk/nextjs';
import ConsultationForm from '@/components/ConsultationForm';

export default function Product() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4">
        <UserButton />
      </div>

      <Protect
        plan="premium_subscription"
        fallback={
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              Choose a plan
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Unlock the consultation assistant with a subscription.
            </p>

            {/* Feature preview */}
            <div className="max-w-xl mx-auto grid sm:grid-cols-3 gap-4 mb-10 text-left">
              {[
                { icon: '📋', label: 'Doctor Summary', desc: 'Structured notes for the record' },
                { icon: '✅', label: 'Action Checklist', desc: 'Clear next steps, every visit' },
                { icon: '✉️', label: 'Patient Email', desc: 'Plain-language draft, instantly' },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <span className="text-2xl">{icon}</span>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{desc}</p>
                </div>
              ))}
            </div>

            {/* Coming soon teaser */}
            <p className="text-xs uppercase tracking-widest text-blue-500 dark:text-blue-400 font-semibold mb-3">
              Coming soon for premium members
            </p>
            <div className="max-w-xl mx-auto grid sm:grid-cols-2 gap-3 mb-10 text-left">
              {[
                { icon: '🎙️', label: 'Voice Input', desc: 'Dictate your consultation notes' },
                { icon: '🖼️', label: 'Image Upload', desc: 'Photo of handwritten notes' },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                    Soon
                  </span>
                </div>
              ))}
            </div>

            <div className="max-w-3xl mx-auto">
              <PricingTable />
            </div>
          </div>
        }
      >
        <ConsultationForm />
      </Protect>
    </main>
  );
}
