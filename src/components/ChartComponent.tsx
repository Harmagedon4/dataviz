import { useMemo, useState } from "react";  // Ajout de useState pour les sélections
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";  // Import pour le dropdown
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface ChartComponentProps {
  data: any[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
  'hsl(var(--chart-9))',
  'hsl(var(--chart-10))',
  'hsl(var(--chart-11))',
  'hsl(var(--chart-12))',
];

const ChartComponent = ({ data }: ChartComponentProps) => {
  // Nouveaux states pour les sélections utilisateur
  const [selectedDistributionColumn, setSelectedDistributionColumn] = useState<string>('');  // Renommé pour Bar/Pie (cat ou num)
  const [selectedNumericColumn, setSelectedNumericColumn] = useState<string>('');

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter(col => 
      data.some(row => typeof row[col] === 'number' && !isNaN(row[col]))
    );
    const stringColumns = columns.filter(col => 
      data.some(row => typeof row[col] === 'string')
    );
    
    // Toutes les colonnes éligibles pour distribution (string + numeric pour counts uniques)
    const allColumnsForDistribution = [...new Set([...stringColumns, ...numericColumns])];  // Évite doublons si mixte
    
    // Fallback si pas sélectionné : première colonne dispo pour distribution
    const distCol = selectedDistributionColumn || allColumnsForDistribution[0] || '';
    const numCol = selectedNumericColumn || numericColumns[0] || '';

    // For bar chart - count occurrences of selected column (string or numeric)
    let barChartData: any[] = [];
    if (distCol && allColumnsForDistribution.length > 0) {
      const counts: { [key: string]: number } = {};
      
      data.forEach(row => {
        const value = String(row[distCol] || '');  // Convertit num en string pour key (ex. '25' pour âge)
        if (value && value !== 'null' && value !== 'undefined') {  // Ignore les vides/nulls
          counts[value] = (counts[value] || 0) + 1;
        }
      });
      
      barChartData = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 uniques
    }
    
    // For pie chart - same as bar but with colors
    const pieChartData = barChartData.map((item, index) => ({
      ...item,
      fill: COLORS[index % COLORS.length]
    }));
    
    // For line chart - use selected/first numeric column over index
    let lineChartData: any[] = [];
    if (numCol && numericColumns.length > 0) {
      lineChartData = data.slice(0, 50).map((row, index) => ({  // Limite à 50 pour perf
        index: index + 1,
        value: row[numCol]
      })).filter(point => !isNaN(point.value));  // Filtre les NaN
    }
    
    return {
      barChartData,
      pieChartData,
      lineChartData,
      numericColumns,
      stringColumns,
      allColumnsForDistribution,
      selectedDistributionColumn: distCol,
      selectedNumericColumn: numCol
    };
  }, [data, selectedDistributionColumn, selectedNumericColumn]);  // Dépend des sélections

  if (!chartData) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Aucune donnée disponible pour la visualisation</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sélecteurs de colonnes en haut */}
      <Card className="border-glass">
        <CardHeader>
          <CardTitle>Choisir les Colonnes pour les Visualisations</CardTitle>
          <CardDescription>
            Sélectionnez une colonne pour personnaliser les graphiques (Bar/Pie pour les occurrences uniques - catégories ou numériques comme âges ; Line pour les tendances numériques).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Colonne pour Distribution (Bar/Pie) - Occurrences uniques</label>
            <Select value={selectedDistributionColumn} onValueChange={setSelectedDistributionColumn}>
              <SelectTrigger>
                <SelectValue placeholder={chartData.allColumnsForDistribution.length > 0 ? `Sélectionnez... (défaut: ${chartData.allColumnsForDistribution[0]})` : "Aucune colonne disponible"} />
              </SelectTrigger>
              <SelectContent>
                {chartData.allColumnsForDistribution.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col} {chartData.numericColumns.includes(col) ? '(numérique)' : '(catégorielle)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Ex: Pour âges, compte les occurrences exactes (top 10 valeurs uniques).
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Colonne pour Tendance (Line)</label>
            <Select value={selectedNumericColumn} onValueChange={setSelectedNumericColumn}>
              <SelectTrigger>
                <SelectValue placeholder={chartData.numericColumns.length > 0 ? `Sélectionnez... (défaut: ${chartData.numericColumns[0]})` : "Aucune colonne numérique"} />
              </SelectTrigger>
              <SelectContent>
                {chartData.numericColumns.map((col) => (
                  <SelectItem key={col} value={col}>{col}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      {chartData.barChartData.length > 0 && (
        <Card className="border-glass shadow-glow">
          <CardHeader>
            <CardTitle>Distribution des Valeurs ({chartData.selectedDistributionColumn})</CardTitle>  {/* Affiche la colonne sélectionnée */}
            <CardDescription>Répartition des occurrences par valeur unique</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        {chartData.pieChartData.length > 0 && (
          <Card className="border-glass shadow-glow">
            <CardHeader>
              <CardTitle>Répartition Circulaire ({chartData.selectedDistributionColumn})</CardTitle>
              <CardDescription>Distribution en pourcentages des valeurs uniques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {chartData.pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Line Chart */}
        {chartData.lineChartData.length > 0 && (
          <Card className="border-glass shadow-glow">
            <CardHeader>
              <CardTitle>Tendance Numérique ({chartData.selectedNumericColumn})</CardTitle>
              <CardDescription>Évolution des valeurs numériques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={COLORS[1]} 
                      strokeWidth={3}
                      dot={{ fill: COLORS[1], strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: COLORS[1], strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Info - Mise à jour avec sélections */}
      <Card className="border-glass">
        <CardHeader>
          <CardTitle>Informations sur les Visualisations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Graphiques disponibles:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Graphique en barres: Occurrences uniques ({chartData.selectedDistributionColumn || 'Auto'})</li>
                <li>• Graphique circulaire: Répartition proportionnelle ({chartData.selectedDistributionColumn || 'Auto'})</li>
                <li>• Graphique linéaire: Tendances numériques ({chartData.selectedNumericColumn || 'Auto'})</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Données analysées:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {chartData.stringColumns.length} colonnes catégorielles</li>
                <li>• {chartData.numericColumns.length} colonnes numériques</li>
                <li>• {data.length} lignes de données</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartComponent;