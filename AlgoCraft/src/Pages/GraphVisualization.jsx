// src/pages/GraphVisualization.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as d3 from 'd3';
import BFSVisualizer from '../components/algorithms/BFSVisualizer';
import DFSVisualizer from '../components/algorithms/DFSVisualizer';
import DijkstraVisualizer from '../components/algorithms/DijkstraVisualizer';
import KruskalVisualizer from '../components/algorithms/KruskalVisualizer';
import TopologicalSortVisualizer from '../components/algorithms/TopologicalSortVisualizer';
import '../style/GraphForm.css';

const GraphVisualization = () => {
    const { state } = useLocation();
    const initialData = state?.graphData;

    // Core state
    const [localData, setLocalData] = useState(initialData);
    const [selectedAlgo, setSelectedAlgo] = useState(null);
    const [locked, setLocked] = useState(false);
    // NEW: Remember which nodes and edges have been visited/traversed
    const [visitedNodes, setVisitedNodes] = useState([]);
    const [traversedEdges, setTraversedEdges] = useState([]);
    // NEW: what the algorithm wants to highlight
    const [highlightedNode, setHighlightedNode] = useState(null);
    const [highlightedEdge, setHighlightedEdge] = useState(null);

    // Node modes
    const [deleteNodeMode, setDeleteNodeMode] = useState(false);
    const [addNodeMode, setAddNodeMode] = useState(false);
    const [newNodeId, setNewNodeId] = useState('');

    // Edge modes
    const [addEdgeMode, setAddEdgeMode] = useState(false);
    const [deleteEdgeMode, setDeleteEdgeMode] = useState(false);
    const [newEdgeFrom, setNewEdgeFrom] = useState('');
    const [newEdgeTo, setNewEdgeTo] = useState('');
    const [newEdgeWeight, setNewEdgeWeight] = useState('');
    const [mstEdges, setMstEdges] = useState([]);

    const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

    // keep localData in sync if parent passes new graphData
    useEffect(() => {
        setLocalData(initialData);
        setVisitedNodes([]);
        setTraversedEdges([]);
    }, [initialData]);
    useEffect(() => {
        const handleResize = () => {
            setIsLandscape(window.innerWidth > window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // scroll to top on mount
    useEffect(() => window.scrollTo(0, 0), []);

    // D3 drag handlers
    const dragStarted = (event, d) => event.sourceEvent.stopPropagation();
    const dragged = (event, d) => {
        const [x, y] = [event.x, event.y];
        setLocalData(ld => ({
            ...ld,
            nodes: ld.nodes.map(n => n.id === d.id ? { ...n, x, y } : n)
        }));
    };
    useEffect(() => {
        if (!localData) return;
        const sel = d3.selectAll('.node-group');
        if (!locked) {
            sel.call(d3.drag().on('start', dragStarted).on('drag', dragged));
        } else {
            sel.on('.drag', null);
        }
    }, [localData, locked]);

    if (!localData) {
        return <p style={{ padding: 20 }}>No graph data—go back and submit your graph.</p>;
    }

    // Add Node handler
    const handleAddNode = () => {
        const id = newNodeId.trim();
        if (!id) return;
        setLocalData(ld => {
            if (ld.nodes.some(n => n.id === id)) return ld;
            return {
                ...ld,
                nodes: [...ld.nodes, { id, x: 250, y: 200 }]
            };
        });
        setNewNodeId('');
        setAddNodeMode(false);
    };

    // Delete Node handler
    const handleNodeClick = id => {
        if (!deleteNodeMode || locked) return;
        setLocalData(ld => ({
            ...ld,
            nodes: ld.nodes.filter(n => n.id !== id),
            edges: ld.edges.filter(e => e.from !== id && e.to !== id)
        }));
        setDeleteNodeMode(false);
    };

    // Add Edge handler
    const handleAddEdge = () => {
        if (!newEdgeFrom || !newEdgeTo) return;
        // if (!ld.isDirected) {
        //     return {
        //         ...ld,
        //         edges: [
        //             ...ld.edges,
        //             { from: u, to: v, weight },
        //             { from: v, to: u, weight }
        //         ]
        //     };
        // }
        setLocalData(ld => {
            const exists = ld.edges.some(e =>
                e.from === newEdgeFrom && e.to === newEdgeTo
            );
            if (exists) return ld;
            const weight = ld.isWeighted ? parseFloat(newEdgeWeight) || 0 : undefined;
            return {
                ...ld,
                edges: [...ld.edges, { from: newEdgeFrom, to: newEdgeTo, weight }]
            };
        });
        setNewEdgeFrom('');
        setNewEdgeTo('');
        setNewEdgeWeight('');
        setAddEdgeMode(false);
    };

    // Delete Edge handler
    const handleEdgeClick = idx => {
        if (!deleteEdgeMode || locked) return;
        setLocalData(ld => ({
            ...ld,
            edges: ld.edges.filter((_, i) => i !== idx)
        }));
        setDeleteEdgeMode(false);
    };

    // List of algorithms
    const algoList = [
        { label: 'BFS Traversal', key: 'bfs' },
        { label: 'DFS Traversal', key: 'dfs' },
        { label: 'Dijkstra’s', key: 'dijkstra' },
        { label: 'Kruskal’s', key: 'kruskal' },
        { label: 'Topological Sort (Kahn’s Algorithm)', key: 'topo' }
    ];

    const title = selectedAlgo
        ? algoList.find(a => a.key === selectedAlgo)?.label
        : 'Graph Visualization';

    const isAlgoRunning = Boolean(selectedAlgo);
    const wrapperStyle = {
        width: 460,
        position: 'relative',
        margin: isAlgoRunning ? '0 0 0 20px' : '0 auto',
        // make room for the controls to sit above the graph
        paddingTop: isAlgoRunning ? '1.8rem' : '0'
    };

    return (
        <div>
            {!isLandscape && (
                <div style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    textAlign: 'center',
                    padding: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: '1000',
                }}>
                    <p>Please rotate your screen to landscape mode for a better experience.</p>
                </div>
            )}
            {isLandscape && (
                <div className="container-fluid p-0">
                    <div className="d-flex">
                        {/* Sidebar */}
                        <div className="side-bar p-3" style={{
                            width: 250,
                            minHeight: '100vh',
                            backgroundColor: '#6E56CF',
                            color: '#fff',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            {/* Lock toggle */}
                            <button
                                className="btn btn-outline-light w-100 togglebtn"
                                onClick={() => setLocked(l => !l)}
                            >
                                {locked ? '🔓 Unlock Layout & Edit' : '🔒 Lock Layout & Edit'}
                            </button>

                            {/* Edit Graph */}
                            <h5 style={{ borderBottom: '1px solid #fff', paddingBottom: 4 }}>
                                Edit Graph
                            </h5>
                            <ul className="nav flex-column">
                                <li className="nav-item">
                                    <Link to="/graph-form" className="nav-link sidebar-item" style={{ color: '#fff' }}>
                                        New Graph
                                    </Link>
                                </li>

                                {/* Add Node */}
                                <li className="nav-item">
                                    {addNodeMode ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <input
                                                className="form-control"
                                                type="text"
                                                placeholder="Node ID"
                                                value={newNodeId}
                                                onChange={e => setNewNodeId(e.target.value)}
                                                disabled={locked}
                                            />
                                            <button
                                                className="btn btn-light btn-sm"
                                                onClick={handleAddNode}
                                                disabled={locked}
                                            >
                                                Add
                                            </button>
                                            <button
                                                className="btn btn-outline-light btn-sm"
                                                onClick={() => setAddNodeMode(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <a
                                            className="nav-link sidebar-item"
                                            style={{ color: '#fff', cursor: locked ? 'default' : 'pointer' }}
                                            onClick={() => !locked && setAddNodeMode(true)}
                                        >
                                            Add Node
                                        </a>
                                    )}
                                </li>

                                {/* Delete Node */}
                                <li className="nav-item">
                                    <a
                                        className="nav-link sidebar-item"
                                        style={{ color: '#fff', cursor: locked ? 'default' : 'pointer' }}
                                        onClick={() => !locked && setDeleteNodeMode(true)}
                                    >
                                        Delete Node
                                    </a>
                                    {deleteNodeMode && (
                                        <div style={{ fontSize: 14, marginTop: 6, paddingLeft: 10 }}>
                                            Click a node to delete it
                                            <div>
                                                <button
                                                    className="btn btn-outline-light btn-sm mt-1"
                                                    onClick={() => setDeleteNodeMode(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </li>

                                {/* Add Edge */}
                                <li className="nav-item">
                                    {addEdgeMode ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <select
                                                className="form-select"
                                                value={newEdgeFrom}
                                                onChange={e => setNewEdgeFrom(e.target.value)}
                                                disabled={locked}
                                            >
                                                <option value="">From</option>
                                                {localData.nodes.map(n => (
                                                    <option key={n.id} value={n.id}>{n.id}</option>
                                                ))}
                                            </select>
                                            <select
                                                className="form-select"
                                                value={newEdgeTo}
                                                onChange={e => setNewEdgeTo(e.target.value)}
                                                disabled={locked}
                                            >
                                                <option value="">To</option>
                                                {localData.nodes.map(n => (
                                                    <option key={n.id} value={n.id}>{n.id}</option>
                                                ))}
                                            </select>
                                            {localData.isWeighted && (
                                                <input
                                                    className="form-control"
                                                    type="number"
                                                    placeholder="Weight"
                                                    value={newEdgeWeight}
                                                    onChange={e => setNewEdgeWeight(e.target.value)}
                                                    disabled={locked}
                                                />
                                            )}
                                            <button
                                                className="btn btn-light btn-sm"
                                                onClick={handleAddEdge}
                                                disabled={locked || !newEdgeFrom || !newEdgeTo}
                                            >
                                                Add Edge
                                            </button>
                                            <button
                                                className="btn btn-outline-light btn-sm"
                                                onClick={() => setAddEdgeMode(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <a
                                            className="nav-link sidebar-item"
                                            style={{ color: '#fff', cursor: locked ? 'default' : 'pointer' }}
                                            onClick={() => !locked && setAddEdgeMode(true)}
                                        >
                                            Add Edge
                                        </a>
                                    )}
                                </li>

                                {/* Delete Edge */}
                                <li className="nav-item">
                                    <a
                                        className="nav-link sidebar-item"
                                        style={{ color: '#fff', cursor: locked ? 'default' : 'pointer' }}
                                        onClick={() => !locked && setDeleteEdgeMode(true)}
                                    >
                                        Delete Edge
                                    </a>
                                    {deleteEdgeMode && (
                                        <div style={{ fontSize: 14, marginTop: 6, paddingLeft: 10 }}>
                                            Click an edge to delete it
                                            <div>
                                                <button
                                                    className="btn btn-outline-light btn-sm mt-1"
                                                    onClick={() => setDeleteEdgeMode(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </li>

                                {/* Directed Toggle */}
                                <li className="nav-item d-flex align-items-center">
                                    <input
                                        type="checkbox"
                                        disabled={locked}
                                        checked={localData.isDirected}
                                        onChange={() => setLocalData(ld => ({ ...ld, isDirected: !ld.isDirected }))}
                                        id="directed-toggle"
                                    />
                                    <label
                                        htmlFor="directed-toggle"
                                        className="ms-1"
                                        style={{ cursor: locked ? 'not-allowed' : 'pointer', fontSize: 18 }}
                                    >
                                        Directed
                                    </label>
                                </li>
                            </ul>

                            <h5 style={{ borderBottom: '1px solid #fff', paddingBottom: 4 }}>Algorithms</h5>
                            <ul className="nav flex-column">
                                {algoList.map(({ label, key }) => (
                                    <li className="nav-item" key={key}>
                                        <a
                                            className="nav-link sidebar-item"
                                            style={{
                                                color: '#fff',
                                                cursor: 'pointer',
                                                backgroundColor: selectedAlgo === key ? '#495057' : 'transparent'
                                            }}
                                            onClick={() => setSelectedAlgo(key)}
                                        >
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Main content */}
                        <div className="flex-grow-1 text-center p-4 pt-0">
                            <h2 className="fw-bold dynamic-heading">{title}</h2>
                            {/* Graph SVG */}
                            <div className="main-visualizer" style={wrapperStyle}>
                                {/* keep your svg exactly the same */}
                                <svg className="graph-container mt-4" width="460" height="380">
                                    <defs>
                                        {localData.isDirected && (
                                            <marker
                                                id="arrowhead"
                                                markerWidth="8"
                                                markerHeight="8"
                                                refX="29"
                                                refY="4"
                                                orient="auto"
                                                markerUnits="userSpaceOnUse"
                                            >
                                                <path d="M0,0 L0,8 L8,4 z" fill="#ccc" />
                                            </marker>
                                        )}
                                    </defs>

                                    {/* Edges */}
                                    {localData.edges.map((edge, i) => {
                                        const a = localData.nodes.find(n => n.id === edge.from);
                                        const b = localData.nodes.find(n => n.id === edge.to);
                                        const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
                                        if (
                                            selectedAlgo === 'kruskal' &&
                                            mstEdges.length > 0 &&
                                            !mstEdges.includes(i)
                                        ) {
                                            return null;
                                        }
                                        return (
                                            <g
                                                key={i}
                                                className="edge-group"
                                                onClick={() => handleEdgeClick(i)}
                                                style={{ cursor: deleteEdgeMode ? 'pointer' : 'default' }}
                                            >
                                                <line
                                                    x1={a.x} y1={a.y}
                                                    x2={b.x} y2={b.y}
                                                    className={`edge-line ${traversedEdges.includes(i) ? 'traversed-edge' : ''} ${highlightedEdge === i ? 'highlight-edge' : ''}`}
                                                    {...(localData.isDirected ? { markerEnd: 'url(#arrowhead)' } : {})}
                                                />
                                                {localData.isWeighted && (
                                                    <text
                                                        x={midX}
                                                        y={midY - 5}
                                                        textAnchor="middle"
                                                        className="edge-weight"
                                                    >
                                                        {edge.weight}
                                                    </text>
                                                )}
                                            </g>
                                        );
                                    })}

                                    {/* Nodes */}
                                    {localData.nodes.map((node, i) => (
                                        <g
                                            key={i}
                                            className="node-group"
                                            ref={el => el && d3.select(el).datum(node)}
                                            onClick={() => handleNodeClick(node.id)}
                                            style={{ cursor: locked ? 'not-allowed' : 'pointer' }}
                                        // style={{ cursor: 'pointer' }}
                                        // style={{ cursor: deleteNodeMode ? 'pointer' : 'default' }}
                                        >
                                            <circle
                                                cx={node.x} cy={node.y} r="20"
                                                className={`node-circle ${visitedNodes.includes(node.id) ? 'visited-node' : ''} ${highlightedNode === node.id ? 'highlight-node' : ''}`}
                                            />
                                            <text x={node.x} y={node.y + 5} textAnchor="middle" className="node-text">
                                                {node.id}
                                            </text>
                                        </g>
                                    ))}
                                </svg>

                                {/* and still render your BFSVisualizer here */}
                                {selectedAlgo === 'bfs' && (
                                    <BFSVisualizer
                                        graph={localData}
                                        onHighlight={step => {
                                            // 1️⃣ clear any old flash
                                            setHighlightedEdge(null);
                                            setHighlightedNode(null);

                                            // 2️⃣ “peek” at the neighbour we’re checking
                                            if (step.type === 'check' && step.to) {
                                                setHighlightedNode(step.to);
                                            }

                                            // 3️⃣ once we actually mark a node, stick that edge highlight
                                            if (step.type === 'mark') {
                                                // persist the node
                                                setVisitedNodes(v =>
                                                    v.includes(step.node) ? v : [...v, step.node]
                                                );
                                                // flash the node
                                                setHighlightedNode(step.node);

                                                // find & persist the parent-edge
                                                const idx = localData.edges.findIndex(e =>
                                                    (e.from === step.from && e.to === step.to) ||
                                                    (!localData.isDirected && e.from === step.to && e.to === step.from)
                                                );
                                                if (idx >= 0) {
                                                    setTraversedEdges(te =>
                                                        te.includes(idx) ? te : [...te, idx]
                                                    );
                                                    // flash the edge once
                                                    setHighlightedEdge(idx);
                                                }
                                            }
                                        }}
                                    />
                                )}

                                {selectedAlgo === 'dfs' && (
                                    <DFSVisualizer
                                        graph={localData}
                                        onHighlight={step => {
                                            // 1️⃣ clear any old flashes
                                            setHighlightedEdge(null);
                                            setHighlightedNode(null);

                                            // 2️⃣ on discovery (push): flicker the node only
                                            if (step.type === 'push') {
                                                setHighlightedNode(step.node);
                                            }
                                            // 3️⃣ on actual visit: flicker node + highlight edge
                                            if (step.type === 'visit') {
                                                setHighlightedNode(step.node);
                                                if (step.from != null) {
                                                    const idx = localData.edges.findIndex(e =>
                                                        (e.from === step.from && e.to === step.node) ||
                                                        (!localData.isDirected && e.from === step.node && e.to === step.from)
                                                    );
                                                    if (idx >= 0) {
                                                        // persist that edge as “traversed” so it stays colored
                                                        setTraversedEdges(te => te.includes(idx) ? te : [...te, idx]);
                                                        // flash it
                                                        setHighlightedEdge(idx);
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                )}

                                {/* Dijkstra */}
                                {selectedAlgo === 'dijkstra' && (
                                    <DijkstraVisualizer
                                        graph={localData}
                                        onHighlight={step => {
                                            // clear
                                            setHighlightedNode(null);
                                            setHighlightedEdge(null);

                                            // on check: flicker the neighbor only
                                            if (step.type === 'check') {
                                                setHighlightedNode(step.to);
                                            }
                                            // on relax: flicker the neighbor only
                                            if (step.type === 'relax') {
                                                setHighlightedNode(step.to);
                                            }
                                            // selecting u
                                            // on select: flicker the node AND highlight its parent edge
                                            if (step.type === 'select') {
                                                setHighlightedNode(step.node);
                                                if (step.from != null) {
                                                    const idx = localData.edges.findIndex(e =>
                                                        (e.from === step.from && e.to === step.node) ||
                                                        (!localData.isDirected && e.from === step.node && e.to === step.from)
                                                    );
                                                    if (idx >= 0) {
                                                        setTraversedEdges(te => te.includes(idx) ? te : [...te, idx]);
                                                        setHighlightedEdge(idx);
                                                    }
                                                }
                                            }
                                            // highlight edge on relax
                                            if (step.type === 'relax' && step.from != null) {
                                                const idx = localData.edges.findIndex(e =>
                                                    (e.from === step.from && e.to === step.to) ||
                                                    (!localData.isDirected && e.from === step.to && e.to === step.from)
                                                );
                                                if (idx >= 0) {
                                                    setTraversedEdges(te => te.includes(idx) ? te : [...te, idx]);
                                                    setHighlightedEdge(idx);
                                                }
                                            }
                                        }}
                                    />
                                )}

                                {selectedAlgo === 'kruskal' && (
                                    <KruskalVisualizer
                                        graph={localData}
                                        onHighlight={step => {
                                            // clear previous
                                            setHighlightedEdge(null);
                                            setHighlightedNode(null);

                                            // flicker on check
                                            if (step.type === 'check') {
                                                setHighlightedEdge(step.index);
                                            }
                                            // persist on add
                                            if (step.type === 'add') {
                                                setTraversedEdges(te =>
                                                    te.includes(step.index) ? te : [...te, step.index]
                                                );
                                            }
                                        }}
                                        onFinish={mstEdges => setMstEdges(mstEdges)}
                                        onReset={() => setMstEdges([])}
                                    />
                                )}
                                {selectedAlgo === 'topo' && (
                                    <TopologicalSortVisualizer
                                        graph={localData}
                                        onHighlight={step => {
                                            // clear old highlights
                                            setHighlightedNode(null);
                                            setHighlightedEdge(null);

                                            // on dequeue/append: flicker that node
                                            if (step.type === 'dequeue' || step.type === 'append') {
                                                setHighlightedNode(step.node);
                                            }
                                            // on inc-indegree/dec-indegree: flicker edge -> node
                                            if (step.type === 'inc-indegree' || step.type === 'dec-indegree') {
                                                setHighlightedNode(step.to);
                                            }
                                        }}
                                    />
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GraphVisualization;
