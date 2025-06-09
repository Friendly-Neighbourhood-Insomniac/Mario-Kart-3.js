import { useGameStore } from "./store";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Vector3 } from "three";

export const LapSystem = () => {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0, z: 0 });
  const [speed, setSpeedDisplay] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedCheckpoints, setRecordedCheckpoints] = useState([]);
  const lastRecordTime = useRef(0);

  useFrame(() => {
    const playerPosition = useGameStore.getState().playerPosition;
    const currentSpeed = useGameStore.getState().speed;
    
    if (playerPosition) {
      setCoordinates({
        x: Math.round(playerPosition.x * 100) / 100,
        y: Math.round(playerPosition.y * 100) / 100,
        z: Math.round(playerPosition.z * 100) / 100
      });
    }
    
    if (currentSpeed !== null) {
      setSpeedDisplay(Math.round(currentSpeed * 10) / 10);
    }
  });

  const recordCheckpoint = () => {
    const now = Date.now();
    // Prevent spam clicking (minimum 1 second between recordings)
    if (now - lastRecordTime.current < 1000) return;
    
    lastRecordTime.current = now;
    const newCheckpoint = {
      id: recordedCheckpoints.length + 1,
      x: coordinates.x,
      y: coordinates.y,
      z: coordinates.z,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setRecordedCheckpoints(prev => [...prev, newCheckpoint]);
  };

  const clearCheckpoints = () => {
    setRecordedCheckpoints([]);
  };

  const exportCheckpoints = () => {
    const checkpointData = {
      checkpoints: recordedCheckpoints,
      totalCheckpoints: recordedCheckpoints.length,
      exportTime: new Date().toISOString()
    };
    
    console.log("🏁 Checkpoint Data:", JSON.stringify(checkpointData, null, 2));
    
    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(checkpointData, null, 2))
      .then(() => console.log("📋 Checkpoint data copied to clipboard!"))
      .catch(err => console.error("Failed to copy:", err));
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      fontFamily: 'monospace',
      fontSize: '14px',
      zIndex: 1000,
      minWidth: '300px',
      border: '2px solid #ff6b00'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#ff6b00' }}>🏁 LAP SYSTEM DEBUG</h3>
      
      {/* Current Position */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#ffff00' }}>📍 Current Position:</h4>
        <div>X: <span style={{ color: '#00ff00' }}>{coordinates.x}</span></div>
        <div>Y: <span style={{ color: '#00ff00' }}>{coordinates.y}</span></div>
        <div>Z: <span style={{ color: '#00ff00' }}>{coordinates.z}</span></div>
        <div>Speed: <span style={{ color: '#00ffff' }}>{speed}</span></div>
      </div>

      {/* Recording Controls */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#ffff00' }}>🎯 Checkpoint Recording:</h4>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={recordCheckpoint}
            style={{
              background: '#00ff00',
              color: 'black',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📌 Record Point
          </button>
          <button 
            onClick={clearCheckpoints}
            style={{
              background: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🗑️ Clear
          </button>
          <button 
            onClick={exportCheckpoints}
            style={{
              background: '#4444ff',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📤 Export
          </button>
        </div>
        <div style={{ fontSize: '12px', color: '#cccccc' }}>
          Recorded: {recordedCheckpoints.length} checkpoints
        </div>
      </div>

      {/* Recorded Checkpoints List */}
      {recordedCheckpoints.length > 0 && (
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#ffff00' }}>📋 Recorded Checkpoints:</h4>
          {recordedCheckpoints.map((checkpoint, index) => (
            <div key={checkpoint.id} style={{ 
              fontSize: '12px', 
              marginBottom: '5px',
              padding: '5px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px'
            }}>
              <strong>#{checkpoint.id}</strong> - {checkpoint.timestamp}<br/>
              X: {checkpoint.x}, Y: {checkpoint.y}, Z: {checkpoint.z}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        marginTop: '15px', 
        fontSize: '11px', 
        color: '#aaaaaa',
        borderTop: '1px solid #555',
        paddingTop: '10px'
      }}>
        <strong>Instructions:</strong><br/>
        1. Drive around the track<br/>
        2. Click "Record Point" at key locations<br/>
        3. Click "Export" to get checkpoint data<br/>
        4. Check console for full JSON output
      </div>
    </div>
  );
};