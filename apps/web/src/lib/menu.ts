import { faFlag, faGear, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";

export const links = [
  { href: "raids", label: "Raids", icon: faFlag },
  { href: "compositions", label: "Compositions", icon: faPeopleGroup },
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
