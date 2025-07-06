// src/pages/GraphForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';  // Import d3 for drag behaviors
import FormLayout from '../components/FormLayout';
import '../style/GraphForm.css';

const GraphForm = () => {
    const [nodesInput, setNodesInput] = useState('');
    const [edgesInput, setEdgesInput] = useState('');
    const [error, setError] = useState('');
    const [graphData, setGraphData] = useState(null);
    const [showGraph, setShowGraph] = useState(false);
    const [isWeighted, setIsWeighted] = useState(false);
    const [isDirected, setIsDirected] = useState(false);
    const navigate = useNavigate();

    // Simple validator for nodes – unchanged
    const validateNodes = (input) => {
        const nodes = input.split(',').map(node => node.trim()).filter(node => node !== '');
        const uniqueNodes = [...new Set(nodes)];
        if (nodes.length === 0 || uniqueNodes.length !== nodes.length) {
            return { valid: false, message: 'Nodes must be unique and non-empty.' };
        }
        return { valid: true, nodes: uniqueNodes };
    };

    /* 
      Updated validateEdges:
      - For unweighted graphs we use: (A,B)
      - For weighted graphs we expect: (A,B,3)
      - In both cases, edges must reference valid nodes.
      (Note: For simplicity directed/undirected flag is not used in the regex.
       Later you can use the isDirected flag in your algorithm logic.)
    */
    const validateEdges = (input, validNodes) => {
        let edgeRegex;
        if (isWeighted) {
            // Expecting three values: from, to and a numeric weight (support decimals)
            edgeRegex = /\(\s*([\w]+)\s*,\s*([\w]+)\s*,\s*([-+]?\d*\.?\d+)\s*\)/g;
        } else {
            edgeRegex = /\(\s*([\w]+)\s*,\s*([\w]+)\s*\)/g;
        }
        let match;
        const edges = [];
        while ((match = edgeRegex.exec(input)) !== null) {
            const from = match[1];
            const to = match[2];
            if (!validNodes.includes(from) || !validNodes.includes(to)) {
                return { valid: false, message: `Edge (${from},${to}) contains a node that does not exist.` };
            }
            if (isWeighted) {
                const weight = parseFloat(match[3]);
                if (isNaN(weight)) {
                    return { valid: false, message: `Edge (${from},${to}) has an invalid weight.` };
                }
                edges.push({ from, to, weight });
            } else {
                edges.push({ from, to });
            }
        }
        if (edges.length === 0) {
            return { valid: false, message: 'Please enter at least one valid edge in the correct format.' };
        }
        return { valid: true, edges };
    };

    // Compute a simple circular layout for nodes
    const computeCircularLayout = (nodes, width = 500, height = 400, radius = 150) => {
        const centerX = width / 2;
        const centerY = height / 2;
        return nodes.map((node, idx) => {
            const angle = (2 * Math.PI * idx) / nodes.length;
            return { id: node, x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
        });
    };

    const handleDefaultValues = () => {
        setNodesInput('A, B, C, D, E');
        // When weighted is on, use weighted format; else use unweighted format.
        setEdgesInput(isWeighted ? '(A,B,5),(B,C,2),(C,D,4),(D,E,3),(E,A,1)' : '(A,B),(B,C),(C,D),(D,E),(E,A)');
        setError('');
        setShowGraph(false);
    };

    const handleShowGraph = () => {
        // Validate nodes
        const nodesValidation = validateNodes(nodesInput);
        if (!nodesValidation.valid) {
            setError(nodesValidation.message);
            setShowGraph(false);
            return;
        }
        // Validate edges using updated logic based on weighted flag
        const edgesValidation = validateEdges(edgesInput, nodesValidation.nodes);
        if (!edgesValidation.valid) {
            setError(edgesValidation.message);
            setShowGraph(false);
            return;
        }
        // Create graph data with positions using a circular layout
        const nodes = computeCircularLayout(nodesValidation.nodes);
        const edges = edgesValidation.edges;
        setGraphData({ nodes, edges, isDirected, isWeighted });
        setError('');
        setShowGraph(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1) Validate nodes
        const nodesValidation = validateNodes(nodesInput);
        if (!nodesValidation.valid) {
            setError(nodesValidation.message);
            return;
        }

        // 2) Validate edges
        const edgesValidation = validateEdges(edgesInput, nodesValidation.nodes);
        if (!edgesValidation.valid) {
            setError(edgesValidation.message);
            return;
        }

        // 3) If user already "Show Graph" (and possibly dragged), reuse that graphData
        //    Otherwise compute a fresh one
        let finalGraph;
        if (graphData) {
            finalGraph = {
                ...graphData,
                edges: edgesValidation.edges,    // keep any drags, but trust updated edges
                isDirected,
                isWeighted
            };
        } else {
            const nodes = computeCircularLayout(nodesValidation.nodes);
            finalGraph = {
                nodes,
                edges: edgesValidation.edges,
                isDirected,
                isWeighted
            };
        }

        // 4) Navigate
        setError('');
        navigate('/graph-visualization', { state: { graphData: finalGraph } });
    };


    // DRAG HANDLERS USING D3:
    const dragstarted = (event, d) => {
        event.sourceEvent.stopPropagation();
    };

    const dragged = (event, d) => {
        const newX = event.x;
        const newY = event.y;
        setGraphData(prevData => {
            const newNodes = prevData.nodes.map(node =>
                node.id === d.id ? { ...node, x: newX, y: newY } : node
            );
            return { ...prevData, nodes: newNodes };
        });
    };

    const dragended = (event, d) => {
        // Nothing extra for now.
    };

    // Attach drag behavior on re-render
    useEffect(() => {
        if (graphData && showGraph) {
            d3.selectAll('.node-group').call(
                d3.drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended)
            );
        }
    }, [graphData, showGraph]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    // Whenever the "Directed" checkbox changes, update our live graphData
    useEffect(() => {
        if (showGraph && graphData) {
            setGraphData(gd => ({
                ...gd,
                isDirected
            }));
        }
    }, [isDirected, showGraph, graphData]);
    return (
        <FormLayout>
            <div className="form-graph-container d-lg-flex mt-3">
                {/* Left side: Input Form */}
                <div className="form-section col-lg-12 ps-4 ms-lg-2">
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-center fw-bold mb-4">Graph Data</h2>
                        <div className="form-group mb-3">
                            <label htmlFor="nodesInput" className="form-label">Enter Nodes (comma-separated):</label>
                            <input
                                type="text"
                                id="nodesInput"
                                className="form-control"
                                placeholder="e.g., A, B, C, D"
                                value={nodesInput}
                                onChange={(e) => setNodesInput(e.target.value)}
                                onBlur={() => {
                                    const result = validateNodes(nodesInput);
                                    if (!result.valid) setError(result.message);
                                    else setError('');
                                }}
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label htmlFor="edgesInput" className="form-label">
                                Enter Edges {isWeighted ? '(format: (A,B,weight)):' : '(format: (A,B)):'}
                            </label>
                            <input
                                type="text"
                                id="edgesInput"
                                className="form-control"
                                placeholder={isWeighted ? "e.g., (A,B,3),(B,C,2)" : "e.g., (A,B),(B,C)"}
                                value={edgesInput}
                                onChange={(e) => setEdgesInput(e.target.value)}
                                onBlur={() => {
                                    const nodesResult = validateNodes(nodesInput);
                                    if (nodesResult.valid) {
                                        const edgesResult = validateEdges(edgesInput, nodesResult.nodes);
                                        if (!edgesResult.valid) setError(edgesResult.message);
                                        else setError('');
                                    }
                                }}
                            />
                        </div>

                        {/* New options: Weighted and Directed checkboxes */}
                        <div className="form-group mb-3">
                            <label className="form-label me-3">Graph Characteristics:</label>
                            <label className="me-3">
                                <input
                                    type="checkbox"
                                    checked={isWeighted}
                                    onChange={(e) => setIsWeighted(e.target.checked)}
                                />{' '}
                                Weighted
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isDirected}
                                    onChange={(e) => setIsDirected(e.target.checked)}
                                />{' '}
                                Directed
                            </label>
                        </div>

                        {error && <small className="text-danger">{error}</small>}

                        <div className="button-group d-flex justify-content-start">
                            <button
                                type="button"
                                className="btn btn-default-values me-2"
                                onClick={handleDefaultValues}
                            >
                                Default Values
                            </button>
                            <button
                                type="button"
                                className="btn btn-show-graph me-2"
                                onClick={handleShowGraph}
                            >
                                Show Graph
                            </button>
                            <button type="submit" className="btn btn-submit">Submit</button>
                        </div>
                    </form>
                </div>

                {/* Right side: Graph Visualization */}
                {showGraph && graphData && (
                    <div className="graph-visualization col-lg-12">
                        <h2 className="text-center fw-bold mb-4 init-visual">Initial Visualization</h2>
                        <svg className="graph-container" width="500" height="400">
                            {/* Define an arrow marker if graph is directed */}
                            <defs>
                                {graphData.isDirected && (
                                    <marker
                                        id="arrowhead"
                                        markerWidth="8"
                                        markerHeight="8"
                                        refX="29"             // increased to 22 so the arrow appears after the node circle
                                        refY="4"
                                        orient="auto"
                                        markerUnits="userSpaceOnUse"  // Using userSpaceOnUse gives more control of position
                                    >
                                        <path d="M0,0 L0,8 L8,4 z" fill="#ccc" />
                                    </marker>
                                )}
                            </defs>


                            {/* Render edges as lines */}
                            {graphData.edges.map((edge, index) => {
                                const fromNode = graphData.nodes.find(node => node.id === edge.from);
                                const toNode = graphData.nodes.find(node => node.id === edge.to);
                                // Calculate edge midpoint for weight labels
                                const midX = (fromNode.x + toNode.x) / 2;
                                const midY = (fromNode.y + toNode.y) / 2;
                                return (
                                    <g key={index}>
                                        <line
                                            x1={fromNode.x}
                                            y1={fromNode.y}
                                            x2={toNode.x}
                                            y2={toNode.y}
                                            className="edge-line"
                                            {...(graphData.isDirected ? { markerEnd: "url(#arrowhead)" } : {})}
                                        />
                                        {graphData.isWeighted && edge.weight !== undefined && (
                                            <text
                                                x={midX}
                                                y={midY - 5}  // Slightly above the edge midpoint
                                                textAnchor="middle"
                                                className="edge-weight"
                                            >
                                                {edge.weight}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}

                            {/* Render nodes as draggable groups */}
                            {graphData.nodes.map((node, index) => (
                                <g
                                    key={index}
                                    className="node-group"
                                    ref={el => { if (el) d3.select(el).datum(node); }}
                                >
                                    <circle cx={node.x} cy={node.y} r="20" className="node-circle" />
                                    <text x={node.x} y={node.y + 5} textAnchor="middle" className="node-text">
                                        {node.id}
                                    </text>
                                </g>
                            ))}
                        </svg>

                    </div>
                )}
            </div>
        </FormLayout>
    );
};

export default GraphForm;
