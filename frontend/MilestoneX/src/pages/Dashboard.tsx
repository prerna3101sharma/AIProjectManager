import { useLocation } from "react-router-dom";

export default function Dashboard() {
  const location = useLocation();
  const { extractedText, message } = location.state || {};

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">
        Project Dashboard
      </h1>

      <div className="bg-slate-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2 text-green-400">
          {message}
        </h2>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-purple-400">
          Extracted Requirements
        </h2>
        <pre className="whitespace-pre-wrap text-gray-300">
          {extractedText}
        </pre>
      </div>
    </div>
  );
}