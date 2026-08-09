"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Award, Sparkles, AlertTriangle, Download, ArrowLeft } from "lucide-react";

export default function PublicVerifyCertificatePage() {
  const params = useParams();
  const router = useRouter();
  const verificationId = params.verificationId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cert, setCert] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchCertificate = async () => {
    try {
      const res = await fetch(`/api/certificates/share/${verificationId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setCert(json.certificate);
      } else {
        setError(json.error || "Certificate verification failed. Record not found.");
      }
    } catch (err) {
      console.error(err);
      setError("Network connection issue verifying certificate.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (verificationId) {
      fetchCertificate();
    }
  }, [verificationId]);

  // Dynamic Certificate Drawing for Download
  const handleDownload = () => {
    if (!cert || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set dimensions
    canvas.width = 1000;
    canvas.height = 700;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 1000, 700);
    grad.addColorStop(0, "#0F172A"); // Dark theme canvas background
    grad.addColorStop(1, "#1E1B4B");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1000, 700);

    // Decorative Borders
    ctx.strokeStyle = "#4F46E5";
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, 960, 660);
    ctx.strokeStyle = "#06B6D4";
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 35, 930, 630);

    // Branding Title
    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = "#22D3EE";
    ctx.textAlign = "center";
    ctx.fillText("KNOWLEDGE STREAM AI • OS 3.0", 500, 100);

    // Main Certificate Header
    ctx.font = "bold 44px Georgia, serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("CERTIFICATE OF COMPLETION", 500, 180);

    // Presentation text
    ctx.font = "italic 16px sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("This is proudly presented to", 500, 240);

    // Student Name
    ctx.font = "bold 38px sans-serif";
    ctx.fillStyle = "#F8FAFC";
    ctx.fillText(cert.studentName.toUpperCase(), 500, 310);

    // Course completion description
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText(`for successfully completing and mastering the curriculum of`, 500, 370);

    // Course Name
    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "#818CF8";
    ctx.fillText(cert.courseName, 500, 430);

    // Date and details
    const dateStr = new Date(cert.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    ctx.font = "15px sans-serif";
    ctx.fillStyle = "#64748B";
    ctx.fillText(`Awarded on ${dateStr} • Curated by Instructor ${cert.instructor || "KnowledgeStream Team"}`, 500, 490);

    // Divider Line
    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
    ctx.beginPath();
    ctx.moveTo(300, 530);
    ctx.lineTo(700, 530);
    ctx.stroke();

    // Verification ID info
    ctx.font = "bold 13px Courier, monospace";
    ctx.fillStyle = "#22D3EE";
    ctx.fillText(`CERTIFICATE ID: ${cert.uniqueId}`, 500, 570);
    ctx.font = "11px Courier, monospace";
    ctx.fillStyle = "#64748B";
    ctx.fillText(`VERIFIED STATE: SECURE CLOUD AUTHENTICATED`, 500, 595);

    // Trigger download
    const link = document.createElement("a");
    link.download = `ksai-certificate-${cert.uniqueId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center flex-col space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#4F46E5] animate-spin" />
        <div className="text-slate-500 text-xs font-mono">Verifying secure certificate ledger...</div>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center flex-col space-y-4">
        <div className="p-8 rounded-3xl border border-red-200 bg-red-50/50 max-w-md text-center space-y-4 shadow-sm">
          <AlertTriangle className="text-red-500 mx-auto" size={40} />
          <h2 className="text-lg font-bold text-slate-900">Verification Failure</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error || "This certificate could not be verified."}</p>
          <button 
            onClick={() => router.push("/auth")}
            className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all text-xs flex items-center gap-1.5 justify-center mx-auto"
          >
            <ArrowLeft size={13} /> Return to Login
          </button>
        </div>
      </div>
    );
  }

  const completionDate = new Date(cert.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center p-4 sm:p-8 font-sans antialiased">
      <div className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-10 space-y-8 relative">
        
        {/* Verification Ribbon Badge */}
        <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 text-xs font-extrabold shadow-sm">
          <CheckCircle2 size={13} className="fill-emerald-100" />
          VERIFIED RECORD
        </div>

        {/* Branding header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 p-[1px] flex items-center justify-center">
            <div className="w-full h-full bg-[#09090B] rounded-[11px] flex items-center justify-center">
              <Award size={18} className="text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none">KnowledgeStream AI</h1>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wide">SECURE CREDENTIAL REGISTRY</span>
          </div>
        </div>

        {/* Dynamic Verification Content Card */}
        <div className="space-y-6 text-center py-4 bg-slate-50/50 rounded-2xl border border-slate-100 p-6">
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">This is to verify that student</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{cert.studentName}</h2>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">has completed and passed all chapters of</span>
            <h3 className="text-lg font-extrabold text-[#4F46E5]">{cert.courseName}</h3>
          </div>

          <div className="w-fit mx-auto px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-[11px] text-slate-500 font-medium">
            Awarded on {completionDate} &bull; Instructor {cert.instructor}
          </div>
        </div>

        {/* Technical specifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
          <div className="p-3.5 rounded-2xl border border-slate-100 bg-white">
            <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Certificate ID</div>
            <div className="text-xs font-mono font-bold text-slate-700 mt-1">{cert.uniqueId}</div>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-100 bg-white">
            <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Ledger Security</div>
            <div className="text-xs font-mono font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
              <CheckCircle2 size={13} /> Active &amp; Authenticated
            </div>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:opacity-95 shadow-md flex items-center justify-center gap-2"
          >
            <Download size={14} /> Download Certificate Image
          </button>
        </div>

        {/* Hidden Canvas for Render */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
