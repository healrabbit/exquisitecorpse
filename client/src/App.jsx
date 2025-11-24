import { React, useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Text, Image } from 'react-konva';
import border from './assets/images/exquisiteborder.PNG';
import head from './assets/images/head.png';
import torso from './assets/images/torso.png';
import legs from './assets/images/legs.png';
import './App.css'

const App = () => {
  const ws = useRef(null);
  const [tool, setTool] = useState('pen');
  const [myPart, setMyPart] = useState(null);

  const [headLine, setHeadLine] = useState([]);
  const [torsoLine, setTorsoLine] = useState([]);
  const [legLine, setLegLine] = useState([]);

  const isDrawing = useRef(false);



  // Returns the right line array
  const getCurrentLines = () => {
    if (myPart === "head") return headLine;
    if (myPart === "torso") return torsoLine;
    if (myPart === "legs") return legLine;
    return [];
  };

const setCurrentLines = (newLines) => {
  if (myPart === "head") setHeadLine(newLines);
  if (myPart === "torso") setTorsoLine(newLines);
  if (myPart === "legs") setLegLine(newLines);
};

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:3001");

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onerror = (err) => {
      console.log("WS error", err);
    };

    ws.current.onmessage = (msg) => {
      const data = JSON.parse(msg.data);

      if (data.type === 'part') setMyPart(data.part);
      if (data.type === 'head') setHeadLine(data.images);
      if (data.type === 'torso') setTorsoLine(data.images);
      if (data.type === 'legs') setLegLine(data.images);
    };

    return () => ws.current.close();
  }, []);

  const broadcast = (type, updatedImages) => {
    if (!ws.current || ws.current.readyState !== 1) return;
    ws.current.send(JSON.stringify({ type, images: updatedImages }));
  };

  const handleMouseDown = (e) => {
    if (!myPart) return;

    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();

    const current = getCurrentLines();
    const newLine = { tool, points: [pos.x, pos.y] };

    setCurrentLines([...current, newLine]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const current = getCurrentLines();

    if (current.length === 0) return;

    const newLines = current.map((l) => ({
      ...l,
      points: [...l.points]
    }));

    // Add points immutably
    newLines[newLines.length - 1].points.push(point.x, point.y);
    setCurrentLines(newLines);

    if (myPart === "head") broadcast("head", newLines);
    if (myPart === "torso") broadcast("torso", newLines);
    if (myPart === "legs") broadcast("legs", newLines);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const width = 300;
  const height = 150;

  return (
    <div>
      <h1>You are drawing: {myPart || "waiting..."}</h1>

      <select value={tool} onChange={(e) => setTool(e.target.value)}>
        <option value="pen">Pen</option>
        <option value="eraser">Eraser</option>
      </select>

      {/* HEAD CANVAS */}
      <div
  style={{
      width: "360px",        
         height: "210px",
    position: "relative",     // allow absolute positioning
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }}
>
      <div style={{
    position: "absolute",
    top: "30px",   // was 50px, now raised 10px
    left: "30px",
    width: "300px",
    height: "150px",
    filter: myPart !== 'head' ? 'blur(15px)' : 'none',
  }}>
      <Stage
        width={width}
        height={height}
        onMouseDown={myPart === "head" ? handleMouseDown : null}
        onMouseMove={myPart === "head" ? handleMouseMove : null}
        onMouseUp={myPart === "head" ? handleMouseUp : null}
      >
        <Layer>
          <Text text="Head" x={5} y={5} />
          {headLine.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="black"
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
        </Layer>
     
      </Stage>

  </div>
  <img
      src={border}
      alt="frame"
      style={{
        position: "absolute",
         width: "360px",        
         height: "210px",
        pointerEvents: "none", // allow drawing underneath
      }}
    />
  </div>
      {/* TORSO CANVAS */}
      <div
  style={{
      width: "360px",        
         height: "210px",        
    position: "relative",     
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
        
  }}
>
      <div style={{
    position: "absolute",
    top: "30px",   // was 50px, now raised 10px
    left: "30px",
    width: "300px",
    height: "150px",
    filter: myPart !== 'torso' ? 'blur(15px)' : 'none',
  }}>
      <Stage
        width={width}
        height={height}
        onMouseDown={myPart === "torso" ? handleMouseDown : null}
        onMouseMove={myPart === "torso" ? handleMouseMove : null}
        onMouseUp={myPart === "torso" ? handleMouseUp : null}
      >
        <Layer>
          <Text text="Torso" x={5} y={5} />
          {torsoLine.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="black"
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
        </Layer>
     
      </Stage>
  </div>
  <img
      src={border}
      alt="frame"
      style={{
        position: "absolute",
      width: "360px",        
         height: "210px",
        pointerEvents: "none", // allow drawing underneath
      }}
    />
  </div>
      {/* LEGS CANVAS */}
      <div
  style={{
      width: "360px",        
         height: "210px",
    position: "relative",     // allow absolute positioning
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }}
>
      <div style={{
    position: "absolute",
    top: "30px",   
    left: "30px",
    width: "300px",
    height: "150px",
    filter: myPart !== 'legs' ? 'blur(15px)' : 'none',
  }}>
      <Stage
        width={width}
        height={height}
        onMouseDown={myPart === "legs" ? handleMouseDown : null}
        onMouseMove={myPart === "legs" ? handleMouseMove : null}
        onMouseUp={myPart === "legs" ? handleMouseUp : null}
      >
        <Layer>
          
          <Text text="Legs" x={5} y={5} />
          {legLine.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="black"
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
        </Layer>
      </Stage>
        </div>
  <img
      src={border}
      alt="frame"
      style={{
        position: "absolute",
      width: "360px",        
         height: "210px",
        pointerEvents: "none", // allow drawing underneath
      }}
    />
  </div>
    </div>
  );
};

export default App;
