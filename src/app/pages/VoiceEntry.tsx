import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Mic, MicOff, Volume2, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { categories } from "../data/mockData";

export default function VoiceEntry() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedData, setParsedData] = useState<{
    merchant: string;
    amount: number;
    category: string;
    confidence: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoiceInput = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript("");
      setParsedData(null);

      // Simulate voice recognition
      setTimeout(() => {
        const sampleTranscripts = [
          "I spent 45 dollars at Starbucks for coffee",
          "Paid 120 dollars for groceries at Whole Foods",
          "Gas station Shell 65 dollars",
          "Netflix subscription 15.99",
        ];
        const randomTranscript =
          sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
        setTranscript(randomTranscript);
        setIsListening(false);
        setIsProcessing(true);

        // Simulate AI processing
        setTimeout(() => {
          const parsed = parseVoiceInput(randomTranscript);
          setParsedData(parsed);
          setIsProcessing(false);
          toast.success("Voice input processed successfully!");
        }, 1500);
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  const parseVoiceInput = (text: string): any => {
    // Simulate AI/NLP parsing
    const amountMatch = text.match(/(\d+\.?\d*)\s*dollars?/i);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

    let merchant = "";
    let category = "";
    let confidence = 0.95;

    if (text.toLowerCase().includes("starbucks") || text.toLowerCase().includes("coffee")) {
      merchant = "Starbucks";
      category = "food";
    } else if (text.toLowerCase().includes("whole foods") || text.toLowerCase().includes("groceries")) {
      merchant = "Whole Foods";
      category = "groceries";
    } else if (text.toLowerCase().includes("shell") || text.toLowerCase().includes("gas")) {
      merchant = "Shell Gas Station";
      category = "fuel";
    } else if (text.toLowerCase().includes("netflix")) {
      merchant = "Netflix";
      category = "entertainment";
    } else {
      merchant = "Unknown Merchant";
      category = "shopping";
      confidence = 0.65;
    }

    return { merchant, amount, category, confidence };
  };

  const handleSave = () => {
    toast.success("Transaction saved from voice input!");
    setTranscript("");
    setParsedData(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Voice Entry</h1>
        <p className="text-gray-600 mt-1">Add transactions using voice commands</p>
      </div>

      {/* Voice Input Card */}
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Microphone Button */}
          <div className="relative">
            <Button
              size="lg"
              onClick={handleVoiceInput}
              className={`w-32 h-32 rounded-full ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-gradient-to-br from-blue-600 to-purple-600"
              }`}
            >
              {isListening ? (
                <MicOff className="w-16 h-16" />
              ) : (
                <Mic className="w-16 h-16" />
              )}
            </Button>
            {isListening && (
              <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />
            )}
          </div>

          {/* Status */}
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">
              {isListening
                ? "Listening..."
                : isProcessing
                ? "Processing..."
                : "Tap to speak"}
            </h3>
            <p className="text-gray-600">
              {isListening
                ? "Say your transaction details naturally"
                : isProcessing
                ? "AI is analyzing your speech"
                : "Try: 'I spent 45 dollars at Starbucks for coffee'"}
            </p>
          </div>

          {/* Transcript */}
          {transcript && (
            <Card className="w-full p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Volume2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Transcript:</p>
                  <p className="text-blue-700 mt-1">"{transcript}"</p>
                </div>
              </div>
            </Card>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="flex items-center gap-3 text-purple-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>AI is extracting transaction details...</span>
            </div>
          )}

          {/* Parsed Results */}
          {parsedData && !isProcessing && (
            <div className="w-full space-y-4">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h4 className="font-bold text-lg">Transaction Detected!</h4>
                <Badge
                  variant={parsedData.confidence > 0.8 ? "default" : "secondary"}
                >
                  {(parsedData.confidence * 100).toFixed(0)}% Confidence
                </Badge>
              </div>

              <Card className="p-6 border-2 border-green-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Merchant</p>
                    <p className="text-lg font-bold mt-1">{parsedData.merchant}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-lg font-bold mt-1 text-green-600">
                      ${parsedData.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="text-lg font-bold mt-1 capitalize">
                      {parsedData.category}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button onClick={handleSave} className="flex-1">
                    Save Transaction
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTranscript("");
                      setParsedData(null);
                    }}
                    className="flex-1"
                  >
                    Try Again
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>

      {/* How it works */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">How Voice Entry Works</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium">✓ Supported Commands:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• "I spent [amount] at [merchant]"</li>
              <li>• "Paid [amount] for [category]"</li>
              <li>• "[merchant] [amount] dollars"</li>
              <li>• "I bought [item] for [amount]"</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">🤖 AI Features:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Natural language processing</li>
              <li>• Automatic merchant recognition</li>
              <li>• Smart category detection</li>
              <li>• Context-aware parsing</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Examples */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <h3 className="font-bold text-lg mb-4">Example Voice Commands</h3>
        <div className="grid gap-3">
          {[
            "I spent 45 dollars at Starbucks for coffee",
            "Paid 120 dollars for groceries at Whole Foods",
            "Gas station Shell, 65 dollars",
            "Netflix subscription 15.99",
          ].map((example, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Mic className="w-4 h-4 text-purple-600" />
              <p className="text-sm italic">"{example}"</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
