import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Mic, MicOff, Volume2, CheckCircle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { categories } from "../data/mockData";
import { transactionsAPI, aiAPI } from "../../services/api";

const languageMap: Record<string, string> = {
  en: 'en-US',
  ta: 'ta-IN',
  hi: 'hi-IN'
};

export default function VoiceEntry() {
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [parsedData, setParsedData] = useState<{
    merchant: string;
    amount: number;
    category: string;
    confidence: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Set language based on i18n
    const lang = languageMap[i18n.language] || 'en-US';
    setSelectedLang(lang);
  }, [i18n.language]);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupported(false);
      setPermissionStatus('denied');
      return;
    }

    // Check microphone permission
    checkMicrophonePermission();

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLang;

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      setIsListening(false);
      setIsProcessing(true);

      // Process the speech result
      setTimeout(() => {
        const parsed = parseVoiceInput(speechResult);
        setParsedData(parsed);
        setIsProcessing(false);
        toast.success("Voice input processed successfully!");
      }, 500);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsProcessing(false);

      if (event.error === 'not-allowed') {
        setPermissionStatus('denied');
        toast.error('Microphone access denied. Please enable microphone permissions in your browser settings.');
      } else if (event.error === 'no-speech') {
        toast.error('No speech detected. Please try again.');
      } else if (event.error === 'network') {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(`Voice recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [selectedLang]);

  const checkMicrophonePermission = async () => {
    try {
      // Try to get microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all tracks immediately
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus('granted');
    } catch (error: any) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
      } else if (error.name === 'NotFoundError') {
        setPermissionStatus('denied');
        toast.error('No microphone found on your device');
      } else {
        setPermissionStatus('prompt');
      }
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus('granted');
      toast.success('Microphone access granted!');
    } catch (error: any) {
      setPermissionStatus('denied');
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone permission denied. Please check your browser settings.');
      } else {
        toast.error('Failed to access microphone');
      }
    }
  };

  const handleVoiceInput = async () => {
    if (!browserSupported) {
      toast.error('Your browser does not support voice recognition');
      return;
    }

    if (permissionStatus === 'denied' || permissionStatus === 'prompt') {
      await requestMicrophonePermission();
      return;
    }

    if (!isListening) {
      try {
        setIsListening(true);
        setTranscript("");
        setParsedData(null);
        recognitionRef.current?.start();
        toast.info('Listening... Speak now!');
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setIsListening(false);
        toast.error('Failed to start voice recognition');
      }
    } else {
      recognitionRef.current?.stop();
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

  const handleSave = async () => {
    if (!parsedData) return;

    try {
      const transactionData = {
        merchant: parsedData.merchant,
        amount: parsedData.amount,
        category: parsedData.category,
        date: new Date().toISOString(),
        type: 'expense',
        payment_mode: 'Cash',
      };

      // Analyze fraud risk
      const fraudAnalysis = await aiAPI.analyzeFraud(transactionData);

      // Save transaction
      await transactionsAPI.create({
        ...transactionData,
        risk_score: fraudAnalysis.risk_score,
        status: fraudAnalysis.status,
        notes: `Added via voice input: "${transcript}"`,
      });

      toast.success("Transaction saved from voice input!");
      setTranscript("");
      setParsedData(null);
    } catch (error: any) {
      toast.error('Failed to save transaction');
      console.error('Save error:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">{t('voiceEntry')}</h1>
          <p className="text-gray-600 mt-1">Add transactions using voice commands</p>
        </div>
        <div className="w-48">
          <Select value={selectedLang} onValueChange={setSelectedLang}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="ta-IN">தமிழ் (Tamil)</SelectItem>
              <SelectItem value="hi-IN">हिन्दी (Hindi)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Permission Warning */}
      {!browserSupported && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <MicOff className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Browser Not Supported</p>
              <p className="text-sm text-red-700 mt-1">
                Your browser doesn't support voice recognition. Please use Chrome, Edge, or Safari.
              </p>
            </div>
          </div>
        </Card>
      )}

      {permissionStatus === 'denied' && browserSupported && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <MicOff className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">Microphone Permission Required</p>
              <p className="text-sm text-yellow-700 mt-1">
                Please allow microphone access to use voice entry. Click the button below to grant permission.
              </p>
              <Button
                onClick={requestMicrophonePermission}
                className="mt-3"
                size="sm"
              >
                Grant Microphone Access
              </Button>
              <p className="text-xs text-yellow-600 mt-2">
                💡 If the button doesn't work, check your browser's address bar for a blocked microphone icon and click it to enable.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Voice Input Card */}
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Microphone Button */}
          <div className="relative">
            <Button
              size="lg"
              onClick={handleVoiceInput}
              disabled={!browserSupported}
              className={`w-32 h-32 rounded-full ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : permissionStatus === 'denied' || permissionStatus === 'prompt'
                  ? "bg-yellow-500 hover:bg-yellow-600"
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
              {!browserSupported
                ? "Browser Not Supported"
                : permissionStatus === 'denied' || permissionStatus === 'prompt'
                ? "Microphone Permission Needed"
                : isListening
                ? "Listening..."
                : isProcessing
                ? "Processing..."
                : "Tap to speak"}
            </h3>
            <p className="text-gray-600">
              {!browserSupported
                ? "Please use Chrome, Edge, or Safari"
                : permissionStatus === 'denied' || permissionStatus === 'prompt'
                ? "Click the microphone button to grant permission"
                : isListening
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
