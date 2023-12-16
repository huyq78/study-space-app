import logo from './logo.svg';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Space from './components/Space';
import ManageSpace from './components/ManageSpace';
import Timer from './components/Timer';
import Auth from './components/Auth';

function App() {
  const token = window.localStorage.getItem("token")
  return (
    <div>
      <Sidebar/>
      <Header/>
      <Space/>
      {token?<></>: <Auth/>}
      
    </div>
  );
}

export default App;
