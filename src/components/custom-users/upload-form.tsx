'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/table/data-table";
import { toast } from "sonner";
import { columns } from "@/app/dashboard/custom-users/columns";
import { useReactTable, getCoreRowModel, getPaginationRowModel } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Save, Trash2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type UploadFormProps = {
  isConnected: boolean;
};

export function UploadForm({ isConnected }: UploadFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [processedRows, setProcessedRows] = useState(0);
  const [totalRows, setTotalRows] = useState(0);

  const table = useReactTable({
    data: results,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploadProgress(0);
    setResults([]);
    setProcessedRows(0);
    setTotalRows(0);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/custom-users/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      setTotalRows(data.users.length);
      
      // Simulate progressive loading of results
      const batchSize = 20;
      for (let i = 0; i < data.users.length; i += batchSize) {
        const batch = data.users.slice(0, i + batchSize);
        setResults(batch);
        setProcessedRows(i + batchSize);
        setUploadProgress(Math.round((i + batchSize) / data.users.length * 100));
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      setResults(data.users);
      setUploadProgress(100);
      toast.success(
        `Uploaded ${data.stats.new} new users, skipped ${data.stats.duplicates} duplicates`
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csvFile">CSV File</Label>
          <div className="flex items-center gap-4">
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={!isConnected || isLoading}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            The CSV file should have a column named &#34;phone&#34; with phone numbers.
            <a href="/example.csv" className="ml-1 text-primary hover:underline">
              Download example
            </a>
          </p>
        </div>
      </form>

      {isLoading && (
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

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Results</h3>
          </div>
          <div className="rounded-lg border bg-card relative">
            <div className={cn(
              "overflow-x-auto transition-all duration-200",
              isLoading && "blur-sm pointer-events-none"
            )}>
              <DataTable table={table} />
            </div>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="text-center space-y-4 p-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="text-sm font-medium">
                    Processing large file, please wait...
                    <br />
                    {processedRows}/{totalRows} rows
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
