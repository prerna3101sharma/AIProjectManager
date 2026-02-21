import { useState } from "react";
import axios from "axios";
import logo from "../assets/logo.svg";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setError("Please upload an SRS file.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("srsFile", file);

    try {
      const response = await axios.post(
        "https://dummyjson.com/posts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Response:", response.data);
      setSuccess(true);
      setFile(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: "📊", title: "Smart Analysis", desc: "Intelligent SRS Document Analysis" },
    { icon: "🏗️", title: "Auto Structure", desc: "Automatic Project Structure Generation" },
    { icon: "📋", title: "Task Board", desc: "Kanban Task Board Creation" },
    { icon: "👥", title: "Team Setup", desc: "Team Assignment & Workload Distribution" },
  ];

  const steps = [
    { num: "1", title: "Upload", desc: "Upload your SRS document" },
    { num: "2", title: "Analyze", desc: "AI analyzes requirements" },
    { num: "3", title: "Generate", desc: "Generate project plans" },
    { num: "4", title: "Export", desc: "Share with your team" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto w-full text-center">
          {/* Logo */}
          <div className="mb-8 mt-8 flex justify-center">
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-1 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300">
              <img src={logo} alt="Logo" className="w-full h-full object-contain rounded-2xl bg-slate-950" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-balance bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
            AI Project Architect
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform your SRS into actionable project plans. Upload your Software Requirements Specification and let AI generate comprehensive project structures and Kanban tasks instantly.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-16">
            {/* File Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group ${
                dragActive
                  ? "border-blue-500 bg-blue-500/10 scale-105"
                  : "border-blue-400/30 bg-slate-800/40 hover:border-blue-400/60"
              }`}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer rounded-2xl"
                required
              />

              {file ? (
                <div className="space-y-3">
                  <div className="text-4xl">✓</div>
                  <p className="font-semibold text-lg text-green-400">{file.name}</p>
                  <p className="text-sm text-gray-400">Ready to upload</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-5xl group-hover:scale-110 transition-transform duration-300">📄</div>
                  <p className="font-semibold text-lg">Upload Your SRS Document</p>
                  <p className="text-sm text-gray-400">Drag and drop or click to browse</p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT, MD</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm animate-pulse">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm animate-pulse">
                ✓ File uploaded successfully! Generating your project plan...
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !file}
              className="mt-8 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-105 transform"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating Project Plan...
                </span>
              ) : (
                "Generate Project Plan"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* About Section */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950">
        <div className="max-w-6xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Four simple steps to transform your requirements into actionable project plans
            </p>
          </div>

          {/* Timeline Steps */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                {/* Connection line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[55%] right-[-110%] h-1 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                )}

                {/* Card */}
                <div className="bg-slate-800/40 backdrop-blur-xl border border-blue-500/20 hover:border-blue-500/50 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 h-full">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg mb-4 mx-auto shadow-lg">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-blue-300">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div>
            <h3 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Key Features
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="group bg-slate-800/30 hover:bg-slate-800/60 border border-blue-500/20 hover:border-blue-500/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-2"
                >
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h4 className="font-bold text-blue-300 mb-2">{feature.title}</h4>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
