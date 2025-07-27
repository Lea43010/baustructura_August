import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Crown, Shield, Zap, ArrowLeft } from 'lucide-react';

export default function PricingPage() {
  const [, setLocation] = useLocation();
  const [isAnnual, setIsAnnual] = useState(true); // Default: Jährlich mit Rabatt

  const plans = [
    {
      name: "Basic",
      monthlyPrice: 21,
      icon: <Shield className="h-6 w-6" />,
      color: "border-blue-200 bg-blue-50",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
      features: [
        "Bis zu 5 Projekte",
        "GPS-Tracking",
        "Basis-Dokumentation", 
        "Mobile App",
        "E-Mail Support"
      ]
    },
    {
      name: "Professional",
      monthlyPrice: 39,
      icon: <Zap className="h-6 w-6" />,
      color: "border-green-200 bg-green-50",
      buttonColor: "bg-green-500 hover:bg-green-600",
      popular: true,
      features: [
        "Unbegrenzte Projekte",
        "Erweiterte GPS-Features",
        "Hochwasserschutz-Modul",
        "SFTP File-Server",
        "Team-Collaboration",
        "Priority Support"
      ]
    },
    {
      name: "Enterprise",
      monthlyPrice: 99,
      icon: <Crown className="h-6 w-6" />,
      color: "border-purple-200 bg-purple-50",
      buttonColor: "bg-purple-500 hover:bg-purple-600",
      features: [
        "Alle Professional Features",
        "KI-Projektanalyse",
        "Custom Integrationen",
        "Dedicated Support",
        "On-Premise Option",
        "SLA Garantie"
      ]
    }
  ];

  const calculatePrice = (monthlyPrice: number) => {
    if (isAnnual) {
      const annualPrice = monthlyPrice * 12;
      const discountedPrice = Math.round(annualPrice * 0.9); // 10% Rabatt
      return {
        price: discountedPrice,
        savings: annualPrice - discountedPrice,
        period: 'Jahr'
      };
    } else {
      return {
        price: monthlyPrice,
        savings: 0,
        period: 'Monat'
      };
    }
  };

  const handleSelectPlan = (licenseType: string, monthlyPrice: number) => {
    const subscriptionType = isAnnual ? 'annual' : 'monthly';
    const pricing = calculatePrice(monthlyPrice);
    
    // Redirect to checkout with subscription parameters
    setLocation(`/checkout?license=${licenseType}&subscription=${subscriptionType}&price=${pricing.price}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zurück</span>
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Preise & Pakete</h1>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Subscription Toggle */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Wählen Sie Ihr Bau-Structura Paket
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Professionelles Bauprojekt-Management für Teams jeder Größe
          </p>
          
          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Label htmlFor="billing-toggle" className={`text-lg font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monatlich
            </Label>
            <div className="relative">
              <Switch
                id="billing-toggle"
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-green-500"
              />
              {isAnnual && (
                <Badge className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                  10% sparen
                </Badge>
              )}
            </div>
            <Label htmlFor="billing-toggle" className={`text-lg font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Jährlich
            </Label>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const pricing = calculatePrice(plan.monthlyPrice);
            
            return (
              <Card key={plan.name} className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-green-500' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                    Beliebteste Wahl
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  
                  <div className="mt-4">
                    <div className="text-4xl font-bold text-gray-900">
                      {pricing.price}€
                    </div>
                    <div className="text-sm text-gray-600">
                      pro {pricing.period}
                      {!isAnnual && ' (monatlich kündbar)'}
                    </div>
                    
                    {isAnnual && pricing.savings > 0 && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Sie sparen {pricing.savings}€ im Jahr
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button 
                    className={`w-full ${plan.buttonColor} text-white`}
                    onClick={() => handleSelectPlan(plan.name.toLowerCase(), plan.monthlyPrice)}
                  >
                    {plan.name} wählen
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Payment Info */}
        <div className="text-center mt-12 p-6 bg-gray-50 rounded-lg max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Flexible Zahlungsoptionen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🎯 Jährliche Zahlung</h4>
              <ul className="space-y-1">
                <li>✅ 10% Rabatt auf alle Pläne</li>
                <li>✅ Einmalige Zahlung für 12 Monate</li>
                <li>✅ Keine monatlichen Abbuchungen</li>
                <li>✅ Optimale Kostenkontrolle</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📅 Monatliche Zahlung</h4>
              <ul className="space-y-1">
                <li>✅ Monatlich kündbar</li>
                <li>✅ Flexibilität bei Projektzyklen</li>
                <li>✅ Niedrige Einstiegskosten</li>
                <li>✅ Automatische Verlängerung</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            Alle Preise verstehen sich zzgl. der gesetzlichen MwSt. 
            Sichere Zahlung über Stripe. Sofortige Lizenz-Aktivierung nach Zahlungseingang.
          </div>
        </div>
      </div>
    </div>
  );
}