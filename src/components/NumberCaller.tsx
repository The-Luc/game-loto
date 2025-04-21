// 'use client';

// import { Badge } from './ui/badge';
// import { useGameStore } from '@/stores/useGameStore';
// import { RoomStatus } from '@prisma/client';
// import { useCurPlayer } from '../hooks/useCurPlayer';

// export function NumberCaller() {
//   const { room, calledNumbers } = useGameStore();
//   const player = useCurPlayer();
//   const isPlaying = room?.status === RoomStatus.playing;
//   const isEnded = room?.status === RoomStatus.ended;

//   // Hide component if not playing or no room/player
//   if (!room || !player || (!isPlaying && !isEnded)) return null;

//   return (
//     <div className="w-full px-1 py-1">
//       <div className="flex flex-row gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-muted-foreground/30">
//         {calledNumbers.map((num, i) => (
//           <Badge
//             key={num + '-' + i}
//             variant={i === calledNumbers.length - 1 ? 'default' : 'outline'}
//             className={
//               'text-base px-2 py-1 min-w-[32px] justify-center' +
//               (i === calledNumbers.length - 1 ? ' bg-primary text-white font-bold' : '')
//             }
//           >
//             {num}
//           </Badge>
//         ))}
//       </div>
//     </div>
//                     {formattedInterval}
//                   </span>
//                 </div>
//                 <Slider
//                   id="interval-slider"
//                   min={3}
//                   max={15}
//                   step={0.5}
//                   value={[autoCallInterval]}
//                   onValueChange={(values) => setAutoCallInterval(values[0])}
//                   disabled={!isHost || isLoading}
//                 />
//                 <div className="flex justify-between text-xs text-muted-foreground">
//                   <span>3s</span>
//                   <span>15s</span>
//                 </div>
//               </div>
//             </div>

//             {/* Manual Call Button */}
//             <Button
//               onClick={handleCallNext}
//               disabled={isLoading || isAutoCallingActive}
//               className="w-full h-12 sm:h-10 text-sm sm:text-base"
//               aria-label="Call next number"
//             >
//               Gọi tiếp
//             </Button>
//           </div>
//         )}

//         {/* Game End Controls */}
//         {isHost && isEnded && (
//           <div className="mt-6">
//             <Button
//               onClick={handleStartOver}
//               disabled={isLoading}
//               className="w-full h-12 sm:h-10 text-sm sm:text-base"
//               aria-label="Start a new game"
//             >
//               Làm lại từ đầu
//             </Button>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
