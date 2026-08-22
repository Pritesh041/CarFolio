import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { AddCarProvider } from "./lib/addCarStore";
import { ThemeProvider } from "./lib/theme";
import { ConfirmProvider } from "./lib/confirm";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import { PublicLayout } from "./components/layout/PublicLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CollectionPage } from "./pages/CollectionPage";
import { CarDetailPage } from "./pages/CarDetailPage";
import { WishlistPage } from "./pages/WishlistPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { ShowcasePage } from "./pages/ShowcasePage";
import { ShowcaseBuilderPage } from "./pages/ShowcaseBuilderPage";
import { PublicShowcasePage } from "./pages/PublicShowcasePage";
import { PublicProfilePage } from "./pages/PublicProfilePage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { MarketplaceListingPage } from "./pages/MarketplaceListingPage";
import { MarketplaceSellPage } from "./pages/MarketplaceSellPage";
import { ChatPage } from "./pages/ChatPage";
import { HistoryPage } from "./pages/HistoryPage";
import { TradesPage } from "./pages/TradesPage";
import { CommunityPage } from "./pages/CommunityPage";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ConfirmProvider>
          <AuthProvider>
            <AddCarProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                <Route element={<PublicLayout />}>
                  <Route path="/discover" element={<DiscoverPage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/marketplace/:id" element={<MarketplaceListingPage />} />
                  <Route path="/showcase/:username/:slug" element={<PublicShowcasePage />} />
                  <Route path="/u/:username" element={<PublicProfilePage />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                  <Route element={<AppShell />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/collection" element={<CollectionPage />} />
                    <Route path="/collection/:id" element={<CarDetailPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/showcase" element={<ShowcasePage />} />
                    <Route path="/showcase/new" element={<ShowcaseBuilderPage />} />
                    <Route path="/showcase/:id/edit" element={<ShowcaseBuilderPage />} />
                    <Route path="/marketplace/sell" element={<MarketplaceSellPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/chat/:conversationId" element={<ChatPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/trades" element={<TradesPage />} />
                    <Route path="/community" element={<CommunityPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AddCarProvider>
          </AuthProvider>
        </ConfirmProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
