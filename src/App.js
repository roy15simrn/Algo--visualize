import "./App.css";
import PathfindingVisualizer from "./PathfidingVisualizer/PathfindingVisualizer";
import { Navbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import bootstrap from "bootstrap";

function App() {
  return (
    <div className='App'>
      <PathfindingVisualizer></PathfindingVisualizer>
    </div>
  );
}

export default App;
