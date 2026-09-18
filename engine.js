/* ============================================================
   Split Loyalty - shared engine (rules, missions, abilities, UI core)
   Loaded by both index.html (local hotseat) and split-loyalty-online.html
   ============================================================ */

const ROWS = 4, COLS = 5, CELLS = ROWS*COLS;
const COLORS = ['rojo','azul','amarillo','verde','morado','naranja'];
const BLACK = 'negro';
const ALL_COLORS = [...COLORS, BLACK];
const COLOR_LABEL = {
  es: {rojo:'Rosado',azul:'Azul',amarillo:'Amarillo',verde:'Verde claro',morado:'Morado',naranja:'Naranja',negro:'Negro'},
  en: {rojo:'Pink',azul:'Blue',amarillo:'Yellow',verde:'Light green',morado:'Purple',naranja:'Orange',negro:'Black'},
};
let LANG = 'es';
function CL(color){ return COLOR_LABEL[LANG][color]; }

const STR = {
  es: {
    subtitleLocal: 'Red de espías con lealtades divididas — modo local, mismo dispositivo',
    subtitleOnline: 'Red de espías con lealtades divididas — operación en línea',
    modeLocalBtn: '🖥️ Jugar en este dispositivo (hotseat)',
    modeOnlineBtn: '🌐 Crear sala en línea (comparto un link)',
    joinCodePlaceholder: 'CÓDIGO DE SALA',
    joinBtn: 'Unirme',
    configWarning: '⚠️ Falta configurar Firebase: edita firebaseConfig en el HTML con los datos de tu propio proyecto antes de poder crear o unirte a una sala. "Jugar en este dispositivo" funciona sin ningún cambio.',
    lobbyTitle: 'Nueva Operación',
    lobbyPlayerCountLabel: '¿Cuántas agencias van a jugar?',
    startBtn: 'Iniciar Operación',
    goOnlineText: '¿Quieres jugar en línea con otros?',
    testModeLabel: '🧪 Modo de prueba: empezar con habilidades ya desbloqueadas',
    testModeDesc: 'Se le dan a TODAS las agencias, con suministro infinito (no se gastan al usarlas) y sin límite de 1 por turno, para que puedas probar cada una las veces que quieras.',
    testAllBtn: 'Todas', testNoneBtn: 'Ninguna',
    mapModeLabel: '¿Qué tipo de dossier quieres usar?',
    mapModeSimpleLabel: 'Simple — solo las 2 casillas de dado negro',
    mapModeSpecialLabel: 'Mapas especiales — + casilla de rango, de nación, y un corte interior (con draft inverso al inicio)',
    missionsActiveLabel: 'Misiones activas',
    abilitiesOfLabel: 'Habilidades de Agencia',
    marketLabel: 'Mercado de espías',
    footerText: 'Prototipo de Split Loyalty — hecho para probar la red de espías, no el diseño final.',
    resetLink: 'Reiniciar operación',
    rulesSummary: '❓ Ayuda de reglas',
    agency: 'Agencia',
    rulesBodyHtml: `
      <p style="font-weight:700; margin:10px 0 4px; color:#f2e4c0;">Cómo se forma cada red (ejemplos)</p>
      <div style="display:flex; gap:18px; flex-wrap:wrap; margin-bottom:10px;">
        <div style="background:var(--panel); color:var(--ink); border-radius:8px; padding:8px 10px; max-width:220px;">
          <div id="exampleHN"></div>
          <b>Home Network</b><br>misma nación, rangos distintos, adyacentes. Puntúa desde 3 agentes (suma de rangos).
        </div>
        <div style="background:var(--panel); color:var(--ink); border-radius:8px; padding:8px 10px; max-width:220px;">
          <div id="exampleSC"></div>
          <b>Sleeper Cell</b><br>mismo rango, naciones distintas, adyacentes. Puntúa si tamaño ≥ rango (rango×tamaño, máx. 7 con el negro).
        </div>
        <div style="background:var(--panel); color:var(--ink); border-radius:8px; padding:8px 10px; max-width:220px;">
          <div id="exampleChain"></div>
          <b>Chain of Custody</b><br>1→2→3→4... en ese orden exacto, cada eslabón adyacente al anterior, naciones distintas. Mínimo 4. Pueden existir varias cadenas a la vez, pero un agente no puede estar en dos.
        </div>
      </div>
      <p style="font-weight:700; margin:10px 0 4px; color:#f2e4c0;">Cómo es un turno</p>
      <p style="margin:0 0 10px;">En tu turno, elige UNA de estas dos acciones:</p>
      <ul style="margin-top:0;">
        <li><b>A) Reclutar 1 o 2 agentes</b> del mercado. Si reclutas 2, deben diferir en nación Y rango. En el primerísimo turno de la partida solo se puede reclutar 1.</li>
        <li><b>B) Quemar la Red</b> — devuelves el mercado a la reserva, revelas agentes nuevos, te quedas con 1, el resto queda expuesto para los demás.</li>
      </ul>
      <p style="margin:0 0 4px;">Después de reclutar, archivas cada agente en una casilla vacía y legal de tu dossier — si queda adyacente a su misma nación o su mismo rango, se une automáticamente a esa red.</p>
      <ul>
        <li><b>Nación y rango:</b> cada agente tiene un color (nación) y un número (rango 1–6). El dado negro es una 7ª nación.</li>
        <li><b>4 casillas especiales por dossier:</b> 2 solo aceptan un dado <b>negro</b>; 1 solo acepta un <b>rango</b> específico (cualquier nación); 1 solo acepta una <b>nación</b> específica (cualquier rango). Cuentan como ya ocupadas para el fin de la partida y para misiones de espacio, tengan o no un dado real puesto.</li>
        <li><b>Misiones:</b> 4 activas (1 por categoría) toda la partida. El 1º en cumplirla anota el puntaje impreso; el 2º, la mitad redondeada arriba.</li>
        <li><b>Habilidades:</b> al repartir las 4 misiones, cada una queda ligada a 1 habilidad específica (sorteada al inicio y visible desde el principio, con su efecto y costo). Al cumplir esa misión (1º o 2º puesto) desbloqueas justo esa habilidad. Solo se puede activar <b>1 habilidad por turno</b>, y cada uso cuesta puntos que suben cada vez que CUALQUIER jugador la usa.</li>
        <li><b>Casilla de entrenamiento (siempre disponible, no es una habilidad):</b> al archivar un agente recién reclutado, en vez de ponerlo en tu dossier puedes apartarlo en tu casilla de entrenamiento (máximo 1 a la vez). La próxima vez que TÚ hagas Quemar la Red, ese agente se re-tira (mismo color, nuevo rango) y se suma a lo revelado como una opción extra — el mercado de esa vez tiene 1 agente más de lo normal.</li>
        <li><b>Última ronda:</b> se activa si la reserva no alcanza para reabastecer el mercado, o si alguien llena su dossier. Se juega hasta igualar turnos.</li>
        <li><b>Bono de conjunto:</b> si completas un grupo de tamaño exactamente 6 —una Red Nacional, una Célula Durmiente, o una Cadena de Custodia— juegas otro turno de inmediato. Solo se activa una vez por cada grupo específico.</li>
        <li><b>Mapas especiales (opcional, se elige antes de empezar):</b> además de las 2 casillas de dado negro, cada dossier tiene una casilla de rango fijo y una de nación fija, más 1 corte que desconecta dos casillas interiores normalmente adyacentes. Si una casilla negra está en el interior y la otra en el borde, la casilla de rango pide un número entre 4 y 6; si ambas negras están en el borde, pide entre 1 y 3. Al iniciar, se hace un draft inverso (el último jugador en el orden de turno elige primero) para repartir las configuraciones.</li>
      </ul>`,
  },
  en: {
    subtitleLocal: 'A spy network with split loyalties — local mode, same device',
    subtitleOnline: 'A spy network with split loyalties — online operation',
    modeLocalBtn: '🖥️ Play on this device (hotseat)',
    modeOnlineBtn: '🌐 Create an online room (share a link)',
    joinCodePlaceholder: 'ROOM CODE',
    joinBtn: 'Join',
    configWarning: '⚠️ Firebase is not configured yet: edit firebaseConfig in the HTML with your own project details before you can create or join a room. "Play on this device" works with no changes.',
    lobbyTitle: 'New Operation',
    lobbyPlayerCountLabel: 'How many agencies are playing?',
    startBtn: 'Start Operation',
    goOnlineText: 'Want to play online with others?',
    testModeLabel: '🧪 Test mode: start with abilities already unlocked',
    testModeDesc: 'Given to ALL agencies, with infinite supply (not spent on use) and no 1-per-turn limit, so you can test each one as many times as you like.',
    testAllBtn: 'All', testNoneBtn: 'None',
    mapModeLabel: 'What kind of dossier do you want to use?',
    mapModeSimpleLabel: 'Simple — only the 2 black-die cells',
    mapModeSpecialLabel: 'Special maps — + rank cell, nation cell, and an interior cut (with a reverse draft at the start)',
    missionsActiveLabel: 'Active Missions',
    abilitiesOfLabel: 'Agency Abilities —',
    marketLabel: 'Spy Market',
    footerText: 'Split Loyalty prototype — built to test the spy network, not the final design.',
    resetLink: 'Restart operation',
    rulesSummary: '❓ Rules Help',
    agency: 'Agency',
    rulesBodyHtml: `
      <p style="font-weight:700; margin:10px 0 4px; color:#f2e4c0;">How each network forms (examples)</p>
      <div style="display:flex; gap:18px; flex-wrap:wrap; margin-bottom:10px;">
        <div style="background:var(--panel); color:var(--ink); border-radius:8px; padding:8px 10px; max-width:220px;">
          <div id="exampleHN"></div>
          <b>Home Network</b><br>same nation, different ranks, adjacent. Scores at 3+ agents (sum of ranks).
        </div>
        <div style="background:var(--panel); color:var(--ink); border-radius:8px; padding:8px 10px; max-width:220px;">
          <div id="exampleSC"></div>
          <b>Sleeper Cell</b><br>same rank, different nations, adjacent. Scores if size ≥ rank (rank×size, max 7 with black).
        </div>
        <div style="background:var(--panel); color:var(--ink); border-radius:8px; padding:8px 10px; max-width:220px;">
          <div id="exampleChain"></div>
          <b>Chain of Custody</b><br>1→2→3→4... in that exact order, each link adjacent to the previous, different nations. Minimum 4. Several chains can exist at once, but an agent can't be in two.
        </div>
      </div>
      <p style="font-weight:700; margin:10px 0 4px; color:#f2e4c0;">How a turn works</p>
      <p style="margin:0 0 10px;">On your turn, choose ONE of these two actions:</p>
      <ul style="margin-top:0;">
        <li><b>A) Recruit 1 or 2 agents</b> from the market. If you recruit 2, they must differ in nation AND rank. On the very first turn of the game, only 1 may be recruited.</li>
        <li><b>B) Burn the Network</b> — return the market to the pool, reveal new agents, keep 1, the rest stay exposed to everyone else.</li>
      </ul>
      <p style="margin:0 0 4px;">After recruiting, file each agent into an empty, legal cell of your dossier — if it ends up adjacent to its own nation or its own rank, it automatically joins that network.</p>
      <ul>
        <li><b>Nation and rank:</b> every agent has a color (nation) and a number (rank 1–6). The black die is a 7th nation.</li>
        <li><b>4 special cells per dossier:</b> 2 only accept a <b>black</b> die; 1 only accepts a specific <b>rank</b> (any nation); 1 only accepts a specific <b>nation</b> (any rank). They count as already filled for the end of the game and for space-based missions, whether or not a real die is placed there.</li>
        <li><b>Missions:</b> 4 active (1 per category) for the whole game. The 1st to complete it scores its printed value; the 2nd, half rounded up.</li>
        <li><b>Abilities:</b> when the 4 missions are dealt, each is tied to 1 specific ability (drawn at the start and visible from the beginning, with its effect and cost). Completing that mission (1st or 2nd place) unlocks exactly that ability. Only <b>1 ability per turn</b> can be activated, and each use costs points that go up every time ANY player uses it.</li>
        <li><b>Training slot (always available, not an ability):</b> when filing a freshly recruited agent, instead of placing it in your dossier you can set it aside in your training slot (max 1 at a time). The next time YOU Burn the Network, that agent re-rolls (same color, new rank) and joins the reveal as one extra option -- that market has 1 more agent than usual.</li>
        <li><b>Final round:</b> triggers if the pool can't restock the market, or if someone fills their dossier. Play continues until turns are equal.</li>
        <li><b>Set bonus:</b> if you complete a group of exactly size 6 — a Home Network, a Sleeper Cell, or a Chain of Custody — you play another turn right away. Only triggers once per specific group.</li>
        <li><b>Special maps (optional, chosen before starting):</b> besides the 2 black-die cells, each dossier gets a fixed-rank cell and a fixed-nation cell, plus 1 cut that disconnects two interior cells that would normally be adjacent. If one black cell is interior and the other is on the border, the rank cell asks for a number between 4 and 6; if both black cells are on the border, it asks for 1 to 3. At the start, a reverse draft (the last player in turn order picks first) assigns the configurations.</li>
      </ul>`,
  },
};
function ST(key){ return STR[LANG][key]; }


const LAYOUTS = [
  [[0,0],[3,4]], [[0,4],[3,0]], [[0,2],[3,2]], [[1,0],[1,4]],
  [[0,1],[3,3]], [[0,3],[3,1]], [[1,1],[2,4]], [[2,0],[1,3]],
  [[0,0],[2,3]], [[2,1],[0,4]], [[3,4],[1,0]], [[0,0],[3,2]],
  [[1,2],[3,0]], [[2,2],[0,4]], [[0,1],[2,4]], [[3,1],[1,4]],
];
function layoutToIndices(layout){ return layout.map(([r,c])=>r*COLS+c); }
function borderIndices(){
  const out=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){ if(r===0||r===ROWS-1||c===0||c===COLS-1) out.push(r*COLS+c); }
  return out;
}
function interiorIndices(){
  const border = new Set(borderIndices());
  const out=[]; for(let i=0;i<CELLS;i++) if(!border.has(i)) out.push(i);
  return out;
}
const BORDER_SET = new Set(borderIndices());
const INTERIOR_SET = new Set(interiorIndices());

/* ---- Black-cell geometry -> rank-cell number range (new standardized rule) ---- */
function classifyBlackGeometry(blackIdxs){
  const interiorCount = blackIdxs.filter(i=>INTERIOR_SET.has(i)).length;
  if(interiorCount>=2) return 'both_interior'; // does not occur with the current 16 layouts
  if(interiorCount===1) return 'mixed';
  return 'both_border';
}
function rankRangeForGeometry(geo){
  if(geo==='mixed') return [4,5,6];
  if(geo==='both_border') return [1,2,3];
  return [1,2,3,4,5,6];
}

/* ---- Interior cut: 1 broken adjacency edge inside the 2x3 interior block ---- */
function pureNeighbors(idx){
  const row = Math.floor(idx/COLS), col = idx%COLS;
  const n = [];
  if(row>0) n.push(idx-COLS);
  if(row<ROWS-1) n.push(idx+COLS);
  if(col>0) n.push(idx-1);
  if(col<COLS-1) n.push(idx+1);
  return n;
}
const INTERIOR_EDGES = (()=>{
  const edges = [];
  [...INTERIOR_SET].forEach(a=>{
    pureNeighbors(a).forEach(b=>{ if(INTERIOR_SET.has(b) && a<b) edges.push([a,b]); });
  });
  return edges;
})();
function edgeKey(a,b){ return a<b ? `${a}-${b}` : `${b}-${a}`; }
let ACTIVE_CUTS = null; // Set of edge keys for whichever player's board is currently being computed

function setupFor(numPlayers){
  return { perColor: 3*numPlayers, black: numPlayers, totalDice: 19*numPlayers, marketSize: 2*numPlayers+3 };
}
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}
function freshBag(numPlayers){
  const {perColor, black} = setupFor(numPlayers);
  let bag = [];
  COLORS.forEach(c=>{ for(let i=0;i<perColor;i++) bag.push(c); });
  for(let i=0;i<black;i++) bag.push(BLACK);
  return shuffle(bag);
}
function rollDie(color){ return {color, value: 1+Math.floor(Math.random()*6)}; }

function neighborsOf(idx){
  const n = pureNeighbors(idx);
  if(!ACTIVE_CUTS) return n;
  return n.filter(nb => !ACTIVE_CUTS.has(edgeKey(idx,nb)));
}
function bfsSameAttr(board, startIdx, attr, val){
  const stack=[startIdx], seen=new Set(), comp=[];
  while(stack.length){
    const cur = stack.pop();
    if(seen.has(cur)) continue;
    seen.add(cur);
    const cell = board[cur];
    if(!cell || cell[attr]!==val) continue;
    comp.push(cur);
    neighborsOf(cur).forEach(nb=>{ if(!seen.has(nb)) stack.push(nb); });
  }
  return comp;
}
function isValidPlacement(board, specialCells, idx, die, opts){
  opts = opts||{};
  const special = specialCells[idx];
  if(special && !opts.ignoreSpecialRestriction){
    if(special.type==='black' && die.color!==BLACK) return false;
    if(special.type==='rank' && die.value!==special.value) return false;
    if(special.type==='nation' && die.color!==special.value) return false;
  }
  if(board[idx]) return false;
  const nbs = neighborsOf(idx);
  const colorNbs = nbs.filter(n=>board[n] && board[n].color===die.color);
  if(colorNbs.length){
    const values = new Set([die.value]); const cells = new Set();
    colorNbs.forEach(cn=>{ bfsSameAttr(board, cn, 'color', die.color).forEach(c=>{ if(!cells.has(c)){ cells.add(c); values.add(board[c].value); } }); });
    if(values.size !== cells.size+1) return false;
  }
  const numNbs = nbs.filter(n=>board[n] && board[n].value===die.value);
  if(numNbs.length){
    const usedColors = new Set([die.color]); const cells = new Set();
    numNbs.forEach(nn=>{ bfsSameAttr(board, nn, 'value', die.value).forEach(c=>{ if(!cells.has(c)){ cells.add(c); usedColors.add(board[c].color); } }); });
    if(usedColors.size !== cells.size+1) return false;
  }
  return true;
}
function validCellsFor(board, specialCells, die, opts){
  const out = [];
  for(let i=0;i<CELLS;i++){ if(isValidPlacement(board, specialCells, i, die, opts)) out.push(i); }
  return out;
}
function computeGroups(board, attr){
  const visited = new Set(); const groups = [];
  for(let i=0;i<CELLS;i++){
    if(board[i] && !visited.has(i)){
      const val = board[i][attr];
      const comp = bfsSameAttr(board, i, attr, val);
      comp.forEach(c=>visited.add(c));
      groups.push({attrValue: val, cells: comp});
    }
  }
  return groups;
}
function dfsLongestChainFrom(board, usedGlobally, startIdx){
  let best = {length:0, cells:[]};
  function backtrack(currentIdx, currentRank, usedColors, path){
    if(path.length > best.length) best = {length:path.length, cells:[...path]};
    neighborsOf(currentIdx).forEach(nb=>{
      if(usedGlobally.has(nb) || path.includes(nb)) return;
      const cell = board[nb];
      if(!cell || cell.value !== currentRank+1) return;
      if(usedColors.has(cell.color)) return;
      usedColors.add(cell.color); path.push(nb);
      backtrack(nb, currentRank+1, usedColors, path);
      path.pop(); usedColors.delete(cell.color);
    });
  }
  const startCell = board[startIdx];
  backtrack(startIdx, 1, new Set([startCell.color]), [startIdx]);
  return best;
}
function findAllChains(board){
  const used = new Set(); const chains = []; let more = true;
  while(more){
    more = false; let best = null;
    for(let i=0;i<CELLS;i++){
      if(used.has(i) || !board[i] || board[i].value!==1) continue;
      const cand = dfsLongestChainFrom(board, used, i);
      if(cand.length>=4 && (!best || cand.length>best.length)) best = cand;
    }
    if(best){ chains.push(best); best.cells.forEach(c=>used.add(c)); more = true; }
  }
  return chains;
}
function chainScore(len){ return len*(len+1)/2; }
function getScoringDoubleAgents(board){
  const colorGroups = computeGroups(board,'color').map(g=>({...g, kind:'color', qualifies: g.cells.length>=3}));
  const numberGroups = computeGroups(board,'value').map(g=>({...g, kind:'number', qualifies: g.cells.length>=g.attrValue}));
  const cellToColorGroup = {}; colorGroups.forEach(g=>g.cells.forEach(c=>cellToColorGroup[c]=g));
  const cellToNumberGroup = {}; numberGroups.forEach(g=>g.cells.forEach(c=>cellToNumberGroup[c]=g));
  const agents = [];
  for(let i=0;i<CELLS;i++){
    if(!board[i]) continue;
    const cg = cellToColorGroup[i], ng = cellToNumberGroup[i];
    if(cg && ng && cg.cells.length>=2 && ng.cells.length>=2 && cg.qualifies && ng.qualifies) agents.push({idx:i, colorGroup:cg, numberGroup:ng});
  }
  return {agents, colorGroups, numberGroups};
}
function scoreBoard(board, specialCells){
  const colorGroups = computeGroups(board,'color').map(g=>{
    const qualifies = g.cells.length>=3;
    const points = qualifies ? g.cells.reduce((s,c)=>s+board[c].value,0) : 0;
    return {...g, kind:'color', points, qualifies};
  });
  const numberGroups = computeGroups(board,'value').map(g=>{
    const n = g.attrValue, s = g.cells.length;
    const qualifies = s>=n;
    const points = qualifies ? n*s : 0;
    return {...g, kind:'number', points, qualifies};
  });
  const chains = findAllChains(board);
  const chainPoints = chains.reduce((s,ch)=>s+chainScore(ch.length),0);
  const networksTotal = colorGroups.reduce((s,g)=>s+g.points,0) + numberGroups.reduce((s,g)=>s+g.points,0) + chainPoints;
  const filled = board.filter(Boolean).length;
  return {colorGroups, numberGroups, chains, chainPoints, networksTotal, filled};
}

/* ============================== MISSIONS ============================== */
function scoringColorGroups(b){ return computeGroups(b,'color').map(g=>({...g, qualifies: g.cells.length>=3})); }
function scoringNumberGroups(b){ return computeGroups(b,'value').map(g=>({...g, qualifies: g.cells.length>=g.attrValue})); }
function hasCompromisedChain(b){
  const {agents} = getScoringDoubleAgents(b);
  const doubleSet = new Set(agents.map(a=>a.idx));
  return findAllChains(b).some(ch => ch.cells.filter(idx=>doubleSet.has(idx)).length >= 3);
}
function hasTripleAgent(b){
  const {agents} = getScoringDoubleAgents(b);
  if(!agents.length) return false;
  const chainCellSet = new Set();
  findAllChains(b).forEach(ch=>ch.cells.forEach(idx=>chainCellSet.add(idx)));
  return agents.some(a=>chainCellSet.has(a.idx));
}
/* ---- Small illustrative diagrams for the mission panel ---- */
const MISSION_DIAGRAMS = {
  growing_trust: {type:'dice', cells:[{r:0,c:0,label:'5',color:'rojo'},{r:0,c:1,label:'2',color:'rojo'},{r:0,c:2,label:'6',color:'rojo'},{r:0,c:3,label:'1',color:'rojo'}]},
  inner_circle: {type:'dice', cells:[{r:0,c:0,label:'4',color:'rojo'},{r:0,c:1,label:'1',color:'rojo'},{r:0,c:2,label:'6',color:'rojo'},{r:0,c:3,label:'2',color:'rojo'},{r:0,c:4,label:'5',color:'rojo'}]},
  dual_allegiance: {type:'dice', cells:[{r:0,c:0,label:'5',color:'rojo'},{r:0,c:1,label:'2',color:'rojo'},{r:0,c:2,label:'6',color:'rojo'},{r:2,c:0,label:'4',color:'azul'},{r:2,c:1,label:'6',color:'azul'},{r:2,c:2,label:'1',color:'azul'}]},
  top_clearance: {type:'dice', cells:[{r:0,c:0,label:'4',color:'rojo'},{r:0,c:1,label:'1',color:'rojo'},{r:0,c:2,label:'6',color:'rojo'}]},
  high_value_ledger: {type:'dice', cells:[{r:0,c:0,label:'5',color:'rojo'},{r:0,c:1,label:'1',color:'rojo'},{r:0,c:2,label:'6',color:'rojo'},{r:0,c:3,label:'3',color:'rojo'}]},
  building_the_file: {type:'fill', cols:5, rows:4, filled:[[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,1],[1,2],[1,3],[1,4],[2,0],[2,1]], redacted:[]},
  deep_archive: {type:'fill', cols:5, rows:4, filled:[[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,1],[1,2],[1,3],[1,4],[2,0],[2,1],[2,2],[2,3],[2,4],[3,0]], redacted:[]},
  total_coverage: {type:'fill', cols:5, rows:4, filled:(()=>{const a=[];for(let r=0;r<4;r++)for(let c=0;c<5;c++)if(!(r===0&&c===0)&&!(r===3&&c===4))a.push([r,c]);return a;})(), redacted:[[0,0],[3,4]]},
  coordinated_pair: {type:'dice', cells:[{r:0,c:0,label:'2',color:'rojo'},{r:0,c:1,label:'2',color:'azul'}]},
  working_cell: {type:'dice', cells:[{r:0,c:0,label:'3',color:'rojo'},{r:0,c:1,label:'3',color:'azul'},{r:0,c:2,label:'3',color:'verde'}]},
  field_team: {type:'dice', cells:[{r:0,c:0,label:'4',color:'rojo'},{r:0,c:1,label:'4',color:'azul'},{r:0,c:2,label:'4',color:'verde'},{r:0,c:3,label:'4',color:'morado'}]},
  elite_cell: {type:'dice', cells:[{r:0,c:0,label:'5',color:'rojo'},{r:0,c:1,label:'5',color:'azul'},{r:0,c:2,label:'5',color:'verde'},{r:0,c:3,label:'5',color:'morado'},{r:0,c:4,label:'5',color:'naranja'}]},
  parallel_operations: {type:'dice', cells:[{r:0,c:0,label:'3',color:'rojo'},{r:0,c:1,label:'3',color:'azul'},{r:0,c:2,label:'3',color:'verde'},{r:2,c:0,label:'3',color:'morado'},{r:2,c:1,label:'3',color:'naranja'},{r:2,c:2,label:'3',color:'amarillo'}]},
  overgrown_cell: {type:'dice', cells:[{r:0,c:0,label:'3',color:'rojo'},{r:0,c:1,label:'3',color:'azul'},{r:0,c:2,label:'3',color:'verde'},{r:0,c:3,label:'3',color:'morado'}]},
  ground_level: {type:'dice', cells:[{r:0,c:0,label:'1',color:'rojo'},{r:0,c:1,label:'1',color:'azul'},{r:0,c:2,label:'1',color:'verde'}]},
  border_patrol: {type:'fill', cols:5, rows:4, filled:(()=>{const a=[];for(let r=0;r<4;r++)for(let c=0;c<5;c++){const border=(r===0||r===3||c===0||c===4); if(border && !(r===0&&c===0) && !(r===3&&c===4)) a.push([r,c]);}return a;})(), redacted:[[0,0],[3,4]]},
  turned: {type:'dice', cells:[{r:0,c:0,label:'5',color:'rojo'},{r:0,c:1,label:'2',color:'rojo',agent:true},{r:0,c:2,label:'6',color:'rojo'},{r:1,c:1,label:'2',color:'azul'}]},
  web_of_two: {type:'dice', cells:[{r:0,c:0,label:'5',color:'rojo'},{r:0,c:1,label:'2',color:'rojo',agent:true},{r:0,c:2,label:'6',color:'rojo'},{r:1,c:1,label:'2',color:'azul'},{r:0,c:5,label:'5',color:'morado'},{r:0,c:6,label:'1',color:'morado',agent:true},{r:0,c:7,label:'6',color:'morado'},{r:1,c:6,label:'1',color:'naranja'}]},
  perfect_cover: {type:'dice', cells:[{r:0,c:0,label:'6',color:'rojo'},{r:0,c:1,label:'1',color:'rojo'},{r:0,c:2,label:'4',color:'rojo',agent:true},{r:1,c:0,label:'4',color:'naranja'},{r:1,c:1,label:'4',color:'verde'},{r:1,c:2,label:'4',color:'azul'}]},
  twin_moles: {type:'dice', cells:[{r:0,c:0,label:'1',color:'rojo',agent:true},{r:0,c:1,label:'2',color:'rojo',agent:true},{r:0,c:2,label:'5',color:'rojo'},{r:1,c:0,label:'1',color:'azul'},{r:1,c:1,label:'2',color:'azul'}]},
  two_front: {type:'dice', cells:[{r:0,c:0,label:'5',color:'rojo'},{r:0,c:1,label:'1',color:'rojo'},{r:0,c:2,label:'6',color:'rojo'},{r:2,c:0,label:'4',color:'azul'},{r:2,c:1,label:'4',color:'verde'},{r:2,c:2,label:'4',color:'morado'}]},
  triple_threat: {type:'dice', cells:[{r:0,c:0,label:'5',color:'rojo'},{r:0,c:1,label:'1',color:'rojo'},{r:0,c:2,label:'6',color:'rojo'},{r:2,c:0,label:'4',color:'azul'},{r:2,c:1,label:'4',color:'verde'},{r:2,c:2,label:'4',color:'morado'}]},
  compromised_chain: {type:'dice', cells:[{r:0,c:0,label:'1',color:'amarillo'},{r:0,c:1,label:'1',color:'rojo',agent:true},{r:0,c:2,label:'2',color:'azul'},{r:0,c:3,label:'3',color:'verde'},{r:0,c:4,label:'4',color:'morado'},{r:1,c:1,label:'5',color:'rojo'},{r:2,c:1,label:'6',color:'rojo'}]},
  triple_agent: {type:'dice', cells:[{r:0,c:1,label:'5',color:'rojo'},{r:1,c:1,label:'6',color:'rojo'},{r:2,c:0,label:'1',color:'verde'},{r:2,c:1,label:'2',color:'rojo',agent:true},{r:2,c:2,label:'3',color:'morado'},{r:2,c:3,label:'4',color:'naranja'},{r:3,c:1,label:'2',color:'azul'}]},
  world_map: {type:'fill', cols:5, rows:4, scatterDice:[{r:0,c:0,label:'3',color:'rojo'},{r:0,c:4,label:'6',color:'azul'},{r:1,c:2,label:'1',color:'verde'},{r:2,c:0,label:'4',color:'morado'},{r:3,c:4,label:'2',color:'naranja'},{r:3,c:2,label:'5',color:'amarillo'}]},
  full_spectrum: {type:'fill', cols:5, rows:4, scatterDice:[{r:0,c:0,label:'1',color:'rojo'},{r:0,c:4,label:'2',color:'rojo'},{r:1,c:2,label:'3',color:'rojo'},{r:2,c:0,label:'4',color:'rojo'},{r:3,c:4,label:'5',color:'rojo'},{r:3,c:2,label:'6',color:'rojo'}]},
  crosshairs: {type:'fill', cols:5, rows:4, filled:[[0,2],[1,0],[1,1],[1,2],[1,3],[1,4],[2,2],[3,2]], redacted:[]},
  inner_sanctum: {type:'fill', cols:5, rows:4, filled:[[1,1],[1,2],[1,3],[2,1],[2,2],[2,3]], redacted:[]},
  global_registry: {type:'fill', cols:5, rows:4, scatterDice:[{r:0,c:0,label:'4',color:'rojo'},{r:0,c:4,label:'4',color:'azul'},{r:1,c:2,label:'4',color:'verde'},{r:2,c:0,label:'4',color:'morado'},{r:3,c:4,label:'4',color:'naranja'},{r:3,c:2,label:'4',color:'amarillo'}]},
  extended_custody: {type:'dice', cells:[{r:0,c:0,label:'1',color:'rojo'},{r:0,c:1,label:'2',color:'azul'},{r:0,c:2,label:'3',color:'verde'},{r:0,c:3,label:'4',color:'morado'},{r:0,c:4,label:'5',color:'naranja'}]},
  full_custody: {type:'dice', cells:[{r:0,c:0,label:'1',color:'rojo'},{r:0,c:1,label:'2',color:'azul'},{r:0,c:2,label:'3',color:'verde'},{r:0,c:3,label:'4',color:'morado'},{r:0,c:4,label:'5',color:'naranja'},{r:0,c:5,label:'6',color:'amarillo'}]},
};
function renderDiceCells(cells, cellSize){
  cellSize = cellSize || 15;
  const maxR = Math.max(...cells.map(c=>c.r));
  const maxC = Math.max(...cells.map(c=>c.c));
  let html = `<div style="display:grid; grid-template-columns:repeat(${maxC+1},${cellSize}px); grid-auto-rows:${cellSize}px; gap:2px; margin:5px 0;">`;
  for(let r=0;r<=maxR;r++){
    for(let c=0;c<=maxC;c++){
      const cell = cells.find(x=>x.r===r&&x.c===c);
      if(cell){
        const ring = cell.agent ? 'box-shadow:inset 0 0 0 2px #fff;' : '';
        const txtColor = ['amarillo','verde'].includes(cell.color) ? '#2a1c04' : '#fff';
        html += `<div style="width:${cellSize}px;height:${cellSize}px;border-radius:3px;background:${COLOR_HEX(cell.color)};${ring}color:${txtColor};font-size:${Math.round(cellSize*0.53)}px;font-weight:700;display:flex;align-items:center;justify-content:center;">${cell.label}</div>`;
      } else { html += `<div></div>`; }
    }
  }
  html += `</div>`;
  return html;
}
function renderMissionDiagram(id){
  const d = MISSION_DIAGRAMS[id];
  if(!d) return '';
  if(d.type==='dice'){
    return renderDiceCells(d.cells, 15);
  }
  if(d.type==='fill'){
    const filledSet = new Set((d.filled||[]).map(([r,c])=>r*d.cols+c));
    const redactedSet = new Set((d.redacted||[]).map(([r,c])=>r*d.cols+c));
    const scatterMap = {};
    (d.scatterDice||[]).forEach(sd=>scatterMap[sd.r*d.cols+sd.c]=sd);
    let html = `<div style="display:grid; grid-template-columns:repeat(${d.cols},13px); gap:2px; margin:5px 0;">`;
    for(let r=0;r<d.rows;r++){
      for(let c=0;c<d.cols;c++){
        const idx = r*d.cols+c;
        if(scatterMap[idx]){
          const sd = scatterMap[idx];
          const txtColor = ['amarillo','verde'].includes(sd.color) ? '#2a1c04' : '#fff';
          html += `<div style="width:13px;height:13px;border-radius:2px;background:${COLOR_HEX(sd.color)};color:${txtColor};font-size:7px;font-weight:700;display:flex;align-items:center;justify-content:center;">${sd.label}</div>`;
        } else {
          let bg = '#e7ddc7';
          if(redactedSet.has(idx)) bg='#c1453c';
          else if(filledSet.has(idx)) bg='#221f1a';
          html += `<div style="width:13px;height:13px;border-radius:2px;background:${bg};"></div>`;
        }
      }
    }
    html += `</div>`;
    return html;
  }
  return '';
}

const MISSIONS = [
  {id:'growing_trust', category:'I', points:6, name:'Growing Trust', cond:'Home Network de 4+ agentes.', cond_en:'Home Network of 4+ agents.', check:(b)=>scoringColorGroups(b).some(g=>g.cells.length>=4)},
  {id:'inner_circle', category:'I', points:8, name:'Inner Circle', cond:'Home Network de 5+ agentes.', cond_en:'Home Network of 5+ agents.', check:(b)=>scoringColorGroups(b).some(g=>g.cells.length>=5)},
  {id:'dual_allegiance', category:'I', points:6, name:'Dual Allegiance', cond:'2 Home Networks puntuando a la vez, distinta nación.', cond_en:'2 Home Networks scoring at once, different nation.', check:(b)=>{ const q=scoringColorGroups(b).filter(g=>g.qualifies); const colors=new Set(q.map(g=>b[g.cells[0]].color)); return colors.size>=2; }},
  {id:'top_clearance', category:'I', points:5, name:'Top Clearance', cond:'Home Network puntuando que incluya un rango 6.', cond_en:'Scoring Home Network that includes a rank 6.', check:(b)=>scoringColorGroups(b).some(g=>g.qualifies && g.cells.some(c=>b[c].value===6))},
  {id:'high_value_ledger', category:'I', points:7, name:'High Value Ledger', cond:'Home Network puntuando con suma de rangos ≥15.', cond_en:'Scoring Home Network with rank total 15 or more.', check:(b)=>scoringColorGroups(b).some(g=>g.qualifies && g.cells.reduce((s,c)=>s+b[c].value,0)>=15)},
  {id:'building_the_file', category:'I', points:5, name:'Building the File', cond:'12+ casillas archivadas.', cond_en:'12+ cells filed.', check:(b)=>b.filter(Boolean).length>=12},
  {id:'deep_archive', category:'I', points:7, name:'Deep Archive', cond:'16+ casillas archivadas.', cond_en:'16+ cells filed.', check:(b)=>b.filter(Boolean).length>=16},
  {id:'total_coverage', category:'I', points:9, name:'Total Coverage', cond:'Todas las casillas disponibles archivadas.', cond_en:'All available cells filed.', check:(b,rs)=>b.filter(Boolean).length>=(CELLS-rs.size)},
  {id:'coordinated_pair', category:'II', points:4, name:'Coordinated Pair', cond:'Sleeper Cell de rango 2+ puntuando.', cond_en:'Scoring Sleeper Cell of rank 2+.', check:(b)=>scoringNumberGroups(b).some(g=>g.qualifies && g.attrValue>=2)},
  {id:'working_cell', category:'II', points:5, name:'Working Cell', cond:'Sleeper Cell de rango 3+ puntuando.', cond_en:'Scoring Sleeper Cell of rank 3+.', check:(b)=>scoringNumberGroups(b).some(g=>g.qualifies && g.attrValue>=3)},
  {id:'field_team', category:'II', points:7, name:'Field Team', cond:'Sleeper Cell de rango 4+ puntuando.', cond_en:'Scoring Sleeper Cell of rank 4+.', check:(b)=>scoringNumberGroups(b).some(g=>g.qualifies && g.attrValue>=4)},
  {id:'elite_cell', category:'II', points:9, name:'Elite Cell', cond:'Sleeper Cell de rango 5+ puntuando.', cond_en:'Scoring Sleeper Cell of rank 5+.', check:(b)=>scoringNumberGroups(b).some(g=>g.qualifies && g.attrValue>=5)},
  {id:'parallel_operations', category:'II', points:8, name:'Parallel Operations', cond:'2 Sleeper Cells rango 3+ a la vez, separadas.', cond_en:'2 Sleeper Cells rank 3+ at once, separate.', check:(b)=>scoringNumberGroups(b).filter(g=>g.qualifies && g.attrValue>=3).length>=2},
  {id:'overgrown_cell', category:'II', points:6, name:'Overgrown Cell', cond:'Cualquier Sleeper Cell de tamaño 4.', cond_en:'Any Sleeper Cell of size 4.', check:(b)=>computeGroups(b,'value').some(g=>g.cells.length===4)},
  {id:'ground_level', category:'II', points:5, name:'Ground Level', cond:'Sleeper Cell rango 1 con 3+ agentes.', cond_en:'Rank-1 Sleeper Cell with 3+ agents.', check:(b)=>scoringNumberGroups(b).some(g=>g.attrValue===1 && g.cells.length>=3)},
  {id:'border_patrol', category:'II', points:8, name:'Border Patrol', cond:'Todas las casillas de borde disponibles archivadas.', cond_en:'All available border cells filed.', check:(b,rs)=>[...BORDER_SET].every(i=>rs.has(i) || b[i])},
  {id:'turned', category:'III', points:4, name:'Turned', cond:'1+ doble agente con HN y SC puntuando.', cond_en:'1+ double agent with HN and SC scoring.', check:(b)=>getScoringDoubleAgents(b).agents.length>=1},
  {id:'web_of_two', category:'III', points:8, name:'Web of Two', cond:'2+ dobles agentes puntuando a la vez.', cond_en:'2+ double agents scoring at once.', check:(b)=>getScoringDoubleAgents(b).agents.length>=2},
  {id:'perfect_cover', category:'III', points:10, name:'Perfect Cover', cond:'Doble agente rango 4+, HN y SC puntuando.', cond_en:'Double agent rank 4+, HN and SC scoring.', check:(b)=>getScoringDoubleAgents(b).agents.some(a=>a.numberGroup.attrValue>=4)},
  {id:'twin_moles', category:'III', points:6, name:'Twin Moles', cond:'2 dobles agentes en la MISMA Home Network.', cond_en:'2 double agents in the SAME Home Network.', check:(b)=>{ const {agents}=getScoringDoubleAgents(b); for(let i=0;i<agents.length;i++) for(let j=i+1;j<agents.length;j++) if(agents[i].colorGroup===agents[j].colorGroup) return true; return false; }},
  {id:'two_front', category:'III', points:6, name:'Two-Front Operation', cond:'1 Home Network Y 1 Sleeper Cell puntuando (no hace falta que se toquen).', cond_en:'1 Home Network AND 1 Sleeper Cell scoring (they do not need to touch).', check:(b)=>scoringColorGroups(b).some(g=>g.qualifies) && scoringNumberGroups(b).some(g=>g.qualifies)},
  {id:'triple_threat', category:'III', points:9, name:'Triple Threat', cond:'3+ redes distintas puntuando a la vez (HN, SC o Chain).', cond_en:'3+ different networks scoring at once (HN, SC, or Chain).', check:(b)=>{ const c=scoringColorGroups(b).filter(g=>g.qualifies).length; const n=scoringNumberGroups(b).filter(g=>g.qualifies).length; const ch=findAllChains(b).length; return (c+n+ch)>=3; }},
  {id:'compromised_chain', category:'III', points:8, name:'Compromised Chain', cond:'Cadena (4+) donde 3 agentes son también dobles agentes.', cond_en:'Chain (4+) where 3 agents are also double agents.', check:(b)=>hasCompromisedChain(b)},
  {id:'triple_agent', category:'III', points:8, name:'Triple Agent', cond:'Doble agente que también forma parte de una cadena puntuando.', cond_en:'Double agent that is also part of a scoring chain.', check:(b)=>hasTripleAgent(b)},
  {id:'world_map', category:'IV', points:4, name:'World Map', cond:'Las 6 naciones representadas en algún lado (no adyacente).', cond_en:'All 6 nations represented somewhere (not adjacent).', check:(b)=>{ const s=new Set(); b.forEach(c=>{ if(c && c.color!=='negro') s.add(c.color); }); return s.size>=6; }},
  {id:'full_spectrum', category:'IV', points:4, name:'Full Spectrum', cond:'Los 6 rangos representados en algún lado (no adyacente).', cond_en:'All 6 ranks represented somewhere (not adjacent).', check:(b)=>{ const s=new Set(); b.forEach(c=>{ if(c) s.add(c.value); }); return s.size>=6; }},
  {id:'crosshairs', category:'IV', points:6, name:'Crosshairs', cond:'1 fila Y 1 columna completas a la vez.', cond_en:'1 row AND 1 column complete at the same time.', check:(b,rs)=>{
      for(let r=0;r<ROWS;r++){ let ok=true; for(let c=0;c<COLS;c++){ const i=r*COLS+c; if(!rs.has(i) && !b[i]){ ok=false; break; } } if(ok) return true; }
      for(let c=0;c<COLS;c++){ let ok=true; for(let r=0;r<ROWS;r++){ const i=r*COLS+c; if(!rs.has(i) && !b[i]){ ok=false; break; } } if(ok) return true; }
      return false; }},
  {id:'inner_sanctum', category:'IV', points:4, name:'Inner Sanctum', cond:'Las 6 casillas interiores disponibles archivadas.', cond_en:'All 6 interior cells filed.', check:(b,rs)=>[...INTERIOR_SET].every(i=>rs.has(i) || b[i])},
  {id:'global_registry', category:'IV', points:8, name:'Global Registry', cond:'Mismo rango en las 6 naciones (no hace falta que sea Sleeper Cell).', cond_en:'Same rank in all 6 nations (does not need to be a Sleeper Cell).', check:(b)=>{ for(let r=1;r<=6;r++){ const s=new Set(); b.forEach(c=>{ if(c && c.value===r && c.color!=='negro') s.add(c.color); }); if(s.size>=6) return true; } return false; }},
  {id:'extended_custody', category:'IV', points:8, name:'Extended Custody', cond:'Una Chain of Custody de tamaño 5.', cond_en:'A Chain of Custody of size 5.', check:(b)=>findAllChains(b).some(ch=>ch.length>=5)},
  {id:'full_custody', category:'IV', points:10, name:'Full Custody', cond:'Una Chain of Custody de tamaño 6.', cond_en:'A Chain of Custody of size 6.', check:(b)=>findAllChains(b).some(ch=>ch.length>=6)},
];

/* ============================== ABILITIES ============================== */
const ABILITY_DEFS = [
  {id:'same_rank_override', name:'Same Rank Override', base:2, step:1, effect:'Al reclutar 2, pueden compartir rango (deben seguir siendo de distinta nación).', effect_en:'When recruiting 2, they may share rank (must still differ in nation).'},
  {id:'same_nation_override', name:'Same Nation Override', base:2, step:1, effect:'Al reclutar 2, pueden compartir nación (deben seguir siendo de distinto rango).', effect_en:'When recruiting 2, they may share nation (must still differ in rank).'},
  {id:'adjust_clearance', name:'Adjust Clearance', base:2, step:1, effect:'Antes de archivar un agente recién reclutado, súmale o réstale 1 a su rango (mín 1, máx 6).', effect_en:'Before filing a freshly recruited agent, add or subtract 1 from its rank (min 1, max 6).'},
  {id:'flip_die', name:'Flip the Die', base:2, step:2, effect:'Antes de archivar un agente recién reclutado, voltéalo a su cara opuesta (rango n → 7−n).', effect_en:'Before filing a freshly recruited agent, flip it to its opposite face (rank n to 7-n).'},
  {id:'swap_files', name:'Swap Files', base:2, step:2, effect:'Intercambia dos de tus agentes ya archivados, si todo sigue siendo legal.', effect_en:'Swap two of your already-filed agents, if everything stays legal.'},
  {id:'extra_take', name:'Extra Take', base:3, step:2, effect:'Después de Quemar la Red, recluta 1 agente adicional del mercado fresco.', effect_en:'After Burning the Network, recruit 1 additional agent from the fresh market.'},
  {id:'double_cross', name:'Double Cross', base:1, step:1, effect:'Al reclutar, cambia uno de los reclutados por cualquier otro agente del mercado.', effect_en:'When recruiting, swap one of the recruited agents for any other agent on the market.'},
  {id:'burn_notice', name:'Burn Notice', base:2, step:1, effect:'Quita del mercado 1 agente de tu elección — no lo reclutas tú.', effect_en:'Remove 1 agent of your choice from the market -- you do not recruit it.'},
  {id:'deep_cover', name:'Deep Cover', base:2, step:2, effect:'Archiva 1 agente recién reclutado en una de tus 4 casillas especiales (negra / rango / nación), ignorando su restricción, solo esta vez.', effect_en:'File 1 freshly recruited agent into one of your 4 special cells (black / rank / nation), ignoring its restriction, just this once.'},
  {id:'second_source', name:'Second Source', base:3, step:2, effect:'Este turno, recluta cualquier cantidad de agentes (todos distintos entre sí) cuya suma de rangos sea ≤ 11.', effect_en:'This turn, recruit any number of agents (all mutually different) whose ranks add up to 11 or less.'},
  {id:'cover_story', name:'Cover Story', base:2, step:1, effect:'Justo despues de Quemar la Red (en el mismo turno): hasta 4 agentes expuestos vuelven a la bolsa.', effect_en:'Right after Burning the Network (same turn): up to 4 exposed agents return to the pool.'},
  {id:'relocate', name:'Relocate', base:2, step:1, effect:'Mueve 1 de tus agentes archivados a otra casilla vacía y legal.', effect_en:'Move 1 of your filed agents to another empty, legal cell.'},
  {id:'reroll_request', name:'Reroll Request', base:1, step:1, effect:'Vuelve a tirar 1 agente del mercado (misma nación, nuevo rango).', effect_en:'Re-roll 1 agent on the market (same nation, new rank).'},
  {id:'insider_info', name:'Insider Info', base:1, step:1, effect:'Antes de Quemar la Red: elige hasta 3 agentes del mercado que NO vuelven a la bolsa (se vuelven a tirar); luego sigue el Quemar la Red normal.', effect_en:'Before Burning the Network: choose up to 3 market agents that do NOT return to the pool (they get re-rolled instead); then the normal Burn the Network continues.'},
];
function abilityCost(id, useCounts){
  const def = ABILITY_DEFS.find(a=>a.id===id);
  const n = (useCounts[id]||0) + 1;
  return def.base + (n-1)*def.step;
}

/* ============================== NETWORK LAYER ============================== */

// Default: always your turn (overridden by the online build, which
// redefines this after loading this file, to check the real turn owner).
function isMyTurn(){ return true; }

let state = null;
let selectedPlayerCount = 2;
let testModeEnabled = false;
let testModeAbilities = new Set();
let selectedMapMode = 'simple';
function setMapMode(m){ selectedMapMode = m; }

function initLangUI(){
  const row = document.getElementById('langRow');
  row.innerHTML = `
    <button class="pc-btn" style="width:auto; border-radius:999px; padding:0 16px; font-size:14px;" onclick="setLang('es')" id="langBtnEs">🇪🇸 Español</button>
    <button class="pc-btn" style="width:auto; border-radius:999px; padding:0 16px; font-size:14px;" onclick="setLang('en')" id="langBtnEn">🇬🇧 English</button>`;
  updateLangButtons();
}
function updateLangButtons(){
  const es = document.getElementById('langBtnEs'), en = document.getElementById('langBtnEn');
  if(!es || !en) return;
  es.classList.toggle('selected', LANG==='es');
  en.classList.toggle('selected', LANG==='en');
}
function setLang(l){
  LANG = l;
  updateLangButtons();
  applyStaticTranslations();
  initTestAbilitiesGrid();
  initRulesHelpExamples();
  if(state) render();
}
function applyStaticTranslations(){
  const set = (id, val, attr) => { const el = document.getElementById(id); if(el) el[attr||'textContent'] = val; };
  set('rulesSummary', ST('rulesSummary'));
  set('rulesBody', ST('rulesBodyHtml'), 'innerHTML');
  set('lobbyTitle', ST('lobbyTitle'));
  set('lobbyPlayerCountLabel', ST('lobbyPlayerCountLabel'));
  set('startBtn', ST('startBtn'));
  set('goOnlineText', ST('goOnlineText'));
  set('modeLocalBtn', ST('modeLocalBtn'));
  set('modeOnlineBtn', ST('modeOnlineBtn'));
  set('joinCodeInput', ST('joinCodePlaceholder'), 'placeholder');
  set('joinBtn', ST('joinBtn'));
  set('configWarning', ST('configWarning'));
  set('testModeLabel', ST('testModeLabel'));
  set('testModeDesc', ST('testModeDesc'));
  set('testAllBtn', ST('testAllBtn'));
  set('mapModeLabel', ST('mapModeLabel'));
  set('mapModeSimpleLabel', ST('mapModeSimpleLabel'));
  set('mapModeSpecialLabel', ST('mapModeSpecialLabel'));
  set('testNoneBtn', ST('testNoneBtn'));
  set('missionsActiveLabel', ST('missionsActiveLabel'));
  set('abilitiesOfLabel', ST('abilitiesOfLabel'));
  set('marketLabel', ST('marketLabel'));
  set('footerText', ST('footerText'));
  set('resetLink', ST('resetLink'));
  set('lobbyLink', LANG==='en' ? 'Back to start' : 'Volver al inicio');
  set('modeSubtitle', (typeof onlineMode!=='undefined' && onlineMode) ? ST('subtitleOnline') : ST('subtitleLocal'));
}

function initPlayerCountUI(){
  const row = document.getElementById('playerCountRow');
  row.innerHTML = [2,3,4].map(n=>`<button class="pc-btn ${n===selectedPlayerCount?'selected':''}" onclick="setPlayerCount(${n})">${n}</button>`).join('');
}
function setPlayerCount(n){ selectedPlayerCount = n; initPlayerCountUI(); }

function toggleTestMode(){
  testModeEnabled = document.getElementById('testModeCheckbox').checked;
  document.getElementById('testAbilitiesPanel').style.display = testModeEnabled ? 'block' : 'none';
}
function toggleTestAbility(id, checked){
  if(checked) testModeAbilities.add(id); else testModeAbilities.delete(id);
}
function selectAllTestAbilities(all){
  document.querySelectorAll('.test-ability-cb').forEach(cb=>{ cb.checked = all; toggleTestAbility(cb.value, all); });
}
function initTestAbilitiesGrid(){
  const grid = document.getElementById('testAbilitiesGrid');
  grid.innerHTML = ABILITY_DEFS.map(a=>`
    <label style="display:flex; gap:6px; align-items:flex-start; cursor:pointer; background:#fff; border-radius:6px; padding:6px 8px;">
      <input type="checkbox" class="test-ability-cb" value="${a.id}" ${testModeAbilities.has(a.id)?'checked':''} onchange="toggleTestAbility('${a.id}', this.checked)" style="margin-top:2px;">
      <span><b>${a.name}</b><br><span style="color:var(--ink-soft); font-size:10.5px;">${LANG==='en'?a.effect_en:a.effect}</span></span>
    </label>`).join('');
}

function buildSpecialMapConfig(layoutIdx){
  const blackIdxs = layoutToIndices(LAYOUTS[layoutIdx]);
  const used = new Set(blackIdxs);
  const extra = [];
  while(extra.length < 2){
    const idx = Math.floor(Math.random()*CELLS);
    if(!used.has(idx)){ extra.push(idx); used.add(idx); }
  }
  const geo = classifyBlackGeometry(blackIdxs);
  const range = rankRangeForGeometry(geo);
  const rankValue = range[Math.floor(Math.random()*range.length)];
  const nationValue = COLORS[Math.floor(Math.random()*COLORS.length)];
  const special = {};
  blackIdxs.forEach(i => special[i] = {type:'black'});
  special[extra[0]] = {type:'rank', value: rankValue};
  special[extra[1]] = {type:'nation', value: nationValue};
  const edge = INTERIOR_EDGES[Math.floor(Math.random()*INTERIOR_EDGES.length)];
  return { layoutIdx, special, cuts: [edgeKey(edge[0], edge[1])], geo };
}
function buildSimpleMapConfig(layoutIdx){
  const blackIdxs = layoutToIndices(LAYOUTS[layoutIdx]);
  const special = {};
  blackIdxs.forEach(i => special[i] = {type:'black'});
  return { layoutIdx, special, cuts: [] };
}

function newGame(numPlayers, mapMode){
  const mode = mapMode || 'simple';
  const turnOrder = shuffle([...Array(numPlayers).keys()]);
  if(mode === 'special'){
    const poolSize = Math.min(numPlayers + 2, LAYOUTS.length);
    const layoutIdxs = shuffle([...Array(LAYOUTS.length).keys()]).slice(0, poolSize);
    state = {
      numPlayers,
      mode,
      turnOrder,
      draftPhase: true,
      draftPool: layoutIdxs.map(li => buildSpecialMapConfig(li)),
      draftOrder: [...turnOrder].reverse(),
      draftTurnPos: 0,
      draftPicks: {},
      lastLog: LANG==='en' ? 'Reverse draft: pick your dossier configuration.' : 'Draft inverso: elige tu configuración de dossier.',
    };
    render();
    return;
  }
  const layoutOrder = shuffle([...Array(LAYOUTS.length).keys()]);
  const mapConfigs = Array.from({length:numPlayers}, (_,p)=>buildSimpleMapConfig(layoutOrder[p % LAYOUTS.length]));
  finishSetupAndStart(numPlayers, mode, mapConfigs, turnOrder);
}

function pickDraftMap(poolIndex){
  if(!isMyTurn()) return;
  if(!state || !state.draftPhase) return;
  const drafter = state.draftOrder[state.draftTurnPos];
  const config = state.draftPool.splice(poolIndex,1)[0];
  state.draftPicks[drafter] = config;
  state.draftTurnPos++;
  if(state.draftTurnPos >= state.draftOrder.length){
    const numPlayers = state.numPlayers;
    const mapConfigs = [];
    for(let p=0;p<numPlayers;p++) mapConfigs.push(state.draftPicks[p]);
    finishSetupAndStart(numPlayers, 'special', mapConfigs, state.turnOrder);
    return;
  }
  const nextDrafter = state.draftOrder[state.draftTurnPos];
  state.lastLog = LANG==='en' ? `${ST('agency')} ${nextDrafter+1}, pick your configuration.` : `Agencia ${nextDrafter+1}, elige tu configuración.`;
  render();
}

function finishSetupAndStart(numPlayers, mode, mapConfigs, turnOrder){
  const missionDeckByCat = {I:[],II:[],III:[],IV:[]};
  MISSIONS.forEach(m=>missionDeckByCat[m.category].push(m.id));
  const assignedAbilities = shuffle(ABILITY_DEFS.map(a=>a.id));
  const activeMissions = ['I','II','III','IV'].map((cat,i)=>{
    const pool = shuffle([...missionDeckByCat[cat]]);
    return { id: pool[0], firstBy: null, secondBy: null, abilityId: assignedAbilities[i] };
  });

  state = {
    numPlayers,
    mode,
    draftPhase: false,
    bag: freshBag(numPlayers),
    table: [],
    boards: Array.from({length:numPlayers}, ()=>Array(CELLS).fill(null)),
    specialCells: mapConfigs.map(c=>c.special),
    cuts: mapConfigs.map(c=>c.cuts),
    turnOrder,
    turnPos: 0,
    current: turnOrder[0],
    turnsTaken: Array(numPlayers).fill(0),
    isVeryFirstTurn: true,
    selectedTableIdx: [],
    pending: [],
    reshuffleOptions: null,
    finalRoundTriggered: false,
    gameOver: false,
    activeMissions,
    playerAbilities: Array.from({length:numPlayers}, ()=>[]),
    playerTraining: Array(numPlayers).fill(null),
    abilityUseCounts: {},
    abilityScorePenalty: Array(numPlayers).fill(0),
    abilityMode: null,
    abilityUsedThisTurn: false,
    justReshuffledBy: null,
    testModeActive: false,
    claimedSetBonuses: Array.from({length:numPlayers}, ()=>[]),
    lastLog: `Operación iniciada con ${numPlayers} agencias. Orden de turno: ${turnOrder.map(p=>p+1).join(' → ')}.`,
  };
  if(testModeEnabled && testModeAbilities.size){
    state.testModeActive = true;
    const chosen = [...testModeAbilities];
    state.playerAbilities = Array.from({length:numPlayers}, ()=>[...chosen]);
    state.lastLog = LANG==='en' ? `🧪 Test mode: all agencies start with ${chosen.length} infinite-supply abilit${chosen.length===1?'y':'ies'}.` : `🧪 Modo de prueba: todas las agencias empiezan con ${chosen.length} habilidad(es) de suministro infinito.`;
  }
  drawToTable(setupFor(numPlayers).marketSize);
  render();
}

function checkSetBonus(p){
  ACTIVE_CUTS = state.cuts[p] ? new Set(state.cuts[p]) : null;
  const board = state.boards[p];
  let bonus = false;
  computeGroups(board,'color').forEach(g=>{
    if(g.cells.length===6){
      const key = 'hn:' + [...g.cells].sort((a,b)=>a-b).join(',');
      if(!state.claimedSetBonuses[p].includes(key)){ state.claimedSetBonuses[p].push(key); bonus = true; }
    }
  });
  computeGroups(board,'value').forEach(g=>{
    if(g.cells.length===6){
      const key = 'sc:' + [...g.cells].sort((a,b)=>a-b).join(',');
      if(!state.claimedSetBonuses[p].includes(key)){ state.claimedSetBonuses[p].push(key); bonus = true; }
    }
  });
  findAllChains(board).forEach(ch=>{
    if(ch.length===6){
      const key = 'chain:' + [...ch.cells].sort((a,b)=>a-b).join(',');
      if(!state.claimedSetBonuses[p].includes(key)){ state.claimedSetBonuses[p].push(key); bonus = true; }
    }
  });
  return bonus;
}

function marketSize(){ return setupFor(state.numPlayers).marketSize; }

function drawToTable(count){
  let drawn = 0;
  while(drawn < count && state.bag.length > 0){
    const color = state.bag.pop();
    state.table.push(rollDie(color));
    drawn++;
  }
  if(drawn < count) triggerFinalRound();
}
function triggerFinalRound(){
  if(!state.finalRoundTriggered){
    state.finalRoundTriggered = true;
    state.lastLog = LANG==='en' ? 'The pool does not have enough agents: the final round begins.' : 'La bolsa no tiene agentes suficientes: entra la última ronda.';
  }
}
function boardFull(p){ return state.boards[p].every((c,i)=> c!==null || state.specialCells[p][i]!==undefined); }
function specialIndexSet(p){ return new Set(Object.keys(state.specialCells[p]).map(Number)); }

function checkMissions(){
  state.activeMissions.forEach(am=>{
    const def = MISSIONS.find(m=>m.id===am.id);
    for(let p=0;p<state.numPlayers;p++){
      ACTIVE_CUTS = state.cuts[p] ? new Set(state.cuts[p]) : null;
      const satisfied = def.check(state.boards[p], specialIndexSet(p));
      if(!satisfied) continue;
      if(am.firstBy===null){
        am.firstBy = p;
        awardAbility(p, am.abilityId);
        state.lastLog += LANG==='en' ? ` Agency ${p+1} completes "${def.name}" (1st) and unlocks ${abilityNameOf(am.abilityId)}.` : ` Agencia ${p+1} completa "${def.name}" (1º) y desbloquea ${abilityNameOf(am.abilityId)}.`;
      } else if(am.firstBy!==p && am.secondBy===null){
        am.secondBy = p;
        awardAbility(p, am.abilityId);
        state.lastLog += LANG==='en' ? ` Agency ${p+1} completes "${def.name}" (2nd) and unlocks ${abilityNameOf(am.abilityId)}.` : ` Agencia ${p+1} completa "${def.name}" (2º) y desbloquea ${abilityNameOf(am.abilityId)}.`;
      }
    }
  });
}
function awardAbility(p, abilityId){
  state.playerAbilities[p].push(abilityId);
}

function endTurnAdvance(){
  checkMissions();
  const bonus = checkSetBonus(state.current);
  state.turnsTaken[state.current]++;
  if(state.isVeryFirstTurn) state.isVeryFirstTurn = false;

  for(let p=0;p<state.numPlayers;p++){ if(boardFull(p)) triggerFinalRound(); }
  if(state.table.length <= 1) drawToTable(marketSize() - state.table.length);

  const allEqual = state.turnsTaken.every(t=>t===state.turnsTaken[0]);
  if(state.finalRoundTriggered && allEqual){
    state.gameOver = true; render(); return;
  }

  if(bonus){
    state.selectedTableIdx = []; state.pending = []; state.reshuffleOptions = null; state.abilityMode = null;
    state.abilityUsedThisTurn = false;
    state.justReshuffledBy = null;
    state.lastLog += LANG==='en' ? ` 🎉 Set bonus! ${ST('agency')} ${state.current+1} plays again.` : ` 🎉 ¡Bono de conjunto! Agencia ${state.current+1} juega de nuevo.`;
    render();
    return;
  }

  state.turnPos = (state.turnPos + 1) % state.numPlayers;
  state.current = state.turnOrder[state.turnPos];
  state.selectedTableIdx = []; state.pending = []; state.reshuffleOptions = null; state.abilityMode = null;
  state.abilityUsedThisTurn = false;
  state.justReshuffledBy = null;

  if(state.table.length===0 && state.bag.length===0){
    state.lastLog = LANG==='en' ? `Agency ${state.current+1} has no possible move: turn skipped.` : `Agencia ${state.current+1} no tiene ninguna operación posible: pierde el turno.`;
    endTurnAdvance();
    return;
  }
  render();
}

function placeNextPending(cellIdx){
  if(!isMyTurn()) return;
  const die = state.pending.shift();
  state.boards[state.current][cellIdx] = {color: die.color, value: die.value};
  render();
  advancePlacementOrFinish();
}
function advancePlacementOrFinish(){
  while(state.pending.length){
    const die = state.pending[0];
    ACTIVE_CUTS = state.cuts[state.current] ? new Set(state.cuts[state.current]) : null;
    const valid = validCellsFor(state.boards[state.current], state.specialCells[state.current], die);
    if(valid.length===0){
      state.lastLog = LANG==='en' ? `No valid cell for ${CL(die.color)} ${die.value}: it was discarded.` : `No había casilla válida para ${CL(die.color)} ${die.value}: se descartó.`;
      state.pending.shift();
    } else { render(); return; }
  }
  endTurnAdvance();
}

function firstTurnLimit(){ return state.isVeryFirstTurn ? 1 : 2; }

function onSelectTableDie(idx){
  if(!isMyTurn()) return;
  if(state.gameOver || state.pending.length || state.reshuffleOptions || state.abilityMode) return;
  const sel = state.selectedTableIdx;
  const limit = firstTurnLimit();
  if(sel.includes(idx)){ state.selectedTableIdx = sel.filter(i=>i!==idx); }
  else if(sel.length<limit){ state.selectedTableIdx = [...sel, idx]; }
  render();
}
function pairValid(a,b){
  if(state.abilityMode && state.abilityMode.abilityId==='same_rank_override' && state.abilityMode.armed) return a.color!==b.color;
  if(state.abilityMode && state.abilityMode.abilityId==='same_nation_override' && state.abilityMode.armed) return a.value!==b.value;
  return a.color!==b.color && a.value!==b.value;
}
function onTakeSelected(){
  if(!isMyTurn()) return;
  const sel = state.selectedTableIdx;
  if(sel.length===1){
    const takenA = state.table.splice(sel[0],1)[0];
    state.selectedTableIdx = [];
    state.pending = [takenA];
    state.lastLog = LANG==='en' ? `Agency ${state.current+1} recruits ${CL(takenA.color)} ${takenA.value}.` : `Agencia ${state.current+1} recluta a ${CL(takenA.color)} ${takenA.value}.`;
    advancePlacementOrFinish();
    return;
  }
  if(sel.length===2){
    const [i,j] = sel;
    const a = state.table[i], b = state.table[j];
    if(!pairValid(a,b)) return;
    const [lo,hi] = i<j ? [i,j] : [j,i];
    const takenB = state.table.splice(hi,1)[0];
    const takenA = state.table.splice(lo,1)[0];
    state.selectedTableIdx = [];
    state.pending = [takenA, takenB];
    state.lastLog = LANG==='en' ? `Agency ${state.current+1} recruits ${CL(takenA.color)} ${takenA.value} and ${CL(takenB.color)} ${takenB.value}.` : `Agencia ${state.current+1} recluta a ${CL(takenA.color)} ${takenA.value} y ${CL(takenB.color)} ${takenB.value}.`;
    advancePlacementOrFinish();
  }
}
function onReshuffle(){
  if(!isMyTurn()) return;
  if(state.gameOver || state.pending.length || state.reshuffleOptions) return;
  const p = state.current;
  state.table.forEach(d=> state.bag.push(d.color));
  state.table = [];
  shuffle(state.bag);
  const hasTraining = !!state.playerTraining[p];
  const drawCount = Math.min(marketSize(), state.bag.length);
  if(drawCount < marketSize()) triggerFinalRound();
  const offered = [];
  for(let k=0;k<drawCount;k++) offered.push(rollDie(state.bag.pop()));
  if(hasTraining){
    const td = state.playerTraining[p];
    td.value = 1+Math.floor(Math.random()*6);
    offered.push(td);
    state.playerTraining[p] = null;
    shuffle(offered);
  }
  state.reshuffleOptions = offered;
  state.justReshuffledBy = p;
  state.lastLog = hasTraining
    ? (LANG==='en' ? `Agency ${p+1} burns the network -- their training agent joins the reveal, re-rolled.` : `Agencia ${p+1} quema la red — su agente en entrenamiento se suma a lo revelado, re-tirado.`)
    : (LANG==='en' ? `Agency ${p+1} burns the network.` : `Agencia ${p+1} quema la red.`);
  render();
}
function onPickReshuffle(idx){
  if(!isMyTurn()) return;
  const chosen = state.reshuffleOptions.splice(idx,1)[0];
  state.table = state.reshuffleOptions;
  state.reshuffleOptions = null;
  state.pending = [chosen];
  advancePlacementOrFinish();
}
function canUseTrainingSlot(){
  return state.pending.length>0 && !state.playerTraining[state.current];
}
function placeInTrainingSlot(){
  if(!isMyTurn()) return;
  if(!canUseTrainingSlot()) return;
  const p = state.current;
  const die = state.pending.shift();
  state.playerTraining[p] = die;
  state.lastLog = LANG==='en' ? `Agency ${p+1} sets ${CL(die.color)} ${die.value} in training.` : `Agencia ${p+1} pone en entrenamiento a ${CL(die.color)} ${die.value}.`;
  advancePlacementOrFinish();
}

/* ---------- Abilities: activation & effects ---------- */
function payAbilityCost(playerIdx, abilityId){
  const cost = abilityCost(abilityId, state.abilityUseCounts);
  state.abilityUseCounts[abilityId] = (state.abilityUseCounts[abilityId]||0) + 1;
  state.abilityScorePenalty[playerIdx] += cost;
  const idx = state.playerAbilities[playerIdx].indexOf(abilityId);
  if(idx>=0) state.playerAbilities[playerIdx].splice(idx,1);
  if(state.testModeActive){ state.playerAbilities[playerIdx].push(abilityId); }
  state.abilityUsedThisTurn = true;
  return cost;
}
function activateAbility(abilityId){
  if(!isMyTurn()) return;
  if(state.gameOver) return;
  const p = state.current;
  if(!state.playerAbilities[p].includes(abilityId)) return;
  if(state.abilityUsedThisTurn && !state.testModeActive){ state.lastLog = LANG==='en' ? 'You already activated an ability this turn -- only 1 per turn is allowed.' : 'Ya activaste una habilidad este turno — solo se puede usar 1 por turno.'; render(); return; }
  if(['same_rank_override','same_nation_override','double_cross','deep_cover'].includes(abilityId)){
    state.abilityMode = {abilityId, armed:true};
    state.lastLog = LANG==='en' ? `Agency ${p+1} activates ${abilityNameOf(abilityId)}.` : `Agencia ${p+1} activa ${abilityNameOf(abilityId)}.`;
    render(); return;
  }
  if(abilityId==='adjust_clearance' || abilityId==='flip_die'){
    if(!state.pending.length){ state.lastLog=LANG==='en' ? 'Can only be used on a freshly recruited agent, before filing it.' : 'Solo se puede usar sobre un agente recién reclutado, antes de archivarlo.'; render(); return; }
    if(abilityId==='adjust_clearance'){ state.abilityMode = {abilityId, armed:true}; render(); return; }
    const die = state.pending[0];
    die.value = 7-die.value;
    payAbilityCost(p, abilityId);
    state.lastLog = LANG==='en' ? `Agency ${p+1} uses Flip the Die: now it is ${CL(die.color)} ${die.value}.` : `Agencia ${p+1} usa Flip the Die: ahora es ${CL(die.color)} ${die.value}.`;
    render(); return;
  }
  if(abilityId==='swap_files' || abilityId==='relocate'){
    state.abilityMode = {abilityId, armed:true, picked:[]};
    state.lastLog = LANG==='en' ? `Agency ${p+1} activates ${abilityNameOf(abilityId)} -- select on your board.` : `Agencia ${p+1} activa ${abilityNameOf(abilityId)} — selecciona en tu tablero.`;
    render(); return;
  }
  if(abilityId==='extra_take'){
    if(!state.reshuffleOptions){ state.lastLog=LANG==='en' ? 'Can only be used during Burn the Network, before choosing your die.' : 'Solo se puede usar durante Quemar la Red, antes de elegir tu dado.'; render(); return; }
    state.abilityMode = {abilityId, armed:true};
    state.lastLog = LANG==='en' ? `Agency ${p+1} activates Extra Take -- pick 2 dice instead of 1.` : `Agencia ${p+1} activa Extra Take — elige 2 dados en vez de 1.`;
    render(); return;
  }
  if(abilityId==='burn_notice'){
    state.abilityMode = {abilityId, armed:true};
    state.lastLog = LANG==='en' ? `Agency ${p+1} activates Burn Notice -- pick 1 market agent to discard.` : `Agencia ${p+1} activa Burn Notice — elige 1 agente del mercado para descartar.`;
    render(); return;
  }
  if(abilityId==='second_source'){
    state.abilityMode = {abilityId, armed:true, picked:[]};
    state.lastLog = LANG==='en' ? `Agency ${p+1} activates Second Source -- pick agents whose rank sum is 11 or less.` : `Agencia ${p+1} activa Second Source — elige agentes cuya suma de rango sea ≤ 11.`;
    render(); return;
  }
  if(abilityId==='cover_story'){
    if(state.justReshuffledBy !== p){ state.lastLog=LANG==='en' ? 'Cover Story can only be used right after Burning the Network, same turn.' : 'Cover Story solo se puede usar justo después de Quemar la Red, en el mismo turno.'; render(); return; }
    if(state.table.length===0){ state.lastLog=LANG==='en' ? 'There are no exposed agents on the market right now.' : 'No hay agentes expuestos en el mercado ahora mismo.'; render(); return; }
    state.abilityMode = {abilityId, armed:true, picked:[]};
    render(); return;
  }
  if(abilityId==='reroll_request'){
    state.abilityMode = {abilityId, armed:true};
    state.lastLog = LANG==='en' ? `Agency ${p+1} activates Reroll Request -- pick 1 market agent.` : `Agencia ${p+1} activa Reroll Request — elige 1 agente del mercado.`;
    render(); return;
  }
  if(abilityId==='insider_info'){
    if(state.pending.length || state.reshuffleOptions){ state.lastLog=LANG==='en' ? 'Insider Info can only be used BEFORE Burning the Network, at the start of your turn.' : 'Insider Info solo se puede usar ANTES de Quemar la Red, al inicio de tu turno.'; render(); return; }
    state.abilityMode = {abilityId, armed:true, picked:[]};
    state.lastLog = LANG==='en' ? `Agency ${p+1} activates Insider Info -- pick up to 3 market agents to keep (they re-roll) before burning the rest.` : `Agencia ${p+1} activa Insider Info — elige hasta 3 agentes del mercado que se queden (se re-tiran) antes de quemar el resto.`;
    render(); return;
  }
}
function abilityNameOf(id){ return (ABILITY_DEFS.find(a=>a.id===id)||{}).name || id; }
function cancelAbilityMode(){
  if(!isMyTurn()) return; state.abilityMode = null; render(); }

function onAbilityMarketClick(idx){
  if(!isMyTurn()) return;
  const mode = state.abilityMode; if(!mode) return;
  const p = state.current;
  if(mode.abilityId==='burn_notice'){
    state.table.splice(idx,1);
    payAbilityCost(p,'burn_notice');
    state.lastLog = LANG==='en' ? `Agency ${p+1} uses Burn Notice to discard a market agent.` : `Agencia ${p+1} usa Burn Notice para descartar un agente del mercado.`;
    state.abilityMode = null; render(); return;
  }
  if(mode.abilityId==='reroll_request'){
    const d = state.table[idx];
    d.value = 1+Math.floor(Math.random()*6);
    payAbilityCost(p,'reroll_request');
    state.lastLog = LANG==='en' ? `Agency ${p+1} uses Reroll Request.` : `Agencia ${p+1} usa Reroll Request.`;
    state.abilityMode = null; render(); return;
  }
  if(mode.abilityId==='second_source'){
    const picked = mode.picked;
    if(picked.includes(idx)){ mode.picked = picked.filter(i=>i!==idx); render(); return; }
    const candidate = [...picked, idx];
    const dice = candidate.map(i=>state.table[i]);
    const sum = dice.reduce((s,d)=>s+d.value,0);
    const colorsOk = new Set(dice.map(d=>d.color)).size===dice.length;
    const ranksOk = new Set(dice.map(d=>d.value)).size===dice.length;
    if(sum<=11 && colorsOk && ranksOk){ mode.picked = candidate; }
    render(); return;
  }
  if(mode.abilityId==='cover_story'){
    const picked = mode.picked;
    if(picked.includes(idx)) mode.picked = picked.filter(i=>i!==idx);
    else if(picked.length<4) mode.picked = [...picked, idx];
    render(); return;
  }
  if(mode.abilityId==='insider_info'){
    const picked = mode.picked;
    if(picked.includes(idx)) mode.picked = picked.filter(i=>i!==idx);
    else if(picked.length<3) mode.picked = [...picked, idx];
    render(); return;
  }
}
function confirmAbilityMode(){
  if(!isMyTurn()) return;
  const mode = state.abilityMode; if(!mode) return;
  const p = state.current;
  if(mode.abilityId==='second_source'){
    if(!mode.picked.length){ state.abilityMode=null; render(); return; }
    const sorted = [...mode.picked].sort((a,b)=>b-a);
    const taken = sorted.map(i=>state.table.splice(i,1)[0]);
    payAbilityCost(p,'second_source');
    state.pending = taken;
    state.lastLog = LANG==='en' ? `Agency ${p+1} uses Second Source and recruits ${taken.length} agents.` : `Agencia ${p+1} usa Second Source y recluta ${taken.length} agentes.`;
    state.abilityMode = null;
    advancePlacementOrFinish();
    return;
  }
  if(mode.abilityId==='cover_story'){
    const sorted = [...mode.picked].sort((a,b)=>b-a);
    sorted.forEach(i=>{ const d = state.table.splice(i,1)[0]; state.bag.push(d.color); });
    shuffle(state.bag);
    payAbilityCost(p,'cover_story');
    state.lastLog = LANG==='en' ? `Agency ${p+1} uses Cover Story: ${sorted.length} agents return to the pool.` : `Agencia ${p+1} usa Cover Story: ${sorted.length} agentes vuelven a la bolsa.`;
    state.abilityMode = null; render(); return;
  }
  if(mode.abilityId==='insider_info'){
    payAbilityCost(p,'insider_info');
    const keep = mode.picked.map(i=>state.table[i]);
    const rest = state.table.filter((_,i)=>!mode.picked.includes(i));
    rest.forEach(d=>state.bag.push(d.color));
    shuffle(state.bag);
    const size = marketSize();
    const rerolled = keep.map(d=>({color:d.color, value: 1+Math.floor(Math.random()*6)}));
    const need = Math.max(0, size - rerolled.length);
    const fresh = [];
    for(let k=0;k<need && state.bag.length>0;k++) fresh.push(rollDie(state.bag.pop()));
    if(fresh.length < need) triggerFinalRound();
    state.table = [];
    state.reshuffleOptions = [...rerolled, ...fresh];
    state.justReshuffledBy = p;
    state.lastLog = LANG==='en' ? `Agency ${p+1} uses Insider Info: ${rerolled.length} agents protected and re-rolled. Now pick your die.` : `Agencia ${p+1} usa Insider Info: ${rerolled.length} agentes protegidos y re-tirados. Ahora elige tu dado.`;
    state.abilityMode = null; render(); return;
  }
}

function onAbilityBoardClick(playerIdx, cellIdx){
  if(!isMyTurn()) return;
  const mode = state.abilityMode; if(!mode) return;
  const p = state.current;
  if(playerIdx !== p) return;
  const board = state.boards[p];
  ACTIVE_CUTS = state.cuts[p] ? new Set(state.cuts[p]) : null;
  if(mode.abilityId==='swap_files'){
    if(!board[cellIdx]) return;
    mode.picked.push(cellIdx);
    if(mode.picked.length===2){
      const [a,b] = mode.picked;
      const tmp = board[a]; board[a]=board[b]; board[b]=tmp;
      const legal = boardFullyLegal(board);
      if(!legal){ const t2=board[a]; board[a]=board[b]; board[b]=t2; state.lastLog=LANG==='en' ? 'That swap would break a network -- cancelled.' : 'Ese intercambio rompería una red — cancelado.'; }
      else { payAbilityCost(p,'swap_files'); state.lastLog = LANG==='en' ? `Agency ${p+1} uses Swap Files.` : `Agencia ${p+1} usa Swap Files.`; }
      state.abilityMode = null;
    }
    render(); return;
  }
  if(mode.abilityId==='relocate'){
    if(mode.picked.length===0){
      if(!board[cellIdx]) return;
      mode.picked.push(cellIdx); render(); return;
    } else {
      if(board[cellIdx] || state.specialCells[p][cellIdx]!==undefined) return;
      const die = board[mode.picked[0]];
      board[mode.picked[0]] = null;
      const ok = isValidPlacement(board, state.specialCells[p], cellIdx, die);
      if(ok){ board[cellIdx] = die; payAbilityCost(p,'relocate'); state.lastLog = LANG==='en' ? `Agency ${p+1} uses Relocate.` : `Agencia ${p+1} usa Relocate.`; }
      else { board[mode.picked[0]] = die; state.lastLog=LANG==='en' ? 'That cell is not legal for that agent -- cancelled.' : 'Esa casilla no es legal para ese agente — cancelado.'; }
      state.abilityMode = null; render(); return;
    }
  }
}
function boardFullyLegal(board){
  const colorGroups = computeGroups(board,'color');
  for(const g of colorGroups){ const vals = new Set(g.cells.map(c=>board[c].value)); if(vals.size!==g.cells.length) return false; }
  const numberGroups = computeGroups(board,'value');
  for(const g of numberGroups){ const cols = new Set(g.cells.map(c=>board[c].color)); if(cols.size!==g.cells.length || g.cells.length>7) return false; }
  return true;
}

/* ============================== RENDER ============================== */
function diceHtml(list, opts){
  opts = opts||{};
  return list.map((d,i)=>{
    let classes = 'die';
    if(opts.small) classes += ' small';
    if(opts.selected && opts.selected.includes(i)) classes += ' selected';
    if(opts.disabled) classes += ' disabled';
    const click = opts.onClick ? `onclick="${opts.onClick}(${i})"` : '';
    return `<div class="${classes} c-${d.color}" title="${CL(d.color)} ${d.value}" ${click}>${d.value}</div>`;
  }).join('');
}

function renderMapPreview(config, cellPx){
  cellPx = cellPx || 18;
  const cutSet = new Set(config.cuts);
  let html = `<div style="display:inline-grid; grid-template-columns:repeat(${COLS},${cellPx}px); gap:2px;">`;
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const idx = r*COLS+c;
      const sp = config.special[idx];
      let style = `width:${cellPx}px;height:${cellPx}px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:${Math.round(cellPx*0.45)}px;font-weight:700;box-sizing:border-box;color:#fff;`;
      let label = '';
      if(sp && sp.type==='black'){ style += 'background:repeating-linear-gradient(45deg,#2a2724,#2a2724 3px,#3a352f 3px,#3a352f 6px);'; label='●'; }
      else if(sp && sp.type==='rank'){ style += 'background:#fff3d6; border:2px dashed #b8801f; color:#b8801f;'; label=sp.value; }
      else if(sp && sp.type==='nation'){ style += `background:#fff; border:3px solid ${COLOR_HEX(sp.value)};`; }
      else { style += 'background:#e7ddc7; border:1px solid #c9bd9d;'; }
      if(r>0 && cutSet.has(edgeKey(idx, idx-COLS))) style += 'border-top:3px solid #c1453c;';
      if(r<ROWS-1 && cutSet.has(edgeKey(idx, idx+COLS))) style += 'border-bottom:3px solid #c1453c;';
      if(c>0 && cutSet.has(edgeKey(idx, idx-1))) style += 'border-left:3px solid #c1453c;';
      if(c<COLS-1 && cutSet.has(edgeKey(idx, idx+1))) style += 'border-right:3px solid #c1453c;';
      html += `<div style="${style}">${label}</div>`;
    }
  }
  html += `</div>`;
  return html;
}

function renderDraftUI(){
  document.getElementById('bagCount').textContent = '';
  document.getElementById('logLine').textContent = state.lastLog || '';
  const drafter = state.draftOrder[state.draftTurnPos];
  const pill = document.getElementById('turnPill');
  pill.textContent = LANG==='en' ? `Draft: ${ST('agency')} ${drafter+1} picks` : `Draft: elige Agencia ${drafter+1}`;
  document.getElementById('missionsArea').innerHTML = '';
  document.getElementById('abilitiesArea').innerHTML = '';
  document.getElementById('abilityModeArea').innerHTML = '';
  document.getElementById('reshuffleArea').innerHTML = '';
  const tableArea = document.getElementById('tableArea');
  if(tableArea) tableArea.style.display = 'none';
  document.getElementById('hintLine').textContent = LANG==='en'
    ? 'Reverse draft: the last player in turn order picks first.'
    : 'Draft inverso: el último jugador en el orden de turno elige primero.';
  document.getElementById('actionsRow').innerHTML = '';
  document.getElementById('endArea').innerHTML = '';
  const canPick = isMyTurn();
  const layoutWord = LANG==='en' ? 'Layout' : 'Config.';
  document.getElementById('boardsArea').innerHTML = `<div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">` +
    state.draftPool.map((cfg,i)=>`
      <div style="background:var(--panel); border-radius:12px; padding:10px; text-align:center; ${canPick?'cursor:pointer;':'opacity:0.55;'}" ${canPick?`onclick="pickDraftMap(${i})"`:''}>
        ${renderMapPreview(cfg, 20)}
        <div style="font-size:10.5px; color:var(--ink-soft); margin-top:6px;">${layoutWord} #${cfg.layoutIdx+1}</div>
      </div>`).join('') + `</div>`;
}

function renderCore(){
  if(!state) return;
  if(state.draftPhase){ renderDraftUI(); return; }
  document.getElementById('bagCount').textContent = LANG==='en' ? `Dice in pool: ${state.bag.length}` : `Dados en bolsa: ${state.bag.length}`;
  document.getElementById('logLine').textContent = state.lastLog || '';
  const pill = document.getElementById('turnPill');
  const testTag = state.testModeActive ? (LANG==='en' ? '🧪 TEST — ' : '🧪 PRUEBA — ') : '';
  const turnText = state.gameOver ? (LANG==='en' ? 'Operation concluded' : 'Operación concluida') : (LANG==='en' ? `${ST('agency')} ${state.current+1}'s turn` : `Turno de ${ST('agency')} ${state.current+1}`);
  pill.textContent = testTag + turnText;

  document.getElementById('missionsArea').innerHTML = state.activeMissions.map(am=>{
    const def = MISSIONS.find(m=>m.id===am.id);
    const ord1 = LANG==='en' ? '1st' : '1º';
    const ord2 = LANG==='en' ? '2nd' : '2º';
    const first = am.firstBy!==null ? `<span class="badge gold">${ord1} ${ST('agency')} ${am.firstBy+1} (+${def.points})</span>` : `<span class="badge open">${ord1}: ${def.points} pts</span>`;
    const second = am.secondBy!==null ? `<span class="badge silver">${ord2} ${ST('agency')} ${am.secondBy+1} (+${Math.ceil(def.points/2)})</span>` : (am.firstBy!==null ? `<span class="badge open">${ord2}: ${Math.ceil(def.points/2)} pts</span>` : '');
    const abDef = ABILITY_DEFS.find(a=>a.id===am.abilityId);
    const abCost = abilityCost(am.abilityId, state.abilityUseCounts);
    return `<div class="mission-card">
      <div class="m-cat">${def.category}</div>
      <div class="m-name">${def.name}</div>
      <div class="m-cond">${LANG==='en'?def.cond_en:def.cond}</div>
      ${renderMissionDiagram(am.id)}
      <div class="m-status">${first}${second}</div>
      <div class="m-cond" style="margin-top:6px; padding-top:6px; border-top:1px dashed var(--panel-line);">
        🔓 <b>${abDef.name}</b> <span style="color:var(--amber-dark); font-weight:700;">(${abCost} pts)</span><br>${LANG==='en'?abDef.effect_en:abDef.effect}
      </div>
    </div>`;
  }).join('');

  document.getElementById('abilityPlayerLabel').textContent = state.gameOver ? '' : (state.current+1);
  const myAbilities = state.gameOver ? [] : state.playerAbilities[state.current];
  const abilitiesArea = document.getElementById('abilitiesArea');
  const trainingNote = (!state.gameOver && state.playerTraining[state.current]) ?
    (LANG==='en' ? `<div class="ability-empty">🎓 Agent in training: on your next Burn the Network it re-rolls and joins the reveal as one extra option.</div>` : `<div class="ability-empty">🎓 Agente en entrenamiento: en tu próximo Quemar la Red se re-tira y se suma a lo revelado como una opción extra.</div>`) : '';
  const testNote = state.testModeActive ?
    (LANG==='en' ? `<div class="ability-empty">🧪 Test mode: infinite supply, no 1-per-turn limit.</div>` : `<div class="ability-empty">🧪 Modo de prueba: suministro infinito, sin límite de 1 por turno.</div>`) : '';
  const usedNote = (!state.gameOver && state.abilityUsedThisTurn && !state.testModeActive) ?
    (LANG==='en' ? `<div class="ability-empty">✋ You already used your ability this turn -- only 1 is allowed.</div>` : `<div class="ability-empty">✋ Ya usaste tu habilidad de este turno — solo se permite 1.</div>`) : '';
  if(!myAbilities.length){
    abilitiesArea.innerHTML = testNote + trainingNote + usedNote || (LANG==='en' ? '<span class="ability-empty">You do not have any unlocked abilities yet -- earn them by completing missions.</span>' : '<span class="ability-empty">Aún no tienes habilidades desbloqueadas — se ganan al cumplir misiones.</span>');
  } else {
    abilitiesArea.innerHTML = testNote + trainingNote + usedNote + myAbilities.map(id=>{
      const def = ABILITY_DEFS.find(a=>a.id===id);
      const cost = abilityCost(id, state.abilityUseCounts);
      const disabled = (state.abilityUsedThisTurn && !state.testModeActive) ? 'style="opacity:0.4; cursor:not-allowed;"' : '';
      const costLabel = LANG==='en' ? `current cost: ${cost} pts` : `costo actual: ${cost} pts`;
      return `<button class="ability-btn" ${disabled} onclick="activateAbility('${id}')"><span class="a-name">${def.name}</span><span class="a-cost">${costLabel}</span></button>`;
    }).join('');
  }
  const modeArea = document.getElementById('abilityModeArea');
  if(state.abilityMode){
    const mode = state.abilityMode;
    const def = ABILITY_DEFS.find(a=>a.id===mode.abilityId);
    let extra = '';
    if(['second_source','cover_story','insider_info'].includes(mode.abilityId)){
      const confirmLabel = LANG==='en' ? 'Confirm' : 'Confirmar';
      extra = `<button class="action-btn primary" onclick="confirmAbilityMode()" style="margin-left:8px;">${confirmLabel} (${(mode.picked||[]).length})</button>`;
    }
    const modeBtnLabel = LANG==='en' ? 'Cancel' : 'Cancelar';
    modeArea.innerHTML = `<div class="ability-mode-bar">${LANG==='en'?def.effect_en:def.effect}<button class="action-btn ghost" onclick="cancelAbilityMode()">${modeBtnLabel}</button>${extra}</div>`;
  } else {
    modeArea.innerHTML = '';
  }

  const reshuffleArea = document.getElementById('reshuffleArea');
  if(state.reshuffleOptions){
    const extraNote = (state.abilityMode && state.abilityMode.abilityId==='extra_take') ? (LANG==='en' ? ' (Extra Take active: pick 2)' : ' (Extra Take activo: elige 2)') : '';
    reshuffleArea.innerHTML = LANG==='en'
      ? `<div class="reshuffle-panel"><p>${ST('agency')} ${state.current+1}: pick your die${extraNote}. The rest stay exposed.</p>
      <div class="dice-row">${diceHtml(state.reshuffleOptions, {onClick:'onPickReshuffle'})}</div></div>`
      : `<div class="reshuffle-panel"><p>${ST('agency')} ${state.current+1}: elige tu dado${extraNote}. El resto queda expuesto.</p>
      <div class="dice-row">${diceHtml(state.reshuffleOptions, {onClick:'onPickReshuffle'})}</div></div>`;
  } else { reshuffleArea.innerHTML = ''; }

  document.getElementById('tableArea').style.display = state.reshuffleOptions ? 'none' : 'block';
  const marketAbilityMode = state.abilityMode && ['burn_notice','reroll_request','second_source','cover_story','insider_info'].includes(state.abilityMode.abilityId);
  document.getElementById('diceRow').innerHTML = diceHtml(state.table, {
    selected: marketAbilityMode ? (state.abilityMode.picked||[]) : state.selectedTableIdx,
    onClick: state.gameOver ? null : (marketAbilityMode ? 'onAbilityMarketClick' : ((state.pending.length) ? null : 'onSelectTableDie')),
    disabled: (!marketAbilityMode) && (state.pending.length>0 || state.gameOver)
  });

  const hint = document.getElementById('hintLine');
  if(state.gameOver){ hint.textContent = ''; }
  else if(state.pending.length){
    const die = state.pending[0];
    const abilityHint = (state.abilityMode && state.abilityMode.abilityId==='adjust_clearance') ? (LANG==='en' ? ' Use the +1/-1 buttons before filing.' : ' Usa los botones +1/−1 antes de archivar.') : '';
    hint.textContent = LANG==='en'
      ? `File ${CL(die.color)} ${die.value} into a green cell of your dossier.${abilityHint}`
      : `Archiva a ${CL(die.color)} ${die.value} en una casilla verde de tu dossier.${abilityHint}`;
  } else if(marketAbilityMode){ hint.textContent = LANG==='en' ? 'Select on the market.' : 'Selecciona en el mercado.'; }
  else if(state.selectedTableIdx.length===2){
    const [i,j] = state.selectedTableIdx; const a=state.table[i], b=state.table[j];
    hint.textContent = pairValid(a,b)
      ? (LANG==='en' ? 'Valid pair. Click "Recruit both".' : 'Par válido. Pulsa "Reclutar a los 2".')
      : (LANG==='en' ? 'They do not meet the restriction -- deselect one.' : 'No cumplen la restricción — deselecciona uno.');
  } else if(state.selectedTableIdx.length===1){
    hint.textContent = firstTurnLimit()===1
      ? (LANG==='en' ? 'First turn of the game: you may only recruit this agent.' : 'Primer turno de la partida: solo puedes reclutar a este agente.')
      : (LANG==='en' ? 'You can recruit just this one, or select a second valid one.' : 'Puedes reclutar solo a este, o selecciona un segundo válido.');
  } else { hint.textContent = LANG==='en' ? 'Select market agents, or burn the network.' : 'Selecciona agentes del mercado, o quema la red.'; }

  if(state.pending.length && state.abilityMode && state.abilityMode.abilityId==='adjust_clearance'){
    const cancelLabel = LANG==='en' ? 'Cancel' : 'Cancelar';
    hint.innerHTML += ` <button class="action-btn" style="padding:4px 10px;" onclick="adjustClearance(-1)">−1</button>
      <button class="action-btn" style="padding:4px 10px;" onclick="adjustClearance(1)">+1</button>
      <button class="action-btn ghost" style="padding:4px 10px;" onclick="cancelAbilityMode()">${cancelLabel}</button>`;
  }
  if(canUseTrainingSlot() && !(state.abilityMode && state.abilityMode.abilityId==='adjust_clearance')){
    const trainLabel = LANG==='en' ? '🎓 Place in training instead' : '🎓 Poner en entrenamiento en vez de archivar';
    hint.innerHTML += ` <button class="action-btn ghost" style="padding:4px 10px;" onclick="placeInTrainingSlot()">${trainLabel}</button>`;
  }

  const actionsRow = document.getElementById('actionsRow');
  if(state.gameOver || marketAbilityMode){ actionsRow.innerHTML = ''; }
  else if(state.pending.length===0 && !state.reshuffleOptions){
    const sel = state.selectedTableIdx;
    let canTake=false, takeLabel = LANG==='en' ? 'Recruit' : 'Reclutar';
    if(sel.length===1){ canTake=true; takeLabel = LANG==='en' ? 'Recruit this agent' : 'Reclutar a este agente'; }
    else if(sel.length===2){ const a=state.table[sel[0]], b=state.table[sel[1]]; canTake=pairValid(a,b); takeLabel = LANG==='en' ? 'Recruit both agents' : 'Reclutar a los 2 agentes'; }
    const burnLabel = LANG==='en' ? 'Burn the Network' : 'Quemar la red';
    actionsRow.innerHTML = `<button class="action-btn primary" ${canTake?'':'disabled'} onclick="onTakeSelected()">${takeLabel}</button>
      <button class="action-btn ghost" onclick="onReshuffle()">${burnLabel}</button>`;
  } else { actionsRow.innerHTML = ''; }

  const endArea = document.getElementById('endArea');
  if(state.gameOver){
    const scores = state.boards.map((b,p)=>{
      ACTIVE_CUTS = state.cuts[p] ? new Set(state.cuts[p]) : null;
      const s = scoreBoard(b, state.specialCells[p]);
      const missionPts = state.activeMissions.reduce((sum,am)=>{
        const def = MISSIONS.find(m=>m.id===am.id);
        if(am.firstBy===p) return sum+def.points;
        if(am.secondBy===p) return sum+Math.ceil(def.points/2);
        return sum;
      },0);
      const total = s.networksTotal + missionPts - state.abilityScorePenalty[p];
      return {...s, missionPts, total, filled:s.filled};
    });
    let winnerIdx = 0;
    for(let p=1;p<state.numPlayers;p++){
      if(scores[p].total>scores[winnerIdx].total || (scores[p].total===scores[winnerIdx].total && scores[p].filled>scores[winnerIdx].filled)) winnerIdx=p;
    }
    const endTitle = LANG==='en' ? `Operation over — ${ST('agency')} ${winnerIdx+1} wins` : `Fin de la operación — gana Agencia ${winnerIdx+1}`;
    const newOpLabel = LANG==='en' ? 'New operation' : 'Nueva operación';
    endArea.innerHTML = LANG==='en'
      ? `<div class="end-screen"><h2>${endTitle}</h2>
      <div class="end-score-row">${scores.map((s,p)=>`<div><span class="num">${s.total}</span>${ST('agency')} ${p+1} (${s.filled}/${CELLS - Object.keys(state.specialCells[p]).length} avail., networks ${s.networksTotal}, missions ${s.missionPts}, abilities −${state.abilityScorePenalty[p]})</div>`).join('')}</div>
      <button class="action-btn primary" onclick="backToLobbyScreen()">${newOpLabel}</button></div>`
      : `<div class="end-screen"><h2>${endTitle}</h2>
      <div class="end-score-row">${scores.map((s,p)=>`<div><span class="num">${s.total}</span>${ST('agency')} ${p+1} (${s.filled}/${CELLS - Object.keys(state.specialCells[p]).length} disp., redes ${s.networksTotal}, misiones ${s.missionPts}, habilidades −${state.abilityScorePenalty[p]})</div>`).join('')}</div>
      <button class="action-btn primary" onclick="backToLobbyScreen()">${newOpLabel}</button></div>`;
  } else { endArea.innerHTML = ''; }

  const boardsArea = document.getElementById('boardsArea');
  boardsArea.innerHTML = Array.from({length:state.numPlayers}, (_,p)=>{
    const board = state.boards[p];
    ACTIVE_CUTS = state.cuts[p] ? new Set(state.cuts[p]) : null;
    const score = scoreBoard(board, state.specialCells[p]);
    const isActive = !state.gameOver && state.current===p;
    let validSet = new Set();
    if(isActive && state.pending.length && !state.abilityMode){
      validCellsFor(board, state.specialCells[p], state.pending[0]).forEach(v=>validSet.add(v));
    }
    if(isActive && state.pending.length && state.abilityMode && state.abilityMode.abilityId==='deep_cover'){
      validCellsFor(board, state.specialCells[p], state.pending[0], {ignoreSpecialRestriction:true}).forEach(v=>validSet.add(v));
    }
    const boardAbilityMode = isActive && state.abilityMode && ['swap_files','relocate'].includes(state.abilityMode.abilityId);
    const cells = board.map((cell, idx)=>{
      const special = state.specialCells[p][idx];
      if(cell){
        const selCls = (boardAbilityMode && (state.abilityMode.picked||[]).includes(idx)) ? ' select-target' : '';
        const click = boardAbilityMode ? ` onclick="onAbilityBoardClick(${p},${idx})"` : '';
        return `<div class="cell filled${selCls}" style="background:${COLOR_HEX(cell.color)}; color:${['amarillo','verde'].includes(cell.color)?'#2a1c04':'#fff'};" title="${CL(cell.color)} ${cell.value}"${click}>${cell.value}</div>`;
      }
      const isValid = isActive && (state.pending.length && !state.abilityMode || (state.abilityMode && state.abilityMode.abilityId==='deep_cover')) && validSet.has(idx);
      const isRelocateTarget = boardAbilityMode && state.abilityMode.abilityId==='relocate' && (state.abilityMode.picked||[]).length===1;
      const abilityClick = boardAbilityMode ? ` onclick="onAbilityBoardClick(${p},${idx})"` : '';
      const click = isValid ? `onclick="placeNextPending(${idx})"` : (isRelocateTarget ? `onclick="onAbilityBoardClick(${p},${idx})"` : (special ? abilityClick : ''));
      if(special){
        const validCls = isValid ? ' valid' : '';
        if(special.type==='black'){
          const t = LANG==='en' ? 'Black die only' : 'Solo dado negro';
          return `<div class="cell empty special-black${validCls}" ${click} title="${t}">⬤</div>`;
        }
        if(special.type==='rank'){
          const t = LANG==='en' ? `Rank ${special.value} only` : `Solo rango ${special.value}`;
          return `<div class="cell empty special-rank${validCls}" ${click} title="${t}">${special.value}</div>`;
        }
        const t = LANG==='en' ? `${CL(special.value)} only` : `Solo nación ${CL(special.value)}`;
        return `<div class="cell empty special-nation${validCls}" style="border-color:${COLOR_HEX(special.value)};" ${click} title="${t}"></div>`;
      }
      return `<div class="cell empty ${isValid||isRelocateTarget?'valid':''}" ${click}></div>`;
    }).join('');

    const scLabel = LANG==='en' ? 'SC rank' : 'SC rango';
    const breakdown = [...score.colorGroups, ...score.numberGroups]
      .filter(g=>g.cells.length>1 || g.qualifies)
      .map(g=> g.kind==='color'
        ? `<div>${g.qualifies?'✓':'—'} HN <b>${CL(g.attrValue)}</b> (${g.cells.length}): ${g.points} pts</div>`
        : `<div>${g.qualifies?'✓':'—'} ${scLabel} <b>${g.attrValue}</b> (${g.cells.length}/${g.attrValue}): ${g.points} pts</div>`
      ).join('') + score.chains.map(ch=>`<div>✓ Chain (${ch.length}): ${chainScore(ch.length)} pts</div>`).join('');

    const availLabel = LANG==='en' ? 'available filed' : 'disponibles archivadas';
    const noNetworksLabel = LANG==='en' ? 'No networks formed yet.' : 'Aún sin redes formadas.';
    return `<div class="board-panel ${isActive?'active':''}">
        <div class="board-head"><h2>${ST('agency')} ${p+1}</h2><span class="board-score">${score.networksTotal} pts</span></div>
        <div class="grid">${cells}</div>
        <div class="board-note">${score.filled}/${CELLS - Object.keys(state.specialCells[p]).length} ${availLabel}</div>
        <div class="group-breakdown">${breakdown || noNetworksLabel}</div>
      </div>`;
  }).join('');
}

function COLOR_HEX(c){
  return {rojo:'#c9648f',azul:'#3a6ea5',amarillo:'#e0aa2e',verde:'#7cb88f',morado:'#7d5ba6',naranja:'#d97a3e',negro:'#2a2724'}[c];
}
function adjustClearance(delta){
  if(!isMyTurn()) return;
  if(!state.pending.length) return;
  const die = state.pending[0];
  const nv = die.value + delta;
  if(nv<1 || nv>6) return;
  die.value = nv;
  payAbilityCost(state.current, 'adjust_clearance');
  state.abilityMode = null;
  render();
}

function initRulesHelpExamples(){
  document.getElementById('exampleHN').innerHTML = renderDiceCells([
    {r:0,c:0,label:'1',color:'rojo'},{r:0,c:1,label:'2',color:'rojo'},{r:0,c:2,label:'3',color:'rojo'}
  ], 20);
  document.getElementById('exampleSC').innerHTML = renderDiceCells([
    {r:0,c:0,label:'4',color:'rojo'},{r:0,c:1,label:'4',color:'azul'},{r:0,c:2,label:'4',color:'verde'}
  ], 20);
  document.getElementById('exampleChain').innerHTML = renderDiceCells([
    {r:0,c:0,label:'1',color:'azul'},{r:0,c:1,label:'2',color:'verde'},{r:0,c:2,label:'3',color:'morado'},{r:0,c:3,label:'4',color:'naranja'}
  ], 20);
}
