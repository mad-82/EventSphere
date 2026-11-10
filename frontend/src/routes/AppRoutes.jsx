import { Routes, Route } from "react-router-dom";
import Home from "../pages/public/Home";
import About from "../pages/About";

/* Auth Pages */
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ExhibitorVerification from "../pages/auth/ExhibitorVerification";

/* Auth Route Guards */
import PublicOnlyRoute from "../components/auth/PublicOnlyRoute";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import RoleBasedRoute from "../components/auth/RoleBasedRoute";

/* Organizer / Admin panel */
import OrganizerLayout from "../layouts/OrganizerLayout";
import OrganizerDashboard from "../pages/organizer/OrganizerDashboard";
import ExpoManagement from "../pages/organizer/ExpoManagement";
import ExhibitorManagement from "../pages/organizer/ExhibitorManagement";
import ExhibitorApplications from "../pages/organizer/ExhibitorApplications";
import BoothManagement from "../pages/organizer/BoothManagement";
import FloorPlanManagement from "../pages/organizer/FloorPlanManagement";
import ScheduleManagement from "../pages/organizer/ScheduleManagement";
import AttendeeManagement from "../pages/organizer/AttendeeManagement";
import AnalyticsReports from "../pages/organizer/AnalyticsReports";
import Communication from "../pages/organizer/Communication";
import ProfileSettings from "../pages/organizer/ProfileSettings";
import Notifications from "../pages/shared/Notifications";
import FeedbackSupport from "../pages/shared/FeedbackSupport";

// 🔥 1. NAYA IMPORT ADD KIYA HAI
import BoothRequests from "../pages/organizer/BoothRequests"; 

/* Exhibitor Panel */
import ExhibitorLayout from "../layouts/ExhibitorLayout";
import { ExhibitorDataProvider } from "../context/ExhibitorDataContext";
import ExhibitorDashboard from "../pages/exhibitor/ExhibitorDashboard";
import ExhibitorProfile from "../pages/exhibitor/ExhibitorProfile";
import BrowseExpos from "../pages/exhibitor/BrowseExpos";
import ExpoApplication from "../pages/exhibitor/ExpoApplication";
import MyApplications from "../pages/exhibitor/MyApplications";
import BoothSelectionExhibitor from "../pages/exhibitor/BoothSelection";
import MyBooth from "../pages/exhibitor/MyBooth";
import ProductsServices from "../pages/exhibitor/ProductsServices";
import StaffManagement from "../pages/exhibitor/StaffManagement";
import ExhibitorCommunication from "../pages/exhibitor/ExhibitorCommunication";
import ExhibitorDirectory from "../pages/exhibitor/ExhibitorDirectory";
import ExhibitorNotifications from "../pages/exhibitor/ExhibitorNotifications";
import ExhibitorSettings from "../pages/exhibitor/ExhibitorSettings";

/* Attendee Panel */
import AttendeeLayout from "../layouts/AttendeeLayout";
import AttendeeDashboard from "../pages/attendee/AttendeeDashboard";
import AttendeeSchedule from "../pages/attendee/AttendeeSchedule";
import BookmarkedSessions from "../pages/attendee/BookmarkedSessions";
import ExhibitorSearch from "../pages/attendee/ExhibitorSearch";
import ExhibitorDetails from "../pages/attendee/ExhibitorDetails";
import MyRegistrations from "../pages/attendee/MyRegistrations";
import AttendeeCommunication from "../pages/attendee/AttendeeCommunication";

/* Public Pages */
import Events from "../pages/public/Events";
import EventDetailsPage from "../pages/public/EventDetails";
import TicketBooking from "../pages/public/TicketBooking";
import BoothSelection from "../pages/public/BoothSelection";
import Contact from "../pages/Contact";
import Feedback from "../pages/Feedback";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact-us" element={<Contact />} />
      <Route path="/our-clients" element={<Feedback />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />
      <Route path="/ticket/:id" element={<TicketBooking />} />
      <Route path="/booths" element={<BoothSelection />} />

      {/* ================= AUTH ================= */}
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
      <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

      {/* ✅ Verification Route */}
      <Route
        path="/verify-exhibitor"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["exhibitor"]}>
              <ExhibitorVerification />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* ================= ORGANIZER / ADMIN ================= */}
      <Route
        path="/organizer"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin", "organizer"]}>
              <OrganizerLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<OrganizerDashboard />} />
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="expos" element={<ExpoManagement />} />
        <Route path="exhibitors" element={<ExhibitorManagement />} />
        <Route path="applications" element={<ExhibitorApplications />} />
        <Route path="booths" element={<BoothManagement />} />
        
        {/* 🔥 2. NAYA ROUTE ADD KIYA HAI */}
        <Route path="booth-requests" element={<BoothRequests />} />

        <Route path="floor-plan" element={<FloorPlanManagement />} />
        <Route path="schedule" element={<ScheduleManagement />} />
        <Route path="attendees" element={<AttendeeManagement />} />
        <Route path="analytics" element={<AnalyticsReports />} />
        <Route path="communication" element={<Communication />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="feedback" element={<FeedbackSupport />} />
        <Route path="profile" element={<ProfileSettings />} />
      </Route>

      {/* ================= EXHIBITOR PANEL ================= */}
      <Route
        path="/exhibitor"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["exhibitor"]}>
              <ExhibitorDataProvider>
                <ExhibitorLayout />
              </ExhibitorDataProvider>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<ExhibitorDashboard />} />
        <Route path="dashboard" element={<ExhibitorDashboard />} />
        <Route path="profile" element={<ExhibitorProfile />} />
        <Route path="browse-expos" element={<BrowseExpos />} />
        <Route path="browse-expos/:expoId/apply" element={<ExpoApplication />} />
        <Route path="my-applications" element={<MyApplications />} />
        <Route path="booth-selection" element={<BoothSelectionExhibitor />} />
        <Route path="my-booth" element={<MyBooth />} />
        <Route path="products-services" element={<ProductsServices />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="communication" element={<ExhibitorCommunication />} />
        <Route path="directory" element={<ExhibitorDirectory />} />
        <Route path="notifications" element={<ExhibitorNotifications />} />
        <Route path="settings" element={<ExhibitorSettings />} />
      </Route>

      {/* ================= ATTENDEE PANEL ================= */}
      <Route
        path="/attendee"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["attendee"]}>
              <AttendeeLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AttendeeDashboard />} />
        <Route path="dashboard" element={<AttendeeDashboard />} />
        <Route path="registrations" element={<MyRegistrations />} />
        <Route path="exhibitors" element={<ExhibitorSearch />} />
        <Route path="exhibitors/:id" element={<ExhibitorDetails />} />
        <Route path="schedule" element={<AttendeeSchedule />} />
        <Route path="bookmarks" element={<BookmarkedSessions />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="communication" element={<AttendeeCommunication />} />
        <Route path="feedback" element={<FeedbackSupport />} />
      </Route>

      {/* ================= 404 ================= */}
      <Route
        path="*"
        element={
          <section style={{ padding: "160px 24px", textAlign: "center" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem" }}>
              Page not found
            </h1>
            <p style={{ marginTop: 16, color: "var(--color-ink-mute)" }}>
              The page you're looking for doesn't exist (yet).
            </p>
          </section>
        }
      />
    </Routes>
  );
}