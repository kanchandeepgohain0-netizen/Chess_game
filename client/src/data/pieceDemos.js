export const pieceDemos = {
  pawn: [
    { fen: "k7/8/8/8/8/8/4P3/K7 w - - 0 1", from: "e2", to: "e4", highlights: ['e3', 'e4'], text: "A pawn moves forward 2 squares on its first move." },
    { fen: "k7/8/8/8/4P3/8/8/K7 w - - 0 1", from: "e4", to: "e5", highlights: ['e5'], text: "Then it moves 1 square at a time." },
    { fen: "k7/8/8/3p4/4P3/8/8/K7 w - - 0 1", from: "e4", to: "d5", highlights: ['d5'], text: "It captures diagonally, not straight ahead.", capture: true },
    { fen: "k7/8/8/3P4/8/8/8/K7 w - - 0 1", highlights: [], text: "That's how the Pawn works!" }
  ],
  knight: [
    { fen: "k7/8/8/8/8/8/8/KN6 w - - 0 1", from: "b1", to: "c3", highlights: ['c3', 'a3', 'd2'], text: "The knight moves in an L-shape." },
    { fen: "k7/8/8/8/8/2N5/8/K7 w - - 0 1", from: "c3", to: "e4", highlights: ['e4', 'd5', 'b5', 'a4', 'a2', 'b1', 'd1', 'e2'], text: "2 squares one way, 1 square the other." },
    { fen: "k7/8/8/8/4N3/8/8/K7 w - - 0 1", from: "e4", to: "f6", highlights: ['f6'], text: "It can jump over any piece in its way.", jump: true },
    { fen: "k7/8/5N2/8/8/8/8/K7 w - - 0 1", highlights: [], text: "That's how the Knight works!" }
  ],
  bishop: [
    { fen: "k7/8/8/8/8/8/8/K1B5 w - - 0 1", from: "c1", to: "f4", highlights: ['d2', 'e3', 'f4', 'g5', 'h6', 'b2', 'a3'], text: "The bishop moves diagonally any number of squares." },
    { fen: "k7/8/8/8/5B2/8/8/K7 w - - 0 1", from: "f4", to: "c7", highlights: ['e5', 'd6', 'c7', 'b8', 'g3', 'h2', 'e3', 'd2', 'c1', 'g5', 'h6'], text: "It stays on the same color squares for the whole game." },
    { fen: "k7/8/2B5/8/8/8/8/K7 w - - 0 1", highlights: [], text: "That's how the Bishop works!" }
  ],
  rook: [
    { fen: "k7/8/8/8/8/8/8/KR6 w - - 0 1", from: "b1", to: "b6", highlights: ['b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'], text: "The rook moves in straight lines vertically." },
    { fen: "kR6/8/8/8/8/8/8/K7 w - - 0 1", from: "b8", to: "h8", highlights: ['c8', 'd8', 'e8', 'f8', 'g8', 'h8'], text: "Or horizontally across the board." },
    { fen: "k6R/8/8/8/8/8/8/K7 w - - 0 1", highlights: [], text: "That's how the Rook works!" }
  ],
  queen: [
    { fen: "k7/8/8/8/8/8/8/K2Q4 w - - 0 1", from: "d1", to: "d4", highlights: ['d2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'], text: "The queen is the most powerful piece. It moves straight..." },
    { fen: "k7/8/8/8/3Q4/8/8/K7 w - - 0 1", from: "d4", to: "h8", highlights: ['e5', 'f6', 'g7', 'h8', 'c5', 'b6', 'a7', 'e3', 'f2', 'g1', 'c3', 'b2', 'a1'], text: "...or diagonally!" },
    { fen: "k6Q/8/8/8/8/8/8/K7 w - - 0 1", from: "h8", to: "b2", highlights: ['g7', 'f6', 'e5', 'd4', 'c3', 'b2', 'a1'], text: "Any number of squares in any direction." },
    { fen: "k7/8/8/8/8/8/1Q6/K7 w - - 0 1", highlights: [], text: "That's how the Queen works!" }
  ],
  king: [
    { fen: "k7/8/8/8/8/8/8/4K3 w - - 0 1", from: "e1", to: "e2", highlights: ['d1', 'f1', 'd2', 'e2', 'f2'], text: "The king is the most important piece. It only moves 1 square at a time." },
    { fen: "k7/8/8/8/8/8/4K3/8 w - - 0 1", from: "e2", to: "f3", highlights: ['d1', 'e1', 'f1', 'd2', 'f2', 'd3', 'e3', 'f3'], text: "In any direction: forward, backward, or diagonally." },
    { fen: "k7/8/8/8/8/5K2/8/8 w - - 0 1", highlights: [], text: "Keep your King safe!" }
  ]
};
