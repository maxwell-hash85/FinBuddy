import FinBuddy from "./FinBuddy";
import { ThemeProvider } from "./context/ThemeProvider";
import { TransactionsProvider } from "./context/TransactionsProvider";

function App() {
  return (
    <ThemeProvider>
      <TransactionsProvider>
        <FinBuddy />
      </TransactionsProvider>
    </ThemeProvider>
  );
}

export default App;