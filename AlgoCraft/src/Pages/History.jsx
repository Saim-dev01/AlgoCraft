import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserSessions } from '../utils/userSessions';
import { Spinner, Table, Alert, Button } from 'react-bootstrap';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { collection, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const [historyEnabled, setHistoryEnabled] = useState(() => {
    const stored = localStorage.getItem('algocraft-history-enabled');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true);
      setError('');
      try {
        let data = await getUserSessions();
        // Filter out login/logout sessions
        data = data.filter(s => s.algorithm !== 'login' && s.algorithm !== 'logout');
        setSessions(data);
      } catch (err) {
        setError('Failed to load history. Please try again.');
      }
      setLoading(false);
    }
    if (historyEnabled) fetchSessions();
    else setSessions([]);
  }, [deleting, historyEnabled]);

  const handleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selected.length === sessions.length) {
      setSelected([]);
    } else {
      setSelected(sessions.map(s => s.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    setDeleting(true);
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const batch = writeBatch(db);
    selected.forEach(id => {
      batch.delete(doc(db, 'algocraft', user.uid, 'sessions', id));
    });
    await batch.commit();
    setSelected([]);
    setDeleting(false);
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all history?')) return;
    setDeleting(true);
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const batch = writeBatch(db);
    sessions.forEach(s => {
      batch.delete(doc(db, 'algocraft', user.uid, 'sessions', s.id));
    });
    await batch.commit();
    setSelected([]);
    setDeleting(false);
  };

  const handleHistoryToggle = () => {
    setHistoryEnabled((prev) => {
      localStorage.setItem('algocraft-history-enabled', !prev);
      return !prev;
    });
  };

  const handleReuse = (session) => {
    // Determine which visualizer to use based on session data
    if (session.inputParams?.array) {
      // Array visualizer
      navigate('/visualization', {
        state: {
          array: session.inputParams?.array || [],
          algorithm: session.algorithm,
          value: session.inputParams?.value
        }
      });
    } else if (session.inputParams?.graph) {
      // Graph visualizer
      navigate('/graph-visualization', {
        state: {
          graph: session.inputParams.graph,
          algorithm: session.algorithm,
          inputParams: session.inputParams
        }
      });
    } else if (session.inputParams?.tree) {
      // Tree visualizer
      navigate('/tree-visualization', {
        state: {
          tree: session.inputParams.tree,
          algorithm: session.algorithm,
          inputParams: session.inputParams
        }
      });
    } else if (session.inputParams?.list) {
      // Linked list visualizer
      navigate('/llvisualizaion', {
        state: {
          list: session.inputParams.list,
          algorithm: session.algorithm,
          inputParams: session.inputParams
        }
      });
    } else {
      // Fallback: array visualizer
      navigate('/visualization', {
        state: {
          array: session.inputParams?.array || [],
          algorithm: session.algorithm,
          value: session.inputParams?.value
        }
      });
    }
  };

  return (
    <motion.div
      className="container mt-5"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      style={{ position: 'relative' }}
    >
      <motion.h2
        className="mb-4 text-center fw-bold"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{ color: 'black', letterSpacing: 1 }}
      >
        Your Algorithm History
      </motion.h2>
      <motion.div
        className="d-flex justify-content-end mb-3 gap-2"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Button
          variant={historyEnabled ? 'outline-secondary' : 'success'}
          onClick={handleHistoryToggle}
          style={{ fontWeight: 600, borderRadius: 8 }}
        >
          {historyEnabled ? 'Turn Off History' : 'Turn On History'}
        </Button>
        <Button variant="danger" onClick={handleDeleteSelected} disabled={selected.length === 0 || deleting || !historyEnabled} style={{ fontWeight: 600, borderRadius: 8 }}>
          Delete Selected
        </Button>
        <Button variant="outline-danger" onClick={handleDeleteAll} disabled={sessions.length === 0 || deleting || !historyEnabled} style={{ fontWeight: 600, borderRadius: 8 }}>
          Delete All
        </Button>
      </motion.div>
      <AnimatePresence>
        {loading && (
          <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Spinner animation="border" />
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Alert variant="danger">{error}</Alert>
          </motion.div>
        )}
        {!loading && !error && sessions.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Alert variant="info" className="text-center" style={{ fontWeight: 500, fontSize: '1.1rem', borderRadius: 10, background: '#f3f0ff', color: '#6E56CF' }}>
              No history found. Try running an algorithm!
            </Alert>
          </motion.div>
        )}
        {!loading && !error && sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Table striped bordered hover responsive className="align-middle" style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(110,86,207,0.07)' }}>
              <thead className="table-primary" style={{ background: '#6E56CF', color: '#fff', fontWeight: 700, fontSize: '1.08rem' }}>
                <tr>
                  <th><input type="checkbox" checked={selected.length === sessions.length && sessions.length > 0} onChange={handleSelectAll} /></th>
                  <th>#</th>
                  <th>Algorithm</th>
                  <th>Input</th>
                  <th>Parameter</th>
                  <th>Date</th>
                  <th>Reuse</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, idx) => (
                  <motion.tr
                    key={session.id}
                    className={selected.includes(session.id) ? 'table-danger' : ''}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: idx * 0.04, duration: 0.4 }}
                    style={{ background: selected.includes(session.id) ? '#ffe3e3' : 'inherit', transition: 'background 0.2s' }}
                  >
                    <td>
                      <input type="checkbox" checked={selected.includes(session.id)} onChange={() => handleSelect(session.id)} />
                    </td>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: 'black' }}>{session.algorithm}</td>
                    <td>
                      <pre style={{ margin: 0, fontSize: '0.95em', background: 'none', border: 'none', color: 'black', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {session.inputParams?.array ? JSON.stringify(session.inputParams.array)
                          : session.inputParams?.graph ? JSON.stringify(session.inputParams.graph)
                          : session.inputParams?.tree ? JSON.stringify(session.inputParams.tree)
                          : session.inputParams?.list ? JSON.stringify(session.inputParams.list)
                          : '-'}
                      </pre>
                    </td>
                    <td>
                      {session.inputParams?.value !== undefined ? session.inputParams.value : '-'}
                    </td>
                    <td>{session.timestamp && session.timestamp.toDate ? session.timestamp.toDate().toLocaleString() : ''}</td>
                    <td>
                      <motion.div whileHover={{ scale: 1.13 }} whileTap={{ scale: 0.93 }}>
                        <Button size="sm"  className="btn-start-visualizing" style={{ fontWeight: 600, borderRadius: 7, letterSpacing: 0.5, }} onClick={() => handleReuse(session)}>
                          Reuse
                        </Button>
                      </motion.div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </Table>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default History;
