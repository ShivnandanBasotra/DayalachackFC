import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { UserPlus, Star, Edit, Trash2 } from "lucide-react";
import { Player } from "@/types/Player";
import { useToast } from "@/hooks/use-toast";

interface PlayerManagerProps {
  players: Player[];
  onPlayersUpdate: (players: Player[]) => void;
}

const positions = ["Goalkeeper", "Defender", "Midfielder", "Forward", "Winger"];
const avatarEmojis = ["⚽", "🏃‍♂️", "🏃‍♀️", "👨‍⚽", "👩‍⚽", "🦸‍♂️", "🦸‍♀️", "🏆", "⭐", "🔥"];

export const PlayerManager = ({ players, onPlayersUpdate }: PlayerManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [deletionKey, setDeletionKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMore, setIsAddingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    rating: [7],
    position: "",
    avatar: "⚽"
  });

  // Load players from database
  useEffect(() => {
    if (user) {
      loadPlayers();
    }
  }, [user]);

  const loadPlayers = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading players",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data) {
      // Transform database data to match our Player interface
      const transformedPlayers = data.map(player => ({
        id: player.id,
        name: player.name,
        rating: player.rating,
        position: player.position || undefined,
        avatar: player.avatar || "⚽",
        gamesPlayed: player.games_played,
        totalRating: player.total_rating
      }));
      onPlayersUpdate(transformedPlayers);
    }
  };

  const handleAddPlayer = async () => {
    if (!newPlayer.name.trim() || !user || isSubmitting) return;

    // Check if we need the key (more than one player exists)
    if (players.length >= 1 && deletionKey !== import.meta.env.VITE_DELETION_KEY) {
      toast({
        title: "Key required",
        description: "Please enter the key to add more players.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const playerData = {
      name: newPlayer.name.trim(),
      rating: newPlayer.rating[0],
      position: newPlayer.position || null,
      avatar: newPlayer.avatar,
      games_played: 0,
      total_rating: newPlayer.rating[0],
      user_id: user.id
    };

    try {
      const { error } = await supabase
        .from('players')
        .insert([playerData]);

      if (error) throw error;

      toast({
        title: "Player added! 🎉",
        description: `${newPlayer.name} has joined the squad!`,
      });

      loadPlayers();
      setNewPlayer({ name: "", rating: [7], position: "", avatar: "⚽" });
      setIsAddingPlayer(false);
      setDeletionKey("");
      setIsAddingMore(false);
    } catch (error: any) {
      toast({
        title: "Error adding player",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setNewPlayer({
      name: player.name,
      rating: [player.rating],
      position: player.position || "",
      avatar: player.avatar || "⚽"
    });
    setIsEditing(true);
  };

  const handleUpdatePlayer = async () => {
    if (!editingPlayer || !newPlayer.name.trim() || !user) return;

    // Check if deletion key matches
    if (deletionKey !== import.meta.env.VITE_DELETION_KEY) {
      toast({
        title: "Invalid key",
        description: "Please enter the correct key to update the player.",
        variant: "destructive",
      });
      return;
    }

    const playerData = {
      name: newPlayer.name.trim(),
      rating: newPlayer.rating[0],
      position: newPlayer.position || null,
      avatar: newPlayer.avatar
    };

    try {
      const { error } = await supabase
        .from('players')
        .update(playerData)
        .eq('id', editingPlayer.id);

      if (error) throw error;

      toast({
        title: "Player updated! ⚽",
        description: `${newPlayer.name} has been updated successfully.`,
      });

      loadPlayers();
      setEditingPlayer(null);
      setNewPlayer({ name: "", rating: [7], position: "", avatar: "⚽" });
      setDeletionKey("");
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error updating player",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (player: Player) => {
    setPlayerToDelete(player);
    setDeletionKey("");
  };

  const handleDeleteConfirm = async () => {
    if (!playerToDelete || !user) return;

    // Check if deletion key matches
    if (deletionKey !== import.meta.env.VITE_DELETION_KEY) {
      toast({
        title: "Invalid deletion key",
        description: "Please enter the correct deletion key to remove the player.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerToDelete.id);

      if (error) throw error;

      toast({
        title: "Player removed",
        description: "Player has been removed from the squad.",
      });

      loadPlayers();
      setPlayerToDelete(null);
      setDeletionKey("");
    } catch (error: any) {
      toast({
        title: "Error removing player",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-2xl">
              👥 Player Management
            </span>
            <Dialog open={isAddingPlayer} onOpenChange={(open) => {
              setIsAddingPlayer(open);
              if (!open) {
                setDeletionKey("");
                setIsAddingMore(false);
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Player
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Player ⚽</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Player name"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                    className="rounded-lg"
                  />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rating: {newPlayer.rating[0]}/10</label>
                    <Slider
                      value={newPlayer.rating}
                      onValueChange={(value) => setNewPlayer(prev => ({ ...prev, rating: value }))}
                      max={10}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Beginner</span>
                      <span>Superstar ⭐</span>
                    </div>
                  </div>

                  <Select value={newPlayer.position} onValueChange={(value) => setNewPlayer(prev => ({ ...prev, position: value }))}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select position (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map(pos => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Avatar</label>
                    <div className="grid grid-cols-5 gap-2">
                      {avatarEmojis.map(emoji => (
                        <Button
                          key={emoji}
                          variant={newPlayer.avatar === emoji ? "default" : "outline"}
                          className="aspect-square text-lg rounded-lg"
                          onClick={() => setNewPlayer(prev => ({ ...prev, avatar: emoji }))}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {players.length >= 1 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Enter Key to Add More Players</label>
                      <Input
                        type="password"
                        placeholder="Enter key"
                        value={deletionKey}
                        onChange={(e) => setDeletionKey(e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                  )}

                  <Button 
                    onClick={handleAddPlayer} 
                    className="w-full rounded-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding Player..." : "Add Player 🎉"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚽</div>
              <p className="text-xl text-muted-foreground mb-2">No players yet!</p>
              <p className="text-muted-foreground">Start building your dream team by adding players.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player) => (
                <Card key={player.id} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg transform hover:scale-105 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{player.avatar || "⚽"}</div>
                        <div>
                          <h3 className="font-bold text-lg">{player.name}</h3>
                          {player.position && (
                            <Badge variant="secondary" className="text-xs">
                              {player.position}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPlayer(player)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(player)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-bold text-lg">{player.rating}</span>
                        <span className="text-sm text-muted-foreground">/10</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {player.gamesPlayed} games
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Player Dialog */}
      <Dialog open={!!editingPlayer} onOpenChange={() => {
        setEditingPlayer(null);
        setIsEditing(false);
        setDeletionKey("");
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Player ✏️</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Player name"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
              className="rounded-lg"
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating: {newPlayer.rating[0]}/10</label>
              <Slider
                value={newPlayer.rating}
                onValueChange={(value) => setNewPlayer(prev => ({ ...prev, rating: value }))}
                max={10}
                min={1}
                step={0.5}
                className="w-full"
              />
            </div>

            <Select value={newPlayer.position} onValueChange={(value) => setNewPlayer(prev => ({ ...prev, position: value }))}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select position (optional)" />
              </SelectTrigger>
              <SelectContent>
                {positions.map(pos => (
                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar</label>
              <div className="grid grid-cols-5 gap-2">
                {avatarEmojis.map(emoji => (
                  <Button
                    key={emoji}
                    variant={newPlayer.avatar === emoji ? "default" : "outline"}
                    className="aspect-square text-lg rounded-lg"
                    onClick={() => setNewPlayer(prev => ({ ...prev, avatar: emoji }))}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter Key to Update</label>
                <Input
                  type="password"
                  placeholder="Enter key"
                  value={deletionKey}
                  onChange={(e) => setDeletionKey(e.target.value)}
                  className="rounded-lg"
                />
              </div>
            )}

            <Button onClick={handleUpdatePlayer} className="w-full rounded-lg">
              Update Player 🎉
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!playerToDelete} onOpenChange={() => setPlayerToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Player 🚫</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete {playerToDelete?.name}? This action cannot be undone.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter Deletion Key</label>
              <Input
                type="password"
                placeholder="Enter deletion key"
                value={deletionKey}
                onChange={(e) => setDeletionKey(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPlayerToDelete(null)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="rounded-lg"
            >
              Delete Player
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};