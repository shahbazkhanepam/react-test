import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime(t => t + 10);
      }, 10);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setTime(0);
    setLaps([]);
  };

  const lap = () => {
    setLaps(prev => [...prev, time]);
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
  };

  return (
    <div className="app">
      <h1>Timer</h1>
      <div className="display">{formatTime(time)}</div>
      <div className="controls">
        <button onClick={() => setRunning(r => !r)} className={running ? 'pause' : 'start'}>
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={lap} disabled={!running} className="lap">Lap</button>
        <button onClick={reset} className="reset">Reset</button>
      </div>
      {laps.length > 0 && (
        <ol className="laps">
          {laps.map((t, i) => (
            <li key={i}>
              <span className="lap-num">Lap {i + 1}</span>
              <span className="lap-time">{formatTime(t)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default App;
