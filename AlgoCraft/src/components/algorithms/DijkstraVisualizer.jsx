import * as d3 from 'd3';
import React, { useState, useEffect, useRef } from 'react';
import '../../style/bfs.css';  // you can rename this to dfs.css or dijkstra.css

export default function DijkstraVisualizer({ graph, onHighlight }) {
    if (graph.edges.some(e => (e.weight ?? 0) < 0)) {
        return (
            <div style={{ padding: '1rem', color: '#B02A37' }}>
                Dijkstra’s prerequisites not satisfied: all edge weights must be <strong>non‑negative</strong>.
            </div>
        );
    }
    const [startNode, setStartNode] = useState('');
    const [steps, setSteps] = useState([]);
    const [visited, setVisited] = useState([]);
    const [distances, setDistances] = useState({});
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedLine, setHighlightedLine] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    // speed + pause
    const [speed, setSpeed] = useState(800);
    const speedRef = useRef(speed);
    const [isPaused, setIsPaused] = useState(false);
    useEffect(() => { speedRef.current = speed; }, [speed]);

    // refs + helpers
    const logRef = useRef();
    const lastStep = currentStep > 0 ? steps[currentStep - 1] : null;
    const formatStep = s => {
        if (!s) return 'Start to see what is happening...';
        switch (s.type) {
            case 'init': return `Init distances: all ∞`;
            case 'set-start': return `Set ${startNode} = 0`;
            case 'select': return `Select next: ${s.node}`;
            case 'check': return `Check edge ${s.from}→${s.to}`;
            case 'relax': return `Relax ${s.from}→${s.to}, dist[${s.to}] = ${s.newDist}`;
            case 'done': return `Done`;
            default: return '';
        }
    };

    const codeLines = [
        'let distances = {};',
        'let visited = new Set();',
        'for (let n of nodes) distances[n] = Infinity;',
        'distances[start] = 0;',
        'while (visited.size < nodes.length) {',
        '  let u = argmin(distances, visited);',
        '  visited.add(u);',
        '  for (let e of adjacency[u]) {',
        '    let v = e.to;',
        '    let alt = distances[u] + e.weight;',
        '    if (alt < distances[v]) distances[v] = alt;',
        '  }',
        '}'
    ];

    const runDijkstra = (start) => {
        const stepsLog = [];
        // 1) init all distances to ∞
        const dist = {};
        graph.nodes.forEach(n => { dist[n.id] = Infinity; });
        stepsLog.push({ type: 'init', distances: { ...dist }, highlight: 2 });

        // 2) set start = 0
        dist[start] = 0;
        stepsLog.push({ type: 'set-start', distances: { ...dist }, highlight: 3 });

        const visitedSet = new Set();
        const parentMap = {};
        // 3) main loop
        while (visitedSet.size < graph.nodes.length) {
            // pick u = unvisited with min dist
            let u = null, minD = Infinity;
            for (let n of graph.nodes) {
                if (!visitedSet.has(n.id) && dist[n.id] < minD) {
                    minD = dist[n.id];
                    u = n.id;
                }
            }
            if (u === null) break;

            stepsLog.push({ type: 'select', node: u, from: parentMap[u], highlight: 5 });

            visitedSet.add(u);

            // relax each neighbor
            const neighbors = graph.edges
                .filter(e => e.from === u || (!graph.isDirected && e.to === u))
                .map(e => ({
                    from: u,
                    to: e.from === u ? e.to : e.from,
                    weight: e.weight ?? 1
                }));

            for (let { from, to, weight } of neighbors) {
                stepsLog.push({ type: 'check', from, to, highlight: 8 });

                const alt = dist[from] + weight;
                if (alt < dist[to]) {
                    dist[to] = alt;
                    parentMap[to] = from;
                    stepsLog.push({
                        type: 'relax',
                        from,
                        to,
                        newDist: alt,
                        distances: { ...dist },
                        highlight: 10
                    });
                }
            }
        }

        stepsLog.push({ type: 'done', highlight: null });
        setSteps(stepsLog);
        setDistances(stepsLog[0].distances);
        setVisited([]);
        setCurrentStep(0);
        setHighlightedLine(null);
        setIsPaused(false);
        setIsRunning(true);
    };

    const handleStart = () => {
        if (!startNode) return;
        // clear graph highlights
        d3.selectAll('.node-circle')
            .classed('visited-node', false)
            .classed('highlight-node', false);
        d3.selectAll('.edge-line')
            .classed('traversed-edge', false)
            .classed('highlight-edge', false);

        runDijkstra(startNode);
    };
    const handleReset = () => {
        setStartNode('');
        setSteps([]); setVisited([]); setDistances({}); setCurrentStep(0);
        setHighlightedLine(null); setIsRunning(false); setIsPaused(false);
        d3.selectAll('.node-circle')
            .classed('visited-node', false)
            .classed('highlight-node', false);
        d3.selectAll('.edge-line')
            .classed('traversed-edge', false)
            .classed('highlight-edge', false);
    };

    // ─── Single effect: graph highlight, state updates, code highlight, step advance ──────────
    useEffect(() => {
        if (!isRunning || isPaused || currentStep >= steps.length) return;
        const step = steps[currentStep];

        const timer = setTimeout(() => {
            // 1️⃣ clear old flashes
            // (GraphVisualization’s onHighlight will have cleared them.)

            // 2️⃣ graph flash
            if (onHighlight) onHighlight(step);

            // 3️⃣ update visited/distances
            switch (step.type) {
                case 'init':
                case 'set-start':
                case 'relax':
                    setDistances(step.distances);
                    break;
                case 'select':
                    setVisited(v => [...v, step.node]);
                    break;
                default:
                    break;
            }

            // 4️⃣ code line highlight
            setHighlightedLine(step.highlight);

            // 5️⃣ advance step
            setCurrentStep(n => n + 1);
        }, speedRef.current);

        return () => clearTimeout(timer);
    }, [isRunning, isPaused, currentStep, steps.length, speed, onHighlight]);

    // auto‐scroll log
    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [currentStep]);

    return (
        <div className="bfs-container">
            {/* Controls */}
            <div className="bfs-controls">
                <select
                    className="form-select form-select-sm w-auto rounded-pill border-purple"
                    value={startNode}
                    onChange={e => setStartNode(e.target.value)}
                    disabled={isRunning}
                    required
                >
                    <option value="" disabled hidden>Start node</option>
                    {graph.nodes.map(n =>
                        <option key={n.id} value={n.id}>{n.id}</option>
                    )}
                </select>

                <button
                    className="btn startbutton btn-purple px-4 ms-2"
                    onClick={handleStart}
                    disabled={isRunning || !startNode}
                >
                    Start
                </button>

                <button
                    className="btn resetbutton px-4"
                    onClick={handleReset}
                >
                    Reset
                </button>

                <button
                    className="btn startbutton px-4"
                    onClick={() => setIsPaused(p => !p)}
                    disabled={!isRunning || currentStep >= steps.length}
                >
                    {isPaused ? 'Resume' : 'Pause'}
                </button>
            </div>

            {/* Main */}
            <div className="bfs-main">
                {/* Steps Log */}
                <div className="bfs-left">
                    <div ref={logRef} className="bfs-log">
                        <strong>Steps:</strong>
                        <ul className="log-steps">
                            {steps.slice(0, currentStep).map((s, i) =>
                                <li key={i}>{formatStep(s)}</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Code / Slider / State */}
                <div className="bfs-right">
                    <h1 className="clrhead">Algorithm Code</h1>
                    <div
                        className="card p-3 pb-2 shadow-md"
                        style={{
                            minWidth: '35vw',
                            overflowX: 'auto'
                        }}
                    >
                        <pre className="bfs-code">
                            {codeLines.map((line, idx) =>
                                <div key={idx} className={highlightedLine === idx ? 'highlight' : ''}>
                                    {highlightedLine === idx && '→ '}
                                    <code>{line}</code>
                                </div>
                            )}
                        </pre>
                    </div>

                    <div className="bfs-speed-control mb-1">
                        <label htmlFor="speedRange" style={{ marginRight: 8 }}>
                            Speed: {speed} ms
                        </label>
                        <input
                            id="speedRange"
                            type="range"
                            min="100" max="2000" step="100"
                            value={speed}
                            onChange={e => setSpeed(Number(e.target.value))}
                        />
                    </div>

                    <div><strong>Visited:</strong> {visited.join(', ')}</div>
                    <div><strong>Distances:</strong> {
                        Object.entries(distances)
                            .map(([n, d]) => `${n}:${d}`)
                            .join(', ')
                    }</div>

                    <div className="bfs-mini-step mt-2">
                        <strong>{formatStep(lastStep)}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
