import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface WeatherLegendProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  legendColors: Array<{ color: string; label: string }>; // Accept colors and labels as props
}

export function WeatherLegend({
  open,
  onOpenChange,
  legendColors,
}: WeatherLegendProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[425px] rounded-xl'>
        <div className='flex gap-10 p-4'>
          <div className='space-y-4'>
            <DialogTitle>YAĞMUR</DialogTitle>
            {legendColors.slice(0, 6).map((item, index) => (
              <div key={index} className='flex items-center gap-3'>
                <div
                  className='h-4 w-4 rounded-full'
                  style={{ backgroundColor: item.color }}
                />
                <span className='text-sm'>{item.label}</span>
              </div>
            ))}
          </div>
          <div className='space-y-4'>
            <DialogTitle>KAR</DialogTitle>
            {legendColors.slice(-3).map((item, index) => (
              <div key={index} className='flex items-center gap-3'>
                <div
                  className='h-4 w-4 rounded-full'
                  style={{ backgroundColor: item.color }}
                />
                <span className='text-sm'>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
