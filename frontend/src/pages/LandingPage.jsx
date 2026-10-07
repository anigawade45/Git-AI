import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import ChatDemo from '@/components/landing/ChatDemo';
import AnalysisDemo from '@/components/landing/AnalysisDemo';
import Benefits from '@/components/landing/Benefits';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import { useMeta } from '@/hooks/useMeta';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  useMeta({
    title: 'GitHub Knowledge Assistant | AI-Powered Repository Analysis',
    description:
      'Understand, analyze, and document GitHub repositories using an AI-powered knowledge assistant with source code line citations.',
    robots: 'index, follow',
  });

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = (url) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      if (isAuthenticated) {
        navigate('/repository/ecommerce-platform');
      } else {
        navigate('/login');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main>
        <Hero onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        <Features />
        <HowItWorks />
        <ChatDemo />
        <AnalysisDemo />
        <Benefits />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}