import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Database, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DataExportProps {
  title?: string;
  description?: string;
  data?: any[];
  columns?: string[];
  onExport?: (format: string, options: any) => void;
}

export function DataExport({ 
  title = "Export Data", 
  description = "Export your data in various formats",
  data = [],
  columns = [],
  onExport = () => {}
}: DataExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns);
  const [dateRange, setDateRange] = useState('all');
  const [includeMetadata, setIncludeMetadata] = useState(true);

  const formats = [
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Comma-separated values' },
    { value: 'json', label: 'JSON', icon: FileText, description: 'JavaScript Object Notation' },
    { value: 'excel', label: 'Excel', icon: Database, description: 'Microsoft Excel format' },
  ];

  const handleExport = () => {
    const options = {
      format: selectedFormat,
      columns: selectedColumns,
      dateRange,
      includeMetadata,
      timestamp: new Date().toISOString()
    };
    onExport(selectedFormat, options);
    setIsOpen(false);
  };

  const toggleColumn = (column: string) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const toggleAllColumns = () => {
    setSelectedColumns(selectedColumns.length === columns.length ? [] : [...columns]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            {title}
          </DialogTitle>
          <p className="text-muted-foreground">{description}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Export Format</Label>
            <div className="grid grid-cols-3 gap-3">
              {formats.map((format) => (
                <Card 
                  key={format.value}
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    selectedFormat === format.value ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedFormat(format.value)}
                >
                  <CardContent className="p-4 text-center">
                    <format.icon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">{format.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{format.description}</p>
                    {selectedFormat === format.value && (
                      <Badge className="mt-2">Selected</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 90 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Column Selection */}
          {columns.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Columns to Export</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleAllColumns}
                  className="text-xs"
                >
                  {selectedColumns.length === columns.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {columns.map((column) => (
                  <div key={column} className="flex items-center space-x-2">
                    <Checkbox
                      id={column}
                      checked={selectedColumns.includes(column)}
                      onCheckedChange={() => toggleColumn(column)}
                    />
                    <Label
                      htmlFor={column}
                      className="text-sm font-normal cursor-pointer capitalize"
                    >
                      {column.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Options */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Export Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(checked === true)}
                />
                <Label htmlFor="metadata" className="text-sm font-normal">
                  Include metadata (export timestamp, user info, etc.)
                </Label>
              </div>
            </div>
          </div>

          {/* Export Summary */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Export Summary</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Format: <span className="font-medium text-foreground">{formats.find(f => f.value === selectedFormat)?.label}</span></p>
                <p>Records: <span className="font-medium text-foreground">{data.length.toLocaleString()}</span></p>
                <p>Columns: <span className="font-medium text-foreground">{selectedColumns.length} of {columns.length}</span></p>
                <p>Date Range: <span className="font-medium text-foreground">{dateRange === 'all' ? 'All Time' : dateRange}</span></p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={selectedColumns.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export {formats.find(f => f.value === selectedFormat)?.label}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}