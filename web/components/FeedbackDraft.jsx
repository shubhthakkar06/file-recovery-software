'use client';

import { useState } from 'react';

export default function FeedbackDraft() {
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [downloaded, setDownloaded] = useState(false);

  function downloadDraft(event) {
    event.preventDefault();
    const body = [
      'HDD File Recovery Suite feedback',
      `Date: ${new Date().toLocaleDateString()}`,
      `Topic: ${topic.trim()}`,
      '',
      details.trim(),
      '',
      'Please send this note through the course or project contact channel.',
    ].join('\n');
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recovery-suite-feedback.txt';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  }

  return (
    <form onSubmit={downloadDraft} className="card space-y-4 p-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Prepare feedback</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Your message stays in this browser. Download a note and share it through your course or project contact channel.</p>
      </div>
      <div>
        <label className="label" htmlFor="feedback-topic">Topic</label>
        <input id="feedback-topic" className="input" required maxLength={120} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="For example: agent setup on Windows 11" />
      </div>
      <div>
        <label className="label" htmlFor="feedback-details">What happened or what could be improved?</label>
        <textarea id="feedback-details" className="input min-h-36 resize-y" required maxLength={4000} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Describe the steps and what you expected to happen." />
      </div>
      <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">Please do not include passwords, verification codes, or recovered file contents.</p>
      <button type="submit" className="btn-primary">Download feedback note</button>
      {downloaded && <p role="status" className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Feedback note downloaded. It was not sent to the project automatically.</p>}
    </form>
  );
}
