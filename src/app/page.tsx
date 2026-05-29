"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, Settings2, Loader2 } from 'lucide-react';

export default function Home() {
  const [jd, setJd] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jd.trim()) {
      setError("Please provide a Job Description.");
      return;
    }
    if (files.length === 0) {
      setError("Please upload at least one resume.");
      return;
    }
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('jobDescription', jd);
      files.forEach(file => {
        formData.append('resumes', file);
      });

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze resumes');
      }

      router.push(`/results?jdId=${data.jdId}`);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 bg-white p-10 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center">
          <Settings2 className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Resume Screening & Ranking</h2>
          <p className="mt-2 text-sm text-gray-600">
            Upload resumes and a Job Description to automatically rank candidates based on skill match.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="jd" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Job Description
              </label>
              <textarea
                id="jd"
                name="jd"
                rows={6}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Paste the full job description here..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <UploadCloud className="w-4 h-4" />
                Upload Resumes (PDF, DOCX)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Select files</span>
                      <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOCX up to 10MB
                  </p>
                </div>
              </div>
              
              {files.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Selected Files ({files.length}):</h4>
                  <ul className="mt-2 text-sm text-gray-500 max-h-32 overflow-y-auto list-disc pl-5">
                    {files.map((f, i) => (
                      <li key={i} className="truncate">{f.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Analyzing...' : 'Start Screening'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
