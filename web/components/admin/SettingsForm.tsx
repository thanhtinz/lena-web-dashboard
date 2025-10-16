"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";

export function SettingsSaveButton() {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Collect all form data and save
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* settings data */ }),
      });
      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Error saving settings');
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      className="bg-primary text-white px-5 py-2.5 rounded-md hover:bg-primary/90 transition text-sm font-medium disabled:opacity-50"
      onClick={handleSave}
      disabled={loading}
    >
      <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
      {loading ? 'Saving...' : 'Save All Settings'}
    </button>
  );
}
