import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Calendar, Users } from "lucide-react";
import { Player } from "@/types/Player";
import { useToast } from "@/hooks/use-toast";

interface AttendanceTrackerProps {
  players: Player[];
  attendees: string[];
  onAttendanceUpdate: (attendees: string[]) => void;
}

export const AttendanceTracker = ({ players, attendees, onAttendanceUpdate }: AttendanceTrackerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectAll, setSelectAll] = useState(false);

  // Load attendance from database when players change
  useEffect(() => {
    if (user && players.length > 0) {
      loadAttendance();
    }
  }, [user, players]);

  const loadAttendance = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('attendance')
      .select('player_id, is_attending')
      .eq('date', today);

    if (error) {
      console.error('Error loading attendance:', error);
      return;
    }

    const attendingPlayerIds = data
      ?.filter(record => record.is_attending)
      .map(record => record.player_id) || [];

    onAttendanceUpdate(attendingPlayerIds);
  };

  const handlePlayerToggle = async (playerId: string) => {
    if (!user) return;

    const isCurrentlyAttending = attendees.includes(playerId);
    const newAttendees = isCurrentlyAttending
      ? attendees.filter(id => id !== playerId)
      : [...attendees, playerId];
    
    onAttendanceUpdate(newAttendees);

    // Save to database
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          user_id: user.id,
          player_id: playerId,
          date: today,
          is_attending: !isCurrentlyAttending
        }, {
          onConflict: 'user_id,player_id,date'
        });

      if (error) {
        console.error('Error saving attendance:', error);
        toast({
          title: "Error saving attendance",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error saving attendance:', error);
    }
  };

  const handleSelectAll = async () => {
    if (!user) return;

    const newAttendees = (selectAll || attendees.length === players.length) ? [] : players.map(p => p.id);
    onAttendanceUpdate(newAttendees);
    setSelectAll(!selectAll && attendees.length !== players.length);

    // Save all attendance changes to database
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const attendanceUpdates = players.map(player => ({
        user_id: user.id,
        player_id: player.id,
        date: today,
        is_attending: newAttendees.includes(player.id)
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceUpdates, {
          onConflict: 'user_id,player_id,date'
        });

      if (error) {
        toast({
          title: "Error saving attendance",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error saving attendance:', error);
    }
  };

  const attendingPlayers = players.filter(p => attendees.includes(p.id));
  const totalRating = attendingPlayers.reduce((sum, p) => sum + p.rating, 0);
  const averageRating = attendingPlayers.length > 0 ? totalRating / attendingPlayers.length : 0;

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-2xl">
              <Calendar className="h-6 w-6" />
              Today's Attendance
            </span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {today}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{attendingPlayers.length}</div>
                <div className="text-blue-100">Players Attending</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Star className="h-5 w-5 fill-current" />
                  {averageRating.toFixed(1)}
                </div>
                <div className="text-yellow-100">Average Rating</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {attendingPlayers.length >= 2 ? "✅" : "❌"}
                </div>
                <div className="text-green-100">Teams Ready</div>
              </CardContent>
            </Card>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              onClick={handleSelectAll}
              variant="outline"
              className="rounded-full"
            >
              <Users className="h-4 w-4 mr-2" />
              {attendees.length === players.length ? "Clear All" : "Select All"}
            </Button>
          </div>

          {/* Player List */}
          {players.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-xl text-muted-foreground mb-2">No players added yet!</p>
              <p className="text-muted-foreground">Go to Player Management to add your team members.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player) => {
                const isAttending = attendees.includes(player.id);
                return (
                  <Card 
                    key={player.id} 
                    className={`cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 ${
                      isAttending 
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-900'
                    }`}
                    onClick={() => handlePlayerToggle(player.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={isAttending}
                          onChange={() => {}} // Handled by card click
                          className="pointer-events-none"
                        />
                        
                        <div className="text-2xl">{player.avatar || "⚽"}</div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{player.name}</h3>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{player.rating}</span>
                            </div>
                            {player.position && (
                              <Badge variant="outline" className="text-xs">
                                {player.position}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {isAttending && (
                          <div className="text-green-500 animate-bounce">
                            🎉
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Attending Players Summary */}
          {attendingPlayers.length > 0 && (
            <Card className="mt-6 border-2 border-green-500 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
                  🏈 Today's Squad ({attendingPlayers.length} players)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {attendingPlayers.map((player) => (
                    <Badge 
                      key={player.id} 
                      variant="secondary" 
                      className="bg-white dark:bg-gray-800 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 px-3 py-1"
                    >
                      {player.avatar} {player.name} ({player.rating}⭐)
                    </Badge>
                  ))}
                </div>
                
                {attendingPlayers.length >= 2 && (
                  <div className="mt-4 text-center">
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      🎉 Ready to form teams! Go to the Teams & Game tab.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};