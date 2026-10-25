import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { listenForInstall } from "@/lib/install"
import { PrefsProvider } from "@/lib/prefs.tsx"
import { VaultProvider } from "@/lib/vault/vault"

listenForInstall()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider storageKey="sayang:theme">
      <PrefsProvider>
        <VaultProvider>
          <App />
        </VaultProvider>
      </PrefsProvider>
    </ThemeProvider>
  </StrictMode>
)
