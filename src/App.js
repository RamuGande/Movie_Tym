import "./App.css";

import {
  BrowserRouter ,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./components/Home/Home";
<<<<<<< HEAD
=======
import Preview from "./components/Preview/Preview";
>>>>>>> Abdul
import LoginSignup from "./components/LoginSignUp/LoginSignup"
import Admin from './components/Admin/Admin'
import ThreaterOwner from "./components/Vender/Vender"
import PrivateBooking from "./components/private_booking/PrivateBooking";
import Contact from './components/Contact/Contact'
import MovieDetails from "./components/Booking/Moviedetails";
import AdminHome from "./components/AdminHome/AdminHome";
import VenderHome from "./components/VenderHome/MovieForm";
import UserProfile from "./components/MyBooking/UserProfile";
import SeatSelection from "./components/Booking/SeatSelection";
<<<<<<< HEAD
import ForgotPassword from "./components/Forgotpassword/Forgotpassword";
=======
>>>>>>> Abdul
function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        <Route index path="/" element={<Home />} />
=======
        <Route index path="/" element={<Preview />} />
        <Route index path="/home" element={<Home />} />
>>>>>>> Abdul
        <Route path="/log" element={<LoginSignup />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/vendor" element={<ThreaterOwner />} />
        <Route path="/private-booking" element={<PrivateBooking />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/adminhome" element={<AdminHome />} />
        <Route path="/vendorhome" element={<VenderHome />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/seats/:showId" element={<SeatSelection />} />
<<<<<<< HEAD
        <Route path="/forgotpassword" element ={<ForgotPassword/>}/>
=======
>>>>>>> Abdul
        </Routes>
    </BrowserRouter>
     
    
  );
}

export default App;
