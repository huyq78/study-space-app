import logo from './logo.svg';
import './App.css';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Space from './components/Space';
import ManageSpace from './components/ManageSpace';
import Timer from './components/Timer';

function App() {
  return (
    <div>
      <Sidebar/>
      <Navbar/>
      <Space/>
      {/* <ManageSpace/>
      <Timer/> */}
    </div>
  );
}

export default App;
