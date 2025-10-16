'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faKey, faSave } from '@fortawesome/free-solid-svg-icons';

export default function PaymentSettings() {
  const [showPayPalSecret, setShowPayPalSecret] = useState(false);
  const [showPayOSKeys, setShowPayOSKeys] = useState(false);

  const paymentConfig = {
    paypal: {
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    },
    payos: {
      clientId: process.env.PAYOS_CLIENT_ID || '',
      apiKey: process.env.PAYOS_API_KEY || '',
      checksumKey: process.env.PAYOS_CHECKSUM_KEY || '',
    }
  };

  const handleSavePayment = async () => {
    alert('Payment configuration saved! (This will be implemented with API endpoint)');
  };

  return (
    <div className="border border-slate-700 rounded-lg p-6 bg-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <FontAwesomeIcon icon={faKey} className="h-5 w-5 text-blue-400" />
        <h3 className="font-semibold text-white">Payment Configuration</h3>
      </div>

      <div className="space-y-6">
        {/* PayPal Configuration */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">PayPal (International)</h4>
            <div className="flex items-center gap-2">
              {paymentConfig.paypal.clientId && paymentConfig.paypal.clientSecret ? (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-green-400">Configured</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTimesCircle} className="h-5 w-5 text-red-400" />
                  <span className="text-sm text-red-400">Not Configured</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Client ID</label>
              <input
                type="text"
                placeholder="Enter PayPal Client ID"
                defaultValue={paymentConfig.paypal.clientId}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Client Secret</label>
              <div className="relative">
                <input
                  type={showPayPalSecret ? "text" : "password"}
                  placeholder="Enter PayPal Client Secret"
                  defaultValue={paymentConfig.paypal.clientSecret}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder:text-slate-500"
                />
                <button
                  onClick={() => setShowPayPalSecret(!showPayPalSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm"
                >
                  {showPayPalSecret ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                🔗 Get your PayPal credentials at:{' '}
                <a 
                  href="https://developer.paypal.com/dashboard/applications" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-200"
                >
                  PayPal Developer Dashboard
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* PayOS Configuration */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">PayOS (Vietnam)</h4>
            <div className="flex items-center gap-2">
              {paymentConfig.payos.clientId && paymentConfig.payos.apiKey && paymentConfig.payos.checksumKey ? (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-green-400">Configured</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTimesCircle} className="h-5 w-5 text-red-400" />
                  <span className="text-sm text-red-400">Not Configured</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Client ID</label>
              <input
                type="text"
                placeholder="Enter PayOS Client ID"
                defaultValue={paymentConfig.payos.clientId}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">API Key</label>
              <div className="relative">
                <input
                  type={showPayOSKeys ? "text" : "password"}
                  placeholder="Enter PayOS API Key"
                  defaultValue={paymentConfig.payos.apiKey}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder:text-slate-500"
                />
                <button
                  onClick={() => setShowPayOSKeys(!showPayOSKeys)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm"
                >
                  {showPayOSKeys ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Checksum Key</label>
              <input
                type={showPayOSKeys ? "text" : "password"}
                placeholder="Enter PayOS Checksum Key"
                defaultValue={paymentConfig.payos.checksumKey}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                🔗 Get your PayOS credentials at:{' '}
                <a 
                  href="https://my.payos.vn" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-200"
                >
                  PayOS Dashboard
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Environment Variables Info */}
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
          <h5 className="font-semibold text-yellow-300 mb-2">⚠️ Important: Environment Variables</h5>
          <p className="text-sm text-yellow-200 mb-3">
            Payment credentials are stored as environment secrets for security. To update them:
          </p>
          <ol className="text-sm text-yellow-200 space-y-1 list-decimal list-inside">
            <li>Go to Replit Secrets in the left sidebar (🔒 icon)</li>
            <li>Add or update the following keys:
              <ul className="ml-6 mt-2 space-y-1 list-disc list-inside">
                <li><code className="bg-slate-800 px-1 py-0.5 rounded">PAYPAL_CLIENT_ID</code></li>
                <li><code className="bg-slate-800 px-1 py-0.5 rounded">PAYPAL_CLIENT_SECRET</code></li>
                <li><code className="bg-slate-800 px-1 py-0.5 rounded">PAYOS_CLIENT_ID</code></li>
                <li><code className="bg-slate-800 px-1 py-0.5 rounded">PAYOS_API_KEY</code></li>
                <li><code className="bg-slate-800 px-1 py-0.5 rounded">PAYOS_CHECKSUM_KEY</code></li>
              </ul>
            </li>
            <li>Restart the workflow for changes to take effect</li>
          </ol>
        </div>

        {/* Save Button - For future API integration */}
        <div className="flex justify-end pt-4 border-t border-slate-700">
          <button
            onClick={handleSavePayment}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <FontAwesomeIcon icon={faSave} className="h-5 w-5" />
            Test Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
