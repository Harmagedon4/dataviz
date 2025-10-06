import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, PieChart, TrendingUp, Table, Download } from "lucide-react";
import DataTable from "@/components/DataTable";
import ChartComponent from "@/components/ChartComponent";
import { toast } from "sonner";

interface DashboardProps {
  data: any[];
  onBack: () => void;
}

const Dashboard = ({ data, onBack }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Basic statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const totalRows = data.length;
    const columns = Object.keys(data[0] || {});
    const numColumns = columns.length;
    
    // Calculate basic stats for numeric columns
    const numericColumns = columns.filter(col => 
      data.some(row => typeof row[col] === 'number' && !isNaN(row[col]))
    );
    
    const stringColumns = columns.filter(col => 
      data.some(row => typeof row[col] === 'string')
    );
    
    return {
      totalRows,
      numColumns,
      numericColumns,
      stringColumns,
      columns
    };
  }, [data]);

  const handleExport = () => {
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export-data.csv';
    a.click();
    
    toast.success("Données exportées avec succès!");
  };

  if (!data || data.length === 0) {
    return <div>Aucune donnée à afficher</div>;
  }

  return (
    <div className="min-h-screen bg-data p-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tableau de Bord</h1>
              <p className="text-muted-foreground">
                Analyse et visualisation de vos données
              </p>
            </div>
            <Button onClick={handleExport} className="shadow-elegant">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-glass">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-chart-1">{stats.totalRows}</div>
                <p className="text-sm text-muted-foreground">Lignes de données</p>
              </CardContent>
            </Card>
            
            <Card className="border-glass">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-chart-2">{stats.numColumns}</div>
                <p className="text-sm text-muted-foreground">Colonnes</p>
              </CardContent>
            </Card>
            
            <Card className="border-glass">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-chart-3">{stats.numericColumns.length}</div>
                <p className="text-sm text-muted-foreground">Colonnes numériques</p>
              </CardContent>
            </Card>
            
            <Card className="border-glass">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-chart-4">{stats.stringColumns.length}</div>
                <p className="text-sm text-muted-foreground">Colonnes texte</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center">
              <PieChart className="mr-2 h-4 w-4" />
              Graphiques
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Tendances
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center">
              <Table className="mr-2 h-4 w-4" />
              Données
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="border-glass shadow-glow">
              <CardHeader>
                <CardTitle>Aperçu des Données</CardTitle>
                <CardDescription>
                  Résumé statistique de votre jeu de données
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Colonnes détectées:</h4>
                    <div className="flex flex-wrap gap-2">
                      {stats?.columns.map((col) => (
                        <Badge 
                          key={col} 
                          variant={stats.numericColumns.includes(col) ? "default" : "secondary"}
                        >
                          {col}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Colonnes numériques:</h4>
                      <ul className="text-sm text-muted-foreground">
                        {stats?.numericColumns.map((col) => (
                          <li key={col}>• {col}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Colonnes texte:</h4>
                      <ul className="text-sm text-muted-foreground">
                        {stats?.stringColumns.map((col) => (
                          <li key={col}>• {col}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <ChartComponent data={data} />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="border-glass shadow-glow">
              <CardHeader>
                <CardTitle>Analyse de Tendances</CardTitle>
                <CardDescription>
                  Identification automatique des patterns dans vos données
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="mx-auto h-12 w-12 mb-4" />
                  <p>Analyse de tendances en développement...</p>
                  <p className="text-sm">Cette fonctionnalité sera disponible prochainement</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <DataTable data={data} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;