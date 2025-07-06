// src/components/algorithms/DFSVisualizer.jsx
import * as d3 from 'd3';
import React, { useState, useEffect, useRef } from 'react';
import '../../style/bfs.css';  

export default function DFSVisualizer({ graph, onHighlight }) {
    const [startNode, setStartNode] = useState('');
    const [steps, setSteps] = useState([]);
    const [visited, setVisited] = useState([]);
    const [stack, setStack] = useState([]);
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
            case 'init': return `Init stack: [${startNode}]`;
            case 'visit': return `Visit ${s.node}`;
            case 'push': return `Push ${s.node}`;
            case 'update-stack': return `Stack ⇒ [${s.stack.join(', ')}]`;
            case 'done': return `Done`;
            default: return '';
        }
    };
    const codeLines = [
        'let stack = [start];',
        'let visited = new Set();',
        'while (stack.length) {',
        '  const node = stack.pop();',
        '  if (!visited.has(node)) {',
        '    visited.add(node);',
        '    for (let nbr of adjacency[node]) {',
        '      if (!visited.has(nbr)) stack.push(nbr);',
        '    }',
        '  }',
        '}'
    ];

    // core DFS builder
    const runDFS = (start) => {
        const stepsLog = [];
        const visitedSet = new Set();
        const discoveredSet = new Set([start]);  // ← NEW
        const parentMap = {};                // ← new

        let stk = [start];
        stepsLog.push({ type: 'init', stack: [...stk], highlight: 0 });

        while (stk.length) {
            const node = stk.pop();
            stepsLog.push({
                type: 'visit',
                node,
                from: parentMap[node],            // ← include where we came from
                highlight: 3
            });

            if (!visitedSet.has(node)) {
                visitedSet.add(node);

                // build neighbor list
                const neighbors = graph.edges
                    .filter(e => e.from === node || (!graph.isDirected && e.to === node))
                    .map(e => e.from === node ? e.to : e.from);

                for (let nbr of neighbors) {
                    if (!visitedSet.has(nbr) && !discoveredSet.has(nbr)) {
                        stk.push(nbr);
                        discoveredSet.add(nbr);
                        parentMap[nbr] = node;
                        stepsLog.push({
                            type: 'push',
                            node: nbr,
                            from: node,                   // ← NEW: let onHighlight know the edge
                            to: nbr,
                            stack: [...stk],
                            highlight: 7
                        });
                    }
                }
                stepsLog.push({
                    type: 'update-stack',
                    stack: [...stk],
                    highlight: 1
                });
            }
        }

        stepsLog.push({ type: 'done', highlight: null });

        setSteps(stepsLog);
        setStack([start]);
        setIsRunning(true);
    };

    // Start / Reset / Pause controls
    const handleStart = () => {
        if (!startNode) return;
        // clear D3 highlights
        d3.selectAll('.node-circle')
            .classed('visited-node', false)
            .classed('highlight-node', false);
        d3.selectAll('.edge-line')
            .classed('traversed-edge', false)
            .classed('highlight-edge', false);

        setVisited([]); setStack([]); setCurrentStep(0);
        setSteps([]); setHighlightedLine(null);
        setIsPaused(false);
        runDFS(startNode);
    };

    const handleReset = () => {
        setStartNode('');
        setSteps([]);
        setVisited([]);
        setStack([]);
        setCurrentStep(0);
        setHighlightedLine(null);
        setIsRunning(false);
        setIsPaused(false);

        d3.selectAll('.node-circle')
            .classed('visited-node', false)
            .classed('highlight-node', false);
        d3.selectAll('.edge-line')
            .classed('traversed-edge', false)
            .classed('highlight-edge', false);
    };

    // single effect: graph highlight, state updates, code highlight, step advance
    useEffect(() => {
        if (!isRunning || isPaused || currentStep >= steps.length) return;
        const step = steps[currentStep];

        const timer = setTimeout(() => {
            // 1️⃣ graph flash
            if (onHighlight) onHighlight(step);

            // 2️⃣ stack / visited updates
            switch (step.type) {
                case 'init':
                case 'push':
                case 'update-stack':
                    setStack(step.stack);
                    break;
                case 'visit':
                    setVisited(v => [...v, step.node]);
                    break;
                default:
                    break;
            }

            // 3️⃣ code line highlight
            setHighlightedLine(step.highlight);

            // 4️⃣ advance
            setCurrentStep(s => s + 1);
        }, speedRef.current);

        return () => clearTimeout(timer);
    }, [isRunning, isPaused, currentStep, steps.length, speed, onHighlight]);

    // auto‑scroll log
    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [currentStep]);

    return (
        <div className="bfs-container">
            <div className="bfs-controls">
                <select
                    className="form-select form-select-sm w-auto rounded-pill border-purple"
                    value={startNode}
                    onChange={e => setStartNode(e.target.value)}
                    disabled={isRunning}
                    required
                >
                    <option value="" disabled hidden>Start node</option>
                    {graph.nodes.map(n => (
                        <option key={n.id} value={n.id}>{n.id}</option>
                    ))}
                </select>

                <button
                    className="btn startbutton btn-purple px-4"
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

            <div className="bfs-main">
                <div className="bfs-left">
                    <div ref={logRef} className="bfs-log">
                        <strong>Steps:</strong>
                        <ul className="log-steps">
                            {steps.slice(0, currentStep).map((s, i) => (
                                <li key={i}>{formatStep(s)}</li>
                            ))}
                        </ul>
                    </div>
                </div>

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
                            {codeLines.map((line, idx) => (
                                <div key={idx} className={highlightedLine === idx ? 'highlight' : ''}>
                                    {highlightedLine === idx && '→ '}
                                    <code>{line}</code>
                                </div>
                            ))}
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
                    <div><strong>Stack:</strong> {stack.join(', ')}</div>
                    <div className="bfs-mini-step mt-2">
                        <strong>{formatStep(lastStep)}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
