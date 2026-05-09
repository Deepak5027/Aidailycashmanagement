import { useState, useRef } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { importAPI } from "../../services/api";

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export default function BankImport() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }

      setFile(selectedFile);
      processCSV(selectedFile);
    }
  };

  const processCSV = async (file: File) => {
    setIsProcessing(true);
    toast.info('Processing bank statement...');

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      // Skip header row
      const dataLines = lines.slice(1);
      const transactions: ParsedTransaction[] = [];

      for (const line of dataLines) {
        const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));

        if (parts.length < 3) continue;

        // Assuming CSV format: Date, Description, Amount
        // Adjust indices based on your bank's CSV format
        const date = parts[0];
        const description = parts[1];
        const amount = parseFloat(parts[2]);

        if (!date || !description || isNaN(amount)) continue;

        const type: 'income' | 'expense' = amount > 0 ? 'income' : 'expense';
        const category = detectCategory(description);

        transactions.push({
          date: formatDate(date),
          description,
          amount: Math.abs(amount),
          type,
          category,
        });
      }

      setParsedTransactions(transactions);
      toast.success(`Successfully parsed ${transactions.length} transactions`);
    } catch (error) {
      console.error('CSV parsing error:', error);
      toast.error('Failed to parse CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    try {
      // Try to parse common date formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      return new Date().toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  };

  const detectCategory = (description: string): string => {
    const lower = description.toLowerCase();

    const keywords: Record<string, string[]> = {
      groceries: ['grocery', 'supermarket', 'whole foods', 'trader joe', 'market'],
      fuel: ['gas', 'shell', 'chevron', 'exxon', 'fuel'],
      healthcare: ['pharmacy', 'cvs', 'walgreens', 'medical'],
      food: ['restaurant', 'cafe', 'pizza', 'doordash', 'uber eats'],
      shopping: ['amazon', 'target', 'walmart'],
      bills: ['electric', 'water', 'internet', 'netflix', 'spotify'],
      travel: ['uber', 'lyft', 'airline'],
      salary: ['salary', 'payroll', 'direct deposit'],
    };

    for (const [category, terms] of Object.entries(keywords)) {
      if (terms.some(term => lower.includes(term))) {
        return category;
      }
    }

    return 'shopping';
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      // Read CSV file content
      const csvContent = await file.text();

      // Send to backend for processing
      const response = await importAPI.importCSV(csvContent);

      toast.success(`Successfully imported ${response.imported} transactions!`);
      setImportSuccess(true);
      setParsedTransactions([]);
      setFile(null);
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import transactions');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'Date,Description,Amount\n2026-05-01,Whole Foods Market,-87.45\n2026-05-02,Salary,4500.00\n2026-05-03,Shell Gas Station,-65.00';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bank_statement_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Bank Statement Import</h1>
        <p className="text-gray-600 mt-1">Upload and import transactions from your bank CSV</p>
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold mb-2">How it works</h3>
            <ul className="text-sm text-blue-900 space-y-1">
              <li>• Download your bank statement as CSV format</li>
              <li>• Upload the CSV file (should include Date, Description, Amount columns)</li>
              <li>• AI automatically categorizes each transaction</li>
              <li>• Review and import all transactions at once</li>
            </ul>
            <Button
              variant="link"
              className="text-blue-600 p-0 mt-2 h-auto"
              onClick={downloadTemplate}
            >
              <Download className="w-4 h-4 mr-1" />
              Download CSV Template
            </Button>
          </div>
        </div>
      </Card>

      {/* Upload Section */}
      {!file && !importSuccess && (
        <Card className="p-8">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Upload Bank Statement (CSV)</h3>
            <p className="text-gray-600 mb-4">
              Drag and drop or click to browse
            </p>
            <Button>Choose CSV File</Button>
          </div>
        </Card>
      )}

      {/* Preview Section */}
      {parsedTransactions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Preview Transactions</h3>
              <p className="text-sm text-gray-600">
                {parsedTransactions.length} transactions found
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setParsedTransactions([]);
                  setFile(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={isProcessing}>
                {isProcessing ? 'Importing...' : 'Import All'}
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Description</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Category</th>
                </tr>
              </thead>
              <tbody>
                {parsedTransactions.map((tx, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2 text-sm">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-sm">{tx.description}</td>
                    <td
                      className={`px-4 py-2 text-sm font-medium ${
                        tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm capitalize">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {tx.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Success Message */}
      {importSuccess && (
        <Card className="p-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Import Successful!</h3>
            <p className="text-gray-600 mb-6">
              All transactions have been imported successfully
            </p>
            <Button
              onClick={() => {
                setImportSuccess(false);
                setFile(null);
              }}
            >
              Import Another File
            </Button>
          </div>
        </Card>
      )}

      {/* Supported Banks */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Supported Banks & Formats</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">✓ Supported:</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Standard CSV format (Date, Description, Amount)</li>
              <li>• Chase Bank statements</li>
              <li>• Bank of America exports</li>
              <li>• Wells Fargo transactions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Column 1: Transaction date</li>
              <li>• Column 2: Merchant/Description</li>
              <li>• Column 3: Amount (negative for expenses)</li>
              <li>• Header row is automatically skipped</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
