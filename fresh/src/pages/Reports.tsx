import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Download, FileText, TrendingUp, Users, Package } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

type ReportType = {
  id: string;
  name: string;
  description: string;
  icon: any;
  format: string[];
};

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes: ReportType[] = [
    {
      id: "sales",
      name: "Sales Report",
      description: "Comprehensive sales data including revenue, orders, and product performance",
      icon: TrendingUp,
      format: ["CSV", "PDF", "Excel"],
    },
    {
      id: "vendors",
      name: "Vendor Performance",
      description: "Vendor-wise sales, commission details, and product assignments",
      icon: Package,
      format: ["CSV", "PDF"],
    },
    {
      id: "users",
      name: "User Activity",
      description: "User registrations, subscriptions, order history, and engagement metrics",
      icon: Users,
      format: ["CSV", "Excel"],
    },
    {
      id: "subscriptions",
      name: "Subscription Report",
      description: "Active subscriptions, revenue breakdown, and renewal analytics",
      icon: FileText,
      format: ["CSV", "PDF", "Excel"],
    },
  ];

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast.error("Please select a report type");
      return;
    }
    if (!dateFrom || !dateTo) {
      toast.error("Please select date range");
      return;
    }

    const reportName = reportTypes.find(r => r.id === selectedReport)?.name || "Report";
    setIsGenerating(true);

    try {
      const formattedFrom = format(dateFrom, "yyyy-MM-dd");
      const formattedTo = format(dateTo, "yyyy-MM-dd");

      const response = await axios.get(`${API_BASE_URL}/reports/generate`, {
        params: {
          type: selectedReport,
          dateFrom: formattedFrom,
          dateTo: formattedTo,
          format: exportFormat,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const extension = exportFormat === 'excel' ? 'xlsx' : exportFormat;
      const filename = `${selectedReport}_report_${formattedFrom}_to_${formattedTo}.${extension}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${reportName} downloaded successfully!`);
    } catch (error: any) {
      console.error("Failed to generate report:", error);
      toast.error(`Failed to generate ${reportName}`, {
        description: error.response?.data?.message || error.message || "An unknown error occurred",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedReportData = reportTypes.find(r => r.id === selectedReport);

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Generate and download business reports</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Report</CardTitle>
                <CardDescription>Select report type and date range to generate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select value={selectedReport} onValueChange={setSelectedReport}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((report) => (
                        <SelectItem key={report.id} value={report.id}>
                          {report.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedReportData && (
                    <p className="text-sm text-muted-foreground pt-2">
                      {selectedReportData.description}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !dateFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid gap-2">
                    <Label>To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !dateTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                      <SelectItem value="pdf">PDF (Portable Document Format)</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleGenerateReport} disabled={isGenerating} className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  {isGenerating ? "Generating..." : "Generate & Download Report"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Reports</CardTitle>
                <CardDescription>Quick access to report types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reportTypes.map((report) => {
                  const Icon = report.icon;
                  return (
                    <div
                      key={report.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedReport === report.id
                          ? "bg-primary/5 border-primary"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedReport(report.id)}
                    >
                      <div className="p-2 rounded-md bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{report.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {report.format.join(", ")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Recent report activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reports This Month</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Most Generated</span>
                    <span className="font-medium">Sales Report</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Generated</span>
                    <span className="font-medium">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
