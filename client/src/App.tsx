import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
// Using type-only import for better TypeScript compliance
import type { SwimmingPractice, CreateSwimmingPracticeInput } from '../../server/src/schema';

function App() {
  // Explicit typing with SwimmingPractice interface
  const [practices, setPractices] = useState<SwimmingPractice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form state with proper typing for nullable fields
  const [formData, setFormData] = useState<CreateSwimmingPracticeInput>({
    date: new Date(),
    duration_minutes: 0,
    distance_meters: 0,
    notes: null // Explicitly null, not undefined
  });

  // useCallback to memoize function used in useEffect
  const loadPractices = useCallback(async () => {
    try {
      const result = await trpc.getSwimmingPractices.query();
      setPractices(result);
    } catch (error) {
      console.error('Failed to load practices:', error);
    }
  }, []); // Empty deps since trpc is stable

  // useEffect with proper dependencies
  useEffect(() => {
    loadPractices();
  }, [loadPractices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createSwimmingPractice.mutate(formData);
      // Update practices list with explicit typing in setState callback
      setPractices((prev: SwimmingPractice[]) => [response, ...prev]);
      // Reset form
      setFormData({
        date: new Date(),
        duration_minutes: 0,
        distance_meters: 0,
        notes: null
      });
    } catch (error) {
      console.error('Failed to create practice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format date for input
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Helper function to calculate average pace
  const calculatePace = (distance: number, duration: number): string => {
    if (distance === 0) return '0:00';
    const paceSeconds = (duration * 60) / (distance / 100); // per 100m
    const minutes = Math.floor(paceSeconds / 60);
    const seconds = Math.round(paceSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">🏊‍♂️ Swimming Practice Tracker</h1>
          <p className="text-blue-600">Track your swimming sessions and monitor your progress</p>
        </div>

        {/* Add Practice Form */}
        <Card className="mb-8 shadow-lg border-blue-200">
          <CardHeader className="bg-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-xl">📝 Log New Practice Session</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-blue-900 mb-1">
                    📅 Practice Date
                  </label>
                  <Input
                    id="date"
                    type="date"
                    value={formatDateForInput(formData.date)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateSwimmingPracticeInput) => ({ 
                        ...prev, 
                        date: new Date(e.target.value) 
                      }))
                    }
                    required
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-blue-900 mb-1">
                    ⏱️ Duration (minutes)
                  </label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="90"
                    value={formData.duration_minutes || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateSwimmingPracticeInput) => ({ 
                        ...prev, 
                        duration_minutes: parseInt(e.target.value) || 0 
                      }))
                    }
                    min="1"
                    required
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="distance" className="block text-sm font-medium text-blue-900 mb-1">
                  📏 Distance (meters)
                </label>
                <Input
                  id="distance"
                  type="number"
                  placeholder="2000"
                  value={formData.distance_meters || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateSwimmingPracticeInput) => ({ 
                      ...prev, 
                      distance_meters: parseFloat(e.target.value) || 0 
                    }))
                  }
                  min="1"
                  step="1"
                  required
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-blue-900 mb-1">
                  📝 Notes (optional)
                </label>
                <Textarea
                  id="notes"
                  placeholder="How did the practice go? Any specific sets or techniques you worked on..."
                  // Handle nullable field with fallback to empty string
                  value={formData.notes || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev: CreateSwimmingPracticeInput) => ({
                      ...prev,
                      notes: e.target.value || null // Convert empty string back to null
                    }))
                  }
                  rows={3}
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
              >
                {isLoading ? '💾 Saving...' : '🏊‍♂️ Log Practice'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Practice History */}
        <Card className="shadow-lg border-blue-200">
          <CardHeader className="bg-cyan-500 text-white rounded-t-lg">
            <CardTitle className="text-xl">📊 Practice History</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {practices.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🏊‍♂️</div>
                <p className="text-gray-500 text-lg">No practices logged yet.</p>
                <p className="text-gray-400">Start by adding your first swimming session above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {practices.map((practice: SwimmingPractice) => (
                  <div key={practice.id} className="border border-blue-200 p-4 rounded-lg bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">
                          📅 {practice.date.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <p className="text-xs text-gray-400">
                          Logged: {practice.created_at.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Session #{practice.id}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{practice.distance_meters}m</div>
                        <div className="text-sm text-blue-500">Distance</div>
                      </div>
                      <div className="bg-cyan-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-cyan-600">{practice.duration_minutes} min</div>
                        <div className="text-sm text-cyan-500">Duration</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {calculatePace(practice.distance_meters, practice.duration_minutes)}
                        </div>
                        <div className="text-sm text-green-500">Pace/100m</div>
                      </div>
                    </div>

                    {/* Handle nullable notes */}
                    {practice.notes && (
                      <>
                        <Separator className="my-3" />
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-medium text-gray-700 mb-2">📝 Notes:</h4>
                          <p className="text-gray-600 whitespace-pre-wrap">{practice.notes}</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                
                {practices.length > 0 && (
                  <div className="text-center pt-4 border-t border-blue-200">
                    <p className="text-blue-600">
                      🏆 Total sessions logged: <span className="font-bold">{practices.length}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Keep up the great work! 💪
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;