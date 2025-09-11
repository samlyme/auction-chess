#include <stdio.h>

// Define bitboard datatype
#define U64 unsigned long long

// board squares
// C black magic. The enum actually encodes each value to an int value.
// This can then be passed into the bit manipulation macros.
enum Square {
    a8, b8, c8, d8, e8, f8, g8, h8,
    a7, b7, c7, d7, e7, f7, g7, h7,
    a6, b6, c6, d6, e6, f6, g6, h6,
    a5, b5, c5, d5, e5, f5, g5, h5,
    a4, b4, c4, d4, e4, f4, g4, h4,
    a3, b3, c3, d3, e3, f3, g3, h3,
    a2, b2, c2, d2, e2, f2, g2, h2,
    a1, b1, c1, d1, e1, f1, g1, h1,
};

// sides to move (colors), white = 0, black = 1
enum Side { white, black };

// set/get/pop bitboard macros
// Explaination:
// shifts the "1ULL" to the position of the square.
// this then acts as a mask for the bitboard.
// typically, you can implicit cast this to a boolean.
#define get_bit(bitboard, square) (bitboard &  (1ULL << square))
#define set_bit(bitboard, square) (bitboard |= (1ULL << square))
#define pop_bit(bitboard, square) (get_bit(bitboard, square) ? bitboard ^= (1ULL << square) : 0)

// print bitboard
void print_bitboard(U64 bitboard) {
    // loop oover board ranks, files
    for (int rank = 0; rank < 8; rank++) {
        for (int file = 0; file < 8; file++) {
            // rank, file into square index
            int square = rank * 8 + file;
            
            if (file == 0) {
                printf(" %d ", 8 - rank);
            }
            printf(" %d", get_bit(bitboard, square) ? 1 : 0);
        }
        printf("\n");
    }

    printf("\n    a b c d e f g h \n\n");

    // print bitboard as unsigned decimal number
    printf("    Bitboard: %llud", bitboard);
}



/*  not A file
    8  0 1 1 1 1 1 1 1
    7  0 1 1 1 1 1 1 1
    6  0 1 1 1 1 1 1 1
    5  0 1 1 1 1 1 1 1
    4  0 1 1 1 1 1 1 1
    3  0 1 1 1 1 1 1 1
    2  0 1 1 1 1 1 1 1
    1  0 1 1 1 1 1 1 1

       a b c d e f g h 
*/
/*  not B file
    8  1 1 1 1 1 1 1 0
    7  1 1 1 1 1 1 1 0
    6  1 1 1 1 1 1 1 0
    5  1 1 1 1 1 1 1 0
    4  1 1 1 1 1 1 1 0
    3  1 1 1 1 1 1 1 0
    2  1 1 1 1 1 1 1 0
    1  1 1 1 1 1 1 1 0

       a b c d e f g h 
*/
const U64 not_a_file = 18374403900871474942ULL;
const U64 not_h_file = 9187201950435737471ULL;
const U64 not_ab_file = 18229723555195321596ULL;
const U64 not_gh_file = 4557430888798830399ULL;

// Attack tables
// p attack table [side][square]
U64 pawn_attacks[2][64];

U64 mask_pawn_attacks(enum Square square, enum Side side) {
    // result attacks bitboard
    U64 attacks = 0ULL;

    // piece bitboard
    U64 bitboard = 0ULL;

    // set piece on board
    set_bit(bitboard, square);

    // white pawns
    if (side == white) {
        // forward left attack
        if ((bitboard >> 7) & not_a_file) attacks |= (bitboard >> 7);
        // forward right attack
        if ((bitboard >> 9) & not_h_file) attacks |= (bitboard >> 9);
    }
    else {
        // forward right attack
        if ((bitboard << 7) & not_h_file) attacks |= (bitboard << 7);
        // forward left attack
        if ((bitboard << 9) & not_a_file) attacks |= (bitboard << 9);
    }

    return attacks;
}

int main() {
    print_bitboard(mask_pawn_attacks(b4, white));

    return 0;
}