import React from 'react';
import { GameState, Player, GameView } from '../types';
import { ROUND_3_TOPICS } from '../constants';
import { 
  Puzzle, 
  Trophy, 
  Grid3X3, 
  MessageSquare, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight,
  User
} from 'lucide-react';

interface ModeratorPanelProps {
  state: GameState;
  onUpdateState: (newState: Partial<GameState>) => void;
  players: Player[];
  onPlayerRankChange: (rankIndex: number, playerId: number) => void;
}

export const ModeratorPanel: React.FC<ModeratorPanelProps> = ({ 
  state, 
  onUpdateState, 
  players,
  onPlayerRankChange
}) => {
  const views: { id: GameView; icon: any; label: string }[] = [
    { id: 'puzzle', icon: Puzzle, label: 'Գաղտնազերծման փուլ' },
    { id: 'ranking', icon: Trophy, label: 'Դասակարգման փուլ' },
    { id: 'topics', icon: Grid3X3, label: 'Թեմայի ընտրություն' },
    { id: 'question', icon: MessageSquare, label: 'Բլից հարցեր' },
    { id: 'round3', icon: Grid3X3, label: '3-րդ փուլ' },
    { id: 'finalRank', icon: Trophy, label: 'Վերջնական արդյունքներ' },
  ];

  const handleNameChange = (id: number, newName: string) => {
    const updatedPlayers = players.map(p => p.id === id ? { ...p, name: newName } : p);
    onUpdateState({ players: updatedPlayers });
  };

  return (
    <div className="relative h-auto bg-slate-900 border-t border-slate-700 p-4 flex items-center justify-between shadow-2xl">
      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => onUpdateState({ view: view.id })}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md font-bold uppercase text-xs tracking-widest transition-all
              ${state.view === view.id 
                ? 'bg-game-blue text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }
            `}
          >
            <view.icon size={16} />
            <span>{view.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-8">
        {/* Dynamic Controls based on view */}
        {state.view === 'puzzle' && (
          <div className="flex flex-col gap-2 bg-slate-800 p-2 rounded-lg">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-500 ml-2">Խմբագրել անունները:</span>
                <div className="flex gap-1 overflow-x-auto">
                  {players.map(p => (
                    <input 
                      key={p.id}
                      type="text"
                      value={p.name}
                      placeholder={`Խաղացող ${p.id}`}
                      onChange={(e) => handleNameChange(p.id, e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-[10px] text-white px-1 py-0.5 rounded focus:border-game-blue w-20"
                    />
                  ))}
                </div>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-500 ml-2">Հուշող արտահայտություն:</span>
                <input 
                  type="text"
                  placeholder="Մուտքագրեք հուշող արտահայտությունը..."
                  value={state.puzzleHint || ''}
                  onChange={(e) => onUpdateState({ puzzleHint: e.target.value })}
                  className="bg-slate-950 border border-slate-700 text-game-gold px-2 py-1 text-[10px] rounded focus:border-game-blue w-64"
                />
             </div>
             <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase text-slate-500 ml-2">Գաղտնազերծման թվեր:</span>
                <div className="flex gap-1">
                   {state.puzzleValues.map((val, idx) => (
                     <input 
                       key={idx}
                       type="text"
                       maxLength={1}
                       value={val}
                       onChange={(e) => {
                         const newVals = [...state.puzzleValues];
                         newVals[idx] = e.target.value.toUpperCase();
                         onUpdateState({ puzzleValues: newVals });
                       }}
                       className="w-8 h-8 bg-slate-950 border border-slate-700 text-center text-game-gold font-bold text-sm rounded focus:border-game-blue"
                     />
                   ))}
                </div>
             </div>
          </div>
        )}

        {state.view === 'ranking' && (
          <div className="flex flex-col gap-2 bg-slate-800 p-2 rounded-lg min-w-[500px]">
             <div className="flex items-center gap-2 px-2 overflow-x-auto">
                <span className="text-[9px] font-black uppercase text-slate-500 whitespace-nowrap">Խմբագրել անունները:</span>
                {players.map(p => (
                  <input 
                    key={p.id}
                    type="text"
                    value={p.name}
                    placeholder={`Խաղացող ${p.id}`}
                    onChange={(e) => handleNameChange(p.id, e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-[10px] text-white px-1 py-0.5 rounded focus:border-game-blue w-20"
                  />
                ))}
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase text-slate-500 ml-2 whitespace-nowrap">Սահմանել տեղերը:</span>
                <div className="flex gap-1">
                   {[0, 1, 2, 3, 4, 5].map(rankIdx => (
                     <select 
                       key={rankIdx}
                       value={state.ranking[rankIdx] || ''}
                       onChange={(e) => onPlayerRankChange(rankIdx, parseInt(e.target.value))}
                       className="bg-slate-950 text-slate-200 text-[10px] p-1 border border-slate-700 rounded focus:border-game-gold outline-none w-20"
                     >
                       <option value="">{rankIdx + 1}-րդ տեղ</option>
                       {players
                         .filter(p => !state.ranking.includes(p.id) || p.id === state.ranking[rankIdx])
                         .map(p => (
                           <option key={p.id} value={p.id}>{p.name || `Խաղացող ${p.id}`}</option>
                         ))
                       }
                     </select>
                   ))}
                </div>
             </div>
             {state.ranking.every(r => r !== null) && (
                <div className="mt-2 flex justify-end">
                   <button 
                     onClick={() => onUpdateState({ 
                       view: 'topics', 
                       activePlayerId: state.ranking[0],
                       activeTopicId: null,
                       isRoundOver: false
                     })}
                     className="bg-game-gold text-black text-[10px] font-black px-4 py-1 rounded uppercase hover:bg-yellow-400 transition-colors"
                   >
                     Սկսել 2-րդ փուլը
                   </button>
                </div>
             )}
          </div>
        )}

        {state.view === 'topics' && (
          <div className="flex items-center gap-4">
             <span className="text-xs font-bold uppercase text-slate-500">Ընթացիկ խաղացող:</span>
             <div className="flex gap-2">
                {players.map(p => (
                  <button
                    key={p.id}
                    onClick={() => onUpdateState({ activePlayerId: p.id })}
                    className={`px-3 py-1 rounded text-[10px] font-bold border transition-all ${state.activePlayerId === p.id ? 'bg-game-gold text-black border-game-gold' : 'border-slate-700 text-slate-400'}`}
                  >
                    {p.name}
                  </button>
                ))}
             </div>
          </div>
        )}

        {state.view === 'question' && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onUpdateState({ isTimerRunning: !state.isTimerRunning })}
                className={`p-2 rounded-full shadow-lg transition-all ${state.isTimerRunning ? 'bg-red-900/50 text-red-500 hover:bg-red-900 border border-red-800/50' : 'bg-green-900/50 text-green-500 hover:bg-green-900 border border-green-800/50'}`}
              >
                {state.isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button 
                onClick={() => onUpdateState({ timeLeft: 60, isTimerRunning: false, currentQuestionIndex: 0 })}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              >
                <RotateCcw size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-1 px-4 border-l border-slate-800">
               <span className="text-[9px] font-black uppercase text-slate-500">Ճշգրտում:</span>
               <div className="flex gap-1 h-8">
                  <button onClick={() => {
                    const p = players.find(player => player.id === state.activePlayerId);
                    if (p) {
                      const updatedPlayers = players.map(pl => pl.id === p.id ? { ...pl, score: Math.max(0, pl.score - 1) } : pl);
                      onUpdateState({ players: updatedPlayers });
                    }
                  }} className="px-3 bg-red-950 text-red-500 border border-red-900 rounded-l font-black hover:bg-red-900 transition-colors"> -1 </button>
                  <button onClick={() => {
                    const p = players.find(player => player.id === state.activePlayerId);
                    if (p) {
                      const updatedPlayers = players.map(pl => pl.id === p.id ? { ...pl, score: pl.score + 1 } : pl);
                      onUpdateState({ players: updatedPlayers });
                    }
                  }} className="px-3 bg-green-950 text-green-500 border border-green-900 rounded-r font-black hover:bg-green-900 transition-colors"> +1 </button>
               </div>
            </div>
          </div>
        )}

        {state.view === 'round3' && (
          <div className="flex flex-col gap-2 bg-slate-800 p-2 rounded-lg">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (state.round3) {
                    onUpdateState({ round3: { ...state.round3, phase: 'intro' } });
                  }
                }}
                className="px-3 py-1 bg-red-900 border border-red-700 text-white text-[10px] font-bold rounded uppercase hover:bg-red-800"
              >
                Reset Round 3
              </button>
              <div className="flex gap-2">
                 {['intro', 'memorize', 'grid', 'question'].map(phase => (
                   <button
                     key={phase}
                     onClick={() => {
                       if (state.round3) {
                         onUpdateState({ round3: { ...state.round3, phase: phase as any } });
                       }
                     }}
                     className={`px-2 py-1 rounded text-[9px] font-bold border ${state.round3?.phase === phase ? 'bg-game-gold text-black border-game-gold' : 'border-slate-700 text-slate-400'}`}
                   >
                     {phase.toUpperCase()}
                   </button>
                 ))}
              </div>
            </div>

            {/* Topic Assignment */}
            <div className="flex items-center gap-3 bg-slate-900/40 p-1.5 rounded border border-slate-700/50">
               <span className="text-[9px] font-bold uppercase text-slate-500 whitespace-nowrap border-r border-slate-700 pr-3">Թեմաներ:</span>
               <div className="flex items-center gap-4">
                 {(['red', 'yellow', 'blue'] as const).map((color, idx) => {
                   const playerId = state.round3?.top3PlayerIds[idx];
                   const player = players.find(p => p.id === playerId);
                   const topicId = state.round3?.playerTopics?.[color];
                   
                   // Filter topics to exclude those selected by others
                   const otherSelectedTopicIds = [
                     color !== 'red' ? state.round3?.playerTopics?.red : null,
                     color !== 'yellow' ? state.round3?.playerTopics?.yellow : null,
                     color !== 'blue' ? state.round3?.playerTopics?.blue : null
                   ].filter(Boolean);

                   return (
                     <div key={color} className="flex items-center gap-1.5 border-r border-slate-800 last:border-0 pr-4 last:pr-0">
                       <div className={`w-2 h-2 rounded-full shrink-0 ${
                         color === 'red' ? 'bg-red-500' : 
                         color === 'yellow' ? 'bg-yellow-500' : 
                         'bg-blue-500'
                       }`} />
                       <span className="text-[9px] font-bold text-slate-400 w-14 truncate">{player?.name || '---'}</span>
                       <select 
                         value={topicId || ''}
                         onChange={(e) => {
                           const newTopicId = parseInt(e.target.value);
                           const selectedTopic = ROUND_3_TOPICS.find(t => t.id === newTopicId);
                           if (!selectedTopic) return;

                           const newPlayerTopics = { 
                             ...state.round3?.playerTopics,
                             [color]: newTopicId 
                           };

                           // Regenerate cells questions when topic changes
                           const newCells = [...(state.round3?.cells || [])];
                           let qIdx = 0;
                           newCells.forEach((cell, i) => {
                             if (cell.color === color) {
                               newCells[i] = { 
                                 ...cell, 
                                 question: selectedTopic.questions[qIdx++] || "---" 
                               };
                             }
                           });

                           onUpdateState({ 
                             round3: { 
                               ...state.round3!, 
                               playerTopics: newPlayerTopics as any,
                               cells: newCells
                             } 
                           });
                         }}
                         className="bg-slate-950 text-slate-200 text-[10px] py-0.5 px-1 border border-slate-700 rounded focus:border-game-gold outline-none w-24 cursor-pointer"
                       >
                         <option value="">Ընտրել...</option>
                         {ROUND_3_TOPICS.map(t => {
                           const isUsedElsewhere = otherSelectedTopicIds.includes(t.id);
                           return (
                             <option key={t.id} value={t.id} disabled={isUsedElsewhere}>
                               {t.name} {isUsedElsewhere ? '(Զբաղված)' : ''}
                             </option>
                           );
                         })}
                       </select>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        )}

        {state.view === 'finalRank' && (
          <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-lg">
              <button 
                onClick={() => {
                  // Identify top 3
                  const top3 = [...players]
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3);
                  
                  const top3Ids = top3.map(p => p.id);
                  
                  // Reset their scores
                  const updatedPlayers = players.map(p => 
                    top3Ids.includes(p.id) ? { ...p, score: 0 } : p
                  );

                  onUpdateState({ 
                    players: updatedPlayers,
                    view: 'round3',
                    round3: {
                      ...state.round3!,
                      top3PlayerIds: top3Ids,
                      phase: 'intro',
                      currentPlayerIndex: 0
                    }
                  });
                }}
                className="bg-game-gold text-black text-[10px] font-black px-4 py-1 rounded uppercase hover:bg-yellow-400 transition-colors"
                title="Սկսել 3-րդ փուլը (Միավորները կզրոյացվեն)"
              >
                Սկսել 3-րդ փուլը
              </button>
          </div>
        )}

        {/* Global Reset */}
        <button 
          onClick={() => window.location.reload()}
          className="p-2 text-slate-600 hover:text-red-500 transition-colors"
          title="Վերագործարկել ամեն ինչ"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};
