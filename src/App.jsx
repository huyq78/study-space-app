import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import Home from './pages/Home';
import Block from './pages/Block';


function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home/>}></Route>
        <Route exact path="/block" element={<Block/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
