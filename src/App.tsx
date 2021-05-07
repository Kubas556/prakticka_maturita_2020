import React, { useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

const commands = {
  "nahoru":"north",
  "dolu":"south",
  "doprava":"east",
  "doleva":"west",
  "reset":"reset",
  "grab":"grab",
  "exit":"exit"
};
function App() {

  let [fetching, setFetching] = useState<boolean>(false);
  let [responses, setResponses] = useState([]);
  let [haveKey, setHaveKey] = useState<boolean>(false);
  let [currentColor, setCurrentColor] = useState();
  let [currentCoordinates, setCurrentCoordinates] = useState({x:0,y:0});
  let [visitedTiles, setVisitedTiles] = useState([]);
  let [Xcorrection, setXcorrection] = useState(0);
  let [Ycorrection, setYcorrection] = useState(0);
  let [nowSee, setNowSee] = useState();

  let [mazeTiles, setMazeTiles] = useState(<div></div>);

  let table = useRef<HTMLDivElement>();
  useEffect(()=>{
    sendCommand("reset");
  },[]);

  useEffect(() => {
    let correctedTiles = [];
    visitedTiles.forEach(tile => {
      correctedTiles.push({coords:{x: tile.coords.x + Math.abs(Xcorrection), y: tile.coords.y + Math.abs(Ycorrection)},success: tile.success, color: tile.color, desc: tile.desc});
    });

    setMazeTiles(<>{
      correctedTiles.map(tile => {
        return <div style={{
          backgroundColor:tile.success ? tile.color : "black",
          gridColumn: tile.coords.x+1,
          gridRow: tile.coords.y+1,
          width: "5rem",
          height: "5rem",
          transform:"rotateX(-180deg)",
          fontSize:"1rem",
          color:"black"
        }}>{tile.desc}</div>
      })
    }</>);
  },[visitedTiles]);

  function discoverArea(coords,success,color,desc) {
    setNowSee(desc);
    if(visitedTiles.filter(tile => (tile.coords.x === coords.x) && (tile.coords.y === coords.y)).length > 0) {
      return;
    } else {
      setVisitedTiles(table => [...table, {coords, success, color, desc}]);

      if(coords.x < Xcorrection)
        setXcorrection(coords.x);

      if(coords.y < Ycorrection)
        setYcorrection(coords.y);
    }
  }

  function sendCommand(command:"dolu"|"nahoru"|"doprava"|"doleva"|"reset"|"grab"|"exit") {
    let formData = new FormData();
    formData.append("command",commands[command]);
    formData.append("token","5ba2bf8a");
    setFetching(true);
    axios.post("https://maturita.delta-www.cz/prakticka/2020-maze/maze-api",formData).then((data:any) => {
      console.log(data);
        switch (command) {
          case "doleva":
            if(data.data.success) {
              setCurrentCoordinates((coords: any) => {
                let newCoords = {x: coords.x - 1, y: coords.y};
                return newCoords
              });
            }

            discoverArea({x: currentCoordinates.x - 1, y: currentCoordinates.y},data.data.success,data.data.lightColor, data.data.youSee);

            break;
          case "doprava":
            if(data.data.success) {
              setCurrentCoordinates((coords: any) => {
                let newCoords = {x: coords.x + 1, y: coords.y};
                return newCoords;
              });
            }

            discoverArea({x: currentCoordinates.x + 1, y: currentCoordinates.y},data.data.success,data.data.lightColor, data.data.youSee);

            break;
          case "nahoru":
            if(data.data.success) {
              setCurrentCoordinates((coords: any) => {
                let newCoords = {x: coords.x, y: coords.y + 1};
                return newCoords;
              });
            }

            discoverArea({x: currentCoordinates.x, y: currentCoordinates.y + 1},data.data.success,data.data.lightColor, data.data.youSee);

            break;
          case "dolu":
            if(data.data.success) {
              setCurrentCoordinates((coords: any) => {
                let newCoords = {x: coords.x, y: coords.y - 1};
                return newCoords;
              });
            }

            discoverArea({x: currentCoordinates.x, y: currentCoordinates.y - 1},data.data.success,data.data.lightColor, data.data.youSee);

            break;
          case "reset":
            setVisitedTiles([]);
            setHaveKey(false);
            setNowSee(undefined);
            if(data.data.success) {
              setCurrentCoordinates((coords: any) => {
                let newCoords = {x: 0, y: 0};
                return newCoords;
              });
              discoverArea({x: 0, y:0},data.data.success,data.data.lightColor, data.data.youSee);
            } else {

            }
            break;
          case "grab":
            if(data.data.success) {
              if(data.data.haveKey)
                setHaveKey(true);
            } else {
                setHaveKey(false);
            }
            break;
          case "exit":
            if(data.data.success) {
              if(data.data.youSee === "countryside")
                window.alert("you finished the maze!");
            } else {

            }
            break;
        }

      // @ts-ignore
      setResponses(resp => [...resp,{
        youSee:data.data?.youSee,
        command:command,
        success:data.data.success
      }]);
      setCurrentColor(data.data.lightColor);
      setFetching(false);
    }).catch(e => {
      setFetching(false);
      console.log(e);
    });
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <p>x: {currentCoordinates.x} | y: {currentCoordinates.y}</p>
        <div ref={table} style={{
          display:"grid",
          gridRow: "auto",
          gridColumn: "auto",
          transform: "rotateX(180deg)"
        }}>
          {mazeTiles}
          <div style={{
            position:"absolute",
            width:"5rem",
            height:"5rem",
            background:"red",
            borderRadius:"100%",
            gridColumn: currentCoordinates.x + Math.abs(Xcorrection) + 1,
            gridRow: currentCoordinates.y + Math.abs(Ycorrection) + 1
          }}></div>
        </div>
        <div style={{
          display:"grid",
          gridTemplateRows: "100px 100px 100px",
          gridTemplateColumns: "100px 100px 100px"
        }}>
          <button disabled={fetching} style={{
            gridRow: 1,
            gridColumn: 2
          }} onClick={()=>sendCommand("nahoru")}>Nahoru</button>
          <button disabled={fetching} style={{
            gridRow: 3,
            gridColumn: 2
          }} onClick={()=>sendCommand("dolu")}>Dolu</button>
          <button disabled={fetching} style={{
            gridColumn: 3,
            gridRow: 2
          }} onClick={()=>sendCommand("doprava")}>Doprava</button>
          <button disabled={fetching} style={{
            gridColumn: 1,
            gridRow: 2
          }} onClick={()=>sendCommand("doleva")}>Doleva</button>
          <div style={{
            gridColumn: 2,
            gridRow: 2,
            backgroundColor: currentColor
          }}/>
          <button disabled={fetching} onClick={()=>sendCommand("reset")}>Reset</button>
          <button disabled={fetching||nowSee !== "key"} onClick={()=>sendCommand("grab")}>Grab</button>
          <button disabled={fetching||nowSee !== "exit"||!haveKey} onClick={()=>sendCommand("exit")}>Exit</button>
        </div>
        <div style={{
          overflowY:"scroll",
          height:"10rem"
        }}>
          {
            responses && responses.map((resp:any, index) => (
                <div key={index} style={{fontSize:"1rem"}}>
                  <p style={{color:resp.success?"green":"red"}}>command: {resp.command}</p>
                  <p>youSee: {resp.youSee}</p>
                </div>
            ))
          }
        </div>
      </header>
    </div>
  );
}

export default App;
