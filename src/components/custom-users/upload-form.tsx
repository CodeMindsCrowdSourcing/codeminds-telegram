'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/table/data-table";
import { toast } from "sonner";
import { columns } from "@/app/dashboard/custom-users/columns";
import { useReactTable, getCoreRowModel, getPaginationRowModel } from "@tanstack/react-table";

type UploadFormProps = {
  isConnected: boolean;
};

export function UploadForm({ isConnected }: UploadFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

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
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);

      // First, parse the CSV file
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/custom-users/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to parse CSV file');
      }

      const { users } = await response.json();

      // Then, check each phone number with Telegram
      const checkResponse = await fetch('/api/telegram/check-phones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phones: users.map((u: any) => u.phone)
        })
      });

      if (!checkResponse.ok) {
        throw new Error('Failed to check phone numbers');
      }

      const { results } = await checkResponse.json();
      setResults(results);
      toast.success('Phone numbers checked successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process file');
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

      {results.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <DataTable table={table} />
          </div>
        </div>
      )}
    </div>
  );
}
