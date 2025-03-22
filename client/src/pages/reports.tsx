
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDownIcon } from "lucide-react";

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async (type: string) => {
    try {
      setIsGenerating(true);
      const response = await fetch(`/api/reports/${type}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tank-${type}-report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tank Status Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Current status of all tanks including fill levels and temperatures
            </p>
            <Button 
              onClick={() => generateReport('status')}
              disabled={isGenerating}
              className="w-full"
            >
              <FileDownIcon className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tank History Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Historical data of tank operations and events
            </p>
            <Button 
              onClick={() => generateReport('history')}
              disabled={isGenerating}
              className="w-full"
            >
              <FileDownIcon className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Maintenance history and upcoming scheduled maintenance
            </p>
            <Button 
              onClick={() => generateReport('maintenance')}
              disabled={isGenerating}
              className="w-full"
            >
              <FileDownIcon className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
