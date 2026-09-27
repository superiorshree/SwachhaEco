import { CheckCircle2, Clock, Truck, ShieldAlert, Check } from 'lucide-react';
import { RequestStatus } from '../../types';

interface StatusStepperProps {
  status: RequestStatus;
  rejectionReason?: string | null;
  collectorName?: string | null;
  updatedAt?: string;
}

export default function StatusStepper({
  status,
  rejectionReason,
  collectorName,
  updatedAt
}: StatusStepperProps) {
  const steps: { key: RequestStatus; label: string; desc: string; icon: any }[] = [
    {
      key: 'Submitted',
      label: 'Submitted',
      desc: 'Pickup request logged and awaiting collector assignment',
      icon: Clock
    },
    {
      key: 'Assigned',
      label: 'Assigned',
      desc: collectorName ? `Assigned to collector ${collectorName}` : 'Assigned to collector',
      icon: CheckCircle2
    },
    {
      key: 'On the Way',
      label: 'On the Way',
      desc: 'Collector is en route to your pickup location',
      icon: Truck
    },
    {
      key: 'Completed',
      label: 'Completed',
      desc: 'Waste verified and collected at destination',
      icon: Check
    }
  ];

  const isRejected = status === 'Rejected';

  const getStepIndex = (st: RequestStatus) => {
    switch (st) {
      case 'Submitted': return 0;
      case 'Assigned': return 1;
      case 'On the Way': return 2;
      case 'Completed': return 3;
      default: return -1;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="py-2">
      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-border-soft">
        {steps.map((step, idx) => {
          const isPassed = !isRejected && currentIndex >= idx;
          const isCurrent = !isRejected && currentIndex === idx;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative flex items-start group">
              {/* Step indicator circle */}
              <div
                className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : isPassed
                    ? 'bg-primary text-white'
                    : 'bg-white border-2 border-border-hairline text-ink-muted48'
                }`}
              >
                {isPassed ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
              </div>

              {/* Step text content */}
              <div className="ml-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[14px] font-semibold tracking-tight ${
                      isCurrent
                        ? 'text-primary'
                        : isPassed
                        ? 'text-ink'
                        : 'text-ink-muted48'
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-pill bg-primary/10 text-primary">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-ink-muted48 mt-0.5 leading-normal">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}

        {/* Distinct Terminal State for Rejected */}
        {isRejected && (
          <div className="relative flex items-start pt-2">
            <div className="absolute -left-6 top-2.5 w-6 h-6 rounded-full bg-[#d70015] text-white flex items-center justify-center ring-4 ring-[#d70015]/20">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div className="ml-3 p-3 bg-[#fff2f2] border border-[#ffb3b8] rounded-md w-full">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#d70015]">
                  Request Rejected
                </span>
                <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-pill bg-[#d70015]/10 text-[#d70015]">
                  Terminal State
                </span>
              </div>
              <p className="text-[13px] text-ink mt-1 font-medium">
                Reason: {rejectionReason || 'No specific reason provided.'}
              </p>
              <p className="text-[11px] text-ink-muted48 mt-1">
                Rejected requests impact your citizen verification standing and badge eligibility.
              </p>
            </div>
          </div>
        )}
      </div>

      {updatedAt && (
        <div className="mt-4 text-[11px] text-ink-muted48 border-t border-border-soft pt-2">
          Last status update: {new Date(updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
