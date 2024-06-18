'use client';

import { ReactNode, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RANGE_OPTIONS } from '@/lib/rangeOptions';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';

interface ChartCardProps {
  title: string;
  queryKey: string;
  children: ReactNode;
  selectedRangeLabel: string;
}

export default function ChartCard({
  title,
  children,
  queryKey,
  selectedRangeLabel,
}: ChartCardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State for custom date range filter
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  // Handler method for clicking filter options - Update URL
  function setRange(range: keyof typeof RANGE_OPTIONS | DateRange) {
    const params = new URLSearchParams(searchParams);

    if (typeof range === 'string') {
      // Set search params with the non-custom selected range via the dropdown filter
      params.set(queryKey, range);
      params.delete(`${queryKey}From`);
      params.delete(`${queryKey}To`);
    } else {
      if (range.from == null || range.to == null) return;
      // Set search params with the custom selected range via the dropdown calendar filter
      params.set(`${queryKey}From`, range.from.toISOString());
      params.set(`${queryKey}To`, range.to.toISOString());
      params.delete(queryKey);
    }

    // Update URL with the search params, disable scroll to top afterwards
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // Handler for calendar date range selection
  function handleSubmit() {
    if (dateRange == null) return;

    setRange(dateRange);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-4 justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{selectedRangeLabel}</Button>
            </DropdownMenuTrigger>
            {/* Filter options */}
            <DropdownMenuContent>
              {Object.entries(RANGE_OPTIONS).map(([key, value]) => {
                return (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setRange(key as keyof typeof RANGE_OPTIONS)}
                  >
                    {value.label}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              {/* Custom range date picker */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Custom</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <div>
                    <Calendar
                      mode="range"
                      disabled={{ after: new Date() }}
                      selected={dateRange}
                      defaultMonth={dateRange?.from}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                    <DropdownMenuItem className="hover:bg-auto">
                      <Button
                        disabled={dateRange == null}
                        className="w-full"
                        onClick={handleSubmit}
                      >
                        Submit
                      </Button>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
