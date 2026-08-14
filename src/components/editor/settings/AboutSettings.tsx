"use client";

import {
  Info,
  Rocket,
  Globe,
  BookOpen,
  Bug,
  MessageSquare,
  Shield,
  FileText,
  Heart,
  RefreshCw,
  GitBranch,
} from "lucide-react";

export default function AboutSettings() {

  const version = "1.0.0";

  return (

    <div className="p-8 space-y-10">

      {/* Header */}

      <div>

        <h2 className="text-2xl font-bold">

          About KnowledgeStream AI

        </h2>

        <p className="text-sm opacity-70 mt-2">

          Product information, updates and support.

        </p>

      </div>

      {/* Product */}

      <div className="rounded-xl border p-6">

        <div className="flex items-center gap-3 mb-5">

          <Rocket size={22} />

          <h3 className="font-semibold">

            Product

          </h3>

        </div>

        <div className="space-y-3 text-sm">

          <div className="flex justify-between">

            <span>Product Name</span>

            <span>KnowledgeStream AI IDE</span>

          </div>

          <div className="flex justify-between">

            <span>Version</span>

            <span>{version}</span>

          </div>

          <div className="flex justify-between">

            <span>Release Channel</span>

            <span>Stable</span>

          </div>

        </div>

      </div>

      {/* Company */}

      <div className="rounded-xl border p-6">

        <div className="flex items-center gap-3 mb-5">

          <Info size={22} />

          <h3 className="font-semibold">

            Company

          </h3>

        </div>

        <div className="space-y-3 text-sm">

          <div className="flex justify-between">

            <span>Company</span>

            <span>KnowledgeStream AI Pvt Ltd</span>

          </div>

          <div className="flex justify-between">

            <span>Country</span>

            <span>India</span>

          </div>

          <div className="flex justify-between">

            <span>Support</span>

            <span>support@knowledgestream.ai</span>

          </div>

        </div>

      </div>

      {/* Updates */}

      <div className="rounded-xl border p-6">

        <div className="flex items-center gap-3 mb-5">

          <RefreshCw size={22} />

          <h3 className="font-semibold">

            Updates

          </h3>

        </div>

        <button className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700">

          Check for Updates

        </button>

      </div>

      {/* Resources */}

      <div className="rounded-xl border p-6">

        <div className="flex items-center gap-3 mb-5">

          <BookOpen size={22} />

          <h3 className="font-semibold">

            Resources

          </h3>

        </div>

        <div className="space-y-3">

          <button className="flex items-center gap-3 hover:text-blue-500">

            <Globe size={18} />

            Official Website

          </button>

          <button className="flex items-center gap-3 hover:text-blue-500">

            <GitBranch size={18} />

            GitHub Repository

          </button>

          <button className="flex items-center gap-3 hover:text-blue-500">

            <BookOpen size={18} />

            Documentation

          </button>

        </div>

      </div>

      {/* Help */}

      <div className="rounded-xl border p-6">

        <div className="flex items-center gap-3 mb-5">

          <Bug size={22} />

          <h3 className="font-semibold">

            Help & Feedback

          </h3>

        </div>

        <div className="space-y-3">

          <button className="flex items-center gap-3 hover:text-blue-500">

            <Bug size={18} />

            Report Bug

          </button>

          <button className="flex items-center gap-3 hover:text-blue-500">

            <MessageSquare size={18} />

            Send Feedback

          </button>

        </div>

      </div>

      {/* Legal */}

      <div className="rounded-xl border p-6">

        <div className="flex items-center gap-3 mb-5">

          <Shield size={22} />

          <h3 className="font-semibold">

            Legal

          </h3>

        </div>

        <div className="space-y-3">

          <button className="flex items-center gap-3 hover:text-blue-500">

            <Shield size={18} />

            Privacy Policy

          </button>

          <button className="flex items-center gap-3 hover:text-blue-500">

            <FileText size={18} />

            Terms of Service

          </button>

          <button className="flex items-center gap-3 hover:text-blue-500">

            <BookOpen size={18} />

            Open Source Licenses

          </button>

        </div>

      </div>

      {/* Footer */}

      <div className="rounded-xl border p-6 text-center">

        <Heart
          size={28}
          className="mx-auto text-red-500 mb-4"
        />

        <h3 className="font-bold text-lg">

          Built with ❤️ by KnowledgeStream AI

        </h3>

        <p className="text-sm opacity-70 mt-2">

          Empowering the next generation of developers with AI.

        </p>

      </div>

    </div>

  );

}