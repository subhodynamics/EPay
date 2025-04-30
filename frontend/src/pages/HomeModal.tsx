import { useNavigate } from "react-router-dom";
import "../styles/Home.css"; // Import the styles

const HomeModal = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-box">
        <h1 className="home-title">EPay</h1>
        <div className="home-buttons">
          <button
            onClick={() => navigate("/register")}
            className="home-button"
          >
            Register
          </button>
          <button
            onClick={() => navigate("/login")}
            className="home-button"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeModal;