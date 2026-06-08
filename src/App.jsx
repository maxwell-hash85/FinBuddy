import FinBuddy from "./FinBuddy";
import { ThemeProvider } from "./context/ThemeProvider";
import { ProfileProvider } from "./context/ProfileProvider";
import { TransactionsProvider } from "./context/TransactionsProvider";
import { NotificationsProvider } from "./context/NotificationsProvider";

function App() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <TransactionsProvider>
          <NotificationsProvider>
            <FinBuddy />
          </NotificationsProvider>
        </TransactionsProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default App;
