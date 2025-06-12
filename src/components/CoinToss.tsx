import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Player } from "@/types/Player";

interface CoinTossProps {
  teams: {
    team1: Player[];
    team2: Player[];
  };
  onClose: () => void;
}

export const CoinToss = ({ teams, onClose }: CoinTossProps) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'team1' | 'team2' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleCoinToss = () => {
    setIsFlipping(true);
    setResult(null);
    setShowConfetti(false);

    // Simulate coin flip animation
    setTimeout(() => {
      const winner = Math.random() < 0.5 ? 'team1' : 'team2';
      setResult(winner);
      setIsFlipping(false);
      setShowConfetti(true);
      
      // Auto-hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
    }, 2000);
  };

  useEffect(() => {
    // Create confetti particles when showing confetti
    if (showConfetti) {
      const confettiCount = 50;
      const confettiContainer = document.createElement('div');
      confettiContainer.className = 'fixed inset-0 pointer-events-none z-50';
      document.body.appendChild(confettiContainer);

      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'absolute animate-bounce';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.fontSize = '20px';
        confetti.innerHTML = ['🎉', '🎊', '⚽', '🏆', '⭐'][Math.floor(Math.random() * 5)];
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confettiContainer.appendChild(confetti);

        // Remove confetti particle after animation
        setTimeout(() => {
          if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
          }
        }, 5000);
      }

      // Clean up confetti container
      setTimeout(() => {
        if (confettiContainer.parentNode) {
          confettiContainer.parentNode.removeChild(confettiContainer);
        }
      }, 5000);
    }
  }, [showConfetti]);

  const winnerTeam = result === 'team1' ? 'Blue Team 🔵' : 'Red Team 🔴';
  const winnerColor = result === 'team1' ? 'text-blue-600' : 'text-red-600';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl">Coin Toss! 🪙</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Coin Animation */}
          <div className="flex justify-center">
            <div 
              className={`w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg ${
                isFlipping ? 'animate-spin' : ''
              }`}
              style={{
                animation: isFlipping ? 'spin 2s linear infinite' : 'none'
              }}
            >
              {isFlipping ? '🪙' : result ? (result === 'team1' ? '🔵' : '🔴') : '🪙'}
            </div>
          </div>

          {/* Status Text */}
          <div className="space-y-2">
            {!result && !isFlipping && (
              <p className="text-lg text-muted-foreground">
                Ready to see who gets first choice?
              </p>
            )}
            
            {isFlipping && (
              <p className="text-lg font-medium animate-pulse">
                Flipping the coin... 🌟
              </p>
            )}
            
            {result && (
              <div className="space-y-3">
                <p className="text-2xl font-bold">🎉 Result! 🎉</p>
                <p className={`text-3xl font-bold ${winnerColor}`}>
                  {winnerTeam} Wins!
                </p>
                <p className="text-lg text-muted-foreground">
                  {winnerTeam} gets to choose first:
                </p>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4 rounded-lg">
                  <p className="font-medium">⚽ Ball possession OR 🏁 Field side</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            {!result && (
              <Button
                onClick={handleCoinToss}
                disabled={isFlipping}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {isFlipping ? 'Flipping...' : 'Flip Coin! 🪙'}
              </Button>
            )}
            
            {result && (
              <>
                <Button
                  onClick={handleCoinToss}
                  variant="outline"
                  className="rounded-full px-6"
                >
                  Flip Again 🔄
                </Button>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-full px-6"
                >
                  Let's Play! ⚽
                </Button>
              </>
            )}
          </div>

          {/* Teams Preview */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl mb-1">🔵</div>
                <div className="font-bold text-blue-700 dark:text-blue-300">Blue Team</div>
                <div className="text-sm text-muted-foreground">{teams.team1.length} players</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl mb-1">🔴</div>
                <div className="font-bold text-red-700 dark:text-red-300">Red Team</div>
                <div className="text-sm text-muted-foreground">{teams.team2.length} players</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};