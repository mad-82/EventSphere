import { useLocation } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const location = useLocation();

  // ✅ Attendee route bhi add karo taake public navbar/footer na aaye
  const isPanelRoute =
    location.pathname.startsWith("/organizer") ||
    location.pathname.startsWith("/exhibitor") ||
    location.pathname.startsWith("/attendee"); 

  return (
    <>
      {!isPanelRoute && <Navbar />}

      <main>
        <AppRoutes />
      </main>

      {!isPanelRoute && <Footer />}
    </>
  );
}