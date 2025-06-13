"use client";

import { useState } from "react";
import {
  FileInput,
  FileOutput,
  Copy,
  Check,
  Code,
  Terminal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function SplitViewer() {
  const [inputData, setInputData] = useState("");
  const [outputData, setOutputData] = useState(`{
  "metadata": {
    "version": "1.0",
    "timestamp": "2025-01-15T10:30:00Z",
    "conversion_type": "TXT → JSON"
  },
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "age": 30,
      "city": "New York",
      "risk_level": "low"
    },
    {
      "id": 2,
      "name": "Jane Smith", 
      "age": 25,
      "city": "Los Angeles",
      "risk_level": "medium"
    }
  ],
  "summary": {
    "total_records": 2,
    "processing_time": "0.045s",
    "status": "success"
  }
}`);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const handleCopyInput = async () => {
    await navigator.clipboard.writeText(inputData);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  };

  const handleCopyOutput = async () => {
    await navigator.clipboard.writeText(outputData);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Panel */}
      <Card className="glass-card glass-hover border-green-border/20 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/30">
                <Terminal className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-foreground">Input Data</div>
                <div className="text-sm font-normal text-muted-foreground">
                  Source file content
                </div>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyInput}
              disabled={!inputData}
              className="h-9 w-9 p-0 hover:bg-blue-500/10 border border-blue-500/20 rounded-lg group"
            >
              {copiedInput ? (
                <Check className="h-4 w-4 text-green-light" />
              ) : (
                <Copy className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 relative">
          <div className="relative group">
            <Textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Los datos de entrada aparecerán aquí...

                Ejemplo TXT:
id,name,age,city,risk_level
1,John Doe,30,New York,low
2,Jane Smith,25,Los Angeles,medium
3,Bob Johnson,35,Chicago,high"
              className="h-[450px] font-mono text-sm resize-none bg-card/50 border-green-border/30 focus:border-blue-400 focus:ring-blue-400/20 text-foreground placeholder:text-muted-foreground/70 rounded-xl"
            />
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-card/80 border border-blue-500/30 rounded-md">
              <FileInput className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">SOURCE</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Output Panel */}
      <Card className="glass-card glass-hover border-green-border/20 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-dark/50 border border-green-border/30">
                <Code className="h-5 w-5 text-green-light" />
              </div>
              <div>
                <div className="text-foreground">Output Data</div>
                <div className="text-sm font-normal text-muted-foreground">
                  Converted file content
                </div>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyOutput}
              disabled={!outputData}
              className="h-9 w-9 p-0 hover:bg-green-dark/30 border border-green-border/30 rounded-lg group"
            >
              {copiedOutput ? (
                <Check className="h-4 w-4 text-green-light" />
              ) : (
                <Copy className="h-4 w-4 text-green-light group-hover:text-green-light/80 transition-colors" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 relative">
          <div className="relative group">
            <Textarea
              value={outputData}
              onChange={(e) => setOutputData(e.target.value)}
              placeholder="Los datos convertidos aparecerán aquí..."
              className="h-[450px] font-mono text-sm resize-none bg-card/50 border-green-border/30 focus:border-green-light focus:ring-green-light/20 text-foreground placeholder:text-muted-foreground/70 rounded-xl"
              readOnly
            />
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-green-dark/50 border border-green-border/50 rounded-md">
              <FileOutput className="h-3 w-3 text-green-light" />
              <span className="text-xs text-green-light font-medium">
                OUTPUT
              </span>
            </div>

            {/* Format indicator */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-card/80 border border-green-border/30 rounded-md">
              <div className="h-2 w-2 rounded-full bg-green-light animate-pulse"></div>
              <span className="text-xs text-green-light font-medium">JSON</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
