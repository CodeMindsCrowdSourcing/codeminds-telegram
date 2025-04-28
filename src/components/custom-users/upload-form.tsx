'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/table/data-table";
import { toast } from "sonner";
import { columns } from "@/app/dashboard/custom-users/columns";
import { useReactTable, getCoreRowModel, getPaginationRowModel } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

type UploadFormProps = {
  isConnected: boolean;
};

export function UploadForm({ isConnected }: UploadFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSaveUsers = async () => {
    try {
      setIsSaving(true);
      const foundUsers = results.filter(user => user.isFound);

      if (foundUsers.length === 0) {
        toast.error('No found users to save');
        return;
      }

      const response = await fetch('/api/custom-users/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ users: foundUsers })
      });

      if (!response.ok) {
        throw new Error('Failed to save users');
      }

      const data = await response.json();
      toast.success(`Saved ${data.saved} users, skipped ${data.skipped} duplicates`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save users');
    } finally {
      setIsSaving(false);
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Results</h3>
            <Button
              onClick={handleSaveUsers}
              disabled={isSaving || !results.some(user => user.isFound)}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Found Users'}
            </Button>
          </div>
          <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
              <DataTable table={table} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
