import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Eye, EyeOff, Target, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';

const PuzzleSolver = () => {
  const { puzzleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState(null);
  const [chess, setChess] = useState(new Chess());
  const [userMoves, setUserMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [starRating, setStarRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [moveNavIndex, setMoveNavIndex] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [movePreviews, setMovePreviews] = useState([]);
  const [showPlayedModal, setShowPlayedModal] = useState(false);
  const [playedDemoFen, setPlayedDemoFen] = useState(null);
  const [isAnimatingPlayedMove, setIsAnimatingPlayedMove] = useState(false);
  const [moveError, setMoveError] = useState(null);
  const [showWrongMoveModal, setShowWrongMoveModal] = useState(false);
  const [wrongMoveData, setWrongMoveData] = useState(null);
  const [boardKey, setBoardKey] = useState(0); // Force chessboard re-render
  const [lastMoveHighlight, setLastMoveHighlight] = useState(null); // Highlight last move
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false); // Success animation
  const [isOpponentMoving, setIsOpponentMoving] = useState(false); // Opponent move indicator
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isLoadingNextPuzzle, setIsLoadingNextPuzzle] = useState(false);
  const [otherPuzzles, setOtherPuzzles] = useState([]);
  const [hasLoadedOtherPuzzles, setHasLoadedOtherPuzzles] = useState(false);
  const [hasInteractedWithBoard, setHasInteractedWithBoard] = useState(false);
  const [showMorePuzzles, setShowMorePuzzles] = useState(false);
  
  // New state for managing puzzle collection
  const [puzzleCollection, setPuzzleCollection] = useState(null);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [summary, setSummary] = useState(null);
  const [puzzlesStartedToday, setPuzzlesStartedToday] = useState(0);
  const [totalPuzzlesToday, setTotalPuzzlesToday] = useState(0);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);

  // Check if user is signed in (you can enhance this with actual auth logic)
  const isUserSignedIn = () => {
    // For now, check if username and platform are stored
    // In a real app, you'd check for auth tokens, user session, etc.
    const username = localStorage.getItem('username');
    const platform = localStorage.getItem('platform');
    return !!(username && platform);
  };

  useEffect(() => {
    loadPuzzle();
  }, [puzzleId]);

  useEffect(() => {
    // If there is a last move, start at moveNavIndex 1 (after the last move is played)
    if (puzzle && puzzle.solution && puzzle.solution.moves && puzzle.solution.moves.length > 0) {
      setMoveNavIndex(1);
    } else {
      setMoveNavIndex(0);
    }
  }, [puzzleId, puzzle]);

  useEffect(() => {
    if (!selectedSquare || !chess) {
      setMovePreviews([]);
      return;
    }
    
    try {
      // Use currentMoveIndex to get the current position
      const currentPosition = getBoardFenAtMove(currentMoveIndex);
      const tempChess = new Chess(currentPosition);
      const moves = tempChess.moves({ square: selectedSquare, verbose: true });
      setMovePreviews(moves);
      setMoveError(null);
    } catch (error) {
      console.error('[ERROR] Error getting move previews:', error);
      setMovePreviews([]);
      setMoveError('Error loading move previews');
    }
  }, [selectedSquare, chess, puzzle, currentMoveIndex]);

  const loadPuzzle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, try to get puzzles from navigation state
      let puzzles = null;
      let puzzleIndex = 0;
      let puzzleSummary = null;
      
      if (location.state && location.state.puzzles) {
        console.log('[DEBUG] Loading puzzle from navigation state, puzzleId:', puzzleId);
        puzzles = location.state.puzzles;
        puzzleIndex = location.state.currentPuzzleIndex || 0;
        puzzleSummary = location.state.summary;
      } else {
        // Try to get from localStorage as fallback
        const storedPuzzles = localStorage.getItem('currentPuzzles');
        const storedIndex = localStorage.getItem('currentPuzzleIndex');
        
        if (storedPuzzles && storedIndex) {
          console.log('[DEBUG] Loading puzzle from localStorage, puzzleId:', puzzleId);
          puzzles = JSON.parse(storedPuzzles);
          puzzleIndex = parseInt(storedIndex);
        }
      }
      
      if (puzzles && puzzles.length > 0) {
        // Use the puzzle collection
        setPuzzleCollection(puzzles);
        setCurrentPuzzleIndex(puzzleIndex);
        setSummary(puzzleSummary);
        
        // Find the specific puzzle by ID or index
        let targetPuzzle = null;
        if (puzzleId) {
          // Try to find by ID first
          targetPuzzle = puzzles.find(p => p.id === puzzleId);
          if (!targetPuzzle) {
            // Fallback to index
            const index = parseInt(puzzleId);
            if (!isNaN(index) && index >= 0 && index < puzzles.length) {
              targetPuzzle = puzzles[index];
              puzzleIndex = index;
            }
          }
        }
        
        if (!targetPuzzle) {
          // Use the current puzzle index
          targetPuzzle = puzzles[puzzleIndex];
        }
        
        if (targetPuzzle) {
          setPuzzle(targetPuzzle);
          const newChess = new Chess(targetPuzzle.position);
          setChess(newChess);
          setLoading(false);
          return;
        }
      }
      
      // Fallback: fetch from backend
      console.log('[DEBUG] Fetching puzzle from backend, puzzleId:', puzzleId);
      const response = await fetch(`/api/puzzles/${puzzleId}`);
      if (!response.ok) throw new Error('Failed to load puzzle');
      const data = await response.json();
      if (!data.success || !data.puzzle) throw new Error('Puzzle not found');
      
      setPuzzle(data.puzzle);
      const newChess = new Chess(data.puzzle.position);
      setChess(newChess);
      setLoading(false);
    } catch (err) {
      console.error('[ERROR] Failed to load puzzle:', err);
      setError('Failed to load puzzle');
      setLoading(false);
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    try {
      // Use the current board position based on moves made so far
      const tempChess = new Chess(getBoardFenAtMove(currentMoveIndex));
      
      const move = tempChess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (move === null) {
        setWrongMoveData({
          attemptedMove: `${sourceSquare}-${targetSquare}`,
          correctMove: puzzle.solution.moves[currentMoveIndex],
          moveNumber: currentMoveIndex + 1,
          illegal: true
        });
        setShowWrongMoveModal(true);
        setFailedAttempts(failedAttempts + 1);
        setMoveError('Illegal move attempted');
        return false;
      }

      // Update the chess state with the new position
      setChess(new Chess(tempChess.fen()));
      setUserMoves([...userMoves, move.san]);
      
      // Small delay for smoother visual transition
      setTimeout(() => {
        setBoardKey(prev => prev + 1); // Force chessboard re-render
      }, 50);
      
      // Check if this is the correct move
      const correctMove = puzzle.solution.moves[currentMoveIndex];
      
      if (move.san === correctMove) {
        setIsCorrect(true);
        setCurrentMoveIndex(currentMoveIndex + 1);
        setFailedAttempts(0);
        setShowHint(false);
        
        // Highlight the move that was just made
        setLastMoveHighlight({
          from: sourceSquare,
          to: targetSquare,
          timestamp: Date.now()
        });
        
        // Show success animation
        setShowSuccessAnimation(true);
        
        // Clear the highlight and animation after 1 second
        setTimeout(() => {
          setLastMoveHighlight(null);
          setShowSuccessAnimation(false);
        }, 1000);
        
        if (currentMoveIndex + 1 >= puzzle.solution.moves.length) {
          // Puzzle solved! Grade performance
          let stars = 3;
          if (showSolution) {
            stars = 0;
          } else if (showHint || failedAttempts >= 3) {
            stars = 1;
          } else if (failedAttempts >= 1) {
            stars = 2;
          }
          setStarRating(stars);
          setTimeout(() => {
            setShowRatingModal(true);
          }, 500);
        } else {
          // Show "opponent is thinking" first, then auto-play the response
          setTimeout(() => {
            setIsOpponentMoving(true);
            
            // After showing the thinking indicator, play the move
            setTimeout(() => {
              const opponentMove = puzzle.solution.moves[currentMoveIndex + 1];
              if (opponentMove) {
                setCurrentMoveIndex(currentMoveIndex + 2); // Skip to next player's turn
                setUserMoves([...userMoves, move.san, opponentMove]);
                
                // Check if this completes the puzzle
                if (currentMoveIndex + 2 >= puzzle.solution.moves.length) {
                  let stars = 3;
                  if (showSolution) {
                    stars = 0;
                  } else if (showHint || failedAttempts >= 3) {
                    stars = 1;
                  } else if (failedAttempts >= 1) {
                    stars = 2;
                  }
                  setStarRating(stars);
                  setTimeout(() => {
                    setShowRatingModal(true);
                  }, 500);
                }
                
                // Clear opponent moving indicator after a short delay
                setTimeout(() => {
                  setIsOpponentMoving(false);
                }, 500);
              }
            }, 1200); // Thinking time before opponent moves
          }, 800); // Delay to show the player's move first
        }
      } else {
        // Wrong move - show modal with options
        setWrongMoveData({
          attemptedMove: move.san,
          correctMove: correctMove,
          moveNumber: currentMoveIndex + 1,
          illegal: false
        });
        setShowWrongMoveModal(true);
        setFailedAttempts(failedAttempts + 1);
      }
      setShowHint(false); // Hide hint after any move
      setMoveError(null); // Clear any previous move errors
      return true;
    } catch (error) {
      console.error('[ERROR] Error in onDrop:', error);
      setMoveError('Invalid move attempted');
      return false;
    }
  };

  const resetPuzzle = () => {
    const newChess = new Chess(puzzle.position);
    setChess(newChess);
    setUserMoves([]);
    setCurrentMoveIndex(0);
    setIsCorrect(null);
    setShowSolution(false);
    setFailedAttempts(0);
    setShowHint(false);
    setStarRating(null);
    setShowRatingModal(false);
    setShowWrongMoveModal(false);
    setWrongMoveData(null);
    setBoardKey(0); // Reset board key
    setIsOpponentMoving(false); // Reset opponent moving state
  };

  const handleWrongMoveRetry = () => {
    // Reset to the beginning of the puzzle
    const newChess = new Chess(puzzle.position);
    setChess(newChess);
    setUserMoves([]);
    setCurrentMoveIndex(0);
    setShowWrongMoveModal(false);
    setWrongMoveData(null);
  };

  const handleWrongMoveContinue = () => {
    // Continue from the last successful move (undo the wrong move)
    const newChess = new Chess(puzzle.position);
    // Replay all correct moves up to currentMoveIndex
    for (let i = 0; i < currentMoveIndex; i++) {
      const result = newChess.move(puzzle.solution.moves[i], { sloppy: true });
      if (!result) {
        console.warn(`[WARNING] Failed to replay move ${puzzle.solution.moves[i]} in handleWrongMoveContinue`);
      }
    }
    setChess(newChess);
    setUserMoves(puzzle.solution.moves.slice(0, currentMoveIndex));
    setShowWrongMoveModal(false);
    setWrongMoveData(null);
  };

  const handleShowHint = () => {
    setShowHint(true);
  };

  const getBoardOrientation = () => {
    if (puzzle && puzzle.position) {
      // FEN format: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
      const fenParts = puzzle.position.split(' ');
      if (fenParts.length > 1) {
        return fenParts[1] === 'b' ? 'black' : 'white';
      }
    }
    // fallback to gameContext if available
    if (puzzle?.gameContext?.player === 'b' || puzzle?.gameContext?.player === 'black') return 'black';
    return 'white';
  };

  // Highlight the piece to move for the next correct move
  let customSquareStyles = {};
  
  // Highlight last move made
  if (lastMoveHighlight) {
    customSquareStyles[lastMoveHighlight.from] = {
      boxShadow: '0 0 0 4px #10b981, 0 0 10px 4px #6ee7b7',
      background: '#d1fae5',
      transition: 'all 0.3s ease-in-out'
    };
    customSquareStyles[lastMoveHighlight.to] = {
      boxShadow: '0 0 0 4px #10b981, 0 0 10px 4px #6ee7b7',
      background: '#d1fae5',
      transition: 'all 0.3s ease-in-out'
    };
  }
  
  // Highlight for hint
  if (showHint && puzzle && chess) {
    const correctMove = puzzle.solution.moves[currentMoveIndex];
    if (correctMove) {
      try {
        const tempChess = new Chess(getBoardFenAtMove(currentMoveIndex));
        const moveObj = tempChess.move(correctMove, { sloppy: true });
        if (moveObj && moveObj.from) {
          customSquareStyles[moveObj.from] = {
            boxShadow: '0 0 0 4px #facc15, 0 0 10px 4px #fde68a',
            background: '#fef9c3',
          };
        }
      } catch (e) {}
    }
  }
  // Highlight for move preview
  if (selectedSquare && movePreviews.length > 0) {
    customSquareStyles[selectedSquare] = {
      boxShadow: '0 0 0 4px #fde047',
      background: '#fef9c3',
    };
    movePreviews.forEach((move) => {
      if (move.captured) {
        customSquareStyles[move.to] = {
          boxShadow: '0 0 0 4px #f87171',
          background: '#fee2e2',
        };
      } else {
        customSquareStyles[move.to] = {
          boxShadow: '0 0 0 4px #fde047',
          background: '#fef9c3',
        };
      }
    });
  }

  const getBoardFenAtMove = (moveIndex) => {
    if (!puzzle) return chess.fen();
    
    try {
      // Start from the puzzle position (which is already set to the correct starting point)
      const tempChess = new Chess(puzzle.position);
      
      // If moveIndex is 0, show the puzzle position as-is
      if (moveIndex === 0) {
        return tempChess.fen();
      }
      
      // Play solution moves up to moveIndex
      const movesToPlay = Math.min(moveIndex, puzzle.solution.moves.length);
      
      for (let i = 0; i < movesToPlay; i++) {
        const move = puzzle.solution.moves[i];
        
        // Try to play the move directly - chess.js will handle validation
        const result = tempChess.move(move, { sloppy: true });
        if (!result) {
          // If the move fails, log the legal moves for debugging
          const legalMoves = tempChess.moves();
          console.warn(`[WARNING] Failed to play solution move ${move} at position ${tempChess.fen()}. Legal moves:`, legalMoves);
          // Return the current position instead of crashing
          return tempChess.fen();
        }
      }
      
      return tempChess.fen();
    } catch (error) {
      console.error('[ERROR] Error in getBoardFenAtMove:', error);
      // Return the original puzzle position as fallback
      return puzzle.position;
    }
  };

  const handleNavBack = () => {
    setMoveNavIndex((prev) => Math.max(0, prev - 1));
  };
  const handleNavForward = () => {
    setMoveNavIndex((prev) => Math.min(puzzle.solution.moves.length, prev + 1));
  };

  // Handle square click for move preview
  const handleSquareClick = (square) => {
    // Mark that user has interacted with the board (for triggering puzzle generation)
    if (!hasInteractedWithBoard) {
      setHasInteractedWithBoard(true);
    }
    
    // If a piece is selected and user clicks a legal destination, make the move
    if (
      selectedSquare &&
      movePreviews.length > 0 &&
      movePreviews.some((m) => m.to === square)
    ) {
      onDrop(selectedSquare, square);
      setSelectedSquare(null);
      return;
    }
    // Otherwise, select/deselect piece as before
    if (selectedSquare === square) {
      setSelectedSquare(null);
    } else {
      // Allow selecting any piece that exists on the square
      // Use currentMoveIndex to get the current position
      const tempChess = new Chess(getBoardFenAtMove(currentMoveIndex));
      const piece = tempChess.get(square);
      if (piece) {
        setSelectedSquare(square);
      }
    }
  };

  // Clear move preview after a move or navigation
  useEffect(() => {
    setSelectedSquare(null);
  }, [moveNavIndex, currentMoveIndex, chess.fen()]);

  // Sword icon SVG for capture squares
  const SwordIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: 2, right: 2, opacity: 0.35, pointerEvents: 'none' }}>
      <path d="M2 21l1.5-4.5L14 6l4 4L6.5 19.5 2 21z" stroke="#dc2626" strokeWidth="2" fill="#dc2626" fillOpacity="0.25" />
      <path d="M14 6l4 4" stroke="#dc2626" strokeWidth="2" />
    </svg>
  );

  // Helper to get the FEN before the original move (from backend)
  const getFenBeforeOriginalMove = () => {
    if (!puzzle || !puzzle.fenBeforeOriginalMove) return getBoardFenAtMove(0);
    return puzzle.fenBeforeOriginalMove;
  };

  // Helper to play the original move as an animation
  const playOriginalMoveDemo = () => {
    if (!puzzle || !puzzle.gameContext || !puzzle.gameContext.originalMove) return;
    setPlayedDemoFen(getFenBeforeOriginalMove());
    setIsAnimatingPlayedMove(true);
    setTimeout(() => {
      const tempChess = new Chess(getFenBeforeOriginalMove());
      tempChess.move(puzzle.gameContext.originalMove);
      setPlayedDemoFen(tempChess.fen());
      setIsAnimatingPlayedMove(false);
    }, 500); // short delay for animation effect
  };

  // When modal opens, auto-play the move
  useEffect(() => {
    if (showPlayedModal) {
      playOriginalMoveDemo();
    } else {
      setPlayedDemoFen(null);
      setIsAnimatingPlayedMove(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPlayedModal]);

  // Enhanced lazy loading: generate more puzzles on first chessboard interaction, then fetch others
  useEffect(() => {
    if (
      hasInteractedWithBoard &&
      !hasLoadedOtherPuzzles &&
      puzzle && puzzle.id
    ) {
      console.log('[DEBUG] Triggering puzzle generation on first board interaction');
      const username = localStorage.getItem('username');
      const platform = localStorage.getItem('platform');
      fetch(`/api/puzzles/generate-more?username=${encodeURIComponent(username)}&platform=${encodeURIComponent(platform)}`)
        .then(res => res.json())
        .then(data => {
          return fetch(`/api/puzzles/others?exclude=${puzzle.id}`);
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.puzzles)) {
            setOtherPuzzles(data.puzzles);
          }
          setHasLoadedOtherPuzzles(true);
        })
        .catch((error) => {
          console.error('[ERROR] Error in puzzle generation:', error);
          setHasLoadedOtherPuzzles(true);
        });
    }
  }, [hasInteractedWithBoard, hasLoadedOtherPuzzles, puzzle]);

  // Update loadNextPuzzle to randomly select from puzzle collection
  const loadNextPuzzle = async () => {
    
    setIsLoadingNextPuzzle(true);
    setShowRatingModal(false);
    setIsReviewMode(false);
    setUserMoves([]);
    setCurrentMoveIndex(0);
    setMoveNavIndex(0);
    setShowSolution(false);
    setIsCorrect(null);
    setFailedAttempts(0);
    setShowHint(false);
    setStarRating(null);
    setShowPlayedModal(false);
    setPlayedDemoFen(null);
    setIsAnimatingPlayedMove(false);
    setMoveError(null);
    setShowWrongMoveModal(false);
    setWrongMoveData(null);
    setBoardKey(0);
    setLastMoveHighlight(null);
    setShowSuccessAnimation(false);
    setIsOpponentMoving(false);
    setSelectedSquare(null);
    setMovePreviews([]);
    setPuzzle(null);
    setLoading(true);
    setError(null);
    
    try {
      let nextPuzzle = null;
      
      // First, try to use puzzle collection (random selection)
      if (puzzleCollection && puzzleCollection.length > 0) {
        console.log('[DEBUG] Loading next puzzle from collection, current index:', currentPuzzleIndex, 'total puzzles:', puzzleCollection.length);
        // Get remaining puzzles (exclude the current one)
        const remainingPuzzles = puzzleCollection.filter((_, index) => index !== currentPuzzleIndex);
        
        if (remainingPuzzles.length > 0) {
          // Randomly select from remaining puzzles
          const randomIndex = Math.floor(Math.random() * remainingPuzzles.length);
          nextPuzzle = remainingPuzzles[randomIndex];
          
          // Find the index of the selected puzzle in the original collection
          const newIndex = puzzleCollection.findIndex(p => p.id === nextPuzzle.id);
          setCurrentPuzzleIndex(newIndex);
        } else {
          // If no remaining puzzles, cycle back to the first one
          nextPuzzle = puzzleCollection[0];
          setCurrentPuzzleIndex(0);
        }
      } else if (otherPuzzles.length > 0) {
        // Fallback to other puzzles
        nextPuzzle = otherPuzzles[0];
        setOtherPuzzles(otherPuzzles.slice(1));
      } else {
        // Final fallback: fetch a new random puzzle from the backend
        const username = localStorage.getItem('username');
        const platform = localStorage.getItem('platform');
        const response = await fetch(`/api/puzzles/random?username=${encodeURIComponent(username)}&platform=${encodeURIComponent(platform)}`);
        if (!response.ok) throw new Error('Failed to load next puzzle');
        const data = await response.json();
        if (!data.success || !data.puzzle) throw new Error('No more puzzles available');
        nextPuzzle = data.puzzle;
      }
      
      setPuzzle(nextPuzzle);
      setChess(new Chess(nextPuzzle.position));
      setLoading(false);
      setHasLoadedOtherPuzzles(false); // Reset for next puzzle
      setHasInteractedWithBoard(false); // Reset for next puzzle
    } catch (err) {
      console.error('[ERROR] Failed to load next puzzle:', err);
      setError('Failed to load next puzzle');
      setLoading(false);
    }
    setIsLoadingNextPuzzle(false);
  };

  // Handler to load a puzzle from the list
  const handleSelectOtherPuzzle = (puzzle) => {
    setShowMorePuzzles(false);
    setShowRatingModal(false);
    setIsReviewMode(false);
    setUserMoves([]);
    setCurrentMoveIndex(0);
    setMoveNavIndex(0);
    setShowSolution(false);
    setIsCorrect(null);
    setFailedAttempts(0);
    setShowHint(false);
    setStarRating(null);
    setShowPlayedModal(false);
    setPlayedDemoFen(null);
    setIsAnimatingPlayedMove(false);
    setMoveError(null);
    setShowWrongMoveModal(false);
    setWrongMoveData(null);
    setBoardKey(0);
    setLastMoveHighlight(null);
    setShowSuccessAnimation(false);
    setIsOpponentMoving(false);
    setSelectedSquare(null);
    setMovePreviews([]);
    
    // If we have a puzzle collection, find the index of the selected puzzle
    if (puzzleCollection && puzzleCollection.length > 0) {
      // Use originalIndex if available (from filtered list), otherwise find by ID
      const puzzleIndex = puzzle.originalIndex !== undefined 
        ? puzzle.originalIndex 
        : puzzleCollection.findIndex(p => p.id === puzzle.id);
      
      if (puzzleIndex !== -1) {
        setCurrentPuzzleIndex(puzzleIndex);
      }
    }
    
    setPuzzle(puzzle);
    setChess(new Chess(puzzle.position));
    setLoading(false);
    setHasLoadedOtherPuzzles(false); // Reset for next puzzle
  };

  // Track puzzle attempts within 24 hours
  useEffect(() => {
    const trackPuzzleAttempt = () => {
      const now = Date.now();
      const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
      
      // Get existing attempts from localStorage
      const existingAttempts = JSON.parse(localStorage.getItem('puzzleAttempts') || '[]');
      
      // Filter out attempts older than 24 hours
      const recentAttempts = existingAttempts.filter(timestamp => timestamp > twentyFourHoursAgo);
      
      // Add current attempt
      recentAttempts.push(now);
      
      // Save back to localStorage
      localStorage.setItem('puzzleAttempts', JSON.stringify(recentAttempts));
      
      // Update state
      setPuzzlesStartedToday(recentAttempts.length);
      
      // Note: Removed automatic unlock prompt - now using manual CTAs instead
      
      // Calculate total puzzles available today (this could be enhanced with backend data)
      const username = localStorage.getItem('username');
      const platform = localStorage.getItem('platform');
      if (username && platform) {
        // For now, assume 5 puzzles per day (free tier limit)
        setTotalPuzzlesToday(5);
      } else {
        setTotalPuzzlesToday(0);
      }
    };

    // Track attempt when puzzle loads
    if (puzzle && puzzle.id) {
      trackPuzzleAttempt();
    }
  }, [puzzle]);

  // Load existing puzzle attempts on component mount
  useEffect(() => {
    const loadPuzzleAttempts = () => {
      const now = Date.now();
      const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
      
      const existingAttempts = JSON.parse(localStorage.getItem('puzzleAttempts') || '[]');
      const recentAttempts = existingAttempts.filter(timestamp => timestamp > twentyFourHoursAgo);
      
      setPuzzlesStartedToday(recentAttempts.length);
      
      const username = localStorage.getItem('username');
      const platform = localStorage.getItem('platform');
      if (username && platform) {
        setTotalPuzzlesToday(5);
      } else {
        setTotalPuzzlesToday(0);
      }
    };

    loadPuzzleAttempts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {/* Back to Home button */}
        <Link
          to="/"
          onClick={() => {
            // Clear stored puzzles when going back to home
            localStorage.removeItem('currentPuzzles');
            localStorage.removeItem('currentPuzzleIndex');
          }}
          className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        {/* Only show the top navigation buttons if in review mode */}
        {isReviewMode && (
          <div className="flex flex-row justify-center gap-2 mt-6 mb-6">
            <button
              onClick={loadNextPuzzle}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isLoadingNextPuzzle}
            >
              {isLoadingNextPuzzle ? 'Loading...' : 'Play Next Puzzle'}
            </button>
            <button
              onClick={() => setShowMorePuzzles(true)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              See More Puzzles
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Chess Board */}
        <div className="space-y-3">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Puzzle #{puzzle.id ? puzzle.id.substring(0, 8) : 'Unknown'}</h3>
                  <button
                    onClick={() => {
                      // Save puzzle functionality - you can implement this later
                      console.log('Save puzzle clicked');
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Save puzzle"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
                <div style={{ minHeight: '40px' }}>
              {isReviewMode ? (
                <div className="flex items-center justify-center space-x-4 my-3">
                  <button
                    onClick={handleNavBack}
                    className={`p-2 rounded-full border transition-colors duration-150 ${moveNavIndex === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                    disabled={moveNavIndex === 0}
                    aria-disabled={moveNavIndex === 0}
                  >
                    <ChevronLeft className={`w-5 h-5 ${moveNavIndex === 0 ? 'text-gray-400' : 'text-blue-600'}`} />
                  </button>
                  <span className="text-gray-700 font-medium">Move {moveNavIndex + 1} / {puzzle.solution.moves.length}</span>
                  <button
                    onClick={handleNavForward}
                    className={`p-2 rounded-full border transition-colors duration-150 ${moveNavIndex === puzzle.solution.moves.length - 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                    disabled={moveNavIndex === puzzle.solution.moves.length - 1}
                    aria-disabled={moveNavIndex === puzzle.solution.moves.length - 1}
                  >
                    <ChevronRight className={`w-5 h-5 ${moveNavIndex === puzzle.solution.moves.length - 1 ? 'text-gray-400' : 'text-blue-600'}`} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center my-3" style={{ height: '40px' }}>
                  {isOpponentMoving && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span className="text-gray-500 text-base font-medium">Opponent is thinking...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="chess-board">
              <div style={{ position: 'relative' }}>
                {/* Success Animation Overlay */}
                {showSuccessAnimation && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                      pointerEvents: 'none',
                      zIndex: 10,
                      animation: 'pulse 1s ease-out'
                    }}
                  />
                )}
                

                                {(() => {
                  const position = isReviewMode ? getBoardFenAtMove(moveNavIndex) : getBoardFenAtMove(currentMoveIndex);
                  return (
                    <Chessboard
                      key={boardKey}
                      position={position}
                      onSquareClick={handleSquareClick}
                      onPieceDrop={onDrop}
                      arePiecesDraggable={true}
                      customSquareStyles={customSquareStyles}
                      boardOrientation={getBoardOrientation()}
                    />
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Move Feedback */}
          {isCorrect !== null && (
            <div className={`p-3 rounded-lg flex items-center ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className={isCorrect ? 'text-green-800' : 'text-red-800'}>
                {isCorrect ? 'Correct move!' : 'Incorrect move. Try again.'}
              </span>
            </div>
          )}

          {/* Move Error Display */}
          {moveError && (
            <div className="p-3 rounded-lg flex items-center bg-orange-50 border border-orange-200">
              <XCircle className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-orange-800">
                {moveError}
              </span>
            </div>
          )}

          {/* User Moves */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h4 className="font-semibold text-gray-900 mb-2">Your Moves</h4>
            <div className="flex flex-wrap gap-2">
              {userMoves.map((move, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium"
                >
                  {move}
                </span>
              ))}
              {userMoves.length === 0 && (
                <span className="text-gray-500 text-sm">No moves yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Puzzle Info */}
        <div className="space-y-6">
          {/* Puzzle Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Today's Progress</h3>
              {/* Debug reset button - only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    localStorage.removeItem('puzzleAttempts');
                    localStorage.removeItem('unlockPromptDate');
                    setPuzzlesStartedToday(0);
                    alert('Puzzle attempts reset! Refresh the page to see changes.');
                  }}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  title="Reset puzzle attempts (dev only)"
                >
                  🔄 Reset
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  totalPuzzlesToday > 0 && puzzlesStartedToday >= totalPuzzlesToday 
                    ? 'text-red-500 font-semibold' 
                    : totalPuzzlesToday > 0 && puzzlesStartedToday >= totalPuzzlesToday - 1
                    ? 'text-orange-500 font-medium'
                    : 'text-gray-700'
                }`}>
                  {totalPuzzlesToday > 0 ? (
                    `${puzzlesStartedToday} of ${totalPuzzlesToday}`
                  ) : puzzleCollection && puzzleCollection.length > 1 ? (
                    `${currentPuzzleIndex + 1} of ${puzzleCollection.length}`
                  ) : '1 of 1'}
                </span>
              </div>
              
              {totalPuzzlesToday > 0 && (
                <div className="text-xs text-gray-500">
                  Puzzles started in the last 24 hours
                  {puzzlesStartedToday >= totalPuzzlesToday && (
                    <span className="text-red-500 font-medium ml-1">
                      • Daily limit reached
                    </span>
                  )}
                  {puzzlesStartedToday === totalPuzzlesToday - 1 && (
                    <span className="text-orange-500 font-medium ml-1">
                      • Last puzzle today
                    </span>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center gap-2">
                  <button
                    onClick={() => {
                      setShowUnlockPrompt(true);
                    }}
                    className="w-1/2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
                  >
                    Unlock More
                  </button>
                  <button
                    onClick={() => {
                      if (isUserSignedIn()) {
                        // Share functionality - you can implement this later
                        console.log('Share button clicked - user is signed in');
                      } else {
                        // Show unlock prompt for non-signed in users
                        setShowUnlockPrompt(true);
                      }
                    }}
                    className="w-1/4 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors text-sm"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Puzzle Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Theme</span>
                <p className="text-gray-900 font-semibold capitalize">{puzzle.theme.replace('_', ' ')}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Difficulty</span>
                <div className="flex items-center space-x-2 mt-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${
                        i < puzzle.difficulty ? 'bg-yellow-400' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600">({puzzle.difficulty}/5)</span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Evaluation</span>
                <p className="text-gray-900 font-semibold">
                  {puzzle.solution.evaluation > 0 ? '+' : ''}{puzzle.solution.evaluation.toFixed(1)}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Game Context</span>
                <p className="text-gray-900">Move {puzzle.gameContext.moveNumber} - {puzzle.gameContext.originalMove}</p>
                <p className="text-gray-600 text-sm">{puzzle.gameContext.player === 'w' ? 'White' : puzzle.gameContext.player === 'b' ? 'Black' : puzzle.gameContext.player} to move</p>
                {/*
                <button
                  className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm font-medium"
                  onClick={() => setShowPlayedModal(true)}
                >
                  How this was played
                </button>
                */}
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Explanation</h4>
            {puzzle.explanation && puzzle.explanation.description && (
              <p className="text-gray-700 leading-relaxed mb-2">{puzzle.explanation.description}</p>
            )}
            {puzzle.explanation && puzzle.explanation.clue && (
              <p className="text-gray-600 leading-relaxed mb-2"><strong>Clue:</strong> {puzzle.explanation.clue}</p>
            )}
            {puzzle.explanation && puzzle.explanation.detailedClue && (
              <p className="text-gray-500 leading-relaxed text-sm"><strong>More context:</strong> {puzzle.explanation.detailedClue}</p>
            )}
          </div>

          {/* Solution (Hidden by default) */}
          {showSolution && (
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
              <h4 className="font-semibold text-purple-900 mb-3">Solution</h4>
              <div className="space-y-2">
                {puzzle.solution.moves.map((move, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-purple-700">{index + 1}.</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">
                      {move}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Progress</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Moves completed</span>
                <span className="font-medium">{currentMoveIndex}/{puzzle.solution.moves.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentMoveIndex / puzzle.solution.moves.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Star Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-4">Puzzle Complete!</h3>
            <div className="flex justify-center mb-4">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} style={{ fontSize: '2rem', color: i < starRating ? '#facc15' : '#e5e7eb' }}>★</span>
              ))}
            </div>
            <p className="mb-4 text-gray-700">
              {starRating === 3 && 'Perfect!'}
              {starRating === 2 && 'Great job!'}
              {starRating === 1 && 'Good effort!'}
              {starRating === 0 && 'Try again for a better score!'}
            </p>
            <div className="flex flex-row justify-center gap-2 mt-4">
              <button
                onClick={() => { setShowRatingModal(false); setIsReviewMode(true); }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Review Solution
              </button>
              <button
                onClick={() => setShowMorePuzzles(true)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                See More Puzzles
              </button>
              <button
                onClick={loadNextPuzzle}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={isLoadingNextPuzzle}
              >
                {isLoadingNextPuzzle ? 'Loading...' : 'Play Next Puzzle'}
              </button>
            </div>
            {puzzlesStartedToday === 1 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  🎉 Great job! Sign up to unlock unlimited puzzles and track your progress.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for "How this was played" with animated demo */}
      {showPlayedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowPlayedModal(false)}
            >
              <span className="sr-only">Close</span>
              &times;
            </button>
            <h3 className="text-lg font-bold mb-2">How this was played</h3>
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <Chessboard
                  position={playedDemoFen || getFenBeforeOriginalMove()}
                  arePiecesDraggable={false}
                  boardWidth={320}
                  animationDuration={isAnimatingPlayedMove ? 400 : 200}
                  // Optionally, highlight the move
                  customArrows={puzzle && puzzle.gameContext && puzzle.gameContext.originalMove ? [
                    (() => {
                      const tempChess = new Chess(getFenBeforeOriginalMove());
                      const move = tempChess.move(puzzle.gameContext.originalMove);
                      if (!move) return null;
                      return [move.from, move.to, '#f59e42'];
                    })()
                  ].filter(Boolean) : []}
                />
              </div>
              <div className="flex gap-2 mb-2">
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={playOriginalMoveDemo}
                  disabled={isAnimatingPlayedMove}
                >
                  Replay Move
                </button>
                <button
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  onClick={() => setShowPlayedModal(false)}
                >
                  Close
                </button>
              </div>
              <div className="text-sm text-gray-600">
                <span>This is what was played in the real game:</span>
                <span className="ml-2 font-mono font-bold">{puzzle && puzzle.gameContext && puzzle.gameContext.originalMove}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wrong Move Modal */}
      {showWrongMoveModal && wrongMoveData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Wrong Move!</h3>
              {wrongMoveData.illegal ? (
                <p className="text-gray-600 mb-4">
                  <span className="font-mono font-bold text-red-600">{wrongMoveData.attemptedMove}</span> is not a legal move in this position.
                </p>
              ) : (
                <p className="text-gray-600 mb-4">
                  You played <span className="font-mono font-bold text-red-600">{wrongMoveData.attemptedMove}</span>, 
                  but the correct move was <span className="font-mono font-bold text-green-600">{wrongMoveData.correctMove}</span>
                </p>
              )}
              <p className="text-sm text-gray-500 mb-2">
                Move {wrongMoveData.moveNumber} of {puzzle?.solution?.moves?.length}
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleWrongMoveContinue}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue from Last Move
              </button>
              <button
                onClick={handleWrongMoveRetry}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for 'See More Puzzles' list */}
      {showMorePuzzles && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">Choose a Puzzle</h3>
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {/* Show remaining puzzles from collection (excluding current) */}
              {puzzleCollection && puzzleCollection.length > 0 ? (
                puzzleCollection
                  .map((p, index) => ({ ...p, originalIndex: index }))
                  .filter((p) => p.originalIndex !== currentPuzzleIndex)
                  .map((p, displayIndex) => (
                    <button
                      key={p.id || p.originalIndex}
                      onClick={() => handleSelectOtherPuzzle(p)}
                      className="w-full text-left p-3 border rounded hover:bg-blue-50 focus:outline-none"
                    >
                      <div className="font-semibold text-gray-900">
                        Puzzle #{p.id ? p.id.substring(0, 8) : p.originalIndex + 1}
                      </div>
                      <div className="text-sm text-gray-600">{p.theme}</div>
                      <div className="text-xs text-gray-400">
                        {p.gameData?.white} vs {p.gameData?.black} • {p.difficulty ? `${p.difficulty}/5` : ''}
                      </div>
                    </button>
                  ))
              ) : otherPuzzles.length > 0 ? (
                otherPuzzles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectOtherPuzzle(p)}
                    className="w-full text-left p-3 border rounded hover:bg-blue-50 focus:outline-none"
                  >
                    <div className="font-semibold text-gray-900">{p.theme}</div>
                    <div className="text-sm text-gray-600">{p.gameData?.white} vs {p.gameData?.black}</div>
                    <div className="text-xs text-gray-400">{p.difficulty ? `${p.difficulty}/5` : ''}</div>
                  </button>
                ))
              ) : (
                <div className="text-gray-500 text-center">No other puzzles available.</div>
              )}
            </div>
            <button
              onClick={() => setShowMorePuzzles(false)}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Unlock More Puzzles Modal */}
      {showUnlockPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock More Puzzles!</h3>
              <p className="text-gray-600 mb-4">
                You're on a roll! Sign up to unlock unlimited puzzles and track your progress.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowUnlockPrompt(false);
                  // Navigate to sign up page (you can adjust this route)
                  window.location.href = '/signup';
                }}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Sign Up for Free
              </button>
              
              <button
                onClick={() => {
                  setShowUnlockPrompt(false);
                  // Navigate to pricing page
                  window.location.href = '/pricing';
                }}
                className="w-full px-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                View Pricing
              </button>
              
              <button
                onClick={() => setShowUnlockPrompt(false)}
                className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Continue Playing
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-400">
              Free tier: 5 puzzles per day • Pro: Unlimited puzzles
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PuzzleSolver; 