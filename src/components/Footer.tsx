export default function Footer({ lastUpdated }: { lastUpdated: string | null }) {
  return (
    <footer>
      <ul>
        {lastUpdated && <li>These prices were collected on {lastUpdated}.</li>}
        <li>Contact michael@openup.org.za for more details</li>
      </ul>
      <ul>
        <li>
          <a href="/">MPR</a> is powered by{" "}
          <a href="https://www.openup.org.za/">OpenUp</a>.
        </li>
        <li>
          <a href="https://github.com/Code4SA/medicine-price-registry">
            Pull requests are welcome
          </a>
        </li>
      </ul>
    </footer>
  );
}
