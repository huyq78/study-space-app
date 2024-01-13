import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Space from './components/space/Space';
import ManageSpace from './components/space/ManageSpace';
import Timer from './components/timer/Timer';
import Auth from './components/Auth';
import { useSelector } from "react-redux";

function App() {
  const user = useSelector((state) => state.user.currentUser);
  return (
    <div>
      <Sidebar/>
      <Header/>
      <Space/>
      {user && localStorage.getItem('access_token')?<></>: <Auth/>} 
    </div>
  );
}

export default App;
