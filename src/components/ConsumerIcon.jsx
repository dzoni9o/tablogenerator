import { consumerIcons } from "../data/consumerIcons";

export function ConsumerIcon({ name }) {
  const icon = consumerIcons.find((item) => item.id === name) ?? consumerIcons[0];

  return (
    <svg className="consumer-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}
