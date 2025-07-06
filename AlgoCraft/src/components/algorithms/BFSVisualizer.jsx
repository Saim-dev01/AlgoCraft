// src/components/algorithms/BFSVisualizer.jsx
import * as d3 from 'd3';
import React, { useState, useEffect, useRef } from 'react';
import '../../style/bfs.css';

const BFSVisualizer = ({ graph, onHighlight }) => {
    const [startNode, setStartNode] = useState('');
    const [steps, setSteps] = useState([]);
    const [visited, setVisited] = useState([]);
    const [queue, setQueue] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedLine, setHighlightedLine] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const logRef = useRef();
    const [isPaused, setIsPaused] = useState(false);
    const [speed, setSpeed] = useState(800);    // default 800ms
    const speedRef = useRef(speed);

    // keep speedRef in sync so our timer always reads the latest
    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    // get the latest step object (or null if none run yet)
    const lastStep = currentStep > 0 ? steps[currentStep - 1] : null;

    // helper to render a human‑readable string
    const formatStep = s => {
        if (!s) return 'Start to see what is happening...';
        switch (s.type) {
            case 'init': return `Init queue: [${startNode}]`;
            case 'visit': return `Visit ${s.node}`;
            case 'mark': return `Mark ${s.node}`;
            case 'check': return `Check ${s.to} if visited`;
            case 'enqueue': return `Enqueue ${s.node}`;
            case 'update-queue': return `Queue ⇒ [${s.queue.join(', ')}]`;
            case 'done': return `Done`;
            default: return '';
        }
    };

    const codeLines = [
        'let queue = [start];',
        'let visited = new Set();',
        'while (queue.length) {',
        '  let node = queue.shift();',
        '  visited.add(node);',
        '  for (let nbr of adjacency[node]) {',
        '    if (!visited.has(nbr)) queue.push(nbr);',
        '  }',
        '}'
    ];

    const runBFS = (start) => {
        const stepsLog = [];
        const visitedSet = new Set();           // nodes we’ve actually visited
        const discoveredSet = new Set([start]);  // nodes we’ve enqueued
        const parentMap = {};                  // track who enqueued whom
        const q = [start];

        stepsLog.push({ type: 'init', queue: [...q], highlight: 0 });
        while (q.length) {
            const node = q.shift();
            stepsLog.push({ type: 'visit', node, highlight: 3 });

            if (!visitedSet.has(node)) {
                visitedSet.add(node);
                // now we know “parentMap[node] → node”
                stepsLog.push({
                    type: 'mark',
                    node,
                    from: parentMap[node],   // undefined for the very first
                    to: node,
                    highlight: 4
                });
            }

            // const neighbors = graph.edges
            //     .filter(e => e.from === node)
            //     .map(e => e.to);
            const neighbors = graph.edges
                .filter(e =>
                    e.from === node ||
                    (!graph.isDirected && e.to === node)
                )
                .map(e => (e.from === node ? e.to : e.from));


            for (let nbr of neighbors) {
                stepsLog.push({ type: 'check', from: node, to: nbr, highlight: 6 });
                // only enqueue if never discovered
                if (!discoveredSet.has(nbr)) {
                    discoveredSet.add(nbr);
                    parentMap[nbr] = node;              // remember who discovered nbr
                    q.push(nbr);
                    stepsLog.push({
                        type: 'enqueue',
                        node: nbr,
                        from: node,
                        to: nbr,
                        queue: [...q],
                        highlight: 6
                    });
                }
            }
            stepsLog.push({ type: 'update-queue', queue: [...q], highlight: 1 });
        }
        stepsLog.push({ type: 'done', highlight: null });
        setSteps(stepsLog);
        setIsRunning(true);
    };

    const handleStart = () => {
        if (!graph.nodes.find(n => n.id === startNode)) return;
        d3.selectAll('.node-circle')
            .classed('visited-node', false)
            .classed('highlight-node', false);
        d3.selectAll('.edge-line')
            .classed('traversed-edge', false)
            .classed('highlight-edge', false);

        setVisited([]); setQueue([]); setCurrentStep(0);
        setSteps([]); setHighlightedLine(null); setIsRunning(false);
        setIsPaused(false);
        runBFS(startNode);
    };

    const handleReset = () => {
        setStartNode('');
        setSteps([]);
        setVisited([]);
        setQueue([]);
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

    useEffect(() => {
        if (!isRunning || isPaused || currentStep >= steps.length) return;

        const timer = setTimeout(() => {
            const step = steps[currentStep];

            // 1️⃣ graph highlight
            if (onHighlight) onHighlight(step);

            // 2️⃣ visit/queue updates
            switch (step.type) {
                case 'init':
                case 'update-queue':
                case 'enqueue':
                    setQueue(step.queue);
                    break;
                case 'mark':
                    setVisited(v => [...v, step.node]);
                    break;
                default:
                    break;
            }

            // 3️⃣ code highlight
            setHighlightedLine(step.highlight);

            // 4️⃣ advance step counter
            setCurrentStep(s => s + 1);
        }, speedRef.current);

        return () => clearTimeout(timer);
    }, [isRunning, isPaused, currentStep, steps.length, speed]);


    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [currentStep]);

    return (
        <div className="bfs-container">
            <div
                className="bfs-controls"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    width: '100%'      // ← make it span the whole parent
                }}
            >
                <select
                    className="form-select form-select-sm w-auto rounded-pill border-purple"
                    value={startNode}
                    onChange={e => setStartNode(e.target.value)}
                    disabled={isRunning}
                    required
                >
                    {/* placeholder option */}
                    <option value="" disabled hidden>Start node</option>
                    {graph.nodes.map(n => (
                        <option key={n.id} value={n.id}>{n.id}</option>
                    ))}
                </select>
                <button
                    className="btn startbutton px-4"
                    onClick={handleStart}
                    disabled={isRunning || !startNode}
                >
                    Start
                </button>
                <button
                    className="btn resetbutton px-4 ms-0"
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
                        <ul className='log-steps'>
                            {steps.slice(0, currentStep).map((s, i) => {
                                switch (s.type) {
                                    case 'init': return <li key={i}>Init queue: [{startNode}]</li>;
                                    case 'visit': return <li key={i}>Visit {s.node}</li>;
                                    case 'mark': return <li key={i}>Mark {s.node}</li>;
                                    case 'check': return <li key={i}>Check {s.to} if visited or not</li>;
                                    case 'enqueue': return <li key={i}>Enqueue {s.node}</li>;
                                    case 'update-queue': return <li key={i}>Queue ⇒ [{s.queue.join(', ')}]</li>;
                                    case 'done': return <li key={i}>Done</li>;
                                    default: return null;
                                }
                            })}
                        </ul>
                    </div>
                </div>
                <div className="bfs-right">
                    {/* Heading stays in the same place in the DOM */}
                    <h1 className=" clrhead">Algorithm Code</h1>

                    {/* Card now wraps *only* the <pre> */}
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
                            min="100"
                            max="2000"
                            step="100"
                            value={speed}
                            onChange={e => {
                                console.log("New speed:", e.target.value);  // debug that it’s firing
                                setSpeed(Number(e.target.value));
                            }}
                        />
                    </div>
                    <div><strong>Visited:</strong> {visited.join(', ')}</div>
                    <div><strong>Queue:</strong> {queue.join(', ')}</div>
                    <div className="bfs-mini-step mt-2">
                        <strong>{formatStep(lastStep)}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BFSVisualizer;


