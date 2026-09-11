import type { ResourceId, BuildingId, TechId } from '../engine'
const paths = {
 food: 'M12 22V3 M12 9C4 9 4 3 4 3c8 0 8 6 8 6 M12 15c8 0 8-6 8-6-8 0-8 6-8 6',
 production: 'm4 21 10-10 M11 4l4-2 7 7-4 4z',
 gold: 'M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0 M14 8h-4v4h4v4h-4 M12 6v12',
 science: 'M9 3h6 M10 3v7L4 20h16l-6-10V3 M7 15h10',
 granary: 'M3 10l9-7 9 7 M5 9v12h14V9 M9 21v-8h6v8',
 workshop: 'M3 8h18l-5 5H9L3 8 M10 13v5l-3 3h12l-4-3v-5',
 market: 'M3 9h18l-2-6H5z M5 9v12h14V9 M9 21v-7h6v7',
 library: 'M12 5v16 M12 5Q7 2 3 4v15q5-2 9 2 4-4 9-2V4q-4-2-9 1',
 agriculture: 'M12 22V10 M12 14Q2 14 3 5q9 0 9 9 M12 10Q12 2 21 3q0 7-9 7',
 pottery: 'M8 3h8 M9 3v5C0 16 6 22 12 21c6 1 12-5 3-13V3',
 crafting: 'm4 20 12-12 M14 3v5h5 M3 3l18 18',
 currency: 'M17 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0 M18 10a6 6 0 1 1-8 9',
 writing: 'M4 21 20 3Q8 1 6 15 M4 21h16',
 astronomy: 'm3 9 15-6 3 6-15 6z M12 13v4m0 0-5 5m5-5 5 5',
 lock: 'M6 10h12v11H6z M8 10V6a4 4 0 0 1 8 0v4',
 check: 'm4 12 5 5L20 6',
 warning: 'M12 3 2 21h20z M12 9v5 M12 17v1',
 turn: 'M5 3h14 M5 21h14 M7 3c0 9 10 9 10 18 M17 3c0 9-10 9-10 18',
 forward: 'M3 12h17m-7-7 7 7-7 7',
 population: 'M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M2 21v-4a6 6 0 0 1 12 0v4 M16 4a3 3 0 0 1 0 6 M17 12a5 5 0 0 1 5 5v4',
 victory: 'm12 2 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z',
} satisfies Record<ResourceId | BuildingId | TechId | 'lock' | 'check' | 'warning' | 'turn' | 'forward' | 'population' | 'victory', string>
export type IconName = keyof typeof paths
export function GameIcon({name}: {name: IconName}) {
 return <svg className={`game-icon icon-${name}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>
}
export function ProgressMeter({label,value,max,rate,turns}: {label:string;value:number;max:number;rate:number;turns?:number}) {
 return <div className="progress-meter"><label>{label} <strong>{value} / {max}</strong><progress aria-label={label} value={value} max={max}/></label><small>{rate > 0 ? `${turns ?? Math.ceil((max-value)/rate)} turns at current output` : 'No progress at current output'}</small></div>
}

