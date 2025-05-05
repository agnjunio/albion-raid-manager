import { faFlag, faGear, faPeopleGroup, faUsers } from "@fortawesome/free-solid-svg-icons";

export const links = [
  { href: "raids", label: "Raids", icon: faFlag },
  { href: "compositions", label: "Compositions", icon: faPeopleGroup },
  { href: "members", label: "Members", icon: faUsers },
  {
    href: "settings",
    label: "Settings",
    icon: faGear,
    submenu: [
      {
        href: "discord",
        label: "Discord",
      },
      {
        href: "raids",
        label: "Raids",
      },
    ],
  },
];
