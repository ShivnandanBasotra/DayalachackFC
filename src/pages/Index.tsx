import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, UserPlus, Shuffle, LogOut } from "lucide-react";
import { PlayerManager } from "@/components/PlayerManager";
import { AttendanceTracker } from "@/components/AttendanceTracker";
import { TeamDisplay } from "@/components/TeamDisplay";
import { CoinToss } from "@/components/CoinToss";
import { Player } from "@/types/Player";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [todayAttendees, setTodayAttendees] = useState<string[]>([]);
  const [teams, setTeams] = useState<{ team1: Player[]; team2: Player[] } | null>(null);
  const [showCoinToss, setShowCoinToss] = useState(false);
  const [activeTab, setActiveTab] = useState<'players' | 'attendance' | 'teams'>('players');

  // Redirect to auth if not logged in
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">⚽ Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "Come back soon! ⚽",
    });
  };

  // Balance teams based on ratings
  const balanceTeams = () => {
    const attendingPlayers = players.filter(p => todayAttendees.includes(p.id));
    
    if (attendingPlayers.length < 2) {
      toast({
        title: "Need more players!",
        description: "Add at least 2 players to today's attendance to form teams! 🏈",
        variant: "destructive",
      });
      return;
    }

    // Sort players by rating (highest first)
    const sortedPlayers = [...attendingPlayers].sort((a, b) => b.rating - a.rating);
    
    const team1: Player[] = [];
    const team2: Player[] = [];
    let team1Rating = 0;
    let team2Rating = 0;

    // Distribute players to balance teams
    sortedPlayers.forEach(player => {
      if (team1Rating <= team2Rating) {
        team1.push(player);
        team1Rating += player.rating;
      } else {
        team2.push(player);
        team2Rating += player.rating;
      }
    });

    setTeams({ team1, team2 });
    setActiveTab('teams');
    
    toast({
      title: "Teams generated! 🎉",
      description: "Check out your balanced teams below!",
    });
  };

  const handleCoinToss = () => {
    if (!teams) {
      toast({
        title: "Generate teams first!",
        description: "Create balanced teams before the coin toss! ⚽",
        variant: "destructive",
      });
      return;
    }
    setShowCoinToss(true);
  };

  const attendingPlayers = players.filter(p => todayAttendees.includes(p.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              ⚽ Dayalachack FC
            </h1>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="text-white bg-green-600 border-white hover:bg-green-700 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <p className="text-green-100 text-lg">
          No excuses, just football. See you on the field!
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Players</p>
                  <p className="text-2xl font-bold">{players.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Today's Attendees</p>
                  <p className="text-2xl font-bold">{attendingPlayers.length}</p>
                </div>
                <Trophy className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Avg Rating</p>
                  <p className="text-2xl font-bold">
                    {attendingPlayers.length > 0 
                      ? (attendingPlayers.reduce((sum, p) => sum + p.rating, 0) / attendingPlayers.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
                <div className="text-2xl">⭐</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Teams Ready</p>
                  <p className="text-2xl font-bold">{teams ? '✅' : '⏳'}</p>
                </div>
                <Shuffle className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('players')}
            variant={activeTab === 'players' ? 'default' : 'outline'}
            className="flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
          >
            <UserPlus className="h-4 w-4" />
            Manage Players
          </Button>
          <Button
            onClick={() => setActiveTab('attendance')}
            variant={activeTab === 'attendance' ? 'default' : 'outline'}
            className="flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
          >
            <Users className="h-4 w-4" />
            Today's Attendance
            {attendingPlayers.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {attendingPlayers.length}
              </Badge>
            )}
          </Button>
          <Button
            onClick={() => setActiveTab('teams')}
            variant={activeTab === 'teams' ? 'default' : 'outline'}
            className="flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
          >
            <Trophy className="h-4 w-4" />
            Teams & Game
          </Button>
        </div>

        {/* Content based on active tab */}
        <div className="animate-fade-in">
          {activeTab === 'players' && (
            <PlayerManager players={players} onPlayersUpdate={setPlayers} />
          )}
          
          {activeTab === 'attendance' && (
            <AttendanceTracker 
              players={players}
              attendees={todayAttendees}
              onAttendanceUpdate={setTodayAttendees}
            />
          )}
          
          {activeTab === 'teams' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    🏆 Team Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <Button
                      onClick={balanceTeams}
                      disabled={attendingPlayers.length < 2}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Shuffle className="h-5 w-5 mr-2" />
                      Generate Balanced Teams ⚽
                    </Button>
                    
                    <Button
                      onClick={handleCoinToss}
                      disabled={!teams}
                      variant="outline"
                      className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      🪙 Coin Toss!
                    </Button>
                  </div>
                  
                  {attendingPlayers.length < 2 && (
                    <p className="text-muted-foreground">
                      📝 Add at least 2 players to today's attendance to generate teams!
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {teams && <TeamDisplay teams={teams} />}
            </div>
          )}
        </div>
      </div>

      {/* Coin Toss Modal */}
      {showCoinToss && teams && (
        <CoinToss
          teams={teams}
          onClose={() => setShowCoinToss(false)}
        />
      )}
    </div>
  );
};

export default Index;