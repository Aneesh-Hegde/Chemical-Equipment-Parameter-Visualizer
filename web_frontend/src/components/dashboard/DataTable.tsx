import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { EquipmentData } from '@/types/equipment';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type SortField = keyof EquipmentData;
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 8;

export const DataTable = () => {
  const { currentData } = useDashboard();
  const [sortField, setSortField] = useState<SortField>('equipmentName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = useMemo(() => {
    return [...currentData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }, [currentData, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-success/10 text-success';
      case 'Inactive':
        return 'bg-muted text-muted-foreground';
      case 'Maintenance':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (currentData.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Equipment Data</h3>
        <p className="text-sm text-muted-foreground">
          Showing {paginatedData.length} of {sortedData.length} records
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('equipmentName')}
              >
                <div className="flex items-center gap-1">
                  Equipment Name
                  <SortIcon field="equipmentName" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('equipmentType')}
              >
                <div className="flex items-center gap-1">
                  Type
                  <SortIcon field="equipmentType" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('flowrate')}
              >
                <div className="flex items-center gap-1">
                  Flowrate (m³/h)
                  <SortIcon field="flowrate" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('pressure')}
              >
                <div className="flex items-center gap-1">
                  Pressure (bar)
                  <SortIcon field="pressure" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('temperature')}
              >
                <div className="flex items-center gap-1">
                  Temperature (°C)
                  <SortIcon field="temperature" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  <SortIcon field="status" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {paginatedData.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium">{item.equipmentName}</TableCell>
                  <TableCell>{item.equipmentType}</TableCell>
                  <TableCell>{item.flowrate.toFixed(2)}</TableCell>
                  <TableCell>{item.pressure.toFixed(2)}</TableCell>
                  <TableCell>{item.temperature.toFixed(1)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn-interactive"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="btn-interactive"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
