import React from "react";
import { VSETHNavbar as Navbar, NavbarBrand, ICONS } from "@vseth/components";
import { useLocation } from "react-router-dom";
import { useUser } from "../auth";
import { Item } from "@vseth/components/dist/components/VSETHNav/VSETHNavbar";

const ExamsNavbar: React.FC<{}> = () => {
  const location = useLocation();
  const user = useUser();
  const adminItems: Item[] = [
    {
      title: "Upload Exam",
    },
    {
      title: "Mod Queue",
    },
  ];
  return (
    <Navbar
      lang={"en"}
      secondaryLogo={<NavbarBrand href="/">Community Solutions</NavbarBrand>}
      primaryActionItems={[]}
      secondaryNavItems={[
        {
          title: "Home",
          icon: ICONS.HOME,
          active: location.pathname === "/",
          linkProps: {
            to: "/",
          },
        },
        {
          title: "Feedback",
          icon: ICONS.MESSAGE,
          active: location.pathname === "/feedback",
          linkProps: {
            to: "/feedback",
          },
        },
        {
          title: "Scoreboard",
          icon: ICONS.LIST,
          active: location.pathname === "/scoreboard",
          linkProps: {
            to: "/scoreboard",
          },
        },
        {
          title: "More",
          icon: ICONS.DOTS_H,
          active: false,
          childItems: [
            {
              title: "Submit Transcript",
            },
            ...(typeof user === "object" && user.isAdmin ? adminItems : []),
          ],
        },
        {
          title: "Account",
          icon: ICONS.USER,
          active: location.pathname === "/me",
          linkProps: {
            to: "/me",
          },
        },
      ]}
    />
  );
};
export default ExamsNavbar;
