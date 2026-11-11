import React from 'react';
import ReactDOM from 'react-dom/client';
import './app/styles/index.css'
import AppRouter from './AppRouter'
import {SocketContextProvider} from "./app/context/SocketContext.jsx";
import {AuthProvider} from "./app/context/AuthContext.jsx";
import {SessionProvider} from "./app/context/SessionContext.jsx";
import {SystemsProvider} from "./app/context/SystemsContext.jsx";
import { migrateLegacyStorage } from './app/tools/browserStorageMigration.js';

// Reprise des anciennes clés du navigateur, avant tout affichage (spec_browser_storage.md §5)
migrateLegacyStorage();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <SystemsProvider>
          <AuthProvider>
              <SocketContextProvider>
                  <SessionProvider>
                    <AppRouter />
                  </SessionProvider>
              </SocketContextProvider>
          </AuthProvider>
      </SystemsProvider>
  </React.StrictMode>,
)
