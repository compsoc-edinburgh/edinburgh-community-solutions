import { Container } from "@vseth/components";
import React from "react";
import LoginOverlay from "../components/login-overlay";
import useTitle from "../hooks/useTitle";

const LoginPage: React.FC<{}> = () => {
  useTitle("Login - VIS Community Solutions");
  return (
    <Container>
      <LoginOverlay />
    </Container>
  );
};
export default LoginPage;
