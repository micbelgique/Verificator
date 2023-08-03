import "./App.css";
import Header from "./component/Header";
import CheckURL from "./component/CheckURL";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Form from "./component/Form";
// import Footer from "./component/Footer";

function App() {
  return (
    <div className="App">
      <Header />
      <Router>
        <Routes>
        <Route path="/" element={<Form/>} />
          <Route path="/setting" element={<CheckURL />} />
        </Routes>
      </Router>
      {/* <Foote /> */}
    </div>
  );
}

export default App;
