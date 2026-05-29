"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Download, ChevronLeft, Search, UserCircle, CheckCircle2, XCircle } from 'lucide-react';

function ResultsContent() {
  const searchParams = useSearchParams();
  const jdId = searchParams.get('jdId');
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResume, setSelectedResume] = useState<any>(null);

  useEffect(() => {
    if (!jdId) {
      setError("No Job Description ID provided.");
      setLoading(false);
      return;
    }

    fetch(`/api/results?jdId=${jdId}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.error) {
          setError(resData.error);
        } else {
          setData(resData.data);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [jdId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <p className="text-red-600 text-lg mb-4">{error || "Data not found"}</p>
        <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">Go Back</button>
      </div>
    );
  }

  const handleExportCSV = () => {
    const headers = ['Rank', 'Candidate Name', 'File Name', 'Score', 'Matched Skills', 'Missing Skills'];
    const rows = data.resumes.map((r: any, i: number) => [
      i + 1,
      r.candidateName,
      r.fileName,
      r.matchScore + '%',
      JSON.parse(r.matchedSkills).join(', '),
      JSON.parse(r.missingSkills).join(', ')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map((e: any[]) => `"${e.join('","')}"`)].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ranked_candidates.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredResumes = data.resumes.filter((r: any) => 
    r.candidateName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <button onClick={() => router.push('/')} className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-2 transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" />
              New Screening
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Screening Results</h1>
            <p className="text-sm text-gray-500 mt-1">Found {data.resumes.length} candidates for Job Description ID: {data.id.slice(0,8)}...</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Candidates List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResumes.map((resume: any, index: number) => (
                    <tr 
                      key={resume.id} 
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedResume?.id === resume.id ? 'bg-blue-50/50' : ''}`}
                      onClick={() => setSelectedResume(resume)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserCircle className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{resume.candidateName}</div>
                            <div className="text-sm text-gray-500">{resume.fileName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${resume.matchScore}%` }}></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{resume.matchScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedResume(resume); }} className="text-blue-600 hover:text-blue-900">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredResumes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No candidates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedResume ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Candidate Details</h3>
                <div className="space-y-6">
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 text-green-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Matched Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(selectedResume.matchedSkills).map((skill: string, i: number) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {skill}
                        </span>
                      ))}
                      {JSON.parse(selectedResume.matchedSkills).length === 0 && (
                        <span className="text-sm text-gray-500">No matching skills found.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 text-red-700 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Missing Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(selectedResume.missingSkills).map((skill: string, i: number) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {skill}
                        </span>
                      ))}
                      {JSON.parse(selectedResume.missingSkills).length === 0 && (
                        <span className="text-sm text-gray-500">No missing skills!</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Extracted Text Preview</h4>
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200 h-48 overflow-y-auto">
                      <p className="text-xs text-gray-600 whitespace-pre-wrap">
                        {selectedResume.rawText.substring(0, 1000)}...
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <UserCircle className="w-12 h-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No Candidate Selected</h3>
                <p className="text-sm text-gray-500 mt-1">Select a candidate from the list to view their matching details and missing skills.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}

export default function Results() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
