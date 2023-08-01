import micLogo from "/MIC.svg";

function Header() {
  return (
    <header>
      <a href="https://www.mic-belgique.be/" target="_blank">
        <img src={micLogo} className="logo" alt="Vite logo" />
      </a>
    </header>
  );
}

export default Header;
