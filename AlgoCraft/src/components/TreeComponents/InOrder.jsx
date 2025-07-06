import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import '../../style/Order.css';

const InorderTraversal = ({ root }) => {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [currentNode, setCurrentNode] = useState(null);
  const [sortedNodes, setSortedNodes] = useState([]);
  const [speed, setSpeed] = useState(1000);
  const [isPaused, setIsPaused] = useState(false);

  const algorithmLines = [
    "function Inorder(node) {",
    "  if (node === null) return;",
    "  Inorder(node.left);",
    "  visit(node);",
    "  Inorder(node.right);",
    "}",
  ];

  const generateInorderSteps = (node, newSteps, sortedList) => {
    if (!node) return;

    // Visit left subtree
    newSteps.push({ text: `Traversing left subtree of: ${node.name}`, node, highlight: 2 });
    generateInorderSteps(node.children[0], newSteps, sortedList);
// Backtrack from right
    newSteps.push({ text: `Backtracking to node: ${node.name} from left`, node, highlight: 2, backtrack: true });
  
    // Visit current node
    newSteps.push({ text: `Visiting node: ${node.name}`, node, highlight: 3 });
    sortedList.push(node.name);

    // Visit right subtree
    newSteps.push({ text: `Traversing right subtree of: ${node.name}`, node, highlight: 4 });
    generateInorderSteps(node.children[1], newSteps, sortedList);
  // Backtrack from right
    newSteps.push({ text: `Backtracking to node: ${node.name} from right`, node, highlight: 4, backtrack: true });
  
  };

  const handleClear = () => {
    setSteps([]);                 // Clear traversal steps
    setSortedNodes([]);           // Clear final traversal output
    setCurrentStep(0);            // Reset step counter
    setIsRunning(false);          // Stop traversal if running
    setHighlightedLine(null);     // Remove algorithm highlight
    setCurrentNode(null);         // Reset highlighted node
    setVisitedNodes(new Set());   // Reset visited nodes
    renderTreeD3();               // Re-render tree visualization with reset state
  };

  const handleInorder = () => {
    if (!root) {
      alert("Root node is missing! Please provide a valid tree.");
      return;
    }

    setVisitedNodes(new Set());
    setSteps([]);
    setSortedNodes([]);
    setCurrentStep(0);
    setIsRunning(false);

    let sortedList = [];
    let newSteps = [];
    generateInorderSteps(root, newSteps, sortedList);

    setSteps([...newSteps]);
    setSortedNodes([...sortedList]);
    setIsRunning(true);
    setCurrentStep(0);

    setIsPaused(false);
  };

  // … your existing useEffects …

  // 1) Stepping effect (unchanged)
  useEffect(() => {
    if (!isRunning || isPaused || currentStep >= steps.length) return;

    const timer = setTimeout(() => {
      const step = steps[currentStep];
      setHighlightedLine(step.highlight);
      setCurrentNode(step.node);
      setVisitedNodes(prev => new Set([...prev, step.node.name]));
      setCurrentStep(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isRunning, isPaused, currentStep, steps, speed]);

  // ────────────────────────────────────────────────────────────────
  // 2) “Done” watcher: turn off running when we exhaust the steps
  useEffect(() => {
    if (isRunning && currentStep >= steps.length) {
      setIsRunning(false);
    }
  }, [isRunning, currentStep, steps.length]);


  useEffect(() => {
    renderTreeD3();
  }, [root, visitedNodes, currentNode]);

  const renderTreeD3 = () => {
    d3.select("#tree-container").selectAll("*").remove();
    if (!root) return;

    // Dynamic sizing logic
    function getDepth(node) {
      if (!node.children || node.children.length === 0) return 1;
      return 1 + Math.max(...node.children.map(getDepth));
    }
    function getLeafCount(node) {
      if (!node.children || node.children.length === 0) return 1;
      return node.children.map(getLeafCount).reduce((a, b) => a + b, 0);
    }
    const depth = getDepth(root);
    const leafCount = getLeafCount(root);
    let nodeSpacingX = 90;
    let nodeSpacingY = 100;
    if (leafCount > 10) nodeSpacingX = Math.max(40, 90 - (leafCount - 10) * 3);
    if (depth > 6) nodeSpacingY = Math.max(50, 100 - (depth - 6) * 8);
    const width = Math.max(leafCount * nodeSpacingX, 700);
    const height = Math.max(depth * nodeSpacingY, 400);

    const svg = d3
      .select("#tree-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g").attr("transform", "translate(100, 20)");
    const treeLayout = d3.tree().size([width - 200, height - 100]);
    const rootNode = d3.hierarchy(root);
    const treeData = treeLayout(rootNode);

    g.selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y)
      .style("stroke", "#ccc")
      .style("stroke-width", 2);

    const node = g
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    node
      .append("circle")
      .attr("r", 20)
      .style("fill", (d) => {
        if (isRunning && currentStep < steps.length && d.data === currentNode && steps[currentStep - 1]?.backtrack) {
          return "#F7B801"; // yellow for backtracking
        }
        return visitedNodes.has(d.data.name)
          ? "#A2A4CC"
          : d.data === currentNode
          ? "#634DBA"
          : "#634DBA";
      })
      .style("stroke", (d) =>
        isRunning && currentStep < steps.length && d.data === currentNode && steps[currentStep - 1]?.backtrack ? "#634DBA" : "none"
      )
      .style("stroke-width", (d) =>
        isRunning && currentStep < steps.length && d.data === currentNode && steps[currentStep - 1]?.backtrack ? 2 : 0
      );

    node
      .append("text")
      .attr("dy", 4)
      .attr("text-anchor", "middle")
      .style("fill", "#fff")
      .text((d) => d.data.name);
  };

  return (
    <div className="bfs-container">
      <h1>Inorder Traversal</h1>

      <div
        className="bfs-controls"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          width: '68%'      // ← make it span the whole parent
        }}
      >
        <button
          className="btn startbutton px-4"
          onClick={handleInorder}
          disabled={isRunning}
        >
          {isRunning ? "Running..." : "Start Inorder Traversal"}
        </button>
        <button
          className="btn resetbutton px-4"
          onClick={handleClear}
        >
          Reset
        </button>
        <button
          className="btn startbutton px-4"
          onClick={() => setIsPaused((prev) => !prev)}
          disabled={!isRunning || currentStep >= steps.length}
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>

      <div className="bfs-main">
        <div className="bfs-left">
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
        <div className="bfs-right algo-sidebar-fixed" style={{ position: 'relative', top: '-36px', width: 300, minWidth: 300, maxWidth: 300, background: '#fff', color: '#222', padding: '18px 12px', borderRadius: '12px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <h1 className="clrhead" style={{ fontSize: 22, marginBottom: 12 }}>Algorithm Code</h1>
          <div className="card p-3 pb-2 bfs-card shadow-md" style={{ background: '#fff', color: '#222', borderRadius: 8, marginBottom: 12 }}>
            <pre className="bfs-code">
              {algorithmLines.map((line, idx) => (
                <div key={idx} className={highlightedLine === idx ? 'highlight' : ''}>
                  {highlightedLine === idx && '→ '}
                  <code>{line}</code>
                </div>
              ))}
            </pre>
          </div>
          <div className="bfs-speed-control ms-3" style={{ marginBottom: 10 }}>
            <label htmlFor="speedRange" style={{ marginRight: 8 }}>Speed: {speed} ms</label>
            <input
              id="speedRange"
              type="range"
              min="100"
              max="2000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ minHeight: 32 }}>
            {steps.length > 0 && (
              <div className="sorted-output mt-2" style={{ textAlign: 'left', fontWeight: 500, fontSize: '15px', color: '#6E56CF' }}>
                <span>Final Output is: </span>
                <span style={{ color: '#222', fontWeight: 500 }}>
                  {steps.slice(0, currentStep).filter(s => s.text && s.text.startsWith('Visiting node')).map(s => s.node.name).join(' → ')}
                </span>
              </div>
            )}
          </div>
             {/* Backtracking message below controls */}
      {isRunning && currentStep < steps.length && steps[currentStep - 1]?.backtrack && (
        <div style={{
          margin: '10px 0',
          padding: '8px 16px',
          background: '#FFF8E1',
          color: '#E65100',
          borderRadius: '6px',
          fontWeight: 600,
          fontSize: '16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          {steps[currentStep - 1].text}
        </div>
      )}
        </div>
      </div>

      <div className="steps-container mt-4">
        <h4>Traversal Steps:</h4>
        <ul>
          {steps.slice(0, currentStep).map((step, index) => (
            <li key={index} style={step.backtrack ? { color: '#F7B801', fontWeight: 600 } : {}}>
              <p>{step.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InorderTraversal;
