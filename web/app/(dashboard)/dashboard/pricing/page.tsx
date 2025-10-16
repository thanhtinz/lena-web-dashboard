import { db } from '@/lib/db';
import { pricingPlans } from '@/lib/schema';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCrown } from '@fortawesome/free-solid-svg-icons';

export default async function PricingPage() {
  const plans = await db.select().from(pricingPlans).orderBy(pricingPlans.priceUsd);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4">Upgrade to Premium</h1>
        <p className="text-slate-400">
          Unlock powerful features and take your Discord server to the next level
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-slate-800 rounded-lg border ${
              plan.badge ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-700'
            } p-8 relative`}
          >
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-white">${plan.priceUsd}</span>
                <span className="text-slate-400">/month</span>
              </div>
              <div className="text-sm text-slate-500 mt-1">
                {plan.priceVnd?.toLocaleString() || 0}đ/tháng
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {plan.features?.map((feature: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faCheck} className="h-5 w-5 text-blue-400 mt-0.5" />
                  <span className="text-slate-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <button
              className={`w-full py-3 rounded-lg font-medium transition ${
                plan.badge
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              {plan.priceUsd === 0 ? 'Current Plan' : 'Subscribe'}
            </button>

            {plan.maxServers !== -1 && (
              <p className="text-xs text-slate-500 text-center mt-4">
                Max {plan.maxServers} server{plan.maxServers !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-slate-800 rounded-lg border border-slate-700 p-8">
        <div className="flex items-start gap-4">
          <FontAwesomeIcon icon={faCrown} className="h-8 w-8 text-yellow-400" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">Need a Custom Plan?</h3>
            <p className="text-slate-400 mb-4">
              Contact us for enterprise solutions with custom features, dedicated support, and special pricing.
            </p>
            <a
              href="/dashboard/support"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
