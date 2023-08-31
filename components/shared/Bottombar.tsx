import NavOptions from "./NavOptions";

export default async function Bottombar(props: { pots: Pot[] }) {
  return (
    <section className="bottombar">
      <div className="bottombar_container">
				<NavOptions position="bottombar" pots={props.pots} />
      </div>
    </section>
  );
}