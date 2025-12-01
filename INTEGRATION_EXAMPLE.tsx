// Example integration code for App.tsx
// Add this to your existing App.tsx to enable Supabase features

import React, { useState } from 'react';
import { Database } from 'lucide-react';
import { SupabaseIntegration } from './components/SupabaseIntegration';

// Add this button to your metadata step (around line 306 in renderMetadataStep)
/*
<div className="col-span-1 md:col-span-2">
  <button 
    onClick={() => setShowSupabase(true)}
    className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-bold shadow-lg hover:shadow-purple-500/30 transition-all"
  >
    <Database className="w-5 h-5 mr-2" />
    MEB Senaryolarını Görüntüle & Sınıf Listelerini Yönet
  </button>
</div>
*/

// Add this state near line 34 (with other states)
// const [showSupabase, setShowSupabase] = useState(false);

// Add this handler to import achievements from MEB scenarios
/*
const handleImportMEBAchievements = (achievements: { code: string; description: string }[]) => {
  // Convert to QuestionConfig format
  const newQuestions = achievements.map((ach, index) => ({
    id: index + 1,
    order: index + 1,
    maxScore: 10,
    outcome: { code: ach.code, description: ach.description }
  }));
  
  setQuestions(newQuestions);
  setShowSupabase(false);
  alert(`${achievements.length} kazanım başarıyla projeye aktarıldı!`);
};
*/

// Add this at the end of your return statement (before closing </div>)
/*
{showSupabase && (
  <SupabaseIntegration
    grade={metadata.grade}
    subject={metadata.subject}
    onClose={() => setShowSupabase(false)}
    onImportAchievements={handleImportMEBAchievements}
  />
)}
*/

// Full example of the updated renderMetadataStep section:
export const MetadataStepWithSupabase = () => {
    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200 relative">
            {/* Existing content... */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ... existing fields ... */}

                {/* NEW: Add this button after scenario selection */}
                <div className="col-span-1 md:col-span-2">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl">
                        <div className="flex items-start mb-3">
                            <Database className="w-6 h-6 text-purple-600 mr-2 mt-1" />
                            <div className="flex-1">
                                <h4 className="font-bold text-purple-900 mb-1">Supabase Entegrasyonu</h4>
                                <p className="text-sm text-purple-700">
                                    MEB senaryolarını görüntüleyin, kazanımları otomatik yükleyin ve sınıf listelerinizi yönetin.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {/* setShowSupabase(true) */ }}
                            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-bold shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-0.5"
                        >
                            <Database className="w-5 h-5 mr-2" />
                            Supabase Panelini Aç
                        </button>
                    </div>
                </div>
            </div>

            {/* Rest of your existing code... */}
        </div>
    );
};

// COMPLETE INTEGRATION EXAMPLE
// Copy this entire section and integrate it into your App.tsx

export function AppWithSupabaseIntegration() {
    // Add this import at the top of App.tsx
    // import { SupabaseIntegration } from './components/SupabaseIntegration';

    // Add this state variable
    const [showSupabase, setShowSupabase] = useState(false);

    // Add this handler
    const handleImportMEBAchievements = (achievements: { code: string; description: string }[]) => {
        const newQuestions = achievements.map((ach, index) => ({
            id: index + 1,
            order: index + 1,
            maxScore: Math.round(100 / achievements.length), // Distribute points evenly
            outcome: { code: ach.code, description: ach.description }
        }));

        setQuestions(newQuestions);
        setShowSupabase(false);
        setStep(Step.QUESTIONS); // Move to questions step
        alert(`✅ ${achievements.length} kazanım başarıyla projeye aktarıldı!`);
    };

    // In your return statement, add this button in the metadata step
    // And add this modal at the end of your main return
    return (
        <>
            {/* Your existing app JSX */}

            {/* Add this at the end, before closing tag */}
            {showSupabase && (
                <SupabaseIntegration
                    grade={metadata.grade}
                    subject={metadata.subject}
                    onClose={() => setShowSupabase(false)}
                    onImportAchievements={handleImportMEBAchievements}
                />
            )}
        </>
    );
}
