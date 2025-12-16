import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Loader2 } from 'lucide-react';

const CostCalculator = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-mesh">
      <Header pageTitle="Cost Calculator" pageSubtitle="3D Printing Price Calculator" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-card/80 backdrop-blur-md border border-primary/20 rounded-lg shadow-glow overflow-hidden">
          <iframe
            src="https://print3dpricecalculator.lovable.app/"
            title="3D Printing Cost Calculator"
            className="w-full h-[calc(100vh-250px)] border-0"
            allow="clipboard-write"
            allowFullScreen
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CostCalculator;
