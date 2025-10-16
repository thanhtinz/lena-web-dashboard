'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';

export default function PricingPlansList({ plans }: { plans: any[] }) {
  if (plans.length === 0) {
    return (
      <div className="border border-slate-700 rounded-lg p-12 bg-slate-800 text-center">
        <p className="text-slate-400 mb-4">No pricing plans created yet</p>
        <p className="text-sm text-slate-500">Click "Create New Plan" to get started</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div key={plan.id} className="border border-slate-700 rounded-lg p-6 bg-slate-800">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              {plan.badge && (
                <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full mt-1 inline-block">
                  {plan.badge}
                </span>
              )}
            </div>
            <div className={`h-2 w-2 rounded-full ${plan.isActive ? "bg-green-500" : "bg-red-500"}`} />
          </div>

          <div className="mb-4">
            <div className="text-3xl font-bold text-white">${plan.priceUsd}</div>
            <div className="text-sm text-slate-400">{plan.priceVnd?.toLocaleString() || 0}đ/month</div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-slate-400">
              Max servers: {plan.maxServers === -1 ? 'Unlimited' : plan.maxServers}
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {plan.features?.map((feature: string, i: number) => (
              <div key={i} className="text-sm flex items-start gap-2 text-slate-300">
                <FontAwesomeIcon icon={faCheck} className="text-blue-400 h-4 w-4 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button className="flex-1 border border-blue-600 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-600/10 transition text-sm">
              <FontAwesomeIcon icon={faEdit} className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button className="px-4 py-2 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/10 transition text-sm">
              <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
