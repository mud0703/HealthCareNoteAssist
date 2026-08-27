"use client"

import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">

        {/* Nav */}
        <nav className="flex justify-between items-center mb-16">
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
            HealthCareNoteAssist
          </span>
          <div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-4">
                <Link
                  href="/product"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition-colors"
                >
                  Open App
                </Link>
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </nav>

        {/* Hero */}
        <div className="text-center py-20 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-50 mb-6 leading-tight">
            Turn rough notes into<br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              clinical documentation
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto">
            Paste your consultation notes and get a structured medical summary, action
            checklist, and patient-friendly email — in seconds.
          </p>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
            {[
              { icon: '📋', title: 'Doctor Summary', desc: 'Structured notes ready for the medical record' },
              { icon: '✅', title: 'Action Checklist', desc: 'Clear next steps so nothing falls through the cracks' },
              { icon: '📧', title: 'Patient Email', desc: 'Plain-language communication drafted automatically' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-2xl mb-2">{icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all">
                Get started free
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/product">
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all">
                Open app
              </button>
            </Link>
          </SignedIn>
        </div>

        <p className="text-center text-xs text-gray-400 mt-16">
          Demo only — not HIPAA compliant. Do not enter real patient data.
        </p>
      </div>
    </main>
  );
}
