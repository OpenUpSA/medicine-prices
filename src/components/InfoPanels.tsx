import { DISPENSING_FEE_UPDATED, PRICE_PARAMETERS } from "@/lib/pricing";

const rand = (n: number) => `R${n.toFixed(2)}`;

/**
 * Describe one fee band. `prevMax` is the inclusive upper bound of the band
 * below it, so this band starts one cent higher.
 */
function feeRule(
  maxSep: number,
  perc: number,
  flat: number,
  prevMax: number | null
) {
  const pct = Math.round(perc * 100);
  const fee = `the maximum dispensing fee is ${rand(flat)} + ${pct}% of the SEP`;
  if (prevMax === null) {
    return `Where the SEP is ${rand(maxSep)} or less, ${fee}.`;
  }
  if (maxSep === Infinity) {
    return `Where the SEP is ${rand(prevMax + 0.01)} or more, ${fee}.`;
  }
  return `Where the SEP is between ${rand(prevMax + 0.01)} and ${rand(maxSep)}, ${fee}.`;
}

export default function InfoPanels({
  lastUpdated,
}: {
  lastUpdated: string | null;
}) {
  return (
    <aside>
      <section className="info-panel">
        <div className="panel-heading">
          <h3>What is this all about?</h3>
        </div>
        <div className="info-body">
          <p>
            Did you know that medicine prices are regulated in South Africa?
            Using this application you can:
          </p>
          <ul>
            <li>
              Know what to expect to pay when you get a prescription from your
              doctor
            </li>
            <li>
              Find possible generics for a branded medicine. Ask your doctor if
              these medicines are viable alternatives.
            </li>
            <li>Ensure that you are not being overcharged for your medicine.</li>
          </ul>
        </div>
      </section>

      <section className="info-panel">
        <div className="panel-heading">
          <h3>How can you use it?</h3>
        </div>
        <div className="info-body">
          <p>Here are some ideas for how this application can be useful:</p>
          <ul>
            <li>
              When your doctor prescribes a medicine, quickly check on your phone
              for alternatives and ask whether the brand name product can be
              replaced with a generic.
            </li>
            <li>
              If you&apos;re on chronic medication you can periodically check to
              see whether the price of your meds has increased.
            </li>
            <li>
              While waiting in the queue at the pharmacy, you can look up your
              medicine and find out how much it will cost you and what
              alternatives you can ask the pharmacist for.
            </li>
            <li>
              If you look up a particular medicine often, you can bookmark the
              page so that you can quickly refer to it.
            </li>
          </ul>
        </div>
      </section>

      <section className="info-panel">
        <div className="panel-heading">
          <h3>
            What is the{" "}
            <abbr title="Single Exit Price">Single Exit Price</abbr>?
          </h3>
          <span className="last-updated">
            Fees updated {DISPENSING_FEE_UPDATED}
          </span>
        </div>
        <div className="info-body">
          <p>
            The single exit price (SEP) mechanism in South Africa lists the
            maximum price that a medicine can be charged at. Dispensers may
            charge an additional dispensing fee depending on the price of the
            medicine. The Medicines and Related Substances Act allows for the
            following charges (excl VAT):
          </p>
          <ul>
            {PRICE_PARAMETERS.prices.map(([maxSep, perc, flat], i) => (
              <li key={i}>
                {feeRule(
                  maxSep,
                  perc,
                  flat,
                  i === 0 ? null : PRICE_PARAMETERS.prices[i - 1][0]
                )}
              </li>
            ))}
          </ul>
          <p>
            The prices listed in this database represent the maximum price that
            you should be paying for your medicines (incl VAT). Note that these
            prices do not apply to dispensing practitioners who have a separate
            dispensing fee.
          </p>
          <p>
            Please note that allowed dispensing fees may change and this website
            may not be completely up-to-date. The dispensing fees above were
            last updated on {DISPENSING_FEE_UPDATED}.
            {lastUpdated
              ? ` The prices listed above were valid at ${lastUpdated}.`
              : ""}
          </p>
        </div>
      </section>

      <div className="brand-logo">
        <a href="https://www.openup.org.za">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="OpenUp" />
        </a>
      </div>
    </aside>
  );
}
