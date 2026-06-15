import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./context/useTheme";
import { Home, MessageCircle, List, User } from "lucide-react";

import HomeScreen from "./components/screens/HomeScreen";
import BuddyScreen from "./components/screens/BuddyScreen";
import TransactionsScreen from "./components/screens/TransactionsScreen";
import ProfileScreen from "./components/screens/ProfileScreen";

import { FONT } from "./styles/colors";

const NAV_HEIGHT = 72;

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "buddy", label: "Buddy", icon: MessageCircle },
  { id: "transactions", label: "Transactions", icon: List },
  { id: "profile", label: "Profile", icon: User },
];

export default function FinBuddy() {
  const { colors: COLORS } = useTheme();
  const [activeTab, setActiveTab] = useState("home");

  const navActive = COLORS.navActive ?? COLORS.green;

  function renderScreen() {
    switch (activeTab) {
      case "home":
        return <HomeScreen onNavigate={setActiveTab} />;
      case "buddy":
        return <BuddyScreen />;
      case "transactions":
        return <TransactionsScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return null;
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.textPrimary,
        fontFamily: FONT,
        margin: 0,
        padding: 0,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background: ${COLORS.bg};
        }

        input::placeholder {
          color: ${COLORS.textMuted};
        }

        select option {
          background: ${COLORS.surface};
          color: ${COLORS.textPrimary};
        }

        input[type=number]::-webkit-inner-spin-button {
          -webkit-appearance: none;
        }
      `}</style>

      <main
        style={{
          maxWidth: activeTab === "buddy" ? "100%" : "720px",
          margin: "0 auto",
          padding:
            activeTab === "buddy"
              ? "0"
              : `clamp(1.25rem, 4vw, 2rem) clamp(1rem, 4vw, 1.5rem) calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px) + 1.5rem)`,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav
        aria-label="Main navigation"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: NAV_HEIGHT,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          background: "#0d0d0d",
          borderTop: "1px solid #161616",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-around",
          zIndex: 100,
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const color = isActive ? navActive : COLORS.textMuted;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? "page" : undefined}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px 4px",
                fontFamily: "inherit",
                color,
                transition: "color 0.15s ease",
              }}
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                initial={isActive ? { scale: 0.7, opacity: 0 } : false}
                animate={isActive ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
                transition={
                  isActive ? { type: "spring", stiffness: 400, damping: 20 } : undefined
                }
              >
                <Icon size={22} strokeWidth={2} color={color} />
              </motion.div>
              {isActive ? (
                <motion.span
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  style={{ fontSize: "10px", fontWeight: 600 }}
                >
                  {tab.label}
                </motion.span>
              ) : (
                <span style={{ fontSize: "10px", fontWeight: 500 }}>{tab.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}