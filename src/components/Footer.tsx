import { faDiscord, faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Footer() {
  return (
    <footer className="flex gap-6 flex-wrap items-center justify-center py-2">
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://discord.gg/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon icon={faDiscord} width={16} height={16} />
        Discord
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://github.com/agnjunio/albion-raid-manager"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon icon={faGithub} width={16} height={16} />
        GitHub
      </a>
    </footer>
  );
}
