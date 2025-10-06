import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";  // Ajout pour parser Excel

interface DataUploadProps {
  onDataUploaded: (data: any[]) => void;
  onBack: () => void;
}

const DataUpload = ({ onDataUploaded, onBack }: DataUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/\"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/\"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          const value = values[index] || '';
          // Try to parse as number, otherwise keep as string
          row[header] = isNaN(Number(value)) || value === '' ? value : Number(value);
        });
        data.push(row);
      }
    }
    return data;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(20);
    
    try {
      let parsedData: any[] = [];
      
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        setProgress(60);
        parsedData = parseCSV(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setProgress(60);
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        parsedData = XLSX.utils.sheet_to_json(sheet);
        if (!Array.isArray(parsedData)) {
          throw new Error("Le fichier Excel doit contenir un tableau de données");
        }
      } else {
        throw new Error("Format de fichier non supporté. Utilisez CSV ou Excel.");
      }
      
      setProgress(80);
      
      if (parsedData.length === 0) {
        throw new Error("Aucune donnée trouvée dans le fichier");
      }
      
      setProgress(100);
      toast.success(`${parsedData.length} lignes importées avec succès!`);
      
      setTimeout(() => {
        onDataUploaded(parsedData);
      }, 500);
      
    } catch (error) {
      console.error('Erreur lors du traitement du fichier:', error);
      toast.error(error instanceof Error ? error.message : "Erreur lors du traitement du fichier");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setUploadedFile(file);
        processFile(file);
      } else {
        toast.error("Format de fichier non supporté. Utilisez CSV ou Excel.");
      }
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      processFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-data p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">Import de Données</h1>
          <p className="text-muted-foreground">
            Importez vos données anonymisées pour commencer l'analyse
          </p>
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sélectionner un fichier</CardTitle>
            <CardDescription>
              Formats supportés: CSV, Excel (max 20MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg mb-2">
                Glissez-déposez votre fichier ici ou{' '}
                <label className="text-primary hover:underline cursor-pointer">
                  parcourez
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileInput}
                    className="sr-only"
                    disabled={isProcessing}
                  />
                </label>
              </p>
              <p className="text-sm text-muted-foreground">
                CSV, Excel (.xlsx/.xls) jusqu'à 20MB
              </p>
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">
                    Traitement de {uploadedFile?.name}...
                  </span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Validation et analyse des données en cours...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                Formats Supportés
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>CSV (Comma Separated Values)</span>
                <span className="text-chart-1">✓</span>
              </div>
              <div className="flex justify-between">
                <span>Excel (.xlsx/.xls)</span>
                <span className="text-chart-1">✓</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-amber-600" />
                Exigences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• Données déjà anonymisées</p>
              <p className="text-sm">• Première ligne = en-têtes de colonnes</p>
              <p className="text-sm">• Encodage UTF-8 recommandé</p>
              <p className="text-sm">• Taille maximale: 20MB</p>
            </CardContent>
          </Card>
        </div>

        {/* Security Note */}
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Sécurité:</strong> Toutes les données sont traitées localement dans votre navigateur. 
            Aucune information n'est transmise à nos serveurs.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default DataUpload;