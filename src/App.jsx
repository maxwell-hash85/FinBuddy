import FinBuddy from "./FinBuddy";
import { ThemeProvider } from "./context/ThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <FinBuddy />
    </ThemeProvider>
  );
}

export default App;