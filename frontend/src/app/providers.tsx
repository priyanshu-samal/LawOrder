'use client';

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Auth0Provider } from '@auth0/nextjs-auth0';

const theme = extendTheme({
  colors: {
    brand: {
      50: "#f7fafc",
      100: "#edf2f7",
      200: "#e2e8f0",
      300: "#cbd5e0",
      400: "#a0aec0",
      500: "#718096",
      600: "#4a5568",
      700: "#2d3748",
      800: "#1a202c",
      900: "#171923",
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </Auth0Provider>
  );
}
