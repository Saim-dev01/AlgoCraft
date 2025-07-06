import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import '../../style/TreeForm.css';
import '../../style/LinearSearch.css';
import '../../style/Order.css';

const AddNode = ({ treeData, onTreeUpdate }) => {
  const [currentTreeData, setCurrentTreeData] = useState(treeData);
  const [valueToAdd, setValueToAdd] = useState("");
  const [traversalPath, setTraversalPath] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [speed, setSpeed] = useState(1000);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nodeExists = (node, value) => {
    if (!node) return false;
    if (node.name === value) return true;
    return nodeExists(node.children[0] || null, value) || nodeExists(node.children[1] || null, value);
  };

  const addNodeWithSteps = (node, value, path = []) => {
    if (!node) return { newTree: { name: value, children: [] }, path };

    path.push(node.name);
    if (value < node.name) {
      const { newTree, path: newPath } = addNodeWithSteps(node.children[0] || null, value, path);
      return {
        newTree: { ...node, children: [newTree, node.children[1] || null].filter(Boolean) },
        path: newPath,
      };
    } else if (value > node.name) {
      const { newTree, path: newPath } = addNodeWithSteps(node.children[1] || null, value, path);
      return {
        newTree: { ...node, children: [node.children[0] || null, newTree].filter(Boolean) },
        path: newPath,
      };
    }

    return { newTree: node, path };
  };

  const startAdding = () => {
    if (!valueToAdd.trim()) return;
    const value = parseInt(valueToAdd, 10);
    if (isNaN(value)) return;

    if (nodeExists(currentTreeData, value)) {
      setMessage(`Node ${value} already exists!`);
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    const { newTree, path } = addNodeWithSteps(currentTreeData, value);
    setTraversalPath(path);
    setStepIndex(0);
    setMessage(`Traversing tree to insert ${value}...`);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev + 1 === path.length) {
          clearInterval(stepInterval);
          setTimeout(() => {
            setMessage(`Node ${value} added successfully!`);
            setCurrentTreeData(newTree);
            onTreeUpdate(newTree);
            setTraversalPath([]);
            setStepIndex(0);
          }, speed);
        }
        return prev + 1;
      });
    }, speed);

    setValueToAdd("");
  };

  const renderTree = (data) => {
    d3.select('#tree-container').selectAll('*').remove();

    if (!data || !data.name) {
      console.error('Invalid tree data:', data);
      return;
    }

    // Dynamic sizing logic for large trees
    function getDepth(node) {
      if (!node.children || node.children.length === 0) return 1;
      return 1 + Math.max(...node.children.map(getDepth));
    }
    function getLeafCount(node) {
      if (!node.children || node.children.length === 0) return 1;
      return node.children.map(getLeafCount).reduce((a, b) => a + b, 0);
    }
    const depth = getDepth(data);
    const leafCount = getLeafCount(data);
    let nodeSpacingX = 90;
    let nodeSpacingY = 100;
    if (leafCount > 10) nodeSpacingX = Math.max(40, 90 - (leafCount - 10) * 3);
    if (depth > 6) nodeSpacingY = Math.max(50, 100 - (depth - 6) * 8);
    const width = Math.max(leafCount * nodeSpacingX, 700);
    const height = Math.max(depth * nodeSpacingY, 400);

    const treeLayout = d3.tree().size([width - 200, height - 100]);
    const root = d3.hierarchy(data);
    const nodes = treeLayout(root);

    // Create the SVG element with dynamic size
    const svg = d3.select('#tree-container')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('display', 'flex')
      .style('max-width', '100%')
      .style('max-height', '100%');

    // Center horizontally: translate to (width / 2 - (width - 200) / 2, 20)
    const g = svg.append('g')
      .attr('transform', `translate(${(width - (width - 200)) / 2},20)`);

    // Add links (edges between nodes)
    g.selectAll('.link')
      .data(nodes.links())
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
      .style('stroke', '#ccc')
      .style('stroke-width', 2);

    // Add nodes (vertices)
    const node = g.selectAll('.node')
      .data(nodes.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    node.append('circle')
      .attr('r', 20)
      .style('fill', (d) =>
        traversalPath.slice(0, stepIndex).includes(d.data.name) ? '#A2A4CC' : '#634DBA'
      );

    node.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .style('fill', '#fff')
      .text((d) => d.data.name);
  };

  useEffect(() => {
    if (currentTreeData) renderTree(currentTreeData);
  }, [currentTreeData, traversalPath, stepIndex]);

  return (
    <div className="bfs-container">
      <h1>Add Node Visualization</h1>
      <div
        className="bfs-controls"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          width: '68%'       // ← make it span the whole parent
        }}
      >
        <input
          type="number"
          placeholder="Enter value"
          value={valueToAdd}
          onChange={(e) => setValueToAdd(e.target.value)}
          style={{ padding: "8px", fontSize: "16px", width: "150px", marginRight: 8 }}
        />
        <button
          className="btn startbutton px-4"
          onClick={startAdding}
        >
          Add Node
        </button>
        <button
          className="btn resetbutton px-4"
          onClick={() => {
            setCurrentTreeData(treeData);
            setTraversalPath([]);
            setMessage("");
          }}
          
        >
          Reset
        </button>
      </div>
      {message && (
        <div style={{
          textAlign: "center",
          fontSize: "18px",
          marginBottom: "10px",
          color: "red",
          fontWeight: "bold"
        }}>
          {message}
        </div>
      )}
      <div className="bfs-main" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
        <div className="bfs-left" style={{ flex: 1 }}>
          <div
            id="tree-container"
            className="visualization-container"
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              background: '#fff',
              borderRadius: '8px',
              width: '100%',
              height: '100%',
              minHeight: '300px',
              boxSizing: 'border-box'
            }}
          ></div>
        </div>
        <div className="bfs-right algo-sidebar-fixed" style={{ position: 'relative', top: '-33px', width: 300, minWidth: 300, maxWidth: 300, background: '#fff', color: '#222', padding: '18px 12px', borderRadius: '12px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <h1 className="clrhead" style={{ fontSize: 22, marginBottom: 12 }}>Traversal Steps</h1>
          <div className="card p-3 pb-2 bfs-card shadow-md" style={{ background: '#fff' }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 300, overflowY: "auto" }}>
              {traversalPath.map((node, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                    fontSize: "16px",
                    backgroundColor:
                      idx < stepIndex
                        ? "#d4edda"
                        : idx === stepIndex
                        ? "#fff3cd"
                        : "transparent",
                    fontWeight: idx === stepIndex ? "bold" : "normal",
                    color: idx < stepIndex ? "#155724" : "inherit"
                  }}
                >
                  Visit Node {node}
                </li>
              ))}
            </ul>
          </div>
          <div className="bfs-speed-control ms-3">
            <label htmlFor="speedRange" style={{ marginRight: 8 }}>Speed: {speed} ms</label>
            <input
              id="speedRange"
              type="range"
              min="100"
              max="2000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNode;
