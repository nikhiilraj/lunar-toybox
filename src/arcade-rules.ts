export type Direction='up'|'down'|'left'|'right';
export interface Cell{x:number;y:number}
export interface SnakeState{body:Cell[];direction:Direction;turned:boolean;food:Cell|null;score:number;status:'playing'|'over'|'won'}
export const SNAKE_SIZE=16;
const vectors:Record<Direction,Cell>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
const same=(a:Cell,b:Cell)=>a.x===b.x&&a.y===b.y;
export function newSnake():SnakeState{return{body:[{x:5,y:8},{x:4,y:8},{x:3,y:8}],direction:'right',turned:false,food:{x:10,y:8},score:0,status:'playing'};}
export function turnSnake(state:SnakeState,direction:Direction):SnakeState{const a=vectors[state.direction],b=vectors[direction];return state.turned||state.status!=='playing'||a.x+b.x===0&&a.y+b.y===0?state:{...state,direction,turned:true};}
export function stepSnake(state:SnakeState,random:()=>number=Math.random):SnakeState{if(state.status!=='playing')return state;const v=vectors[state.direction],head={x:state.body[0].x+v.x,y:state.body[0].y+v.y};const eating=!!state.food&&same(head,state.food);const collision=state.body.slice(0,eating?undefined:-1).some(p=>same(p,head));if(head.x<0||head.y<0||head.x>=SNAKE_SIZE||head.y>=SNAKE_SIZE||collision)return{...state,status:'over'};const body=[head,...state.body];if(!eating)body.pop();let food=state.food;if(eating){const empty:Cell[]=[];for(let y=0;y<SNAKE_SIZE;y++)for(let x=0;x<SNAKE_SIZE;x++)if(!body.some(p=>same(p,{x,y})))empty.push({x,y});food=empty[Math.min(empty.length-1,Math.floor(Math.max(0,random())*empty.length))]??null;}return{...state,body,food,score:state.score+Number(eating),turned:false,status:food?'playing':'won'};}
export const transitions:Readonly<Record<number,number>>={1:38,4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:100,16:6,47:26,49:11,56:53,62:19,64:60,87:24,93:73,95:75,98:78};
export function rollDie(random:()=>number=Math.random){return Math.min(6,Math.max(1,Math.floor(random()*6)+1));}
export function moveToken(position:number,roll:number){if(!Number.isInteger(roll)||roll<1||roll>6)throw Error('A die roll must be 1–6');const landed=position+roll>100?position:position+roll;const next=transitions[landed]??landed;return{landed,position:next,transition:next>landed?'ladder':next<landed?'snake':null,won:next===100};}
export function boardCell(square:number){const band=Math.floor((square-1)/10),column=(square-1)%10;return{row:9-band,col:band%2?9-column:column};}
