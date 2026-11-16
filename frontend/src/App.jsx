import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import BookingForm from "./pages/BookingForm";
import MyBookings from "./pages/MyBookings";
import ProviderBookings from "./pages/ProviderBookings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/book-service" />} />

        <Route path="/book-service" element={<BookingForm />} />

        <Route path="/my-bookings" element={<MyBookings />} />

        <Route
          path="/provider-bookings"
          element={<ProviderBookings />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;