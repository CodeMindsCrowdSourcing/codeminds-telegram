'use client';

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Info, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface UploadResult {
  added: number;
  skipped: number;
  errors: string[];
  stats?: {
    total: number;
    processed: number;
    duplicates: number;
  };
}

export function UploadForm({ isConnected }: { isConnected: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
      setUploadProgress(0);
      setProcessedRows(0);
      setTotalRows(0);
    }
  };

  const resetFileInput = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/custom-users/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      // Устанавливаем общее количество строк
      setTotalRows(data.stats?.total || 0);

      // Имитируем прогрессивную обработку
      const batchSize = 20;
      for (let i = 0; i < (data.stats?.total || 0); i += batchSize) {
        setProcessedRows(i + batchSize);
        setUploadProgress(Math.round(((i + batchSize) / (data.stats?.total || 1)) * 100));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setUploadResult({
        added: data.stats?.processed || 0,
        skipped: data.stats?.duplicates || 0,
        errors: data.errors || [],
        stats: data.stats
      });

      toast.success('File uploaded successfully');
      resetFileInput();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload file'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setProcessedRows(0);
      setTotalRows(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isUploading || !isConnected}
        />
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading || !isConnected}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload'
          )}
        </Button>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-muted-foreground text-center">
            {uploadProgress < 100 ? (
              `Uploading file... ${uploadProgress}%`
            ) : (
              `Processing rows... ${processedRows}/${totalRows}`
            )}
          </p>
        </div>
      )}

      {uploadResult && (
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Upload Results</AlertTitle>
            <AlertDescription className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Added: {uploadResult.added} numbers</span>
              </div>
              {uploadResult.skipped > 0 && (
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-yellow-500" />
                  <span>Skipped: {uploadResult.skipped} numbers (already exist)</span>
                </div>
              )}
              {uploadResult.errors.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Errors ({uploadResult.errors.length}):</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    {uploadResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-500">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {uploadResult.stats && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Total numbers in file: {uploadResult.stats.total}
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
