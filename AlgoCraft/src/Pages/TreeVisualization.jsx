import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import * as d3 from "d3";
import MinValue from "../components/TreeComponents/MinNode";
import FindMaxNode from "../components/TreeComponents/MaxNode";
import DFSVisualization from "../components/TreeComponents/DFS";
import BFSVisualization from "../components/TreeComponents/BFS";
import InorderTraversal from "../components/TreeComponents/InOrder";
import PreorderTraversal from "../components/TreeComponents/PreOrder";
import PostorderTraversal from "../components/TreeComponents/PostOrder";
import RemoveNode from "../components/TreeComponents/RemoveTreeNode";
import AddNode from "../components/TreeComponents/AddTreeNode";
import "../style/TreeForm.css";

import "../style/MinNode.css";
import { saveUserSession } from '../utils/userSessions';


const TreeVisualization = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Support both navigation from form and from history reuse
  const initialTree = location.state?.treeData || location.state?.tree || {};
  const initialAlgo = location.state?.algorithm || "";

  // State variables
  const [treeData, setTreeData] = useState(initialTree);
  const [activeComponent, setActiveComponent] = useState(initialAlgo); // Track active component
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  useEffect(() => {
    if (treeData && Object.keys(treeData).length > 0) {
      renderTree(treeData);
    }
  }, [treeData]);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderTree = (data) => {
    d3.select('#tree-container').selectAll('*').remove();
    if (!data || !data.name) return;

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

    const svg = d3.select('#tree-container')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('display', 'flex')
      .style('max-width', '100%')
      .style('max-height', '100%');

    const g = svg.append('g')
      .attr('transform', 'translate(100,20)');

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

    const node = g.selectAll('.node')
      .data(nodes.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    node.append('circle')
      .attr('r', 20)
      .style('fill', '#634DBA');

    node.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .style('fill', '#fff')
      .text((d) => d.data.name);
  };


  // Save session when a tree algorithm is selected
  const handleComponentChange = (component) => {
    setActiveComponent(component);
    // Only save if it's an algorithm (not add/remove)
    const algoLabels = [
      "MinNode", "MaxNode", "DFS", "BFS", "Inorder", "Preorder", "Postorder"
    ];
    if (algoLabels.includes(component)) {
      saveUserSession(
        component,
        { tree: treeData },
        null,
        null,
        ''
      );
    }
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
            <div className="side-bar p-2" style={{
              width: '250px',
              minHeight: '100vh',
              //minWidth: '17vw',
              backgroundColor: '#6E56CF',
              color: '#fff',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}>
              <ul className="nav flex-column">
                <h5 className="border-bottom pb-2 mt-3">Modify Trees</h5>
                <li className="nav-item">
                  <Link className="nav-link sidebar-item" to="/tree-form">New Tree</Link>
                </li>

                {/* Add Node Button */}
                <li className="nav-item">
                  <a
                    className="nav-link sidebar-item"
                    onClick={() => handleComponentChange("AddNode")}
                    style={{ cursor: 'pointer' }}
                  >
                    Add Node
                  </a>
                </li>

                {/* Remove Node Button */}
                <li className="nav-item">
                  <a
                    className="nav-link sidebar-item"
                    onClick={() => handleComponentChange("RemoveNode")}
                    style={{ cursor: 'pointer' }}
                  >
                    Remove Node
                  </a>
                </li>

                <h5 className="border-bottom pb-2 mt-2">Searching</h5>
                <li className="nav-item">
                  <a className="nav-link sidebar-item" onClick={() => handleComponentChange("MinNode")} style={{ cursor: 'pointer' }}>
                    Minimum Node
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link sidebar-item" onClick={() => handleComponentChange("MaxNode")} style={{ cursor: 'pointer' }}>
                    Maximum Node
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link sidebar-item" onClick={() => handleComponentChange("DFS")} style={{ cursor: 'pointer' }}>
                    Depth First Search
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link sidebar-item" onClick={() => handleComponentChange("BFS")} style={{ cursor: 'pointer' }}>
                    Breadth First Search
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link sidebar-item" onClick={() => handleComponentChange("Inorder")} style={{ cursor: 'pointer' }}>
                    Inorder Traversal
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link sidebar-item" onClick={() => handleComponentChange("Preorder")} style={{ cursor: 'pointer' }}>
                    Preorder Traversal
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link sidebar-item" onClick={() => handleComponentChange("Postorder")} style={{ cursor: 'pointer' }}>
                    Postorder Traversal
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex-grow-1 p-3">
              <div className="text-center">
                {activeComponent === "MinNode" && <MinValue root={treeData} />}
                {activeComponent === "MaxNode" && <FindMaxNode root={treeData} />}
                {activeComponent === "DFS" && <DFSVisualization root={treeData} />}
                {activeComponent === "BFS" && <BFSVisualization root={treeData} />}
                {activeComponent === "Inorder" && <InorderTraversal root={treeData} />}
                {activeComponent === "Preorder" && <PreorderTraversal root={treeData} />}
                {activeComponent === "Postorder" && <PostorderTraversal root={treeData} />}
                {activeComponent === "AddNode" && <AddNode treeData={treeData} onTreeUpdate={setTreeData} />}
                {activeComponent === "RemoveNode" && <RemoveNode treeData={treeData} onTreeUpdate={setTreeData} />}

                {activeComponent === "" && (
                  <div>
                    <h1 className="fw-bold">Tree Visualization</h1>
                    <div
                      id="tree-container"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "start",
                        minHeight: "300px",
                        padding: "1rem",
                        overflowX: "auto"
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeVisualization;
