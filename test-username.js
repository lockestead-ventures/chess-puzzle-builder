const PuzzleGenerator = require('./server/services/puzzleGenerator');

async function testUsernameInDescriptions() {
  const generator = new PuzzleGenerator();
  
  // Mock game data with usernames
  const mockGameData = {
    white: 'MagnusCarlsen',
    black: 'HikaruNakamura',
    result: '1-0',
    type: 'rapid',
    platform: 'chess.com',
    pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7'
  };
  
  try {
    console.log('🧪 Testing username integration in puzzle descriptions...');
    console.log('📊 Game data:', mockGameData.white, 'vs', mockGameData.black);
    
    const result = await generator.generatePuzzlesFromGameData(mockGameData);
    
    console.log(`\n✅ Generated ${result.puzzles.length} puzzles`);
    
    // Check if usernames appear in descriptions
    result.puzzles.forEach((puzzle, index) => {
      console.log(`\n🧩 Puzzle ${index + 1}:`);
      console.log(`   Description: ${puzzle.explanation.description}`);
      console.log(`   Clue: ${puzzle.explanation.clue}`);
      console.log(`   Game data:`, puzzle.gameData);
      
      // Check if usernames are in the description
      const hasUsernames = puzzle.explanation.description.includes(mockGameData.white) || 
                          puzzle.explanation.description.includes(mockGameData.black);
      
      console.log(`   ✅ Usernames in description: ${hasUsernames ? 'YES' : 'NO'}`);
    });
    
    generator.cleanup();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    generator.cleanup();
  }
}

testUsernameInDescriptions(); 