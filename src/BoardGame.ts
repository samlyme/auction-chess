import { Client } from 'boardgame.io/react';
import { PseudoChessBoard, PseudoChessGame } from './Game';

const BoardGame = Client({ game: PseudoChessGame, board: PseudoChessBoard });

export default BoardGame;