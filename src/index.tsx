import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import {
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import LoginPage from "./Login";
import Content from "./Content";
import Host from "./host/";
import Play from "./play/";
import { extendTheme, ChakraProvider } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const theme = extendTheme({
  initialColorMode: 'dark',

  useSystemColorMode: false,
  fonts: {
    heading: `'Rubik 80s Fade', cursive`,
    body: `'Rubik', sans-serif`,

  },
  styles: {
    global: (props: any) => ({
      "html, body": {
        background: mode("white", "black")(props),
      },
    }),
  },
  components: {
    Progress: {
      baseStyle: {
        filledTrack: {
          bg: '#fff'
        }
      }
    }
  }
});

const LoginAndRerouteToRoot = () => {
  const navigate = useNavigate();
  const onLogin = () => {
    navigate("/");
  };
  return <LoginPage onLogin={onLogin} />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute outlet={<Content />} />,
  },
  {
    path: "host/:gameId",
    element: <ProtectedRoute outlet={<Host />} />,
  },
  {
    path: "play/:gameId",
    element: <ProtectedRoute outlet={<Play />} />,
  },
  {
    path: "login",
    element: <LoginAndRerouteToRoot />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

// know bug in chakra ui
{localStorage.setItem('chakra-ui-color-mode', 'dark')}

root.render(
  <React.StrictMode>
    <AuthProvider>
      <ChakraProvider theme={theme}>
        <RouterProvider router={router} />
      </ChakraProvider>
    </AuthProvider>
  </React.StrictMode>
);
