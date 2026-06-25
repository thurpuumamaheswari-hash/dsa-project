// ==================== SHARED TYPES ====================

export interface TreeNodeLayout {
  value: number;
  label: string;
  x: number;
  y: number;
}

export interface AVLNodeLayout extends TreeNodeLayout {
  balanceFactor: number;
  height: number;
}

export interface TreeEdge {
  x1: number; y1: number;
  x2: number; y2: number;
}

export interface TreeLayout {
  nodes: TreeNodeLayout[];
  edges: TreeEdge[];
  svgWidth: number;
  svgHeight: number;
}

export interface AVLTreeLayout {
  nodes: AVLNodeLayout[];
  edges: TreeEdge[];
  svgWidth: number;
  svgHeight: number;
}

// ==================== BST ====================

class BSTNodeInternal {
  value: number;
  label: string;
  left: BSTNodeInternal | null = null;
  right: BSTNodeInternal | null = null;
  constructor(v: number, l: string) { this.value = v; this.label = l; }
}

export class BST {
  root: BSTNodeInternal | null = null;

  insert(value: number, label: string = `P-${value}`): void {
    const node = new BSTNodeInternal(value, label);
    if (!this.root) { this.root = node; return; }
    let curr = this.root;
    while (true) {
      if (value < curr.value) {
        if (!curr.left) { curr.left = node; return; }
        curr = curr.left;
      } else if (value > curr.value) {
        if (!curr.right) { curr.right = node; return; }
        curr = curr.right;
      } else return;
    }
  }

  delete(value: number): void { this.root = this._del(this.root, value); }

  private _del(n: BSTNodeInternal | null, v: number): BSTNodeInternal | null {
    if (!n) return null;
    if (v < n.value) n.left = this._del(n.left, v);
    else if (v > n.value) n.right = this._del(n.right, v);
    else {
      if (!n.left) return n.right;
      if (!n.right) return n.left;
      let min = n.right;
      while (min.left) min = min.left;
      n.value = min.value; n.label = min.label;
      n.right = this._del(n.right, min.value);
    }
    return n;
  }

  search(value: number): boolean {
    let c = this.root;
    while (c) { if (c.value === value) return true; c = value < c.value ? c.left : c.right; }
    return false;
  }

  inorder(): { value: number; label: string }[] {
    const r: { value: number; label: string }[] = [];
    const go = (n: BSTNodeInternal | null) => { if (!n) return; go(n.left); r.push({ value: n.value, label: n.label }); go(n.right); };
    go(this.root); return r;
  }

  preorder(): { value: number; label: string }[] {
    const r: { value: number; label: string }[] = [];
    const go = (n: BSTNodeInternal | null) => { if (!n) return; r.push({ value: n.value, label: n.label }); go(n.left); go(n.right); };
    go(this.root); return r;
  }

  postorder(): { value: number; label: string }[] {
    const r: { value: number; label: string }[] = [];
    const go = (n: BSTNodeInternal | null) => { if (!n) return; go(n.left); go(n.right); r.push({ value: n.value, label: n.label }); };
    go(this.root); return r;
  }

  size(): number {
    let c = 0;
    const go = (n: BSTNodeInternal | null) => { if (!n) return; c++; go(n.left); go(n.right); };
    go(this.root); return c;
  }

  getLayout(svgWidth = 760): TreeLayout {
    const nodes: TreeNodeLayout[] = [];
    const edges: TreeEdge[] = [];
    const lh = 80;
    let idx = 0;
    const idxMap = new Map<BSTNodeInternal, number>();
    const inord = (n: BSTNodeInternal | null) => { if (!n) return; inord(n.left); idxMap.set(n, idx++); inord(n.right); };
    inord(this.root);
    const total = idx;
    if (total === 0) return { nodes: [], edges: [], svgWidth, svgHeight: 100 };
    let maxD = 0;
    const posMap = new Map<BSTNodeInternal, { x: number; y: number }>();
    const trav = (n: BSTNodeInternal | null, d: number, par: BSTNodeInternal | null) => {
      if (!n) return;
      const x = ((idxMap.get(n)! + 0.5) / total) * (svgWidth - 40) + 20;
      const y = d * lh + 40;
      maxD = Math.max(maxD, d);
      posMap.set(n, { x, y });
      nodes.push({ value: n.value, label: n.label, x, y });
      if (par) { const p = posMap.get(par)!; edges.push({ x1: p.x, y1: p.y, x2: x, y2: y }); }
      trav(n.left, d + 1, n); trav(n.right, d + 1, n);
    };
    trav(this.root, 0, null);
    return { nodes, edges, svgWidth, svgHeight: (maxD + 1) * lh + 60 };
  }
}

// ==================== AVL TREE ====================

class AVLNodeInternal {
  value: number; label: string;
  left: AVLNodeInternal | null = null;
  right: AVLNodeInternal | null = null;
  height = 1;
  constructor(v: number, l: string) { this.value = v; this.label = l; }
}

const ah = (n: AVLNodeInternal | null) => n ? n.height : 0;
const abf = (n: AVLNodeInternal) => ah(n.left) - ah(n.right);
const auh = (n: AVLNodeInternal) => { n.height = 1 + Math.max(ah(n.left), ah(n.right)); };
const arr = (y: AVLNodeInternal): AVLNodeInternal => {
  const x = y.left!; const t = x.right; x.right = y; y.left = t; auh(y); auh(x); return x;
};
const arl = (x: AVLNodeInternal): AVLNodeInternal => {
  const y = x.right!; const t = y.left; y.left = x; x.right = t; auh(x); auh(y); return y;
};
const abal = (n: AVLNodeInternal): AVLNodeInternal => {
  auh(n); const bf = abf(n);
  if (bf > 1) { if (n.left && abf(n.left) < 0) n.left = arl(n.left); return arr(n); }
  if (bf < -1) { if (n.right && abf(n.right) > 0) n.right = arr(n.right); return arl(n); }
  return n;
};

export class AVLTree {
  root: AVLNodeInternal | null = null;

  insert(value: number, label = `W-${value}`): void { this.root = this._ins(this.root, value, label); }
  private _ins(n: AVLNodeInternal | null, v: number, l: string): AVLNodeInternal {
    if (!n) return new AVLNodeInternal(v, l);
    if (v < n.value) n.left = this._ins(n.left, v, l);
    else if (v > n.value) n.right = this._ins(n.right, v, l);
    else return n;
    return abal(n);
  }

  delete(value: number): void { this.root = this._del(this.root, value); }
  private _del(n: AVLNodeInternal | null, v: number): AVLNodeInternal | null {
    if (!n) return null;
    if (v < n.value) n.left = this._del(n.left, v);
    else if (v > n.value) n.right = this._del(n.right, v);
    else {
      if (!n.left) return n.right;
      if (!n.right) return n.left;
      let min = n.right; while (min.left) min = min.left;
      n.value = min.value; n.label = min.label;
      n.right = this._del(n.right, min.value);
    }
    return abal(n);
  }

  search(value: number): boolean {
    let c = this.root;
    while (c) { if (c.value === value) return true; c = value < c.value ? c.left : c.right; }
    return false;
  }

  size(): number {
    let c = 0;
    const go = (n: AVLNodeInternal | null) => { if (!n) return; c++; go(n.left); go(n.right); };
    go(this.root); return c;
  }

  getLayout(svgWidth = 760): AVLTreeLayout {
    const nodes: AVLNodeLayout[] = [];
    const edges: TreeEdge[] = [];
    const lh = 90;
    let idx = 0;
    const idxMap = new Map<AVLNodeInternal, number>();
    const inord = (n: AVLNodeInternal | null) => { if (!n) return; inord(n.left); idxMap.set(n, idx++); inord(n.right); };
    inord(this.root);
    const total = idx;
    if (total === 0) return { nodes: [], edges: [], svgWidth, svgHeight: 100 };
    let maxD = 0;
    const posMap = new Map<AVLNodeInternal, { x: number; y: number }>();
    const trav = (n: AVLNodeInternal | null, d: number, par: AVLNodeInternal | null) => {
      if (!n) return;
      const x = ((idxMap.get(n)! + 0.5) / total) * (svgWidth - 40) + 20;
      const y = d * lh + 45;
      maxD = Math.max(maxD, d);
      posMap.set(n, { x, y });
      nodes.push({ value: n.value, label: n.label, x, y, balanceFactor: abf(n), height: n.height });
      if (par) { const p = posMap.get(par)!; edges.push({ x1: p.x, y1: p.y, x2: x, y2: y }); }
      trav(n.left, d + 1, n); trav(n.right, d + 1, n);
    };
    trav(this.root, 0, null);
    return { nodes, edges, svgWidth, svgHeight: (maxD + 1) * lh + 60 };
  }
}

// ==================== GRAPH ====================

export interface GraphNode { id: string; label: string; x: number; y: number; type: 'reservoir' | 'pump' | 'treatment' | 'distribution'; }
export interface GraphEdge { id: string; from: string; to: string; weight: number; capacity: number; }

export const GRAPH_NODES: GraphNode[] = [
  { id: 'R1', label: 'Main Reservoir', x: 380, y: 55, type: 'reservoir' },
  { id: 'R2', label: 'North Station', x: 160, y: 185, type: 'pump' },
  { id: 'R3', label: 'East Pumping', x: 600, y: 185, type: 'pump' },
  { id: 'R4', label: 'West District', x: 75, y: 340, type: 'distribution' },
  { id: 'R5', label: 'Central Hub', x: 330, y: 320, type: 'pump' },
  { id: 'R6', label: 'Industrial', x: 580, y: 335, type: 'distribution' },
  { id: 'R7', label: 'Residential A', x: 115, y: 490, type: 'distribution' },
  { id: 'R8', label: 'Residential B', x: 420, y: 470, type: 'distribution' },
  { id: 'R9', label: 'Treatment Plant', x: 660, y: 470, type: 'treatment' },
];

export const GRAPH_EDGES: GraphEdge[] = [
  { id: 'e1', from: 'R1', to: 'R2', weight: 12, capacity: 800 },
  { id: 'e2', from: 'R1', to: 'R3', weight: 8, capacity: 1000 },
  { id: 'e3', from: 'R2', to: 'R4', weight: 15, capacity: 400 },
  { id: 'e4', from: 'R2', to: 'R5', weight: 10, capacity: 600 },
  { id: 'e5', from: 'R3', to: 'R5', weight: 6, capacity: 700 },
  { id: 'e6', from: 'R3', to: 'R6', weight: 9, capacity: 900 },
  { id: 'e7', from: 'R4', to: 'R7', weight: 7, capacity: 300 },
  { id: 'e8', from: 'R5', to: 'R7', weight: 11, capacity: 400 },
  { id: 'e9', from: 'R5', to: 'R8', weight: 5, capacity: 500 },
  { id: 'e10', from: 'R6', to: 'R8', weight: 13, capacity: 600 },
  { id: 'e11', from: 'R6', to: 'R9', weight: 4, capacity: 800 },
  { id: 'e12', from: 'R8', to: 'R9', weight: 8, capacity: 400 },
];

export interface TraversalStep { visited: string[]; current: string; queue: string[]; description: string; }

function buildAdj(): Record<string, string[]> {
  const adj: Record<string, string[]> = {};
  GRAPH_NODES.forEach(n => { adj[n.id] = []; });
  GRAPH_EDGES.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from); });
  return adj;
}

export function bfsSteps(startId: string): TraversalStep[] {
  const steps: TraversalStep[] = [];
  const adj = buildAdj();
  const visited = new Set<string>();
  const queue = [startId];
  visited.add(startId);
  while (queue.length > 0) {
    const curr = queue.shift()!;
    steps.push({ visited: [...visited], current: curr, queue: [...queue], description: `Visiting ${GRAPH_NODES.find(n => n.id === curr)?.label}` });
    for (const nb of (adj[curr] || []).sort()) {
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
    }
  }
  return steps;
}

export function dfsSteps(startId: string): TraversalStep[] {
  const steps: TraversalStep[] = [];
  const adj = buildAdj();
  const visited = new Set<string>();
  const dfs = (id: string) => {
    visited.add(id);
    steps.push({ visited: [...visited], current: id, queue: [], description: `Visiting ${GRAPH_NODES.find(n => n.id === id)?.label}` });
    for (const nb of (adj[id] || []).sort()) { if (!visited.has(nb)) dfs(nb); }
  };
  dfs(startId); return steps;
}

export interface DijkstraStep { distances: Record<string, number>; previous: Record<string, string | null>; visited: string[]; current: string; description: string; }

export function dijkstraSteps(startId: string): DijkstraStep[] {
  const steps: DijkstraStep[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  GRAPH_NODES.forEach(n => { dist[n.id] = Infinity; prev[n.id] = null; });
  dist[startId] = 0;
  const unvis = new Set(GRAPH_NODES.map(n => n.id));
  while (unvis.size > 0) {
    let curr: string | null = null; let minD = Infinity;
    unvis.forEach(id => { if (dist[id] < minD) { minD = dist[id]; curr = id; } });
    if (!curr || dist[curr] === Infinity) break;
    unvis.delete(curr); visited.add(curr);
    steps.push({ distances: { ...dist }, previous: { ...prev }, visited: [...visited], current: curr, description: `Processing ${GRAPH_NODES.find(n => n.id === curr)?.label} (d=${dist[curr!]})` });
    GRAPH_EDGES.forEach(e => {
      let nb: string | null = null;
      if (e.from === curr) nb = e.to;
      else if (e.to === curr) nb = e.from;
      if (nb && !visited.has(nb)) {
        const nd = dist[curr!] + e.weight;
        if (nd < dist[nb]) { dist[nb] = nd; prev[nb] = curr; }
      }
    });
  }
  return steps;
}

export function getPath(prev: Record<string, string | null>, end: string): string[] {
  const path: string[] = []; let c: string | null = end;
  while (c) { path.unshift(c); c = prev[c]; }
  return path;
}

export interface MSTStep { inMST: string[]; edges: { from: string; to: string; weight: number }[]; totalCost: number; description: string; }

export function primMSTSteps(): MSTStep[] {
  const steps: MSTStep[] = [];
  const inMST = new Set<string>(['R1']);
  const mstEdges: { from: string; to: string; weight: number }[] = [];
  let totalCost = 0;
  while (inMST.size < GRAPH_NODES.length) {
    let best: { from: string; to: string; weight: number } | null = null;
    GRAPH_EDGES.forEach(e => {
      const fi = inMST.has(e.from), ti = inMST.has(e.to);
      if (fi !== ti) {
        const w = e.weight;
        if (!best || w < best.weight) best = { from: fi ? e.from : e.to, to: fi ? e.to : e.from, weight: w };
      }
    });
    if (!best) break;
    const b = best as { from: string; to: string; weight: number };
    inMST.add(b.to); mstEdges.push(b); totalCost += b.weight;
    steps.push({ inMST: [...inMST], edges: [...mstEdges], totalCost, description: `Added ${GRAPH_NODES.find(n => n.id === b.to)?.label} (w=${b.weight})` });
  }
  return steps;
}

// ==================== SORTING ====================

export interface SortStep { array: number[]; comparing: number[]; swapping: number[]; sorted: number[]; description: string; }

export function mergeSortSteps(init: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...init];
  const sortedSet = new Set<number>();
  function merge(a: number[], l: number, m: number, r: number) {
    const L = a.slice(l, m + 1), R = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < L.length && j < R.length) {
      steps.push({ array: [...a], comparing: [l + i, m + 1 + j], swapping: [], sorted: [...sortedSet], description: `Comparing ${L[i]} ↔ ${R[j]}` });
      if (L[i] <= R[j]) a[k++] = L[i++]; else a[k++] = R[j++];
    }
    while (i < L.length) a[k++] = L[i++];
    while (j < R.length) a[k++] = R[j++];
    for (let x = l; x <= r; x++) sortedSet.add(x);
  }
  function ms(a: number[], l: number, r: number) {
    if (l >= r) return; const m = Math.floor((l + r) / 2);
    ms(a, l, m); ms(a, m + 1, r); merge(a, l, m, r);
  }
  ms(arr, 0, arr.length - 1);
  steps.push({ array: [...arr], comparing: [], swapping: [], sorted: arr.map((_, i) => i), description: 'Merge Sort complete!' });
  return steps;
}

export function quickSortSteps(init: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...init];
  const sortedSet = new Set<number>();
  function partition(a: number[], lo: number, hi: number) {
    const pivot = a[hi]; let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      steps.push({ array: [...a], comparing: [j, hi], swapping: [], sorted: [...sortedSet], description: `Compare ${a[j]} vs pivot ${pivot}` });
      if (a[j] <= pivot) { i++; [a[i], a[j]] = [a[j], a[i]]; steps.push({ array: [...a], comparing: [], swapping: [i, j], sorted: [...sortedSet], description: `Swap ${a[i]} ↔ ${a[j]}` }); }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]]; sortedSet.add(i + 1);
    steps.push({ array: [...a], comparing: [], swapping: [i + 1, hi], sorted: [...sortedSet], description: `Pivot ${pivot} → pos ${i + 1}` });
    return i + 1;
  }
  function qs(a: number[], lo: number, hi: number) {
    if (lo < hi) { const p = partition(a, lo, hi); qs(a, lo, p - 1); qs(a, p + 1, hi); }
  }
  qs(arr, 0, arr.length - 1);
  steps.push({ array: [...arr], comparing: [], swapping: [], sorted: arr.map((_, i) => i), description: 'Quick Sort complete!' });
  return steps;
}

export function heapSortSteps(init: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...init]; const n = arr.length;
  const sortedSet = new Set<number>();
  function heapify(a: number[], size: number, i: number) {
    let largest = i; const l = 2 * i + 1, r = 2 * i + 2;
    if (l < size) { steps.push({ array: [...a], comparing: [i, l], swapping: [], sorted: [...sortedSet], description: `Heapify: compare ${a[i]} vs ${a[l]}` }); if (a[l] > a[largest]) largest = l; }
    if (r < size) { steps.push({ array: [...a], comparing: [largest, r], swapping: [], sorted: [...sortedSet], description: `Heapify: compare ${a[largest]} vs ${a[r]}` }); if (a[r] > a[largest]) largest = r; }
    if (largest !== i) { [a[i], a[largest]] = [a[largest], a[i]]; steps.push({ array: [...a], comparing: [], swapping: [i, largest], sorted: [...sortedSet], description: `Swap ${a[i]} ↔ ${a[largest]}` }); heapify(a, size, largest); }
  }
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]]; sortedSet.add(i);
    steps.push({ array: [...arr], comparing: [], swapping: [0, i], sorted: [...sortedSet], description: `Place max ${arr[i]} at pos ${i}` });
    heapify(arr, i, 0);
  }
  steps.push({ array: [...arr], comparing: [], swapping: [], sorted: arr.map((_, i) => i), description: 'Heap Sort complete!' });
  return steps;
}

export function countingSortSteps(init: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...init];
  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);
  for (let i = 0; i < arr.length; i++) { count[arr[i]]++; steps.push({ array: [...arr], comparing: [i], swapping: [], sorted: [], description: `Count ${arr[i]}: count[${arr[i]}]=${count[arr[i]]}` }); }
  for (let i = 1; i <= max; i++) count[i] += count[i - 1];
  const output = new Array(arr.length).fill(0);
  for (let i = arr.length - 1; i >= 0; i--) { output[--count[arr[i]]] = arr[i]; steps.push({ array: output.map(v => v || 0), comparing: [], swapping: [i], sorted: [], description: `Place ${arr[i]} at pos ${count[arr[i]]}` }); }
  steps.push({ array: [...output], comparing: [], swapping: [], sorted: output.map((_, i) => i), description: 'Counting Sort complete!' });
  return steps;
}

// ==================== DYNAMIC PROGRAMMING ====================

export interface Activity { id: string; name: string; start: number; end: number; priority: string; resource: string; }
export interface KnapsackItem { id: string; name: string; cost: number; benefit: number; weight: number; }

export function activitySelection(activities: Activity[]): Activity[] {
  const sorted = [...activities].sort((a, b) => a.end - b.end);
  const result: Activity[] = []; let lastEnd = -1;
  for (const act of sorted) { if (act.start >= lastEnd) { result.push(act); lastEnd = act.end; } }
  return result;
}

export function knapsack(items: KnapsackItem[], budget: number): { selected: KnapsackItem[]; totalBenefit: number; totalCost: number } {
  const n = items.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(budget + 1).fill(0));
  for (let i = 1; i <= n; i++) for (let w = 0; w <= budget; w++) {
    dp[i][w] = dp[i - 1][w];
    if (items[i - 1].weight <= w) dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - items[i - 1].weight] + items[i - 1].benefit);
  }
  const selected: KnapsackItem[] = []; let w = budget;
  for (let i = n; i > 0; i--) if (dp[i][w] !== dp[i - 1][w]) { selected.push(items[i - 1]); w -= items[i - 1].weight; }
  return { selected, totalBenefit: dp[n][budget], totalCost: selected.reduce((s, it) => s + it.cost, 0) };
}

export function lis(seq: number[]): { length: number; subsequence: number[]; indices: number[] } {
  const n = seq.length;
  const dp = new Array(n).fill(1), parent = new Array(n).fill(-1);
  for (let i = 1; i < n; i++) for (let j = 0; j < i; j++) if (seq[j] < seq[i] && dp[j] + 1 > dp[i]) { dp[i] = dp[j] + 1; parent[i] = j; }
  let maxLen = 0, end = 0;
  for (let i = 0; i < n; i++) if (dp[i] > maxLen) { maxLen = dp[i]; end = i; }
  const indices: number[] = []; let c = end;
  while (c !== -1) { indices.unshift(c); c = parent[c]; }
  return { length: maxLen, subsequence: indices.map(i => seq[i]), indices };
}
