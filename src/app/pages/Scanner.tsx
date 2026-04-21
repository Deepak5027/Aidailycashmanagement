import { useState, useRef } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Camera, Upload, CheckCircle, Loader2, ScanLine, X, Image as ImageIcon } from "lucide-react";
import { categories } from "../data/mockData";
import { toast } from "sonner";

export default function Scanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<{
    merchant: string;
    amount: string;
    date: string;
    category: string;
  } | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        processReceipt();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const processReceipt = () => {
    setIsScanning(true);
    toast.info('Processing receipt with OCR...');
    
    // Simulate OCR processing with AI
    setTimeout(() => {
      // Simulate different receipt types
      const receiptTypes = [
        {
          merchant: "Whole Foods Market",
          amount: "87.45",
          date: new Date().toISOString().split("T")[0],
          category: "groceries",
        },
        {
          merchant: "Target",
          amount: "125.99",
          date: new Date().toISOString().split("T")[0],
          category: "shopping",
        },
        {
          merchant: "Shell Gas Station",
          amount: "65.00",
          date: new Date().toISOString().split("T")[0],
          category: "fuel",
        },
        {
          merchant: "CVS Pharmacy",
          amount: "42.30",
          date: new Date().toISOString().split("T")[0],
          category: "healthcare",
        },
      ];
      
      const randomReceipt = receiptTypes[Math.floor(Math.random() * receiptTypes.length)];
      setScannedData(randomReceipt);
      setIsScanning(false);
      toast.success("Receipt scanned successfully!");
    }, 2500);
  };

  const handleScan = () => {
    handleUploadClick();
  };

  const handleSave = () => {
    if (!scannedData) return;
    toast.success("Transaction saved from receipt!");
    setScannedData(null);
    setUploadedImage(null);
  };

  const handleReset = () => {
    setScannedData(null);
    setUploadedImage(null);
    setIsScanning(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Receipt Scanner</h1>
        <p className="text-gray-600 mt-1">
          Use OCR to automatically extract transaction details from receipts
        </p>
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <ScanLine className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold mb-2">How Receipt Scanning Works</h3>
            <ul className="text-sm text-blue-900 space-y-1">
              <li>• Upload or capture a photo of your receipt</li>
              <li>• AI extracts merchant name, amount, date, and items using OCR</li>
              <li>• Machine learning automatically categorizes the transaction</li>
              <li>• Review and confirm before saving to your transaction history</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Scanner Interface */}
      {!scannedData ? (
        <Card className="p-8">
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  {isScanning ? (
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    {isScanning ? "Processing Receipt..." : "Upload Receipt Image"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop or click to browse
                  </p>
                </div>
                {!isScanning && (
                  <div className="flex justify-center gap-3">
                    <Button onClick={handleScan}>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    <Button variant="outline" onClick={handleScan}>
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Processing Info */}
            {isScanning && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Processing with OCR...</p>
                    <p className="text-blue-700">
                      Extracting merchant, amount, date, and line items
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium mb-1">Accurate OCR</h4>
                <p className="text-sm text-gray-600">
                  High accuracy text extraction from receipts
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ScanLine className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium mb-1">Smart Detection</h4>
                <p className="text-sm text-gray-600">
                  AI identifies key fields automatically
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium mb-1">Auto Category</h4>
                <p className="text-sm text-gray-600">
                  Transactions categorized automatically
                </p>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8">
          <div className="space-y-6">
            {/* Success Header */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Receipt Scanned Successfully!</h3>
                <p className="text-sm text-gray-600">
                  Review and confirm the extracted information
                </p>
              </div>
            </div>

            {/* Extracted Data Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="merchant">Merchant Name</Label>
                <Input
                  id="merchant"
                  value={scannedData.merchant}
                  onChange={(e) =>
                    setScannedData({ ...scannedData, merchant: e.target.value })
                  }
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={scannedData.amount}
                    onChange={(e) =>
                      setScannedData({ ...scannedData, amount: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scannedData.date}
                    onChange={(e) =>
                      setScannedData({ ...scannedData, date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category (AI Detected)</Label>
                <Select
                  value={scannedData.category}
                  onValueChange={(value) =>
                    setScannedData({ ...scannedData, category: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* AI Confidence */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">
                    AI Confidence: 95% - Highly Accurate
                  </p>
                  <p className="text-green-700 mt-1">
                    All fields extracted successfully. Category auto-detected based on merchant
                    name.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Transaction
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Scan Another
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tips Card */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Tips for Best Results</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">✓ Do:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use good lighting when taking photos</li>
              <li>• Keep the receipt flat and fully visible</li>
              <li>• Capture the entire receipt in frame</li>
              <li>• Use high-resolution images</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">✗ Avoid:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Blurry or out-of-focus images</li>
              <li>• Crumpled or torn receipts</li>
              <li>• Receipts with heavy shadows</li>
              <li>• Very faded thermal receipts</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}