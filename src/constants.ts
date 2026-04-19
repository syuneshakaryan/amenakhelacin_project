import { Player, Topic } from './types';

export const INITIAL_PLAYERS: Player[] = [
  { id: 1, name: 'Player 1', score: 0 },
  { id: 2, name: 'Player 2', score: 0 },
  { id: 3, name: 'Player 3', score: 0 },
  { id: 4, name: 'Player 4', score: 0 },
  { id: 5, name: 'Player 5', score: 0 },
  { id: 6, name: 'Player 6', score: 0 },
];

export const INITIAL_TOPICS: Topic[] = [
  { id: 1, name: 'History', isTaken: false, questions: ['Who was the first president of the US?', 'In which year did WWII end?', 'Who built the pyramids?', 'What was the French Revolution?', 'Who was Napoleon?'] },
  { id: 2, name: 'Science', isTaken: false, questions: ['What is the speed of light?', 'What is H2O?', 'Who discovered gravity?', 'What is the largest planet?', 'What is an atom?'] },
  { id: 3, name: 'Geography', isTaken: false, questions: ['What is the capital of France?', 'Where is the Nile?', 'What is the largest ocean?', 'Which continent is Brazil in?', 'What is the highest mountain?'] },
  { id: 4, name: 'Art', isTaken: false, questions: ['Who painted the Mona Lisa?', 'What is Surrealism?', 'Who sculpted David?', 'Where is the Louvre?', 'Who is Van Gogh?'] },
  { id: 5, name: 'Sports', isTaken: false, questions: ['How many players in a soccer team?', 'Who is often called GOAT in basketball?', 'Which country won the most World Cups?', 'What is a home run?', 'What is the Olympics?'] },
  { id: 6, name: 'Literature', isTaken: false, questions: ['Who wrote Hamlet?', 'What is Moby Dick?', 'Who wrote 1984?', 'What is a haiku?', 'Who created Sherlock Holmes?'] },
  { id: 7, name: 'Music', isTaken: false, questions: ['Who is the King of Pop?', 'What is a sonata?', 'Who composed the 5th Symphony?', 'How many keys on a standard piano?', 'What is Jazz?'] },
  { id: 8, name: 'Technology', isTaken: false, questions: ['What does AI stand for?', 'Who founded Apple?', 'What is a GPU?', 'What was the first browser?', 'What is Python?'] },
  { id: 9, name: 'Movies', isTaken: false, questions: ['Who directed Inception?', 'What is the Oscar?', 'Who played Jack in Titanic?', 'What is Pixar?', 'What is the highest-grossing film?'] },
  { id: 10, name: 'Food', isTaken: false, questions: ['What is sushi?', 'Where does Pizza come from?', 'What is the main ingredient of hummus?', 'What is a truffle?', 'What is gelato?'] },
  { id: 11, name: 'Politics', isTaken: false, questions: ['What is democracy?', 'Who is the UN Secretary-General?', 'What is a parliament?', 'What is the G7?', 'What is an election?'] },
  { id: 12, name: 'Culture', isTaken: false, questions: ['What is a custom?', 'What is folklore?', 'What is the Vatican?', 'What is a festival?', 'What is an idiom?'] },
];
