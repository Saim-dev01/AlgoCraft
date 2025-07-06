// src/components/algorithms/TopologicalSortVisualizer.jsx
import * as d3 from 'd3';
import React, { useState, useEffect, useRef } from 'react';
import '../../style/bfs.css';

export default function TopologicalSortVisualizer({ graph, onHighlight }) {
    // Prerequisite: must be directed
    if (!graph.isDirected) {
        return (
            <div style={{ padding: '1rem', color: '#B02A37' }}>
                Topological Sort only works on <strong>directed</strong> graphs.
            </div>
        );
    }

    // State
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedLine, setHighlightedLine] = useState(null);
    const [result, setResult] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [speed, setSpeed] = useState(800);
    const speedRef = useRef(speed);
    useEffect(() => { speedRef.current = speed; }, [speed]);

    const logRef = useRef();
    const lastStep = currentStep > 0 ? steps[currentStep - 1] : null;

    // Pseudocode for display
    const codeLines = [
        'let indegree = {};',
        'for (let n of nodes) indegree[n] = 0;',
        'for (let e of edges) indegree[e.to]++;',
        'let queue = [];',
        'for (let n of nodes) {',
        '  if (indegree[n] === 0) queue.push(n);',
        '}',
        'let result = [];',
        'while (queue.length) {',
        '  let u = queue.shift();',
        '  result.push(u);',
        '  for (let v of adjacency[u]) {',
        '    indegree[v]--;',
        '    if (indegree[v] === 0) queue.push(v);',
        '  }',
        '}'
    ];
    const formatStep = s => {
        if (!s) return 'Start to see what is happening...';
        switch (s.type) {
            case 'init-indegree': return `Init indegree: ${JSON.stringify(s.indegree)}`;
            case 'inc-indegree': return `inc indegree[${s.to}] → ${s.newIndegree}`;
            case 'init-queue': return `Enqueue initial: [${s.queue.join(', ')}]`;
            case 'dequeue': return `Dequeue ${s.node}`;
            case 'append': return `Append to result: ${s.node}`;
            case 'dec-indegree': return `dec indegree[${s.to}] → ${s.newIndegree}`;
            case 'enqueue': return `Enqueue ${s.to}`;
            case 'cycle-detected': return 'Cycle detected—topological sort not possible';
            case 'done': return `Done, result = [${s.result.join(', ')}]`;
            default: return '';
        }
    };

    // Build steps
    const runTopo = () => {
        const stepsLog = [];
        const indegree = {};
        graph.nodes.forEach(n => indegree[n.id] = 0);
        stepsLog.push({ type: 'init-indegree', indegree: { ...indegree }, highlight: 0 });

        graph.edges.forEach(e => {
            indegree[e.to]++;
            stepsLog.push({
                type: 'inc-indegree',
                to: e.to,
                newIndegree: indegree[e.to],
                highlight: 2
            });
        });

        const queue = [];
        graph.nodes.forEach(n => {
            if (indegree[n.id] === 0) queue.push(n.id);
        });
        stepsLog.push({ type: 'init-queue', queue: [...queue], highlight: 3 });

        const res = [];
        const adj = graph.nodes.reduce((a, n) => {
            a[n.id] = [];
            return a;
        }, {});
        graph.edges.forEach(e => {
            adj[e.from].push(e.to);
        });

        while (queue.length) {
            const u = queue.shift();
            stepsLog.push({ type: 'dequeue', node: u, highlight: 9 });

            res.push(u);
            stepsLog.push({ type: 'append', node: u, highlight: 10 });

            for (let v of adj[u]) {
                indegree[v]--;
                stepsLog.push({
                    type: 'dec-indegree',
                    to: v,
                    newIndegree: indegree[v],
                    highlight: 12
                });
                if (indegree[v] === 0) {
                    queue.push(v);
                    stepsLog.push({
                        type: 'enqueue',
                        to: v,
                        queue: [...queue],
                        highlight: 13
                    });
                }
            }
        }
        // cycle check: did we process every node?
        if (res.length !== graph.nodes.length) {
            stepsLog.push({ type: 'cycle-detected', highlight: null });
            setSteps(stepsLog);
            setResult(res);
            setCurrentStep(0);
            setHighlightedLine(null);
            setIsPaused(false);
            setIsRunning(true);
            return;
        }
        stepsLog.push({ type: 'done', result: res, highlight: null });
        setSteps(stepsLog);
        setResult([]);
        setCurrentStep(0);
        setHighlightedLine(null);
        setIsPaused(false);
        setIsRunning(true);
    };

    // Controls
    const handleStart = () => {
        d3.selectAll('.node-circle').classed('highlight-node', false);
        d3.selectAll('.edge-line').classed('highlight-edge', false);
        setSteps([]); setResult([]); setCurrentStep(0); setHighlightedLine(null);
        runTopo();
    };
    const handleReset = () => {
        setSteps([]); setResult([]); setCurrentStep(0);
        setHighlightedLine(null); setIsRunning(false); setIsPaused(false);
    };

    // Single effect
    useEffect(() => {
        if (!isRunning || isPaused || currentStep >= steps.length) return;
        const step = steps[currentStep];
        const timer = setTimeout(() => {
            if (onHighlight) onHighlight(step);

            // state updates
            // New: only push when you hit the append step
            switch (step.type) {
                case 'append':
                    setResult(r => [...r, step.node]);
                    break;
                default:
                    break;
            }

            setHighlightedLine(step.highlight);
            setCurrentStep(n => n + 1);
        }, speedRef.current);

        return () => clearTimeout(timer);
    }, [isRunning, isPaused, currentStep, steps.length, speed, onHighlight]);

    // Scroll log
    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [currentStep]);

    return (
        <div className="bfs-container">
            <div className="bfs-controls">
                <button className="btn startbutton btn-purple px-4" onClick={handleStart} disabled={isRunning}>
                    Start
                </button>
                <button className="btn startbutton px-4 ms-2" onClick={handleReset}>
                    Reset
                </button>
                <button
                    className="btn startbutton px-4 ms-2"
                    onClick={() => setIsPaused(p => !p)}
                    disabled={!isRunning || currentStep >= steps.length}
                >
                    {isPaused ? 'Resume' : 'Pause'}
                </button>
            </div>

            <div className="bfs-main">
                {/* Steps log */}
                <div className="bfs-left">
                    <div ref={logRef} className="bfs-log">
                        <strong>Steps:</strong>
                        <ul className="log-steps">
                            {steps.slice(0, currentStep).map((s, i) => <li key={i}>{formatStep(s)}</li>)}
                        </ul>
                    </div>
                </div>
                {/* Code + Slider + Result + Mini-step */}
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
                                    {highlightedLine === idx && '→ '}<code>{line}</code>
                                </div>
                            )}
                        </pre>
                    </div>
                    <div className="bfs-speed-control mb-1">
                        <label htmlFor="speedRange" style={{ marginRight: 8 }}>Speed: {speed} ms</label>
                        <input
                            id="speedRange"
                            type="range"
                            min="100" max="2000" step="100"
                            value={speed}
                            onChange={e => setSpeed(Number(e.target.value))}
                        />
                    </div>
                    <div><strong>Result:</strong> [{result.join(', ')}]</div>
                    <div className="bfs-mini-step mt-2">
                        <strong>{formatStep(lastStep)}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
