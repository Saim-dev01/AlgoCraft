// src/components/algorithms/KruskalVisualizer.jsx
import * as d3 from 'd3';
import React, { useState, useEffect, useRef } from 'react';
import '../../style/bfs.css';

export default function KruskalVisualizer({ graph, onHighlight, onFinish, onReset }) {
    // 1) Prerequisite guard
    if (graph.isDirected || !graph.isWeighted) {
        return (
            <div style={{ padding: '1rem', color: '#B02A37' }}>
                Kruskal’s prerequisites not satisfied: graph must be <strong>undirected</strong> and <strong>weighted</strong>.
            </div>
        );
    }

    // 2) State
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedLine, setHighlightedLine] = useState(null);
    const [inMSTEdges, setInMSTEdges] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [speed, setSpeed] = useState(800);
    const speedRef = useRef(speed);
    useEffect(() => { speedRef.current = speed; }, [speed]);

    const logRef = useRef();
    const lastStep = currentStep > 0 ? steps[currentStep - 1] : null;

    // 3) Pseudocode lines & formatter
    const codeLines = [
        'let parent = {};',
        'for (let n of nodes) parent[n] = n;',
        'edges.sort((a,b) => a.weight - b.weight);',
        'for (let e of edges) {',
        '  if (find(e.from) !== find(e.to)) {',
        '    union(e.from, e.to);',
        '    mst.push(e);',
        '  }',
        '}'
    ];
    const formatStep = s => {
        if (!s) return 'Start to see what is happening...';
        switch (s.type) {
            case 'init-set': return `makeSet(${s.node})`;
            case 'sorted': return `Sorted edges: [${s.sorted.join(', ')}]`;
            case 'check': return `Check edge ${s.from}–${s.to}`;
            case 'add': return `Add edge ${s.from}–${s.to} to MST`;
            case 'skip': return `Skip edge ${s.from}–${s.to} (cycle)`;
            case 'done': return 'Done';
            default: return '';
        }
    };

    // 4) Build steps
    const runKruskal = () => {
        const stepsLog = [];
        const parent = {};
        const find = x => parent[x] === x ? x : (parent[x] = find(parent[x]));
        const union = (a, b) => { parent[find(b)] = find(a); };

        // init‑set
        graph.nodes.forEach(n => {
            parent[n.id] = n.id;
            stepsLog.push({ type: 'init-set', node: n.id, highlight: 1 });
        });

        // sort
        const sorted = graph.edges
            .map((e, i) => ({ ...e, index: i }))
            .sort((a, b) => a.weight - b.weight);
        stepsLog.push({
            type: 'sorted',
            sorted: sorted.map(e => e.index),
            highlight: 2
        });

        // process
        const mst = [];
        for (let { from, to, index } of sorted) {
            // check
            stepsLog.push({ type: 'check', from, to, index, highlight: 4 });

            if (find(from) !== find(to)) {
                union(from, to);
                mst.push(index);
                // add
                stepsLog.push({ type: 'add', from, to, index, highlight: 5 });
            } else {
                // skip
                stepsLog.push({ type: 'skip', from, to, index, highlight: 4 });
            }
        }

        // done
        stepsLog.push({ type: 'done', highlight: null });

        setSteps(stepsLog);
        setInMSTEdges([]);     // start fresh
        setCurrentStep(0);
        setHighlightedLine(null);
        setIsPaused(false);
        setIsRunning(true);
    };

    // 5) Controls
    const handleStart = () => {
        // clear any old highlights
        d3.selectAll('.edge-line')
            .classed('traversed-edge', false)
            .classed('highlight-edge', false);
        runKruskal();
    };
    // const handleReset = () => {
    //     setSteps([]); setCurrentStep(0);
    //     setHighlightedLine(null);
    //     setInMSTEdges([]);
    //     setIsRunning(false);
    //     setIsPaused(false);
    // };
    const handleReset = () => {
        setSteps([]); setCurrentStep(0);
        setHighlightedLine(null); setInMSTEdges([]); setIsRunning(false); setIsPaused(false);
        d3.selectAll('.edge-line')
            .classed('traversed-edge', false)
            .classed('highlight-edge', false);

        // tell the parent to clear its MST‐edge filter
        if (onReset) onReset();
    };


    // 6) Single effect to step through
    useEffect(() => {
        if (!isRunning || isPaused || currentStep >= steps.length) return;
        const step = steps[currentStep];

        const timer = setTimeout(() => {
            // graph flash
            if (onHighlight) onHighlight(step);

            // MST state update
            if (step.type === 'add') {
                setInMSTEdges(arr => [...arr, step.index]);
            }

            // code-line highlight
            setHighlightedLine(step.highlight);

            // advance
            setCurrentStep(n => n + 1);

            // onFinish once done
            if (step.type === 'done' && onFinish) {
                onFinish(inMSTEdges);
            }
        }, speedRef.current);

        return () => clearTimeout(timer);
    }, [
        isRunning, isPaused, currentStep,
        steps.length, speed, onHighlight, onFinish, inMSTEdges
    ]);

    // auto‑scroll log
    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [currentStep]);

    // 7) Render
    return (
        <div className="bfs-container">
            <div className="bfs-controls">
                <button
                    className="btn startbutton btn-purple px-4"
                    onClick={handleStart}
                    disabled={isRunning}
                >Start</button>

                <button
                    className="btn resetbutton px-4"
                    onClick={handleReset}
                >Reset</button>

                <button
                    className="btn startbutton px-4"
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
                            {steps.slice(0, currentStep).map((s, i) =>
                                <li key={i}>{formatStep(s)}</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Code + Slider + MST edges + mini‐step */}
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

                    {/* <div>
                        <strong>MST edges:</strong> {
                            inMSTEdges.map(i => `(${graph.edges[i].from}‑${graph.edges[i].to})`)
                                .join(', ')
                        }
                    </div> */}
                    <div>
                        <strong>MST edges:</strong>{' '}
                        {inMSTEdges
                            .map(i => {
                                const e = graph.edges[i];
                                return e ? `(${e.from}‑${e.to})` : null;
                            })
                            .filter(Boolean)
                            .join(', ')
                        }
                    </div>

                    {/* mini‑step display */}

                    <div className="bfs-mini-step mt-2">
                        <strong>{formatStep(lastStep)}</strong>
                    </div>


                </div>
            </div>
        </div>
    );
}
