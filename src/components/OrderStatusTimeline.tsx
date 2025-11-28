import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, CreditCard, Truck, CheckCircle, X, Calendar, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderStatusTimelineProps {
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string | Date;
  estimatedDelivery?: string | Date;
  trackingNumber?: string;
  content: Record<string, string>;
}

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  status,
  createdAt,
  estimatedDelivery,
  trackingNumber,
  content
}) => {
  const { toast } = useToast();

  const steps = [
    { key: 'pending', icon: Package, labelKey: 'dashboard.orders.timeline.pending' },
    { key: 'paid', icon: CreditCard, labelKey: 'dashboard.orders.timeline.paid' },
    { key: 'shipped', icon: Truck, labelKey: 'dashboard.orders.timeline.shipped' },
    { key: 'completed', icon: CheckCircle, labelKey: 'dashboard.orders.timeline.completed' },
  ];

  const statusOrder = ['pending', 'paid', 'shipped', 'completed'];
  const currentIndex = status === 'cancelled' ? 3 : statusOrder.indexOf(status);
  const isCancelled = status === 'cancelled';

  const getStepDate = (stepKey: string) => {
    if (stepKey === 'pending') return createdAt;
    if (stepKey === 'shipped' || stepKey === 'completed') return estimatedDelivery;
    return undefined;
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  const copyTrackingNumber = async () => {
    if (trackingNumber) {
      await navigator.clipboard.writeText(trackingNumber);
      toast({
        title: content['dashboard.orders.tracking.copied'] || 'Copied!',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="grid grid-cols-4 gap-4 md:gap-0 md:flex md:justify-between">
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const IconComponent = isCancelled && isCurrent ? X : step.icon;
          const colorClass = isCancelled && isCurrent ? 'text-destructive' : isActive ? 'text-primary' : 'text-muted-foreground';
          const bgClass = isActive ? 'bg-primary' : 'bg-muted';
          const date = getStepDate(step.key);

          return (
            <div key={step.key} className="flex flex-col items-center space-y-2">
              <div className={`rounded-full p-2 ${bgClass}`}>
                <IconComponent className={`h-5 w-5 ${colorClass}`} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${colorClass}`}>{content[step.labelKey]}</p>
                {date && <p className="text-xs text-muted-foreground">{formatDate(date)}</p>}
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden md:block flex-1 h-px ${index < currentIndex ? 'bg-primary' : 'border-t border-dashed border-muted-foreground'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Tracking Info */}
      {(trackingNumber || estimatedDelivery) && (
        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">{content['dashboard.orders.tracking.title']}</h3>
            {trackingNumber && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">{content['dashboard.orders.tracking.number']}: {trackingNumber}</span>
                </div>
                <Button variant="outline" size="sm" onClick={copyTrackingNumber}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
            {estimatedDelivery && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{content['dashboard.orders.tracking.estimated_delivery']}: {formatDate(estimatedDelivery)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderStatusTimeline;