// LayoutWithHeader.jsx
import { Outlet } from "react-router";
import Header from "../components/Header";

export default function LayoutWithHeader() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}