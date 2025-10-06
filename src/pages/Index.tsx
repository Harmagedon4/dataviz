import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Upload, Eye, Shield, Zap } from "lucide-react";
import DataUpload from "@/components/DataUpload";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'upload' | 'dashboard'>('home');
  const [data, setData] = useState<any[]>([]);

  const handleDataUploaded = (uploadedData: any[]) => {
    setData(uploadedData);
    setCurrentView('dashboard');
  };

  if (currentView === 'upload') {
    return <DataUpload onDataUploaded={handleDataUploaded} onBack={() => setCurrentView('home')} />;
  }

  if (currentView === 'dashboard' && data.length > 0) {
    return <Dashboard data={data} onBack={() => setCurrentView('home')} />;
  }

  return (
    <div className="min-h-screen bg-data">
      {/* Header */}
      <header className="border-b bg-glass backdrop-blur-sm border-glass">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">DataViz </h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Button variant="ghost" size="sm">Documentation</Button>
              <Button variant="ghost" size="sm">Support</Button>
              <Button size="sm">Commencer</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Analyse de données avancée
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-hero bg-clip-text text-transparent leading-tight">
              Système de Visualisation de Données
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transformez vos données anonymisées en insights percutants grâce à notre 
              plateforme d'analyse et de visualisation intelligente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg" 
                className="text-lg px-8 shadow-elegant"
                onClick={() => setCurrentView('upload')}
              >
                <Upload className="mr-2 h-5 w-5" />
                Importer des données
              </Button>
              
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Fonctionnalités Principales</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Une suite complète d'outils pour analyser, visualiser et partager vos données
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-glass shadow-glow">
              <CardHeader>
                <Upload className="h-12 w-12 text-chart-1 mb-4" />
                <CardTitle>Import Multi-formats</CardTitle>
                <CardDescription>
                  Support complet pour CSV, JSON, Excel et bases de données SQL avec validation automatique
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-glass shadow-glow">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-chart-2 mb-4" />
                <CardTitle>Analyse Intelligente</CardTitle>
                <CardDescription>
                  Détection automatique des tendances, corrélations et anomalies avec statistiques avancées
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-glass shadow-glow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-chart-3 mb-4" />
                <CardTitle>Visualisations Interactives</CardTitle>
                <CardDescription>
                  Graphiques responsives et personnalisables avec export haute qualité
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Performance */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Sécurité & Performance</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Shield className="h-16 w-16 text-chart-4 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Données Protégées</h3>
              <p className="text-muted-foreground">
                Chiffrement bout-en-bout et vérification d'anonymisation conforme RGPD
              </p>
            </div>
            
            <div className="text-center">
              <Zap className="h-16 w-16 text-chart-5 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Traitement Rapide</h3>
              <p className="text-muted-foreground">
                Analyse en moins de 5 secondes pour des datasets jusqu'à 1 million de lignes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-glass backdrop-blur-sm">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 DataViz Pro. Système de visualisation de données professionnel.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;