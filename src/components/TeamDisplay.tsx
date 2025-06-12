import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Users } from "lucide-react";
import { Player } from "@/types/Player";

interface TeamDisplayProps {
  teams: {
    team1: Player[];
    team2: Player[];
  };
}

export const TeamDisplay = ({ teams }: TeamDisplayProps) => {
  const team1Rating = teams.team1.reduce((sum, p) => sum + p.rating, 0);
  const team2Rating = teams.team2.reduce((sum, p) => sum + p.rating, 0);
  const team1Average = teams.team1.length > 0 ? team1Rating / teams.team1.length : 0;
  const team2Average = teams.team2.length > 0 ? team2Rating / teams.team2.length : 0;

  const teamColors = {
    team1: {
      gradient: "from-blue-500 to-blue-600",
      bg: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      border: "border-blue-500",
      text: "text-blue-700 dark:text-blue-300"
    },
    team2: {
      gradient: "from-red-500 to-red-600", 
      bg: "from-red-50 to-red-100 dark:from-red-950 dark:to-red-900",
      border: "border-red-500",
      text: "text-red-700 dark:text-red-300"
    }
  };

  const TeamCard = ({ 
    team, 
    name, 
    icon, 
    colors, 
    totalRating, 
    averageRating 
  }: {
    team: Player[];
    name: string;
    icon: string;
    colors: typeof teamColors.team1;
    totalRating: number;
    averageRating: number;
  }) => (
    <Card className={`border-2 ${colors.border} bg-gradient-to-br ${colors.bg} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <CardHeader className="text-center">
        <CardTitle className={`${colors.text} flex items-center justify-center gap-2 text-2xl font-bold`}>
          <span className="text-3xl">{icon}</span>
          {name}
        </CardTitle>
        <div className="flex justify-center gap-4 mt-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Users className="h-3 w-3 mr-1" />
            {team.length} players
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
            {averageRating.toFixed(1)} avg
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Trophy className="h-3 w-3 mr-1 text-yellow-600" />
            {totalRating.toFixed(1)} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {team.map((player, index) => (
          <div 
            key={player.id}
            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm border animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-2xl">{player.avatar || "⚽"}</div>
            <div className="flex-1">
              <div className="font-medium text-lg">{player.name}</div>
              {player.position && (
                <Badge variant="outline" className="text-xs mt-1">
                  {player.position}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950 px-2 py-1 rounded-full">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-bold text-yellow-700 dark:text-yellow-300">{player.rating}</span>
            </div>
          </div>
        ))}
        
        {team.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">🤷‍♂️</div>
            <p>No players assigned</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Balance Indicator */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-3 flex items-center justify-center gap-2">
            ⚖️ Team Balance Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">{team1Average.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Blue Team Avg</div>
            </div>
            <div>
              <div className="text-lg font-medium">
                {Math.abs(team1Average - team2Average) < 0.5 ? (
                  <span className="text-green-600 flex items-center justify-center gap-1">
                    ✅ Well Balanced!
                  </span>
                ) : (
                  <span className="text-orange-600 flex items-center justify-center gap-1">
                    ⚠️ {Math.abs(team1Average - team2Average).toFixed(1)} point difference
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">Balance Status</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{team2Average.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Red Team Avg</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamCard
          team={teams.team1}
          name="Blue Team"
          icon="🔵"
          colors={teamColors.team1}
          totalRating={team1Rating}
          averageRating={team1Average}
        />
        
        <TeamCard
          team={teams.team2}
          name="Red Team"
          icon="🔴"
          colors={teamColors.team2}
          totalRating={team2Rating}
          averageRating={team2Average}
        />
      </div>

      {/* Game Ready Indicator */}
      {teams.team1.length > 0 && teams.team2.length > 0 && (
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg animate-pulse">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              🏆 Teams Ready! Let's Play! ⚽
            </h3>
            <p className="text-green-100">
              Use the coin toss to decide who picks the ball or side first!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};