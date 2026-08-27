"use client"

import { useState, FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import DatePicker from 'react-datepicker';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { fetchEventSource } from '@microsoft/fetch-event-source';

const SPECIALTIES = ['General Practice', 'Pediatrics', 'Cardiology', 'Psychiatry', 'Orthopedics'] as const;
type Specialty = typeof SPECIALTIES[number];

export default function ConsultationForm() {
  const { getToken } = useAuth();

  const [patientName, setPatientName] = useState('');
  const [visitDate, setVisitDate] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState('');
  const [specialty, setSpecialty] = useState<Specialty>('General Practice');

  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setOutput('');
    setError('');
    setLoading(true);

    const jwt = await getToken();
    if (!jwt) {
      setError('Authentication required — please sign in again.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let buffer = '';

    try {
      await fetchEventSource('/api/consultation', {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          patient_name: patientName,
          date_of_visit: visitDate?.toISOString().slice(0, 10),
          notes,
          specialty,
        }),
        onmessage(ev) {
          buffer += ev.data;
          setOutput(buffer);
        },
        onclose() {
          setLoading(false);
        },
        onerror(err) {
          console.error('SSE error:', err);
          setError('Something went wrong. Please try again.');
          controller.abort();
          setLoading(false);
          throw err; // prevent fetchEventSource from retrying
        },
      });
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Consultation Notes
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">

        {/* Patient name */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Patient Name
          </label>
          <input
            type="text"
            required
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="e.g. Jane Smith"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Date + Specialty row */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date of Visit
            </label>
            <DatePicker
              selected={visitDate}
              onChange={(d: Date | null) => setVisitDate(d)}
              dateFormat="yyyy-MM-dd"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Specialty
            </label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value as Specialty)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
            >
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Premium input methods — coming soon */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Premium Input Methods
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/40 opacity-70 cursor-not-allowed select-none">
              <span className="text-2xl">🎙️</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Voice Input</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dictate your notes</p>
              </div>
              <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                Coming Soon
              </span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/40 opacity-70 cursor-not-allowed select-none">
              <span className="text-2xl">🖼️</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Image Upload</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Photo of handwritten notes</p>
              </div>
              <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Consultation Notes
          </label>
          <textarea
            required
            rows={8}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter your free-text consultation notes here..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white resize-y"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? 'Generating…' : 'Generate Summary'}
        </button>
      </form>

      {output && (
        <section className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <OutputActions text={output} />
          <div className="markdown-content prose prose-blue dark:prose-invert max-w-none mt-4">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {output}
            </ReactMarkdown>
          </div>
        </section>
      )}
    </div>
  );
}

function OutputActions({ text }: { text: string }) {
  function copy() {
    navigator.clipboard.writeText(text);
  }

  function download() {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'consultation-summary.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2 justify-end">
      <button
        onClick={copy}
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
      >
        Copy
      </button>
      <button
        onClick={download}
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
      >
        Download .md
      </button>
    </div>
  );
}
