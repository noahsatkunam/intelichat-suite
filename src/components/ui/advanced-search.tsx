import React, { useState } from 'react';
import { Search, Filter, X, Plus, Calendar, Tag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

interface SearchFilter {
  id: string;
  field: string;
  operator: string;
  value: string;
  label: string;
}

interface AdvancedSearchProps {
  placeholder?: string;
  fields?: Array<{ value: string; label: string; type: string }>;
  onSearch?: (query: string, filters: SearchFilter[]) => void;
  className?: string;
}

const operators = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'starts_with', label: 'Starts with' },
    { value: 'ends_with', label: 'Ends with' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
    { value: 'between', label: 'Between' },
  ],
  date: [
    { value: 'on', label: 'On' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'between', label: 'Between' },
  ],
  select: [
    { value: 'equals', label: 'Is' },
    { value: 'not_equals', label: 'Is not' },
  ],
};

export function AdvancedSearch({ 
  placeholder = "Search...",
  fields = [
    { value: 'name', label: 'Name', type: 'text' },
    { value: 'email', label: 'Email', type: 'text' },
    { value: 'status', label: 'Status', type: 'select' },
    { value: 'created_date', label: 'Created Date', type: 'date' },
  ],
  onSearch = () => {},
  className = ""
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [newFilter, setNewFilter] = useState({
    field: '',
    operator: '',
    value: '',
  });

  const addFilter = () => {
    if (newFilter.field && newFilter.operator && newFilter.value) {
      const field = fields.find(f => f.value === newFilter.field);
      const operator = operators[field?.type as keyof typeof operators]?.find(o => o.value === newFilter.operator);
      
      const filter: SearchFilter = {
        id: Date.now().toString(),
        ...newFilter,
        label: `${field?.label} ${operator?.label} "${newFilter.value}"`
      };
      
      setFilters([...filters, filter]);
      setNewFilter({ field: '', operator: '', value: '' });
    }
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'select': return <Tag className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const selectedField = fields.find(f => f.value === newFilter.field);
  const availableOperators = selectedField ? operators[selectedField.type as keyof typeof operators] || [] : [];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-4"
          />
        </div>
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {filters.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {filters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Add Filter</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium mb-1 block">Field</Label>
                  <Select 
                    value={newFilter.field} 
                    onValueChange={(value) => setNewFilter({ ...newFilter, field: value, operator: '', value: '' })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          <div className="flex items-center gap-2">
                            {getFieldIcon(field.type)}
                            {field.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedField && (
                  <div>
                    <Label className="text-xs font-medium mb-1 block">Condition</Label>
                    <Select 
                      value={newFilter.operator} 
                      onValueChange={(value) => setNewFilter({ ...newFilter, operator: value })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableOperators.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newFilter.operator && (
                  <div>
                    <Label className="text-xs font-medium mb-1 block">Value</Label>
                    {selectedField?.type === 'date' ? (
                      <Input
                        type="date"
                        value={newFilter.value}
                        onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                        className="h-8"
                      />
                    ) : selectedField?.type === 'number' ? (
                      <Input
                        type="number"
                        value={newFilter.value}
                        onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                        className="h-8"
                        placeholder="Enter number"
                      />
                    ) : (
                      <Input
                        value={newFilter.value}
                        onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                        className="h-8"
                        placeholder="Enter value"
                      />
                    )}
                  </div>
                )}

                <Button
                  onClick={addFilter}
                  disabled={!newFilter.field || !newFilter.operator || !newFilter.value}
                  className="w-full gap-2 h-8"
                  size="sm"
                >
                  <Plus className="w-3 h-3" />
                  Add Filter
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button onClick={handleSearch} className="gap-2">
          <Search className="w-4 h-4" />
          Search
        </Button>
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground">Active filters:</span>
              {filters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant="secondary"
                  className="gap-1 pr-1 text-xs"
                >
                  {filter.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter(filter.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters([])}
                className="text-xs h-6 px-2"
              >
                Clear all
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}