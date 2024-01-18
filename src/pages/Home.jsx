import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Space from "../components/space/Space";
import Auth from "../components/Auth";

function Home() {
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

export default Home;
