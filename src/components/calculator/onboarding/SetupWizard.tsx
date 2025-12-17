import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Printer, Palette, Zap, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { PrinterStep } from './PrinterStep';
import { FilamentStep } from './FilamentStep';
import { ElectricityStep } from './ElectricityStep';

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: CheckCircle },
  { id: 'printer', title: 'Add Printer', icon: Printer },
  { id: 'filament', title: 'Add Filament', icon: Palette },
  { id: 'electricity', title: 'Electricity', icon: Zap },
  { id: 'complete', title: 'Complete', icon: CheckCircle },
];

export function SetupWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState({
    printer: false,
    filament: false,
    electricity: false,
  });

  useEffect(() => {
    checkAuthAndSetup();
  }, []);

  const checkAuthAndSetup = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUserId(user.id);

    // Check existing setup
    const [printersRes, filamentsRes, electricityRes] = await Promise.all([
      supabase.from('calc_printers').select('id').eq('user_id', user.id).limit(1),
      supabase.from('calc_filaments').select('id').eq('user_id', user.id).limit(1),
      supabase.from('calc_electricity_settings').select('id').eq('user_id', user.id).limit(1),
    ]);

    const hasPrinter = (printersRes.data?.length || 0) > 0;
    const hasFilament = (filamentsRes.data?.length || 0) > 0;
    const hasElectricity = (electricityRes.data?.length || 0) > 0;

    setCompletedSteps({
      printer: hasPrinter,
      filament: hasFilament,
      electricity: hasElectricity,
    });

    // If all done, skip to calculator
    if (hasPrinter && hasFilament && hasElectricity) {
      navigate('/calculator');
      return;
    }

    setLoading(false);
  };

  const progress = ((currentStep) / (STEPS.length - 1)) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (step: 'printer' | 'filament' | 'electricity') => {
    setCompletedSteps({ ...completedSteps, [step]: true });
    handleNext();
  };

  const handleFinish = () => {
    toast({
      title: 'Setup Complete!',
      description: 'You can now start calculating print costs.',
    });
    navigate('/calculator/prints');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${isActive ? 'bg-primary text-primary-foreground' : ''}
                    ${isCompleted ? 'bg-primary/20 text-primary' : ''}
                    ${!isActive && !isCompleted ? 'bg-muted text-muted-foreground' : ''}
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        {currentStep === 0 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to Price Calculator</CardTitle>
              <CardDescription>
                Let's set up your calculator in just a few steps. We'll add your first printer, filament, and electricity settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Printer className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Add Your Printer</h3>
                    <p className="text-sm text-muted-foreground">Configure your 3D printer with power and depreciation settings</p>
                  </div>
                  {completedSteps.printer && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Palette className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Add Your Filament</h3>
                    <p className="text-sm text-muted-foreground">Set up filament costs per gram for accurate calculations</p>
                  </div>
                  {completedSteps.filament && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Zap className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Electricity Costs</h3>
                    <p className="text-sm text-muted-foreground">Configure your electricity rate for energy cost calculations</p>
                  </div>
                  {completedSteps.electricity && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
                </div>
              </div>
              <Button onClick={handleNext} className="w-full" size="lg">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 1 && userId && (
          <PrinterStep 
            userId={userId} 
            onComplete={() => handleStepComplete('printer')} 
            onBack={handleBack}
            isCompleted={completedSteps.printer}
          />
        )}

        {currentStep === 2 && userId && (
          <FilamentStep 
            userId={userId} 
            onComplete={() => handleStepComplete('filament')} 
            onBack={handleBack}
            isCompleted={completedSteps.filament}
          />
        )}

        {currentStep === 3 && userId && (
          <ElectricityStep 
            userId={userId} 
            onComplete={() => handleStepComplete('electricity')} 
            onBack={handleBack}
            isCompleted={completedSteps.electricity}
          />
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Setup Complete!</CardTitle>
              <CardDescription>
                You're all set! Your calculator is ready to use. Start by creating your first print calculation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span>Printer configured</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span>Filament added</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span>Electricity settings saved</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <Button onClick={handleFinish} className="w-full" size="lg">
                Start Calculating <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
