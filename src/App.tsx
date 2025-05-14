import { Toaster } from "react-hot-toast";
import GlobalRouter from "./routes";
import AssetScrubPage from './pages/dashboard/AssetScrubPage';


const App = () => {
  return <div >
    <GlobalRouter/>
    <Toaster/>
    </div>;
};

export default App;
